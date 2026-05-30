/**
 * Tests: useFlow hook
 *
 * Smoke tests para el hook de pago Flow.
 * Verifica que payForSubscription llama POST /payments/flow/create
 * con credentials:'include' y resuelve con redirectUrl.
 * Sin red real — fetch está completamente mockeado.
 *
 * AC-2 (Task 7): Given useFlow.payForSubscription con fetch mockeado,
 *   When se invoca, Then llama el endpoint correcto y resuelve con redirectUrl.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createAuthStoreMock } from '@/test/mocks';

// --- Mock factories -----------------------------------------------------------

/**
 * Factory: respuesta exitosa de /payments/flow/create
 */
function createFlowCreateSuccessResponse(overrides: Partial<{
  success: boolean;
  redirectUrl: string;
  commerceOrder: string;
  transactionId: string;
  gateway: string;
}> = {}) {
  return {
    success: true,
    redirectUrl: 'https://sandbox.flow.cl/app/web/pay.php?token=fake-flow-token-abc123',
    commerceOrder: 'FLW-test-order-001',
    transactionId: 'txn-test-001',
    gateway: 'flow',
    ...overrides,
  };
}

/**
 * Factory: fetch mock que responde exitosamente a /payments/flow/create
 */
function createFetchMock(responseData: object, options: { ok?: boolean; status?: number } = {}) {
  const { ok = true, status = 200 } = options;
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: vi.fn().mockResolvedValue(responseData),
  });
}

// --- Auth store mock ----------------------------------------------------------
// El mock se declara con isAuthenticated:true por defecto.
// Los tests que necesitan el estado no-autenticado modifican el retorno
// de useAuthStore directamente (vi.mocked).

import { useAuthStore } from '@/stores/authStore';

vi.mock('@/stores/authStore', () => createAuthStoreMock({ isAuthenticated: true }));

// --- window.location mock (redireccion Flow) ----------------------------------
// Flow redirige con window.location.href; jsdom no lo ejecuta pero puede lanzar
// si no está definido. Lo mockeamos para verificarlo opcionalmente.
const originalLocation = globalThis.location;

// --- Tests -------------------------------------------------------------------

describe('useFlow', () => {
  let mockFetch: ReturnType<typeof createFetchMock>;

  beforeEach(() => {
    mockFetch = createFetchMock(createFlowCreateSuccessResponse());
    globalThis.fetch = mockFetch;

    // jsdom no permite reasignar window.location directamente; lo reemplazamos
    // con un objeto simple para poder verificar la redirección.
    Object.defineProperty(globalThis, 'location', {
      value: { href: '' },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(globalThis, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  it('payForSubscription llama POST /payments/flow/create con credentials include', async () => {
    const { useFlow } = await import('../useFlow');
    const { result } = renderHook(() => useFlow());

    await act(async () => {
      await result.current.payForSubscription('tier-abc', 'creator-xyz', 5000);
    });

    expect(mockFetch).toHaveBeenCalledOnce();

    const [calledUrl, calledOptions] = mockFetch.mock.calls[0];

    // Verifica el endpoint correcto
    expect(calledUrl).toContain('/payments/flow/create');

    // Verifica método POST
    expect(calledOptions.method).toBe('POST');

    // Verifica credentials:'include' (R0-05: JWT via httpOnly cookie)
    expect(calledOptions.credentials).toBe('include');
  });

  it('payForSubscription envía el body con amount, paymentType y subscriptionTierId', async () => {
    const { useFlow } = await import('../useFlow');
    const { result } = renderHook(() => useFlow());

    await act(async () => {
      await result.current.payForSubscription('tier-abc', 'creator-xyz', 5000);
    });

    const [, calledOptions] = mockFetch.mock.calls[0];
    const sentBody = JSON.parse(calledOptions.body as string);

    expect(sentBody.amount).toBe(5000);
    expect(sentBody.paymentType).toBe('SUBSCRIPTION');
    expect(sentBody.subscriptionTierId).toBe('tier-abc');
    expect(sentBody.creatorId).toBe('creator-xyz');
  });

  it('payForSubscription resuelve con redirectUrl cuando el backend responde éxito', async () => {
    const expectedUrl = 'https://sandbox.flow.cl/app/web/pay.php?token=fake-flow-token-abc123';
    mockFetch = createFetchMock(createFlowCreateSuccessResponse({ redirectUrl: expectedUrl }));
    globalThis.fetch = mockFetch;

    const { useFlow } = await import('../useFlow');
    const { result } = renderHook(() => useFlow());

    let paymentResult: Awaited<ReturnType<typeof result.current.payForSubscription>> | undefined;
    await act(async () => {
      paymentResult = await result.current.payForSubscription('tier-abc', 'creator-xyz', 5000);
    });

    expect(paymentResult?.success).toBe(true);
    expect(paymentResult?.redirectUrl).toBe(expectedUrl);
  });

  it('payForSubscription retorna success:false cuando el usuario no está autenticado', async () => {
    // Cambiar el retorno del mock para simular usuario no autenticado
    vi.mocked(useAuthStore).mockReturnValueOnce({
      isAuthenticated: false,
      user: null,
      token: null,
      login: vi.fn(),
      logout: vi.fn(),
    } as ReturnType<typeof useAuthStore>);

    const { useFlow } = await import('../useFlow');
    const { result } = renderHook(() => useFlow());

    let paymentResult: Awaited<ReturnType<typeof result.current.payForSubscription>> | undefined;
    await act(async () => {
      paymentResult = await result.current.payForSubscription('tier-abc', 'creator-xyz', 5000);
    });

    // No debe llamar al endpoint
    expect(mockFetch).not.toHaveBeenCalled();
    expect(paymentResult?.success).toBe(false);
    expect(paymentResult?.error).toBeTruthy();
  });

  it('payForSubscription expone loading:true durante la llamada y false al terminar', async () => {
    // Mock fetch con delay controlado
    let resolveFetch!: (value: unknown) => void;
    const deferredFetch = vi.fn().mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      })
    );
    globalThis.fetch = deferredFetch;

    const { useFlow } = await import('../useFlow');
    const { result } = renderHook(() => useFlow());

    // Iniciar el pago sin awaitar
    let payPromise: Promise<unknown>;
    act(() => {
      payPromise = result.current.payForSubscription('tier-abc', 'creator-xyz', 5000);
    });

    // Loading debe ser true mientras fetch no resuelve
    expect(result.current.loading).toBe(true);

    // Resolver el fetch
    resolveFetch({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(createFlowCreateSuccessResponse()),
    });

    await act(async () => {
      await payPromise;
    });

    // Loading debe ser false al terminar
    expect(result.current.loading).toBe(false);
  });

  it('payForSubscription retorna error cuando el backend responde con !ok', async () => {
    mockFetch = createFetchMock({ error: 'Pago rechazado' }, { ok: false, status: 400 });
    globalThis.fetch = mockFetch;

    const { useFlow } = await import('../useFlow');
    const { result } = renderHook(() => useFlow());

    let paymentResult: Awaited<ReturnType<typeof result.current.payForSubscription>> | undefined;
    await act(async () => {
      paymentResult = await result.current.payForSubscription('tier-abc', 'creator-xyz', 5000);
    });

    expect(paymentResult?.success).toBe(false);
    expect(paymentResult?.error).toBe('Pago rechazado');
    expect(result.current.error).toBe('Pago rechazado');
  });
});
