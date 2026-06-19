import api from './api';
import { MilesGoal, CreateMilesGoalDto } from '../types';

export const milesGoalService = {
  // GET /api/milesgoals/user/{userId}
  listarPorUsuario: async (userId: number): Promise<MilesGoal[]> => {
    const response = await api.get<MilesGoal[]>(`/milesgoals/user/${userId}`);
    return response.data;
  },

  // POST /api/milesgoals
  criar: async (dto: CreateMilesGoalDto): Promise<MilesGoal> => {
    const response = await api.post<MilesGoal>('/milesgoals', dto);
    return response.data;
  },

  // DELETE /api/milesgoals/{id}
  deletar: async (id: number): Promise<void> => {
    await api.delete(`/milesgoals/${id}`);
  },
};
