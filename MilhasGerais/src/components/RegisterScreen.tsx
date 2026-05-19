import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plane, Mail, Lock, Eye, EyeOff, User, Loader, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const passwordRules = [
  { label: 'Pelo menos 6 caracteres', test: (p: string) => p.length >= 6 },
  { label: 'Letra maiúscula',         test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Letra minúscula',         test: (p: string) => /[a-z]/.test(p) },
  { label: 'Número',                  test: (p: string) => /\d/.test(p) },
];

// Cores da barra de força mapeadas nos tokens do Tailwind
const strengthColors = [
  'bg-destructive',   // 1 — Fraca
  'bg-accent',        // 2 — Regular
  'bg-secondary',     // 3 — Boa
  'bg-primary',       // 4 — Forte
];
const strengthLabels = ['Fraca', 'Regular', 'Boa', 'Forte'];

export function RegisterScreen() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();

  const [name, setName]                       = useState('');
  const [email, setEmail]                     = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [fieldErrors, setFieldErrors]         = useState<Record<string, string>>({});
  const [submitError, setSubmitError]         = useState<string | null>(null);
  const [showRules, setShowRules]             = useState(false);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) errors.name = 'Nome deve ter ao menos 2 caracteres';
    if (!email || !/\S+@\S+\.\S+/.test(email))  errors.email = 'E-mail inválido';
    if (password.length < 6)                     errors.password = 'Senha deve ter ao menos 6 caracteres';
    if (password !== confirmPassword)            errors.confirmPassword = 'As senhas não coincidem';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;
    try {
      await register(name.trim(), email, password, confirmPassword);
      navigate('/home');
    } catch (err: any) {
      setSubmitError(err.message || 'Erro ao criar conta. Tente novamente.');
    }
  };

  const passwordStrength = passwordRules.filter(r => r.test(password)).length;

  // Classes reutilizáveis de input
  const inputBase = 'w-full py-3 bg-input border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-foreground placeholder:text-muted-fg';
  const inputOk   = 'border-border';
  const inputErr  = 'border-destructive bg-destructive/5';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-3xl mb-4 shadow-lg">
            <Plane className="w-10 h-10 text-primary-fg" />
          </div>
          <h1 className="text-3xl mb-1 text-foreground">Criar conta</h1>
          <p className="text-muted-fg text-sm">Comece a gerenciar suas milhas hoje</p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-3xl shadow-sm border border-border p-8">

          {submitError && (
            <div className="mb-5 p-4 bg-destructive/10 border border-destructive/30 rounded-xl flex items-start gap-3">
              <XCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
              <p className="text-destructive text-sm">{submitError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Nome */}
            <div>
              <label htmlFor="name" className="block text-sm text-foreground mb-1.5">Nome completo</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-fg" />
                <input id="name" type="text" value={name}
                  onChange={e => { setName(e.target.value); setFieldErrors(p => ({ ...p, name: '' })); }}
                  placeholder="Seu nome" disabled={isLoading}
                  className={`${inputBase} pl-12 pr-4 ${fieldErrors.name ? inputErr : inputOk}`} />
              </div>
              {fieldErrors.name && <p className="mt-1 text-xs text-destructive">{fieldErrors.name}</p>}
            </div>

            {/* E-mail */}
            <div>
              <label htmlFor="email" className="block text-sm text-foreground mb-1.5">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-fg" />
                <input id="email" type="email" value={email}
                  onChange={e => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: '' })); }}
                  placeholder="seu@email.com" disabled={isLoading}
                  className={`${inputBase} pl-12 pr-4 ${fieldErrors.email ? inputErr : inputOk}`} />
              </div>
              {fieldErrors.email && <p className="mt-1 text-xs text-destructive">{fieldErrors.email}</p>}
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="password" className="block text-sm text-foreground mb-1.5">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-fg" />
                <input id="password" type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: '' })); }}
                  onFocus={() => setShowRules(true)}
                  placeholder="••••••••" disabled={isLoading}
                  className={`${inputBase} pl-12 pr-12 ${fieldErrors.password ? inputErr : inputOk}`} />
                <button type="button" onClick={() => setShowPassword(v => !v)} disabled={isLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-fg hover:text-foreground transition-colors">
                  {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
              {fieldErrors.password && <p className="mt-1 text-xs text-destructive">{fieldErrors.password}</p>}

              {/* Força da senha */}
              {showRules && password.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex gap-1">
                      {[0, 1, 2, 3].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-muted'
                        }`} />
                      ))}
                    </div>
                    <span className="text-xs text-muted-fg w-12 text-right">
                      {strengthLabels[passwordStrength - 1] ?? ''}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {passwordRules.map(rule => {
                      const ok = rule.test(password);
                      return (
                        <div key={rule.label} className="flex items-center gap-1.5">
                          {ok
                            ? <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                            : <XCircle    className="w-3.5 h-3.5 text-muted shrink-0" />}
                          <span className={`text-xs ${ok ? 'text-primary' : 'text-muted-fg'}`}>
                            {rule.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Confirmar senha */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm text-foreground mb-1.5">Confirmar senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-fg" />
                <input id="confirmPassword" type={showConfirm ? 'text' : 'password'} value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setFieldErrors(p => ({ ...p, confirmPassword: '' })); }}
                  placeholder="••••••••" disabled={isLoading}
                  className={`${inputBase} pl-12 pr-20 ${
                    fieldErrors.confirmPassword ? inputErr
                    : confirmPassword && confirmPassword === password ? 'border-secondary'
                    : inputOk
                  }`} />
                <div className="absolute right-12 top-1/2 -translate-y-1/2">
                  {confirmPassword && (
                    confirmPassword === password
                      ? <CheckCircle className="w-5 h-5 text-primary" />
                      : <XCircle    className="w-5 h-5 text-destructive" />
                  )}
                </div>
                <button type="button" onClick={() => setShowConfirm(v => !v)} disabled={isLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-fg hover:text-foreground transition-colors">
                  {showConfirm ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
              {fieldErrors.confirmPassword && <p className="mt-1 text-xs text-destructive">{fieldErrors.confirmPassword}</p>}
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full mt-2 bg-primary hover:bg-primary-hover text-primary-fg py-3 rounded-xl hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {isLoading ? <><Loader className="w-5 h-5 animate-spin" />Criando conta...</> : 'Criar conta'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-muted-fg">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-primary hover:text-secondary transition-colors">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
