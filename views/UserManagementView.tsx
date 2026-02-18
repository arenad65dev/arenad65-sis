
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { userService, User, Permission, ActivityLog } from '../services/userService';
import { getUserAvatar } from '../utils/avatar';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

interface UserPermissions {
  [key: string]: boolean;
}

const MODULES = [
  { 
    group: 'Financeiro', 
    icon: 'payments', 
    items: ['Acesso Total', 'Apenas Visualização', 'Relatórios Fiscais'] 
  },
  { 
    group: 'Bar / PDV', 
    icon: 'point_of_sale', 
    items: ['Realizar Vendas', 'Fechamento de Caixa', 'Gestão de Estoque', 'Ajuste de Preços'] 
  },
  { 
    group: 'Instalações', 
    icon: 'stadium', 
    items: ['Gerenciar Reservas', 'Visualizar Grade', 'Bloqueio de Quadras'] 
  },
  { 
    group: 'Usuários', 
    icon: 'people', 
    items: ['Acesso Total', 'Criar Usuários', 'Editar Permissões'] 
  },
];

const ROLE_TRANSLATIONS: Record<string, string> = {
  'ADMIN': 'Administrador',
  'MANAGER': 'Gerente',
  'STAFF': 'Funcionário',
  'CASHIER': 'Caixa',
  'WAITER': 'Garçom'
};

const ROLE_COLORS: Record<string, string> = {
  'ADMIN': 'bg-red-100 text-red-700',
  'MANAGER': 'bg-purple-100 text-purple-700',
  'STAFF': 'bg-blue-100 text-blue-700',
  'CASHIER': 'bg-green-100 text-green-700',
  'WAITER': 'bg-yellow-100 text-yellow-700'
};

const UserManagementView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('Todos');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userLogs, setUserLogs] = useState<ActivityLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [showLogsView, setShowLogsView] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STAFF',
    department: '',
    avatar: ''
  });

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [permissions, setPermissions] = useState<UserPermissions>({});

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      addToast('Erro ao carregar usuários', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadUserDetails = useCallback(async (userId: string) => {
    try {
      const userData = await userService.getUser(userId);
      setSelectedUser(userData);
      
      // Load permissions
      const perms: UserPermissions = {};
      userData.permissions?.forEach((p: Permission) => {
        perms[`${p.module}_${p.action}`] = Boolean(p.granted);
      });
      setPermissions(perms);

      // Load logs
      setLogsLoading(true);
      const logs = await userService.getUserLogs(userId, 20);
      setUserLogs(logs);
      setLogsLoading(false);
    } catch (error) {
      console.error('Error loading user details:', error);
    }
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadUserDetails(selectedUser.id);
    }
  }, [selectedUser?.id, loadUserDetails]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await userService.updateUser(editingUser.id, formData);
        addToast('Usuário atualizado com sucesso!', 'success');
      } else {
        await userService.createUser(formData);
        addToast('Usuário criado com sucesso!', 'success');
      }
      setIsModalOpen(false);
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', role: 'STAFF', department: '', avatar: '' });
      loadUsers();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Erro ao salvar usuário', 'error');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      department: user.department || '',
      avatar: user.avatar || ''
    });
    setIsModalOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await userService.uploadAvatar(file);
      setFormData({ ...formData, avatar: result.url });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      addToast('Erro ao fazer upload da foto', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      if (user.isActive) {
        await userService.deleteUser(user.id);
        addToast('Usuário desativado', 'success');
      } else {
        await userService.reactivateUser(user.id);
        addToast('Usuário reativado', 'success');
      }
      loadUsers();
      if (selectedUser?.id === user.id) {
        const updated = { ...user, isActive: !user.isActive };
        setSelectedUser(updated);
      }
    } catch (error: any) {
      addToast('Erro ao alterar status', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja desativar este usuário?')) return;
    try {
      await userService.deleteUser(id);
      addToast('Usuário desativado com sucesso!', 'success');
      if (selectedUser?.id === id) setSelectedUser(null);
      loadUsers();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Erro ao desativar usuário', 'error');
    }
  };

  const handleResetPassword = async (user: User) => {
    try {
      await userService.requestPasswordReset(user.email);
      addToast(`Link de recuperação enviado para ${user.email}`, 'success');
    } catch (error) {
      addToast('Erro ao enviar link de recuperação', 'error');
    }
  };

  const togglePermission = async (key: string) => {
    if (!selectedUser) return;
    
    const newValue = !permissions[key];
    const [module, action] = key.split('_');
    
    try {
      await userService.updatePermission(selectedUser.id, { module, action, granted: newValue });
      setPermissions(prev => ({ ...prev, [key]: newValue }));
      addToast('Permissão atualizada!', 'success');
    } catch (error) {
      addToast('Erro ao atualizar permissão', 'error');
    }
  };

    const saveAllPermissions = async () => {
    if (!selectedUser) return;
    
    try {
      const perms: { module: string; action: string; granted: boolean }[] = [];
      Object.entries(permissions).forEach(([key, granted]) => {
        const [module, action] = key.split('_');
        perms.push({ module, action, granted });
      });
      
      await userService.bulkUpdatePermissions(selectedUser.id, perms);
      addToast('Permissões salvas!', 'success');
    } catch (error) {
      addToast('Erro ao salvar permissões', 'error');
    }
  };

  const selectAllInGroup = (group: string, items: string[]) => {
    const newPerms = { ...permissions };
    items.forEach(item => { newPerms[`${group}_${item}`] = true; });
    setPermissions(newPerms);
  };

  const filteredUsers = users.filter(user => {
    const deptMatch = departmentFilter === 'Todos' || user.department === departmentFilter;
    const searchMatch = user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    return deptMatch && searchMatch;
  });

  const departments = ['Todos', 'Administrativo', 'Bar / PDV', 'Financeiro', 'Operacional'];

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-full lg:overflow-hidden">
      {/* Toast Container */}
      <div className="fixed top-20 right-8 z-[200] flex flex-col gap-3">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border backdrop-blur-md ${
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
      <div className={`flex-1 flex flex-col gap-6 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden ${selectedUser ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-6 border-b border-slate-100 flex flex-col gap-5 bg-slate-50/50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Equipe Interna</h2>
                <span className="px-2 py-0.5 bg-primary/10 text-primary-dark text-[8px] font-black uppercase rounded border border-primary/20 tracking-widest">Controle de Staff</span>
              </div>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">Gestão de acessos, auditoria e permissões operacionais.</p>
            </div>
            <button
              onClick={() => { setEditingUser(null); setFormData({ name: '', email: '', password: '', role: 'STAFF', department: '' }); setIsModalOpen(true); }}
              className="h-11 px-6 bg-primary text-slate-900 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-primary/20 uppercase tracking-widest hover:scale-[1.02] transition-all"
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
                className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {departments.map(dept => (
                <button
                  key={dept}
                  onClick={() => setDepartmentFilter(dept)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                    departmentFilter === dept
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-white text-slate-400 border-slate-200 hover:border-primary/40'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left">
            <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Colaborador</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Último Acesso</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">Carregando...</td>
                </tr>
              ) : filteredUsers.map(user => (
                <tr
                  key={user.id}
                  onClick={() => { setSelectedUser(user); setShowLogsView(false); }}
                  className={`hover:bg-slate-50 transition-colors cursor-pointer group ${selectedUser?.id === user.id ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-slate-100 overflow-hidden ring-2 ring-primary/10">
                        <img src={getUserAvatar(user)} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-black text-slate-900 truncate">{user.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{ROLE_TRANSLATIONS[user.role] || user.role} • {user.department || 'Sem dept'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-600">Sem registro</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                      user.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {user.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleResetPassword(user); }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Resetar Senha"
                      >
                        <span className="material-symbols-outlined text-[18px]">key</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(user); }}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit_note</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleStatus(user); }}
                        className={`p-2 rounded-lg transition-all ${user.isActive ? 'text-slate-400 hover:text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                        title={user.isActive ? 'Bloquear' : 'Desbloquear'}
                      >
                        <span className="material-symbols-outlined text-[18px]">{user.isActive ? 'block' : 'lock_open'}</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(user.id); }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Excluir"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-20 opacity-20">
              <span className="material-symbols-outlined text-6xl mb-2">person_off</span>
              <p className="font-black uppercase tracking-widest text-xs">Nenhum colaborador encontrado</p>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Details */}
      <aside className={`w-full lg:w-[420px] flex flex-col bg-white rounded-3xl border border-slate-200 shadow-2xl h-full overflow-hidden shrink-0 ${selectedUser ? 'flex' : 'hidden lg:flex'}`}>
        {selectedUser ? (
          <>
            <div className="p-6 md:p-8 bg-slate-50/50 border-b border-slate-100 relative">
              <button
                onClick={() => setSelectedUser(null)}
                className="lg:hidden absolute top-6 left-6 size-10 flex items-center justify-center bg-white rounded-xl border border-slate-200 text-slate-500 shadow-sm"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>

              <div className="flex flex-col items-center text-center gap-2 mt-8 lg:mt-0">
                <div className="size-20 rounded-[24px] overflow-hidden border-4 border-white shadow-xl ring-2 ring-primary">
                  <img src={getUserAvatar(selectedUser)} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight">{selectedUser.name}</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">ID #{selectedUser.id.substring(0, 8)}</p>
                </div>
                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => setShowLogsView(!showLogsView)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                      showLogsView ? 'bg-primary text-slate-900 border-primary' : 'bg-white border-slate-200 text-slate-500'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{showLogsView ? 'admin_panel_settings' : 'manage_search'}</span>
                    {showLogsView ? 'Acessos' : 'Resumo de Logs'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              {!showLogsView ? (
                <div className="space-y-10">
                  {MODULES.map((section) => (
                    <div key={section.group}>
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <span className="material-symbols-outlined text-[20px]">{section.icon}</span>
                          </div>
                          <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{section.group}</h4>
                        </div>
                        <button
                          onClick={() => selectAllInGroup(section.group, section.items)}
                          className="text-[9px] font-black text-blue-600 uppercase hover:underline"
                        >
                          Selecionar Tudo
                        </button>
                      </div>
                      <div className="space-y-5 pl-1.5">
                        {section.items.map((item) => (
                          <label key={item} className="flex items-start gap-4 cursor-pointer group/item">
                            <input
                              type="checkbox"
                              checked={permissions[`${section.group}_${item}`] || false}
                              onChange={() => togglePermission(`${section.group}_${item}`)}
                              className="peer size-5 rounded-lg border-slate-300 text-primary focus:ring-primary/20"
                            />
                            <div className="flex flex-col">
                              <p className="text-sm font-black text-slate-700 uppercase tracking-tight">{item}</p>
                              <p className="text-[10px] text-slate-400 font-medium">Libera {item.toLowerCase()} no módulo.</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Últimas Atividades</h4>
                  {logsLoading ? (
                    <p className="text-slate-400 text-sm">Carregando...</p>
                  ) : userLogs.length > 0 ? (
                    userLogs.map((log) => (
                      <div key={log.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-black text-slate-900">{log.details || log.action}</span>
                          <span className="text-[8px] px-1.5 py-0.5 bg-slate-200 rounded text-slate-500 uppercase font-black">{log.module}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold">
                          {new Date(log.createdAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 text-sm">Nenhum registro de atividade</p>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 md:p-8 bg-slate-50/50 border-t border-slate-100 flex gap-3">
              <button 
                onClick={saveAllPermissions}
                className="flex-1 py-4 bg-primary hover:bg-primary-dark text-slate-900 font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 transition-all"
              >
                Salvar Acessos
              </button>
              <button className="px-5 py-4 bg-white border border-slate-200 font-black text-[10px] uppercase tracking-widest rounded-2xl text-slate-500 hover:bg-slate-50 transition-all">
                Cancelar
              </button>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-12 text-center">
            <div className="size-24 rounded-full bg-slate-50 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-4xl text-slate-300">touch_app</span>
            </div>
            <h3 className="text-lg font-black uppercase tracking-widest mb-2">Seleção Pendente</h3>
            <p className="text-xs text-slate-400 font-medium">Selecione um colaborador na lista ao lado para gerenciar permissões e visualizar atividades.</p>
          </div>
        )}
      </aside>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingUser ? 'Editar Funcionário' : 'Novo Funcionário'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="size-24 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200">
                    {formData.avatar ? (
                      <img src={formData.avatar} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined text-4xl">person</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute -bottom-2 -right-2 size-8 rounded-full bg-primary text-slate-900 flex items-center justify-center shadow-lg hover:bg-primary-dark transition-colors"
                  >
                    {uploading ? (
                      <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                    ) : (
                      <span className="material-symbols-outlined text-sm">photo_camera</span>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Senha {editingUser && '(deixe vazio para manter)'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cargo</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="ADMIN">Administrador</option>
                  <option value="MANAGER">Gerente</option>
                  <option value="STAFF">Funcionário</option>
                  <option value="CASHIER">Caixa</option>
                  <option value="WAITER">Garçom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Departamento</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="">Selecione...</option>
                  <option value="Administrativo">Administrativo</option>
                  <option value="Bar / PDV">Bar / PDV</option>
                  <option value="Financeiro">Financeiro</option>
                  <option value="Operacional">Operacional</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-slate-900 rounded-lg font-bold hover:bg-primary-dark"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementView;
