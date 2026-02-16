
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Court, MaintenanceTask } from '../types';

interface ManageOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  court: Court;
  onUpdate: (courtId: string, taskData: Partial<MaintenanceTask>, finish?: boolean) => void;
  activeTasks?: any[]; // Changed from activeTask to activeTasks
}

const ManageOSModal: React.FC<ManageOSModalProps> = ({ isOpen, onClose, court, onUpdate, activeTasks = [] }) => {
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'completed'>('in_progress');
  const [cost, setCost] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when modal opens or task changes
  useEffect(() => {
    if (isOpen) {
      setSelectedTask(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedTask) {
      setStatus(selectedTask.status === 'PENDING' ? 'pending' : 'in_progress');
    }
  }, [selectedTask]);

  if (!isOpen) return null;

  const handleAction = (finish: boolean = false) => {
    if (!selectedTask) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onUpdate(court.id, {
        ...selectedTask,
        status: finish ? 'completed' : status,
        estimatedCost: cost
      }, finish); // Pass finish flag to update court status if needed

      // If finishing, we might want to close or just go back to list
      // For now, let's close if it was the only one, or go back to list
      setIsSubmitting(false);
      if (activeTasks.length <= 1) {
        onClose();
      } else {
        setSelectedTask(null); // Go back to list
      }
    }, 600);
  };

  // Render List View
  if (!selectedTask) {
    return createPortal(
      <div className="fixed inset-0 z-[160] flex justify-center items-start p-4 overflow-y-auto pt-10 md:pt-24">
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md animate-fadeIn" onClick={onClose}></div>

        <div className="relative bg-white dark:bg-surface-dark w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-fadeIn flex flex-col border border-white/10 mb-10">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center">
                <span className="material-symbols-outlined font-black">list_alt</span>
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Ordens Abertas</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{court.name} • {activeTasks.length} Solicitações</p>
              </div>
            </div>
            <button onClick={onClose} className="size-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="p-8 space-y-4 overflow-y-auto max-h-[60vh] custom-scrollbar">
            {activeTasks.length === 0 ? (
              <div className="text-center py-10 text-slate-400">Nenhuma ordem de serviço encontrada.</div>
            ) : (
              activeTasks.map((task: any) => (
                <div key={task.id} onClick={() => setSelectedTask(task)} className="group p-5 bg-slate-50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 hover:border-primary/50 rounded-3xl cursor-pointer transition-all flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`size-10 rounded-xl flex items-center justify-center ${task.priority === 'HIGH' ? 'bg-red-50 text-red-500' :
                        task.priority === 'MEDIUM' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'
                      }`}>
                      <span className="material-symbols-outlined">engineering</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{task.title}</p>
                      <p className="text-xs text-slate-400">{new Date(task.date).toLocaleDateString('pt-BR')} • {task.priority}</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-300 group-hover:text-primary">chevron_right</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // Render Detail/Edit View
  const taskDisplay = {
    id: `OS-${selectedTask.id ? selectedTask.id.substring(0, 4) : 'NEW'}`,
    reportedBy: 'Staff',
    createdAt: new Date(selectedTask.date).toLocaleString('pt-BR'),
    description: selectedTask.title
  };

  return createPortal(
    <div className="fixed inset-0 z-[160] flex justify-center items-start p-4 overflow-y-auto pt-10 md:pt-24">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md animate-fadeIn" onClick={onClose}></div>

      <div className="relative bg-white dark:bg-surface-dark w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-fadeIn flex flex-col border border-white/10 mb-10">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSelectedTask(null)} className="size-10 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{taskDisplay.id}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{court.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="size-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto max-h-[60vh] custom-scrollbar">
          {/* Header Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Abertura por</span>
              <p className="text-xs font-black dark:text-white">{taskDisplay.reportedBy}</p>
            </div>
            <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 text-right">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Data/Hora</span>
              <p className="text-xs font-black dark:text-white">{taskDisplay.createdAt}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Descrição da Ocorrência</label>
            <div className="p-6 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 italic">"{taskDisplay.description}"</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Status da Manutenção</label>
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              {[
                { id: 'pending', label: 'Pendente', icon: 'pause_circle' },
                { id: 'in_progress', label: 'Em Curso', icon: 'sync' },
                { id: 'completed', label: 'Finalizado', icon: 'check_circle' }
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setStatus(s.id as any)}
                  className={`flex flex-col items-center justify-center py-4 rounded-xl transition-all gap-1 ${status === s.id
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md ring-1 ring-slate-200 dark:ring-slate-700'
                    : 'text-slate-400 opacity-60'
                    }`}
                >
                  <span className={`material-symbols-outlined text-lg ${status === s.id ? 'text-primary' : ''}`}>{s.icon}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Custo de Peças/Mão de Obra</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">R$</span>
                <input
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 text-sm font-black dark:text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Notas Técnicas</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Obs. adicionais..."
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 text-sm font-medium dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex gap-4 shrink-0">
          <button
            onClick={() => handleAction(false)}
            className="flex-1 h-14 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest rounded-2xl text-slate-500 transition-all hover:bg-slate-50"
          >
            Apenas Salvar
          </button>
          <button
            onClick={() => handleAction(true)}
            className="flex-[2] h-14 bg-primary text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="size-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span className="material-symbols-outlined text-lg">verified</span>
            )}
            Concluir e Liberar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ManageOSModal;
