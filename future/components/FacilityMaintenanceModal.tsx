
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Court, MaintenanceTask } from '../types';

interface FacilityMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  court: Court;
  onReport?: (task: Partial<MaintenanceTask>) => void;
}

const FacilityMaintenanceModal: React.FC<FacilityMaintenanceModalProps> = ({ isOpen, onClose, court, onReport }) => {
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleItem = (itemName: string) => {
    setSelectedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(i => i !== itemName) 
        : [...prev, itemName]
    );
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      if (onReport) {
        onReport({ 
          description, 
          priority, 
          installationId: court.id,
          affectedItems: selectedItems
        });
      }
      setIsSubmitting(false);
      onClose();
    }, 800);
  };

  return createPortal(
    <div className="fixed inset-0 z-[999] flex justify-center items-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md animate-fadeIn" onClick={onClose}></div>
      
      <div className="relative bg-white dark:bg-surface-dark w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-fadeIn flex flex-col border border-white/10 max-h-[90vh]">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className={`size-12 rounded-2xl flex items-center justify-center ${court.status === 'excellent' ? 'bg-primary/10 text-primary' : 'bg-orange-500/10 text-orange-500'}`}>
              <span className="material-symbols-outlined font-black">report_problem</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Relatar Problema</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{court.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="size-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 block">Selecione os Itens com Defeito</label>
            <div className="flex flex-wrap gap-2">
              {court.equipment.map((item) => (
                <button
                  key={item.name}
                  onClick={() => toggleItem(item.name)}
                  className={`px-4 py-2.5 rounded-2xl border text-[10px] font-black uppercase tracking-tight transition-all flex items-center gap-2 ${
                    selectedItems.includes(item.name)
                      ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20'
                      : 'bg-slate-50 dark:bg-slate-900/50 text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {selectedItems.includes(item.name) ? 'check_box' : 'check_box_outline_blank'}
                  </span>
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Informação Avulsa / Observações</label>
              <textarea 
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Detalhes adicionais..."
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 text-sm font-medium transition-all dark:text-white resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Prioridade de Reparo</label>
              <div className="grid grid-cols-3 gap-3">
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`h-14 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${
                      priority === p 
                      ? p === 'high' ? 'border-red-500 bg-red-500/10 text-red-500 shadow-lg' :
                        p === 'medium' ? 'border-orange-500 bg-orange-500/10 text-orange-500 shadow-lg' :
                        'border-primary bg-primary/10 text-primary shadow-lg'
                      : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    {p === 'low' ? 'Baixa' : p === 'medium' ? 'Média' : 'Alta'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex gap-4 shrink-0">
          <button onClick={onClose} className="flex-1 h-14 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase rounded-2xl text-slate-500 transition-all">Cancelar</button>
          <button 
            disabled={(selectedItems.length === 0 && !description) || isSubmitting}
            onClick={handleSubmit}
            className="flex-[2] h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <span className="material-symbols-outlined text-lg">construction</span>}
            {isSubmitting ? 'Gerando OS...' : 'Gerar Ordem de Serviço'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default FacilityMaintenanceModal;
