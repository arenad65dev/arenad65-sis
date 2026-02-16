
import React, { useState } from 'react';
import { MOCK_COURTS } from '../constants';
import { Court } from '../types';
import FacilityMaintenanceModal from '../components/FacilityMaintenanceModal';
import FacilityEditModal from '../components/FacilityEditModal';
import ActivityLogsModal from '../components/ActivityLogsModal';
import ManageOSModal from '../components/ManageOSModal';


import { useMaintenance } from '../hooks/useMaintenance';

const CourtManagementView: React.FC = () => {
  const [courts, setCourts] = useState<Court[]>(MOCK_COURTS);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);

  // Hooks
  const { tasks, createTask, updateTask } = useMaintenance();

  // ... (existing code)

  const handleOSUpdate = async (courtId: string, taskData: any, finish?: boolean) => {
    // 1. Persist to Backend
    if (taskData.id) {
      try {
        await updateTask({
          id: taskData.id,
          data: {
            status: finish ? 'COMPLETED' : (taskData.status === 'in_progress' ? 'IN_PROGRESS' : 'PENDING'),
            priority: taskData.priority, // Preserve priority if passed or unchanged
            // Add other fields if necessary
          }
        });
        // Improve feedback? Maybe a toast later.
      } catch (error) {
        console.error("Failed to update task:", error);
        alert("Erro ao salvar atualização. Tente novamente.");
        return; // Don't match local state if failed
      }
    }

    // 2. Update Local Court State
    // Calculate if there are *other* pending tasks for this court
    const otherPendingTasks = tasks.filter((t: any) =>
      t.title.startsWith(selectedCourt?.name || '') &&
      t.id !== taskData.id &&
      t.status !== 'COMPLETED'
    );

    const hasRemainingIssues = otherPendingTasks.length > 0 && finish; // If finishing this one, do we have others?
    // If NOT finishing (just updating), then we definitely still have issues (this one).

    setCourts(prev => prev.map(c => {
      if (c.id === courtId) {
        if (finish && !hasRemainingIssues) {
          // All tasks cleared!
          return {
            ...c,
            status: 'excellent',
            healthScore: 100,
            lastMaintenance: new Date().toLocaleDateString('pt-BR'),
            nextMaintenance: 'A definir'
          };
        }
        // Still has issues (either this one is still open, or others are)
        return {
          ...c,
          status: 'maintenance' // Or 'attention', simple logic for now
        };
      }
      return c;
    }));
  };

  return (
    <div className="flex flex-col gap-8 animate-fadeIn pb-12">
      {/* Header Contextual */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Saúde das Instalações</h1>
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-primary-blue text-[8px] font-black uppercase rounded border border-blue-200 dark:border-blue-900/40 tracking-widest">Painel do Ativo</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Gestão técnica de infraestrutura e manutenção preventiva.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsLogsOpen(true)}
            className="h-11 px-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">history</span>
            Logs de Zeladoria
          </button>
          <button
            onClick={handleAddNew}
            className="h-11 px-6 bg-primary hover:bg-primary-dark text-slate-900 font-black rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">add_business</span>
            Cadastrar Ativo
          </button>
        </div>
      </div>

      {/* Lista de Manutenções Pendentes (REAL) */}
      {tasks.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Manutenções Agendadas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task: any) => (
              <div key={task.id} className="p-4 bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm flex items-center gap-4">
                <div className={`size-10 rounded-xl flex items-center justify-center ${task.priority === 'HIGH' ? 'bg-red-50 text-red-500' :
                  task.priority === 'MEDIUM' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'
                  }`}>
                  <span className="material-symbols-outlined">engineering</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">{task.title}</p>
                  <p className="text-xs text-slate-400">{new Date(task.date).toLocaleDateString('pt-BR')}</p>
                </div>
                <span className={`text-[10px] font-black px-2 py-1 rounded uppercase ${task.priority === 'HIGH' ? 'bg-red-100 text-red-600' :
                  task.priority === 'MEDIUM' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                  }`}>{task.priority}</span>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* KPIs de Infraestrutura */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total de Quadras', value: courts.length.toString(), icon: 'stadium', desc: 'Ativos Cadastrados' },
          { label: 'Em Manutenção', value: tasks.length.toString(), icon: 'build', color: 'orange', desc: 'Tarefas Pendentes' },
          { label: 'Custo Fixo Total', value: `R$ ${courts.reduce((acc, c) => acc + c.monthlyFixedCost, 0).toLocaleString()}`, icon: 'payments', desc: 'Soma dos Ativos' },
          { label: 'Saúde Média', value: `${Math.round(courts.reduce((acc, c) => acc + c.healthScore, 0) / (courts.length || 1))}%`, icon: 'vital_signs', color: 'primary', desc: 'Integridade Geral' },
        ].map((kpi, idx) => (
          <div key={idx} className="p-6 bg-white dark:bg-surface-dark rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-primary/30 transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</span>
              <div className={`p-2 rounded-xl bg-slate-50 dark:bg-white/5 ${kpi.color === 'orange' ? 'text-orange-500' : kpi.color === 'primary' ? 'text-primary' : 'text-slate-400'}`}>
                <span className="material-symbols-outlined text-[20px]">{kpi.icon}</span>
              </div>
            </div>
            <div>
              <p className="text-3xl font-black tracking-tight dark:text-white leading-none mb-1">{kpi.value}</p>
              <p className="text-sm font-bold text-slate-400 truncate">{kpi.desc}</p>
            </div>
          </div>
        ))}
      </div>


      {/* Grid de Ativos (Quadras) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {courts.map(court => (
          <div key={court.id} className="bg-white dark:bg-surface-dark rounded-[40px] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col group hover:shadow-xl transition-all h-full relative">
            {/* Imagem com Status Overlay */}
            <div className="relative h-48 w-full">
              <img src={court.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>

              <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-xl backdrop-blur-md border flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${court.status === 'excellent' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                court.status === 'attention' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                  'bg-red-500/20 text-red-400 border-red-500/30'
                }`}>
                <span className={`size-1.5 rounded-full animate-pulse ${court.status === 'excellent' ? 'bg-green-500' :
                  court.status === 'attention' ? 'bg-orange-500' :
                    'bg-red-500'
                  }`}></span>
                {court.status === 'excellent' ? 'Excelente' : court.status === 'attention' ? 'Atenção' : 'Manutenção'}
              </div>

              <div className="absolute bottom-4 left-6">
                <h3 className="text-xl font-black text-white tracking-tight">{court.name}</h3>
                <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">{court.type}</p>
              </div>

              <button
                onClick={() => handleEditCourt(court)}
                className="absolute top-4 left-4 size-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-slate-900"
              >
                <span className="material-symbols-outlined text-lg">edit</span>
              </button>
            </div>

            <div className="p-8 flex flex-col flex-1 gap-6">
              {/* Health Score e ROI */}
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Saúde Física</span>
                    <span className={`text-[12px] font-black ${court.healthScore > 80 ? 'text-primary' : court.healthScore > 50 ? 'text-orange-500' : 'text-red-500'}`}>{court.healthScore}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${court.healthScore > 80 ? 'bg-primary' : court.healthScore > 50 ? 'bg-orange-500' : 'bg-red-500'}`}
                      style={{ width: `${court.healthScore}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-right shrink-0 border-l border-slate-100 dark:border-slate-800 pl-4">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Custo Fixo</span>
                  <p className="text-sm font-black dark:text-white">R$ {(Number(court.monthlyFixedCost) || 0).toFixed(0)}<span className="text-[10px] font-normal text-slate-500">/mês</span></p>
                </div>
              </div>

              {/* Inventário Local */}
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-3">Equipamentos Alocados: {court.equipment.length}</span>
                <div className="flex flex-wrap gap-2">
                  {court.equipment.slice(0, 3).map((eq, i) => (
                    <div key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-tight transition-all ${eq.status === 'issue'
                      ? 'bg-red-50 dark:bg-red-900/10 text-red-500 border-red-100 dark:border-red-900/20'
                      : 'bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-white/5'
                      }`}>
                      <span className="material-symbols-outlined text-[14px]">
                        {eq.status === 'issue' ? 'report' : 'check_circle'}
                      </span>
                      {eq.name}
                    </div>
                  ))}
                  {court.equipment.length > 3 && (
                    <div className="px-3 py-1.5 rounded-xl border border-dashed border-slate-200 dark:border-white/5 text-[9px] font-black text-slate-400 uppercase">
                      +{court.equipment.length - 3} mais
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline de Manutenção */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Última Revisão</span>
                  <p className="text-[10px] font-black dark:text-slate-200">{court.lastMaintenance}</p>
                </div>
                <div className="text-right border-l border-slate-200 dark:border-white/5 pl-4">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Agenda Prev.</span>
                  <p className="text-[10px] font-black text-primary-blue">{court.nextMaintenance}</p>
                </div>
              </div>

              {/* Ações Técnicas */}
              <div className="mt-auto pt-4 flex gap-3">
                <button
                  onClick={() => handleEditCourt(court)}
                  className="h-12 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-2xl transition-all shadow-sm"
                >
                  <span className="material-symbols-outlined">settings_suggest</span>
                </button>
                <button
                  onClick={() => handleActionClick(court)}
                  className={`flex-1 h-12 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg ${court.status === 'maintenance' || court.status === 'attention' ? 'bg-orange-500 text-white shadow-orange-500/20' : 'bg-primary text-slate-900 shadow-primary/20'
                    }`}>
                  <span className="material-symbols-outlined text-lg">
                    {court.status === 'maintenance' || court.status === 'attention' ? 'engineering' : 'report_problem'}
                  </span>
                  {court.status === 'maintenance' || court.status === 'attention' ? 'Gerenciar OS' : 'Relatar'}
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Card de Adição de Ativo */}
        <button
          onClick={handleAddNew}
          className="bg-slate-50 dark:bg-slate-900/20 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-800 p-12 flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-primary hover:text-primary transition-all group h-full min-h-[400px]"
        >
          <span className="material-symbols-outlined text-5xl group-hover:scale-110 transition-transform">add_circle</span>
          <span className="text-xs font-black uppercase tracking-[0.2em]">Novo Ativo Imobiliário</span>
        </button>
      </div>

      {/* Modais */}
      {selectedCourt && (
        <FacilityMaintenanceModal
          isOpen={isMaintenanceOpen}
          onClose={() => { setIsMaintenanceOpen(false); setSelectedCourt(null); }}
          court={selectedCourt}
          onReport={handleTaskReported}
        />
      )}

      {selectedCourt && (
        <ManageOSModal
          isOpen={isOSModalOpen}
          onClose={() => { setIsOSModalOpen(false); setSelectedCourt(null); }}
          court={selectedCourt}
          onUpdate={handleOSUpdate}
          activeTasks={tasks.filter((t: any) => t.title.startsWith(selectedCourt.name) && t.status !== 'COMPLETED')}
        />
      )}

      <FacilityEditModal
        isOpen={isEditOpen}
        onClose={() => { setIsEditOpen(false); setEditingCourt(null); }}
        initialData={editingCourt}
        onSave={handleSaveCourt}
      />

      <ActivityLogsModal
        isOpen={isLogsOpen}
        onClose={() => setIsLogsOpen(false)}
        initialFilter="COURTS"
      />
    </div>
  );
};

export default CourtManagementView;
