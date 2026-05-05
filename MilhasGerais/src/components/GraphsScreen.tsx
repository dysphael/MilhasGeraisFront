import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PieChart as PieChartIcon, BarChart3, TrendingUp, AlertTriangle, LogOut } from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { transacoesService } from '../services/transacoesService';
import { dashboardService } from '../services/dashboardService';

interface GraphsScreenProps {
  onLogout: () => void;
}

export function GraphsScreen({ onLogout }: GraphsScreenProps) {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await transacoesService.obterAnalytics();
        setAnalytics(data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching analytics:', err);
        setError('Erro ao carregar gráficos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#C2EFEB]/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#054A91] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando gráficos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#C2EFEB]/20 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
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

  // Dados padrão caso a API não retorne nada (para desenvolvimento)
  const programData = analytics?.programas || [
    { name: 'Livelo', miles: 40000, fill: '#748944' },
    { name: 'Smiles', miles: 25000, fill: '#054A91' },
    { name: 'LATAM', miles: 18000, fill: '#6EA4BF' },
    { name: 'TudoAzul', miles: 15000, fill: '#054A91' },
    { name: 'Esfera', miles: 8000, fill: '#6EA4BF' },
  ];

  const pieData = analytics?.distribuicao || programData;
  const evolutionData = analytics?.evolucao || [
    { month: 'Nov', miles: 85000 },
    { month: 'Dez', miles: 92000 },
    { month: 'Jan', miles: 88000 },
    { month: 'Fev', miles: 95000 },
    { month: 'Mar', miles: 102000 },
    { month: 'Abr', miles: 106000 },
  ];

  const expirationData = analytics?.vencimento || [
    { month: 'Abr', miles: 5000 },
    { month: 'Mai', miles: 8000 },
    { month: 'Jun', miles: 3000 },
    { month: 'Jul', miles: 12000 },
    { month: 'Ago', miles: 6000 },
    { month: 'Set', miles: 4000 },
  ];

  const totalMiles = programData.reduce((sum: number, item: any) => sum + item.miles, 0);

  return (
    <div className="min-h-screen bg-[#C2EFEB]/20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/home')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div>
              <h1 className="text-2xl text-gray-800">Análise de Milhas</h1>
              <p className="text-sm text-gray-600">Visualize seus dados</p>
            </div>
          </div>
          <button
            onClick={() => {
              onLogout();
              navigate('/login');
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Sair"
          >
            <LogOut className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Cards de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#C2EFEB] rounded-full flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-[#054A91]" />
              </div>
              <p className="text-sm text-gray-600">Total Acumulado</p>
            </div>
            <p className="text-3xl text-gray-800">{totalMiles.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-gray-500 mt-1">em {programData.length} programas</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#C2EFEB] rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#748944]" />
              </div>
              <p className="text-sm text-gray-600">Crescimento</p>
            </div>
            <p className="text-3xl text-[#748944]">{analytics?.crescimento || '+4.000'}</p>
            <p className="text-xs text-gray-500 mt-1">nos últimos 30 dias</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-sm text-gray-600">A Vencer</p>
            </div>
            <p className="text-3xl text-orange-600">{analytics?.aVencer || '5.000'}</p>
            <p className="text-xs text-gray-500 mt-1">nos próximos 15 dias</p>
          </div>
        </div>

        {/* Gráfico de barras */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg text-gray-800">Comparação por Programa</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={programData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="miles" radius={[8, 8, 0, 0]}>
                {programData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.fill || (index % 2 === 0 ? '#6EA4BF' : '#054A91')} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráficos lado a lado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gráfico de pizza */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <PieChartIcon className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg text-gray-800">Distribuição</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="miles"
                >
                  {pieData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || entry.color || '#054A91'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legenda */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg text-gray-800 mb-4">Detalhes</h3>
            <div className="space-y-3">
              {pieData.map((item: any) => {
                const percentage = ((item.miles / totalMiles) * 100).toFixed(1);
                return (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: item.fill || item.color || '#054A91' }}
                      ></div>
                      <span className="text-sm text-gray-700">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-800">{item.miles.toLocaleString('pt-BR')}</p>
                      <p className="text-xs text-gray-500">{percentage}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Gráfico de linha */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg text-gray-800">Evolução dos Últimos Meses</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="miles"
                name="Milhas"
                stroke="#6EA4BF"
                strokeWidth={3}
                dot={{ fill: '#054A91', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de vencimento */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg text-gray-800">Previsão de Vencimento</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expirationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="miles" name="Milhas a Vencer" fill="#f97316" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-600 mt-4 text-center">
            Total de {analytics?.totalVencimento || '38.000'} milhas vencem nos próximos 6 meses
          </p>
        </div>
      </div>
    </div>
  );
}
