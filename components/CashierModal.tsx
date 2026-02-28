
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CashierSession } from '../types';

interface CashierModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCashierOpen: boolean;
  session?: CashierSession;
  onConfirm: (initialBalance: number) => void;
  onToggle: (finalBalance: number) => void;
  onRecordSkimming?: (amount: number, reason: string) => void;
}

type CashierTab = 'CLOSE' | 'SKIM';

const CashierModal: React.FC<CashierModalProps> = ({
  isOpen,
  onClose,
  isCashierOpen,
  session,
  onConfirm,
  onToggle,
  onRecordSkimming
}) => {
  const [activeTab, setActiveTab] = useState<CashierTab>('CLOSE');
  const [initialBalanceInput, setInitialBalanceInput] = useState<number>(0);
  const [closingBalanceInput, setClosingBalanceInput] = useState<number>(0);
  const [skimmingAmount, setSkimmingAmount] = useState<number>(0);
  const [skimmingReason, setSkimmingReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Lógica de Saldos
  const totalSalesAll = Number(session?.totalSales) || 0;
  const cashSales = Number(session?.cashSales) || 0;
  const pixSales = Number(session?.pixSales) || 0;
  const cardSales = Number(session?.cardSales) || 0;
  const otherSales = Number(session?.otherSales) || 0;
  const totalSkimmings = Number(session?.totalSkimmings) || 0;
  const initialBalance = Number(session?.initialBalance) || 0;

  // O saldo físico esperado em dinheiro
  const expectedTotal = initialBalance + cashSales - totalSkimmings;
  const difference = closingBalanceInput - expectedTotal;

  useEffect(() => {
    if (isOpen) {
      setInitialBalanceInput(0);
      setClosingBalanceInput(0);
      setSkimmingAmount(0);
      setSkimmingReason('');
      setNotes('');
      setActiveTab('CLOSE');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAction = () => {
    setIsProcessing(true);
    setTimeout(() => {
      if (!isCashierOpen) {
        onConfirm(initialBalanceInput);
      } else {
        if (activeTab === 'SKIM') {
          onRecordSkimming?.(skimmingAmount, skimmingReason);
          setSkimmingAmount(0);
          setSkimmingReason('');
          setActiveTab('CLOSE');
        } else {
          onToggle(closingBalanceInput);
        }
      }
      setIsProcessing(false);
      if (activeTab === 'CLOSE' || !isCashierOpen) onClose();
    }, 1200);
  };

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAction();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[999] flex justify-center items-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md animate-fadeIn" onClick={onClose}></div>

      <div className="relative bg-white dark:bg-surface-dark w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-fadeIn border border-white/10 flex flex-col max-h-[95vh]">

        {/* Header e Navegação */}
        <div className={`p-10 flex flex-col items-center text-center pb-6 shrink-0 ${!isCashierOpen ? 'bg-primary/5' :
          activeTab === 'SKIM' ? 'bg-orange-50/50 dark:bg-orange-900/10' : 'bg-red-50/50 dark:bg-red-900/10'
          }`}>
          <div className={`size-20 rounded-3xl flex items-center justify-center mb-6 shadow-xl ${!isCashierOpen ? 'bg-white dark:bg-slate-800 text-primary' :
            activeTab === 'SKIM' ? 'bg-white dark:bg-slate-800 text-orange-500' : 'bg-white dark:bg-slate-800 text-red-500'
            }`}>
            <span className="material-symbols-outlined text-4xl font-black">
              {!isCashierOpen ? 'lock_open' : activeTab === 'SKIM' ? 'payments' : 'account_balance_wallet'}
            </span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">
            {!isCashierOpen ? 'Abertura de Turno' : activeTab === 'SKIM' ? 'Registrar Sangria' : 'Fechar Turno'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
            {isCashierOpen ? `Operador: ${session?.user?.name || 'N/A'}` : 'Controle Operacional Arena'}
          </p>

          {isCashierOpen && (
            <div className="mt-8 flex bg-slate-200/50 dark:bg-white/5 p-1 rounded-2xl w-full">
              <button
                onClick={() => setActiveTab('CLOSE')}
                className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'CLOSE' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'}`}
              >
                Conferência Final
              </button>
              <button
                onClick={() => setActiveTab('SKIM')}
                className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'SKIM' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'}`}
              >
                Sangria (Retirada)
              </button>
            </div>
          )}
        </div>

        <div className="p-10 pt-4 space-y-6 flex-1 overflow-y-auto custom-scrollbar">

          {/* LÓGICA DE ABERTURA */}
          {!isCashierOpen ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 block">Fundo de Caixa Inicial (Gaveta)</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xl">R$</span>
                  <input
                    type="number"
                    value={initialBalanceInput}
                    onChange={(e) => setInitialBalanceInput(parseFloat(e.target.value) || 0)}
                    onFocus={handleFocus}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-16 pr-6 py-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] outline-none focus:ring-4 focus:ring-primary/10 text-2xl font-black dark:text-white transition-all"
                    autoFocus
                  />
                </div>
              </div>
            </div>
          ) : activeTab === 'SKIM' ? (
            /* LÓGICA DE SANGRIA */
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 block">Valor da Retirada</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xl">R$</span>
                  <input
                    type="number"
                    value={skimmingAmount}
                    onChange={(e) => setSkimmingAmount(parseFloat(e.target.value) || 0)}
                    onFocus={handleFocus}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-16 pr-6 py-6 bg-orange-50/30 dark:bg-slate-900 border-2 border-orange-200 dark:border-orange-900/30 rounded-[28px] outline-none focus:ring-4 focus:ring-orange-500/10 text-2xl font-black dark:text-white transition-all"
                    autoFocus
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 block">Justificativa da Sangria</label>
                <input
                  type="text"
                  value={skimmingReason}
                  onChange={(e) => setSkimmingReason(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ex: Pagamento Motoboy, Depósito..."
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 text-xs font-medium dark:text-white"
                />
              </div>
            </div>
          ) : (
            /* LÓGICA DE FECHAMENTO */
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Abertura + Vendas (Dinheiro)</span>
                  <p className="text-sm font-black dark:text-white">R$ {(initialBalance + cashSales).toFixed(2)}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 text-right">
                  <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest block mb-1">Sangrias (-)</span>
                  <p className="text-sm font-black text-orange-500">R$ {totalSkimmings.toFixed(2)}</p>
                </div>
              </div>

              {/* OUTRAS FORMAS (INFO) */}
              <div className="flex justify-between items-center px-4 py-2 border-y border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-transparent">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">credit_card</span> Cartão: R$ {cardSales.toFixed(2)}</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">pix</span> Pix: R$ {pixSales.toFixed(2)}</span>
              </div>

              <div className="p-5 bg-slate-900 dark:bg-black rounded-3xl border border-white/5 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Apenas Dinheiro Físico Esperado</span>
                <p className="text-lg font-black text-white">R$ {expectedTotal.toFixed(2)}</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 block">Informe o Saldo Físico Final</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xl">R$</span>
                  <input
                    type="number"
                    value={closingBalanceInput}
                    onChange={(e) => setClosingBalanceInput(parseFloat(e.target.value) || 0)}
                    onFocus={handleFocus}
                    onKeyDown={handleKeyDown}
                    className={`w-full pl-16 pr-6 py-6 bg-white dark:bg-slate-900 border-2 rounded-[28px] outline-none text-2xl font-black dark:text-white transition-all ${closingBalanceInput === 0 ? 'border-slate-200 dark:border-slate-800' :
                      difference === 0 ? 'border-primary/40 focus:ring-primary/10' :
                        difference < 0 ? 'border-red-500/40 focus:ring-red-500/10' : 'border-blue-500/40 focus:ring-blue-500/10'
                      }`}
                  />
                </div>
                {closingBalanceInput > 0 && difference !== 0 && (
                  <p className={`text-xs font-black uppercase tracking-widest text-center mt-2 ${difference > 0 ? 'text-blue-500' : 'text-red-500'}`}>
                    {difference > 0 ? `Sobra de R$ ${difference.toFixed(2)}` : `Falta de R$ ${Math.abs(difference).toFixed(2)}`}
                  </p>
                )}
                {closingBalanceInput > 0 && difference === 0 && (
                  <p className="text-xs font-black uppercase tracking-widest text-center mt-2 text-primary">
                    Caixa batendo!
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé de Ações */}
        <div className="p-10 pt-0 flex gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all">Voltar</button>
          <button
            onClick={handleAction}
            disabled={
              (!isCashierOpen && initialBalanceInput <= 0) ||
              (isCashierOpen && activeTab === 'SKIM' && (skimmingAmount <= 0 || !skimmingReason)) ||
              (isCashierOpen && activeTab === 'CLOSE' && closingBalanceInput <= 0)
            }
            className={`flex-[1.5] py-4 text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 ${!isCashierOpen ? 'bg-primary shadow-primary/20 text-slate-900' :
              activeTab === 'SKIM' ? 'bg-orange-500 text-white shadow-orange-500/20' : 'bg-red-500 text-white shadow-red-500/20'
              }`}
          >
            {isProcessing ? (
              <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span className="material-symbols-outlined text-lg">
                {!isCashierOpen ? 'check_circle' : activeTab === 'SKIM' ? 'outbox' : 'lock'}
              </span>
            )}
            {isProcessing ? 'Registrando...' : (!isCashierOpen ? 'Confirmar Abertura' : activeTab === 'SKIM' ? 'Efetivar Sangria' : 'Encerrar Turno')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CashierModal;
