# 📦 FRONTEND - BACKUP DA ESTRUTURA ORIGINAL

**Data:** 2025-11-07
**Motivo:** Backup antes de transformação para MVP simplificado

---

## 📁 Estrutura Completa ANTES da Limpeza

### Páginas em `src/app/(auth)/`:

```
(auth)/
├── dashboard/
│   └── page.tsx                          ✅ MANTER
│
├── cameras/
│   ├── page.tsx                          ✅ MANTER (simplificar)
│   ├── [id]/analytics/page.tsx           ❌ DELETAR
│   └── settings/page.tsx                 ❌ DELETAR
│
├── employees/
│   ├── page.tsx                          ✅ MANTER (simplificar)
│   ├── [id]/privacy/page.tsx             ❌ DELETAR
│   ├── register/page.tsx                 ❌ DELETAR (integrar no page.tsx)
│   └── attendance/page.tsx               ❌ DELETAR
│
├── analytics/                            ❌ DELETAR PASTA COMPLETA
│   ├── behavioral/page.tsx
│   ├── comparisons/page.tsx
│   ├── predictions/page.tsx
│   ├── realtime/page.tsx
│   └── segmentation/page.tsx
│
├── reports/                              ❌ DELETAR PASTA COMPLETA
│   └── page.tsx
│
└── settings/                             ❌ DELETAR PASTA COMPLETA
    ├── page.tsx
    ├── advanced/
    ├── database/
    ├── integrations/
    ├── notifications/
    ├── privacy/
    ├── security/
    ├── store/
    └── users/
```

### Navegação Original (constants.ts):

**Menu items:**
- Dashboard
- Cameras (2 subitens: Monitoramento, Configurações)
- Analytics (5 subitens: Behavioral, Comparisons, Predictions, Realtime, Segmentation)
- Employees (3 subitens: Lista, Cadastro, Presença)
- Reports
- Settings (6+ subitens)

**Total:** ~15 rotas principais

---

## 🎯 Estrutura MVP (Após Limpeza)

### Páginas em `src/app/(auth)/`:

```
(auth)/
├── dashboard/
│   └── page.tsx                          ✅ SIMPLIFICADO
│
├── cameras/
│   └── page.tsx                          ✅ SIMPLIFICADO
│
└── employees/
    └── page.tsx                          ✅ SIMPLIFICADO
```

### Navegação MVP (constants.ts):

**Menu items:**
- Dashboard
- Câmera
- Funcionários

**Total:** 3 rotas principais

---

## 📊 Redução

- Páginas: **29 → 3** (redução de 90%)
- Rotas no menu: **15 → 3** (redução de 80%)
- Complexidade: **Alta → Baixa**

---

## 🔄 Como Restaurar (se necessário)

Se precisar restaurar alguma página deletada:

1. Verificar este backup para estrutura
2. Restaurar do git: `git checkout HEAD -- frontend/src/app/(auth)/[pasta]`
3. Restaurar navegação em `constants.ts`

---

## ⚠️ Atenção

Páginas deletadas NÃO terão seus componentes removidos ainda.
Componentes em `frontend/src/components/` serão mantidos até análise de uso.

Pastas que serão DELETADAS:
- `frontend/src/app/(auth)/analytics/` (completa)
- `frontend/src/app/(auth)/reports/` (completa)
- `frontend/src/app/(auth)/settings/` (completa)
- `frontend/src/app/(auth)/cameras/[id]/` (completa)
- `frontend/src/app/(auth)/cameras/settings/` (completa)
- `frontend/src/app/(auth)/employees/[id]/` (completa)
- `frontend/src/app/(auth)/employees/register/` (completa)
- `frontend/src/app/(auth)/employees/attendance/` (completa)

---

**Backup criado em:** 2025-11-07
**Por:** Claude Code - Transformação MVP
