
import React from 'react';
import { createPortal } from 'react-dom';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  type?: 'danger' | 'warning';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  type = 'danger'
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[120] flex justify-center items-start p-4 overflow-y-auto pt-24 md:pt-48">
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md animate-fadeIn" onClick={onClose}></div>

      <div className="relative bg-white dark:bg-surface-dark w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-fadeIn border border-white/10 p-8 flex flex-col items-center text-center mb-10">
        <div className={`size-20 rounded-full flex items-center justify-center mb-6 ${type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'
          }`}>
          <span className="material-symbols-outlined text-4xl font-black animate-pulse">
            {type === 'danger' ? 'delete_forever' : 'warning'}
          </span>
        </div>

        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8">{message}</p>

        <div className="flex gap-3 w-full">
          <button onClick={onClose} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-2xl">Cancelar</button>
          <button onClick={() => { onConfirm(); onClose(); }} className={`flex-1 py-4 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl ${type === 'danger' ? 'bg-red-600 shadow-red-600/20' : 'bg-orange-600 shadow-orange-600/20'}`}>{confirmText}</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;
