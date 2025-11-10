'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Application error:', error)
    }
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950">
      <div className="text-center space-y-6">
        <h1 className="text-9xl font-bold text-red-500">500</h1>
        <h2 className="text-3xl font-semibold text-neutral-100">
          Erro no Servidor
        </h2>
        <p className="text-neutral-400 max-w-md">
          Ocorreu um erro inesperado. Por favor, tente novamente.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Tentar Novamente
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  )
}