import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Calendar, CreditCard, TrendingUp, Trash2 } from 'lucide-react';
import { rewardTransactionService } from '../services/rewardTransactionService';
import { RewardTransaction } from '../types';
import { PageBackground, AppHeader, LoadingPage, ErrorPage } from './Layout';

interface HistoricoScreenProps { onLogout: () => void; }

export function HistoricoScreen({ onLogout }: HistoricoScreenProps) {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<RewardTransaction[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [deletingId, setDeletingId]     = useState<number | null>(null);
  const [confirmId, setConfirmId]       = useState<number | null>(null);

  useEffect(() => {
    rewardTransactionService.listar()
      .then(data => { setTransactions(data); setError(null); })
      .catch(() => setError('Erro ao carregar histórico de transações'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await rewardTransactionService.deletar(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch {
      setError('Erro ao remover a transação.');
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  const totalMilhas = transactions.reduce((s, t) => s + t.milesEarned, 0);

  if (isLoading) return <LoadingPage message="Carregando histórico..." />;
  if (error && transactions.length === 0) return <ErrorPage message={error} />;

  return (
    <PageBackground>
      <AppHeader
        title="Histórico"
        subtitle="Todas as suas movimentações"
        onBack={() => navigate('/home')}
        onLogout={() => { onLogout(); navigate('/login'); }}
      />

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">

        {error && (
          <div className="p-4 bg-white/90 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Resumo */}
        <div className="bg-white/15 backdrop-blur-sm rounded-3xl p-6 text-white border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Total de milhas registradas</p>
              <p className="text-4xl mt-1">{totalMilhas.toLocaleString('pt-BR')}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">Transações</p>
              <p className="text-3xl mt-1">{transactions.length}</p>
            </div>
          </div>
        </div>

        {/* Lista */}
        {transactions.length === 0 ? (
          <div className="text-center py-16 text-white/80">
            <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma transação registrada ainda.</p>
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-sm border border-white/50 rounded-2xl divide-y divide-[#E8E4DF] shadow-md">
            {transactions.map(tx => (
              <div
                key={tx.id}
                className="p-4 flex items-center justify-between hover:bg-white/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#EEF3F8] rounded-full flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5 text-[#1B3A5C]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#2C2C2C]">Compra no cartão #{tx.creditCardId}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-xs text-[#7A7A7A]">
                        <Calendar className="w-3 h-3" />
                        {new Date(tx.date).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-[#7A7A7A]">
                        <CreditCard className="w-3 h-3" />
                        R$ {Number(tx.amount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-[#1B3A5C]">+{tx.milesEarned.toLocaleString('pt-BR')}</p>
                    <p className="text-xs text-[#7A7A7A]">milhas</p>
                  </div>

                  {/* Confirmação de exclusão inline */}
                  {confirmId === tx.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setConfirmId(null)}
                        className="px-3 py-1 text-xs border border-[#E8E4DF] rounded-lg text-[#7A7A7A] hover:bg-[#F7F5F2] transition-colors"
                      >
                        Não
                      </button>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        disabled={deletingId === tx.id}
                        className="px-3 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        {deletingId === tx.id ? 'Removendo...' : 'Sim, remover'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmId(tx.id)}
                      className="p-2 rounded-full hover:bg-red-50 text-[#B0A99F] hover:text-red-500 transition-colors"
                      aria-label="Remover transação"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageBackground>
  );
}
