'use client'

import { useFontContext } from '@/contexts/FontContext'

interface FontOption {
  value: string
  label: string
  description: string
  cssVar: string
}

const FONT_OPTIONS: FontOption[] = [
  { value: 'Inter', label: 'Inter', description: 'Moderna y limpia', cssVar: 'var(--font-inter)' },
  { value: 'Roboto', label: 'Roboto', description: 'Versátil y legible', cssVar: 'var(--font-roboto)' },
  { value: 'Open Sans', label: 'Open Sans', description: 'Amigable y profesional', cssVar: 'var(--font-open-sans)' },
  { value: 'Lato', label: 'Lato', description: 'Cálida y elegante', cssVar: 'var(--font-lato)' },
  { value: 'Poppins', label: 'Poppins', description: 'Geométrica y moderna', cssVar: 'var(--font-poppins)' },
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {FONT_OPTIONS.map((font) => {
          const isSelected = currentFont === font.value

          return (
            <button
              key={font.value}
              type="button"
              onClick={() => handleSelect(font.value)}
              disabled={disabled}
              className={`
                relative p-4 rounded-xl border-2 transition-all text-left
                ${isSelected
                  ? 'border-fuchsia-500 bg-fuchsia-500/10 shadow-lg shadow-fuchsia-500/20'
                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* Radio indicator - positioned top right */}
              <div className="absolute top-3 right-3">
                <div className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                  ${isSelected
                    ? 'border-fuchsia-500 bg-fuchsia-500'
                    : 'border-white/30'
                  }
                `}>
                  {isSelected && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </div>

              {/* Font name and description */}
              <div className="mb-3 pr-8">
                <h3 className="text-sm font-semibold text-white">
                  {font.label}
                </h3>
                <span className="text-xs text-white/50">
                  {font.description}
                </span>
              </div>

              {/* Font preview - using inline style for the actual font */}
              <p
                className="text-2xl text-white/90 leading-tight"
                style={{ fontFamily: `${font.cssVar}, system-ui, sans-serif` }}
              >
                Apapacho
              </p>
              <p
                className="text-sm text-white/60 mt-1"
                style={{ fontFamily: `${font.cssVar}, system-ui, sans-serif` }}
              >
                AaBbCc 123
              </p>
            </button>
          )
        })}
      </div>

      <p className="text-xs text-white/40 text-center">
        💡 Los cambios se aplican instantáneamente. Guarda para mantener tu selección.
      </p>
    </div>
  )
}
