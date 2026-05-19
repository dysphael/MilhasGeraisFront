import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Plus, ArrowRightLeft, History, TrendingUp, Target, AlertCircle, Clock, BarChart3, Tag, CreditCard as CreditCardIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { dashboardService } from '../services/dashboardService';
import { creditCardService } from '../services/creditCardService';
import { milesGoalService } from '../services/milesGoalService';
import { DashboardResumo, DashboardPrograma, DashboardTransacao, DashboardAlert, CreditCard, MilesGoal } from '../types';
import { AddTransactionModal } from './AddTransactionModal';
import { AddCreditCardModal } from './AddCreditCardModal';
import { MilesGoalsModal } from './MilesGoalsModal';
import { PageBackground, AppHeader, LoadingPage, ErrorPage } from './Layout';

interface HomeScreenProps { onLogout: () => void; }

const CHART_COLORS = ['#1B3A5C', '#6B9FBF', '#C5A46A', '#A0B4C8', '#8C7B6B'];

export function HomeScreen({ onLogout }: HomeScreenProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardResumo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [goals, setGoals] = useState<MilesGoal[]>([]);

  const loadDashboard = () => {
    dashboardService.obterResumo()
      .then(data => { setDashboard(data); setError(null); })
      .catch(() => setError('Erro ao carregar dados do dashboard'))
      .finally(() => setIsLoading(false));
  };

  const loadCards = () => {
    creditCardService.listar()
      .then(all => setCards(user ? all.filter(c => c.userId === user.id) : all))
      .catch(() => { /* silencioso — falha não bloqueia o dashboard */ });
  };

  const loadGoals = () => {
    if (!user) return;
    milesGoalService.listarPorUsuario(user.id)
      .then(setGoals)
      .catch(() => { /* silencioso */ });
  };

  useEffect(() => { loadDashboard(); loadCards(); loadGoals(); }, [user?.id]);

  if (isLoading) return <LoadingPage message="Carregando dados..." />;
  if (error || !dashboard) return <ErrorPage message={error || 'Erro ao carregar dados'} />;

  const totalMiles = dashboard.programas.reduce((s, p) => s + p.miles, 0);

  // Próxima meta = menor TargetMiles que ainda não foi atingida. Se todas batidas, pega a maior.
  const nextGoal = (() => {
    const pending = goals.filter(g => g.targetMiles > totalMiles).sort((a, b) => a.targetMiles - b.targetMiles)[0];
    if (pending) return pending;
    return goals.slice().sort((a, b) => b.targetMiles - a.targetMiles)[0] ?? null;
  })();
  const nextGoalAchieved = nextGoal ? totalMiles >= nextGoal.targetMiles : false;
  const nextGoalProgress = nextGoal
    ? Math.min(100, (totalMiles / nextGoal.targetMiles) * 100)
    : 0;
  const nextGoalRemaining = nextGoal ? Math.max(0, nextGoal.targetMiles - totalMiles) : 0;

  return (
    <PageBackground>
      <AppHeader
        title={`Olá, ${user?.name || 'Usuário'}`}
        subtitle="Bem-vindo de volta"
        onLogout={() => { onLogout(); navigate('/login'); }}
        right={
          <button className="relative p-2 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition-all">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#C5A46A] rounded-full" />
          </button>
        }
      />

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">

        {/* Banner saldo total */}
        <div className="bg-white/15 backdrop-blur-sm rounded-3xl p-6 text-white shadow-lg border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm opacity-80">Saldo Total</p>
              <h2 className="text-4xl mt-1">{totalMiles.toLocaleString('pt-BR')}</h2>
              <p className="text-sm opacity-80 mt-1">milhas acumuladas</p>
            </div>
            <button onClick={() => navigate('/graphs')}
              className="p-3 bg-white/15 rounded-full hover:bg-white/25 transition-all">
              <TrendingUp className="w-6 h-6" />
            </button>
          </div>
          <button onClick={() => setShowGoalsModal(true)}
            className="w-full text-left bg-white/15 hover:bg-white/20 rounded-2xl p-4 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span className="text-sm">{nextGoal ? 'Próxima meta' : 'Crie sua primeira meta'}</span>
              </div>
              <span className="text-xs opacity-80 underline-offset-2 hover:underline">Gerenciar</span>
            </div>
            {nextGoal ? (
              <>
                <p className="text-sm opacity-90">
                  <span className="opacity-100">{nextGoal.name}</span>
                  {' — '}
                  {nextGoalAchieved
                    ? 'meta atingida 🎉'
                    : `faltam ${nextGoalRemaining.toLocaleString('pt-BR')} milhas`}
                </p>
                <div className="mt-2 bg-white/25 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-white h-full rounded-full transition-all"
                    style={{ width: `${nextGoalProgress}%` }} />
                </div>
              </>
            ) : (
              <p className="text-sm opacity-90">Defina um destino e quantas milhas você precisa.</p>
            )}
          </button>
        </div>

        {/* Alertas */}
        {dashboard.alerts?.map((alert: DashboardAlert) => (
          <div key={alert.id}
            className={`flex items-start gap-3 p-4 rounded-2xl border ${
              alert.type === 'warning'
                ? 'bg-white/90 border-[#C5A46A]/40'
                : 'bg-white/90 border-white/50'
            }`}>
            {alert.type === 'warning'
              ? <Clock className="w-5 h-5 text-[#C5A46A] mt-0.5" />
              : <AlertCircle className="w-5 h-5 text-[#1B3A5C] mt-0.5" />}
            <p className="text-sm text-[#2C2C2C]">{alert.text}</p>
          </div>
        ))}

        {/* Atalhos rápidos */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: <Plus className="w-6 h-6 text-[#1B3A5C]" />,            label: 'Adicionar', bg: 'bg-[#EEF3F8]', onClick: () => setShowAddModal(true) },
            { icon: <CreditCardIcon className="w-6 h-6 text-[#1B3A5C]" />,  label: 'Cartões',   bg: 'bg-[#EEF3F8]', onClick: () => setShowCardModal(true) },
            { icon: <History className="w-6 h-6 text-[#2C2C2C]" />,         label: 'Histórico', bg: 'bg-[#EDE9E4]' },
            { icon: <Tag className="w-6 h-6 text-[#C5A46A]" />,              label: 'Cotações',  bg: 'bg-[#FDF6EE]', onClick: () => navigate('/cotacoes') },
          ].map(({ icon, label, bg, onClick }) => (
            <button key={label} onClick={onClick}
              className="bg-white/90 backdrop-blur-sm border border-white/50 p-4 rounded-2xl hover:bg-white hover:shadow-lg transition-all flex flex-col items-center gap-2">
              <div className={`w-12 h-12 ${bg} rounded-full flex items-center justify-center`}>
                {icon}
              </div>
              <span className="text-xs text-[#7A7A7A] text-center">{label}</span>
            </button>
          ))}
        </div>

        {/* Meus cartões */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg text-white">Meus cartões</h3>
            <button onClick={() => setShowCardModal(true)}
              className="text-sm text-white/90 hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 transition-all">
              <Plus className="w-4 h-4" /> Adicionar
            </button>
          </div>
          {cards.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-sm border border-white/50 rounded-2xl p-6 text-center">
              <CreditCardIcon className="w-8 h-8 text-[#B0A99F] mx-auto mb-2" />
              <p className="text-sm text-[#7A7A7A]">Você ainda não tem cartões cadastrados.</p>
              <button onClick={() => setShowCardModal(true)}
                className="mt-3 px-4 py-2 rounded-xl bg-[#1B3A5C] text-white text-sm hover:bg-[#2A527A] transition-colors">
                Adicionar cartão
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {cards.map(card => (
                <div key={card.id}
                  className="bg-white/90 backdrop-blur-sm border border-white/50 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#EEF3F8] rounded-xl flex items-center justify-center">
                      <CreditCardIcon className="w-6 h-6 text-[#1B3A5C]" />
                    </div>
                    <div>
                      <p className="text-[#2C2C2C]">{card.brand}</p>
                      <p className="text-xs text-[#7A7A7A]">final {card.cardNumber.slice(-4)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Programas */}
        <div>
          <h3 className="text-lg text-white mb-3">Seus Programas</h3>
          <div className="space-y-2">
            {dashboard.programas.map((program: DashboardPrograma) => (
              <div key={program.id}
                className="bg-white/90 backdrop-blur-sm border border-white/50 rounded-2xl p-4 hover:bg-white hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#EDE9E4] rounded-xl flex items-center justify-center text-2xl">
                      {program.logo}
                    </div>
                    <div>
                      <p className="text-[#2C2C2C]">{program.name}</p>
                      <p className="text-xs text-[#7A7A7A]">Programa de milhas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl text-[#1B3A5C]">{program.miles.toLocaleString('pt-BR')}</p>
                    <p className="text-xs text-[#7A7A7A]">milhas</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico rápido */}
        <div className="bg-white/90 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#7A7A7A]" />
              <h3 className="text-lg text-[#2C2C2C]">Visão Rápida</h3>
            </div>
            <button onClick={() => navigate('/graphs')}
              className="text-sm text-[#1B3A5C] hover:text-[#6B9FBF] transition-colors flex items-center gap-1">
              Ver mais <TrendingUp className="w-4 h-4" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dashboard.programas.map(p => ({ name: p.name, miles: p.miles }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DF" />
              <XAxis dataKey="name" stroke="#B0A99F" fontSize={12} />
              <YAxis stroke="#B0A99F" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E8E4DF', borderRadius: '12px', color: '#2C2C2C' }} />
              <Bar dataKey="miles" radius={[8, 8, 0, 0]}>
                {dashboard.programas.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Últimas movimentações */}
        <div>
          <h3 className="text-lg text-white mb-3">Últimas Movimentações</h3>
          <div className="bg-white/90 backdrop-blur-sm border border-white/50 rounded-2xl divide-y divide-[#E8E4DF] shadow-md">
            {dashboard.transacoes.map((tx: DashboardTransacao) => (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-white/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${
                    tx.type === 'credit'   ? 'bg-[#EEF3F8] text-[#1B3A5C]'
                    : tx.type === 'debit' ? 'bg-red-50 text-red-500'
                    : 'bg-[#FDF6EE] text-[#C5A46A]'
                  }`}>
                    {tx.type === 'credit' ? '+' : tx.type === 'debit' ? '−' : <ArrowRightLeft className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm text-[#2C2C2C]">{tx.description}</p>
                    <p className="text-xs text-[#7A7A7A]">{tx.program} · {tx.date}</p>
                  </div>
                </div>
                <p className={`text-sm ${
                  tx.type === 'credit'   ? 'text-[#1B3A5C]'
                  : tx.type === 'debit' ? 'text-red-500'
                  : 'text-[#C5A46A]'
                }`}>
                  {tx.type === 'credit' ? '+' : tx.type === 'debit' ? '−' : ''}
                  {tx.amount.toLocaleString('pt-BR')}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      <AddTransactionModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={loadDashboard}
      />

      <AddCreditCardModal
        open={showCardModal}
        onClose={() => setShowCardModal(false)}
        onCreated={loadCards}
      />

      <MilesGoalsModal
        open={showGoalsModal}
        onClose={() => setShowGoalsModal(false)}
        totalMiles={totalMiles}
        onChanged={loadGoals}
      />
    </PageBackground>
  );
}
