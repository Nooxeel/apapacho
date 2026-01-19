'use client'

import { useFontContext } from '@/contexts/FontContext'
import { FONT_CSS_VAR_MAP } from '@/lib/fonts'

interface FontOption {
  value: string
  label: string
  description: string
}

const FONT_OPTIONS: FontOption[] = [
  { value: 'Playfair Display', label: 'Playfair Display', description: 'Elegante y clásica (por defecto)' },
  { value: 'Inter', label: 'Inter', description: 'Moderna y limpia' },
  { value: 'Poppins', label: 'Poppins', description: 'Geométrica y moderna' },
  { value: 'Roboto', label: 'Roboto', description: 'Profesional y versátil' },
  { value: 'Open Sans', label: 'Open Sans', description: 'Amigable y legible' },
  { value: 'Montserrat', label: 'Montserrat', description: 'Elegante y urbana' },
]

interface FontSelectorProps {
  value: string
  onChange: (font: string) => void
  disabled?: boolean
}

export default function FontSelector({ value, onChange, disabled }: FontSelectorProps) {
  const { setPreviewFont } = useFontContext()

  const handleSelect = (fontValue: string) => {
    setPreviewFont(fontValue)
    onChange(fontValue)
  }

  // Get font-family from centralized mapping
  const getFontFamily = (fontValue: string): string => {
    return FONT_CSS_VAR_MAP[fontValue] || 'system-ui, sans-serif'
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3">
        {FONT_OPTIONS.map((font) => {
          // Use the value prop to determine selection, not context
          const isSelected = value === font.value

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
            >
              {/* Left side: Font info and description */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-white mb-1">
                  {font.label}
                </h3>
                <p className="text-xs text-white/50 mb-2">
                  {font.description}
                </p>

                {/* Font preview */}
                <p
                  className="text-xl text-white/90 leading-tight mb-1"
                  style={{ fontFamily: getFontFamily(font.value) }}
                >
                  Appapacho
                </p>
                <p
                  className="text-sm text-white/60"
                  style={{ fontFamily: getFontFamily(font.value) }}
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
                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <p className="text-xs text-white/40">
        💡 Los cambios se aplican instantáneamente. Guarda para mantener tu selección.
      </p>
    </div>
  )
}
