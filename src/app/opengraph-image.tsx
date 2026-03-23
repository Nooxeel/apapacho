import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Apapacho - Plataforma de Contenido Adulto'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #0f0f14 0%, #1a0a2e 40%, #2d1b4e 70%, #0f0f14 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              background: 'linear-gradient(90deg, #d946ef, #f59e0b)',
              backgroundClip: 'text',
              color: 'transparent',
              letterSpacing: '-2px',
            }}
          >
            Apapacho
          </div>
          <div
            style={{
              fontSize: 28,
              color: 'rgba(255, 255, 255, 0.7)',
              maxWidth: '600px',
              textAlign: 'center',
              lineHeight: 1.4,
            }}
          >
            Plataforma de Contenido Exclusivo #1 en Chile
          </div>
          <div
            style={{
              display: 'flex',
              gap: '32px',
              marginTop: '16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 20px',
                background: 'rgba(217, 70, 239, 0.2)',
                borderRadius: '24px',
                border: '1px solid rgba(217, 70, 239, 0.3)',
                color: '#d946ef',
                fontSize: 16,
              }}
            >
              Suscripciones
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 20px',
                background: 'rgba(245, 158, 11, 0.2)',
                borderRadius: '24px',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#f59e0b',
                fontSize: 16,
              }}
            >
              Pagos Locales
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 20px',
                background: 'rgba(34, 197, 94, 0.2)',
                borderRadius: '24px',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#22c55e',
                fontSize: 16,
              }}
            >
              Contenido Exclusivo
            </div>
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: 16,
          }}
        >
          appapacho.cl
        </div>
      </div>
    ),
    { ...size }
  )
}
