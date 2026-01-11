
import React from 'react';
import { AppNotification, Module } from '../types';

interface NotificationPanelProps {
  notifications: AppNotification[];
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
  onNavigate: (module: Module) => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ 
  notifications, 
  onClose, 
  onMarkRead, 
  onClearAll,
  onNavigate 
}) => {
  const getIcon = (type: AppNotification['type']) => {
    switch(type) {
      case 'inventory': return 'inventory_2';
      case 'maintenance': return 'engineering';
      case 'crm': return 'cake';
      case 'finance': return 'payments';
      default: return 'notifications';
    }
  };

  const getPriorityColor = (priority: AppNotification['priority']) => {
    switch(priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="absolute top-14 right-0 w-80 md:w-96 bg-white dark:bg-surface-dark rounded-[32px] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden animate-fadeIn z-[100] flex flex-col max-h-[500px]">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center shrink-0">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Alertas Operacionais</h3>
        <button 
          onClick={onClearAll}
          className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline"
        >
          Limpar Tudo
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-12 text-center opacity-30">
            <span className="material-symbols-outlined text-5xl mb-2">notifications_off</span>
            <p className="text-[10px] font-black uppercase tracking-widest">Tudo em dia!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.map((notif) => (
              <div 
                key={notif.id}
                onClick={() => {
                  onMarkRead(notif.id);
                  if (notif.targetModule) onNavigate(notif.targetModule);
                }}
                className={`p-5 flex gap-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer relative ${!notif.read ? 'bg-primary/5' : ''}`}
              >
                {!notif.read && (
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full"></div>
                )}
                
                <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                  notif.priority === 'high' ? 'bg-red-50 text-red-500 dark:bg-red-900/20' : 
                  'bg-slate-100 text-slate-500 dark:bg-white/5'
                }`}>
                  <span className="material-symbols-outlined text-xl">{getIcon(notif.type)}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase leading-tight truncate">{notif.title}</h4>
                    <span className="text-[8px] text-slate-400 font-bold whitespace-nowrap">{notif.timestamp}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium line-clamp-2">
                    {notif.description}
                  </p>
                  
                  <div className="mt-3 flex items-center gap-2">
                    <div className={`size-1.5 rounded-full ${getPriorityColor(notif.priority)}`}></div>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{notif.priority} priority</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-4 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800 text-center shrink-0">
           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Fim das notificações recentes</p>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
