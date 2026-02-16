import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { inventoryService, StockMovement } from '../services/inventoryService';

interface StockHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: string;
  productName?: string;
}

const StockHistoryModal: React.FC<StockHistoryModalProps> = ({ isOpen, onClose, productId, productName }) => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'IN' | 'OUT' | 'ADJ' | 'LOSS'>('ALL');

  useEffect(() => {
    if (isOpen && productId) {
      fetchMovements();
    }
  }, [isOpen, productId, filter]);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getStockMovements({
        productId,
        type: filter === 'ALL' ? undefined : filter,
        limit: 50
      });
      setMovements(data);
    } catch (error) {
      console.error('Error fetching stock movements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'IN': return 'text-green-600 bg-green-50 border-green-100';
      case 'OUT': return 'text-red-600 bg-red-50 border-red-100';
      case 'ADJ': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'LOSS': return 'text-orange-600 bg-orange-50 border-orange-100';
      default: return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'IN': return 'Entrada';
      case 'OUT': return 'Saída';
      case 'ADJ': return 'Ajuste';
      case 'LOSS': return 'Perda';
      default: return type;
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[160] overflow-y-auto bg-slate-900/40 backdrop-blur-sm">
      <div className="fixed inset-0" onClick={onClose}></div>

      <div className="flex min-h-full items-start justify-center p-4 py-12 md:py-24">
        <div className="relative bg-white dark:bg-surface-dark w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden animate-fadeIn flex flex-col border border-white/10">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center shrink-0">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Histórico de Movimentações
              </h2>
              {productName && (
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  Produto: {productName}
                </p>
              )}
            </div>
            <button onClick={onClose} className="size-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 transition-all">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="p-6 shrink-0 border-b border-slate-100 dark:border-slate-800">
            <div className="flex gap-4">
              {['ALL', 'IN', 'OUT', 'ADJ', 'LOSS'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilter(type as any)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${
                    filter === type
                      ? 'bg-slate-900 dark:bg-primary text-white dark:text-slate-900 border-transparent shadow-lg'
                      : 'bg-white dark:bg-surface-dark text-slate-400 border-slate-200 dark:border-slate-800 hover:border-primary/40'
                  }`}
                >
                  {type === 'ALL' ? 'Todos' : getTypeLabel(type)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary">refresh</span>
              </div>
            ) : movements.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 opacity-20">
                <span className="material-symbols-outlined text-6xl">history</span>
                <p className="text-xs font-black uppercase tracking-[0.2em] mt-4 text-center">
                  Nenhuma movimentação encontrada
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                      <th className="px-6 py-4 text-left">Data/Hora</th>
                      <th className="px-6 py-4 text-left">Tipo</th>
                      <th className="px-6 py-4 text-left">Quantidade</th>
                      <th className="px-6 py-4 text-left">Custo Unit.</th>
                      <th className="px-6 py-4 text-left">Motivo</th>
                      <th className="px-6 py-4 text-left">Referência</th>
                      <th className="px-6 py-4 text-left">Usuário</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {movements.map((movement) => (
                      <tr key={movement.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="px-6 py-4 text-sm">
                          {new Date(movement.createdAt).toLocaleString('pt-BR')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getTypeColor(movement.type)}`}>
                            {getTypeLabel(movement.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-black">
                          {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {movement.unitCost ? `R$ ${(Number(movement.unitCost) || 0).toFixed(2)}` : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm max-w-xs truncate" title={movement.reason}>
                          {movement.reason || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm max-w-xs truncate" title={movement.reference}>
                          {movement.reference || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {movement.user?.name || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default StockHistoryModal;