import { useEffect, useState } from 'react';
import { creditCardService } from '../services/creditCardService';
import { CreditCard } from '../types';

export function useCreditCards() {
  const [cards, setCards]         = useState<CreditCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const carregar = () => {
    setIsLoading(true);
    creditCardService.listar()
      .then(data => { setCards(data); setError(null); })
      .catch(() => setError('Erro ao carregar cartões'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { carregar(); }, []);

  const remover = async (id: number) => {
    await creditCardService.deletar(id);
    setCards(prev => prev.filter(c => c.id !== id));
  };

  return { cards, isLoading, error, carregar, remover };
}
