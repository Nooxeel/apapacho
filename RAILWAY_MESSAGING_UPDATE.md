# Actualización de Base de Datos Railway - Privacidad de Mensajes

## Contexto
Se agregó la configuración de privacidad de mensajes al campo `visibilitySettings` del modelo `Creator`.

## Pasos para actualizar Railway

### 1. Conectar a Railway PostgreSQL

Ve a tu proyecto en Railway → PostgreSQL → Connect → Copiar la URL de conexión

### 2. Ejecutar SQL para actualizar registros existentes

Ejecuta el siguiente comando SQL en la consola de Railway (pestaña "Query"):

```sql
-- Actualizar todos los registros existentes de Creator para incluir el campo messaging
UPDATE "Creator"
SET "visibilitySettings" = jsonb_set(
  "visibilitySettings"::jsonb,
  '{messaging}',
  '"logged_in"'::jsonb,
  true
)
WHERE NOT ("visibilitySettings"::jsonb ? 'messaging');
```

Este comando:
- Busca todos los registros de Creator que NO tienen el campo `messaging`
- Agrega el campo `messaging` con valor `"logged_in"` (por defecto)
- Mantiene todos los demás campos intactos

### 3. Verificar la actualización

```sql
-- Ver un ejemplo de los datos actualizados
SELECT id, username, "visibilitySettings"
FROM "Creator"
LIMIT 5;
```

Deberías ver algo como:
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

### 4. Verificar en la aplicación

1. Ve a `/creator/edit` como creador
2. Deberías ver la nueva sección "💬 Privacidad de Mensajes"
3. Selecciona una opción (Todos, Solo registrados, Solo suscriptores)
4. Guarda los cambios
5. Ve a tu perfil público desde otra cuenta y verifica que el botón aparece/desaparece según la configuración

## Opciones de privacidad

- **`all`**: Cualquiera puede enviar mensajes (requiere login para funcionar)
- **`logged_in`**: Solo usuarios registrados pueden enviar mensajes (predeterminado)
- **`subscribers_only`**: Solo suscriptores activos pueden enviar mensajes

## Notas

- Los nuevos perfiles de creador tendrán automáticamente `messaging: "logged_in"` por defecto
- No es necesario crear una migración de Prisma, solo actualizar los datos existentes
- El campo es parte del JSON `visibilitySettings`, no una columna nueva
