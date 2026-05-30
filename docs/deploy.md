# Deploy del frontend en Vercel

[DECISION: plataforma de deploy = Vercel] — confirmado por el operador en STAGE-GATE-1.

Vercel es el adaptador verificado de primera parte para Next.js 15. El `next.config.js`
ya asume el wrapper de Sentry con tunnel `/monitoring`, lo que es compatible con Vercel
sin configuración adicional.

---

## Requisitos previos

- Cuenta en [vercel.com](https://vercel.com) conectada a la organización de GitHub.
- El backend desplegado en Railway y con `NEXT_PUBLIC_API_URL` disponible.
- Proyecto Sentry tipo Next.js creado (para `NEXT_PUBLIC_SENTRY_DSN`).
- Site Cloudflare Turnstile creado (para `NEXT_PUBLIC_TURNSTILE_SITEKEY`).

---

## Opción A — Integración Git nativa de Vercel (recomendada)

Esta es la integración predeterminada y la que usa el workflow `deploy.yml`.

1. En [vercel.com/new](https://vercel.com/new), importar el repositorio `frontend/`.
2. Vercel detecta automáticamente Next.js. El archivo `vercel.json` fija
   `buildCommand` e `installCommand` para garantizar reproducibilidad.
3. En **Settings → Environment Variables**, añadir cada variable de `.env.production.example`
   con scope **Production** (y opcionalmente **Preview**).
4. Push a `main` dispara un deploy de producción automático.
5. Push a cualquier otra rama dispara un deploy de Preview con URL única.

---

## Variables de entorno — dónde setear cada una

| Variable | Scope | Obligatoria | Descripción |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | Production + Preview | Sí | URL del backend Railway. Ejemplo: `https://…railway.app/api`. No terminar con `/`. |
| `NEXT_PUBLIC_SENTRY_DSN` | Production | Sí (prod) | DSN del proyecto Next.js en Sentry. Sin él, los errores son invisibles en producción. |
| `SENTRY_ORG` | Production (build-time) | Sí (source maps) | Slug de la organización en Sentry. |
| `SENTRY_PROJECT` | Production (build-time) | Sí (source maps) | Slug del proyecto en Sentry. |
| `SENTRY_AUTH_TOKEN` | Production (build-time) | Sí (source maps) | Token con scope `project:releases`. Crear en Sentry → Settings → Auth Tokens. |
| `NEXT_PUBLIC_TURNSTILE_SITEKEY` | Production + Preview | Recomendada | Site Key de Cloudflare Turnstile. Sin ella, el CAPTCHA queda desactivado y el backend emite warning. |
| `NEXT_PUBLIC_FLOW_ENABLED` | Production | No | `true` activa Flow en el selector. Mantener `false` hasta que el backend tenga credenciales Flow cargadas. |

> Las variables `NEXT_PUBLIC_*` se incluyen en el bundle del cliente en build-time.
> Las variables `SENTRY_*` (sin prefijo `NEXT_PUBLIC_`) solo existen durante el build
> y nunca se exponen al navegador.

---

## Opción B — CLI de Vercel (CI/CD explícito)

El workflow `deploy.yml` usa el CLI de Vercel con secrets de GitHub:

```
VERCEL_TOKEN     — token de la cuenta en Vercel (Settings → Tokens)
VERCEL_ORG_ID    — ID de la organización (vercel.com → Settings → General → Team ID)
VERCEL_PROJECT_ID — ID del proyecto (vercel.com → Project → Settings → General)
```

Estos tres valores deben cargarse en **GitHub → Settings → Secrets and variables →
Actions** del repositorio frontend. Nunca committearlos al repo.

---

## Dominios

1. En Vercel → Project → Settings → Domains, añadir el dominio de producción.
2. Configurar los registros DNS según las instrucciones de Vercel (CNAME o A record).
3. Vercel provisiona TLS automáticamente.

---

## Variables de entorno para Preview deploys

Los Preview deploys (ramas distintas de `main`) pueden usar el backend de staging o el
de producción según la política del equipo. Se recomienda:

- `NEXT_PUBLIC_API_URL` en scope **Preview** apuntando al backend de staging.
- `NEXT_PUBLIC_FLOW_ENABLED=false` siempre en Preview (no exponer Flow sin credenciales).
- `NEXT_PUBLIC_SENTRY_DSN` en Preview (opcional, útil para depurar antes de merge).

---

## Rollback

En Vercel → Project → Deployments, seleccionar un deploy anterior y hacer
"Promote to Production". No requiere push al repo — es instantáneo.
