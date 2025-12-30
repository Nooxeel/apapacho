# Deploy del Sistema de Mensajería en Railway

## Problema Actual
El error "Cannot POST /api/messages/conversations" indica que el backend en Railway **no tiene el código de mensajería**.

## Solución: Deploy del Backend

### Paso 1: Verificar que tienes el código más reciente

En tu máquina local, ve a la carpeta del backend:

```bash
cd ~/Desktop/apapacho-backend
```

Verifica que tienes estos archivos:
- `src/routes/messages.ts` ✅
- Modelos `Conversation` y `Message` en `prisma/schema.prisma` ✅

### Paso 2: Crear Migración de Prisma

El sistema de mensajería requiere dos tablas nuevas. Crea la migración:

```bash
cd ~/Desktop/apapacho-backend
npx prisma migrate dev --name add_messaging_system
```

Esto creará:
- Tabla `Conversation`
- Tabla `Message`
- Relaciones con `User`

### Paso 3: Verificar Git

Asegúrate de que todos los cambios estén commiteados:

```bash
git status
git add .
git commit -m "feat: Add messaging system with conversations and messages"
git push origin main
```

### Paso 4: Deploy en Railway

#### Opción A: Si el backend ya está en Railway (conectado a GitHub)

1. Ve a tu proyecto en Railway
2. El deploy debería iniciarse automáticamente al hacer push
3. Espera a que termine el deploy
4. Ve a la sección de **Variables** y verifica que tengas:
   - `DATABASE_URL` (debería estar)
   - Las demás variables de entorno necesarias

#### Opción B: Si necesitas hacer deploy manual

1. Ve a Railway Dashboard
2. Selecciona tu proyecto del backend
3. Click en **Deploy** o **Redeploy**
4. Espera a que compile

### Paso 5: Ejecutar Migraciones en Railway

**MUY IMPORTANTE**: Después del deploy, debes ejecutar las migraciones en la base de datos de Railway:

```bash
# Opción 1: Desde tu terminal local (necesitas el DATABASE_URL de Railway)
DATABASE_URL="postgresql://..." npx prisma migrate deploy

# Opción 2: Desde Railway CLI
railway run npx prisma migrate deploy
```

### Paso 6: Verificar las Tablas

Conéctate a PostgreSQL de Railway y verifica:

```sql
-- Ver todas las tablas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Deberías ver:
- `Conversation`
- `Message`
- (y todas las otras tablas existentes)

### Paso 7: Verificar la Estructura

```sql
-- Ver estructura de Conversation
\d "Conversation"

-- Ver estructura de Message
\d "Message"
```

### Paso 8: Probar la API

Usa curl o Postman para probar:

```bash
# Obtener token de autenticación primero (login)
curl -X POST https://tu-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"fan@test.com","password":"Test1234!"}'

# Usar el token para crear una conversación
curl -X POST https://tu-backend.railway.app/api/messages/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{"recipientId":"ID_DEL_CREADOR"}'
```

Si funciona, deberías recibir un objeto JSON con la conversación creada.

## Troubleshooting

### Error: "Cannot POST /api/messages/conversations"

**Causa**: El backend en Railway no tiene el código de mensajería.

**Solución**:
1. Verifica que hiciste push del código a GitHub
2. Verifica que Railway hizo deploy automáticamente
3. Revisa los logs de Railway para ver si hubo errores en el build

### Error: "Table 'Conversation' does not exist"

**Causa**: No ejecutaste las migraciones de Prisma.

**Solución**:
```bash
railway run npx prisma migrate deploy
```

### Error: "relation 'Conversation' does not exist"

**Causa**: PostgreSQL espera nombres con comillas.

**Solución**: Verifica que tu `schema.prisma` use `@@map("Conversation")` correctamente.

### Error 500 en la API

**Causa**: Posible problema con la base de datos o configuración.

**Solución**:
1. Ve a Railway → Tu servicio → Logs
2. Busca el error específico en los logs
3. Verifica que `DATABASE_URL` esté configurado correctamente

## Verificación Final

Una vez que todo esté deployado:

1. **Frontend (Vercel)**: Ya está actualizado ✅
2. **Backend (Railway)**: Debe tener el código de mensajería ⚠️
3. **Base de Datos (Railway PostgreSQL)**: Debe tener las tablas `Conversation` y `Message` ⚠️

## Comandos Rápidos

```bash
# Ver estado del backend
cd ~/Desktop/apapacho-backend
git status
git log --oneline -5

# Ver migraciones disponibles
npx prisma migrate status

# Aplicar migraciones
npx prisma migrate deploy

# Ver schema actual
npx prisma db pull
```

## Notas Importantes

1. **No uses `migrate dev` en producción**: Usa `migrate deploy`
2. **Backup**: Siempre haz backup antes de aplicar migraciones
3. **Logs**: Monitorea los logs de Railway durante el deploy
4. **Variables de entorno**: Verifica que todas estén configuradas

## Orden de Ejecución

1. ✅ Commit y push del código del backend
2. ✅ Esperar deploy en Railway
3. ✅ Ejecutar `prisma migrate deploy` en Railway
4. ✅ Verificar tablas en PostgreSQL
5. ✅ Probar endpoint con curl
6. ✅ Probar desde el frontend

---

**Después de seguir estos pasos, el sistema de mensajería debería funcionar correctamente en producción.** 🚀
