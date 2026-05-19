import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plane, Mail, Lock, Eye, EyeOff, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!email || !password) {
      setSubmitError('Preencha todos os campos');
      return;
    }
    try {
      await login(email, password);
      navigate('/home');
    } catch (err: any) {
      setSubmitError(err.message || 'Falha ao fazer login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-700 to-cyan-500">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-900 rounded-3xl mb-4 shadow-xl hover:scale-105 transition-transform">
            <Plane className="w-10 h-10 text-primary-fg" />
          </div>
          <h1 className="text-3xl mb-1 text-foreground">MilhasGerais</h1>
          <p className="text-muted-fg text-sm">
            Gerencie suas milhas de forma inteligente
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-white/50 p-8 relative z-10">
          {submitError && (
            <div className="mb-5 p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* E-mail */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm text-foreground mb-1.5"
              >
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-fg" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-foreground placeholder:text-muted-fg"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm text-foreground mb-1.5"
              >
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-fg" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full pl-12 pr-12 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-foreground placeholder:text-muted-fg"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={isLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-fg hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="text-right">
              <button
                type="button"
                className="text-sm text-primary hover:text-secondary transition-colors"
              >
                Esqueceu a senha?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 hover:shadow-lg transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-sm text-muted-fg">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            type="button"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 border border-border rounded-xl hover:bg-background transition-colors disabled:opacity-50 text-foreground"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuar com Google
          </button>

          <p className="text-center mt-6 text-sm text-muted-fg">
            Não tem uma conta?{' '}
            <Link
              to="/register"
              className="text-primary hover:text-secondary transition-colors"
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
