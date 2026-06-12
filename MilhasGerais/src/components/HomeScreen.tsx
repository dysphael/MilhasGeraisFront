import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Plus, ArrowRightLeft, History, TrendingUp, AlertCircle, Clock, Tag, CreditCard as CreditCardIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { dashboardService } from '../services/dashboardService';
import { DashboardResumo, DashboardPrograma, DashboardTransacao, DashboardAlert } from '../types';
import { PageBackground, AppHeader, LoadingPage, ErrorPage } from './Layout';
import { AdicionarMilhasModal } from './modals/AdicionarMilhasModal';
import { TransferirMilhasModal } from './modals/TransferirMilhasModal';
import { useCreditCards } from '../hooks/useCreditCards';

interface HomeScreenProps { onLogout: () => void; }

type ModalAberto = 'adicionar' | 'transferir' | null;

export function HomeScreen({ onLogout }: HomeScreenProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardResumo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState<ModalAberto>(null);
  const { cards } = useCreditCards(user?.id);

  const carregarDashboard = () => {
    setIsLoading(true);
    dashboardService.obterResumo()
      .then(data => { setDashboard(data); setError(null); })
      .catch(() => setError('Erro ao carregar dados do dashboard'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { carregarDashboard(); }, []);

  if (isLoading) return <LoadingPage message="Carregando dados..." />;
  if (error || !dashboard) return <ErrorPage message={error || 'Erro ao carregar dados'} />;

  const totalMiles = dashboard.programas.reduce((s, p) => s + p.miles, 0);

  return (
    <PageBackground>
      {/* Modais */}
      {modalAberto === 'adicionar' && (
        <AdicionarMilhasModal
          onClose={() => setModalAberto(null)}
          onSuccess={carregarDashboard}
          userId={user?.id ?? 1}
          programas={dashboard.programas}
          cards={cards}
        />
      )}
      {modalAberto === 'transferir' && (
        <TransferirMilhasModal
          onClose={() => setModalAberto(null)}
          programas={dashboard.programas}
        />
      )}

      <AppHeader
        title={`Olá, ${user?.name || 'Usuário'}`}
        subtitle="Bem-vindo de volta"
        onLogout={() => { onLogout(); navigate('/login'); }}
        right={
          <button className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition-all">
            <Bell className="w-5 h-5" />
          </button>
        }
      />

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">

        {/* Banner saldo total */}
        <div className="bg-white/15 backdrop-blur-sm rounded-3xl p-6 text-white shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Saldo Total</p>
              <h2 className="text-4xl mt-1">{totalMiles.toLocaleString('pt-BR')}</h2>
              <p className="text-sm opacity-80 mt-1">milhas acumuladas</p>
            </div>
            <button onClick={() => navigate('/graphs')}
              className="flex items-center gap-2 px-4 py-2 bg-white/15 rounded-full hover:bg-white/25 transition-all text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>Gráficos</span>
            </button>
          </div>
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
            {
              icon: <Plus className="w-6 h-6 text-[#1B3A5C]" />,
              label: 'Adicionar',
              bg: 'bg-[#EEF3F8]',
              onClick: () => setModalAberto('adicionar'),
            },
            {
              icon: <ArrowRightLeft className="w-6 h-6 text-[#6B9FBF]" />,
              label: 'Transferir',
              bg: 'bg-[#EEF3F8]',
              onClick: () => setModalAberto('transferir'),
            },
            {
              icon: <History className="w-6 h-6 text-[#2C2C2C]" />,
              label: 'Histórico',
              bg: 'bg-[#EDE9E4]',
              onClick: () => navigate('/historico'),
            },
            {
              icon: <Tag className="w-6 h-6 text-[#C5A46A]" />,
              label: 'Cotações',
              bg: 'bg-[#FDF6EE]',
              onClick: () => navigate('/cotacoes'),
            },
            {
              icon: <CreditCardIcon className="w-6 h-6 text-[#1B3A5C]" />,
              label: 'Cartões',
              bg: 'bg-[#EEF3F8]',
              onClick: () => navigate('/cartoes'),
            },
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

        {/* Últimas movimentações */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg text-white">Últimas Movimentações</h3>
            <button onClick={() => navigate('/historico')}
              className="text-sm text-white/70 hover:text-white transition-colors">
              Ver tudo
            </button>
          </div>
          <div className="bg-white/90 backdrop-blur-sm border border-white/50 rounded-2xl divide-y divide-[#E8E4DF] shadow-md">
            {dashboard.transacoes.slice(0, 3).map((tx: DashboardTransacao) => (
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
    </PageBackground>
  );
}
