'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { authApi, missionsApi } from '@/lib/api'
import { Button, Input, Card } from '@/components/ui'
import { useAuthStore } from '@/stores/authStore'
import { Eye, EyeOff } from 'lucide-react'

// Key for storing remembered credentials
const REMEMBER_KEY = 'apapacho-remember-credentials'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuthStore()
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  
  // Refs for focusing on error fields
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const usernameRef = useRef<HTMLInputElement>(null)
  const displayNameRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    displayName: '',
    isCreator: true,
    acceptTerms: false
  })

  // Load remembered email on mount (password is NOT stored for security)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        // Only load email - password should never be stored
        if (parsed.email) {
          setFormData(prev => ({ ...prev, email: parsed.email }))
          setRememberMe(true)
        }
      }
    } catch {
      // Ignore errors
    }
  }, [])

  // Capture referral code from URL (?ref=XXXXX) and mode (?mode=register)
  useEffect(() => {
    const ref = searchParams.get('ref')
    const mode = searchParams.get('mode')
    
    if (ref) {
      setReferralCode(ref.toUpperCase())
      setIsLogin(false) // Switch to register mode if referral code present
    }
    
    if (mode === 'register') {
      setIsLogin(false) // Switch to register mode if mode=register
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
        
        // Handle remember me - only save email for convenience (NOT password)
        if (rememberMe) {
          localStorage.setItem(REMEMBER_KEY, JSON.stringify({
            email: formData.email
          }))
        } else {
          localStorage.removeItem(REMEMBER_KEY)
        }
        
        // Only use Zustand store (cookies are set by backend)
        login(result.user, result.token)
        
        // Track login mission progress
        missionsApi.trackProgress(result.token, 'login').catch(() => {})
        
        if (result.user.isCreator) {
          router.push('/creator/edit')
        } else {
          router.push('/dashboard')
        }
      } else {
        console.log('[REGISTER] Starting registration with data:', {
          email: formData.email,
          username: formData.username,
          displayName: formData.displayName,
          isCreator: formData.isCreator,
          hasReferralCode: !!referralCode
        })
        
        const result = await authApi.register({
          email: formData.email,
          password: formData.password,
          username: formData.username,
          displayName: formData.displayName,
          isCreator: formData.isCreator,
          ...(referralCode ? { referralCode } : {})
        }) as any
        
        console.log('[REGISTER] Registration successful:', result)
        
        // Only use Zustand store (cookies are set by backend)
        login(result.user, result.token)
        
        // Track login mission progress (first login counts too)
        missionsApi.trackProgress(result.token, 'login').catch(() => {})
        
        if (result.user.isCreator) {
          router.push('/creator/edit')
        } else {
          router.push('/dashboard')
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err)
      
      const errors: Record<string, string> = {}
      let firstErrorField: string | null = null
      
      // Helper para parsear errores del formato "field: mensaje"
      const parseErrorString = (errStr: string) => {
        const colonIndex = errStr.indexOf(':')
        if (colonIndex > 0) {
          const field = errStr.substring(0, colonIndex).trim().toLowerCase()
          const message = errStr.substring(colonIndex + 1).trim()
          return { field, message }
        }
        return { field: 'general', message: errStr }
      }
      
      // Manejar errores de validación con detalles
      if (err.message === 'Validation failed' && err.details) {
        err.details.forEach((detail: any) => {
          if (typeof detail === 'string') {
            // Backend devuelve strings como "password: mensaje"
            const { field, message } = parseErrorString(detail)
            errors[field] = message
            if (!firstErrorField) firstErrorField = field
          } else if (detail.path && detail.message) {
            const field = detail.path[0] || 'general'
            errors[field] = detail.message
            if (!firstErrorField) firstErrorField = field
          }
        })
      } else if (err.details && Array.isArray(err.details)) {
        err.details.forEach((detail: any) => {
          if (typeof detail === 'string') {
            const { field, message } = parseErrorString(detail)
            errors[field] = message
            if (!firstErrorField) firstErrorField = field
          } else if (detail.path && detail.message) {
            const field = detail.path[0] || 'general'
            errors[field] = detail.message
            if (!firstErrorField) firstErrorField = field
          }
        })
      }
      
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors)
        const firstError = Object.values(errors)[0]
        setError(firstError)
        
        // Focus en el campo con error
        setTimeout(() => {
          if (firstErrorField === 'password') passwordRef.current?.focus()
          else if (firstErrorField === 'email') emailRef.current?.focus()
          else if (firstErrorField === 'username') usernameRef.current?.focus()
          else if (firstErrorField === 'displayname') displayNameRef.current?.focus()
        }, 100)
      } else {
        setError(err.message || 'Error en la autenticación. Por favor, intenta de nuevo.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Google OAuth login
  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      setError('No se pudo obtener la credencial de Google')
      return
    }

    setIsGoogleLoading(true)
    setError(null)

    try {
      const result = await authApi.googleLogin({
        credential: response.credential,
        isCreator: !isLogin ? formData.isCreator : undefined,
        referralCode: referralCode || undefined
      }) as any

      // Use Zustand store (cookies are set by backend)
      login(result.user, result.token)

      // Track login mission progress
      missionsApi.trackProgress(result.token, 'login').catch(() => {})

      if (result.user.isCreator) {
        router.push('/creator/edit')
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      console.error('Google auth error:', err)
      setError(err.message || 'Error al iniciar sesión con Google')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError('Error al iniciar sesión con Google. Intenta de nuevo.')
  }

  return (
    <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center px-4 py-8">
      <Card variant="glass" className="w-full max-w-md">
        <div className="p-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
              Appapacho
            </h2>
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-2">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h1>
          <p className="text-gray-400 text-center mb-6">
            {isLogin 
              ? 'Ingresa a tu cuenta de Appapacho' 
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
              ref={emailRef}
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
                  ref={usernameRef}
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
                  ref={displayNameRef}
                  label="Nombre para mostrar"
                  placeholder="Tu Nombre"
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  required
                  error={fieldErrors.displayName || fieldErrors.displayname}
                />
              </>
            )}

            <Input
              ref={passwordRef}
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required
              helperText={!isLogin ? "Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número" : undefined}
              error={fieldErrors.password}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-white/50 hover:text-white/80 transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
            />

            {isLogin && (
              <div className="flex items-center justify-between -mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-fuchsia-500 focus:ring-fuchsia-500"
                  />
                  <span className="text-white/60 text-sm">Recordarme</span>
                </label>
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
                    {' '}y la{' '}
                    <Link 
                      href="/privacidad" 
                      target="_blank"
                      className="text-fuchsia-400 hover:text-fuchsia-300 underline"
                    >
                      Política de Privacidad
                    </Link>
                    , y confirmo que soy mayor de 18 años
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

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[#1a1a25] px-4 text-white/50">o continúa con</span>
            </div>
          </div>

          {/* Google Sign In */}
          <div className="flex justify-center">
            {isGoogleLoading ? (
              <div className="flex items-center gap-2 text-white/60 py-3">
                <div className="animate-spin w-5 h-5 border-2 border-fuchsia-500 border-t-transparent rounded-full" />
                <span>Conectando con Google...</span>
              </div>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_black"
                size="large"
                text={isLogin ? 'signin_with' : 'signup_with'}
                shape="rectangular"
                useOneTap={false}
              />
            )}
          </div>

          {/* Toggle between login/register */}
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