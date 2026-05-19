import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { HomeScreen } from './components/HomeScreen';
import { GraphsScreen } from './components/GraphsScreen';
import { MilesQuotesScreen } from './components/MilesQuotesScreen';

export default function App() {
  const { isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#C2EFEB]/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#054A91] mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login"    element={isAuthenticated ? <Navigate to="/home" /> : <LoginScreen />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/home" /> : <RegisterScreen />} />

      {/* Rotas protegidas */}
      <Route path="/home"     element={isAuthenticated ? <HomeScreen onLogout={logout} />        : <Navigate to="/login" />} />
      <Route path="/graphs"   element={isAuthenticated ? <GraphsScreen onLogout={logout} />      : <Navigate to="/login" />} />
      <Route path="/cotacoes" element={isAuthenticated ? <MilesQuotesScreen onLogout={logout} /> : <Navigate to="/login" />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to={isAuthenticated ? '/home' : '/login'} />} />
    </Routes>
  );
}
