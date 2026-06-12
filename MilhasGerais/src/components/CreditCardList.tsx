import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard as CreditCardIcon, Plus, Trash2, ChevronRight } from 'lucide-react';
import { useCreditCards } from '../hooks/useCreditCards';
import { useAuth } from '../hooks/useAuth';
import { PageBackground, AppHeader, LoadingPage, ErrorPage } from './Layout';
import { AddCreditCardModal } from './AddCreditCardModal';

interface CreditCardListProps { onLogout: () => void; }

export function CreditCardList({ onLogout }: CreditCardListProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cards, isLoading, error, carregar, remover } = useCreditCards(user?.id);
  const [confirmId, setConfirmId]     = useState<number | null>(null);
  const [deletingId, setDeletingId]   = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [modalOpen, setModalOpen]     = useState(false);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await remover(id);
    } catch {
      setDeleteError('Erro ao remover cartão.');
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  if (isLoading) return <LoadingPage message="Carregando cartões..." />;
  if (error && cards.length === 0) return <ErrorPage message={error} />;

  return (
    <PageBackground>
      <AddCreditCardModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={carregar}
      />

      <AppHeader
        title="Meus Cartões"
        subtitle="Gerencie seus cartões"
        onBack={() => navigate('/home')}
        onLogout={() => { onLogout(); navigate('/login'); }}
      />

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">

        {deleteError && (
          <div className="p-4 bg-white/90 border border-red-200 rounded-xl text-red-700 text-sm">
            {deleteError}
          </div>
        )}

        <button
          onClick={() => setModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-4 bg-white/15 backdrop-blur-sm border border-white/30 rounded-2xl text-white hover:bg-white/25 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Adicionar novo cartão</span>
        </button>

        {cards.length === 0 ? (
          <div className="text-center py-16 text-white/80">
            <CreditCardIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum cartão cadastrado ainda.</p>
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-sm border border-white/50 rounded-2xl divide-y divide-[#E8E4DF] shadow-md">
            {cards.map(card => (
              <div key={card.id} className="p-4 flex items-center justify-between hover:bg-white/60 transition-colors">
                <button
                  onClick={() => navigate(`/cartoes/${card.id}`)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <div className="w-10 h-10 bg-[#EEF3F8] rounded-full flex items-center justify-center shrink-0">
                    <CreditCardIcon className="w-5 h-5 text-[#1B3A5C]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#2C2C2C]">{card.brand}</p>
                    <p className="text-xs text-[#7A7A7A]">{card.cardNumber}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#B0A99F] ml-auto mr-3" />
                </button>

                {confirmId === card.id ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setConfirmId(null)}
                      className="px-3 py-1 text-xs border border-[#E8E4DF] rounded-lg text-[#7A7A7A] hover:bg-[#F7F5F2] transition-colors"
                    >
                      Não
                    </button>
                    <button
                      onClick={() => handleDelete(card.id)}
                      disabled={deletingId === card.id}
                      className="px-3 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {deletingId === card.id ? 'Removendo...' : 'Sim, remover'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmId(card.id)}
                    className="p-2 rounded-full hover:bg-red-50 text-[#B0A99F] hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageBackground>
  );
}
