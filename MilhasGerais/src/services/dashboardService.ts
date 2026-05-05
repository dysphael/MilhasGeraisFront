import api from './api';
import { DashboardResumo } from '../types';
import { mockDashboardData, mockAnalyticsData } from '../utils/mockData';

const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

export const dashboardService = {
  // Obter resumo do dashboard - GET /api/dashboard/resumo
  obterResumo: async (): Promise<DashboardResumo> => {
    try {
      // MODO DESENVOLVIMENTO
      if (DEV_MODE) {
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockDashboardData;
      }

      // MODO PRODUÇÃO
      const response = await api.get<DashboardResumo>('/dashboard/resumo');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch dashboard resumo:', error);
      // Fallback para dados mock em caso de erro
      return mockDashboardData;
    }
  },

  // Obter metas do usuário
  obterMetas: async () => {
    try {
      if (DEV_MODE) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return {
          atual: 106000,
          proxima: 12000,
          percentual: 75,
        };
      }

      const response = await api.get('/dashboard/metas');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch metas:', error);
      return {
        atual: 106000,
        proxima: 12000,
        percentual: 75,
      };
    }
  },

  // Obter alertas
  obterAlertas: async () => {
    try {
      if (DEV_MODE) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockDashboardData.alerts;
      }

      const response = await api.get('/dashboard/alertas');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch alertas:', error);
      return mockDashboardData.alerts;
    }
  },
};
