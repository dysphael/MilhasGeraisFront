import { useEffect, useState } from 'react';
import {
  X, Wallet, TrendingUp, CreditCard, Plane, Globe2, Target,
  ArrowRight, ArrowLeft, CheckCircle2, Loader, XCircle, Sparkles,
} from 'lucide-react';
import { userProfileService } from '../services/userProfileService';
import { useAuth } from '../hooks/useAuth';
import {
  CreateUserProfileDto, InvestmentProfile, TravelFrequency,
  CabinClass, LoyaltyProgram,
} from '../types';

interface UserProfileModalProps {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

// ── Tipos auxiliares ────────────────────────────────────────────────
type FormState = {
  monthlyIncome: string;
  investmentProfile: InvestmentProfile;
  monthlyCardSpending: string;
  annualCardFeeBudget: string;
  numberOfCreditCards: string;
  travelFrequency: TravelFrequency;
  preferredCabinClass: CabinClass;
  preferredLoyaltyProgram: LoyaltyProgram;
  currentMilesBalance: string;
  monthlyMilesGoal: string;
  prefersDomesticTravel: boolean;
  prefersInternationalTravel: boolean;
  maxMilePurchasePrice: string;
  interestedInCardUpgrades: boolean;
  interestedInMilesTransferPromos: boolean;
};

const DEFAULT_FORM: FormState = {
  monthlyIncome: '',
  investmentProfile: 'Moderate',
  monthlyCardSpending: '',
  annualCardFeeBudget: '',
  numberOfCreditCards: '1',
  travelFrequency: 'Occasional',
  preferredCabinClass: 'Economy',
  preferredLoyaltyProgram: 'Smiles',
  currentMilesBalance: '',
  monthlyMilesGoal: '',
  prefersDomesticTravel: true,
  prefersInternationalTravel: false,
  maxMilePurchasePrice: '',
  interestedInCardUpgrades: false,
  interestedInMilesTransferPromos: true,
};

// ── Personas ────────────────────────────────────────────────────────
type Persona = {
  key: string;
  emoji: string;
  title: string;
  description: string;
};

const PERSONAS: Record<string, Persona> = {
  beginner: {
    key: 'beginner',
    emoji: '🌱',
    title: 'Iniciante das milhas',
    description: 'Você está começando agora. Foque em escolher 1 programa principal e acumular milhas com gastos do dia a dia.',
  },
  executive: {
    key: 'executive',
    emoji: '💼',
    title: 'Executivo Premium',
    description: 'Alto poder de gasto e foco em conforto. Cartões black/infinite e classes superiores são onde você extrai mais valor.',
  },
  investor: {
    key: 'investor',
    emoji: '📈',
    title: 'Investidor de milhas',
    description: 'Você trata milhas como ativo. Foque em promoções de transferência (bônus), monitoramento de cotações e arbitragem entre programas.',
  },
  frequentEconomy: {
    key: 'frequentEconomy',
    emoji: '🧳',
    title: 'Viajante Frequente Econômico',
    description: 'Voa muito, mas valor importa. Maximize bônus, evite anuidades altas e aproveite trechos em economy com upgrade pontual.',
  },
  internationalist: {
    key: 'internationalist',
    emoji: '🌍',
    title: 'Internacionalista',
    description: 'Foco em destinos fora do Brasil. Programas com bons parceiros internacionais (Smiles + Air France/KLM, Latam Pass + oneworld) rendem mais.',
  },
  casual: {
    key: 'casual',
    emoji: '✈️',
    title: 'Viajante Casual',
    description: 'Equilibrado entre acumular e usar. Mantenha 1 ou 2 programas ativos e fique de olho em promos sazonais.',
  },
};

function classifyPersona(p: FormState): Persona {
  const income       = Number(p.monthlyIncome) || 0;
  const spending     = Number(p.monthlyCardSpending) || 0;
  const cards        = Number(p.numberOfCreditCards) || 0;
  const milesGoal    = Number(p.monthlyMilesGoal) || 0;
  const milesBalance = Number(p.currentMilesBalance) || 0;

  // Executivo Premium: cabine alta + alto gasto OR renda alta + cartões múltiplos
  if (
    (p.preferredCabinClass === 'Business' || p.preferredCabinClass === 'FirstClass') &&
    (spending >= 10000 || income >= 20000)
  ) return PERSONAS.executive;

  // Investidor de milhas: agressivo + interessado em upgrades + interessado em transfer promos
  if (
    p.investmentProfile === 'Aggressive' &&
    p.interestedInMilesTransferPromos &&
    (p.interestedInCardUpgrades || milesGoal >= 15000)
  ) return PERSONAS.investor;

  // Internacionalista: foco internacional sem doméstico
  if (p.prefersInternationalTravel && !p.prefersDomesticTravel) return PERSONAS.internationalist;

  // Iniciante: pouco gasto, pouco saldo, viaja raramente
  if (
    spending < 2000 && milesBalance < 10000 &&
    (p.travelFrequency === 'Rarely' || p.travelFrequency === 'Occasional') &&
    cards <= 1
  ) return PERSONAS.beginner;

  // Viajante Frequente Econômico: voa muito mas em economy
  if (
    (p.travelFrequency === 'Frequent' || p.travelFrequency === 'VeryFrequent') &&
    (p.preferredCabinClass === 'Economy' || p.preferredCabinClass === 'PremiumEconomy')
  ) return PERSONAS.frequentEconomy;

  return PERSONAS.casual;
}

// ── Componente ──────────────────────────────────────────────────────
export function UserProfileModal({ open, onClose, onSaved }: UserProfileModalProps) {
  const { user } = useAuth();

  const [step, setStep]                 = useState<1 | 2 | 3 | 4>(1); // 4 = tela de resultado
  const [form, setForm]                 = useState<FormState>(DEFAULT_FORM);
  const [loading, setLoading]           = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError]   = useState<string | null>(null);
  const [persona, setPersona]           = useState<Persona | null>(null);
  const [isUpdate, setIsUpdate]         = useState(false);

  // Carrega perfil existente (se houver) quando o modal abre.
  useEffect(() => {
    if (!open || !user) return;
    setStep(1);
    setSubmitError(null);
    setPersona(null);
    setLoading(true);
    userProfileService.obterPorUsuario(user.id)
      .then(profile => {
        setIsUpdate(true);
        setForm({
          monthlyIncome:                   String(profile.monthlyIncome ?? ''),
          investmentProfile:               profile.investmentProfile ?? 'Moderate',
          monthlyCardSpending:             String(profile.monthlyCardSpending ?? ''),
          annualCardFeeBudget:             String(profile.annualCardFeeBudget ?? ''),
          numberOfCreditCards:             String(profile.numberOfCreditCards ?? 1),
          travelFrequency:                 profile.travelFrequency ?? 'Occasional',
          preferredCabinClass:             profile.preferredCabinClass ?? 'Economy',
          preferredLoyaltyProgram:         profile.preferredLoyaltyProgram ?? 'Smiles',
          currentMilesBalance:             String(profile.currentMilesBalance ?? ''),
          monthlyMilesGoal:                String(profile.monthlyMilesGoal ?? ''),
          prefersDomesticTravel:           profile.prefersDomesticTravel ?? true,
          prefersInternationalTravel:      profile.prefersInternationalTravel ?? false,
          maxMilePurchasePrice:            String(profile.maxMilePurchasePrice ?? ''),
          interestedInCardUpgrades:        profile.interestedInCardUpgrades ?? false,
          interestedInMilesTransferPromos: profile.interestedInMilesTransferPromos ?? true,
        });
      })
      .catch(() => {
        setIsUpdate(false);
        setForm(DEFAULT_FORM);
      })
      .finally(() => setLoading(false));
  }, [open, user]);

  // Esc fecha o modal (acessibilidade — Nielsen #3).
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!user) { setSubmitError('Usuário não autenticado.'); return; }
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const dto: CreateUserProfileDto = {
        monthlyIncome:                   Number(form.monthlyIncome.replace(',', '.')) || 0,
        investmentProfile:               form.investmentProfile,
        monthlyCardSpending:             Number(form.monthlyCardSpending.replace(',', '.')) || 0,
        annualCardFeeBudget:             Number(form.annualCardFeeBudget.replace(',', '.')) || 0,
        numberOfCreditCards:             Number(form.numberOfCreditCards) || 0,
        travelFrequency:                 form.travelFrequency,
        preferredCabinClass:             form.preferredCabinClass,
        preferredLoyaltyProgram:         form.preferredLoyaltyProgram,
        currentMilesBalance:             Number(form.currentMilesBalance) || 0,
        monthlyMilesGoal:                Number(form.monthlyMilesGoal) || 0,
        prefersDomesticTravel:           form.prefersDomesticTravel,
        prefersInternationalTravel:      form.prefersInternationalTravel,
        maxMilePurchasePrice:            Number(form.maxMilePurchasePrice.replace(',', '.')) || 0,
        interestedInCardUpgrades:        form.interestedInCardUpgrades,
        interestedInMilesTransferPromos: form.interestedInMilesTransferPromos,
      };

      if (isUpdate) await userProfileService.atualizar(user.id, dto);
      else          await userProfileService.criar(user.id, dto);

      setPersona(classifyPersona(form));
      setStep(4);
      onSaved?.();
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Erro ao salvar perfil. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Estilos compartilhados ──────────────────────────────────────
  const inputBase = 'w-full py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/30 focus:border-[#1B3A5C] transition-all text-[#2C2C2C] placeholder:text-[#B0A99F]';
  const labelClass = 'block text-sm text-[#2C2C2C] mb-1.5';
  const helperClass = 'mt-1 text-xs text-[#7A7A7A]';

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
         onClick={isSubmitting ? undefined : onClose}
         role="dialog" aria-modal="true" aria-labelledby="profile-modal-title">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
           onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E4DF]">
          <h2 id="profile-modal-title" className="text-lg text-[#2C2C2C]">
            {step === 4 ? 'Seu perfil de milhas' : 'Perfil de viagem e investimento'}
          </h2>
          <button onClick={onClose} aria-label="Fechar"
            className="p-2 hover:bg-[#F7F5F2] rounded-full transition-colors">
            <X className="w-5 h-5 text-[#7A7A7A]" />
          </button>
        </div>

        {/* Progress bar (steps 1-3) */}
        {step !== 4 && (
          <div className="px-6 pt-4">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map(n => (
                <div key={n}
                  className={`flex-1 h-1.5 rounded-full transition-all ${
                    n <= step ? 'bg-[#1B3A5C]' : 'bg-[#E8E4DF]'
                  }`} />
              ))}
            </div>
            <p className="text-xs text-[#7A7A7A] mt-2">Passo {step} de 3</p>
          </div>
        )}

        {loading && (
          <div className="p-10 flex items-center justify-center">
            <Loader className="w-6 h-6 animate-spin text-[#1B3A5C]" />
          </div>
        )}

        {!loading && submitError && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <p className="text-red-600 text-sm">{submitError}</p>
          </div>
        )}

        {/* ── Passo 1: Financeiro ──────────────────────────────── */}
        {!loading && step === 1 && (
          <div className="p-6 space-y-4">
            <p className="text-sm text-[#7A7A7A]">
              Vamos entender seu lado financeiro para sugerir os cartões e programas que fazem mais sentido pra você.
            </p>

            <div>
              <label htmlFor="income" className={labelClass}>Renda mensal aproximada (R$)</label>
              <div className="relative">
                <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A7A7A]" />
                <input id="income" type="number" min="0" step="100" value={form.monthlyIncome}
                  onChange={e => set('monthlyIncome', e.target.value)}
                  className={`${inputBase} pl-12 pr-4 border-[#E8E4DF]`} placeholder="5000" />
              </div>
            </div>

            <div>
              <label className={labelClass}>Perfil de investimento</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Conservative', 'Moderate', 'Aggressive'] as InvestmentProfile[]).map(opt => (
                  <button key={opt} type="button"
                    onClick={() => set('investmentProfile', opt)}
                    className={`py-2.5 rounded-xl border text-sm transition-all ${
                      form.investmentProfile === opt
                        ? 'bg-[#1B3A5C] text-white border-[#1B3A5C]'
                        : 'bg-white text-[#2C2C2C] border-[#E8E4DF] hover:bg-[#F7F5F2]'
                    }`}>
                    {opt === 'Conservative' ? 'Conservador' : opt === 'Moderate' ? 'Moderado' : 'Arrojado'}
                  </button>
                ))}
              </div>
              <p className={helperClass}>Risco x retorno que você aceita correr.</p>
            </div>

            <div>
              <label htmlFor="spending" className={labelClass}>Gasto mensal médio no cartão (R$)</label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A7A7A]" />
                <input id="spending" type="number" min="0" step="100" value={form.monthlyCardSpending}
                  onChange={e => set('monthlyCardSpending', e.target.value)}
                  className={`${inputBase} pl-12 pr-4 border-[#E8E4DF]`} placeholder="3000" />
              </div>
            </div>

            <div>
              <label htmlFor="fee" className={labelClass}>Anuidade anual que aceita pagar (R$)</label>
              <div className="relative">
                <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A7A7A]" />
                <input id="fee" type="number" min="0" step="50" value={form.annualCardFeeBudget}
                  onChange={e => set('annualCardFeeBudget', e.target.value)}
                  className={`${inputBase} pl-12 pr-4 border-[#E8E4DF]`} placeholder="500" />
              </div>
              <p className={helperClass}>Use 0 se só topa cartões sem anuidade.</p>
            </div>

            <div>
              <label htmlFor="cards" className={labelClass}>Quantos cartões de crédito você usa hoje?</label>
              <input id="cards" type="number" min="0" max="20" value={form.numberOfCreditCards}
                onChange={e => set('numberOfCreditCards', e.target.value)}
                className={`${inputBase} px-4 border-[#E8E4DF]`} />
            </div>
          </div>
        )}

        {/* ── Passo 2: Viagem ──────────────────────────────────── */}
        {!loading && step === 2 && (
          <div className="p-6 space-y-4">
            <p className="text-sm text-[#7A7A7A]">
              Como você costuma viajar? Isso muda completamente qual programa rende mais pra você.
            </p>

            <div>
              <label className={labelClass}>Com que frequência você viaja de avião?</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { v: 'Rarely',       label: 'Quase nunca',  hint: '0-1 viagens/ano' },
                  { v: 'Occasional',   label: 'Eventualmente', hint: '2-4 viagens/ano' },
                  { v: 'Frequent',     label: 'Frequente',    hint: '5-10 viagens/ano' },
                  { v: 'VeryFrequent', label: 'Muito frequente', hint: '10+ viagens/ano' },
                ] as { v: TravelFrequency; label: string; hint: string }[]).map(opt => (
                  <button key={opt.v} type="button"
                    onClick={() => set('travelFrequency', opt.v)}
                    className={`py-3 px-3 rounded-xl border text-left transition-all ${
                      form.travelFrequency === opt.v
                        ? 'bg-[#1B3A5C] text-white border-[#1B3A5C]'
                        : 'bg-white text-[#2C2C2C] border-[#E8E4DF] hover:bg-[#F7F5F2]'
                    }`}>
                    <p className="text-sm">{opt.label}</p>
                    <p className={`text-xs ${form.travelFrequency === opt.v ? 'text-white/80' : 'text-[#7A7A7A]'}`}>{opt.hint}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="cabin" className={labelClass}>Classe que costuma voar</label>
              <div className="relative">
                <Plane className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A7A7A]" />
                <select id="cabin" value={form.preferredCabinClass}
                  onChange={e => set('preferredCabinClass', e.target.value as CabinClass)}
                  className={`${inputBase} pl-12 pr-4 appearance-none border-[#E8E4DF]`}>
                  <option value="Economy">Econômica</option>
                  <option value="PremiumEconomy">Econômica Premium</option>
                  <option value="Business">Executiva</option>
                  <option value="FirstClass">Primeira Classe</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Que tipo de viagem você prioriza?</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-[#E8E4DF] hover:bg-[#F7F5F2] cursor-pointer">
                  <input type="checkbox" checked={form.prefersDomesticTravel}
                    onChange={e => set('prefersDomesticTravel', e.target.checked)}
                    className="w-4 h-4 accent-[#1B3A5C]" />
                  <Globe2 className="w-4 h-4 text-[#7A7A7A]" />
                  <span className="text-sm text-[#2C2C2C]">Viagens nacionais</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-xl border border-[#E8E4DF] hover:bg-[#F7F5F2] cursor-pointer">
                  <input type="checkbox" checked={form.prefersInternationalTravel}
                    onChange={e => set('prefersInternationalTravel', e.target.checked)}
                    className="w-4 h-4 accent-[#1B3A5C]" />
                  <Globe2 className="w-4 h-4 text-[#7A7A7A]" />
                  <span className="text-sm text-[#2C2C2C]">Viagens internacionais</span>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="program" className={labelClass}>Programa de fidelidade preferido</label>
              <div className="relative">
                <Plane className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A7A7A]" />
                <select id="program" value={form.preferredLoyaltyProgram}
                  onChange={e => set('preferredLoyaltyProgram', e.target.value as LoyaltyProgram)}
                  className={`${inputBase} pl-12 pr-4 appearance-none border-[#E8E4DF]`}>
                  <option value="Smiles">Smiles (Gol)</option>
                  <option value="Latam">Latam Pass</option>
                  <option value="Azul">TudoAzul</option>
                  <option value="Multiplus">Multiplus</option>
                  <option value="Livelo">Livelo</option>
                  <option value="Esfera">Esfera (Santander)</option>
                  <option value="Other">Outro</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ── Passo 3: Milhas ──────────────────────────────────── */}
        {!loading && step === 3 && (
          <div className="p-6 space-y-4">
            <p className="text-sm text-[#7A7A7A]">
              Por último, sobre suas milhas — isso ajuda a calcular metas e identificar promoções vantajosas.
            </p>

            <div>
              <label htmlFor="balance" className={labelClass}>Saldo atual de milhas (estimativa)</label>
              <div className="relative">
                <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A7A7A]" />
                <input id="balance" type="number" min="0" step="1000" value={form.currentMilesBalance}
                  onChange={e => set('currentMilesBalance', e.target.value)}
                  className={`${inputBase} pl-12 pr-4 border-[#E8E4DF]`} placeholder="50000" />
              </div>
            </div>

            <div>
              <label htmlFor="goal" className={labelClass}>Meta de milhas por mês</label>
              <div className="relative">
                <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A7A7A]" />
                <input id="goal" type="number" min="0" step="500" value={form.monthlyMilesGoal}
                  onChange={e => set('monthlyMilesGoal', e.target.value)}
                  className={`${inputBase} pl-12 pr-4 border-[#E8E4DF]`} placeholder="10000" />
              </div>
            </div>

            <div>
              <label htmlFor="maxPrice" className={labelClass}>Preço máximo aceitável por milha (R$)</label>
              <div className="relative">
                <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A7A7A]" />
                <input id="maxPrice" type="number" min="0" step="0.001" value={form.maxMilePurchasePrice}
                  onChange={e => set('maxMilePurchasePrice', e.target.value)}
                  className={`${inputBase} pl-12 pr-4 border-[#E8E4DF]`} placeholder="0,025" />
              </div>
              <p className={helperClass}>Ex.: 0,025 = R$ 25 por mil milhas. Acima disso, não compra.</p>
            </div>

            <div className="space-y-2 pt-2">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-[#E8E4DF] hover:bg-[#F7F5F2] cursor-pointer">
                <input type="checkbox" checked={form.interestedInCardUpgrades}
                  onChange={e => set('interestedInCardUpgrades', e.target.checked)}
                  className="w-4 h-4 accent-[#1B3A5C]" />
                <span className="text-sm text-[#2C2C2C]">Quero ser avisado(a) sobre <strong>upgrades de cartão</strong></span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-xl border border-[#E8E4DF] hover:bg-[#F7F5F2] cursor-pointer">
                <input type="checkbox" checked={form.interestedInMilesTransferPromos}
                  onChange={e => set('interestedInMilesTransferPromos', e.target.checked)}
                  className="w-4 h-4 accent-[#1B3A5C]" />
                <span className="text-sm text-[#2C2C2C]">Quero ser avisado(a) sobre <strong>promoções de transferência</strong> (bônus 100%, 150%)</span>
              </label>
            </div>
          </div>
        )}

        {/* ── Passo 4: Resultado ───────────────────────────────── */}
        {!loading && step === 4 && persona && (
          <div className="p-6 space-y-4 text-center">
            <div className="flex items-center justify-center gap-2 text-[#C5A46A]">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm">Perfil salvo com sucesso</span>
            </div>
            <div className="text-6xl py-2">{persona.emoji}</div>
            <h3 className="text-2xl text-[#2C2C2C]">{persona.title}</h3>
            <p className="text-sm text-[#7A7A7A] leading-relaxed">{persona.description}</p>
            <div className="bg-[#EEF3F8] border border-[#A0B4C8]/40 rounded-2xl p-4 text-left">
              <p className="text-xs text-[#7A7A7A] uppercase tracking-wide mb-1">Resumo</p>
              <p className="text-sm text-[#2C2C2C]">
                Programa favorito: <strong>{form.preferredLoyaltyProgram}</strong> • Classe: <strong>{form.preferredCabinClass}</strong>
              </p>
              <p className="text-sm text-[#2C2C2C]">
                Meta mensal: <strong>{Number(form.monthlyMilesGoal || 0).toLocaleString('pt-BR')} milhas</strong>
              </p>
            </div>
          </div>
        )}

        {/* ── Footer: navegação ────────────────────────────────── */}
        {!loading && (
          <div className="flex gap-3 px-6 pb-6 pt-2">
            {step === 4 ? (
              <button onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-[#1B3A5C] text-white hover:bg-[#2A527A] transition-colors flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Concluído
              </button>
            ) : (
              <>
                {step > 1 && (
                  <button onClick={() => setStep(s => (s - 1) as 1 | 2 | 3)} disabled={isSubmitting}
                    className="flex-1 py-3 rounded-xl border border-[#E8E4DF] text-[#2C2C2C] hover:bg-[#F7F5F2] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Voltar
                  </button>
                )}
                {step < 3 && (
                  <button onClick={() => setStep(s => (s + 1) as 2 | 3)}
                    className="flex-1 py-3 rounded-xl bg-[#1B3A5C] text-white hover:bg-[#2A527A] transition-colors flex items-center justify-center gap-2">
                    Próximo <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                {step === 3 && (
                  <button onClick={handleSubmit} disabled={isSubmitting}
                    className="flex-1 py-3 rounded-xl bg-[#1B3A5C] text-white hover:bg-[#2A527A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {isSubmitting ? <><Loader className="w-4 h-4 animate-spin" /> Salvando...</> : <>Salvar e descobrir meu perfil <Sparkles className="w-4 h-4" /></>}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
