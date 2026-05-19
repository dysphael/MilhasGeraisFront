import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Plus, ArrowRightLeft, History, TrendingUp, Target, AlertCircle, Clock, BarChart3, LogOut, Tag } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { dashboardService } from '../services/dashboardService';
import { Programa, Transacao, Alert, DashboardResumo } from '../types';

interface HomeScreenProps {
  onLogout: () => void;
}

export function HomeScreen({ onLogout }: HomeScreenProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardResumo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const data = await dashboardService.obterResumo();
        setDashboard(data);
        setError(null);
      } catch (err: any) {
        setError('Erro ao carregar dados do dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#C2EFEB]/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#054A91] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="min-h-screen bg-[#C2EFEB]/20 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Erro ao carregar dados'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#054A91] text-white rounded-lg hover:bg-[#6EA4BF] transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const totalMiles = dashboard.programas.reduce((sum, p) => sum + p.miles, 0);

  return (
    <div className="min-h-screen bg-[#C2EFEB]/20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl text-gray-800">Olá, {user?.name || 'Usuário'}</h1>
            <p className="text-sm text-gray-600">Bem-vindo de volta</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="w-6 h-6 text-gray-700" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button
              onClick={() => { onLogout(); navigate('/login'); }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Sair"
            >
              <LogOut className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Saldo total */}
        <div className="bg-gradient-to-br from-[#054A91] to-[#6EA4BF] rounded-3xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm opacity-90">Saldo Total</p>
              <h2 className="text-4xl mt-1">{totalMiles.toLocaleString('pt-BR')}</h2>
              <p className="text-sm opacity-90 mt-1">milhas acumuladas</p>
            </div>
            <button
              onClick={() => navigate('/graphs')}
              className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all"
            >
              <TrendingUp className="w-6 h-6" />
            </button>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4" />
              <span className="text-sm">Próxima meta</span>
            </div>
            <p className="text-sm opacity-90">Faltam 12.000 milhas para sua próxima viagem</p>
            <div className="mt-3 bg-white/30 rounded-full h-2 overflow-hidden">
              <div className="bg-white h-full rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
        </div>

        {/* Notificações */}
        {dashboard.alerts && dashboard.alerts.length > 0 && (
          <div className="space-y-2">
            {dashboard.alerts.map((alert: Alert) => (
              <div
                key={alert.id}
                className={`flex items-start gap-3 p-4 rounded-2xl ${
                  alert.type === 'warning'
                    ? 'bg-orange-50 border border-orange-200'
                    : 'bg-[#C2EFEB]/50 border border-[#6EA4BF]/30'
                }`}
              >
                {alert.type === 'warning'
                  ? <Clock className="w-5 h-5 text-orange-600 mt-0.5" />
                  : <AlertCircle className="w-5 h-5 text-[#054A91] mt-0.5" />
                }
                <p className="text-sm text-gray-700 flex-1">{alert.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* Atalhos rápidos — agora com 4 botões incluindo Cotações */}
        <div className="grid grid-cols-4 gap-3">
          <button className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-[#C2EFEB] rounded-full flex items-center justify-center">
              <Plus className="w-6 h-6 text-[#054A91]" />
            </div>
            <span className="text-xs text-gray-700 text-center">Adicionar Programa</span>
          </button>

          <button className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-[#C2EFEB] rounded-full flex items-center justify-center">
              <ArrowRightLeft className="w-6 h-6 text-[#6EA4BF]" />
            </div>
            <span className="text-xs text-gray-700 text-center">Transferir</span>
          </button>

          <button className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-[#C2EFEB] rounded-full flex items-center justify-center">
              <History className="w-6 h-6 text-[#748944]" />
            </div>
            <span className="text-xs text-gray-700 text-center">Histórico</span>
          </button>

          <button
            onClick={() => navigate('/cotacoes')}
            className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-2"
          >
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
              <Tag className="w-6 h-6 text-orange-500" />
            </div>
            <span className="text-xs text-gray-700 text-center">Cotações</span>
          </button>
        </div>

        {/* Programas */}
        <div>
          <h3 className="text-lg text-gray-800 mb-3">Seus Programas</h3>
          <div className="space-y-3">
            {dashboard.programas.map((program: Programa) => (
              <div key={program.id} className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${program.color} rounded-xl flex items-center justify-center text-2xl`}>
                      {program.logo}
                    </div>
                    <div>
                      <p className="text-gray-800">{program.name}</p>
                      <p className="text-sm text-gray-500">Programa de milhas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl text-gray-800">{program.miles.toLocaleString('pt-BR')}</p>
                    <p className="text-xs text-gray-500">milhas</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico rápido */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg text-gray-800">Visão Rápida</h3>
            </div>
            <button
              onClick={() => navigate('/graphs')}
              className="text-sm text-[#054A91] hover:text-[#6EA4BF] transition-colors flex items-center gap-1"
            >
              Ver mais <TrendingUp className="w-4 h-4" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dashboard.programas.map(p => ({ name: p.name, miles: p.miles }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Bar dataKey="miles" radius={[8, 8, 0, 0]}>
                {dashboard.programas.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6EA4BF' : '#054A91'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Últimas movimentações */}
        <div>
          <h3 className="text-lg text-gray-800 mb-3">Últimas Movimentações</h3>
          <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
            {dashboard.transacoes.map((transaction: Transacao) => (
              <div key={transaction.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'credit' ? 'bg-green-100'
                    : transaction.type === 'debit' ? 'bg-red-100'
                    : 'bg-[#C2EFEB]'
                  }`}>
                    {transaction.type === 'credit'   && <span className="text-green-600">+</span>}
                    {transaction.type === 'debit'    && <span className="text-red-600">-</span>}
                    {transaction.type === 'transfer' && <ArrowRightLeft className="w-4 h-4 text-[#054A91]" />}
                  </div>
                  <div>
                    <p className="text-sm text-gray-800">{transaction.description}</p>
                    <p className="text-xs text-gray-500">{transaction.program} • {transaction.date}</p>
                  </div>
                </div>
                <p className={`${
                  transaction.type === 'credit'   ? 'text-green-600'
                  : transaction.type === 'debit'  ? 'text-red-600'
                  : 'text-[#054A91]'
                }`}>
                  {transaction.type === 'credit'  && '+'}
                  {transaction.type === 'debit'   && '-'}
                  {transaction.amount.toLocaleString('pt-BR')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
