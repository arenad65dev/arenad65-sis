
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { User } from '../types';

interface AddAthleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (athleteData: Partial<User>) => void;
}

const AddAthleteModal: React.FC<AddAthleteModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthday: '',
    level: 'Bronze' as User['level']
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      role: 'Atleta',
      department: 'Externo',
      status: 'active',
      points: 0,
      totalSpent: 0,
      lastActivityDays: 0,
      avatar: `https://i.pravatar.cc/150?u=${Math.random()}`
    });
    setFormData({ name: '', email: '', phone: '', birthday: '', level: 'Bronze' });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fadeIn" onClick={onClose}></div>
      
      <form 
        onSubmit={handleSubmit}
        className="relative bg-white dark:bg-surface-dark w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-fadeIn border border-white/20 flex flex-col"
      >
        <div className="p-8 md:p-10 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl font-black">person_add</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Novo Atleta</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cadastro de Fidelidade</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="size-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-8 md:p-10 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Nome Completo</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Ex: Maria Oliveira"
              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 text-sm font-medium dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">E-mail</label>
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="atleta@email.com"
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 text-sm font-medium dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Telefone</label>
              <input 
                type="text" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="(00) 00000-0000"
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 text-sm font-medium dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Aniversário (MM-DD)</label>
              <input 
                type="text" 
                placeholder="Ex: 05-15"
                value={formData.birthday}
                onChange={(e) => setFormData({...formData, birthday: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 text-sm font-black dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Nível Inicial</label>
              <select 
                value={formData.level}
                onChange={(e) => setFormData({...formData, level: e.target.value as any})}
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 text-sm font-black dark:text-white appearance-none"
              >
                <option>Bronze</option>
                <option>Prata</option>
                <option>Ouro</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-10 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex gap-4">
          <button type="button" onClick={onClose} className="flex-1 py-4 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600">Cancelar</button>
          <button type="submit" className="flex-[2] py-4 bg-primary text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
            Cadastrar Atleta
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
};

export default AddAthleteModal;
