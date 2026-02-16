import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Product } from '../types';

interface PurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onConfirm: (orders: { productId: string, qty: number, cost: number }[]) => void;
}

const PurchaseOrderModal: React.FC<PurchaseOrderModalProps> = ({ isOpen, onClose, products, onConfirm }) => {
  const [selectedItems, setSelectedItems] = useState<Record<string, { qty: number, cost: number }>>({});
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const updateQty = (id: string, delta: number, defaultCost: number) => {
    setSelectedItems(prev => {
      const current = prev[id] || { qty: 0, cost: defaultCost };
      const newQty = Math.max(0, current.qty + delta);
      return { ...prev, [id]: { ...current, qty: newQty } };
    });
  };

  const updateCost = (id: string, cost: number) => {
    setSelectedItems(prev => {
      const current = prev[id] || { qty: 0, cost: 0 };
      return { ...prev, [id]: { ...current, cost } };
    });
  };

  const activeOrders = (Object.entries(selectedItems) as [string, { qty: number, cost: number }][])
    .filter(([_, data]) => data.qty > 0)
    .map(([id, data]) => ({ productId: id, qty: data.qty, cost: data.cost }));

  const totalItems = activeOrders.reduce((acc, curr) => acc + curr.qty, 0);

  const handleConfirm = () => {
    onConfirm(activeOrders);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[160] overflow-y-auto bg-slate-900/40 backdrop-blur-sm">
      <div className="fixed inset-0" onClick={onClose}></div>

      <div className="flex min-h-full items-start justify-center p-4 py-12 md:py-24">
        <div className="relative bg-white dark:bg-surface-dark w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-fadeIn flex flex-col border border-white/10">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center shrink-0">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Entrada de Mercadoria</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Abastecimento de Estoque</p>
            </div>
            <button onClick={onClose} className="size-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 transition-all">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="p-6 shrink-0 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input
                type="text"
                placeholder="Buscar item para adicionar à ordem..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 text-sm font-medium dark:text-white"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-4 max-h-[50vh] custom-scrollbar">
            {filteredProducts.map(product => (
              <div key={product.id} className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50 dark:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all">
                <div className="size-12 rounded-xl overflow-hidden bg-white shrink-0">
                  <img src={product.image} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black dark:text-white truncate uppercase tracking-tight">{product.name}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Estoque: {product.stock} un</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase pl-2">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      className="w-16 bg-transparent text-sm font-black dark:text-white outline-none"
                      placeholder="Custo"
                      value={selectedItems[product.id]?.cost ?? product.purchasePrice ?? 0}
                      onChange={(e) => updateCost(product.id, parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button onClick={() => updateQty(product.id, -1, product.purchasePrice || 0)} className="size-8 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors">
                      <span className="material-symbols-outlined text-lg">remove</span>
                    </button>
                    <span className="w-8 text-center text-sm font-black dark:text-white">{selectedItems[product.id]?.qty || 0}</span>
                    <button onClick={() => updateQty(product.id, 1, product.purchasePrice || 0)} className="size-8 flex items-center justify-center text-slate-400 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-lg">add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-8 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex gap-4 shrink-0">
            <div className="flex-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Itens a Incrementar</p>
              <p className="text-xl font-black dark:text-white">{totalItems} unidades</p>
            </div>
            <button
              disabled={totalItems === 0}
              onClick={handleConfirm}
              className="flex-[2] h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-30"
            >
              Confirmar Recebimento
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PurchaseOrderModal;