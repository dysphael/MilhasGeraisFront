// Types para autenticação
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

// Types para programas
export interface Programa {
  id: string;
  name: string;
  miles: number;
  color: string;
  logo: string;
}

// Types para transações
export interface Transacao {
  id: string;
  type: 'credit' | 'transfer' | 'debit';
  program: string;
  amount: number;
  date: string;
  description: string;
}

// Types para dashboard
export interface DashboardResumo {
  totalMiles: number;
  crescimento: number;
  aVencer: number;
  programas: Programa[];
  transacoes: Transacao[];
  alerts: Alert[];
}

export interface Alert {
  id: string;
  text: string;
  type: 'warning' | 'info';
}

// Types para gráficos
export interface GraphData {
  programas: ProgramaData[];
  evolucao: EvolucaoData[];
  vencimento: VencimentoData[];
}

export interface ProgramaData {
  name: string;
  miles: number;
  fill: string;
}

export interface EvolucaoData {
  month: string;
  miles: number;
}

export interface VencimentoData {
  month: string;
  miles: number;
}
