# Changelog

Todos los cambios notables de este proyecto se documentan aquí.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/),
con versiones que siguen [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

### Added

- **Flow payment UI** (detrás de flag `NEXT_PUBLIC_FLOW_ENABLED`): `flow` agregado al union `PaymentGateway` y a la factory; hook `useFlow.ts` (espejo de `useFintoc`); `GatewaySelector` muestra Flow solo cuando la variable de entorno está en `'true'`; rama Flow en `/payments/result` lee `external_reference` + `status` y confirma vía `GET /payments/flow/status/:commerceOrder`.
- 14 nuevas pruebas unitarias para la integración Flow.
- `vercel.json` con configuración de despliegue para Vercel.
- `.env.production.example` con todas las variables de entorno requeridas en producción.
- `docs/deploy.md` con guía de despliegue paso a paso.
- Workflow de CI (`.github/workflows/ci.yml`) con pasos de lint, typecheck y build.
- Workflow de deploy (`.github/workflows/deploy.yml`) disparado por `workflow_run` y condicionado al éxito de CI.
- Vitest incorporado al pipeline de CI; 586 pruebas ejecutadas en cada push.
- Gitleaks fijado a versión específica en los workflows.

### Changed

- `GatewaySelector` ahora evalúa `NEXT_PUBLIC_FLOW_ENABLED` para mostrar u ocultar la opción Flow.
- `/payments/result` maneja el contrato de retorno de Flow (`external_reference`, `status`, `GET /payments/flow/status/:commerceOrder`).
- `usePayment.ts` actualizado para integrar el hook de Flow junto al de Fintoc.
- `package.json` actualizado a la versión 1.0.2.

### Fixed

- Migración de `.eslintrc.json` (formato legacy) a `eslint.config.mjs` (flat config ESLint 9 + Next 15); `npm run lint` ahora finaliza con código 0.
- Corregidos 4 errores de lint genuinos detectados durante la migración.
