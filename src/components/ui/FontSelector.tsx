'use client'

import { useFontContext } from '@/contexts/FontContext'

/**
 * Font options - MUST match fonts loaded in layout.tsx
 * Only Inter and Poppins are loaded for performance
 */
interface FontOption {
  value: string
  label: string
  description: string
  /** CSS font-family for inline preview (uses CSS variable) */
  fontFamily: string
}

const FONT_OPTIONS: FontOption[] = [
  { 
    value: 'Inter', 
    label: 'Inter', 
    description: 'Moderna y limpia (por defecto)', 
    fontFamily: 'var(--font-inter), system-ui, sans-serif' 
  },
  { 
    value: 'Poppins', 
    label: 'Poppins', 
    description: 'Geométrica y elegante', 
    fontFamily: 'var(--font-poppins), system-ui, sans-serif' 
  },
]

interface FontSelectorProps {
  value: string
  onChange: (font: string) => void
  disabled?: boolean
}

export default function FontSelector({ value, onChange, disabled }: FontSelectorProps) {
  const { currentFont, setPreviewFont } = useFontContext()

  const handleSelect = (fontValue: string) => {
    // Apply preview immediately (changes body class via FontContext)
    setPreviewFont(fontValue)
    // Notify parent to update profile state
    onChange(fontValue)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3">
        {FONT_OPTIONS.map((font) => {
          const isSelected = currentFont === font.value

          return (
            <button
              key={font.value}
              type="button"
              onClick={() => handleSelect(font.value)}
              disabled={disabled}
              className={`
                relative p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between
                ${isSelected
                  ? 'border-fuchsia-500 bg-fuchsia-500/10 shadow-lg shadow-fuchsia-500/20'
                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              aria-pressed={isSelected}
              aria-label={`Seleccionar fuente ${font.label}`}
            >
              {/* Left side: Font info and description */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-white mb-1">
                  {font.label}
                </h3>
                <p className="text-xs text-white/50 mb-2">
                  {font.description}
                </p>

                {/* Font preview with actual font */}
                <p
                  className="text-xl text-white/90 leading-tight mb-1"
                  style={{ fontFamily: font.fontFamily }}
                >
                  Apapacho
                </p>
                <p
                  className="text-sm text-white/60"
                  style={{ fontFamily: font.fontFamily }}
                >
                  AaBbCc 123
                </p>
              </div>

              {/* Right side: Radio indicator */}
              <div className="ml-4 flex-shrink-0">
                <div className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                  ${isSelected
                    ? 'border-fuchsia-500 bg-fuchsia-500'
                    : 'border-white/30'
                  }
                `}>
                  {isSelected && (
                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <p className="text-xs text-white/40">
        ✨ El cambio se aplica instantáneamente a todo el sitio
      </p>
    </div>
  )
}
