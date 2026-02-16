
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { User } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: User | null;
  onSend: (data: any) => void;
  type?: 'BIRTHDAY' | 'CHURN' | 'GENERAL';
}

const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose, targetUser, onSend, type = 'GENERAL' }) => {
  if (!isOpen || !targetUser) return null;

  const templates = {
    BIRTHDAY: `Olá ${targetUser.name}! Feliz aniversário! 🎂 Para comemorar, sua primeira cerveja ou açaí na Arena D65 é por nossa conta hoje! Venha celebrar com a gente.`,
    CHURN: `Oi ${targetUser.name}, sentimos sua falta na areia! 🏖️ Que tal voltar a treinar? Use o cupom VOLTAARENA para 20% de desconto no seu próximo aluguel de quadra.`,
    GENERAL: `Olá ${targetUser.name}, temos novidades na Arena D65! Venha conferir nossa nova iluminação e o cardápio atualizado do bar.`
  };

  const [message, setMessage] = useState(templates[type]);
  const [channel, setChannel] = useState<'WHATSAPP' | 'EMAIL' | 'PUSH'>('WHATSAPP');

  return createPortal(
    <div className="fixed inset-0 z-[200] flex justify-center items-start p-4 overflow-y-auto pt-20">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md animate-fadeIn" onClick={onClose}></div>

      <div className="relative bg-white dark:bg-surface-dark w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-fadeIn flex flex-col border border-white/20 mb-10">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Notificar Atleta</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{targetUser.name}</p>
          </div>
          <button onClick={onClose} className="size-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 transition-all">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Canal de Envio</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'WHATSAPP', icon: 'chat', label: 'WhatsApp' },
                { id: 'EMAIL', icon: 'mail', label: 'E-mail' },
                { id: 'PUSH', icon: 'notifications_active', label: 'App Push' }
              ].map(ch => (
                <button
                  key={ch.id}
                  onClick={() => setChannel(ch.id as any)}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-1 ${channel === ch.id
                    ? 'border-primary bg-primary/5 text-primary-dark'
                    : 'border-slate-100 dark:border-slate-800 text-slate-400'
                    }`}
                >
                  <span className="material-symbols-outlined">{ch.icon}</span>
                  <span className="text-[8px] font-black uppercase tracking-widest">{ch.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mensagem Personalizada</label>
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl outline-none focus:ring-4 focus:ring-primary/10 text-sm font-medium dark:text-white resize-none"
            />
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">auto_fix_high</span>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Utilize variáveis como {'{nome}'} para automações futuras.</p>
          </div>
        </div>

        <div className="p-8 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex gap-4">
          <button onClick={onClose} className="flex-1 h-14 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-black text-[11px] uppercase tracking-widest rounded-2xl text-slate-500">Voltar</button>
          <button
            onClick={() => { onSend({ channel, message }); onClose(); }}
            className="flex-[2] h-14 bg-primary text-slate-900 font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95"
          >
            Enviar Agora
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default NotificationModal;
