import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser]                   = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading]         = useState(true);
  const [error, setError]                 = useState<string | null>(null);

  // Restaura sessão ao inicializar
  useEffect(() => {
    const stored = authService.getStoredUser();
    if (stored && authService.isAuthenticated()) {
      setUser(stored);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { user } = await authService.login(email, password);
      setUser(user);
      setIsAuthenticated(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'E-mail ou senha inválidos.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (
    name: string, email: string, password: string, confirmPassword: string
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const { user } = await authService.register(name, email, password, confirmPassword);
      setUser(user);
      setIsAuthenticated(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erro ao criar conta. Tente novamente.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, error, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
};
