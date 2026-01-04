'use client'

import { useState } from 'react'

interface FontOption {
  value: string
  label: string
  className: string
}

const FONT_OPTIONS: FontOption[] = [
  { value: 'Inter', label: 'Inter', className: 'font-inter' },
  { value: 'Roboto', label: 'Roboto', className: 'font-roboto' },
  { value: 'Open Sans', label: 'Open Sans', className: 'font-open-sans' },
  { value: 'Lato', label: 'Lato', className: 'font-lato' },
  { value: 'Poppins', label: 'Poppins', className: 'font-poppins' },
]

interface FontSelectorProps {
  value: string
  onChange: (font: string) => void
  disabled?: boolean
}

export default function FontSelector({ value, onChange, disabled }: FontSelectorProps) {
  const [selectedFont, setSelectedFont] = useState(value)

  const handleSelect = (fontValue: string) => {
    setSelectedFont(fontValue)
    onChange(fontValue)
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FONT_OPTIONS.map((font) => (
          <button
            key={font.value}
            type="button"
            onClick={() => handleSelect(font.value)}
            disabled={disabled}
            className={`
              relative p-4 rounded-lg border-2 transition-all text-left
              ${selectedFont === font.value
                ? 'border-fuchsia-500 bg-fuchsia-500/10'
                : 'border-white/10 bg-white/5 hover:border-white/20'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {/* Radio indicator */}
            <div className="absolute top-3 right-3">
              <div className={`
                w-5 h-5 rounded-full border-2 flex items-center justify-center
                ${selectedFont === font.value
                  ? 'border-fuchsia-500 bg-fuchsia-500'
                  : 'border-white/30'
                }
              `}>
                {selectedFont === font.value && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
            </div>

            {/* Font name */}
            <div className="text-sm text-white/50 mb-2">{font.label}</div>

            {/* Font preview */}
            <div className={`${font.className} text-white text-lg`}>
              The quick brown fox
            </div>
            <div className={`${font.className} text-white/70 text-sm mt-1`}>
              jumps over the lazy dog
            </div>
          </button>
        ))}
      </div>

      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-xs text-blue-200">
          💡 <strong>Tip:</strong> Esta fuente se aplicará en todo el sitio cuando inicies sesión.
        </p>
      </div>
    </div>
  )
}
