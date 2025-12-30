# Limpieza y Corrección de Columnas de Visibilidad en Railway

## Problema
La tabla `Creator` tiene dos columnas de visibilidad:
- `visibilitysettings` (minúsculas - incorrecta)
- `visibilitySettings` (camelCase - correcta)

Necesitamos eliminar ambas y crear una sola columna correcta con el campo `messaging` incluido.

## ⚠️ IMPORTANTE: Backup de Datos

Antes de ejecutar estos comandos, **CREA UN BACKUP** de los datos existentes:

```sql
-- 1. Crear tabla temporal con los datos actuales
CREATE TABLE "Creator_Backup" AS
SELECT * FROM "Creator";

-- 2. Verificar que se creó el backup
SELECT COUNT(*) FROM "Creator_Backup";
```

## Paso 1: Guardar datos de visibilidad existentes (si hay datos importantes)

```sql
-- Ver qué datos de visibilidad existen actualmente
SELECT
  id,
  username,
  "visibilitySettings" as settings_camelcase,
  visibilitysettings as settings_lowercase
FROM "Creator"
LIMIT 5;
```

## Paso 2: Eliminar ambas columnas

```sql
-- Eliminar la columna en minúsculas (si existe)
ALTER TABLE "Creator"
DROP COLUMN IF EXISTS visibilitysettings;

-- Eliminar la columna en camelCase (si existe)
ALTER TABLE "Creator"
DROP COLUMN IF EXISTS "visibilitySettings";
```

## Paso 3: Verificar que se eliminaron

```sql
-- Verificar las columnas de la tabla
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'Creator'
  AND column_name LIKE '%visibility%';
```

Deberías ver: **0 rows** (no debe haber ninguna columna de visibilidad)

## Paso 4: Crear la columna correcta con el campo messaging

```sql
-- Crear la columna visibilitySettings con el formato correcto
ALTER TABLE "Creator"
ADD COLUMN "visibilitySettings" JSONB
DEFAULT '{"tabs":{"likes":true,"posts":true,"photos":true,"videos":true,"audio":true,"guestbook":true},"messaging":"logged_in"}'::jsonb;
```

## Paso 5: Verificar la nueva columna

```sql
-- Ver la columna creada
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'Creator'
  AND column_name = 'visibilitySettings';
```

Deberías ver:
- **column_name**: visibilitySettings
- **data_type**: jsonb
- **column_default**: El JSON con tabs y messaging

## Paso 6: Verificar datos en los registros

```sql
-- Ver algunos registros para confirmar que tienen los datos correctos
SELECT
  id,
  username,
  "visibilitySettings"
FROM "Creator"
LIMIT 5;
```

Cada registro debería tener:
```json
{
  "tabs": {
    "likes": true,
    "posts": true,
    "photos": true,
    "videos": true,
    "audio": true,
    "guestbook": true
  },
  "messaging": "logged_in"
}
```

## Paso 7: (Opcional) Si necesitas restaurar configuraciones antiguas

Si tenías configuraciones personalizadas en la columna anterior, puedes actualizarlas manualmente:

```sql
-- Ejemplo: Cambiar la privacidad de mensajes de un creador específico
UPDATE "Creator"
SET "visibilitySettings" = jsonb_set(
  "visibilitySettings"::jsonb,
  '{messaging}',
  '"subscribers_only"'::jsonb
)
WHERE username = 'nombre_del_creador';
```

## Paso 8: Eliminar el backup (cuando estés seguro)

```sql
-- SOLO ejecutar cuando estés 100% seguro que todo funciona
DROP TABLE "Creator_Backup";
```

## Verificación Final

```sql
-- Contar registros
SELECT COUNT(*) FROM "Creator";

-- Ver estructura de visibilitySettings
SELECT
  username,
  "visibilitySettings"->>'messaging' as messaging_privacy,
  "visibilitySettings"->'tabs'->>'likes' as likes_visible,
  "visibilitySettings"->'tabs'->>'guestbook' as guestbook_visible
FROM "Creator"
LIMIT 10;
```

## Resumen del Esquema Correcto

```
Creator
├── visibilitySettings (JSONB)
    ├── tabs (object)
    │   ├── likes: boolean
    │   ├── posts: boolean
    │   ├── photos: boolean
    │   ├── videos: boolean
    │   ├── audio: boolean
    │   └── guestbook: boolean
    └── messaging: "all" | "logged_in" | "subscribers_only"
```

## Notas Importantes

1. **Backup obligatorio**: Siempre crea un backup antes de modificar la estructura
2. **Comillas dobles**: Usa `"visibilitySettings"` (con comillas) para preservar el camelCase
3. **Tipo JSONB**: Usa JSONB en lugar de JSON para mejor rendimiento
4. **Default correcto**: El default incluye tanto `tabs` como `messaging`
5. **Testing**: Prueba en un registro antes de aplicar masivamente

## Orden de Ejecución Recomendado

1. ✅ Crear backup
2. ✅ Verificar datos actuales
3. ✅ Eliminar columnas antiguas
4. ✅ Crear columna nueva
5. ✅ Verificar que funciona
6. ✅ Probar en la aplicación
7. ✅ Eliminar backup (después de confirmar)
