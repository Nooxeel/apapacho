'use client'

import type { PaymentGateway } from '@/hooks/usePayment'
import { CreditCard, Wallet, ArrowRightLeft } from 'lucide-react'

interface GatewaySelectorProps {
  selected: PaymentGateway
  onChange: (gateway: PaymentGateway) => void
}

// Flag controlado por env: Flow solo es visible cuando el operador activa
// NEXT_PUBLIC_FLOW_ENABLED=true (default hidden — espera credenciales de prod).
const flowEnabled = process.env.NEXT_PUBLIC_FLOW_ENABLED === 'true'

const BASE_GATEWAYS: { id: PaymentGateway; label: string; description: string; icon: typeof CreditCard }[] = [
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

const FLOW_GATEWAY: { id: PaymentGateway; label: string; description: string; icon: typeof CreditCard } = {
  id: 'flow',
  label: 'Flow',
  description: 'Pago en línea vía Flow',
  // ArrowRightLeft evoca el concepto de transferencia/pasarela de pago
  icon: ArrowRightLeft,
}

export function GatewaySelector({ selected, onChange }: GatewaySelectorProps) {
  // Flow se añade a la lista solo cuando el flag está activo en el entorno
  const gateways = flowEnabled ? [...BASE_GATEWAYS, FLOW_GATEWAY] : BASE_GATEWAYS

  // El grid usa 2 columnas: con 2 proveedores llena las dos celdas;
  // con 3 (Flow activo) la tercera celda ocupa la mitad izquierda del segundo renglón.
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
