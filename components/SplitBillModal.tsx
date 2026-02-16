import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';

interface SplitBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableData: { id: string, items: { product: any, qty: number }[] };
  onConfirm: (selectedItems: { product: any, qty: number }[]) => void;
}

const SplitBillModal: React.FC<SplitBillModalProps> = ({ isOpen, onClose, tableData, onConfirm }) => {
  const [selections, setSelections] = useState<Record<string, number>>({});

  const handleUpdateSelection = (productId: string, delta: number, maxQty: number) => {
    setSelections(prev => {
      const current = prev[productId] || 0;
      const next = Math.max(0, Math.min(maxQty, current + delta));
      return { ...prev, [productId]: next };
    });
  };

  const selectedList = useMemo(() => {
    return (Object.entries(selections) as [string, number][])
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => {
        const item = tableData.items.find(ti => ti.product.id === id);
        return { product: item?.product, qty };
      });
  }, [selections, tableData]);

  const selectedTotal = useMemo(() => {
    return selectedList.reduce((acc, item) => acc + (Number(item.product.price) * item.qty), 0);
  }, [selectedList]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[160] flex justify-center items-start p-4 overflow-y-auto pt-10 md:pt-24">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md animate-fadeIn" onClick={onClose}></div>

      <div className="relative bg-white dark:bg-surface-dark w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-fadeIn flex flex-col font-display border border-white/10 mb-10">
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-1">Dividir Conta</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mesa {tableData.id}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Selecionado</p>
            <p className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-none">R$ {(Number(selectedTotal) || 0).toFixed(2)}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4 max-h-[50vh] custom-scrollbar">
          {tableData.items.map((item) => {
            const currentSelected = selections[item.product.id] || 0;
            return (
              <div key={item.product.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${currentSelected > 0 ? 'bg-primary/5 border-primary/30' : 'bg-slate-50 dark:bg-slate-900/50 border-transparent'}`}>
                <div className="size-12 rounded-xl bg-white dark:bg-slate-800 overflow-hidden shrink-0">
                  <img src={item.product.image} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black dark:text-white truncate uppercase tracking-tight leading-none mb-1">{item.product.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.qty} un disponíveis</p>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button onClick={() => handleUpdateSelection(item.product.id, -1, item.qty)} className="size-7 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-lg">remove</span></button>
                  <span className="w-6 text-center text-sm font-black dark:text-white">{currentSelected}</span>
                  <button onClick={() => handleUpdateSelection(item.product.id, 1, item.qty)} className="size-7 flex items-center justify-center text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined text-lg">add</span></button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-6 md:p-8 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800 flex gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 h-14 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-black text-[11px] uppercase tracking-widest rounded-2xl text-slate-500">Cancelar</button>
          <button disabled={selectedTotal <= 0} onClick={() => onConfirm(selectedList)} className="flex-[1.5] h-14 bg-primary text-slate-900 font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95">Pagar R$ {(Number(selectedTotal) || 0).toFixed(2)}</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SplitBillModal;