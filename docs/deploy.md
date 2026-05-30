# Guía de deploy — Frontend Apapacho

## Variables de entorno (Vercel)

Copiar los valores de `.env.production.example` al panel de Vercel:
`Settings → Environment Variables → Production`.

| Variable | Valor prod | Notas |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.appapacho.cl/api` | Ver sección "Subdominio same-site" |
| `NEXT_PUBLIC_SITE_URL` | `https://appapacho.cl` | Para metadatos y OG |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | (desde Google Cloud Console) | OAuth |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | (desde Google Analytics) | Opcional |
| `NEXT_PUBLIC_SENTRY_DSN` | (desde Sentry) | Opcional; sin él el SDK queda en no-op |
| `NEXT_PUBLIC_TURNSTILE_SITEKEY` | (desde Cloudflare Turnstile) | Opcional en dev |

---

## Subdominio same-site — requisito para cookies de sesión

### Por qué es necesario

El frontend se sirve en `appapacho.cl` y el backend en un servicio externo.
Si el backend no está bajo el mismo dominio registrable (`.appapacho.cl`),
las cookies `apapacho_token` y `apapacho_refresh` quedan como **cookies de
tercera parte** desde el punto de vista del navegador:

- **Safari / iOS (ITP):** bloquea cookies de tercera parte por defecto desde 2020.
- **Chrome:** phase-out activo de third-party cookies.
- **Firefox (ETP):** bloqueo creciente.

El resultado es que en recarga completa o nueva pestaña el token en memoria
se pierde, `GET /users/me` da 401 y la sesión parece perdida.

### Solución: `api.appapacho.cl`

Sirviendo el backend en `api.appapacho.cl` (mismo dominio registrable que el
frontend), la cookie pasa a ser **first-party de `.appapacho.cl`** y todos
los navegadores la envían correctamente.

### Pasos de infraestructura (operador)

1. **Railway — dominio custom en el servicio backend:**
   - Panel Railway → servicio backend → Settings → Networking → Custom Domain.
   - Añadir `api.appapacho.cl`.
   - Railway entrega un CNAME destino (p.ej. `<hash>.up.railway.app`).

2. **DNS:**
   - En el proveedor DNS de `appapacho.cl`, crear:
     ```
     CNAME  api  <hash>.up.railway.app.
     ```
   - Tiempo de propagación: minutos–horas según TTL.

3. **TLS:**
   - Railway aprovisiona el certificado automáticamente vía Let's Encrypt
     una vez que el CNAME propaga.

4. **Variables de entorno backend (`COOKIE_DOMAIN`):**
   - Setear `COOKIE_DOMAIN=.appapacho.cl` en Railway para que las cookies
     incluyan `Domain=.appapacho.cl` y sean válidas en toda la jerarquía.

5. **Variable de entorno frontend (`NEXT_PUBLIC_API_URL`):**
   - Setear en Vercel: `NEXT_PUBLIC_API_URL=https://api.appapacho.cl/api`.
   - El valor ya aparece en `.env.production.example`.
   - Hacer redeploy del frontend tras el cambio.

> **El fix de sesión queda activo solo después de completar estos pasos.**
> Hasta entonces, el comportamiento existente en producción se mantiene.
