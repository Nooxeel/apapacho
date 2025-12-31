# WebSocket Implementation - Apapacho

## ✅ Completado

### Backend
1. **Socket.IO Server** (`src/index.ts`)
   - ✅ Servidor HTTP + Socket.IO configurado
   - ✅ CORS configurado para Vercel y localhost
   - ✅ Manejo de rooms: `user:${userId}` y `conversation:${conversationId}`
   - ✅ Eventos: `join:user`, `join:conversation`, `leave:conversation`

2. **Emisiones de WebSocket**
   - ✅ `message:new` - Cuando se envía un mensaje (`src/routes/messages.ts:290`)
   - ✅ `unread:update` - Cuando cambia el contador de no leídos (`src/routes/messages.ts:294`)
   - ✅ `stats:update` - Cuando se da like/unlike a un post (`src/routes/posts.ts:455, 489`)

### Frontend
1. **Socket Service** (`src/lib/socket.ts`)
   - ✅ Singleton service con auto-reconnect
   - ✅ Métodos: `connect()`, `disconnect()`, `joinConversation()`, `leaveConversation()`
   - ✅ Event listeners: `on()`, `off()`

2. **Componentes Actualizados**
   - ✅ `Navbar.tsx` - WebSocket para contador de no leídos (elimina polling de 3s)
   - ✅ `[username]/page.tsx` - WebSocket para stats updates (elimina polling de 3s)

## 🚧 Pendiente (Opcional - Mensajes)

### Páginas de Mensajes
Estas aún usan polling, pero se puede dejar así si prefieres:

1. **`/messages/page.tsx`** - Lista de conversaciones
   - Actualmente: Polling cada 3s
   - Con WebSocket: Escuchar `message:new` y actualizar lista

2. **`/messages/[conversationId]/page.tsx`** - Chat individual
   - Actualmente: Polling cada 3s
   - Con WebSocket: Escuchar `message:new` en tiempo real

## 📊 Impacto Actual

### Antes (Polling):
```
Usuario en perfil de creador: 1200 requests/hora (stats cada 3s)
Usuario con navbar abierta: 1200 requests/hora (unread cada 3s)
Total: 2400 requests/hora/usuario
```

### Después (WebSocket):
```
Usuario en perfil de creador: 1 conexión persistente + eventos solo cuando hay cambios
Usuario con navbar abierta: Mismo socket, eventos push
Total: ~5-10 requests/hora/usuario (solo eventos reales)
```

**Reducción: ~99% menos requests** para stats y unread counts

## 🔥 Siguientes Pasos Recomendados

### Opción A: Dejar como está
- Stats y unread ya usan WebSocket ✅
- Mensajes siguen con polling (no es crítico, solo 3s)
- Deploy y probar

### Opción B: Completar mensajes con WebSocket
- Actualizar `/messages/page.tsx` para lista en tiempo real
- Actualizar `/messages/[conversationId]/page.tsx` para chat en tiempo real
- Requiere ~30 minutos más

## 🚀 Para Desplegar

1. Commit y push backend (ya tiene Socket.IO)
2. Commit y push frontend (ya tiene socket.io-client)
3. Railway auto-despliega (WebSocket funciona out-of-the-box)
4. Vercel auto-despliega
5. ✅ WebSocket activo en producción

**No hay costos adicionales** - Railway cobra por recursos (RAM/CPU), no por tipo de conexión.
