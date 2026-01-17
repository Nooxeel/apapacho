# 🚀 Apapacho - Features Roadmap

## Funcionalidades a Implementar

Este documento detalla el plan de implementación de 8 funcionalidades clave.

---

## 📊 Resumen de Prioridades

| # | Funcionalidad | Complejidad | Tiempo Est. | Dependencias |
|---|---------------|-------------|-------------|--------------|
| 1 | Block Lists | 🟢 Baja | 2-3 días | Ninguna |
| 2 | Promocodes/Trials | 🟡 Media | 3-4 días | Suscripciones |
| 3 | Mass DMs | 🟡 Media | 2-3 días | Mensajería |
| 4 | Watermarking Automático | 🟡 Media | 3-4 días | Upload |
| 5 | Verificación de Edad | 🔴 Alta | 5-7 días | KYC Provider |
| 6 | Referral Programs | 🟡 Media | 4-5 días | Pagos |
| 7 | Import from OnlyFans | 🔴 Alta | 5-7 días | Upload, Posts |
| 8 | Import from Arsmate | 🔴 Alta | 5-7 días | Upload, Posts |

**Tiempo total estimado: 4-6 semanas**

---

## 1️⃣ Block Lists (Listas de Bloqueo)

### Descripción
Permitir a creadores bloquear usuarios específicos para que no puedan:
- Ver su perfil
- Enviar mensajes
- Suscribirse
- Comentar

### Modelos de Base de Datos

```prisma
model BlockedUser {
  id          String   @id @default(uuid())
  creatorId   String
  blockedUserId String
  reason      String?
  createdAt   DateTime @default(now())
  
  creator     Creator  @relation(fields: [creatorId], references: [id], onDelete: Cascade)
  blockedUser User     @relation(fields: [blockedUserId], references: [id], onDelete: Cascade)
  
  @@unique([creatorId, blockedUserId])
  @@index([creatorId])
  @@index([blockedUserId])
}
```

### Endpoints API

```
POST   /api/creator/block/:userId      - Bloquear usuario
DELETE /api/creator/block/:userId      - Desbloquear usuario
GET    /api/creator/blocked            - Listar bloqueados
GET    /api/creator/block/check/:userId - Verificar si está bloqueado
```

### Middleware de Verificación

```typescript
// Middleware para verificar bloqueos antes de cualquier acción
const checkBlocked = async (creatorId: string, userId: string) => {
  const blocked = await prisma.blockedUser.findUnique({
    where: { creatorId_blockedUserId: { creatorId, blockedUserId: userId } }
  })
  return !!blocked
}
```

### Frontend
- Botón "Bloquear" en perfil de usuario (para creadores)
- Lista de usuarios bloqueados en /creator/settings/blocked
- Mensaje de error cuando un usuario bloqueado intenta acceder

---

## 2️⃣ Promocodes / Trials

### Descripción
Códigos promocionales para:
- Descuentos en suscripciones (% o monto fijo)
- Trials gratuitos (X días gratis)
- Uso único o múltiple
- Límite de usos totales
- Fecha de expiración

### Modelos de Base de Datos

```prisma
model Promocode {
  id              String      @id @default(uuid())
  creatorId       String
  code            String      // Código único por creador
  type            PromocodeType // PERCENTAGE, FIXED_AMOUNT, FREE_TRIAL
  value           Float       // % descuento, monto fijo, o días de trial
  currency        String?     @default("CLP")
  maxUses         Int?        // null = ilimitado
  currentUses     Int         @default(0)
  minPurchase     Float?      // Mínimo de compra para aplicar
  applicableTiers String[]    // IDs de tiers donde aplica (vacío = todos)
  startsAt        DateTime    @default(now())
  expiresAt       DateTime?
  isActive        Boolean     @default(true)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  creator         Creator     @relation(fields: [creatorId], references: [id], onDelete: Cascade)
  redemptions     PromocodeRedemption[]
  
  @@unique([creatorId, code])
  @@index([code])
  @@index([creatorId, isActive])
}

model PromocodeRedemption {
  id            String    @id @default(uuid())
  promocodeId   String
  userId        String
  subscriptionId String?
  discountAmount Float
  createdAt     DateTime  @default(now())
  
  promocode     Promocode @relation(fields: [promocodeId], references: [id])
  
  @@unique([promocodeId, userId]) // Un usuario solo puede usar un código una vez
  @@index([userId])
}

enum PromocodeType {
  PERCENTAGE      // Ej: 20% de descuento
  FIXED_AMOUNT    // Ej: $5000 de descuento
  FREE_TRIAL      // Ej: 7 días gratis
}
```

### Endpoints API

```
POST   /api/creator/promocodes          - Crear código
GET    /api/creator/promocodes          - Listar mis códigos
PUT    /api/creator/promocodes/:id      - Actualizar código
DELETE /api/creator/promocodes/:id      - Eliminar código
GET    /api/creator/promocodes/:id/stats - Estadísticas de uso

POST   /api/promocodes/validate         - Validar código (público)
POST   /api/promocodes/apply            - Aplicar código a suscripción
```

### Flujo de Uso

1. Creador crea código "WELCOME50" (50% descuento, máx 100 usos)
2. Fan ingresa código al suscribirse
3. Sistema valida: activo, no expirado, usos disponibles, tier aplicable
4. Se aplica descuento al precio
5. Se registra la redención

### Frontend
- Dashboard de promocodes para creadores
- Campo de código en modal de suscripción
- Indicador de descuento aplicado

---

## 3️⃣ Mass DMs (Mensajes Masivos)

### Descripción
Permitir a creadores enviar un mensaje a:
- Todos sus suscriptores
- Suscriptores de un tier específico
- Suscriptores activos/expirados
- Fans que dieron like a posts específicos

### Modelos de Base de Datos

```prisma
model MassDM {
  id           String       @id @default(uuid())
  creatorId    String
  content      String
  type         String       @default("TEXT") // TEXT, IMAGE, VIDEO
  mediaUrl     String?
  targetType   MassDMTarget // ALL_SUBSCRIBERS, TIER, EXPIRED, CUSTOM
  targetTierId String?      // Si targetType = TIER
  targetUserIds String[]    // Si targetType = CUSTOM
  scheduledFor DateTime?    // null = enviar ahora
  sentAt       DateTime?
  totalRecipients Int       @default(0)
  successCount Int          @default(0)
  failedCount  Int          @default(0)
  status       MassDMStatus @default(PENDING)
  createdAt    DateTime     @default(now())
  
  creator      Creator      @relation(fields: [creatorId], references: [id], onDelete: Cascade)
  
  @@index([creatorId, status])
  @@index([scheduledFor])
}

enum MassDMTarget {
  ALL_SUBSCRIBERS
  TIER_SPECIFIC
  EXPIRED_SUBSCRIBERS
  NEW_SUBSCRIBERS_7D
  CUSTOM_LIST
}

enum MassDMStatus {
  PENDING
  SCHEDULED
  PROCESSING
  COMPLETED
  FAILED
  CANCELLED
}
```

### Endpoints API

```
POST   /api/creator/mass-dm              - Crear/enviar mass DM
GET    /api/creator/mass-dm              - Historial de mass DMs
GET    /api/creator/mass-dm/:id          - Detalle y estadísticas
DELETE /api/creator/mass-dm/:id          - Cancelar (si está programado)
POST   /api/creator/mass-dm/:id/retry    - Reintentar fallidos
```

### Background Job

```typescript
// Job que procesa mass DMs programados
async function processMassDM(massDmId: string) {
  const massDM = await prisma.massDM.findUnique({ ... })
  const recipients = await getRecipients(massDM.targetType, massDM.creatorId)
  
  for (const userId of recipients) {
    try {
      // Crear o obtener conversación
      // Enviar mensaje
      // Actualizar contadores
    } catch (error) {
      // Registrar fallo
    }
  }
}
```

### Límites y Rate Limiting
- Máximo 1 mass DM por hora
- Máximo 5 mass DMs por día
- Throttling de 10 mensajes por segundo

### Frontend
- Modal de composición de mass DM
- Selector de audiencia con preview de cantidad
- Historial de mass DMs enviados
- Programar para fecha/hora específica

---

## 4️⃣ Watermarking Automático

### Descripción
Agregar marca de agua automática a imágenes y videos subidos:
- Texto personalizable (username, logo)
- Posición configurable
- Opacidad ajustable
- Toggle on/off por contenido

### Dependencias Técnicas

```bash
npm install sharp      # Para imágenes
npm install fluent-ffmpeg # Para videos (opcional)
```

### Configuración por Creador

```prisma
// Agregar a modelo Creator
model Creator {
  // ... campos existentes
  
  watermarkEnabled    Boolean @default(true)
  watermarkText       String? // null = usar username
  watermarkPosition   String  @default("bottom-right") // top-left, top-right, bottom-left, bottom-right, center
  watermarkOpacity    Float   @default(0.5) // 0.0 - 1.0
  watermarkFontSize   Int     @default(24)
  watermarkColor      String  @default("#ffffff")
}
```

### Servicio de Watermarking

```typescript
// src/services/watermarkService.ts
import sharp from 'sharp'

interface WatermarkOptions {
  text: string
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
  opacity: number
  fontSize: number
  color: string
}

export async function addWatermark(
  inputBuffer: Buffer,
  options: WatermarkOptions
): Promise<Buffer> {
  const image = sharp(inputBuffer)
  const metadata = await image.metadata()
  
  // Crear SVG con texto
  const svgText = `
    <svg width="${metadata.width}" height="${metadata.height}">
      <style>
        .watermark { 
          fill: ${options.color}; 
          font-size: ${options.fontSize}px;
          opacity: ${options.opacity};
          font-family: Arial, sans-serif;
        }
      </style>
      <text x="..." y="..." class="watermark">${options.text}</text>
    </svg>
  `
  
  return image
    .composite([{ input: Buffer.from(svgText), top: 0, left: 0 }])
    .toBuffer()
}
```

### Integración con Upload

```typescript
// En upload route, después de validar imagen
if (creator.watermarkEnabled) {
  const watermarkedBuffer = await addWatermark(buffer, {
    text: creator.watermarkText || `@${creator.user.username}`,
    position: creator.watermarkPosition,
    opacity: creator.watermarkOpacity,
    fontSize: creator.watermarkFontSize,
    color: creator.watermarkColor
  })
  // Subir watermarkedBuffer en lugar de buffer original
}
```

### Frontend
- Configuración de watermark en /creator/settings
- Preview en tiempo real
- Toggle por post individual

---

## 5️⃣ Verificación de Edad (KYC)

### Descripción
Sistema de verificación de identidad para:
- Creadores: Obligatorio antes de publicar contenido adulto
- Fans: Opcional, pero requerido para ver contenido +18

### Opciones de Proveedor KYC

| Proveedor | Precio | Características |
|-----------|--------|-----------------|
| Stripe Identity | $1.50/verificación | Integrado con Stripe |
| Jumio | Enterprise | Muy completo |
| Onfido | $2/verificación | Popular |
| Veriff | $2/verificación | Buena UX |
| Sumsub | Custom | LATAM friendly |

### Modelos de Base de Datos

```prisma
model AgeVerification {
  id              String               @id @default(uuid())
  userId          String               @unique
  status          VerificationStatus   @default(PENDING)
  provider        String               // stripe, manual, etc.
  providerSessionId String?
  documentType    String?              // passport, id_card, drivers_license
  documentCountry String?
  verifiedAge     Int?                 // Edad verificada
  verifiedAt      DateTime?
  expiresAt       DateTime?            // Algunas verificaciones expiran
  rejectionReason String?
  attempts        Int                  @default(0)
  createdAt       DateTime             @default(now())
  updatedAt       DateTime             @updatedAt
  
  user            User                 @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([status])
}

enum VerificationStatus {
  PENDING
  PROCESSING
  VERIFIED
  REJECTED
  EXPIRED
}

// Agregar a User
model User {
  // ... campos existentes
  isAgeVerified   Boolean  @default(false)
  ageVerification AgeVerification?
}

// Agregar a Creator
model Creator {
  // ... campos existentes
  requiresAgeVerification Boolean @default(false)
  isAdultContent          Boolean @default(false)
}
```

### Endpoints API

```
POST   /api/verification/start         - Iniciar verificación
GET    /api/verification/status        - Estado de verificación
POST   /api/verification/webhook       - Webhook del proveedor
GET    /api/verification/session       - Obtener URL de sesión (redirect a proveedor)
```

### Flujo de Verificación

```
1. Usuario intenta ver contenido adulto
   └─> Popup: "Este contenido requiere verificación de edad"

2. Usuario hace clic en "Verificar mi edad"
   └─> POST /api/verification/start
   └─> Redirect a proveedor KYC (Stripe Identity)

3. Usuario completa verificación en proveedor
   └─> Proveedor envía webhook
   └─> POST /api/verification/webhook

4. Si aprobado:
   └─> user.isAgeVerified = true
   └─> Usuario puede ver contenido adulto

5. Si rechazado:
   └─> Mostrar razón
   └─> Permitir reintento (máx 3)
```

### Frontend
- Modal de verificación con explicación
- Indicador de estado en perfil
- Badge "Verificado" para creadores
- Bloqueo de contenido adulto para no verificados

---

## 6️⃣ Referral Programs

### Descripción
Sistema de referidos para:
- **Fans → Fans**: Gana puntos/créditos por referir nuevos usuarios
- **Fans → Creadores**: Gana % de las suscripciones de referidos
- **Creadores → Creadores**: Gana % de ganancias del creador referido

### Modelos de Base de Datos

```prisma
model ReferralCode {
  id          String   @id @default(uuid())
  userId      String   @unique
  code        String   @unique // Código único (ej: MARIA2024)
  totalClicks Int      @default(0)
  totalSignups Int     @default(0)
  totalEarnings Float  @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  referrals   Referral[]
}

model Referral {
  id              String        @id @default(uuid())
  referralCodeId  String
  referredUserId  String        @unique // Usuario que fue referido
  status          ReferralStatus @default(PENDING)
  rewardType      String        // points, credit, commission
  rewardAmount    Float         @default(0)
  rewardPaid      Boolean       @default(false)
  paidAt          DateTime?
  createdAt       DateTime      @default(now())
  
  referralCode    ReferralCode  @relation(fields: [referralCodeId], references: [id])
  referredUser    User          @relation(fields: [referredUserId], references: [id])
  
  @@index([referralCodeId])
}

model ReferralEarning {
  id              String   @id @default(uuid())
  referralId      String
  sourceType      String   // subscription, tip, ppv
  sourceId        String   // ID de la transacción origen
  amount          Float    // Monto ganado por el referidor
  isPaid          Boolean  @default(false)
  createdAt       DateTime @default(now())
  
  @@index([referralId])
}

enum ReferralStatus {
  PENDING     // Usuario registrado pero no activo
  ACTIVE      // Usuario hizo primera compra
  QUALIFIED   // Usuario cumplió requisitos para recompensa
  COMPLETED   // Recompensa pagada
}
```

### Configuración de Programa

```typescript
const REFERRAL_CONFIG = {
  // Fan refiere Fan
  fanToFan: {
    referrerReward: 100, // Puntos
    referredReward: 50,  // Puntos de bienvenida
    requiresFirstPurchase: false
  },
  
  // Fan refiere Creador
  fanToCreator: {
    commissionPercent: 5, // 5% de ganancias del creador por 6 meses
    durationMonths: 6,
    requiresFirstEarning: true
  },
  
  // Creador refiere Creador
  creatorToCreator: {
    commissionPercent: 3, // 3% por 12 meses
    durationMonths: 12,
    minEarningsForPayout: 10000 // CLP mínimo
  }
}
```

### Endpoints API

```
GET    /api/referral/my-code           - Obtener mi código de referido
POST   /api/referral/generate-code     - Generar código personalizado
GET    /api/referral/stats             - Estadísticas de referidos
GET    /api/referral/earnings          - Historial de ganancias
POST   /api/referral/track/:code       - Registrar click (landing)
POST   /api/auth/register?ref=CODE     - Registro con código de referido
```

### Frontend
- Dashboard de referidos con estadísticas
- Código copiable y link compartible
- Historial de referidos y ganancias
- Banner de bienvenida para usuarios referidos

---

## 7️⃣ Import from OnlyFans

### Descripción
Permitir a creadores importar su contenido desde OnlyFans:
- Posts con imágenes/videos
- Descripciones y fechas
- Estadísticas básicas (opcional)

### Métodos de Importación

#### Opción A: Export Manual (Más Simple)
1. Creador descarga sus datos desde OF Settings
2. Sube archivo ZIP a Apapacho
3. Sistema procesa y crea posts

#### Opción B: Scraping Autorizado (Más Complejo)
1. Creador proporciona cookies de sesión
2. Sistema hace requests autenticados
3. Descarga y re-sube contenido

### Modelos de Base de Datos

```prisma
model ContentImport {
  id              String       @id @default(uuid())
  creatorId       String
  source          ImportSource // ONLYFANS, ARSMATE, FANSLY, etc.
  status          ImportStatus @default(PENDING)
  totalItems      Int          @default(0)
  processedItems  Int          @default(0)
  successItems    Int          @default(0)
  failedItems     Int          @default(0)
  errorLog        Json?        // Array de errores
  startedAt       DateTime?
  completedAt     DateTime?
  createdAt       DateTime     @default(now())
  
  creator         Creator      @relation(fields: [creatorId], references: [id], onDelete: Cascade)
  items           ImportItem[]
  
  @@index([creatorId])
}

model ImportItem {
  id              String   @id @default(uuid())
  importId        String
  externalId      String?  // ID en la plataforma origen
  type            String   // post, image, video
  originalUrl     String?
  localPath       String?  // Path después de importar
  status          String   @default("pending") // pending, processing, success, failed
  errorMessage    String?
  metadata        Json?    // Título, descripción, fecha original, etc.
  createdAt       DateTime @default(now())
  
  import          ContentImport @relation(fields: [importId], references: [id], onDelete: Cascade)
  
  @@index([importId])
}

enum ImportSource {
  ONLYFANS
  ARSMATE
  FANSLY
  PATREON
  MANUAL_ZIP
}

enum ImportStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  CANCELLED
}
```

### Estructura de ZIP Esperada (OnlyFans Export)

```
onlyfans_export/
├── posts/
│   ├── post_12345/
│   │   ├── metadata.json
│   │   ├── image1.jpg
│   │   └── video1.mp4
│   └── post_12346/
│       └── ...
├── messages/
│   └── ...
└── profile/
    ├── avatar.jpg
    └── bio.txt
```

### Servicio de Importación

```typescript
// src/services/importService.ts
export async function processOnlyFansImport(
  creatorId: string,
  zipPath: string
): Promise<void> {
  const import = await prisma.contentImport.create({
    data: { creatorId, source: 'ONLYFANS', status: 'PROCESSING' }
  })
  
  try {
    // 1. Extraer ZIP
    const extractPath = await extractZip(zipPath)
    
    // 2. Parsear estructura
    const posts = await parseOnlyFansExport(extractPath)
    
    await prisma.contentImport.update({
      where: { id: import.id },
      data: { totalItems: posts.length }
    })
    
    // 3. Procesar cada post
    for (const post of posts) {
      try {
        // Subir media a Cloudinary
        const mediaUrls = await uploadMedia(post.files)
        
        // Crear post en Apapacho
        await prisma.post.create({
          data: {
            creatorId,
            title: post.metadata.title,
            description: post.metadata.description,
            content: mediaUrls[0], // Primera imagen/video
            visibility: 'subscribers', // Por defecto para suscriptores
            createdAt: new Date(post.metadata.originalDate)
          }
        })
        
        // Actualizar progreso
        await prisma.contentImport.update({
          where: { id: import.id },
          data: { 
            processedItems: { increment: 1 },
            successItems: { increment: 1 }
          }
        })
      } catch (error) {
        // Registrar error pero continuar
        await prisma.importItem.update({
          where: { id: item.id },
          data: { status: 'failed', errorMessage: error.message }
        })
      }
    }
    
    await prisma.contentImport.update({
      where: { id: import.id },
      data: { status: 'COMPLETED', completedAt: new Date() }
    })
    
  } catch (error) {
    await prisma.contentImport.update({
      where: { id: import.id },
      data: { status: 'FAILED', errorLog: { message: error.message } }
    })
  }
}
```

### Endpoints API

```
POST   /api/import/upload            - Subir ZIP de exportación
GET    /api/import/status/:id        - Estado de importación
GET    /api/import/history           - Historial de importaciones
DELETE /api/import/:id               - Cancelar importación en progreso
POST   /api/import/:id/retry         - Reintentar items fallidos
```

### Frontend
- Página /creator/import con instrucciones paso a paso
- Drag & drop para subir ZIP
- Barra de progreso en tiempo real
- Listado de items importados/fallidos

---

## 8️⃣ Import from Arsmate

### Descripción
Similar a OnlyFans pero adaptado a la estructura de Arsmate.

### Diferencias con OnlyFans

| Aspecto | OnlyFans | Arsmate |
|---------|----------|---------|
| Export | Settings → Privacy → Request data | Similar |
| Formato | ZIP con estructura conocida | Por determinar |
| Media | Imágenes y videos | Imágenes y videos |

### Implementación

Reutilizar la infraestructura de importación con un parser específico:

```typescript
// src/services/parsers/arsmateParser.ts
export async function parseArsmateExport(extractPath: string) {
  // Estructura específica de Arsmate
  // Mapear a formato común de ImportItem
}
```

---

## 🗓️ Cronograma de Implementación

### Semana 1: Fundamentos
- [ ] Block Lists (2 días)
- [ ] Promocodes - Backend (2 días)
- [ ] Promocodes - Frontend (1 día)

### Semana 2: Comunicación
- [ ] Mass DMs - Backend (2 días)
- [ ] Mass DMs - Frontend y Jobs (2 días)
- [ ] Testing y fixes (1 día)

### Semana 3: Media
- [ ] Watermarking - Servicio (2 días)
- [ ] Watermarking - Integración Upload (1 día)
- [ ] Watermarking - Configuración Frontend (2 días)

### Semana 4: Verificación
- [ ] Verificación de Edad - Integración Stripe Identity (3 días)
- [ ] Verificación de Edad - Frontend y flujos (2 días)

### Semana 5: Crecimiento
- [ ] Referral Programs - Backend (3 días)
- [ ] Referral Programs - Frontend (2 días)

### Semana 6: Importación
- [ ] Import Infrastructure (2 días)
- [ ] OnlyFans Parser (2 días)
- [ ] Arsmate Parser (1 día)

---

## 🔧 Dependencias Técnicas

```bash
# Backend
npm install sharp          # Watermarking de imágenes
npm install adm-zip        # Procesamiento de ZIPs
npm install bull           # Cola de trabajos para imports/mass DMs
npm install @stripe/stripe-js # Stripe Identity (verificación)

# Frontend
npm install react-dropzone # Upload de archivos
npm install recharts       # Gráficos para analytics de referidos
```

---

## ✅ Checklist de Lanzamiento

Para cada funcionalidad:
- [ ] Modelos de base de datos migrados
- [ ] Endpoints API implementados y documentados
- [ ] Tests unitarios y de integración
- [ ] Frontend implementado
- [ ] Responsive/mobile verificado
- [ ] Rate limiting configurado
- [ ] Logs y monitoreo
- [ ] Documentación actualizada

---

## 🚦 ¿Por Dónde Empezamos?

Recomiendo empezar por **Block Lists** porque:
1. Es la más simple
2. Mejora seguridad inmediatamente
3. Establece patrones para las demás

¿Procedemos con Block Lists?
