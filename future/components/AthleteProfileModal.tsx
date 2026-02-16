
import React from 'react';
import { createPortal } from 'react-dom';
import { User } from '../types';

interface AthleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  athlete: User;
}

const AthleteProfileModal: React.FC<AthleteProfileModalProps> = ({ isOpen, onClose, athlete }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fadeIn" onClick={onClose}></div>
      
      <div className="relative bg-white dark:bg-surface-dark w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-fadeIn flex flex-col border border-white/20 max-h-[90vh]">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined font-black">badge</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Ficha do Atleta</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detalhes do Membro #{athlete.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="size-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 p-8 pb-0 space-y-8 flex flex-col overflow-hidden">
          {/* Top Info */}
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
            <div className="size-32 rounded-[32px] overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl ring-2 ring-primary shrink-0">
              <img src={athlete.avatar} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-1">{athlete.name}</h3>
                <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                  athlete.level === 'Ouro' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : 'bg-slate-50 text-slate-600 border-slate-100'
                }`}>
                  Nível {athlete.level}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">E-mail</p>
                  <p className="text-xs font-bold dark:text-white">{athlete.email}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Telefone</p>
                  <p className="text-xs font-bold dark:text-white">{athlete.phone || '(11) 99999-9999'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Aniversário</p>
                  <p className="text-xs font-bold dark:text-white">{athlete.birthday || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Cadastro</p>
                  <p className="text-xs font-bold dark:text-white">15 Mar 2024</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-6 rounded-[32px] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Saldo Atual</span>
              <p className="text-2xl font-black dark:text-white">{athlete.points} pts</p>
            </div>
            <div className="p-6 rounded-[32px] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Total Gasto</span>
              <p className="text-2xl font-black text-primary-blue">R$ {athlete.totalSpent?.toLocaleString()}</p>
            </div>
            <div className="p-6 rounded-[32px] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Último Check-in</span>
              <p className="text-2xl font-black text-primary">{athlete.lastActivityDays === 0 ? 'Hoje' : `${athlete.lastActivityDays}d atrás`}</p>
            </div>
          </div>

          {/* History */}
          <div className="space-y-4 flex-1 flex flex-col min-h-0 pb-8">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 shrink-0">Histórico de Transações</h4>
            <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-2">
              {[
                { label: 'Consumo Bar #A992', val: 'R$ 45,00', pts: '+45 pts', date: 'Hoje, 10:15' },
                { label: 'Reserva Quadra 1', val: 'R$ 120,00', pts: '+120 pts', date: 'Ontem, 19:00' },
                { label: 'Resgate: Cerveja Gelada', val: 'GRÁTIS', pts: '-200 pts', date: '12 Out, 15:30', redemption: true },
                { label: 'Consumo Bar #A993', val: 'R$ 22,00', pts: '+22 pts', date: '10 Out, 11:15' },
                { label: 'Consumo Bar #A994', val: 'R$ 35,00', pts: '+35 pts', date: '08 Out, 14:20' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className={`size-8 rounded-lg flex items-center justify-center ${item.redemption ? 'bg-orange-500/10 text-orange-500' : 'bg-primary/10 text-primary-dark'}`}>
                      <span className="material-symbols-outlined text-lg">{item.redemption ? 'redeem' : 'payments'}</span>
                    </div>
                    <div>
                      <p className="text-xs font-black dark:text-white uppercase tracking-tight">{item.label}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">{item.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black dark:text-white">{item.val}</p>
                    <p className={`text-[10px] font-black ${item.redemption ? 'text-red-500' : 'text-primary'}`}>{item.pts}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex gap-4 shrink-0">
          <button onClick={onClose} className="flex-1 h-14 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase rounded-2xl text-slate-500">Fechar Ficha</button>
          <button className="flex-[2] h-14 bg-primary text-slate-900 text-[10px] font-black uppercase rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-lg">edit</span>
            Editar Cadastro
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AthleteProfileModal;
