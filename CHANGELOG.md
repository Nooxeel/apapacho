# Changelog

Todos los cambios relevantes de este proyecto se documentan aquí.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/).

## [Unreleased]

## [1.0.2] - 2026-05-30

### Fixed

- Guard de autenticación ahora espera la hidratación de `localStorage` **y** la verificación de la cookie de sesión antes de redirigir a `/login`, eliminando el logout espurio al navegar entre páginas o recargar. Corregido mediante nuevo hook `useRequireAuth` y flag `sessionChecked` en `authStore`.
- `uploadFile()` ahora envía `credentials: 'include'`, cabecera `X-Requested-With` y reintenta automáticamente con refresh en respuesta 401 (antes fallaba tras recargar la página al perderse el token en memoria).
- `api()` ya no requiere `&& token` para intentar el refresh: tras recargar sin token en memoria, usa la cookie httpOnly para refrescar la sesión sin causar bucle infinito (`skipRefresh` lo previene).

### Changed

- `NEXT_PUBLIC_API_URL` apunta a `https://api.appapacho.cl/api` en `.env.production.example` (antes apuntaba al dominio Railway con subdominio cross-site, lo que bloqueaba la cookie third-party en navegadores modernos).

### Added

- Nuevo hook centralizado `useRequireAuth` (`src/hooks/useRequireAuth.ts`). Implementado en 31 páginas protegidas y 3 semi-públicas, reemplazando comprobaciones dispersas sin cobertura.
- Runbook de despliegue (`docs/deploy.md`) con instrucciones para configurar el subdominio `api.appapacho.cl`, Railway y TLS.
- 31 nuevos tests: cobertura de `useRequireAuth`, `uploadFile`, `authStore` (flag `sessionChecked`) y muestra de guards de página.

[1.0.2]: https://github.com/Nooxeel/apapacho/compare/v1.0.1...v1.0.2
