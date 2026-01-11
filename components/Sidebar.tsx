
import React from 'react';
import { Module, User } from '../types';
import { NAV_ITEMS } from '../constants';

interface SidebarProps {
  activeModule: Module;
  setActiveModule: (m: Module) => void;
  isOpen: boolean;
  toggle: () => void;
  currentUser: User | null;
}

const Sidebar: React.FC<SidebarProps> = ({ activeModule, setActiveModule, isOpen, toggle, currentUser }) => {
  // RBAC Filter Logic
  const filteredNavItems = NAV_ITEMS.filter(item => {
    if (!currentUser || currentUser.role === 'admin') return true;

    // Staff Restrictions
    if (currentUser.role === 'staff') {
      const allowedModules = [Module.POS, Module.COURTS, Module.INVENTORY, Module.CRM];
      return allowedModules.includes(item.id);
    }

    return false;
  });

  return (
    <aside
      className={`
        bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-white/5
        transition-all duration-300 flex flex-col h-full shrink-0 z-30
        ${isOpen ? 'w-64' : 'w-20'}
      `}
    >
      <div className="p-8 flex items-center justify-center overflow-hidden shrink-0 h-24">
        {isOpen ? (
          <img src="/logo_arena_cor.png" alt="Arena D65" className="h-12 w-auto object-contain animate-fadeIn" />
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
            {isOpen && <span className="text-xs uppercase tracking-widest font-black animate-fadeIn">{item.id}</span>}

            {activeModule === item.id && !isOpen && (
              <div className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"></div>
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
  );
};

export default Sidebar;
