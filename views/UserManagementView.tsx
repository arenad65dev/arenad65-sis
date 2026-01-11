
import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_USERS } from '../constants';
import AddEmployeeModal from '../components/AddEmployeeModal';
import ActivityLogsModal from '../components/ActivityLogsModal';
import ConfirmModal from '../components/ConfirmModal';
import { User } from '../types';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

const UserManagementView: React.FC = () => {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [selectedUser, setSelectedUser] = useState<User | null>(MOCK_USERS[0]);
  const [departmentFilter, setDepartmentFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [showLogsQuickView, setShowLogsQuickView] = useState(false);
  
  // Estados para Exclusão
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // Sistema de Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const departments = ['Todos', 'Administrativo', 'Bar / PDV', 'Financeiro'];

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const deptMatch = departmentFilter === 'Todos' || user.department === departmentFilter;
      const searchMatch = user.name.toLowerCase().includes(search.toLowerCase()) || 
                          user.email.toLowerCase().includes(search.toLowerCase());
      return deptMatch && searchMatch;
    });
  }, [departmentFilter, search, users]);

  const handleToggleStatus = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const updatedUsers = users.map(u => u.id === userId ? { ...u, status: newStatus as any } : u);
    setUsers(updatedUsers);
    
    if (selectedUser?.id === userId) {
      setSelectedUser({ ...selectedUser, status: newStatus as any });
    }
    addToast(`Status do colaborador atualizado para ${newStatus === 'active' ? 'Ativo' : 'Suspenso'}.`);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const promptDelete = (userId: string) => {
    setUserToDelete(userId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!userToDelete) return;
    
    const updatedUsers = users.filter(u => u.id !== userToDelete);
    setUsers(updatedUsers);
    
    if (selectedUser?.id === userToDelete) {
      setSelectedUser(updatedUsers.length > 0 ? updatedUsers[0] : null);
    }
    
    addToast('Colaborador removido com sucesso.', 'error');
    setUserToDelete(null);
  };

  const handleSaveUser = (formData: any) => {
    if (editingUser) {
      const updated = users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u);
      setUsers(updated);
      const updatedUser = updated.find(u => u.id === editingUser.id);
      if (updatedUser) setSelectedUser(updatedUser);
      addToast(`Dados de ${formData.name} atualizados.`);
    } else {
      const newUser: User = {
        ...formData,
        id: Math.floor(Math.random() * 90000 + 10000).toString(),
        status: 'active',
        avatar: `https://i.pravatar.cc/150?u=${Math.random()}`
      };
      setUsers([newUser, ...users]);
      setSelectedUser(newUser);
      addToast(`${formData.name} cadastrado na Arena.`);
    }
    setEditingUser(null);
  };

  const handleResetPassword = (user: User) => {
    addToast(`Link de recuperação enviado para ${user.email}`);
  };

  // Permissões
  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    'Financeiro_Acesso Total': true,
    'Bar / PDV_Realizar Vendas': true,
  });

  const togglePermission = (key: string) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const selectAllInGroup = (group: string, items: string[]) => {
    const newState = { ...permissions };
    items.forEach(item => { newState[`${group}_${item}`] = true; });
    setPermissions(newState);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden animate-fadeIn relative">
      
      {/* Toast Notification Container */}
      <div className="fixed top-20 right-8 z-[200] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-fadeIn border backdrop-blur-md pointer-events-auto ${
              toast.type === 'success' 
              ? 'bg-primary/90 text-slate-900 border-primary/20' 
              : 'bg-red-600/90 text-white border-red-500/20'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {toast.type === 'success' ? 'check_circle' : 'delete'}
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Main Table Section */}
      <div className="flex-1 flex flex-col gap-6 bg-white dark:bg-surface-dark rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-5 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Equipe Interna</h2>
                <span className="px-2 py-0.5 bg-primary/10 text-primary-dark dark:text-primary text-[8px] font-black uppercase rounded border border-primary/20 tracking-widest">Controle de Staff</span>
              </div>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">Gestão de acessos, auditoria e permissões operacionais.</p>
            </div>
            <button 
              onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
              className="h-11 px-6 bg-primary text-slate-900 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-primary/20 uppercase tracking-widest hover:scale-[1.02] transition-all active:scale-95 shrink-0"
            >
              <span className="material-symbols-outlined text-[20px]">person_add</span>
              Novo Funcionário
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input 
                type="text" 
                placeholder="Buscar por nome ou e-mail..."
                className="w-full pl-12 pr-4 py-2.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar shrink-0">
              {departments.map(dept => (
                <button
                  key={dept}
                  onClick={() => setDepartmentFilter(dept)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                    departmentFilter === dept 
                      ? 'bg-slate-900 dark:bg-primary text-white dark:text-slate-900 border-transparent shadow-md' 
                      : 'bg-white dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/10 hover:border-primary/40'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left">
            <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Colaborador</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Último Acesso</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map(user => (
                <tr 
                  key={user.id} 
                  onClick={() => { setSelectedUser(user); setShowLogsQuickView(false); }}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer group ${selectedUser?.id === user.id ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden ring-2 ring-primary/10">
                        <img src={user.avatar} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-black dark:text-white truncate">{user.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{user.role} • {user.department}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{user.lastVisit || 'Sem registro'}</span>
                      <span className="text-[9px] text-primary-blue font-black uppercase tracking-tight">IP: 187.45.{Math.floor(Math.random()*99)}.{Math.floor(Math.random()*99)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                      user.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-primary' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {user.status === 'active' ? 'Ativo' : 'Suspenso'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleResetPassword(user); }}
                        className="p-2 text-slate-400 hover:text-primary-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all" title="Resetar Senha"
                      >
                        <span className="material-symbols-outlined text-[18px]">key</span>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEditUser(user); }}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all" title="Editar"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit_note</span>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleToggleStatus(user.id, user.status); }}
                        className={`p-2 rounded-lg transition-all ${user.status === 'active' ? 'text-slate-400 hover:text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`} 
                        title={user.status === 'active' ? 'Bloquear' : 'Desbloquear'}
                      >
                        <span className="material-symbols-outlined text-[18px]">{user.status === 'active' ? 'block' : 'lock_open'}</span>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); promptDelete(user.id); }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all" title="Excluir Colaborador"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
             <div className="flex flex-col items-center justify-center py-20 opacity-20">
               <span className="material-symbols-outlined text-6xl mb-2">person_off</span>
               <p className="font-black uppercase tracking-widest text-xs">Nenhum colaborador encontrado</p>
             </div>
          )}
        </div>
      </div>

      {/* Sidebar Details / Quick View Logs */}
      <aside className="w-full lg:w-[420px] flex flex-col bg-white dark:bg-surface-dark rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl h-full overflow-hidden shrink-0">
        {selectedUser ? (
          <>
            <div className="p-8 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="size-20 rounded-[24px] overflow-hidden border-4 border-white dark:border-surface-dark shadow-xl ring-2 ring-primary">
                  <img src={selectedUser.avatar} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight dark:text-white leading-tight">{selectedUser.name}</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">ID #{selectedUser.id}</p>
                </div>
                <div className="flex gap-2 w-full">
                  <button 
                    onClick={() => setShowLogsQuickView(!showLogsQuickView)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                      showLogsQuickView ? 'bg-primary text-slate-900 border-primary' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{showLogsQuickView ? 'admin_panel_settings' : 'manage_search'}</span>
                    {showLogsQuickView ? 'Acessos' : 'Resumo de Logs'}
                  </button>
                  <button 
                    onClick={() => setIsLogsModalOpen(true)}
                    className="size-10 flex items-center justify-center bg-primary-blue/10 text-primary-blue rounded-2xl border border-primary-blue/20 hover:bg-primary-blue hover:text-white transition-all"
                    title="Histórico Completo"
                  >
                    <span className="material-symbols-outlined text-[20px]">open_in_full</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {!showLogsQuickView ? (
                <div className="space-y-10">
                  {[
                    { group: 'Financeiro', icon: 'payments', color: 'green', items: ['Acesso Total', 'Apenas Visualização', 'Relatórios Fiscais'] },
                    { group: 'Bar / PDV', icon: 'point_of_sale', color: 'orange', items: ['Realizar Vendas', 'Fechamento de Caixa', 'Gestão de Estoque', 'Ajuste de Preços'] },
                    { group: 'Instalações', icon: 'stadium', color: 'blue', items: ['Gerenciar Reservas', 'Visualizar Grade', 'Bloqueio de Quadras'] },
                  ].map((section, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl bg-${section.color === 'green' ? 'primary' : section.color}-500/10 text-${section.color === 'green' ? 'primary-dark' : section.color}-600 dark:text-${section.color === 'green' ? 'primary' : section.color}-400`}>
                            <span className="material-symbols-outlined text-[20px]">{section.icon}</span>
                          </div>
                          <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{section.group}</h4>
                        </div>
                        <button 
                          onClick={() => selectAllInGroup(section.group, section.items)}
                          className="text-[9px] font-black text-primary-blue uppercase hover:underline"
                        >
                          Selecionar Tudo
                        </button>
                      </div>
                      <div className="space-y-5 pl-1.5">
                        {section.items.map((item, i) => (
                          <label key={i} className="flex items-start gap-4 cursor-pointer group/item">
                            <input 
                              type="checkbox" 
                              checked={permissions[`${section.group}_${item}`] || false}
                              onChange={() => togglePermission(`${section.group}_${item}`)}
                              className="peer size-5 rounded-lg border-slate-300 dark:border-slate-700 text-primary focus:ring-primary/20 dark:bg-slate-900 transition-all cursor-pointer" 
                            />
                            <div className="flex flex-col">
                              <p className="text-sm font-black text-slate-700 dark:text-slate-300 group-hover/item:text-slate-900 dark:group-hover/item:text-white transition-colors uppercase tracking-tight">{item}</p>
                              <p className="text-[10px] text-slate-400 font-medium">Libera {item.toLowerCase()} no módulo.</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Últimas Atividades</h4>
                  {[
                    { action: 'Abriu Caixa PDV', module: 'BAR', time: 'Hoje, 08:00' },
                    { action: 'Registrou Venda #882', module: 'BAR', time: 'Hoje, 09:15' },
                    { action: 'Editou Reserva Quadra 2', module: 'COURTS', time: 'Hoje, 10:30' },
                    { action: 'Cancelou Item Venda #882', module: 'BAR', time: 'Hoje, 11:20', critical: true },
                  ].map((log, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-xs font-black ${log.critical ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>{log.action}</span>
                        <span className="text-[8px] px-1.5 py-0.5 bg-slate-200 dark:bg-white/10 rounded text-slate-500 uppercase font-black">{log.module}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold">{log.time}</p>
                    </div>
                  ))}
                  <button 
                    onClick={() => setIsLogsModalOpen(true)}
                    className="w-full py-4 text-[10px] font-black text-primary-blue uppercase border border-dashed border-primary-blue/30 rounded-2xl hover:bg-primary-blue/5 transition-all"
                  >
                    Abrir Histórico Completo
                  </button>
                </div>
              )}
            </div>

            <div className="p-8 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              <button className="flex-1 py-4 bg-primary hover:bg-primary-dark text-slate-900 font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95">Salvar Acessos</button>
              <button className="px-5 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-black text-[10px] uppercase tracking-widest rounded-2xl text-slate-500 hover:bg-slate-50 transition-all">Cancelar</button>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-12 text-center">
            <div className="size-24 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-4xl text-slate-300">touch_app</span>
            </div>
            <h3 className="text-lg font-black dark:text-white uppercase tracking-widest mb-2">Seleção Pendente</h3>
            <p className="text-xs text-slate-400 font-medium">Selecione um colaborador na lista ao lado para gerenciar permissões e visualizar atividades.</p>
          </div>
        )}
      </aside>

      {/* MODAIS */}
      <AddEmployeeModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingUser(null); }}
        onSave={handleSaveUser}
        initialData={editingUser}
      />
      
      {selectedUser && (
        <ActivityLogsModal 
          isOpen={isLogsModalOpen}
          onClose={() => setIsLogsModalOpen(false)}
          targetUserName={selectedUser.name}
        />
      )}

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setUserToDelete(null); }}
        onConfirm={confirmDelete}
        title="Excluir Colaborador"
        message="Tem certeza que deseja remover este acesso? Esta ação não pode ser desfeita e o histórico de logs será preservado apenas para auditoria interna."
        confirmText="Excluir Agora"
      />
    </div>
  );
};

export default UserManagementView;
