# Aplicar Migraciones de Mensajería en Railway - PASO A PASO

## ✅ Estado Actual

- ✅ Código pusheado a GitHub
- ✅ Railway debería estar haciendo el deploy automáticamente
- ⏳ Esperando a que termine el deploy
- ⚠️ Faltan las tablas en la base de datos

## Paso 1: Esperar el Deploy de Railway

1. Ve a [Railway Dashboard](https://railway.app)
2. Selecciona tu proyecto del backend
3. Ve a la pestaña **Deployments**
4. Espera a que el deploy actual termine (debería decir "Success")
5. Tiempo estimado: 2-5 minutos

## Paso 2: Conectar a PostgreSQL de Railway

Ve a tu servicio de PostgreSQL en Railway y copia la **Connect URL**.

Debería verse así:
```
postgresql://postgres:password@containers-us-west-123.railway.app:1234/railway
```

## Paso 3: Ejecutar las Migraciones

### Opción A: Desde Railway Dashboard (MÁS FÁCIL)

1. Ve a Railway → Tu base de datos PostgreSQL
2. Click en la pestaña **Query**
3. Copia y pega el siguiente SQL completo:

```sql
-- ============================================
-- MIGRACIÓN: Sistema de Mensajería
-- ============================================

-- Crear tabla Conversation
CREATE TABLE IF NOT EXISTS "Conversation" (
    "id" TEXT NOT NULL,
    "participant1Id" TEXT NOT NULL,
    "participant2Id" TEXT NOT NULL,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "participant1Unread" INTEGER NOT NULL DEFAULT 0,
    "participant2Unread" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- Crear tabla Message
CREATE TABLE IF NOT EXISTS "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'TEXT',
    "mediaUrl" TEXT,
    "price" DOUBLE PRECISION,
    "readAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- Crear índices para Conversation
CREATE INDEX IF NOT EXISTS "Conversation_participant1Id_idx" ON "Conversation"("participant1Id");
CREATE INDEX IF NOT EXISTS "Conversation_participant2Id_idx" ON "Conversation"("participant2Id");
CREATE INDEX IF NOT EXISTS "Conversation_lastMessageAt_idx" ON "Conversation"("lastMessageAt");
CREATE UNIQUE INDEX IF NOT EXISTS "Conversation_participant1Id_participant2Id_key" ON "Conversation"("participant1Id", "participant2Id");

-- Crear índices para Message
CREATE INDEX IF NOT EXISTS "Message_conversationId_idx" ON "Message"("conversationId");
CREATE INDEX IF NOT EXISTS "Message_senderId_idx" ON "Message"("senderId");
CREATE INDEX IF NOT EXISTS "Message_createdAt_idx" ON "Message"("createdAt");

-- Agregar Foreign Keys (solo si no existen)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Conversation_participant1Id_fkey'
    ) THEN
        ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_participant1Id_fkey"
        FOREIGN KEY ("participant1Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Conversation_participant2Id_fkey'
    ) THEN
        ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_participant2Id_fkey"
        FOREIGN KEY ("participant2Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Message_conversationId_fkey'
    ) THEN
        ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey"
        FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Message_senderId_fkey'
    ) THEN
        ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey"
        FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Crear tabla de migraciones de Prisma si no existe
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" VARCHAR(36) PRIMARY KEY,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMP,
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMP,
    "started_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);

-- Registrar la migración
INSERT INTO "_prisma_migrations" ("id", "checksum", "migration_name", "logs", "applied_steps_count", "finished_at")
VALUES (
    gen_random_uuid()::text,
    'add_messaging_system_checksum',
    '20250101000000_add_messaging_system',
    NULL,
    1,
    CURRENT_TIMESTAMP
)
ON CONFLICT DO NOTHING;
```

4. Click en **Run Query**
5. Deberías ver: "Query executed successfully"

### Opción B: Desde Terminal Local con Railway CLI

```bash
# Instalar Railway CLI si no lo tienes
npm install -g @railway/cli

# Login
railway login

# Linkear al proyecto
railway link

# Ejecutar migraciones
railway run npx prisma migrate deploy
```

## Paso 4: Verificar que las Tablas se Crearon

Ejecuta este SQL en Railway Query:

```sql
-- Ver todas las tablas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Deberías ver:
- ✅ Conversation
- ✅ Message
- ✅ User
- ✅ Creator
- ✅ (otras tablas existentes)

## Paso 5: Verificar la Estructura

```sql
-- Ver estructura de Conversation
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'Conversation'
ORDER BY ordinal_position;

-- Ver estructura de Message
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'Message'
ORDER BY ordinal_position;
```

## Paso 6: Probar la API

### 1. Obtener Token de Autenticación

```bash
curl -X POST https://tu-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "fan@test.com",
    "password": "Test1234!"
  }'
```

Copia el `token` de la respuesta.

### 2. Crear una Conversación

```bash
curl -X POST https://tu-backend.railway.app/api/messages/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "recipientId": "ID_DEL_CREADOR"
  }'
```

Si ves un JSON con la conversación, ¡funciona! ✅

### 3. Obtener Conversaciones

```bash
curl https://tu-backend.railway.app/api/messages/conversations \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

## Paso 7: Probar desde el Frontend

1. Ve a https://tu-app.vercel.app
2. Login como fan (fan@test.com / Test1234!)
3. Ve al perfil de un creador (ejemplo: /imperfecto)
4. Click en el botón **"Mensaje"**
5. Deberías ser redirigido a `/messages/{id}`
6. Escribe un mensaje y envía

Si todo funciona, ¡el sistema de mensajería está completamente operativo! 🎉

## Troubleshooting

### Error: "relation 'Conversation' does not exist"

**Solución**: No ejecutaste el SQL de migración. Vuelve al Paso 3.

### Error: "Cannot POST /api/messages/conversations"

**Solución**: El backend no se deployó correctamente. Verifica en Railway → Deployments.

### Error 500 al crear conversación

**Solución**:
1. Ve a Railway → Tu servicio → Logs
2. Busca el error específico
3. Puede ser un problema con foreign keys o IDs

### No aparece el botón de mensaje

**Solución**: Verifica la configuración de privacidad del creador en `/creator/edit` → Privacidad de Mensajes.

## Checklist Final

- [ ] Deploy de Railway completado con éxito
- [ ] SQL de migración ejecutado sin errores
- [ ] Tablas `Conversation` y `Message` existen
- [ ] API `/api/messages/conversations` responde correctamente
- [ ] Frontend puede crear conversaciones
- [ ] Frontend puede enviar mensajes
- [ ] Polling de mensajes funciona (se actualizan cada 15 segundos)
- [ ] Contador de no leídos funciona

---

**Una vez completado todo, el sistema de mensajería estará 100% funcional en producción.** 🚀
