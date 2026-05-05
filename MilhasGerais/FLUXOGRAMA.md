# 🗺️ Fluxograma da Arquitetura - MilhasGerais

## 1. FLUXO DE INICIALIZAÇÃO

```
┌─────────────────────────────────────────────────────────────┐
│                      main.jsx (Entrada)                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │  <BrowserRouter>             │ (Ativa roteamento)
        └──────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │  <AuthProvider>              │ (Contexto global)
        │  ├─ Estado: user             │
        │  ├─ Estado: isAuthenticated  │
        │  ├─ Estado: isLoading        │
        │  └─ Funções: login, logout   │
        └──────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │  <App />                     │
        └──────────────────────────────┘
```

---

## 2. FLUXO DE AUTENTICAÇÃO (Login)

```
┌──────────────────────────────────────────────────────────────┐
│              LoginScreen.tsx                                  │
│                                                               │
│  [email input] [password input]                              │
│         ↓              ↓                                      │
│  ┌─────────────────────────────┐                            │
│  │  handleSubmit (onclick)     │                            │
│  └─────────────────────────────┘                            │
│         │                                                    │
│         ▼                                                    │
│  ┌─────────────────────────────┐                            │
│  │ await login(email, pass)    │◄──┐                       │
│  │ (do AuthContext)            │   │                       │
│  └─────────────────────────────┘   │                       │
│         │                           │                       │
│         ▼                           │                       │
│  ┌─────────────────────────────┐   │                       │
│  │ authService.login()         │───┘ (Chamada)             │
│  │ src/services/authService.ts │                            │
│  └─────────────────────────────┘                            │
└──────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│              MODO DESENVOLVIMENTO                             │
│                                                               │
│  if VITE_DEV_MODE = true:                                   │
│  ├─ Gera token FAKE                                         │
│  ├─ Cria User mock                                          │
│  ├─ Salva em localStorage                                   │
│  └─ Retorna { token, user }                                 │
│                                                               │
│  if VITE_DEV_MODE = false:                                  │
│  ├─ Chama API real: POST /api/users/login                  │
│  ├─ Recebe token do backend                                │
│  └─ Salva em localStorage                                   │
└──────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│              Volta ao LoginScreen                             │
│                                                               │
│  AuthContext.setUser(response.user)                         │
│  AuthContext.setIsAuthenticated(true)                       │
│  AuthContext.setIsLoading(false)                            │
└──────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│  navigate('/home')  ◄────── useNavigate                       │
│  (React Router)                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. FLUXO DE ROTEAMENTO

```
┌──────────────────────────────────────────────────────────────┐
│                      App.tsx                                  │
│                                                               │
│  const { isAuthenticated, logout } = useAuth()              │
│                                                               │
│  return (                                                    │
│    <Routes>                                                  │
│      ├─ /login    → LoginScreen   (se !isAuthenticated)    │
│      │            → /home (se isAuthenticated)             │
│      │                                                       │
│      ├─ /home     → HomeScreen    (se isAuthenticated)     │
│      │            → /login (se !isAuthenticated)           │
│      │                                                       │
│      ├─ /graphs   → GraphsScreen  (se isAuthenticated)     │
│      │            → /login (se !isAuthenticated)           │
│      │                                                       │
│      └─ /         → Redirect para /home ou /login          │
│    </Routes>                                                 │
│  )                                                           │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. FLUXO DE DADOS - HOME SCREEN

```
┌──────────────────────────────┐
│     HomeScreen.tsx           │
│     (useEffect)              │
└──────────────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ dashboardService.obterResumo()
│ src/services/dashboardService.ts
└──────────────────────────────┘
         │
         ├─ if (DEV_MODE)
         │  └─ Retorna mockDashboardData (delay 500ms)
         │
         └─ if (!DEV_MODE)
            └─ GET /api/dashboard/resumo
               (com token no header)
         │
         ▼
┌──────────────────────────────────────────┐
│  DashboardResumo {                       │
│    totalMiles: 106000                   │
│    crescimento: 4000                    │
│    aVencer: 5000                        │
│    programas: [                         │
│      { id, name, miles, color, logo }  │
│    ]                                    │
│    transacoes: [                        │
│      { id, type, program, amount... }   │
│    ]                                    │
│    alerts: [                            │
│      { id, text, type }                │
│    ]                                    │
│  }                                      │
└──────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  setDashboard(data)                     │
│  (React state update)                   │
└──────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  HomeScreen renderiza com dados reais    │
│                                          │
│  ├─ Saldo total                         │
│  ├─ Programas (list)                    │
│  ├─ Transações recentes                 │
│  ├─ Alertas                             │
│  ├─ Gráfico de barras                   │
│  └─ Botões de ação                      │
└──────────────────────────────────────────┘
```

---

## 5. FLUXO DE DADOS - GRAPHS SCREEN

```
┌──────────────────────────────┐
│     GraphsScreen.tsx         │
│     (useEffect)              │
└──────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ transacoesService.obterAnalytics()      │
│ src/services/transacoesService.ts       │
└──────────────────────────────────────────┘
         │
         ├─ if (DEV_MODE)
         │  └─ Retorna mockAnalyticsData (delay 600ms)
         │
         └─ if (!DEV_MODE)
            └─ GET /api/transacoes/analytics
               (com token no header)
         │
         ▼
┌──────────────────────────────────────────┐
│  GraphData {                             │
│    programas: [...],   (para barras)    │
│    distribuicao: [...], (para pizza)    │
│    evolucao: [...],     (para linha)    │
│    vencimento: [...]    (para barras)   │
│  }                                      │
└──────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  GraphsScreen renderiza:                │
│                                          │
│  ├─ Gráfico de barras (Comparação)     │
│  ├─ Gráfico de pizza (Distribuição)    │
│  ├─ Gráfico de linha (Evolução)        │
│  ├─ Gráfico de barras (Vencimento)     │
│  ├─ Cards de resumo                     │
│  └─ Legenda com detalhes                │
└──────────────────────────────────────────┘
```

---

## 6. ESTRUTURA DE PASTAS

```
src/
│
├── App.tsx                       ◄─ Roteamento principal
│
├── main.jsx                      ◄─ Entrada (Router + AuthProvider)
│
├── components/
│   ├── LoginScreen.tsx           ◄─ Tela de login
│   ├── HomeScreen.tsx            ◄─ Dashboard
│   └── GraphsScreen.tsx          ◄─ Gráficos
│
├── contexts/
│   └── AuthContext.tsx           ◄─ Context global de auth
│       ├─ AuthProvider (wrapper)
│       └─ useAuth (hook)
│
├── services/
│   ├── api.ts                    ◄─ Axios + interceptors
│   ├── authService.ts            ◄─ Login, logout, profile
│   ├── dashboardService.ts       ◄─ Dados do dashboard
│   ├── programasService.ts       ◄─ CRUD programas
│   └── transacoesService.ts      ◄─ Transações + analytics
│
├── hooks/
│   └── useAuth.ts                ◄─ Hook ANTIGO (remover depois)
│
├── types/
│   └── index.ts                  ◄─ Types TypeScript globais
│
└── utils/
    └── mockData.ts               ◄─ Dados mock (dev mode)
```

---

## 7. FLUXO DE AUTENTICAÇÃO - DETALHADO

```
┌─────────────────────────────────────────────────────────────┐
│                    INICIO DA APLICAÇÃO                       │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│  AuthProvider.useEffect() executa                           │
│                                                              │
│  const storedUser = localStorage.getItem('user')           │
│  const token = localStorage.getItem('token')               │
│                                                              │
│  if (storedUser && token) {                                │
│    setUser(storedUser)                                     │
│    setIsAuthenticated(true)  ◄─ Restaura sessão anterior  │
│  }                                                          │
│                                                              │
│  setIsLoading(false)  ◄─ App para de mostrar loading       │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│  App.tsx verifica isAuthenticated                           │
│                                                              │
│  if (isAuthenticated) {                                    │
│    mostrar HomeScreen                                       │
│  } else {                                                   │
│    mostrar LoginScreen                                      │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. FLUXO DO TOKEN

```
┌──────────────────────────────┐
│  localStorage                │
│  ├─ token (JWT ou fake)      │
│  └─ user (JSON serializado)  │
└──────────────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  api.ts (Axios)              │
│                              │
│  Interceptor request:        │
│  └─ Authorization:           │
│     Bearer <token>           │
└──────────────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Requisição HTTP             │
│  POST /api/users/login       │
│  GET /api/dashboard/resumo   │
│  POST /api/transacoes        │
│                              │
│  Header inclui token ✓       │
└──────────────────────────────┘
```

---

## 9. FLUXO DE LOGOUT

```
┌──────────────────────────────────────────────────────┐
│  HomeScreen/GraphsScreen                             │
│  Clica botão [Sair]                                  │
└──────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────┐
│  onLogout() (do App.tsx)                            │
│  └─ Chama logout() do AuthContext                   │
└──────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────┐
│  authService.logout()                               │
│  ├─ if (!DEV_MODE) → POST /api/users/logout        │
│  └─ Limpa localStorage                              │
└──────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────┐
│  AuthContext atualiza:                              │
│  ├─ setUser(null)                                   │
│  ├─ setIsAuthenticated(false)                       │
│  └─ setIsLoading(false)                             │
└──────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────┐
│  navigate('/login')                                 │
│  └─ Redireciona para login                         │
└──────────────────────────────────────────────────────┘
```

---

## 10. FLUXO DE ERRO (401)

```
┌─────────────────────────────────────┐
│  Requisição HTTP                    │
│  GET /api/dashboard/resumo          │
│  (token expirado)                   │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Backend retorna 401 Unauthorized   │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  api.ts (Interceptor response)      │
│                                     │
│  if (error.status === 401) {       │
│    localStorage.removeItem('token') │
│    localStorage.removeItem('user')  │
│    window.location.href = '/login'  │
│  }                                  │
└─────────────────────────────────────┘
```

---

## 11. COMPARAÇÃO: DEV_MODE vs PRODUÇÃO

```
┌──────────────────────────────────┬──────────────────────────────────┐
│   VITE_DEV_MODE = true           │   VITE_DEV_MODE = false          │
│   (DESENVOLVIMENTO)              │   (PRODUÇÃO)                     │
├──────────────────────────────────┼──────────────────────────────────┤
│                                  │                                  │
│  authService.login():            │  authService.login():           │
│  ├─ Token FAKE                   │  ├─ Token JWT real              │
│  ├─ User mock criado             │  ├─ User do backend             │
│  └─ localStorage salvo           │  └─ localStorage salvo          │
│                                  │                                  │
│  dashboardService.obterResumo(): │  dashboardService.obterResumo(): │
│  ├─ mockDashboardData            │  ├─ GET /api/dashboard/resumo   │
│  ├─ Delay simulado (500ms)       │  ├─ Espera resposta real        │
│  └─ Sem rede necessária          │  └─ Requer backend              │
│                                  │                                  │
│  transacoesService.obterAnalytics():                              │
│  ├─ mockAnalyticsData            │  ├─ GET /api/transacoes/analytics
│  ├─ Delay simulado (600ms)       │  ├─ Espera resposta real        │
│  └─ Sem rede necessária          │  └─ Requer backend              │
│                                  │                                  │
└──────────────────────────────────┴──────────────────────────────────┘
```

---

## 12. CICLO DE VIDA DO COMPONENTE HomeScreen

```
┌─────────────────────────────────────────┐
│  HomeScreen monta (primeiro render)    │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  useEffect() executa                    │
│  ├─ setIsLoading(true)                  │
│  └─ Chamada: dashboardService.obterResumo()
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Enquanto carrega:                      │
│  ├─ Mostra spinner                      │
│  └─ Estado: isLoading = true            │
└─────────────────────────────────────────┘
         │
         ▼ (dados recebidos)
┌─────────────────────────────────────────┐
│  setDashboard(data)                     │
│  setIsLoading(false)                    │
│  setError(null)                         │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  HomeScreen re-renderiza com dados      │
│  ├─ Saldo total                         │
│  ├─ Programas da API                    │
│  ├─ Transações recentes                 │
│  └─ Gráficos com dados reais            │
└─────────────────────────────────────────┘
```

---

**Legenda:**
- ► = fluxo/passagem de dados
- ✓ = validação/verificação
- ◄ = retorno/callback
