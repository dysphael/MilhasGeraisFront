import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ title, onClose, children }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-white/50 p-8 z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl text-[#2C2C2C]">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#F7F5F2] transition-colors text-[#7A7A7A] hover:text-[#2C2C2C]"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
