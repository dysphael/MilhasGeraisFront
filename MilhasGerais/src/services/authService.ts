import api from './api';
import { LoginResponse, User } from '../types';

const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

const generateFakeToken = (user: User) =>
  `dev_${user.id}_${Math.random().toString(36).slice(2, 11)}`;

const persist = (token: string, user: User) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const authService = {
  // POST /api/auth/register
  register: async (name: string, email: string, password: string, confirmPassword: string): Promise<LoginResponse> => {
    if (DEV_MODE) {
      await new Promise(r => setTimeout(r, 600));
      const user: User = { id: Date.now(), name, email };
      const token = generateFakeToken(user);
      persist(token, user);
      return { token, user };
    }

    const response = await api.post<LoginResponse>('/auth/register', {
      name, email, password, confirmPassword,
    });
    persist(response.data.token, response.data.user);
    return response.data;
  },

  // POST /api/auth/login
  login: async (email: string, password: string): Promise<LoginResponse> => {
    if (DEV_MODE) {
      await new Promise(r => setTimeout(r, 500));
      const name = email.split('@')[0];
      const user: User = {
        id: 100,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email,
      };
      const token = generateFakeToken(user);
      persist(token, user);
      return { token, user };
    }

    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    persist(response.data.token, response.data.user);
    return response.data;
  },

  // POST /api/auth/forgot-password
  forgotPassword: async (email: string): Promise<void> => {
    if (DEV_MODE) {
      await new Promise(r => setTimeout(r, 800));
      return;
    }
    await api.post('/auth/forgot-password', { email });
  },

  // POST /api/auth/reset-password
  resetPassword: async (email: string, code: string, newPassword: string): Promise<void> => {
    if (DEV_MODE) {
      await new Promise(r => setTimeout(r, 800));
      return;
    }
    await api.post('/auth/reset-password', { email, code, newPassword });
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  isAuthenticated: (): boolean => !!localStorage.getItem('token'),

  getStoredUser: (): User | null => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  },

  getToken: (): string | null => localStorage.getItem('token'),
};
