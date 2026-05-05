# 🚀 MilhasGerais - Frontend

Frontend React pronto para integração com backend ASP.NET Core.

## ✨ Modo Desenvolvimento (Bypass de Autenticação)

O frontend está configurado com **bypass de autenticação** para desenvolvimento sem o backend:

### Como funciona:

1. **Login**: Aceita qualquer email/senha
   - Email: `teste@email.com`
   - Senha: qualquer valor
   - Gera um token fake automaticamente

2. **Dados Mock**: Todos os dados vêm de `src/utils/mockData.ts`
   - Programas de milhas
   - Transações
   - Gráficos
   - Alertas

3. **Simula delay de rede**: Para parecer mais realista

### Ativar/Desativar Modo Dev:

No arquivo `.env`:

```env
VITE_DEV_MODE=true    # ✅ Modo desenvolvimento (bypass ativo)
VITE_DEV_MODE=false   # ❌ Modo produção (usa API real)
```

---

## 🔌 Integração com Backend

Quando o backend estiver pronto, basta:

1. **Desativar dev mode** no `.env`:
   ```env
   VITE_DEV_MODE=false
   ```

2. **Atualizar a URL da API** (se necessário):
   ```env
   VITE_API_URL=https://localhost:7156/api
   ```

3. **Implementar os endpoints** no backend (ver lista abaixo)

---

## 📋 Endpoints Esperados

### Autenticação
```
POST   /api/users/login          (email, password) → { token, user }
GET    /api/users/profile        () → User
POST   /api/users/logout         () → {}
```

### Programas
```
GET    /api/programas            () → Programa[]
GET    /api/programas/{id}       (id) → Programa
POST   /api/programas            (programa) → Programa
PUT    /api/programas/{id}       (id, miles) → Programa
```

### Transações
```
GET    /api/transacoes           (limit=10) → Transacao[]
POST   /api/transacoes           (transacao) → Transacao
GET    /api/transacoes/analytics () → GraphData
POST   /api/transacoes/transferir (ids, amount) → Transacao
```

### Dashboard
```
GET    /api/dashboard/resumo     () → DashboardResumo
GET    /api/dashboard/metas      () → { atual, proxima, percentual }
GET    /api/dashboard/alertas    () → Alert[]
```

---

## 🏗️ Estrutura do Projeto

```
src/
├── components/
│   ├── LoginScreen.tsx        (Login com bypass)
│   ├── HomeScreen.tsx         (Dashboard)
│   └── GraphsScreen.tsx       (Gráficos)
├── services/
│   ├── api.ts                 (Axios + interceptors)
│   ├── authService.ts         (Autenticação)
│   ├── dashboardService.ts    (Dashboard)
│   ├── programasService.ts    (Programas)
│   └── transacoesService.ts   (Transações)
├── hooks/
│   └── useAuth.ts             (Hook de autenticação)
├── types/
│   └── index.ts               (Types TypeScript)
└── utils/
    └── mockData.ts            (Dados mock)
```

---

## 🚀 Executar

```bash
# Instalar dependências
npm install

# Modo desenvolvimento
npm run dev

# Build produção
npm run build

# Preview
npm run preview
```

---

## 🔐 Autenticação

- Token é salvo em **localStorage**
- Logout limpa o storage
- Token expirado (401) redireciona para login
- Modo dev gera token fake automaticamente

---

## 📝 Dados Mock

Arquivo: `src/utils/mockData.ts`

Contém:
- ✅ Programas de milhas (LATAM, Smiles, TudoAzul, Livelo, Esfera)
- ✅ Transações recentes (crédito, débito, transferência)
- ✅ Alertas (vencimento, promoções)
- ✅ Dados para gráficos (evolução, distribuição, vencimento)

---

## 🔄 Fluxo de Autenticação

```
1. Usuário entra email/senha
   ↓
2. authService.login() chamado
   ↓
3. Se DEV_MODE = true → Gera token fake
4. Se DEV_MODE = false → Chama API real
   ↓
5. Salva token + user no localStorage
   ↓
6. Redireciona para /home
```

---

## ⚠️ Notas Importantes

- Quando backend não responde (erro 500, timeout), retorna dados mock como fallback
- Token fake não é validado no backend
- Ao ativar DEV_MODE=false, a API real é obrigatória
- Headers incluem `Authorization: Bearer <token>` automaticamente

---

Pronto para começar! 🎯
