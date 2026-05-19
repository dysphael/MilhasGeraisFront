import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plane, Mail, Lock, Eye, EyeOff, Loader, CheckCircle, KeyRound } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { Modal } from './modals/Modal';

export function LoginScreen() {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError]   = useState<string | null>(null);
  const [touched, setTouched]           = useState({ email: false, password: false });
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const emailError = !email
    ? 'Informe seu e-mail para continuar'
    : !/\S+@\S+\.\S+/.test(email)
    ? 'E-mail inválido — verifique o formato (ex.: nome@exemplo.com)'
    : null;

  const passwordError = !password
    ? 'Informe sua senha para continuar'
    : password.length < 6
    ? 'A senha deve ter pelo menos 6 caracteres'
    : null;

  const handleBlur = (field: 'email' | 'password') =>
    setTouched(t => ({ ...t, [field]: true }));

  // Estado do modal "Esqueceu a senha?" — 2 etapas
  const [showForgot, setShowForgot]           = useState(false);
  const [forgotStep, setForgotStep]           = useState<1 | 2>(1);
  const [forgotEmail, setForgotEmail]         = useState('');
  const [forgotCode, setForgotCode]           = useState('');
  const [forgotNewPwd, setForgotNewPwd]       = useState('');
  const [forgotConfirm, setForgotConfirm]     = useState('');
  const [forgotDone, setForgotDone]           = useState(false);
  const [forgotError, setForgotError]         = useState<string | null>(null);
  const [forgotLoading, setForgotLoading]     = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (emailError || passwordError) return;
    setSubmitError(null);
    try {
      await login(email, password);
      navigate('/home');
    } catch (err: any) {
      setSubmitError(err.message || 'E-mail ou senha incorretos. Verifique os dados ou use "Esqueceu a senha?" para recuperar o acesso.');
    }
  };

  const handleForgotStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    if (!forgotEmail || !/\S+@\S+\.\S+/.test(forgotEmail)) {
      setForgotError('Informe um e-mail válido.');
      return;
    }
    setForgotLoading(true);
    try {
      await authService.forgotPassword(forgotEmail);
      setForgotStep(2);
    } catch {
      setForgotError('Erro ao enviar o código. Tente novamente.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    if (!forgotCode || forgotCode.length !== 6) {
      setForgotError('O código deve ter 6 dígitos.');
      return;
    }
    if (!forgotNewPwd || forgotNewPwd.length < 6) {
      setForgotError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (forgotNewPwd !== forgotConfirm) {
      setForgotError('As senhas não coincidem.');
      return;
    }
    setForgotLoading(true);
    try {
      await authService.resetPassword(forgotEmail, forgotCode, forgotNewPwd);
      setForgotDone(true);
    } catch {
      setForgotError('Código inválido ou expirado. Solicite um novo código.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotClose = () => {
    setShowForgot(false);
    setForgotStep(1);
    setForgotEmail('');
    setForgotCode('');
    setForgotNewPwd('');
    setForgotConfirm('');
    setForgotDone(false);
    setForgotError(null);
  };

  return (
    <>
      {/* Modal Esqueceu a senha — 2 etapas */}
      {showForgot && (
        <Modal title="Recuperar senha" onClose={handleForgotClose}>
          {forgotDone ? (
            /* ── Concluído ── */
            <div className="flex flex-col items-center py-6 gap-3 text-center">
              <CheckCircle className="w-16 h-16 text-green-500" />
              <p className="text-[#2C2C2C] font-medium">Senha redefinida com sucesso!</p>
              <p className="text-sm text-[#7A7A7A]">Você já pode fazer login com sua nova senha.</p>
              <button
                onClick={handleForgotClose}
                className="mt-2 px-6 py-2 bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition-colors"
              >
                Fazer login
              </button>
            </div>
          ) : forgotStep === 1 ? (
            /* ── Etapa 1: e-mail ── */
            <>
              <p className="text-sm text-[#7A7A7A] mb-5">
                Informe seu e-mail e enviaremos um código de 6 dígitos para redefinir sua senha.
              </p>

              {forgotError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {forgotError}
                </div>
              )}

              <form onSubmit={handleForgotStep1} className="space-y-4">
                <div>
                  <label className="block text-sm text-[#2C2C2C] mb-1.5">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B0A99F]" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      placeholder="seu@email.com"
                      disabled={forgotLoading}
                      className="w-full pl-12 pr-4 py-3 bg-[#F7F5F2] border border-[#E8E4DF] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all text-[#2C2C2C] placeholder:text-[#B0A99F]"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleForgotClose}
                    disabled={forgotLoading}
                    className="flex-1 py-3 border border-[#E8E4DF] rounded-xl text-[#7A7A7A] hover:bg-[#F7F5F2] transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-3 bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {forgotLoading
                      ? <><Loader className="w-4 h-4 animate-spin" />Enviando...</>
                      : 'Enviar código'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* ── Etapa 2: código + nova senha ── */
            <>
              <p className="text-sm text-[#7A7A7A] mb-1">
                Enviamos um código para <strong>{forgotEmail}</strong>.
              </p>
              <p className="text-xs text-[#B0A99F] mb-5">O código expira em 15 minutos.</p>

              {forgotError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {forgotError}
                </div>
              )}

              <form onSubmit={handleForgotStep2} className="space-y-4">
                <div>
                  <label className="block text-sm text-[#2C2C2C] mb-1.5">Código de 6 dígitos</label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B0A99F]" />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={forgotCode}
                      onChange={e => setForgotCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      disabled={forgotLoading}
                      className="w-full pl-12 pr-4 py-3 bg-[#F7F5F2] border border-[#E8E4DF] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all text-[#2C2C2C] placeholder:text-[#B0A99F] tracking-widest text-center text-lg font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[#2C2C2C] mb-1.5">Nova senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B0A99F]" />
                    <input
                      type="password"
                      value={forgotNewPwd}
                      onChange={e => setForgotNewPwd(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      disabled={forgotLoading}
                      className="w-full pl-12 pr-4 py-3 bg-[#F7F5F2] border border-[#E8E4DF] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all text-[#2C2C2C] placeholder:text-[#B0A99F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[#2C2C2C] mb-1.5">Confirmar senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B0A99F]" />
                    <input
                      type="password"
                      value={forgotConfirm}
                      onChange={e => setForgotConfirm(e.target.value)}
                      placeholder="Repita a nova senha"
                      disabled={forgotLoading}
                      className="w-full pl-12 pr-4 py-3 bg-[#F7F5F2] border border-[#E8E4DF] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all text-[#2C2C2C] placeholder:text-[#B0A99F]"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setForgotStep(1); setForgotError(null); }}
                    disabled={forgotLoading}
                    className="flex-1 py-3 border border-[#E8E4DF] rounded-xl text-[#7A7A7A] hover:bg-[#F7F5F2] transition-colors disabled:opacity-50"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-3 bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {forgotLoading
                      ? <><Loader className="w-4 h-4 animate-spin" />Salvando...</>
                      : 'Redefinir senha'}
                  </button>
                </div>
              </form>
            </>
          )}
        </Modal>
      )}

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
                <label htmlFor="email" className="block text-sm text-foreground mb-1.5">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
                    touched.email && emailError ? 'text-red-400' : touched.email && !emailError ? 'text-green-500' : 'text-muted-fg'
                  }`} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setSubmitError(null); }}
                    onBlur={() => handleBlur('email')}
                    placeholder="seu@email.com"
                    disabled={isLoading}
                    aria-invalid={!!(touched.email && emailError)}
                    aria-describedby={touched.email && emailError ? 'email-error' : undefined}
                    className={`w-full pl-12 pr-4 py-3 bg-input rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all text-foreground placeholder:text-muted-fg border ${
                      touched.email && emailError
                        ? 'border-red-400 focus:ring-red-400'
                        : touched.email && !emailError
                        ? 'border-green-500 focus:ring-green-500'
                        : 'border-border focus:ring-ring'
                    }`}
                  />
                </div>
                {touched.email && emailError && (
                  <p id="email-error" className="mt-1.5 text-xs text-red-500">{emailError}</p>
                )}
              </div>

              {/* Senha */}
              <div>
                <label htmlFor="password" className="block text-sm text-foreground mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
                    touched.password && passwordError ? 'text-red-400' : touched.password && !passwordError ? 'text-green-500' : 'text-muted-fg'
                  }`} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setSubmitError(null); }}
                    onBlur={() => handleBlur('password')}
                    placeholder="••••••••"
                    disabled={isLoading}
                    aria-invalid={!!(touched.password && passwordError)}
                    aria-describedby={touched.password && passwordError ? 'password-error' : undefined}
                    className={`w-full pl-12 pr-12 py-3 bg-input rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all text-foreground placeholder:text-muted-fg border ${
                      touched.password && passwordError
                        ? 'border-red-400 focus:ring-red-400'
                        : touched.password && !passwordError
                        ? 'border-green-500 focus:ring-green-500'
                        : 'border-border focus:ring-ring'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    disabled={isLoading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-fg hover:text-foreground transition-colors"
                  >
                    {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
                {touched.password && passwordError && (
                  <p id="password-error" className="mt-1.5 text-xs text-red-500">{passwordError}</p>
                )}
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-sm text-primary hover:text-secondary transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 hover:shadow-lg transition-all duration-300 disabled:opacity-50"
              >
                {isLoading ? (
                  <><Loader className="w-5 h-5 animate-spin" /><span>Entrando...</span></>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>

            <p className="text-center mt-6 text-sm text-muted-fg">
              Não tem uma conta?{' '}
              <Link to="/register" className="text-primary hover:text-secondary transition-colors">
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
