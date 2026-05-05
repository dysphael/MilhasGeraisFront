import api from './api';
import { Transacao } from '../types';
import { mockDashboardData, mockAnalyticsData } from '../utils/mockData';

const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

export const transacoesService = {
  // Listar transações recentes - GET /api/transacoes
  listarRecentes: async (limit: number = 10): Promise<Transacao[]> => {
    try {
      if (DEV_MODE) {
        await new Promise(resolve => setTimeout(resolve, 400));
        return mockDashboardData.transacoes;
      }

      const response = await api.get<Transacao[]>('/transacoes', {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch transacoes:', error);
      return mockDashboardData.transacoes;
    }
  },

  // Criar nova transação - POST /api/transacoes
  criar: async (transacao: Omit<Transacao, 'id' | 'date'>): Promise<Transacao> => {
    try {
      if (DEV_MODE) {
        const novaTransacao: Transacao = {
          ...transacao,
          id: 'tx_' + Math.random().toString(36).substr(2, 9),
          date: new Date().toLocaleDateString('pt-BR'),
        };
        mockDashboardData.transacoes.unshift(novaTransacao);
        return novaTransacao;
      }

      const response = await api.post<Transacao>('/transacoes', transacao);
      return response.data;
    } catch (error) {
      console.error('Failed to create transacao:', error);
      throw error;
    }
  },

  // Obter dados para gráficos - GET /api/transacoes/analytics
  obterAnalytics: async () => {
    try {
      if (DEV_MODE) {
        await new Promise(resolve => setTimeout(resolve, 600));
        return mockAnalyticsData;
      }

      const response = await api.get('/transacoes/analytics');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      return mockAnalyticsData;
    }
  },

  // Transferir milhas entre programas
  transferir: async (
    deProgramaId: string,
    paraProgramaId: string,
    amount: number
  ): Promise<Transacao> => {
    try {
      if (DEV_MODE) {
        const transacao: Transacao = {
          id: 'tx_' + Math.random().toString(36).substr(2, 9),
          type: 'transfer',
          program: 'Transferência',
          amount,
          date: new Date().toLocaleDateString('pt-BR'),
          description: 'Transferência entre programas',
        };
        mockDashboardData.transacoes.unshift(transacao);
        return transacao;
      }

      const response = await api.post<Transacao>('/transacoes/transferir', {
        deProgramaId,
        paraProgramaId,
        amount,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to transfer milhas:', error);
      throw error;
    }
  },
};
