# Guia de Autenticação - ShopFlow

Sistema de autenticação completo e seguro implementado com **Supabase Auth** e **Next.js 15**.

## Características

✅ **Autenticação completa** com Supabase Auth
✅ **Proteção de rotas** com middleware Next.js
✅ **Gerenciamento de sessão** automático
✅ **Login e Registro** com validação
✅ **Recuperação de senha**
✅ **Perfis de usuário** no banco de dados
✅ **TypeScript** completo
✅ **Design moderno** com Tailwind CSS

## Estrutura de Arquivos

```
frontend/
├── src/
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts          # Cliente Supabase (Client Components)
│   │       ├── server.ts          # Cliente Supabase (Server Components)
│   │       └── middleware.ts      # Cliente Supabase (Middleware)
│   ├── types/
│   │   ├── database.ts            # Tipos do banco de dados
│   │   └── auth.ts                # Tipos de autenticação
│   ├── contexts/
│   │   └── AuthContext.tsx        # Context de autenticação
│   ├── components/
│   │   └── auth/
│   │       └── ProtectedRoute.tsx # Componente de proteção de rotas
│   ├── app/
│   │   ├── login/
│   │   │   └── page.tsx           # Página de login
│   │   ├── register/
│   │   │   └── page.tsx           # Página de registro
│   │   ├── forgot-password/
│   │   │   └── page.tsx           # Recuperação de senha
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts       # Callback de autenticação
│   │   └── (auth)/
│   │       └── layout.tsx         # Layout protegido
│   └── middleware.ts              # Middleware Next.js
```

## Configuração Inicial

### 1. Variáveis de Ambiente

Adicione ao seu `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
```

### 2. Configuração do Supabase

Execute o script SQL fornecido em `supabase-setup.sql` no SQL Editor do Supabase para criar:
- Tabela `profiles`
- Políticas de segurança (RLS)
- Triggers automáticos

### 3. Configuração de Email (Supabase Dashboard)

1. Vá em **Authentication** > **Email Templates**
2. Configure os templates de:
   - Confirmação de email
   - Recuperação de senha
   - Mudança de email

## Como Usar

### Login

```typescript
import { useAuth } from '@/contexts/AuthContext'

function LoginExample() {
  const { signIn } = useAuth()

  const handleLogin = async () => {
    const { error } = await signIn('email@example.com', 'password')
    if (error) {
      console.error('Erro no login:', error)
    }
  }
}
```

### Registro

```typescript
const { signUp } = useAuth()

const handleRegister = async () => {
  const { error } = await signUp('email@example.com', 'password', 'Nome Completo')
  if (error) {
    console.error('Erro no registro:', error)
  }
}
```

### Logout

```typescript
const { signOut } = useAuth()

const handleLogout = async () => {
  await signOut()
}
```

### Obter Usuário Atual

```typescript
const { user, isLoading } = useAuth()

if (isLoading) return <Loading />
if (!user) return <Login />

return <div>Olá, {user.email}</div>
```

### Proteger Rotas

**Opção 1: Layout (Recomendado)**
```typescript
// app/(auth)/layout.tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function AuthLayout({ children }) {
  return (
    <ProtectedRoute requireAuth={true}>
      {children}
    </ProtectedRoute>
  )
}
```

**Opção 2: Página Individual**
```typescript
// app/dashboard/page.tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div>Conteúdo protegido</div>
    </ProtectedRoute>
  )
}
```

### Atualizar Perfil

```typescript
const { updateProfile } = useAuth()

const handleUpdate = async () => {
  const { error } = await updateProfile({
    full_name: 'Novo Nome',
    avatar_url: 'https://...'
  })
}
```

## Hooks Disponíveis

### `useAuth()`
Hook principal com todas as funcionalidades de autenticação:
```typescript
const {
  user,          // Usuário atual
  session,       // Sessão atual
  isLoading,     // Estado de carregamento
  signIn,        // Função de login
  signUp,        // Função de registro
  signOut,       // Função de logout
  resetPassword, // Recuperação de senha
  updateProfile  // Atualizar perfil
} = useAuth()
```

### `useUser()`
Hook simplificado para obter apenas o usuário:
```typescript
const user = useUser()
```

### `useIsAuthenticated()`
Hook para verificar autenticação:
```typescript
const { isAuthenticated, isLoading } = useIsAuthenticated()
```

## Fluxo de Autenticação

### Login
1. Usuário preenche email e senha
2. `signIn()` autentica com Supabase
3. Supabase retorna sessão e usuário
4. AuthContext carrega o perfil do usuário
5. Middleware atualiza cookies
6. Redirecionamento para `/dashboard`

### Registro
1. Usuário preenche dados
2. `signUp()` cria conta no Supabase Auth
3. Trigger cria perfil na tabela `profiles`
4. Email de confirmação é enviado
5. Usuário confirma email pelo link
6. Redirecionamento para `/login`

### Logout
1. `signOut()` invalida sessão no Supabase
2. Cookies são limpos
3. Estado é resetado
4. Redirecionamento para `/login`

## Segurança

### PKCE Flow
Utiliza PKCE (Proof Key for Code Exchange) para maior segurança na autenticação.

### Row Level Security (RLS)
Todas as tabelas têm políticas de segurança ativas:
- Usuários só podem ler/atualizar seus próprios perfis
- Dados de outros usuários são inacessíveis

### Middleware
Protege automaticamente todas as rotas privadas:
- Verifica sessão em cada requisição
- Atualiza tokens automaticamente
- Redireciona usuários não autenticados

### Validação de Senha
Requisitos mínimos:
- 8 caracteres
- 1 letra maiúscula
- 1 letra minúscula
- 1 número

## Tratamento de Erros

```typescript
const { error } = await signIn(email, password)

if (error) {
  // Erros comuns:
  // - Invalid login credentials
  // - Email not confirmed
  // - Too many requests
  console.error(error.message)
}
```

## Personalização

### Adicionar Campos ao Perfil

1. Adicione colunas na tabela `profiles` no Supabase
2. Atualize `types/database.ts`:
```typescript
profiles: {
  Row: {
    // ... campos existentes
    phone?: string
    company?: string
  }
}
```

3. Use em `updateProfile()`:
```typescript
await updateProfile({
  phone: '11999999999',
  company: 'Minha Empresa'
})
```

### Customizar Redirecionamentos

Em `lib/supabase/middleware.ts`:
```typescript
// Mudar rota de login padrão
url.pathname = '/meu-login'

// Mudar rota após login
url.pathname = '/meu-dashboard'
```

## Troubleshooting

### "Invalid login credentials"
- Verifique se o email está confirmado
- Certifique-se que a senha está correta
- Verifique se o usuário existe no Supabase Dashboard

### Usuário não redireciona após login
- Verifique se o middleware está configurado
- Confira `middleware.ts` está na raiz de `src/`
- Verifique os logs do console

### Sessão expira muito rápido
- Configure `autoRefreshToken: true` no cliente
- Ajuste tempo de expiração no Supabase Dashboard

### Email de confirmação não chega
- Verifique spam
- Configure SMTP customizado no Supabase
- Em desenvolvimento, use o link do Supabase Dashboard

## Próximos Passos

- [ ] Adicionar autenticação com Google/GitHub
- [ ] Implementar 2FA (Two-Factor Authentication)
- [ ] Adicionar gerenciamento de permissões (roles)
- [ ] Implementar auditoria de login
- [ ] Adicionar bloqueio por tentativas

## Suporte

Para mais informações:
- [Documentação Supabase Auth](https://supabase.com/docs/guides/auth)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [Supabase SSR](https://supabase.com/docs/guides/auth/server-side-rendering)
