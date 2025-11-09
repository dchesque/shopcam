import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950">
      <div className="text-center space-y-6">
        <h1 className="text-9xl font-bold text-red-500">404</h1>
        <h2 className="text-3xl font-semibold text-neutral-100">
          Página não encontrada
        </h2>
        <p className="text-neutral-400 max-w-md">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Link
          href="/"
          className="inline-block mt-6 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Voltar para o início
        </Link>
      </div>
    </div>
  )
}
