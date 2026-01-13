'use client'

import { useFontContext } from '@/contexts/FontContext'

interface FontOption {
  value: string
  label: string
  description: string
  fontFamily: string  // Actual font-family value for inline styles
}

const FONT_OPTIONS: FontOption[] = [
  { value: 'Tiller', label: 'Tiller', description: 'Elegante y clásica (por defecto)', fontFamily: 'var(--font-tiller), Georgia, serif' },
  { value: 'Inter', label: 'Inter', description: 'Moderna y limpia', fontFamily: 'Inter, system-ui, sans-serif' },
  { value: 'Poppins', label: 'Poppins', description: 'Geométrica y moderna', fontFamily: 'Poppins, system-ui, sans-serif' },
  { value: 'Roboto', label: 'Roboto', description: 'Profesional y versátil', fontFamily: 'Roboto, system-ui, sans-serif' },
  { value: 'Open Sans', label: 'Open Sans', description: 'Amigable y legible', fontFamily: 'Open Sans, system-ui, sans-serif' },
  { value: 'Montserrat', label: 'Montserrat', description: 'Elegante y urbana', fontFamily: 'Montserrat, system-ui, sans-serif' },
]

interface FontSelectorProps {
  value: string
  onChange: (font: string) => void
  disabled?: boolean
}

export default function FontSelector({ value, onChange, disabled }: FontSelectorProps) {
  const { currentFont, setPreviewFont } = useFontContext()

  const handleSelect = (fontValue: string) => {
    setPreviewFont(fontValue)
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
