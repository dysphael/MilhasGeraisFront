import api from './api';
import { RewardTransaction, DashboardTransacao, AnalyticsData } from '../types';
import { mockDashboardData, mockAnalyticsData } from '../utils/mockData';

const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

export const transacoesService = {
  // Últimas transações para o dashboard
  // GET /api/rewardtransactions  (formata para DashboardTransacao)
  listarRecentes: async (limit: number = 10): Promise<DashboardTransacao[]> => {
    try {
      if (DEV_MODE) {
        await new Promise(resolve => setTimeout(resolve, 400));
        return mockDashboardData.transacoes;
      }
      const response = await api.get<RewardTransaction[]>('/rewardtransactions');
      return response.data
        .slice(0, limit)
        .map(t => ({
          id: t.id.toString(),
          type: 'credit' as const,
          program: 'Cartão',
          amount: t.milesEarned,
          date: new Date(t.date).toLocaleDateString('pt-BR'),
          description: `Compra R$ ${t.amount.toFixed(2)}`,
        }));
    } catch (error) {
      console.error('Failed to fetch transacoes:', error);
      return mockDashboardData.transacoes;
    }
  },

  // Analytics para gráficos — delega ao dashboardService
  // GET /api/dashboard/analytics
  obterAnalytics: async (): Promise<AnalyticsData> => {
    try {
      if (DEV_MODE) {
        await new Promise(resolve => setTimeout(resolve, 600));
        return mockAnalyticsData;
      }
      const response = await api.get<AnalyticsData>('/dashboard/analytics');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      return mockAnalyticsData;
    }
  },
};
