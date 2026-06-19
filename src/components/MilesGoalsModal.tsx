import { useEffect, useState } from 'react';
import { X, Target, Plus, Trash2, Loader, XCircle, CheckCircle2 } from 'lucide-react';
import { milesGoalService } from '../services/milesGoalService';
import { MilesGoal } from '../types';
import { useAuth } from '../hooks/useAuth';

interface MilesGoalsModalProps {
  open: boolean;
  onClose: () => void;
  totalMiles: number;
  onChanged?: () => void;
}

export function MilesGoalsModal({ open, onClose, totalMiles, onChanged }: MilesGoalsModalProps) {
  const { user } = useAuth();

  const [goals, setGoals]       = useState<MilesGoal[]>([]);
  const [loading, setLoading]   = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [name, setName]                 = useState('');
  const [targetMiles, setTargetMiles]   = useState('');
  const [fieldErrors, setFieldErrors]   = useState<Record<string, string>>({});
  const [submitError, setSubmitError]   = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const reload = () => {
    if (!user) return Promise.resolve();
    setLoading(true);
    return milesGoalService.listarPorUsuario(user.id)
      .then(setGoals)
      .catch(() => setListError('Não foi possível carregar suas metas.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!open) return;
    setName('');
    setTargetMiles('');
    setFieldErrors({});
    setSubmitError(null);
    setListError(null);
    reload();
  }, [open, user]);

  if (!open) return null;

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Dê um nome pra meta (ex: "Lisboa 2026")';
    const target = Number(targetMiles);
    if (!targetMiles || !Number.isInteger(target) || target <= 0) {
      errors.targetMiles = 'Informe um número inteiro maior que zero';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!user) { setSubmitError('Usuário não autenticado.'); return; }
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await milesGoalService.criar({
        userId: user.id,
        name: name.trim(),
        targetMiles: Number(targetMiles),
      });
      setName('');
      setTargetMiles('');
      await reload();
      onChanged?.();
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Erro ao criar meta. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await milesGoalService.deletar(id);
      await reload();
      onChanged?.();
    } catch {
      setListError('Não foi possível remover a meta.');
    } finally {
      setDeletingId(null);
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
          <h2 className="text-lg text-[#2C2C2C]">Suas metas</h2>
          <button onClick={onClose}
            className="p-2 hover:bg-[#F7F5F2] rounded-full transition-colors">
            <X className="w-5 h-5 text-[#7A7A7A]" />
          </button>
        </div>

        {/* Form de criação */}
        <form onSubmit={handleCreate} className="p-6 space-y-4 border-b border-[#E8E4DF]" noValidate>
          {submitError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
              <p className="text-red-600 text-sm">{submitError}</p>
            </div>
          )}

          <div>
            <label htmlFor="goalName" className="block text-sm text-[#2C2C2C] mb-1.5">Nome da meta</label>
            <div className="relative">
              <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A7A7A]" />
              <input id="goalName" type="text" value={name}
                onChange={e => { setName(e.target.value); setFieldErrors(p => ({ ...p, name: '' })); }}
                placeholder="Ex: Lisboa 2026" disabled={isSubmitting}
                maxLength={100}
                className={`${inputBase} pl-12 pr-4 ${fieldErrors.name ? inputErr : inputOk}`} />
            </div>
            {fieldErrors.name && <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>}
          </div>

          <div>
            <label htmlFor="goalTarget" className="block text-sm text-[#2C2C2C] mb-1.5">Milhas necessárias</label>
            <input id="goalTarget" type="number" min="1" step="1" inputMode="numeric"
              value={targetMiles}
              onChange={e => { setTargetMiles(e.target.value); setFieldErrors(p => ({ ...p, targetMiles: '' })); }}
              placeholder="Ex: 80000" disabled={isSubmitting}
              className={`${inputBase} px-4 ${fieldErrors.targetMiles ? inputErr : inputOk}`} />
            {fieldErrors.targetMiles && <p className="mt-1 text-xs text-red-500">{fieldErrors.targetMiles}</p>}
          </div>

          <button type="submit" disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-[#1B3A5C] text-white hover:bg-[#2A527A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {isSubmitting
              ? <><Loader className="w-4 h-4 animate-spin" /> Criando...</>
              : <><Plus className="w-4 h-4" /> Criar meta</>}
          </button>
        </form>

        {/* Lista */}
        <div className="p-6 space-y-3">
          <h3 className="text-sm text-[#7A7A7A] uppercase tracking-wide">Metas existentes</h3>

          {listError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{listError}</div>
          )}

          {loading && (
            <div className="text-center py-6 text-[#7A7A7A] text-sm">Carregando...</div>
          )}

          {!loading && goals.length === 0 && !listError && (
            <div className="text-center py-6 text-[#7A7A7A] text-sm">
              Você ainda não tem metas cadastradas.
            </div>
          )}

          {!loading && goals.map(goal => {
            const progress  = Math.min(100, (totalMiles / goal.targetMiles) * 100);
            const achieved  = totalMiles >= goal.targetMiles;
            const remaining = Math.max(0, goal.targetMiles - totalMiles);

            return (
              <div key={goal.id}
                className={`rounded-2xl p-4 border ${achieved ? 'bg-[#EEF7EE] border-green-200' : 'bg-[#F7F5F2] border-[#E8E4DF]'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {achieved && <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />}
                      <p className="text-[#2C2C2C] truncate">{goal.name}</p>
                    </div>
                    <p className="text-xs text-[#7A7A7A] mt-0.5">
                      {goal.targetMiles.toLocaleString('pt-BR')} milhas
                      {!achieved && ` · faltam ${remaining.toLocaleString('pt-BR')}`}
                      {achieved && ' · atingida 🎉'}
                    </p>
                  </div>
                  <button onClick={() => handleDelete(goal.id)} disabled={deletingId === goal.id}
                    className="p-2 hover:bg-white rounded-full transition-colors disabled:opacity-50 shrink-0"
                    title="Excluir meta">
                    {deletingId === goal.id
                      ? <Loader className="w-4 h-4 text-[#7A7A7A] animate-spin" />
                      : <Trash2 className="w-4 h-4 text-[#7A7A7A]" />}
                  </button>
                </div>
                <div className="mt-3 bg-white rounded-full h-1.5 overflow-hidden">
                  <div className={`h-full rounded-full ${achieved ? 'bg-green-500' : 'bg-[#1B3A5C]'}`}
                    style={{ width: `${progress}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
