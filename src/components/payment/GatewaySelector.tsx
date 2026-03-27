'use client'

import type { PaymentGateway } from '@/hooks/usePayment'
import { CreditCard, Building2, Wallet } from 'lucide-react'

interface GatewaySelectorProps {
  selected: PaymentGateway
  onChange: (gateway: PaymentGateway) => void
}

const gateways: { id: PaymentGateway; label: string; description: string; icon: typeof CreditCard }[] = [
  {
    id: 'webpay',
    label: 'Webpay',
    description: 'Tarjeta débito o crédito',
    icon: CreditCard,
  },
  {
    id: 'mercadopago',
    label: 'MercadoPago',
    description: 'MercadoPago, tarjeta o transferencia',
    icon: Wallet,
  },
]

export function GatewaySelector({ selected, onChange }: GatewaySelectorProps) {
  return (
    <div className="space-y-2 mb-4">
      <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Método de pago</p>
      <div className="grid grid-cols-2 gap-2">
        {gateways.map((gw) => {
          const isSelected = selected === gw.id
          const Icon = gw.icon
          return (
            <button
              key={gw.id}
              type="button"
              onClick={() => onChange(gw.id)}
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-fuchsia-500 bg-fuchsia-500/10'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isSelected ? 'text-fuchsia-400' : 'text-white/40'}`} />
              <div className="min-w-0">
                <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-white/70'}`}>
                  {gw.label}
                </p>
                <p className="text-[11px] text-white/40 truncate">{gw.description}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
