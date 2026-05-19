import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PieChart as PieChartIcon, BarChart3, TrendingUp, AlertTriangle, LogOut } from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell,
} from 'recharts';
import { dashboardService } from '../services/dashboardService';
import { AnalyticsData } from '../types';

interface GraphsScreenProps { onLogout: () => void; }

const CHART_COLORS = ['#1B3A5C', '#6B9FBF', '#C5A46A', '#A0B4C8', '#8C7B6B'];

export function GraphsScreen({ onLogout }: GraphsScreenProps) {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    dashboardService.obterAnalytics()
      .then(data => { setAnalytics(data); setError(null); })
      .catch(() => setError('Erro ao carregar gráficos'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return (
    <div className="min-h-screen bg-[#F7F5F2] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1B3A5C] mx-auto mb-4" />
        <p className="text-[#7A7A7A]">Carregando gráficos...</p>
      </div>
    </div>
  );

  if (error || !analytics) return (
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

  const totalMiles = analytics.programas.reduce((s, p) => s + p.miles, 0);

  const tooltipStyle = {
    backgroundColor: '#fff',
    border: '1px solid #E8E4DF',
    borderRadius: '12px',
    color: '#2C2C2C',
  };

  return (
    <div className="min-h-screen bg-[#F7F5F2]">

      {/* Header */}
      <header className="bg-white border-b border-[#E8E4DF]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/home')} className="p-2 hover:bg-[#F7F5F2] rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-[#7A7A7A]" />
            </button>
            <div>
              <h1 className="text-2xl text-[#2C2C2C]">Análise de Milhas</h1>
              <p className="text-sm text-[#7A7A7A]">Visualize seus dados</p>
            </div>
          </div>
          <button onClick={() => { onLogout(); navigate('/login'); }}
            className="p-2 hover:bg-[#F7F5F2] rounded-full transition-colors">
            <LogOut className="w-6 h-6 text-[#7A7A7A]" />
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">

        {/* Cards resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: <BarChart3 className="w-5 h-5 text-[#1B3A5C]" />, bg: 'bg-[#EEF3F8]', label: 'Total Acumulado', value: totalMiles.toLocaleString('pt-BR'), sub: `em ${analytics.programas.length} programas` },
            { icon: <TrendingUp className="w-5 h-5 text-[#6B9FBF]" />, bg: 'bg-[#EEF3F8]',  label: 'Crescimento',    value: analytics.crescimento, sub: 'nos últimos 30 dias', valueColor: 'text-[#1B3A5C]' },
            { icon: <AlertTriangle className="w-5 h-5 text-[#C5A46A]" />, bg: 'bg-[#FDF6EE]', label: 'A Vencer',      value: analytics.aVencer,     sub: 'nos próximos 15 dias', valueColor: 'text-[#C5A46A]' },
          ].map(({ icon, bg, label, value, sub, valueColor }) => (
            <div key={label} className="bg-white border border-[#E8E4DF] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 ${bg} rounded-full flex items-center justify-center`}>{icon}</div>
                <p className="text-sm text-[#7A7A7A]">{label}</p>
              </div>
              <p className={`text-3xl text-[#2C2C2C] ${valueColor ?? ''}`}>{value}</p>
              <p className="text-xs text-[#7A7A7A] mt-1">{sub}</p>
            </div>
          ))}
        </div>

        {/* Barras por programa */}
        <div className="bg-white border border-[#E8E4DF] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-[#7A7A7A]" />
            <h2 className="text-lg text-[#2C2C2C]">Comparação por Programa</h2>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={analytics.programas}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DF" />
              <XAxis dataKey="name" stroke="#B0A99F" />
              <YAxis stroke="#B0A99F" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="miles" radius={[8, 8, 0, 0]}>
                {analytics.programas.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pizza + detalhes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white border border-[#E8E4DF] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <PieChartIcon className="w-5 h-5 text-[#7A7A7A]" />
              <h2 className="text-lg text-[#2C2C2C]">Distribuição</h2>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={analytics.distribuicao} cx="50%" cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90} dataKey="miles">
                  {analytics.distribuicao.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white border border-[#E8E4DF] rounded-2xl p-6">
            <h3 className="text-lg text-[#2C2C2C] mb-4">Detalhes</h3>
            <div className="space-y-3">
              {analytics.distribuicao.map((item, i) => {
                const pct = ((item.miles / totalMiles) * 100).toFixed(1);
                return (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-sm text-[#2C2C2C]">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#1B3A5C]">{item.miles.toLocaleString('pt-BR')}</p>
                      <p className="text-xs text-[#7A7A7A]">{pct}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Evolução */}
        <div className="bg-white border border-[#E8E4DF] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[#7A7A7A]" />
            <h2 className="text-lg text-[#2C2C2C]">Evolução dos Últimos Meses</h2>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={analytics.evolucao}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DF" />
              <XAxis dataKey="month" stroke="#B0A99F" />
              <YAxis stroke="#B0A99F" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="miles" name="Milhas" stroke="#1B3A5C"
                strokeWidth={2.5} dot={{ fill: '#6B9FBF', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Vencimento */}
        <div className="bg-white border border-[#E8E4DF] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-[#C5A46A]" />
            <h2 className="text-lg text-[#2C2C2C]">Previsão de Vencimento</h2>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={analytics.vencimento}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DF" />
              <XAxis dataKey="month" stroke="#B0A99F" />
              <YAxis stroke="#B0A99F" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="miles" name="Milhas a Vencer" fill="#C5A46A" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-sm text-[#7A7A7A] mt-3 text-center">
            Total de {analytics.totalVencimento} milhas vencem nos próximos 6 meses
          </p>
        </div>

      </div>
    </div>
  );
}
