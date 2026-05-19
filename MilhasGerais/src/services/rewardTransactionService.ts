import api from './api';
import { RewardTransaction } from '../types';

export const rewardTransactionService = {
  // GET /api/rewardtransactions
  listar: async (): Promise<RewardTransaction[]> => {
    const response = await api.get<RewardTransaction[]>('/rewardtransactions');
    return response.data;
  },

  // GET /api/rewardtransactions/{id}
  obterPorId: async (id: number): Promise<RewardTransaction> => {
    const response = await api.get<RewardTransaction>(`/rewardtransactions/${id}`);
    return response.data;
  },

  // GET /api/rewardtransactions/user/{userId}
  listarPorUsuario: async (userId: number): Promise<RewardTransaction[]> => {
    const response = await api.get<RewardTransaction[]>(`/rewardtransactions/user/${userId}`);
    return response.data;
  },

  // POST /api/rewardtransactions
  criar: async (tx: Omit<RewardTransaction, 'id'>): Promise<RewardTransaction> => {
    const response = await api.post<RewardTransaction>('/rewardtransactions', tx);
    return response.data;
  },

  // DELETE /api/rewardtransactions/{id}
  deletar: async (id: number): Promise<void> => {
    await api.delete(`/rewardtransactions/${id}`);
  },
};
