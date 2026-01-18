'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { authApi } from '@/lib/api'
import { Button, Input, Card } from '@/components/ui'
import { useAuthStore } from '@/stores/authStore'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuthStore()
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [referralCode, setReferralCode] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    displayName: '',
    isCreator: true,
    acceptTerms: false
  })

  // Capture referral code from URL (?ref=XXXXX)
  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      setReferralCode(ref.toUpperCase())
      setIsLogin(false) // Switch to register mode if referral code present
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setFieldErrors({})

    // Validar términos en registro
    if (!isLogin && !formData.acceptTerms) {
      setError('Debes aceptar los términos y condiciones para continuar')
      setIsLoading(false)
      return
    }

    try {
      if (isLogin) {
        const result = await authApi.login({
          email: formData.email,
          password: formData.password
        }) as any
        
        localStorage.setItem('apapacho-token', result.token)
        localStorage.setItem('apapacho-user', JSON.stringify(result.user))
        login(result.user, result.token)
        
        if (result.user.isCreator) {
          router.push('/creator/edit')
        } else {
          router.push('/dashboard')
        }
      } else {
        const result = await authApi.register({
          email: formData.email,
          password: formData.password,
          username: formData.username,
          displayName: formData.displayName,
          isCreator: formData.isCreator,
          ...(referralCode ? { referralCode } : {})
        }) as any
        
        localStorage.setItem('apapacho-token', result.token)
        localStorage.setItem('apapacho-user', JSON.stringify(result.user))
        login(result.user, result.token)
        
        if (result.user.isCreator) {
          router.push('/creator/edit')
        } else {
          router.push('/dashboard')
        }
      }
    } catch (err: any) {
      // Manejar errores de validación con detalles
      if (err.message === 'Validation failed' && err.details) {
        const errors: Record<string, string> = {}
        err.details.forEach((detail: any) => {
          const field = detail.path?.[0] || 'general'
          errors[field] = detail.message
        })
        setFieldErrors(errors)
        
        // Mostrar el primer error como mensaje general también
        const firstError = Object.values(errors)[0]
        if (firstError) {
          setError(firstError)
        }
      } else {
        setError(err.message || 'Error en la autenticación')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center px-4 py-8">
      <Card variant="glass" className="w-full max-w-md">
        <div className="p-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
              Apapacho
            </h2>
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-2">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h1>
          <p className="text-gray-400 text-center mb-6">
            {isLogin 
              ? 'Ingresa a tu cuenta de Apapacho' 
              : 'Únete a la comunidad de creadores'}
          </p>

          {/* Referral code indicator */}
          {referralCode && !isLogin && (
            <div className="bg-fuchsia-500/20 border border-fuchsia-500/50 rounded-lg p-3 text-fuchsia-300 text-sm mb-4 text-center">
              🎁 Código de referido aplicado: <strong>{referralCode}</strong>
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              error={fieldErrors.email}
            />

            {!isLogin && (
              <>
                <Input
                  label="Nombre de usuario"
                  placeholder="tunombre"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                  required
                  leftIcon={<span className="text-white/50">@</span>}
                  helperText="Solo letras minúsculas, números y guiones bajos"
                  error={fieldErrors.username}
                />
                <Input
                  label="Nombre para mostrar"
                  placeholder="Tu Nombre"
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  required
                  error={fieldErrors.displayName}
                />
              </>
            )}

            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required
              helperText={!isLogin ? "Mínimo 8 caracteres" : undefined}
              error={fieldErrors.password}
            />

            {isLogin && (
              <div className="text-right -mt-2">
                <Link
                  href="/forgot-password"
                  className="text-sm text-pink-400 hover:text-pink-300 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            )}

            {!isLogin && (
              <>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isCreator}
                    onChange={(e) => setFormData(prev => ({ ...prev, isCreator: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-fuchsia-500 focus:ring-fuchsia-500"
                  />
                  <span className="text-white/80 text-sm">Quiero ser creador de contenido</span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={(e) => setFormData(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                    className="w-4 h-4 mt-0.5 rounded border-gray-600 bg-gray-700 text-fuchsia-500 focus:ring-fuchsia-500"
                    required
                  />
                  <span className="text-white/80 text-sm">
                    He leído y acepto los{' '}
                    <Link 
                      href="/terminos" 
                      target="_blank"
                      className="text-fuchsia-400 hover:text-fuchsia-300 underline"
                    >
                      Términos y Condiciones
                    </Link>
                    {' '}y confirmo que soy mayor de 18 años
                  </span>
                </label>
              </>
            )}

            <Button 
              type="submit" 
              variant="primary" 
              className="w-full"
              isLoading={isLoading}
              disabled={!isLogin && !formData.acceptTerms}
            >
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError(null)
                setFieldErrors({})
              }}
              className="text-fuchsia-400 hover:text-fuchsia-300 text-sm"
            >
              {isLogin 
                ? '¿No tienes cuenta? Regístrate' 
                : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}

// Loading fallback for Suspense
function LoginFallback() {
  return (
    <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center px-4 py-8">
      <Card variant="glass" className="w-full max-w-md">
        <div className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-fuchsia-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-white/60">Cargando...</p>
        </div>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  )
}