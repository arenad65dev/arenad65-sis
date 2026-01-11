
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User } from '../types';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (userData: any) => void;
  initialData?: User | null;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'Bar / PDV',
    role: 'Staff Operacional'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        department: initialData.department,
        role: initialData.role
      });
    } else {
      setFormData({
        name: '',
        email: '',
        department: 'Bar / PDV',
        role: 'Staff Operacional'
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (onSave) onSave(formData);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-center items-start p-4 overflow-y-auto pt-10 md:pt-20">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-fadeIn" onClick={onClose}></div>

      <div className="relative bg-white dark:bg-surface-dark w-full max-w-4xl rounded-[32px] shadow-2xl overflow-hidden animate-fadeIn flex flex-col md:flex-row border border-white/20 mb-10">
        <div className="flex-1 p-10 flex flex-col gap-8 border-r border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center">
            <div className={`size-14 rounded-2xl ${initialData ? 'bg-blue-500/10 text-blue-600' : 'bg-primary/10 text-primary-dark'} flex items-center justify-center shrink-0`}>
              <span className="material-symbols-outlined text-3xl font-black">{initialData ? 'edit_note' : 'person_add'}</span>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{initialData ? 'Editar Staff' : 'Novo Staff'}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{initialData ? `ID #${initialData.id}` : 'Acesso Interno'}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Nome Completo</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Roberto Gomes"
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">E-mail Corporativo</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="staff@arena.com"
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Departamento</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all dark:text-white appearance-none"
                >
                  <option>Bar / PDV</option>
                  <option>Financeiro</option>
                  <option>Administrativo</option>
                  <option>Operacional</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Cargo</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all dark:text-white appearance-none"
                >
                  <option>Staff Operacional</option>
                  <option>Supervisor</option>
                  <option>Gerente</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex gap-4">
            <button onClick={handleSubmit} className={`flex-1 py-4 font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl transition-all ${initialData ? 'bg-blue-600 text-white' : 'bg-primary text-slate-900'}`}>{initialData ? 'Atualizar' : 'Cadastrar'}</button>
            <button onClick={onClose} className="px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-black text-[10px] uppercase tracking-widest rounded-2xl text-slate-500">Cancelar</button>
          </div>
        </div>

        <div className="w-full md:w-[340px] bg-slate-50/80 dark:bg-slate-900/40 p-10 flex flex-col gap-6">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Atalhos</h3>
          <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
            {['Vendas PDV', 'Agenda', 'Relatórios', 'Estoque', 'Financeiro'].map(item => (
              <label key={item} className="flex items-center gap-4 p-4 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-primary/40 transition-all shadow-sm">
                <input type="checkbox" className="size-5 rounded-lg border-slate-300 text-primary focus:ring-primary/20 cursor-pointer" />
                <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">{item}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AddEmployeeModal;
