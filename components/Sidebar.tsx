
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
    if (!currentUser) return true;
    const role = currentUser.role.toLowerCase();

    if (role === 'admin') return true;

    // Staff Restrictions
    if (role === 'staff' || role === 'manager') {
      const allowedModules = [Module.POS, Module.INVENTORY, Module.USERS, Module.FINANCE, Module.MAINTENANCE, Module.CRM];
      return allowedModules.includes(item.id);
    }

    // Cashier can only access POS and Inventory
    if (role === 'cashier') {
      const allowedModules = [Module.POS, Module.INVENTORY];
      return allowedModules.includes(item.id);
    }

    return false;
  });

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
