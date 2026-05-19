import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RefreshCw,
  TrendingDown,
  Tag,
  ExternalLink,
  LogOut,
  Clock,
  Zap,
} from 'lucide-react';
import { milesQuotesService } from '../services/milesQuotesService';
import { MilesQuote } from '../types';

interface MilesQuotesScreenProps {
  onLogout: () => void;
}

const PROGRAM_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Smiles:      { bg: 'bg-[#054A91]/10', text: 'text-[#054A91]', border: 'border-[#054A91]/20' },
  'Latam Pass':{ bg: 'bg-[#6EA4BF]/10', text: 'text-[#6EA4BF]', border: 'border-[#6EA4BF]/20' },
  Livelo:      { bg: 'bg-[#748944]/10', text: 'text-[#748944]', border: 'border-[#748944]/20' },
  TudoAzul:   { bg: 'bg-blue-500/10',  text: 'text-blue-600',  border: 'border-blue-300/30'  },
};

const PROGRAM_LOGOS: Record<string, string> = {
  Smiles:      '✈️',
  'Latam Pass':'🛫',
  Livelo:      '🎯',
  TudoAzul:   '🛩️',
};

function formatPrice(price: number): string {
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 3 });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function MilesQuotesScreen({ onLogout }: MilesQuotesScreenProps) {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<MilesQuote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshingProgram, setRefreshingProgram] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotes = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await milesQuotesService.obterCotacoes();
      setQuotes(data);
      setError(null);
    } catch {
      setError('Erro ao carregar cotações.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchQuotes(); }, [fetchQuotes]);

  const handleRefreshAll = async () => {
    try {
      setIsRefreshing(true);
      const data = await milesQuotesService.atualizarTodas();
      setQuotes(data);
    } catch {
      setError('Erro ao atualizar cotações.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefreshOne = async (programName: string) => {
    try {
      setRefreshingProgram(programName);
      const updated = await milesQuotesService.atualizarPrograma(programName);
      setQuotes(prev => prev.map(q => q.program === programName ? updated : q));
    } catch {
      setError(`Erro ao atualizar ${programName}.`);
    } finally {
      setRefreshingProgram(null);
    }
  };

  // Melhor cotação (menor preço)
  const bestQuote = quotes.length > 0
    ? quotes.reduce((a, b) => a.pricePerMile < b.pricePerMile ? a : b)
    : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#C2EFEB]/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#054A91] mx-auto mb-4"></div>
          <p className="text-gray-600">Buscando cotações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#C2EFEB]/20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/home')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div>
              <h1 className="text-2xl text-gray-800">Cotação de Milhas</h1>
              <p className="text-sm text-gray-600">Preços ao vivo dos programas</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefreshAll}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-[#054A91] text-white rounded-xl hover:bg-[#6EA4BF] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Atualizando...' : 'Atualizar tudo'}
            </button>
            <button
              onClick={() => { onLogout(); navigate('/login'); }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <LogOut className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Erro */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Banner da melhor cotação */}
        {bestQuote && (
          <div className="bg-gradient-to-br from-[#748944] to-[#4a5e2a] rounded-3xl p-6 text-white shadow-xl">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-5 h-5" />
              <span className="text-sm opacity-90">Melhor cotação agora</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl mt-1">{formatPrice(bestQuote.pricePerMile)}</p>
                <p className="text-sm opacity-90 mt-1">por milha no {bestQuote.program}</p>
              </div>
              <span className="text-5xl">{PROGRAM_LOGOS[bestQuote.program] ?? '✈️'}</span>
            </div>
            {bestQuote.isPromotion && (
              <div className="mt-4 bg-white/20 rounded-xl px-3 py-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span className="text-sm">{bestQuote.promotionDescription}</span>
              </div>
            )}
          </div>
        )}

        {/* Cards de cotação */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quotes.map(quote => {
            const colors = PROGRAM_COLORS[quote.program] ?? {
              bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200',
            };
            const isBest = bestQuote?.program === quote.program;
            const isUpdating = refreshingProgram === quote.program;

            return (
              <div
                key={quote.program}
                className={`bg-white rounded-2xl p-5 shadow-sm border-2 transition-all ${
                  isBest ? 'border-[#748944]' : 'border-transparent'
                }`}
              >
                {/* Cabeçalho do card */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center text-2xl border ${colors.border}`}>
                      {PROGRAM_LOGOS[quote.program] ?? '✈️'}
                    </div>
                    <div>
                      <p className="text-gray-800 font-medium">{quote.program}</p>
                      {isBest && (
                        <span className="text-xs text-[#748944] bg-[#748944]/10 px-2 py-0.5 rounded-full">
                          Melhor preço
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRefreshOne(quote.program)}
                    disabled={isUpdating}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                    title={`Atualizar ${quote.program}`}
                  >
                    <RefreshCw className={`w-4 h-4 text-gray-500 ${isUpdating ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Preço */}
                <div className="mb-4">
                  <p className="text-3xl text-gray-800">{formatPrice(quote.pricePerMile)}</p>
                  <p className="text-sm text-gray-500">por milha</p>
                </div>

                {/* Bônus */}
                {quote.bonusMultiplier && (
                  <div className={`flex items-center gap-2 ${colors.bg} ${colors.border} border rounded-xl px-3 py-2 mb-3`}>
                    <TrendingDown className={`w-4 h-4 ${colors.text}`} />
                    <span className={`text-sm ${colors.text}`}>
                      {((quote.bonusMultiplier - 1) * 100).toFixed(0)}% de bônus
                      {' '}— preço efetivo: {formatPrice(quote.pricePerMile / quote.bonusMultiplier)}/milha
                    </span>
                  </div>
                )}

                {/* Promoção */}
                {quote.isPromotion && quote.promotionDescription && (
                  <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 mb-3">
                    <Tag className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                    <span className="text-sm text-orange-700">{quote.promotionDescription}</span>
                  </div>
                )}

                {/* Rodapé */}
                <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(quote.scrapedAt)}</span>
                  </div>
                  <a
                    href={quote.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-[#054A91] hover:text-[#6EA4BF] transition-colors"
                  >
                    Ver site
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {quotes.length === 0 && !error && (
          <div className="text-center py-16 text-gray-500">
            <p className="mb-4">Nenhuma cotação disponível ainda.</p>
            <button
              onClick={handleRefreshAll}
              className="px-4 py-2 bg-[#054A91] text-white rounded-xl hover:bg-[#6EA4BF] transition-colors"
            >
              Buscar cotações agora
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
