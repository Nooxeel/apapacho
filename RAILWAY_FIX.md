# Arreglar Login en Railway - Error visibilitySettings

## Problema
La base de datos en Railway no tiene la columna `visibilitySettings` que agregamos recientemente al modelo `Creator`.

## Solución Rápida: SQL Directo en Railway

1. Ve a tu proyecto en Railway: https://railway.app
2. Selecciona tu servicio de PostgreSQL
3. Haz clic en la pestaña **"Query"** o **"Data"**
4. **IMPORTANTE**: Si creaste la columna con el UI de Railway, primero elimínala:

```sql
ALTER TABLE "Creator" DROP COLUMN IF EXISTS visibilitysettings;
```

5. Ahora crea la columna con el nombre correcto (con comillas para preservar mayúsculas):

```sql
ALTER TABLE "Creator"
ADD COLUMN "visibilitySettings" JSONB
DEFAULT '{"tabs":{"likes":true,"posts":true,"photos":true,"videos":true,"audio":true,"guestbook":true}}'::jsonb;
```

**Nota**: Las comillas dobles alrededor de `"visibilitySettings"` son CRÍTICAS - preservan las mayúsculas. Sin ellas, PostgreSQL convierte todo a minúsculas.

6. Espera a que se complete (debería ser instantáneo)
7. Reinicia el servicio del backend en Railway
8. Prueba el login nuevamente

## Solución Alternativa: Railway CLI

Si tienes Railway CLI instalado:

```bash
cd apapacho-backend
railway login
railway link  # Selecciona tu proyecto
railway run npx prisma db push
```

## Verificar que funcionó

Después de aplicar el cambio, prueba hacer login con:
- Email: test@apapacho.com
- Password: test1234

El login debería funcionar correctamente ahora.

## Si el problema persiste

Verifica en Railway que:
1. La variable de entorno `DATABASE_URL` esté configurada correctamente
2. El servicio del backend se haya reiniciado después del cambio
3. Los logs del backend no muestren más errores de Prisma
