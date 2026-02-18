import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Module, User } from '../types';
import { getUserAvatar } from '../utils/avatar';
interface HeaderProps {
  activeModule: Module;
  setActiveModule: (m: Module) => void;
  toggleSidebar: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isCashierOpen: boolean;
  onOpenCashierModal: () => void;
  onLogout: () => void;
  user: User | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeModule,
  setActiveModule,
  toggleSidebar,
  theme,
  toggleTheme,
  isCashierOpen,
  onOpenCashierModal,
  onLogout,
  user
}) => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 z-40 shadow-sm shrink-0 transition-colors">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h2 className="text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white truncate uppercase font-display">{activeModule}</h2>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={onOpenCashierModal}
          className={`flex items-center px-3 md:px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border active:scale-95 ${isCashierOpen
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-primary border-green-200 dark:border-primary/20 hover:bg-green-200 dark:hover:bg-green-900/50'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
        >
          <span className={`size-2 rounded-full mr-2 ${isCashierOpen ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></span>
          <span className="hidden sm:inline">{isCashierOpen ? 'Caixa Aberto' : 'Caixa Fechado'}</span>
          <span className="material-symbols-outlined text-[16px] sm:text-[14px] sm:ml-2 opacity-60">
            {isCashierOpen ? 'lock_open' : 'lock'}
          </span>
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all active:scale-90"
        >
          <span className="material-symbols-outlined">
            {theme === 'light' ? 'dark_mode' : 'light_mode'}
          </span>
        </button>

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>

        <div className="relative" ref={profileRef}>
          <div className="flex items-center gap-1">
            {user && (
              <img
                src={getUserAvatar(user)}
                alt={user.name}
                className="size-8 rounded-xl object-cover border border-primary/40 shadow-sm"
              />
            )}
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className={`p-1 rounded-lg transition-all ${isProfileDropdownOpen ? 'bg-primary/5' : 'hover:bg-slate-100 dark:hover:bg-white/5'}`}
            >
              <span className={`material-symbols-outlined text-slate-400 transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180' : ''}`}>keyboard_arrow_down</span>
            </button>
          </div>

          {isProfileDropdownOpen && (
            <div className="absolute top-12 right-0 w-64 bg-white dark:bg-surface-dark rounded-[28px] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden animate-fadeIn z-[100] p-2">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 mb-2">
                <p className="text-xs font-black text-slate-900 dark:text-white uppercase truncate tracking-tight">{user?.name || 'Usuário'}</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{user?.role || 'Visitante'}</p>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-left"
                >
                  <span className="material-symbols-outlined text-xl">logout</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">Sair do Sistema</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
