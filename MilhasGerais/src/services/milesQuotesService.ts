import api from './api';
import { MilesQuote } from '../types';
import { mockMilesQuotes } from '../utils/mockData';

const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

export const milesQuotesService = {
  // Retorna as cotações em cache no backend (rápido, sem novo scraping)
  // GET /api/milesquotes
  obterCotacoes: async (): Promise<MilesQuote[]> => {
    try {
      if (DEV_MODE) {
        await new Promise(resolve => setTimeout(resolve, 400));
        return mockMilesQuotes;
      }
      const response = await api.get<MilesQuote[]>('/milesquotes');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch miles quotes:', error);
      return mockMilesQuotes;
    }
  },

  // Força nova coleta em TODOS os programas (scraping ao vivo)
  // POST /api/milesquotes/refresh
  atualizarTodas: async (): Promise<MilesQuote[]> => {
    try {
      if (DEV_MODE) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return mockMilesQuotes.map(q => ({ ...q, scrapedAt: new Date().toISOString() }));
      }
      const response = await api.post<MilesQuote[]>('/milesquotes/refresh');
      return response.data;
    } catch (error) {
      console.error('Failed to refresh all quotes:', error);
      throw error;
    }
  },

  // Força nova coleta de um programa específico
  // POST /api/milesquotes/refresh/{programName}
  atualizarPrograma: async (programName: string): Promise<MilesQuote> => {
    try {
      if (DEV_MODE) {
        await new Promise(resolve => setTimeout(resolve, 800));
        const quote = mockMilesQuotes.find(q =>
          q.program.toLowerCase() === programName.toLowerCase()
        );
        if (!quote) throw new Error(`Programa ${programName} não encontrado`);
        return { ...quote, scrapedAt: new Date().toISOString() };
      }
      const response = await api.post<MilesQuote>(`/milesquotes/refresh/${programName}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to refresh quote for ${programName}:`, error);
      throw error;
    }
  },
};
