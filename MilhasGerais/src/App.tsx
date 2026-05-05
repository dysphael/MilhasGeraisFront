import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { HomeScreen } from './components/HomeScreen';
import { GraphsScreen } from './components/GraphsScreen';

export default function App() {
  const { isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#C2EFEB]/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#054A91] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/home" /> : <LoginScreen />}
      />
      <Route
        path="/home"
        element={isAuthenticated ? <HomeScreen onLogout={logout} /> : <Navigate to="/login" />}
      />
      <Route
        path="/graphs"
        element={isAuthenticated ? <GraphsScreen onLogout={logout} /> : <Navigate to="/login" />}
      />
      <Route path="/" element={<Navigate to={isAuthenticated ? '/home' : '/login'} />} />
    </Routes>
  );
}


