import { useEffect, useState } from 'react';
import { creditCardService } from '../services/creditCardService';
import { rewardTransactionService } from '../services/rewardTransactionService';
import { CreditCard, RewardTransaction } from '../types';

export function useCreditCardDetail(id: number) {
  const [card, setCard]                 = useState<CreditCard | null>(null);
  const [transactions, setTransactions] = useState<RewardTransaction[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [error, setError]               = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      creditCardService.obterPorId(id),
      rewardTransactionService.listarPorCartao(id),
    ])
      .then(([cardData, txData]) => {
        setCard(cardData);
        setTransactions(txData);
        setError(null);
      })
      .catch(() => setError('Erro ao carregar dados do cartão'))
      .finally(() => setIsLoading(false));
  }, [id]);

  return { card, transactions, isLoading, error };
}
