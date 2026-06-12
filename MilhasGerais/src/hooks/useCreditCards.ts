import { useEffect, useState } from 'react';
import { creditCardService } from '../services/creditCardService';
import { CreditCard } from '../types';

export function useCreditCards(userId?: number) {
  const [cards, setCards]         = useState<CreditCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const carregar = () => {
    setIsLoading(true);
    const fetch = userId
      ? creditCardService.listarPorUsuario(userId)
      : creditCardService.listar();

    fetch
      .then(data => { setCards(data); setError(null); })
      .catch(() => setError('Erro ao carregar cartões'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { carregar(); }, [userId]);

  const remover = async (id: number) => {
    await creditCardService.deletar(id);
    setCards(prev => prev.filter(c => c.id !== id));
  };

  return { cards, isLoading, error, carregar, remover };
}
