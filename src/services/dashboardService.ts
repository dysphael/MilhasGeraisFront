import api from './api';
import { DashboardResumo, AnalyticsData } from '../types';
import { mockDashboardData, mockAnalyticsData } from '../utils/mockData';

const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

export const dashboardService = {
  // GET /api/dashboard/resumo
  obterResumo: async (): Promise<DashboardResumo> => {
    try {
      if (DEV_MODE) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockDashboardData;
      }
      const response = await api.get<DashboardResumo>('/dashboard/resumo');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch dashboard resumo:', error);
      return mockDashboardData;
    }
  },

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
