'use client'

import { useFontContext } from '@/contexts/FontContext'

interface FontOption {
  value: string
  label: string
  description: string
}

const FONT_OPTIONS: FontOption[] = [
  { value: 'Inter', label: 'Inter', description: 'Moderna y limpia' },
  { value: 'Roboto', label: 'Roboto', description: 'Versátil y legible' },
  { value: 'Open Sans', label: 'Open Sans', description: 'Amigable y profesional' },
  { value: 'Lato', label: 'Lato', description: 'Cálida y elegante' },
  { value: 'Poppins', label: 'Poppins', description: 'Geométrica y moderna' },
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

  const getFontClass = (fontName: string) => {
    const fontMap: Record<string, string> = {
      'Inter': 'font-[Inter,sans-serif]',
      'Roboto': 'font-[Roboto,sans-serif]',
      'Open Sans': 'font-[\'Open_Sans\',sans-serif]',
      'Lato': 'font-[Lato,sans-serif]',
      'Poppins': 'font-[Poppins,sans-serif]',
    }
    return fontMap[fontName] || 'font-sans'
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {FONT_OPTIONS.map((font) => {
          const isSelected = currentFont === font.value
          const fontClass = getFontClass(font.value)

          return (
            <button
              key={font.value}
              type="button"
              onClick={() => handleSelect(font.value)}
              disabled={disabled}
              className={`
                relative p-6 rounded-xl border-2 transition-all text-left w-full
                ${isSelected
                  ? 'border-fuchsia-500 bg-fuchsia-500/10 shadow-lg shadow-fuchsia-500/20'
                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-start gap-4">
                {/* Radio indicator */}
                <div className="flex-shrink-0 mt-1">
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

                {/* Font info and preview */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-white">
                      {font.label}
                    </h3>
                    <span className="text-sm text-white/50">
                      {font.description}
                    </span>
                  </div>

                  {/* Font preview with inline style */}
                  <div className="space-y-2">
                    <p
                      className="text-2xl text-white leading-tight"
                      style={{ fontFamily: font.value }}
                    >
                      The quick brown fox
                    </p>
                    <p
                      className="text-base text-white/70"
                      style={{ fontFamily: font.value }}
                    >
                      jumps over the lazy dog
                    </p>
                    <p
                      className="text-sm text-white/50"
                      style={{ fontFamily: font.value }}
                    >
                      ABCDEFGHIJKLMNOPQRSTUVWXYZ
                    </p>
                    <p
                      className="text-sm text-white/50"
                      style={{ fontFamily: font.value }}
                    >
                      0123456789
                    </p>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
        <p className="text-sm text-blue-200">
          💡 <strong>Tip:</strong> Los cambios se aplican instantáneamente en todo el sitio. Haz clic en "Guardar" para mantener tu selección.
        </p>
      </div>
    </div>
  )
}
