
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MOCK_LOGS } from '../constants';

interface ActivityLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserName?: string;
  initialFilter?: string;
}

const ActivityLogsModal: React.FC<ActivityLogsModalProps> = ({ isOpen, onClose, targetUserName, initialFilter = 'ALL' }) => {
  const [filter, setFilter] = useState(initialFilter);

  useEffect(() => {
    if (isOpen) {
      setFilter(initialFilter);
    }
  }, [isOpen, initialFilter]);

  if (!isOpen) return null;

  const logs = targetUserName
    ? MOCK_LOGS.filter(l => l.userName === targetUserName)
    : MOCK_LOGS;

  const filteredLogs = filter === 'ALL'
    ? logs
    : logs.filter(l => l.module === filter || (filter === 'CRITICAL' && l.critical));

  const getModuleBadgeStyle = (mod: string) => {
    switch (mod) {
      case 'FINANCE': return 'text-blue-600 bg-blue-100/50 dark:bg-blue-900/30';
      case 'POS': return 'text-orange-600 bg-orange-100/50 dark:bg-orange-900/30';
      case 'STAFF': return 'text-purple-600 bg-purple-100/50 dark:bg-purple-900/30';
      case 'COURTS': return 'text-emerald-600 bg-emerald-100/50 dark:bg-emerald-900/30';
      default: return 'text-slate-500 bg-slate-100 dark:bg-slate-900/40';
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[110] flex justify-center items-start p-4 overflow-y-auto pt-8 md:pt-12">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md animate-fadeIn" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-surface-dark w-full max-w-5xl rounded-[32px] shadow-2xl overflow-hidden animate-fadeIn flex flex-col border border-white/20 mb-10 min-h-[500px] max-h-[90vh]">

        {/* Header */}
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30 shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="material-symbols-outlined text-primary-blue text-3xl font-black">history_edu</span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Audit Hub</h2>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              {targetUserName ? `Colaborador: ${targetUserName}` : 'Registros Globais de Atividade'}
            </p>
          </div>
          <button onClick={onClose} className="size-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all shadow-sm">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Filters */}
        <div className="px-8 py-4 bg-white dark:bg-surface-dark border-b border-slate-100 dark:border-slate-800 flex gap-2 overflow-x-auto scrollbar-hide shrink-0">
          {['ALL', 'CRITICAL', 'FINANCE', 'POS', 'STAFF', 'COURTS'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all shrink-0 ${filter === f
                  ? 'bg-slate-900 dark:bg-primary text-white dark:text-slate-900 border-transparent shadow-lg shadow-black/10'
                  : 'bg-slate-50 dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/10 hover:border-primary/40'
                }`}
            >
              {f === 'ALL' ? 'Todos' : f === 'CRITICAL' ? 'Críticos' : f === 'COURTS' ? 'Instalações' : f}
            </button>
          ))}
        </div>

        {/* Logs List */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-slate-50/30 dark:bg-transparent">
          <div className="relative space-y-8">
            <div className="absolute left-[138px] top-4 bottom-4 w-px bg-slate-200 dark:bg-slate-800 hidden md:block"></div>

            {filteredLogs.map((log) => (
              <div key={log.id} className="relative flex flex-col md:flex-row gap-10 group">
                <div className="md:w-28 pt-1 text-right shrink-0">
                  <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter">{log.timestamp}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight mt-1 opacity-70">IP: {log.ip}</p>
                </div>

                <div className={`hidden md:flex absolute left-[133px] top-3 size-2.5 rounded-full border-[3px] border-white dark:border-surface-dark z-10 ${log.critical ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)] animate-pulse' : 'bg-primary'
                  }`}></div>

                <div className={`flex-1 p-6 rounded-[24px] border transition-all ${log.critical
                    ? 'bg-red-50/40 dark:bg-red-900/10 border-red-100/50 dark:border-red-900/30'
                    : 'bg-white dark:bg-white/5 border-slate-100 dark:border-slate-800 shadow-sm'
                  }`}>
                  <div className="flex items-start gap-4">
                    <div className="size-10 rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shrink-0">
                      <img src={log.userAvatar} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase truncate">{log.userName}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${getModuleBadgeStyle(log.module)}`}>
                          {log.module}
                        </span>
                      </div>
                      <h4 className={`text-sm font-black mb-2 ${log.critical ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>{log.action}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{log.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredLogs.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 opacity-20">
                <span className="material-symbols-outlined text-6xl">history_toggle_off</span>
                <p className="text-xs font-black uppercase tracking-widest mt-4">Nenhum registro encontrado</p>
              </div>
            )}
          </div>
        </div>

        <div className="px-8 py-4 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0">
          <span>Padrão de Segurança: E12 Compliant</span>
          <span>Logs em tempo real</span>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ActivityLogsModal;
