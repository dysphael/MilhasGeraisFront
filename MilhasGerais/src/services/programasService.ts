import api from './api';
import { Programa } from '../types';

export const programasService = {
  // Listar todos os programas - GET /api/programas
  listar: async (): Promise<Programa[]> => {
    try {
      const response = await api.get<Programa[]>('/programas');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch programas:', error);
      throw error;
    }
  },

  // Obter um programa específico - GET /api/programas/{id}
  obterPorId: async (id: string): Promise<Programa> => {
    try {
      const response = await api.get<Programa>(`/programas/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch programa ${id}:`, error);
      throw error;
    }
  },

  // Criar novo programa - POST /api/programas
  criar: async (programa: Omit<Programa, 'id'>): Promise<Programa> => {
    try {
      const response = await api.post<Programa>('/programas', programa);
      return response.data;
    } catch (error) {
      console.error('Failed to create programa:', error);
      throw error;
    }
  },

  // Atualizar milhas - PUT /api/programas/{id}
  atualizarMilhas: async (id: string, miles: number): Promise<Programa> => {
    try {
      const response = await api.put<Programa>(`/programas/${id}`, { miles });
      return response.data;
    } catch (error) {
      console.error(`Failed to update programa ${id}:`, error);
      throw error;
    }
  },
};
