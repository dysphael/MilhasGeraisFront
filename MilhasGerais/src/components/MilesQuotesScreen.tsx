import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, TrendingDown, Tag, ExternalLink, Clock, Zap } from 'lucide-react';
import { milesQuotesService } from '../services/milesQuotesService';
import { MilesQuote } from '../types';
import { PageBackground, AppHeader, LoadingPage } from './Layout';

interface MilesQuotesScreenProps { onLogout: () => void; }

const PROGRAM_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  Smiles:       { bg: 'bg-[#EEF3F8]', text: 'text-[#1B3A5C]', border: 'border-[#A0B4C8]/30' },
  'Latam Pass': { bg: 'bg-[#EEF3F8]', text: 'text-[#6B9FBF]', border: 'border-[#6B9FBF]/30' },
  Livelo:       { bg: 'bg-[#FDF6EE]', text: 'text-[#C5A46A]', border: 'border-[#C5A46A]/30' },
  TudoAzul:     { bg: 'bg-[#EEF3F8]', text: 'text-[#3A6B9A]', border: 'border-[#6B9FBF]/30' },
};

const PROGRAM_LOGO: Record<string, string> = {
  Smiles: '✈️', 'Latam Pass': '🛫', Livelo: '🎯', TudoAzul: '🛩️',
};

const fmt = (p: number) =>
  p.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 3 });

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export function MilesQuotesScreen({ onLogout }: MilesQuotesScreenProps) {
  const navigate = useNavigate();
  const [quotes, setQuotes]                       = useState<MilesQuote[]>([]);
  const [isLoading, setIsLoading]                 = useState(true);
  const [isRefreshing, setIsRefreshing]           = useState(false);
  const [refreshingProgram, setRefreshingProgram] = useState<string | null>(null);
  const [error, setError]                         = useState<string | null>(null);

  const fetchQuotes = useCallback(async () => {
    try {
      setIsLoading(true);
      setQuotes(await milesQuotesService.obterCotacoes());
      setError(null);
    } catch { setError('Erro ao carregar cotações.'); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchQuotes(); }, [fetchQuotes]);

  const handleRefreshAll = async () => {
    try {
      setIsRefreshing(true);
      setQuotes(await milesQuotesService.atualizarTodas());
    } catch { setError('Erro ao atualizar cotações.'); }
    finally { setIsRefreshing(false); }
  };

  const handleRefreshOne = async (programName: string) => {
    try {
      setRefreshingProgram(programName);
      const updated = await milesQuotesService.atualizarPrograma(programName);
      setQuotes(prev => prev.map(q => q.program === programName ? updated : q));
    } catch { setError(`Erro ao atualizar ${programName}.`); }
    finally { setRefreshingProgram(null); }
  };

  const bestQuote = quotes.length > 0 ? quotes.reduce((a, b) => a.pricePerMile < b.pricePerMile ? a : b) : null;

  if (isLoading) return <LoadingPage message="Buscando cotações..." />;

  return (
    <PageBackground>
      <AppHeader
        title="Cotação de Milhas"
        subtitle="Preços ao vivo dos programas"
        onBack={() => navigate('/home')}
        onLogout={() => { onLogout(); navigate('/login'); }}
        right={
          <button onClick={handleRefreshAll} disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-xl hover:bg-white/30 transition-colors disabled:opacity-50 text-sm">
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Atualizando...' : 'Atualizar tudo'}
          </button>
        }
      />

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">

        {error && (
          <div className="p-4 bg-white/90 backdrop-blur-sm border border-red-200 rounded-xl text-red-700 text-sm shadow-md">{error}</div>
        )}

        {/* Banner melhor cotação */}
        {bestQuote && (
          <div className="bg-white/15 backdrop-blur-sm rounded-3xl p-6 text-white shadow-lg border border-white/20">
            <div className="flex items-center gap-2 mb-1 opacity-80">
              <Zap className="w-4 h-4" />
              <span className="text-sm">Melhor cotação agora</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl mt-1">{fmt(bestQuote.pricePerMile)}</p>
                <p className="text-sm opacity-80 mt-1">por milha no {bestQuote.program}</p>
              </div>
              <span className="text-5xl">{PROGRAM_LOGO[bestQuote.program] ?? '✈️'}</span>
            </div>
            {bestQuote.isPromotion && (
              <div className="mt-4 bg-white/15 rounded-xl px-3 py-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span className="text-sm">{bestQuote.promotionDescription}</span>
              </div>
            )}
          </div>
        )}

        {/* Cards de cotação */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quotes.map(quote => {
            const style      = PROGRAM_STYLE[quote.program] ?? { bg: 'bg-[#EDE9E4]', text: 'text-[#2C2C2C]', border: 'border-[#E8E4DF]' };
            const isBest     = bestQuote?.program === quote.program;
            const isUpdating = refreshingProgram === quote.program;

            return (
              <div key={quote.program}
                className={`bg-white/90 backdrop-blur-sm rounded-2xl p-5 border-2 shadow-md transition-all ${
                  isBest ? 'border-[#C5A46A]' : 'border-white/50'
                }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${style.bg} rounded-xl flex items-center justify-center text-2xl border ${style.border}`}>
                      {PROGRAM_LOGO[quote.program] ?? '✈️'}
                    </div>
                    <div>
                      <p className="text-[#2C2C2C]">{quote.program}</p>
                      {isBest && (
                        <span className="text-xs text-[#C5A46A] bg-[#FDF6EE] px-2 py-0.5 rounded-full border border-[#C5A46A]/20">
                          Melhor preço
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => handleRefreshOne(quote.program)} disabled={isUpdating}
                    className="p-2 hover:bg-[#F7F5F2] rounded-full transition-colors disabled:opacity-50">
                    <RefreshCw className={`w-4 h-4 text-[#7A7A7A] ${isUpdating ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="mb-3">
                  <p className="text-3xl text-[#1B3A5C]">{fmt(quote.pricePerMile)}</p>
                  <p className="text-xs text-[#7A7A7A]">por milha</p>
                </div>

                {quote.bonusMultiplier && (
                  <div className={`flex items-center gap-2 ${style.bg} border ${style.border} rounded-xl px-3 py-2 mb-3`}>
                    <TrendingDown className={`w-4 h-4 ${style.text}`} />
                    <span className={`text-sm ${style.text}`}>
                      {((quote.bonusMultiplier - 1) * 100).toFixed(0)}% de bônus —
                      efetivo: {fmt(quote.pricePerMile / quote.bonusMultiplier)}/milha
                    </span>
                  </div>
                )}

                {quote.isPromotion && quote.promotionDescription && (
                  <div className="flex items-start gap-2 bg-[#FDF6EE] border border-[#C5A46A]/20 rounded-xl px-3 py-2 mb-3">
                    <Tag className="w-4 h-4 text-[#C5A46A] mt-0.5 shrink-0" />
                    <span className="text-sm text-[#8C6A30]">{quote.promotionDescription}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-[#E8E4DF]">
                  <div className="flex items-center gap-1 text-xs text-[#B0A99F]">
                    <Clock className="w-3 h-3" />
                    <span>{fmtDate(quote.scrapedAt)}</span>
                  </div>
                  <a href={quote.sourceUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-[#1B3A5C] hover:text-[#6B9FBF] transition-colors">
                    Ver site <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {quotes.length === 0 && !error && (
          <div className="text-center py-16 text-white/80">
            <p className="mb-4">Nenhuma cotação disponível ainda.</p>
            <button onClick={handleRefreshAll}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-xl hover:bg-white/30 transition-colors">
              Buscar cotações agora
            </button>
          </div>
        )}
      </div>
    </PageBackground>
  );
}
