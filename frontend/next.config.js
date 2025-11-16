/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output standalone para Docker/Easypanel
  output: 'standalone',

  // React strict mode
  reactStrictMode: true,

  // Suppress hydration warnings for development
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Compressão
  compress: true,

  // Configurações de imagem
  images: {
    domains: ['localhost', 'orzzycayjzgcuvcsrxsi.supabase.co', 'jarxgaagajceqllgjaqj.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/**',
      },
    ],
  },

  // Variáveis de ambiente (hardcoded para Easypanel)
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://shopflow-jcplussize-shopcam-backend1.hshars.easypanel.host',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jarxgaagajceqllgjaqj.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphcnhnYWFnYWpjZXFsbGdqYXFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MTc1MTYsImV4cCI6MjA3ODI5MzUxNn0.y-k_fG_E-0HyTMz3G3OZPsiPREPu77ZA6rmek6TbXZM',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  },
  
  // Pacotes externos do servidor (movido de experimental)
  serverExternalPackages: ['@node-rs/argon2', '@node-rs/bcrypt'],
  
  // Typed routes configuration (moved from experimental)
  typedRoutes: false,

  // Turbopack configuration (moved from experimental.turbo)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Experimental features
  experimental: {
    // Otimização de imports
    optimizePackageImports: ['lucide-react', 'recharts', '@tanstack/react-query'],
  },
  
  // Configuração do Webpack
  webpack: (config, { isServer }) => {
    // Resolver aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, './src'),
    };
    
    // Ignorar warnings específicos
    config.ignoreWarnings = [
      { module: /node_modules\/punycode/ },
    ];
    
    return config;
  },
  
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig