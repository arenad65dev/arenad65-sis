
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Court, CostItem } from '../types';

interface FacilityEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Court | null;
  onSave?: (data: any) => void;
}

const FacilityEditModal: React.FC<FacilityEditModalProps> = ({ isOpen, onClose, initialData, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Beach Tennis' as Court['type'],
    monthlyFixedCost: 0,
    image: '',
    equipment: [] as string[],
    costBreakdown: [] as CostItem[]
  });

  const [newEq, setNewEq] = useState('');
  const [newCostName, setNewCostName] = useState('');
  const [newCostValue, setNewCostValue] = useState<number | string>('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        type: initialData.type,
        monthlyFixedCost: initialData.monthlyFixedCost,
        image: initialData.image,
        equipment: initialData.equipment.map(e => e.name),
        costBreakdown: initialData.costBreakdown || []
      });
    } else {
      setFormData({
        name: '',
        type: 'Beach Tennis',
        monthlyFixedCost: 0,
        image: '',
        equipment: [],
        costBreakdown: []
      });
    }
  }, [initialData, isOpen]);

  const calculatedTotal = useMemo(() => {
    return formData.costBreakdown.reduce((acc, item) => acc + item.value, 0);
  }, [formData.costBreakdown]);

  useEffect(() => {
    if (formData.costBreakdown.length > 0) {
      setFormData(prev => ({ ...prev, monthlyFixedCost: calculatedTotal }));
    }
  }, [calculatedTotal]);

  if (!isOpen) return null;

  const addEquipment = () => {
    if (newEq && !formData.equipment.includes(newEq)) {
      setFormData({ ...formData, equipment: [...formData.equipment, newEq] });
      setNewEq('');
    }
  };

  const removeEquipment = (name: string) => {
    setFormData({ ...formData, equipment: formData.equipment.filter(e => e !== name) });
  };

  const addCostItem = () => {
    const value = typeof newCostValue === 'string' ? parseFloat(newCostValue) : newCostValue;
    if (newCostName && !isNaN(value)) {
      setFormData({
        ...formData,
        costBreakdown: [...formData.costBreakdown, { name: newCostName, value }]
      });
      setNewCostName('');
      setNewCostValue('');
    }
  };

  const removeCostItem = (index: number) => {
    setFormData({
      ...formData,
      costBreakdown: formData.costBreakdown.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = () => {
    if (onSave) onSave(formData);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[150] flex items-start md:items-center justify-center p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-sm custom-scrollbar">
      <div className="fixed inset-0" onClick={onClose}></div>

      <div className="relative bg-white dark:bg-surface-dark w-full max-w-6xl rounded-[40px] shadow-2xl overflow-hidden animate-fadeIn flex flex-col md:flex-row border border-white/20 my-auto">

        {/* Left Column */}
        <div className="flex-1 p-8 md:p-10 space-y-8 border-r border-slate-100 dark:border-slate-800 flex flex-col overflow-y-auto max-h-[500px] md:max-h-[85vh] custom-scrollbar">
          <div className="flex justify-between items-center shrink-0">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
              {initialData ? 'Configurar Ativo' : 'Novo Ativo'}
            </h2>
            <button type="button" onClick={onClose} className="md:hidden size-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="space-y-6 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Nome</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-sm font-medium dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Tipo</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-sm font-medium dark:text-white appearance-none"
                >
                  <option>Beach Tennis</option>
                  <option>Vôlei</option>
                  <option>Futebol Society</option>
                  <option>Tênis</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[32px] p-6 md:p-8 border border-slate-100 dark:border-slate-800 space-y-6">
              <div className="flex justify-between items-end">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none">Composição do Custo</h3>
                <div className="text-right">
                  <span className="text-[9px] font-black text-primary uppercase tracking-widest block mb-1">Total</span>
                  <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">R$ {formData.monthlyFixedCost.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex gap-3 items-end">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    placeholder="Descrição"
                    value={newCostName}
                    onChange={(e) => setNewCostName(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-bold uppercase outline-none dark:text-white"
                  />
                </div>
                <div className="w-24 space-y-2">
                  <input
                    type="number"
                    placeholder="Valor"
                    value={newCostValue}
                    onChange={(e) => setNewCostValue(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-bold uppercase outline-none dark:text-white"
                  />
                </div>
                <button onClick={addCostItem} className="h-[44px] px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[9px] uppercase tracking-widest">Add</button>
              </div>

              <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar">
                {formData.costBreakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] font-black text-slate-700 dark:text-white uppercase">{item.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black">R$ {item.value.toFixed(2)}</span>
                      <button onClick={() => removeCostItem(idx)} className="text-slate-300 hover:text-red-500"><span className="material-symbols-outlined text-[18px]">close</span></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Foto (URL)</label>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-sm font-medium dark:text-white"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-4 shrink-0">
            <button onClick={onClose} className="flex-1 py-4 font-black text-[10px] uppercase text-slate-400">Cancelar</button>
            <button onClick={handleSubmit} className="flex-[2] py-4 bg-primary text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 transition-all">
              {initialData ? 'Salvar Alterações' : 'Cadastrar Ativo'}
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-full md:w-[380px] bg-slate-50/80 dark:bg-slate-900/40 p-8 md:p-10 flex flex-col gap-6 overflow-y-auto max-h-[500px] md:max-h-[85vh] custom-scrollbar">
          <div className="hidden md:flex justify-end">
            <button type="button" onClick={onClose} className="size-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 text-slate-400">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">Equipamentos</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Vincule bens a este ativo</p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newEq}
                onChange={(e) => setNewEq(e.target.value)}
                placeholder="Nome..."
                className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase outline-none dark:text-white"
              />
              <button onClick={addEquipment} className="size-11 bg-primary text-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-primary/10">
                <span className="material-symbols-outlined font-black">add</span>
              </button>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
              {formData.equipment.map(eq => (
                <div key={eq} className="flex items-center justify-between p-4 bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 rounded-2xl">
                  <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase truncate pr-2">{eq}</span>
                  <button onClick={() => removeEquipment(eq)} className="text-slate-300 hover:text-red-500"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default FacilityEditModal;
