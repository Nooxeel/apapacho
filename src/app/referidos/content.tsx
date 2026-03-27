'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button, Card } from '@/components/ui';
import Link from 'next/link';
import { ArrowRight, Share2, UserPlus, Coins, Gift, TrendingUp, Users } from 'lucide-react';

const COMMISSION_RATE = 5;
const COMMISSION_DAYS = 90;

const examples = [
  { referrals: 5, avgIncome: 300000, label: '5 creadoras' },
  { referrals: 10, avgIncome: 500000, label: '10 creadoras' },
  { referrals: 25, avgIncome: 500000, label: '25 creadoras' },
];

function formatCLP(amount: number): string {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);
}

export function ReferidosContent() {
  return (
    <div className="min-h-screen bg-[#0f0f14]">
      <Navbar />

      <main className="pt-24 pb-16">
        {/* Hero */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="text-center mb-12">
            <Gift className="w-16 h-16 text-fuchsia-400 mx-auto mb-4" />
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Gana dinero <span className="gradient-text">invitando creadores</span>
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto mb-8">
              Comparte tu link, refiere creadoras a Apapacho y gana {COMMISSION_RATE}% de comisión
              sobre las ganancias de la plataforma por {COMMISSION_DAYS} días. Sin límite.
            </p>
            <Link href="/login">
              <Button size="lg" className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700">
                Obtener mi link de referido
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* How it works */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            ¿Cómo funciona?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-fuchsia-500/10 border-2 border-fuchsia-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Share2 className="w-10 h-10 text-fuchsia-400" />
              </div>
              <div className="text-sm font-bold text-fuchsia-400 mb-2">Paso 1</div>
              <h3 className="text-xl font-bold text-white mb-2">Comparte tu link</h3>
              <p className="text-white/60">
                Obtén tu link único de referido desde tu panel y compártelo en redes sociales, grupos o por mensaje directo.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-fuchsia-500/10 border-2 border-fuchsia-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <UserPlus className="w-10 h-10 text-fuchsia-400" />
              </div>
              <div className="text-sm font-bold text-fuchsia-400 mb-2">Paso 2</div>
              <h3 className="text-xl font-bold text-white mb-2">Tu amiga se registra</h3>
              <p className="text-white/60">
                Cuando alguien se registra usando tu link, queda vinculado a tu cuenta automáticamente.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-fuchsia-500/10 border-2 border-fuchsia-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Coins className="w-10 h-10 text-fuchsia-400" />
              </div>
              <div className="text-sm font-bold text-fuchsia-400 mb-2">Paso 3</div>
              <h3 className="text-xl font-bold text-white mb-2">Ganas comisión</h3>
              <p className="text-white/60">
                Recibes {COMMISSION_RATE}% de la comisión de plataforma que genere cada creadora referida, durante {COMMISSION_DAYS} días.
              </p>
            </div>
          </div>
        </div>

        {/* Earnings examples */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            ¿Cuánto puedes ganar?
          </h2>
          <p className="text-center text-white/60 mb-12">
            Comisión del {COMMISSION_RATE}% sobre la comisión de plataforma (10%) durante {COMMISSION_DAYS} días
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {examples.map((ex, i) => {
              const platformFee = ex.avgIncome * 0.10; // 10% platform commission
              const referralEarning = platformFee * (COMMISSION_RATE / 100); // 5% of platform fee
              const totalMonthly = referralEarning * ex.referrals;
              const total90days = totalMonthly * 3;
              return (
                <Card key={i} variant="solid" className={`p-6 ${i === 1 ? 'border-2 border-fuchsia-500/30' : ''}`}>
                  {i === 1 && (
                    <div className="text-xs font-bold text-fuchsia-400 mb-3 text-center">MAS POPULAR</div>
                  )}
                  <div className="text-center mb-6">
                    <Users className="w-10 h-10 text-fuchsia-400 mx-auto mb-2" />
                    <h3 className="text-xl font-bold text-white">{ex.label}</h3>
                    <p className="text-sm text-white/50">ganando {formatCLP(ex.avgIncome)}/mes c/u</p>
                  </div>
                  <div className="space-y-3 text-white/70">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span>Comisión plataforma:</span>
                      <span className="text-white/80">{formatCLP(ex.avgIncome * 0.10)}/mes c/u</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span>Tu {COMMISSION_RATE}%:</span>
                      <span className="text-white/80">{formatCLP(referralEarning)}/mes c/u</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2">
                      <span>Ganas/mes:</span>
                      <span className="text-green-400">{formatCLP(totalMonthly)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>En {COMMISSION_DAYS} días:</span>
                      <span className="text-fuchsia-300">{formatCLP(total90days)}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Benefits */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Beneficios del programa
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card variant="solid" className="p-6">
              <TrendingUp className="w-10 h-10 text-fuchsia-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Sin límite de referidos</h3>
              <p className="text-white/60">Puedes referir a cuantas personas quieras. No hay tope de ganancias por referidos.</p>
            </Card>
            <Card variant="solid" className="p-6">
              <Coins className="w-10 h-10 text-fuchsia-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Comisión automática</h3>
              <p className="text-white/60">Las comisiones se calculan y acumulan automáticamente. Las ves en tu dashboard en tiempo real.</p>
            </Card>
            <Card variant="solid" className="p-6">
              <Gift className="w-10 h-10 text-fuchsia-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Todos pueden participar</h3>
              <p className="text-white/60">No necesitas ser creador. Cualquier usuario registrado tiene su link de referido.</p>
            </Card>
            <Card variant="solid" className="p-6">
              <Share2 className="w-10 h-10 text-fuchsia-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Link personalizado</h3>
              <p className="text-white/60">Tu link único de referido que puedes compartir donde quieras. Se puede regenerar en cualquier momento.</p>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card variant="solid" className="p-12 text-center bg-gradient-to-br from-fuchsia-500/10 to-purple-500/10 border-2 border-fuchsia-500/30">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Empieza a referir hoy
            </h2>
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Crea tu cuenta, obtén tu link y empieza a ganar por cada persona que traigas a Apapacho.
            </p>
            <Link href="/login">
              <Button size="lg" className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700">
                Obtener mi link de referido
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
