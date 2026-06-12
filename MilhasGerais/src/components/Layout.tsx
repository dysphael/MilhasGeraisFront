// Componentes de layout reutilizáveis que replicam a pegada da LoginScreen:
// fundo gradiente azul profundo, header fixo com vidro fosco, card branco flutuante.

import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, Plane } from 'lucide-react';

// ── Fundo gradiente — usado em todas as páginas ──────────────────
export function PageBackground({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-700 to-cyan-500">
      {/* Esferas decorativas — mesma pegada do login */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 rounded-full blur-3xl pointer-events-none" />
      {children}
    </div>
  );
}

// ── Header com efeito de vidro ────────────────────────────────────
interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onLogout?: () => void;
  right?: ReactNode;
  /** Ação inline ao lado do nome (botão pequeno, ícone, etc.). */
  nameAction?: ReactNode;
}

export function AppHeader({ title, subtitle, onBack, onLogout, right, nameAction }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 backdrop-blur-md bg-white/10 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack}
              className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          {!onBack && (
            <div className="flex items-center justify-center w-9 h-9 bg-white/15 rounded-full">
              <Plane className="w-5 h-5 text-white" />
            </div>
          )}
          <div>
            <p className="text-white leading-tight">{title}</p>
            {subtitle && <p className="text-white/60 text-xs">{subtitle}</p>}
          </div>
          {nameAction}
        </div>

        <div className="flex items-center gap-2">
          {right}
          {onLogout && (
            <button onClick={onLogout}
              className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition-all"
              title="Sair">
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

// ── Card branco flutuante — mesmo estilo do login ─────────────────
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-3xl shadow-2xl border border-white/50 ${className}`}>
      {children}
    </div>
  );
}

// ── Seção de título de página (acima do conteúdo principal) ───────
export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center py-6 pb-0">
      <h1 className="text-2xl text-white">{title}</h1>
      {subtitle && <p className="text-white/70 text-sm mt-1">{subtitle}</p>}
    </div>
  );
}

// ── Spinner de carregamento no fundo gradiente ────────────────────
export function LoadingPage({ message = 'Carregando...' }: { message?: string }) {
  return (
    <PageBackground>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4" />
          <p className="text-white/80">{message}</p>
        </div>
      </div>
    </PageBackground>
  );
}

// ── Tela de erro no fundo gradiente ──────────────────────────────
export function ErrorPage({ message }: { message: string }) {
  return (
    <PageBackground>
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 max-w-sm w-full text-center">
          <p className="text-destructive mb-4">{message}</p>
          <button onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors">
            Tentar novamente
          </button>
        </Card>
      </div>
    </PageBackground>
  );
}
