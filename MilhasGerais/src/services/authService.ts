import api from './api';
import { LoginRequest, LoginResponse, User } from '../types';

// Modo desenvolvimento - bypass de autenticação
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

// Gerar token fake para desenvolvimento
const generateFakeToken = (): string => {
  return 'fake_token_' + Math.random().toString(36).substr(2, 9);
};

// Dados mock para desenvolvimento
const getMockUser = (email: string): User => {
  const name = email.split('@')[0];
  const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
  return {
    id: 'user_' + Math.random().toString(36).substr(2, 9),
    name: capitalizedName,
    email: email,
  };
};

export const authService = {
  // Login - chamará POST /api/users/login (ou usa modo dev)
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      // MODO DESENVOLVIMENTO - bypass
      if (DEV_MODE) {
        const user = getMockUser(email);
        const token = generateFakeToken();

        // Salvar no localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        return {
          token,
          user,
        };
      }

      // MODO PRODUÇÃO - chama API real
      const response = await api.post<LoginResponse>('/users/login', {
        email,
        password,
      });

      // Salvar token no localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      if (!DEV_MODE) {
        await api.post('/users/logout');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Limpar storage mesmo se falhar
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Get perfil do usuário
  getProfile: async (): Promise<User> => {
    try {
      if (DEV_MODE) {
        const user = authService.getStoredUser();
        if (user) return user;
        throw new Error('Usuário não encontrado');
      }

      const response = await api.get<User>('/users/profile');
      return response.data;
    } catch (error) {
      console.error('Failed to get profile:', error);
      throw error;
    }
  },

  // Verificar se tem token válido
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  // Obter usuário do localStorage
  getStoredUser: (): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Obter token
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },
};
