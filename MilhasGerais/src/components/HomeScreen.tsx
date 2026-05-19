import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Plus, ArrowRightLeft, History, TrendingUp, Target, AlertCircle, Clock, BarChart3, LogOut, Tag } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { dashboardService } from '../services/dashboardService';
import { DashboardResumo, DashboardPrograma, DashboardTransacao, DashboardAlert } from '../types';
import { AddTransactionModal } from './AddTransactionModal';

interface HomeScreenProps { onLogout: () => void; }

const CHART_COLORS = ['#1B3A5C', '#6B9FBF', '#C5A46A', '#A0B4C8', '#8C7B6B'];

export function HomeScreen({ onLogout }: HomeScreenProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardResumo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadDashboard = () => {
    dashboardService.obterResumo()
      .then(data => { setDashboard(data); setError(null); })
      .catch(() => setError('Erro ao carregar dados do dashboard'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { loadDashboard(); }, []);

  if (isLoading) return (
    <div className="min-h-screen bg-[#F7F5F2] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1B3A5C] mx-auto mb-4" />
        <p className="text-[#7A7A7A]">Carregando dados...</p>
      </div>
    </div>
  );

  if (error || !dashboard) return (
    <div className="min-h-screen bg-[#F7F5F2] flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-red-600 mb-4">{error || 'Erro ao carregar dados'}</p>
        <button onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#1B3A5C] text-white rounded-xl hover:bg-[#2A527A] transition-colors">
          Tentar novamente
        </button>
      </div>
    </div>
  );

  const totalMiles = dashboard.programas.reduce((s, p) => s + p.miles, 0);

  return (
    <div className="min-h-screen bg-[#F7F5F2]">

      {/* Header */}
      <header className="bg-white border-b border-[#E8E4DF]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl text-[#2C2C2C]">Olá, {user?.name || 'Usuário'}</h1>
            <p className="text-sm text-[#7A7A7A]">Bem-vindo de volta</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 hover:bg-[#F7F5F2] rounded-full transition-colors">
              <Bell className="w-6 h-6 text-[#7A7A7A]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#C5A46A] rounded-full" />
            </button>
            <button onClick={() => { onLogout(); navigate('/login'); }}
              className="p-2 hover:bg-[#F7F5F2] rounded-full transition-colors" title="Sair">
              <LogOut className="w-6 h-6 text-[#7A7A7A]" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">

        {/* Banner saldo total */}
        <div className="bg-gradient-to-br from-[#1B3A5C] to-[#3A6B9A] rounded-3xl p-6 text-white shadow-lg">
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
          {/* Meta */}
          <div className="bg-white/15 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4" />
              <span className="text-sm">Próxima meta</span>
            </div>
            <p className="text-sm opacity-90">Faltam 12.000 milhas para sua próxima viagem</p>
            <div className="mt-2 bg-white/25 rounded-full h-1.5 overflow-hidden">
              <div className="bg-white h-full rounded-full" style={{ width: '75%' }} />
            </div>
          </div>
        </div>

        {/* Alertas */}
        {dashboard.alerts?.map((alert: DashboardAlert) => (
          <div key={alert.id}
            className={`flex items-start gap-3 p-4 rounded-2xl border ${
              alert.type === 'warning'
                ? 'bg-[#FDF6EE] border-[#C5A46A]/30'
                : 'bg-[#EEF3F8] border-[#6B9FBF]/30'
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
            { icon: <Plus className="w-6 h-6 text-[#1B3A5C]" />,       label: 'Adicionar', bg: 'bg-[#EEF3F8]', onClick: () => setShowAddModal(true) },
            { icon: <ArrowRightLeft className="w-6 h-6 text-[#6B9FBF]" />, label: 'Transferir', bg: 'bg-[#EEF3F8]' },
            { icon: <History className="w-6 h-6 text-[#2C2C2C]" />,    label: 'Histórico', bg: 'bg-[#EDE9E4]' },
            { icon: <Tag className="w-6 h-6 text-[#C5A46A]" />,         label: 'Cotações',  bg: 'bg-[#FDF6EE]', onClick: () => navigate('/cotacoes') },
          ].map(({ icon, label, bg, onClick }) => (
            <button key={label} onClick={onClick}
              className="bg-white border border-[#E8E4DF] p-4 rounded-2xl hover:shadow-sm transition-all flex flex-col items-center gap-2">
              <div className={`w-12 h-12 ${bg} rounded-full flex items-center justify-center`}>
                {icon}
              </div>
              <span className="text-xs text-[#7A7A7A] text-center">{label}</span>
            </button>
          ))}
        </div>

        {/* Programas */}
        <div>
          <h3 className="text-lg text-[#2C2C2C] mb-3">Seus Programas</h3>
          <div className="space-y-2">
            {dashboard.programas.map((program: DashboardPrograma) => (
              <div key={program.id} className="bg-white border border-[#E8E4DF] rounded-2xl p-4 hover:shadow-sm transition-all">
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
        <div className="bg-white border border-[#E8E4DF] rounded-2xl p-6">
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
          <h3 className="text-lg text-[#2C2C2C] mb-3">Últimas Movimentações</h3>
          <div className="bg-white border border-[#E8E4DF] rounded-2xl divide-y divide-[#E8E4DF]">
            {dashboard.transacoes.map((tx: DashboardTransacao) => (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-[#F7F5F2] transition-colors">
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
    </div>
  );
}
