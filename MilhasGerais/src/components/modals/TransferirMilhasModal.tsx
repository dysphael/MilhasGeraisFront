import { useState } from 'react';
import { ArrowRightLeft, CheckCircle } from 'lucide-react';
import { Modal } from './Modal';
import { DashboardPrograma } from '../../types';

interface TransferirMilhasModalProps {
  onClose: () => void;
  programas: DashboardPrograma[];
}

export function TransferirMilhasModal({ onClose, programas }: TransferirMilhasModalProps) {
  const [origem, setOrigem]       = useState('');
  const [destino, setDestino]     = useState('');
  const [miles, setMiles]         = useState('');
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const selectClass = 'w-full px-4 py-3 bg-[#F7F5F2] border border-[#E8E4DF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] focus:border-transparent transition-all text-[#2C2C2C]';
  const inputClass  = 'w-full px-4 py-3 bg-[#F7F5F2] border border-[#E8E4DF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] focus:border-transparent transition-all text-[#2C2C2C] placeholder:text-[#B0A99F]';

  const origemPrograma  = programas.find(p => p.id === origem);
  const milesNum        = Number(miles);
  const saldoInsuficiente = origemPrograma && milesNum > origemPrograma.miles;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!origem)              return setError('Selecione o programa de origem.');
    if (!destino)             return setError('Selecione o programa de destino.');
    if (origem === destino)   return setError('Origem e destino não podem ser iguais.');
    if (milesNum <= 0)        return setError('Informe a quantidade de milhas.');
    if (saldoInsuficiente)    return setError(`Saldo insuficiente em ${origemPrograma?.name}.`);

    setSuccess(true);
  };

  if (success) {
    return (
      <Modal title="Transferência solicitada" onClose={onClose}>
        <div className="flex flex-col items-center py-6 gap-3 text-center">
          <CheckCircle className="w-16 h-16 text-[#1B3A5C]" />
          <p className="text-[#2C2C2C]">
            Transferência de <strong>{milesNum.toLocaleString('pt-BR')} milhas</strong> de{' '}
            <strong>{programas.find(p => p.id === origem)?.name}</strong> para{' '}
            <strong>{programas.find(p => p.id === destino)?.name}</strong> solicitada.
          </p>
          <p className="text-xs text-[#7A7A7A]">O prazo pode variar conforme o programa.</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Transferir milhas" onClose={onClose}>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-[#2C2C2C] mb-1.5">De (origem)</label>
          <select value={origem} onChange={e => setOrigem(e.target.value)} className={selectClass}>
            <option value="">Selecione o programa</option>
            {programas.map(p => (
              <option key={p.id} value={p.id}>
                {p.logo} {p.name} — {p.miles.toLocaleString('pt-BR')} milhas
              </option>
            ))}
          </select>
        </div>

        {/* Seta de transferência */}
        <div className="flex items-center justify-center">
          <div className="w-10 h-10 bg-[#EEF3F8] rounded-full flex items-center justify-center">
            <ArrowRightLeft className="w-5 h-5 text-[#1B3A5C]" />
          </div>
        </div>

        <div>
          <label className="block text-sm text-[#2C2C2C] mb-1.5">Para (destino)</label>
          <select value={destino} onChange={e => setDestino(e.target.value)} className={selectClass}>
            <option value="">Selecione o programa</option>
            {programas.filter(p => p.id !== origem).map(p => (
              <option key={p.id} value={p.id}>
                {p.logo} {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-[#2C2C2C] mb-1.5">Quantidade de milhas</label>
          <input
            type="number"
            min="1"
            max={origemPrograma?.miles}
            value={miles}
            onChange={e => setMiles(e.target.value)}
            placeholder="Ex: 5000"
            className={`${inputClass} ${saldoInsuficiente ? 'border-red-300 bg-red-50' : ''}`}
          />
          {origemPrograma && (
            <p className={`mt-1 text-xs ${saldoInsuficiente ? 'text-red-500' : 'text-[#7A7A7A]'}`}>
              Disponível: {origemPrograma.miles.toLocaleString('pt-BR')} milhas
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 border border-[#E8E4DF] rounded-xl text-[#7A7A7A] hover:bg-[#F7F5F2] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 py-3 bg-[#1B3A5C] text-white rounded-xl hover:bg-[#2A527A] transition-colors flex items-center justify-center gap-2"
          >
            Transferir
          </button>
        </div>
      </form>
    </Modal>
  );
}
