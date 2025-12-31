# Agregar columna isPurchased a Message en Railway

## Problema
El esquema de Prisma incluye `isPurchased` en el modelo Message, pero la columna no existe en la base de datos de producción en Railway.

## Solución

Ejecuta este SQL en Railway → PostgreSQL → Query:

```sql
-- Agregar columna isPurchased a la tabla Message
ALTER TABLE "Message"
ADD COLUMN IF NOT EXISTS "isPurchased" BOOLEAN NOT NULL DEFAULT false;

-- Verificar que se agregó correctamente
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'Message'
  AND column_name = 'isPurchased';
```

Deberías ver:
- **column_name**: isPurchased
- **data_type**: boolean
- **column_default**: false

## Verificación Final

```sql
-- Ver estructura completa de Message
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'Message'
ORDER BY ordinal_position;
```

Deberías ver todas las columnas:
- id
- conversationId
- senderId
- content
- type
- price
- **isPurchased** ← Nueva columna
- readAt
- deletedAt
- createdAt
- updatedAt (si existe)

## Después de ejecutar

Una vez agregada la columna, el error `The column Message.isPurchased does not exist` debería desaparecer y los endpoints de mensajes funcionarán correctamente.
