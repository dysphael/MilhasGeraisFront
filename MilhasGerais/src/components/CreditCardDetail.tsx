import { useNavigate, useParams } from 'react-router-dom';
import { TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { useCreditCardDetail } from '../hooks/useCreditCardDetail';
import { PageBackground, AppHeader, LoadingPage, ErrorPage } from './Layout';

interface CreditCardDetailProps { onLogout: () => void; }

export function CreditCardDetail({ onLogout }: CreditCardDetailProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { card, transactions, isLoading, error } = useCreditCardDetail(Number(id));

  if (isLoading) return <LoadingPage message="Carregando cartão..." />;
  if (error || !card) return <ErrorPage message={error || 'Cartão não encontrado'} />;

  const totalMilhas = transactions.reduce((s, t) => s + t.milesEarned, 0);

  return (
    <PageBackground>
      <AppHeader
        title={card.brand}
        subtitle={card.cardNumber}
        onBack={() => navigate('/cartoes')}
        onLogout={() => { onLogout(); navigate('/login'); }}
      />

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">

        <div className="bg-white/15 backdrop-blur-sm rounded-3xl p-6 text-white border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Total de milhas ganhas</p>
              <p className="text-4xl mt-1">{totalMilhas.toLocaleString('pt-BR')}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">Transações</p>
              <p className="text-3xl mt-1">{transactions.length}</p>
            </div>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-16 text-white/80">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma transação encontrada para este cartão.</p>
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-sm border border-white/50 rounded-2xl divide-y divide-[#E8E4DF] shadow-md">
            {transactions.map(tx => (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-white/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#EEF3F8] rounded-full flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5 text-[#1B3A5C]" />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#7A7A7A]">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(tx.date).toLocaleDateString('pt-BR')}</span>
                    <DollarSign className="w-3 h-3 ml-1" />
                    <span>R$ {Number(tx.amount).toFixed(2)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#1B3A5C]">+{tx.milesEarned.toLocaleString('pt-BR')}</p>
                  <p className="text-xs text-[#7A7A7A]">milhas</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageBackground>
  );
}
