'use client'

import Link from 'next/link'

interface ErrorFallbackProps {
  error: Error & { digest?: string }
  reset: () => void
  title?: string
  message?: string
  backHref?: string
  backLabel?: string
}

export function ErrorFallback({
  error,
  reset,
  title = 'Algo salio mal',
  message = 'Ocurrio un error inesperado. Por favor intenta de nuevo.',
  backHref = '/',
  backLabel = 'Volver al inicio',
}: ErrorFallbackProps) {
  const isDev = process.env.NODE_ENV === 'development'

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Error icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-rose-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-white">{title}</h1>

        {/* Message */}
        <p className="text-gray-400 text-base">{message}</p>

        {/* Error digest (production) or message (development) */}
        {isDev && error.message && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-left">
            <p className="text-sm text-gray-500 font-mono break-all">
              {error.message}
            </p>
          </div>
        )}
        {!isDev && error.digest && (
          <p className="text-xs text-gray-600">
            Codigo de error: {error.digest}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 focus:ring-rose-500 px-5 py-2.5 text-base w-full sm:w-auto"
          >
            Intentar de nuevo
          </button>
          <Link
            href={backHref}
            className="inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent border-2 border-gray-700 text-gray-300 hover:bg-white/10 focus:ring-gray-500 px-5 py-2.5 text-base w-full sm:w-auto"
          >
            {backLabel}
          </Link>
        </div>
      </div>
    </div>
  )
}
