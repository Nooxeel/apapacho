'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { authApi, missionsApi, mfaApi } from '@/lib/api'
import { Button, Input, Card } from '@/components/ui'
import { useAuthStore } from '@/stores/authStore'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'

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
  })

  // MFA challenge state (Ley 21.719 — Ola 4 P1.1). When the backend
  // signals requiresMfa we replace the password form with a TOTP/recovery
  // code input and exchange via /api/auth/mfa/verify.
  const [mfaChallengeToken, setMfaChallengeToken] = useState<string | null>(null)
  const [mfaCode, setMfaCode] = useState('')
  const [mfaSubmitting, setMfaSubmitting] = useState(false)
  const mfaCodeRef = useRef<HTMLInputElement>(null)

  // Ley 21.719 — granular per-purpose consent (replaces the old single
  // `acceptTerms` checkbox at submit time). `service` is mandatory; the rest
  // are opt-ins. We persist them separately to UserConsent on the backend.
  const [consents, setConsents] = useState({
    service: false,
    marketing: false,
    profiling: false,
    internationalTransfer: false,
  })

  const buildConsentsPayload = () =>
    consents.service
      ? ({
          service: true as const,
          marketing: consents.marketing,
          profiling: consents.profiling,
          internationalTransfer: consents.internationalTransfer,
        })
      : undefined

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

    // Validar consent obligatorio (Ley 21.719): solo `service` es requerido,
    // el resto son opt-ins.
    if (!isLogin && !consents.service) {
      setError('Debes aceptar los Términos y la Política de Privacidad para continuar')
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

        // MFA gate (Ley 21.719 — Ola 4 P1.1). When the backend returns
        // requiresMfa we DON'T have cookies/tokens yet — switch the UI to
        // the challenge step. Email/password are not stored anywhere.
        if (result?.requiresMfa && result?.challengeToken) {
          setMfaChallengeToken(result.challengeToken)
          setMfaCode('')
          // Focus the MFA input after the form re-renders.
          setTimeout(() => mfaCodeRef.current?.focus(), 50)
          return
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
        
        const consentsPayload = buildConsentsPayload()
        const result = await authApi.register({
          email: formData.email,
          password: formData.password,
          username: formData.username,
          displayName: formData.displayName,
          isCreator: formData.isCreator,
          ...(referralCode ? { referralCode } : {}),
          ...(consentsPayload ? { consents: consentsPayload } : {}),
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

  // Submit the MFA challenge (TOTP or recovery code) after a password login
  // that returned requiresMfa = true. The backend exchanges it for cookies.
  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!mfaChallengeToken) return
    const trimmed = mfaCode.trim()
    if (!/^\d{6}$/.test(trimmed) && !/^[0-9A-Fa-f]{8}$/.test(trimmed)) {
      setError('Ingresa un código TOTP de 6 dígitos o un código de respaldo de 8 caracteres.')
      return
    }
    setMfaSubmitting(true)
    try {
      const result = (await mfaApi.verifyOnLogin(mfaChallengeToken, trimmed)) as any
      login(result.user, result.token, result.expiresIn)
      missionsApi.trackProgress(result.token, 'login').catch(() => {})
      if (result.user.isCreator) {
        router.push('/creator/edit')
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      console.error('MFA verify error:', err)
      const msg = err?.message || 'Código incorrecto. Inténtalo nuevamente.'
      setError(msg)
      // If the challenge token expired or attempts exhausted, return to the
      // password form so the user can try from scratch.
      if (
        msg.toLowerCase().includes('expirado') ||
        msg.toLowerCase().includes('demasiados intentos') ||
        err?.statusCode === 429
      ) {
        setMfaChallengeToken(null)
        setMfaCode('')
      }
    } finally {
      setMfaSubmitting(false)
    }
  }

  const handleCancelMfa = () => {
    setMfaChallengeToken(null)
    setMfaCode('')
    setError(null)
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
      // Only send consents when registering. The backend will only consume
      // them on first signup (existing users keep their stored consents).
      const consentsPayload = !isLogin ? buildConsentsPayload() : undefined
      if (!isLogin && !consentsPayload) {
        setError('Debes aceptar los Términos y la Política de Privacidad para registrarte con Google')
        setIsGoogleLoading(false)
        return
      }
      const result = await authApi.googleLogin({
        credential: response.credential,
        isCreator: !isLogin ? formData.isCreator : undefined,
        referralCode: referralCode || undefined,
        ...(consentsPayload ? { consents: consentsPayload } : {}),
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
            {mfaChallengeToken
              ? 'Verificación en dos pasos'
              : isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h1>
          <p className="text-gray-400 text-center mb-6">
            {mfaChallengeToken
              ? 'Ingresa el código de tu app de autenticación o un código de respaldo.'
              : isLogin
                ? 'Ingresa a tu cuenta de Appapacho'
                : 'Únete a la comunidad de creadores'}
          </p>

          {/* Referral code indicator */}
          {referralCode && !isLogin && !mfaChallengeToken && (
            <div className="bg-fuchsia-500/20 border border-fuchsia-500/50 rounded-lg p-3 text-fuchsia-300 text-sm mb-4 text-center">
              🎁 Código de referido aplicado: <strong>{referralCode}</strong>
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm mb-4">
              {error}
            </div>
          )}

          {mfaChallengeToken ? (
            <form onSubmit={handleMfaVerify} className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-emerald-300">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-sm">Cuenta protegida con MFA</span>
              </div>

              <Input
                ref={mfaCodeRef}
                label="Código"
                inputMode="text"
                autoComplete="one-time-code"
                placeholder="123456 ó DEADBEEF"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\s/g, ''))}
                maxLength={8}
                required
                helperText="6 dígitos de tu app o 8 caracteres de un código de respaldo"
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={mfaSubmitting}
              >
                Verificar y entrar
              </Button>

              <button
                type="button"
                onClick={handleCancelMfa}
                className="w-full text-sm text-gray-400 hover:text-white"
              >
                Volver al inicio de sesión
              </button>
            </form>
          ) : (
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

                {/*
                  Ley 21.719 — granular consent (Group 3.3).
                  - `service` is the only mandatory checkbox: bundles T&C +
                    Privacy Policy + age confirmation (>= 18).
                  - The other three are independent opt-ins. Unchecked rows
                    are still recorded server-side as `granted: false` so
                    we can prove the user was offered the choice.
                */}
                <div className="space-y-3 pt-1">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consents.service}
                      onChange={(e) => setConsents(prev => ({ ...prev, service: e.target.checked }))}
                      className="w-4 h-4 mt-0.5 rounded border-gray-600 bg-gray-700 text-fuchsia-500 focus:ring-fuchsia-500 flex-shrink-0"
                      required
                      aria-describedby="consent-service-help"
                    />
                    <span id="consent-service-help" className="text-white/80 text-sm">
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
                      . Confirmo ser mayor de 18 años.{' '}
                      <span className="text-red-400" aria-hidden="true">*</span>
                    </span>
                  </label>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consents.marketing}
                      onChange={(e) => setConsents(prev => ({ ...prev, marketing: e.target.checked }))}
                      className="w-4 h-4 mt-0.5 rounded border-gray-600 bg-gray-700 text-fuchsia-500 focus:ring-fuchsia-500 flex-shrink-0"
                    />
                    <span className="text-white/80 text-sm">
                      Acepto recibir comunicaciones de marketing y novedades de Appapacho por email.{' '}
                      <span className="text-white/40">(opcional)</span>
                    </span>
                  </label>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consents.profiling}
                      onChange={(e) => setConsents(prev => ({ ...prev, profiling: e.target.checked }))}
                      className="w-4 h-4 mt-0.5 rounded border-gray-600 bg-gray-700 text-fuchsia-500 focus:ring-fuchsia-500 flex-shrink-0"
                    />
                    <span className="text-white/80 text-sm">
                      Autorizo el uso de mis datos para personalización de contenido y recomendaciones.{' '}
                      <span className="text-white/40">(opcional)</span>
                    </span>
                  </label>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consents.internationalTransfer}
                      onChange={(e) => setConsents(prev => ({ ...prev, internationalTransfer: e.target.checked }))}
                      className="w-4 h-4 mt-0.5 rounded border-gray-600 bg-gray-700 text-fuchsia-500 focus:ring-fuchsia-500 flex-shrink-0"
                    />
                    <span className="text-white/80 text-sm">
                      Acepto la transferencia de mis datos a procesadores fuera de Chile (EE.UU.) bajo cláusulas contractuales tipo.{' '}
                      <span className="text-white/40">(opcional)</span>
                    </span>
                  </label>
                </div>

                {/* CAPA-BASICA - GRUPO 3.2 */}
                <div className="flex items-start gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white/60 leading-relaxed">
                  <span aria-hidden="true" className="mt-0.5">ℹ️</span>
                  <span>
                    <strong className="text-white/80">Resumen:</strong> tratamos tus datos para brindarte el servicio.
                    Detalle completo, finalidades específicas y opciones de control en nuestra{' '}
                    <Link
                      href="/privacidad"
                      target="_blank"
                      className="text-fuchsia-400 hover:text-fuchsia-300 underline"
                    >
                      Política de Privacidad
                    </Link>.
                  </span>
                </div>
              </>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
              disabled={!isLogin && !consents.service}
            >
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </Button>
          </form>
          )}

          {/* Divider + Google + Toggle — hidden during MFA challenge */}
          {!mfaChallengeToken && (
          <>
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
          </>
          )}
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