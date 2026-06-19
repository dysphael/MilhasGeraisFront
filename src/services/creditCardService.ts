import api from './api';
import { CreditCard, CreateCreditCardDto, UpdateCreditCardDto } from '../types';

export const creditCardService = {
  // GET /api/creditcards
  listar: async (): Promise<CreditCard[]> => {
    const response = await api.get<CreditCard[]>('/creditcards');
    return response.data;
  },

  // GET /api/creditcards/user/{userId}
  listarPorUsuario: async (userId: number): Promise<CreditCard[]> => {
    const response = await api.get<CreditCard[]>(`/creditcards/user/${userId}`);
    return response.data;
  },

  // GET /api/creditcards/{id}
  obterPorId: async (id: number): Promise<CreditCard> => {
    const response = await api.get<CreditCard>(`/creditcards/${id}`);
    return response.data;
  },

  // POST /api/creditcards
  criar: async (dto: CreateCreditCardDto): Promise<CreditCard> => {
    const response = await api.post<CreditCard>('/creditcards', dto);
    return response.data;
  },

  // PUT /api/creditcards/{id}
  atualizar: async (id: number, dto: UpdateCreditCardDto): Promise<void> => {
    await api.put(`/creditcards/${id}`, dto);
  },

  // DELETE /api/creditcards/{id}
  deletar: async (id: number): Promise<void> => {
    await api.delete(`/creditcards/${id}`);
  },
};
