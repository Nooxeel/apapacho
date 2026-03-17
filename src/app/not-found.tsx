import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* 404 icon */}
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
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <p className="text-6xl font-semibold text-rose-500">404</p>
          <h1 className="text-2xl font-semibold text-white">
            Pagina no encontrada
          </h1>
        </div>

        {/* Description */}
        <p className="text-gray-400 text-base">
          La pagina que buscas no existe o fue movida.
        </p>

        {/* Action */}
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 focus:ring-rose-500 px-5 py-2.5 text-base"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
