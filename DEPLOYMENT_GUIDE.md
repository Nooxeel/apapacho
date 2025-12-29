# 🚀 Deployment Final - Frontend en Vercel

## ✅ Pasos Completados

1. ✅ Backend configurado para Railway
2. ✅ PostgreSQL ready
3. ✅ Cloudinary integrado
4. ✅ Variables de entorno configuradas

---

## 📱 Paso Final: Deploy Frontend en Vercel

### 1. Preparar el Proyecto

El frontend ya está listo con:
- ✅ Variables de entorno en `.env.example`
- ✅ Configuración en `src/lib/config.ts`
- ✅ Build optimizado

### 2. Crear cuenta en Vercel

1. Ve a https://vercel.com/signup
2. Regístrate con GitHub
3. Autoriza acceso a tus repositorios

### 3. Importar proyecto

1. Click en "Add New" → "Project"
2. Selecciona tu repositorio `apapacho`
3. Vercel detectará automáticamente que es Next.js

### 4. Configurar proyecto

**Framework Preset:** Next.js (auto-detectado)
**Root Directory:** `./` (default)
**Build Command:** `npm run build` (default)
**Output Directory:** `.next` (default)

### 5. Variables de entorno

En la configuración del proyecto, agrega:

```env
NEXT_PUBLIC_API_URL=https://tu-backend.up.railway.app
```

⚠️ **IMPORTANTE**: Usa la URL que te dio Railway (sin `/api` al final)

### 6. Deploy

1. Click "Deploy"
2. Vercel construirá y desplegará tu app
3. Obtendrás una URL: `https://tu-app.vercel.app`

### 7. Actualizar Backend

Una vez que tengas la URL de Vercel, actualiza Railway:

1. Ve a Railway → Tu servicio → Variables
2. Actualiza `FRONTEND_URL`:
   ```env
   FRONTEND_URL=https://tu-app.vercel.app
   ```
3. Railway redesplegará automáticamente

---

## 🔄 Flujo Completo de Deployment

```
1. Railway (Backend)
   ├── PostgreSQL Database
   ├── Cloudinary (archivos)
   └── API: https://tu-backend.up.railway.app

2. Vercel (Frontend)
   ├── Next.js App
   ├── Static files
   └── URL: https://tu-app.vercel.app

3. Cloudinary
   └── Almacenamiento: https://res.cloudinary.com/...
```

---

## 📝 Checklist Final

### Backend (Railway):
- [ ] Proyecto creado en Railway
- [ ] PostgreSQL agregado
- [ ] Variables de entorno configuradas:
  - [ ] `JWT_SECRET`
  - [ ] `FRONTEND_URL`
  - [ ] `CLOUDINARY_CLOUD_NAME`
  - [ ] `CLOUDINARY_API_KEY`
  - [ ] `CLOUDINARY_API_SECRET`
- [ ] Deploy completado
- [ ] Health check funciona: `/api/health`

### Cloudinary:
- [ ] Cuenta creada
- [ ] Credenciales obtenidas
- [ ] Variables agregadas a Railway

### Frontend (Vercel):
- [ ] Cuenta creada en Vercel
- [ ] Repositorio conectado
- [ ] Variable `NEXT_PUBLIC_API_URL` configurada
- [ ] Deploy completado
- [ ] Sitio accesible

### Post-Deploy:
- [ ] CORS configurado (Backend acepta requests del frontend)
- [ ] Uploads funcionando
- [ ] Login/Register funcionando
- [ ] Perfiles cargando correctamente

---

## 🧪 Testing Post-Deploy

### 1. Health Check
```bash
curl https://tu-backend.up.railway.app/api/health
```

### 2. Test Login
```bash
curl -X POST https://tu-backend.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### 3. Test Frontend
Abre `https://tu-app.vercel.app` y verifica:
- [ ] Landing page carga
- [ ] Listado de creadores funciona
- [ ] Login/Register funciona
- [ ] Perfil de creador carga

---

## 🐛 Troubleshooting

### CORS Error
**Error:** `Access-Control-Allow-Origin`
**Solución:** Verifica que `FRONTEND_URL` en Railway sea correcto (sin `/` al final)

### API 404
**Error:** Endpoints no encontrados
**Solución:** Verifica que `NEXT_PUBLIC_API_URL` no tenga `/api` duplicado

### Images not loading
**Error:** Imágenes no cargan
**Solución:** Verifica credenciales de Cloudinary en Railway

### Database Error
**Error:** `P1001: Can't reach database server`
**Solución:** Verifica que PostgreSQL esté running en Railway

---

## 📚 Recursos

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **Cloudinary Docs**: https://cloudinary.com/documentation
- **Next.js Deployment**: https://nextjs.org/docs/deployment

---

## 🎉 Después del deployment

Tu sitio estará en vivo en:
- **Frontend**: `https://tu-app.vercel.app`
- **Backend**: `https://tu-backend.up.railway.app`
- **Assets**: `https://res.cloudinary.com/...`

¡Listo para mostrar al mundo! 🚀
