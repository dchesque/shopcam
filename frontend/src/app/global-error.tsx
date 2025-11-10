'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 text-white">
          <div className="text-center space-y-6">
            <h1 className="text-9xl font-bold text-red-500">500</h1>
            <h2 className="text-3xl font-semibold">
              Erro Crítico do Sistema
            </h2>
            <p className="text-neutral-400 max-w-md">
              Ocorreu um erro crítico. Por favor, recarregue a página.
            </p>
            <button
              onClick={reset}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}