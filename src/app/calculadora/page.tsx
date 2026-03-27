'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button, Card } from '@/components/ui';
import Link from 'next/link';
import { Calculator, ArrowRight, TrendingUp, DollarSign, Repeat, Banknote } from 'lucide-react';

const APAPACHO_COMMISSION = 0.10;
const ONLYFANS_COMMISSION = 0.20;
const USD_CLP_SPREAD = 0.03; // ~3% pérdida por conversión USD/CLP

function formatCLP(amount: number): string {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);
}

export default function CalculadoraPage() {
  const [monthlyIncome, setMonthlyIncome] = useState(500000);

  const ofNet = monthlyIncome * (1 - ONLYFANS_COMMISSION) * (1 - USD_CLP_SPREAD);
  const apNet = monthlyIncome * (1 - APAPACHO_COMMISSION);
  const monthlyDiff = apNet - ofNet;
  const yearlyDiff = monthlyDiff * 12;

  const sliderSteps = [100000, 200000, 300000, 500000, 750000, 1000000, 1500000, 2000000, 3000000, 5000000];

  return (
    <div className="min-h-screen bg-[#0f0f14]">
      <Navbar />

      <main className="pt-24 pb-16">
        {/* Hero */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="text-center mb-12">
            <Calculator className="w-16 h-16 text-fuchsia-400 mx-auto mb-4" />
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Calculadora de <span className="gradient-text">ingresos</span>
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Descubre cuánto más ganarías en Apapacho vs OnlyFans.
              Sin conversión de moneda, sin comisiones ocultas.
            </p>
          </div>

          {/* Calculator */}
          <Card variant="solid" className="p-8 md:p-12 border-2 border-white/10">
            <label className="block text-lg font-semibold text-white mb-4">
              ¿Cuánto ganas al mes? (CLP)
            </label>

            <div className="mb-6">
              <input
                type="range"
                min={100000}
                max={5000000}
                step={50000}
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-fuchsia-500 bg-white/10"
              />
              <div className="flex justify-between text-sm text-white/40 mt-2">
                <span>$100k</span>
                <span>$5M</span>
              </div>
            </div>

            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val >= 0 && val <= 50000000) setMonthlyIncome(val);
                  }}
                  className="w-64 pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white text-xl text-center font-bold focus:outline-none focus:border-fuchsia-500"
                />
              </div>
            </div>

            {/* Comparison */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* OnlyFans */}
              <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                <h3 className="text-lg font-bold text-white/60 mb-4">OnlyFans</h3>
                <div className="space-y-3 text-white/70">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>Ingreso bruto:</span>
                    <span className="font-semibold text-white">{formatCLP(monthlyIncome)}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>Comisión OF (20%):</span>
                    <span className="text-red-400">- {formatCLP(monthlyIncome * ONLYFANS_COMMISSION)}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>Conversión USD/CLP (~3%):</span>
                    <span className="text-red-400">- {formatCLP(monthlyIncome * (1 - ONLYFANS_COMMISSION) * USD_CLP_SPREAD)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2">
                    <span>Recibes:</span>
                    <span className="text-white">{formatCLP(ofNet)}</span>
                  </div>
                </div>
              </div>

              {/* Apapacho */}
              <div className="p-6 bg-fuchsia-500/10 rounded-xl border-2 border-fuchsia-500/30">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-bold text-fuchsia-300">Apapacho</h3>
                  <span className="text-xs bg-fuchsia-500/30 text-fuchsia-300 px-2 py-0.5 rounded-full font-medium">Recomendado</span>
                </div>
                <div className="space-y-3 text-white/70">
                  <div className="flex justify-between border-b border-fuchsia-500/10 pb-2">
                    <span>Ingreso bruto:</span>
                    <span className="font-semibold text-white">{formatCLP(monthlyIncome)}</span>
                  </div>
                  <div className="flex justify-between border-b border-fuchsia-500/10 pb-2">
                    <span>Comisión Apapacho (10%):</span>
                    <span className="text-red-400">- {formatCLP(monthlyIncome * APAPACHO_COMMISSION)}</span>
                  </div>
                  <div className="flex justify-between border-b border-fuchsia-500/10 pb-2">
                    <span>Conversión de moneda:</span>
                    <span className="text-green-400">$0 (pagas en CLP)</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2">
                    <span>Recibes:</span>
                    <span className="text-green-400">{formatCLP(apNet)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Savings highlight */}
            <div className="p-6 bg-gradient-to-r from-fuchsia-500/15 to-purple-500/15 border-2 border-fuchsia-500/30 rounded-xl text-center">
              <p className="text-white/70 mb-2">Con Apapacho ganarías</p>
              <div className="text-4xl md:text-5xl font-bold text-green-400 mb-2">
                +{formatCLP(monthlyDiff)}/mes
              </div>
              <p className="text-2xl font-semibold text-fuchsia-300">
                +{formatCLP(yearlyDiff)} al año
              </p>
            </div>
          </Card>
        </div>

        {/* Why more */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            ¿Por qué ganas más en Apapacho?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card variant="solid" className="p-6 text-center">
              <TrendingUp className="w-12 h-12 text-fuchsia-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Menor comisión</h3>
              <p className="text-white/60">10% vs 20% de OnlyFans. La mitad de comisión es el doble de ahorro.</p>
            </Card>
            <Card variant="solid" className="p-6 text-center">
              <Banknote className="w-12 h-12 text-fuchsia-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Pago en pesos chilenos</h3>
              <p className="text-white/60">Sin conversión USD a CLP. Recibes directamente en tu cuenta bancaria chilena.</p>
            </Card>
            <Card variant="solid" className="p-6 text-center">
              <Repeat className="w-12 h-12 text-fuchsia-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Pagos semanales</h3>
              <p className="text-white/60">Recibe tu dinero cada semana, no cada mes como en otras plataformas.</p>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card variant="solid" className="p-12 text-center bg-gradient-to-br from-fuchsia-500/10 to-purple-500/10 border-2 border-fuchsia-500/30">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Empieza a ganar más hoy
            </h2>
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Crear tu cuenta es gratis. Solo pagas comisión cuando ganas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700">
                  Crear cuenta gratis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline">
                  Ver tarifas detalladas
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
