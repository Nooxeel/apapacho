/**
 * Tests de regresión: uploadFile (src/lib/api/client.ts)
 * Verifica: credentials:'include', X-Requested-With, reintento en 401, Bearer token.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ─── Mock de authStore para evitar que la hidratación de Zustand  ─────────────
// dispare rehydrateFromCookie() al importar el módulo dinámicamente
// (lo que consumiría llamadas fetch del mock de forma inesperada).
vi.mock('@/stores/authStore', () => {
  const mockLogin = vi.fn()
  const mockGetState = () => ({
    user: { id: '1', username: 'test' },
    login: mockLogin,
  })
  return {
    useAuthStore: Object.assign(mockGetState, { getState: mockGetState }),
  }
})

// ─── Fábricas de respuestas fetch ─────────────────────────────────────────────

function makeOkResponse(body: object = { url: '/uploads/file.jpg' }): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

function make401Response(): Response {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  })
}

function makeErrorResponse(status: number, body: object = { error: 'Upload failed' }): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function makeFakeFile(name = 'foto.jpg', type = 'image/jpeg'): File {
  return new File(['contenido-fake'], name, { type })
}

function makeRefreshOkResponse(token = 'refreshed-token-xyz'): Response {
  return new Response(JSON.stringify({ token }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

// ─── Helpers de inspección de la llamada fetch ────────────────────────────────

function getCapturedInit(fetchMock: ReturnType<typeof vi.fn>, callIndex = 0): RequestInit {
  return fetchMock.mock.calls[callIndex][1] as RequestInit
}

function getCapturedHeaders(fetchMock: ReturnType<typeof vi.fn>, callIndex = 0): Record<string, string> {
  const init = getCapturedInit(fetchMock, callIndex)
  return init.headers as Record<string, string>
}

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('uploadFile', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  // Importamos el módulo una sola vez; el mock de authStore ya está en su lugar.
  let uploadFile: typeof import('../client').uploadFile

  beforeEach(async () => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const mod = await import('../client')
    uploadFile = mod.uploadFile
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // ── Caso 1: envía credentials:'include' ───────────────────────────────────

  it('envía credentials: include en la petición de subida', async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse())

    await uploadFile('/upload/avatar', makeFakeFile(), 'file', 'test-bearer-token')

    const init = getCapturedInit(fetchMock)
    expect(init.credentials).toBe('include')
  })

  // ── Caso 2: envía X-Requested-With ───────────────────────────────────────

  it('envía el header X-Requested-With: XMLHttpRequest', async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse())

    await uploadFile('/upload/avatar', makeFakeFile(), 'file', 'test-bearer-token')

    const headers = getCapturedHeaders(fetchMock)
    expect(headers['X-Requested-With']).toBe('XMLHttpRequest')
  })

  // ── Caso 3: envía Authorization Bearer cuando hay token ──────────────────

  it('envía el header Authorization: Bearer cuando se proporciona un token', async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse())

    await uploadFile('/upload/avatar', makeFakeFile(), 'file', 'fake-token-12345')

    const headers = getCapturedHeaders(fetchMock)
    expect(headers['Authorization']).toBe('Bearer fake-token-12345')
  })

  // ── Caso 4: NO envía Authorization cuando el token es vacío ──────────────

  it('NO incluye el header Authorization cuando el token está vacío', async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse())

    await uploadFile('/upload/avatar', makeFakeFile(), 'file', '')

    const headers = getCapturedHeaders(fetchMock)
    expect(headers['Authorization']).toBeUndefined()
  })

  // ── Caso 5: en 401 llama tryRefreshToken y reintenta UNA vez ─────────────
  //
  // Secuencia de fetch:
  //   1. doFetch(token)           → 401
  //   2. fetch('/auth/refresh')   → 200 {token: 'refreshed-token-xyz'}
  //   3. doFetch('refreshed…')    → 200 {url: '/uploads/retry.jpg'}

  it('en 401 llama al endpoint de refresh y reintenta la subida una sola vez con el nuevo token', async () => {
    fetchMock
      .mockResolvedValueOnce(make401Response())
      .mockResolvedValueOnce(makeRefreshOkResponse('refreshed-token-xyz'))
      .mockResolvedValueOnce(makeOkResponse({ url: '/uploads/retry.jpg' }))

    const result = await uploadFile('/upload/avatar', makeFakeFile(), 'file', 'expired-token')

    // fetch fue llamado exactamente 3 veces
    expect(fetchMock).toHaveBeenCalledTimes(3)

    // El reintento usa el nuevo token
    const retryHeaders = getCapturedHeaders(fetchMock, 2)
    expect(retryHeaders['Authorization']).toBe('Bearer refreshed-token-xyz')

    // Devuelve el resultado del reintento exitoso
    expect(result).toEqual({ url: '/uploads/retry.jpg' })
  })

  // ── Caso 6: si refresh falla, no hay segundo reintento de upload ─────────

  it('si el refresh falla (no hay nuevo token), NO reintenta el upload', async () => {
    fetchMock
      .mockResolvedValueOnce(make401Response())
      .mockResolvedValueOnce(
        new Response('{}', { status: 401, headers: { 'Content-Type': 'application/json' } }),
      )

    // Debería lanzar porque response.ok es false (401) y no se pudo reintentar
    await expect(
      uploadFile('/upload/avatar', makeFakeFile(), 'file', 'bad-token'),
    ).rejects.toThrow()

    // Sólo 2 llamadas: upload original + intento de refresh; sin tercer upload
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  // ── Caso 7: el retry mantiene credentials:include y X-Requested-With ─────

  it('el retry en 401 reutiliza credentials:include y X-Requested-With', async () => {
    fetchMock
      .mockResolvedValueOnce(make401Response())
      .mockResolvedValueOnce(makeRefreshOkResponse('new-tok'))
      .mockResolvedValueOnce(makeOkResponse())

    await uploadFile('/upload/avatar', makeFakeFile(), 'file', 'old-token')

    const retryInit = getCapturedInit(fetchMock, 2)
    expect(retryInit.credentials).toBe('include')

    const retryHeaders = getCapturedHeaders(fetchMock, 2)
    expect(retryHeaders['X-Requested-With']).toBe('XMLHttpRequest')
  })

  // ── Caso 8: respuesta no-OK distinta a 401 lanza ApiError ────────────────

  it('lanza ApiError cuando el servidor devuelve un error que no es 401', async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(500, { error: 'Internal Server Error' }))

    await expect(
      uploadFile('/upload/avatar', makeFakeFile(), 'file', 'test-token'),
    ).rejects.toThrow('Internal Server Error')
  })
})
