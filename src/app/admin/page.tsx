import Link from 'next/link'

export default function AdminIndexPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold">Panel de administración</h1>
      <p className="text-white/60 mt-2">
        Herramientas internas para operar la plataforma.
      </p>

      <div className="mt-10 grid md:grid-cols-2 gap-4">
        <Link
          href="/admin/kyc"
          className="block bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-6 transition"
        >
          <h2 className="text-lg font-semibold">Revisión KYC</h2>
          <p className="text-sm text-white/60 mt-1">
            Cola de verificaciones manuales de creadores. SLA 48h hábiles.
          </p>
        </Link>
        <Link
          href="/admin/legal"
          className="block bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-6 transition"
        >
          <h2 className="text-lg font-semibold">Legal &amp; privacidad</h2>
          <p className="text-sm text-white/60 mt-1">
            Solicitudes ARCO-P (15 días), DMCA (7 días) y brechas (Ley 21.719).
          </p>
        </Link>
      </div>
    </div>
  )
}
