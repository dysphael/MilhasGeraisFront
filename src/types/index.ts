// ── Autenticação ──────────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// ── Usuário — espelha Models/User.cs ─────────────────────────────
export interface User {
  id: number;           // int no C# (era string no mock)
  name: string;
  email: string;
  creditCards?: CreditCard[];
  profile?: UserProfile;
}

// ── Cartão de crédito — espelha Models/CreditCard.cs ─────────────
export interface CreditCard {
  id: number;
  cardNumber: string;
  brand: string;
  program?: LoyaltyProgram | null;
  userId: number;
}

export interface CreateCreditCardDto {
  cardNumber: string;
  brand: string;
  program?: LoyaltyProgram | null;
  userId: number;
}

export interface UpdateCreditCardDto {
  cardNumber?: string;
  brand?: string;
  program?: LoyaltyProgram | null;
}

// ── Enums — espelham Models/Enums.cs ─────────────────────────────
export type InvestmentProfile = 'Conservative' | 'Moderate' | 'Aggressive';

export type TravelFrequency = 'Rarely' | 'Occasional' | 'Frequent' | 'VeryFrequent';

export type CabinClass = 'Economy' | 'PremiumEconomy' | 'Business' | 'FirstClass';

export type LoyaltyProgram =
  | 'Smiles'
  | 'Latam'
  | 'Azul'
  | 'Multiplus'
  | 'Livelo'
  | 'Esfera'
  | 'Other';

// ── Perfil de usuário — espelha Models/UserProfile.cs ────────────
export interface UserProfile {
  id: number;
  userId: number;
  monthlyIncome: number;
  investmentProfile: InvestmentProfile;
  monthlyCardSpending: number;
  annualCardFeeBudget: number;
  numberOfCreditCards: number;
  travelFrequency: TravelFrequency;
  preferredCabinClass: CabinClass;
  preferredLoyaltyProgram: LoyaltyProgram;
  currentMilesBalance: number;
  monthlyMilesGoal: number;
  prefersDomesticTravel: boolean;
  prefersInternationalTravel: boolean;
  maxMilePurchasePrice: number;
  interestedInCardUpgrades: boolean;
  interestedInMilesTransferPromos: boolean;
}

export interface CreateUserProfileDto extends Omit<UserProfile, 'id' | 'userId'> {}
export interface UpdateUserProfileDto extends Partial<Omit<UserProfile, 'id' | 'userId'>> {}

// ── Meta de milhas — espelha Models/MilesGoal.cs ─────────────────
export interface MilesGoal {
  id: number;
  userId: number;
  name: string;
  targetMiles: number;
  createdAt: string;        // ISO string
}

export interface CreateMilesGoalDto {
  userId: number;
  name: string;
  targetMiles: number;
}

// ── Transação de recompensa — espelha Models/RewardTransaction.cs ─
export interface RewardTransaction {
  id: number;
  userId: number;
  creditCardId: number;
  date: string;         // ISO string
  amount: number;       // valor em R$
  milesEarned: number;
  program?: LoyaltyProgram | null;
}

export interface CreateUserDto {
  name: string;
  email: string;
  creditCards?: CreateCreditCardDto[];
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
}

// ── Dashboard (shape retornado por /api/dashboard/resumo) ─────────
export interface DashboardPrograma {
  id: string;
  name: string;
  miles: number;
  color: string;
  logo: string;
}

export interface DashboardTransacao {
  id: string;
  type: 'credit' | 'transfer' | 'debit';
  program: string;
  amount: number;
  date: string;
  description: string;
}

export interface DashboardAlert {
  id: string;
  text: string;
  type: 'warning' | 'info';
}

export interface DashboardResumo {
  totalMiles: number;
  crescimento: number;
  aVencer: number;
  programas: DashboardPrograma[];
  transacoes: DashboardTransacao[];
  alerts: DashboardAlert[];
}

// ── Gráficos ──────────────────────────────────────────────────────
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

export interface AnalyticsData {
  programas: ProgramaData[];
  distribuicao: ProgramaData[];
  evolucao: EvolucaoData[];
  vencimento: VencimentoData[];
  crescimento: string;
  aVencer: string;
  totalVencimento: string;
}

// ── Cotações de milhas (scraping) — espelha Scrapers/Models/MilesQuote.cs ─
export interface MilesQuote {
  program: string;
  sourceUrl: string;
  pricePerMile: number;
  bonusMultiplier: number | null;
  promotionDescription: string | null;
  scrapedAt: string;
  isPromotion: boolean;
}

// ── Aliases para compatibilidade com código existente ─────────────
/** @deprecated use DashboardPrograma */
export type Programa = DashboardPrograma;
/** @deprecated use DashboardTransacao */
export type Transacao = DashboardTransacao;
/** @deprecated use DashboardAlert */
export type Alert = DashboardAlert;
