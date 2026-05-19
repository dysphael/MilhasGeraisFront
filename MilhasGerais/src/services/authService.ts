import api from './api';
import { LoginResponse, User } from '../types';

const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

// ─── Helpers de mock (só usados com VITE_DEV_MODE=true) ───────────
const generateFakeToken = () => 'dev_token_' + Math.random().toString(36).slice(2, 11);

const getMockUser = (email: string): User => {
  const name = email.split('@')[0];
  return {
    id: 100,   // Ana Silva (primeiro seed do banco)
    name: name.charAt(0).toUpperCase() + name.slice(1),
    email,
  };
};

// ─── Service ──────────────────────────────────────────────────────
export const authService = {
  /**
   * Login do usuário.
   * Em DEV_MODE, aceita qualquer email/senha e usa o usuário seed id=100.
   * Em produção, chama POST /api/users/login (implemente o endpoint quando adicionar autenticação).
   *
   * NOTA: O backend atual não tem autenticação JWT. Quando implementar,
   * substitua a chamada abaixo pelo endpoint correto e remova DEV_MODE.
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    if (DEV_MODE) {
      const user = getMockUser(email);
      const token = generateFakeToken();
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return { token, user };
    }

    // Produção — endpoint a implementar no backend
    const response = await api.post<LoginResponse>('/users/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      if (!DEV_MODE) await api.post('/users/logout');
    } catch { /* ignora erro de rede no logout */ }
    finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  isAuthenticated: (): boolean => !!localStorage.getItem('token'),

  getStoredUser: (): User | null => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  },

  getToken: (): string | null => localStorage.getItem('token'),
};
