import api from './api';
import { User, CreateUserDto, UpdateUserDto } from '../types';

export const userService = {
  // GET /api/users
  listar: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  // GET /api/users/{id}
  obterPorId: async (id: number): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  // POST /api/users
  criar: async (dto: CreateUserDto): Promise<User> => {
    const response = await api.post<User>('/users', dto);
    return response.data;
  },

  // PUT /api/users/{id}
  atualizar: async (id: number, dto: UpdateUserDto): Promise<void> => {
    await api.put(`/users/${id}`, dto);
  },

  // DELETE /api/users/{id}
  deletar: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};
