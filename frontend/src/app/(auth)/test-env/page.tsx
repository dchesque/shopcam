'use client'

export default function TestEnvPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold text-white">Teste de Environment Variables</h1>

      <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800">
        <h2 className="text-lg font-semibold text-white mb-2">NEXT_PUBLIC_API_URL</h2>
        <p className="text-neutral-300 font-mono break-all">
          {apiUrl || '❌ Variável não configurada!'}
        </p>
      </div>

      {!apiUrl && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
          <p className="text-red-400 text-sm">
            ⚠️ A variável NEXT_PUBLIC_API_URL não está configurada!<br/>
            Configure no Easypanel e faça rebuild.
          </p>
        </div>
      )}

      {apiUrl && apiUrl.includes('localhost') && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
          <p className="text-yellow-400 text-sm">
            ⚠️ Ainda está apontando para localhost!<br/>
            Configure a URL de produção e faça rebuild.
          </p>
        </div>
      )}

      {apiUrl && !apiUrl.includes('localhost') && (
        <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg">
          <p className="text-green-400 text-sm">
            ✅ Configurado corretamente!
          </p>
        </div>
      )}
    </div>
  )
}
