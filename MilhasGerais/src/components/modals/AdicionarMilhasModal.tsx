import { useState } from 'react';
import { Loader, CheckCircle } from 'lucide-react';
import { Modal } from './Modal';
import { rewardTransactionService } from '../../services/rewardTransactionService';
import { DashboardPrograma } from '../../types';

interface AdicionarMilhasModalProps {
  onClose: () => void;
  onSuccess: () => void;
  userId: number;
  programas: DashboardPrograma[];
}

export function AdicionarMilhasModal({ onClose, onSuccess, userId, programas }: AdicionarMilhasModalProps) {
  const hoje = new Date().toISOString().split('T')[0];

  const [date, setDate]           = useState(hoje);
  const [amount, setAmount]       = useState('');
  const [miles, setMiles]         = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const inputClass = 'w-full px-4 py-3 bg-[#F7F5F2] border border-[#E8E4DF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] focus:border-transparent transition-all text-[#2C2C2C] placeholder:text-[#B0A99F]';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const milesNum  = Number(miles);
    const amountNum = Number(amount.replace(',', '.'));

    if (!date)              return setError('Informe a data.');
    if (amountNum <= 0)     return setError('Informe um valor válido.');
    if (milesNum <= 0)      return setError('Informe a quantidade de milhas.');

    setIsLoading(true);
    try {
      await rewardTransactionService.criar({
        userId,
        creditCardId: 1,
        date: new Date(date).toISOString(),
        amount: amountNum,
        milesEarned: milesNum,
      });
      setSuccess(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1500);
    } catch {
      setError('Erro ao registrar. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Modal title="Milhas adicionadas" onClose={onClose}>
        <div className="flex flex-col items-center py-6 gap-3">
          <CheckCircle className="w-16 h-16 text-[#1B3A5C]" />
          <p className="text-[#2C2C2C]">
            <strong>{Number(miles).toLocaleString('pt-BR')}</strong> milhas registradas com sucesso!
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Adicionar milhas" onClose={onClose}>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-[#2C2C2C] mb-1.5">Data da compra</label>
          <input
            type="date"
            value={date}
            max={hoje}
            onChange={e => setDate(e.target.value)}
            disabled={isLoading}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm text-[#2C2C2C] mb-1.5">Valor da compra (R$)</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0,00"
            disabled={isLoading}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm text-[#2C2C2C] mb-1.5">Milhas ganhas</label>
          <input
            type="number"
            min="1"
            value={miles}
            onChange={e => setMiles(e.target.value)}
            placeholder="Ex: 1500"
            disabled={isLoading}
            className={inputClass}
          />
          {programas.length > 0 && amount && miles && (
            <p className="mt-1 text-xs text-[#7A7A7A]">
              Taxa: {(Number(miles) / Number(amount.replace(',', '.'))).toFixed(1)} milhas/R$
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3 border border-[#E8E4DF] rounded-xl text-[#7A7A7A] hover:bg-[#F7F5F2] transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 py-3 bg-[#1B3A5C] text-white rounded-xl hover:bg-[#2A527A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? <><Loader className="w-4 h-4 animate-spin" />Salvando...</> : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
