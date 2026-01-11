import React from 'react';
import { createPortal } from 'react-dom';
import { CashierSession } from '../types';

interface CashierInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    session?: CashierSession;
}

const CashierInfoModal: React.FC<CashierInfoModalProps> = ({ isOpen, onClose, session }) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[1000] flex justify-center items-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md animate-fadeIn" onClick={onClose}></div>

            <div className="relative bg-white dark:bg-surface-dark w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-fadeIn border border-white/10 flex flex-col">

                <div className="p-8 pb-0 flex flex-col items-center text-center">
                    <div className="size-20 bg-green-50 dark:bg-green-900/20 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-green-100 dark:border-green-900/30">
                        <span className="material-symbols-outlined text-4xl text-green-600 dark:text-green-500 font-black">check_circle</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Turno Iniciado</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        O caixa foi aberto com sucesso e o sistema está liberado para operações.
                    </p>
                </div>

                <div className="p-8 space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Abertura</span>
                            <span className="text-sm font-black dark:text-white">{session?.openedAt}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operador</span>
                            <span className="text-sm font-black dark:text-white">{session?.openedBy}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fundo Inicial</span>
                            <span className="text-lg font-black text-green-600 dark:text-green-400">R$ {session?.initialBalance.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-2xl border border-orange-100 dark:border-orange-900/20 flex gap-3">
                        <span className="material-symbols-outlined text-orange-500 text-xl shrink-0">info</span>
                        <p className="text-[11px] font-bold text-orange-800 dark:text-orange-200 leading-tight">
                            Ao encerrar o seu turno, lembre-se de conferir o caixa e realizar o fechamento para garantir a integridade financeira.
                        </p>
                    </div>
                </div>

                <div className="p-8 pt-0">
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-primary text-slate-900 font-black text-[12px] uppercase tracking-widest rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">thumb_up</span>
                        Estou Ciente
                    </button>
                </div>

            </div>
        </div>,
        document.body
    );
};

export default CashierInfoModal;
