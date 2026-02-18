
import React, { useEffect, useState } from 'react';
import { Module, User } from '../types';
import { NAV_ITEMS } from '../constants';
import { userService, Permission } from '../services/userService';

interface SidebarProps {
  activeModule: Module;
  setActiveModule: (m: Module) => void;
  isOpen: boolean;
  toggle: () => void;
  currentUser: User | null;
}

const MODULE_PERMISSIONS: Record<Module, { module: string; action: string }[]> = {
  [Module.DASHBOARD]: [], // Dashboard is always accessible
  [Module.POS]: [
    { module: 'Bar / PDV', action: 'Realizar Vendas' },
    { module: 'Bar / PDV', action: 'Fechamento de Caixa' },
    { module: 'Bar / PDV', action: 'Gestão de Estoque' },
    { module: 'Bar / PDV', action: 'Ajuste de Preços' },
  ],
  [Module.INVENTORY]: [
    { module: 'Bar / PDV', action: 'Gestão de Estoque' },
  ],
  [Module.USERS]: [
    { module: 'Usuários', action: 'Acesso Total' },
    { module: 'Usuários', action: 'Criar Usuários' },
    { module: 'Usuários', action: 'Editar Permissões' },
  ],
  [Module.FINANCE]: [
    { module: 'Financeiro', action: 'Acesso Total' },
    { module: 'Financeiro', action: 'Apenas Visualização' },
    { module: 'Financeiro', action: 'Relatórios Fiscais' },
  ],
  [Module.MAINTENANCE]: [
    { module: 'Instalações', action: 'Gerenciar Reservas' },
    { module: 'Instalações', action: 'Visualizar Grade' },
    { module: 'Instalações', action: 'Bloqueio de Quadras' },
  ],
  [Module.CRM]: [], // CRM needs its own permissions
};

const Sidebar: React.FC<SidebarProps> = ({ activeModule, setActiveModule, isOpen, toggle, currentUser }) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    const loadPermissions = async () => {
      if (currentUser) {
        try {
          const perms = await userService.getMyPermissions();
          setPermissions(perms);
        } catch (error) {
          console.error('Error loading permissions:', error);
        }
      }
    };
    loadPermissions();
  }, [currentUser]);

  const hasPermission = (moduleId: Module): boolean => {
    if (!currentUser) return true;
    
    // Admin has access to everything
    if (currentUser.role === 'ADMIN') return true;
    
    // Dashboard is always accessible
    if (moduleId === Module.DASHBOARD) return true;
    
    const requiredPerms = MODULE_PERMISSIONS[moduleId];
    if (!requiredPerms || requiredPerms.length === 0) {
      // If no permissions defined, allow based on role
      const role = currentUser.role.toLowerCase();
      if (role === 'manager') return true;
      return false;
    }
    
    // Check if user has any of the required permissions
    return requiredPerms.some(req => 
      permissions.some(p => 
        p.module === req.module && 
        p.action === req.action && 
        p.granted
      )
    );
  };

  const filteredNavItems = NAV_ITEMS.filter(item => hasPermission(item.id));

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggle}
      />

      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-white/5
          transition-all duration-300 flex flex-col h-full shrink-0
          ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-20'}
          shadow-2xl md:shadow-none
        `}
      >
        <div className="p-8 flex items-center justify-center overflow-hidden shrink-0 h-24 relative">
          <button onClick={toggle} className="md:hidden absolute top-4 right-4 text-slate-400">
            <span className="material-symbols-outlined">close</span>
          </button>

          {isOpen ? (
            <img src="./logo_arena_cor.png" alt="Arena D65" className="h-12 w-auto object-contain animate-fadeIn" />
          ) : (
            <div className="size-10 bg-primary rounded-xl flex items-center justify-center shrink-0 shadow-xl shadow-primary/20">
              <span className="text-white font-black text-lg">A</span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar py-4">
          {filteredNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`
                w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all relative group
                ${activeModule === item.id
                  ? 'bg-primary text-slate-900 font-black shadow-lg shadow-primary/20'
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 dark:hover:text-white'}
              `}
            >
              <span className={`material-symbols-outlined text-2xl ${activeModule === item.id ? 'fill-current' : ''}`}>
                {item.icon}
              </span>
              <span className={`text-xs uppercase tracking-widest font-black transition-all duration-300 ${isOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden md:opacity-0'}`}>
                {item.id}
              </span>

              {activeModule === item.id && !isOpen && (
                <div className="absolute left-0 w-1 h-6 bg-primary rounded-r-full hidden md:block"></div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100 dark:border-white/5 flex justify-center">
          <p className={`text-[8px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest ${isOpen ? '' : 'hidden'}`}>
            Arena D65 v2.5.0
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
