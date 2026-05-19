import api from './api';
import { UserProfile, CreateUserProfileDto, UpdateUserProfileDto } from '../types';

export const userProfileService = {
  // GET /api/users/{userId}/profile
  obterPorUsuario: async (userId: number): Promise<UserProfile> => {
    const response = await api.get<UserProfile>(`/users/${userId}/profile`);
    return response.data;
  },

  // POST /api/users/{userId}/profile
  criar: async (userId: number, dto: CreateUserProfileDto): Promise<UserProfile> => {
    const response = await api.post<UserProfile>(`/users/${userId}/profile`, dto);
    return response.data;
  },

  // PUT /api/users/{userId}/profile
  atualizar: async (userId: number, dto: UpdateUserProfileDto): Promise<void> => {
    await api.put(`/users/${userId}/profile`, dto);
  },

  // DELETE /api/users/{userId}/profile
  deletar: async (userId: number): Promise<void> => {
    await api.delete(`/users/${userId}/profile`);
  },
};
