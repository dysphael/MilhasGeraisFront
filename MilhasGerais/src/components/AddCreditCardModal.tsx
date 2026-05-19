import { useEffect, useState } from 'react';
import { X, CreditCard as CreditCardIcon, Building2, Loader, XCircle } from 'lucide-react';
import { creditCardService } from '../services/creditCardService';
import { useAuth } from '../hooks/useAuth';

interface AddCreditCardModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const BRANDS = ['Visa', 'Mastercard', 'Elo', 'American Express', 'Hipercard', 'Outro'];

// Formata o número do cartão em grupos de 4: "1234 5678 9012 3456".
function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 19);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

export function AddCreditCardModal({ open, onClose, onCreated }: AddCreditCardModalProps) {
  const { user } = useAuth();

  const [cardNumber, setCardNumber] = useState('');
  const [brand, setBrand]           = useState('');

  const [fieldErrors, setFieldErrors]   = useState<Record<string, string>>({});
  const [submitError, setSubmitError]   = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCardNumber('');
    setBrand('');
    setFieldErrors({});
    setSubmitError(null);
  }, [open]);

  if (!open) return null;

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    const digits = cardNumber.replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19) {
      errors.cardNumber = 'Informe um número de cartão válido (13 a 19 dígitos)';
    }
    if (!brand) errors.brand = 'Selecione a bandeira';
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
      await creditCardService.criar({
        userId: user.id,
        cardNumber: cardNumber.replace(/\D/g, ''),
        brand,
      });
      onCreated?.();
      onClose();
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Erro ao adicionar cartão. Tente novamente.');
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
          <h2 className="text-lg text-[#2C2C2C]">Adicionar cartão</h2>
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

          {/* Número do cartão */}
          <div>
            <label htmlFor="cardNumber" className="block text-sm text-[#2C2C2C] mb-1.5">Número do cartão</label>
            <div className="relative">
              <CreditCardIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A7A7A]" />
              <input id="cardNumber" type="text" inputMode="numeric" autoComplete="cc-number"
                value={cardNumber}
                onChange={e => { setCardNumber(formatCardNumber(e.target.value)); setFieldErrors(p => ({ ...p, cardNumber: '' })); }}
                placeholder="0000 0000 0000 0000" disabled={isSubmitting}
                maxLength={23}
                className={`${inputBase} pl-12 pr-4 ${fieldErrors.cardNumber ? inputErr : inputOk}`} />
            </div>
            {fieldErrors.cardNumber && <p className="mt-1 text-xs text-red-500">{fieldErrors.cardNumber}</p>}
          </div>

          {/* Bandeira */}
          <div>
            <label htmlFor="brand" className="block text-sm text-[#2C2C2C] mb-1.5">Bandeira</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A7A7A]" />
              <select id="brand" value={brand}
                onChange={e => { setBrand(e.target.value); setFieldErrors(p => ({ ...p, brand: '' })); }}
                disabled={isSubmitting}
                className={`${inputBase} pl-12 pr-4 appearance-none ${fieldErrors.brand ? inputErr : inputOk}`}>
                <option value="">Selecione a bandeira</option>
                {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            {fieldErrors.brand && <p className="mt-1 text-xs text-red-500">{fieldErrors.brand}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl border border-[#E8E4DF] text-[#2C2C2C] hover:bg-[#F7F5F2] transition-colors disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl bg-[#1B3A5C] text-white hover:bg-[#2A527A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {isSubmitting ? <><Loader className="w-4 h-4 animate-spin" /> Salvando...</> : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
