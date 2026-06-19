// Re-exporta o hook useAuth do AuthContext para manter compatibilidade
// com imports que usam '../hooks/useAuth'.
// Toda a lógica está centralizada em contexts/AuthContext.tsx.
export { useAuth } from '../contexts/AuthContext';
