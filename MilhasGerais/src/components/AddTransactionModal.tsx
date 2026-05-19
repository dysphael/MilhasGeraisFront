import { useEffect, useState } from 'react';
import { X, CreditCard as CreditCardIcon, Calendar, DollarSign, Plane, Loader, XCircle } from 'lucide-react';
import { creditCardService } from '../services/creditCardService';
import { rewardTransactionService } from '../services/rewardTransactionService';
import { CreditCard } from '../types';
import { useAuth } from '../hooks/useAuth';

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export function AddTransactionModal({ open, onClose, onCreated }: AddTransactionModalProps) {
  const { user } = useAuth();

  const [cards, setCards]               = useState<CreditCard[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);

  const [creditCardId, setCreditCardId] = useState<number | ''>('');
  const [date, setDate]                 = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [amount, setAmount]             = useState<string>('');
  const [milesEarned, setMilesEarned]   = useState<string>('');

  const [fieldErrors, setFieldErrors]   = useState<Record<string, string>>({});
  const [submitError, setSubmitError]   = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    setSubmitError(null);
    setFieldErrors({});
    setAmount('');
    setMilesEarned('');
    setDate(new Date().toISOString().slice(0, 10));
    setCreditCardId('');

    setLoadingCards(true);
    creditCardService.listar()
      .then(all => {
        const mine = user ? all.filter(c => c.userId === user.id) : all;
        setCards(mine);
        if (mine.length === 1) setCreditCardId(mine[0].id);
      })
      .catch(() => setSubmitError('Não foi possível carregar seus cartões.'))
      .finally(() => setLoadingCards(false));
  }, [open, user]);

  if (!open) return null;

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!creditCardId)                                errors.creditCardId = 'Selecione um cartão';
    if (!date)                                        errors.date         = 'Informe a data';
    const amountNum = Number(amount.replace(',', '.'));
    if (!amount || Number.isNaN(amountNum) || amountNum <= 0) errors.amount = 'Informe um valor válido';
    const milesNum = Number(milesEarned);
    if (!milesEarned || !Number.isInteger(milesNum) || milesNum < 0) errors.milesEarned = 'Informe a quantidade de milhas';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!user) { setSubmitError('Usuário não autenticado.'); return; }
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await rewardTransactionService.criar({
        userId: user.id,
        creditCardId: Number(creditCardId),
        date: new Date(date).toISOString(),
        amount: Number(amount.replace(',', '.')),
        milesEarned: Number(milesEarned),
      });
      onCreated?.();
      onClose();
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Erro ao adicionar transação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBase = 'w-full py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/30 focus:border-[#1B3A5C] transition-all text-[#2C2C2C] placeholder:text-[#B0A99F]';
  const inputOk   = 'border-[#E8E4DF]';
  const inputErr  = 'border-red-400 bg-red-50/40';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
         onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
           onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E4DF]">
          <h2 className="text-lg text-[#2C2C2C]">Nova transação</h2>
          <button onClick={onClose}
            className="p-2 hover:bg-[#F7F5F2] rounded-full transition-colors">
            <X className="w-5 h-5 text-[#7A7A7A]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>

          {submitError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
              <p className="text-red-600 text-sm">{submitError}</p>
            </div>
          )}

          {/* Cartão */}
          <div>
            <label htmlFor="card" className="block text-sm text-[#2C2C2C] mb-1.5">Cartão de crédito</label>
            <div className="relative">
              <CreditCardIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A7A7A]" />
              <select id="card" value={creditCardId}
                onChange={e => { setCreditCardId(e.target.value ? Number(e.target.value) : ''); setFieldErrors(p => ({ ...p, creditCardId: '' })); }}
                disabled={isSubmitting || loadingCards}
                className={`${inputBase} pl-12 pr-4 appearance-none ${fieldErrors.creditCardId ? inputErr : inputOk}`}>
                <option value="">{loadingCards ? 'Carregando cartões...' : 'Selecione um cartão'}</option>
                {cards.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.brand} • final {c.cardNumber.slice(-4)}
                  </option>
                ))}
              </select>
            </div>
            {fieldErrors.creditCardId && <p className="mt-1 text-xs text-red-500">{fieldErrors.creditCardId}</p>}
            {!loadingCards && cards.length === 0 && (
              <p className="mt-1 text-xs text-[#7A7A7A]">Você ainda não tem cartões cadastrados.</p>
            )}
          </div>

          {/* Data */}
          <div>
            <label htmlFor="date" className="block text-sm text-[#2C2C2C] mb-1.5">Data</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A7A7A]" />
              <input id="date" type="date" value={date}
                onChange={e => { setDate(e.target.value); setFieldErrors(p => ({ ...p, date: '' })); }}
                disabled={isSubmitting}
                className={`${inputBase} pl-12 pr-4 ${fieldErrors.date ? inputErr : inputOk}`} />
            </div>
            {fieldErrors.date && <p className="mt-1 text-xs text-red-500">{fieldErrors.date}</p>}
          </div>

          {/* Valor */}
          <div>
            <label htmlFor="amount" className="block text-sm text-[#2C2C2C] mb-1.5">Valor gasto (R$)</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A7A7A]" />
              <input id="amount" type="number" min="0" step="0.01" inputMode="decimal" value={amount}
                onChange={e => { setAmount(e.target.value); setFieldErrors(p => ({ ...p, amount: '' })); }}
                placeholder="0,00" disabled={isSubmitting}
                className={`${inputBase} pl-12 pr-4 ${fieldErrors.amount ? inputErr : inputOk}`} />
            </div>
            {fieldErrors.amount && <p className="mt-1 text-xs text-red-500">{fieldErrors.amount}</p>}
          </div>

          {/* Milhas */}
          <div>
            <label htmlFor="miles" className="block text-sm text-[#2C2C2C] mb-1.5">Milhas geradas</label>
            <div className="relative">
              <Plane className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A7A7A]" />
              <input id="miles" type="number" min="0" step="1" inputMode="numeric" value={milesEarned}
                onChange={e => { setMilesEarned(e.target.value); setFieldErrors(p => ({ ...p, milesEarned: '' })); }}
                placeholder="0" disabled={isSubmitting}
                className={`${inputBase} pl-12 pr-4 ${fieldErrors.milesEarned ? inputErr : inputOk}`} />
            </div>
            {fieldErrors.milesEarned && <p className="mt-1 text-xs text-red-500">{fieldErrors.milesEarned}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl border border-[#E8E4DF] text-[#2C2C2C] hover:bg-[#F7F5F2] transition-colors disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting || loadingCards}
              className="flex-1 py-3 rounded-xl bg-[#1B3A5C] text-white hover:bg-[#2A527A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {isSubmitting ? <><Loader className="w-4 h-4 animate-spin" /> Salvando...</> : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
