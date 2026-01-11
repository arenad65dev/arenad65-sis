
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Module, AppNotification, CashierSession } from '../types';
import NotificationPanel from './NotificationPanel';
import UserProfileModal from './UserProfileModal';
import CashierModal from './CashierModal';
import { MOCK_PRODUCTS } from '../constants';

interface HeaderProps {
  activeModule: Module;
  setActiveModule: (m: Module) => void;
  toggleSidebar: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isCashierOpen: boolean;
  cashierSession?: CashierSession;
  onToggleCashier: (open: boolean) => void;
  onSetSession: (initialBalance: number) => void;
  onRecordSkimming?: (amount: number, reason: string) => void;
  isCashierModalOpen: boolean;
  onOpenCashierModal: () => void;
  onCloseCashierModal: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeModule,
  setActiveModule,
  toggleSidebar,
  theme,
  toggleTheme,
  isCashierOpen,
  cashierSession,
  onToggleCashier,
  onSetSession,
  onRecordSkimming,
  isCashierModalOpen,
  onOpenCashierModal,
  onCloseCashierModal,
  onLogout
}) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'profile' | 'settings' | 'security'>('profile');

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    const initialNotifications: AppNotification[] = [];
    MOCK_PRODUCTS.filter(p => p.stock < p.minStock).forEach(p => {
      initialNotifications.push({
        id: `inv-${p.id}`,
        title: 'Estoque Crítico',
        description: `${p.name} está com apenas ${p.stock} unidades. Reabasteça agora.`,
        type: 'inventory',
        priority: 'high',
        timestamp: '10 min',
        read: false,
        targetModule: Module.INVENTORY
      });
    });
    setNotifications(initialNotifications);
  }, []);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openSettings = (tab: 'profile' | 'settings' | 'security') => {
    setActiveSettingsTab(tab);
    setIsSettingsModalOpen(true);
    setIsProfileDropdownOpen(false);
  };

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
          className={`hidden sm:flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border active:scale-95 ${isCashierOpen
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-primary border-green-200 dark:border-primary/20 hover:bg-green-200 dark:hover:bg-green-900/50'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
        >
          <span className={`size-2 rounded-full mr-2 ${isCashierOpen ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></span>
          {isCashierOpen ? 'Caixa Aberto' : 'Caixa Fechado'}
          <span className="material-symbols-outlined text-[14px] ml-2 opacity-60">
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

        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`p-2 rounded-full relative transition-all active:scale-90 ${isNotificationsOpen ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 size-4 bg-red-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-surface-dark animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <NotificationPanel
              notifications={notifications}
              onClose={() => setIsNotificationsOpen(false)}
              onMarkRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))}
              onClearAll={() => setNotifications([])}
              onNavigate={(mod) => {
                setActiveModule(mod);
                setIsNotificationsOpen(false);
              }}
            />
          )}
        </div>

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>

        <div className="relative" ref={profileRef}>
          <div className="flex items-center gap-1">
            <button
              onClick={() => openSettings('profile')}
              className="size-8 rounded-xl bg-cover bg-center border border-primary/40 shadow-sm hover:scale-110 transition-transform active:scale-95"
              style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100&h=100)' }}
            />
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
                <p className="text-xs font-black text-slate-900 dark:text-white uppercase truncate tracking-tight">Carlos Silva</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Administrador Geral</p>
              </div>
              <div className="space-y-1">
                <button onClick={() => openSettings('profile')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 dark:text-slate-400 dark:hover:text-white transition-all text-left">
                  <span className="material-symbols-outlined text-xl">person</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">Meu Perfil</span>
                </button>
                <button onClick={() => openSettings('settings')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 dark:text-slate-400 dark:hover:text-white transition-all text-left">
                  <span className="material-symbols-outlined text-xl">settings</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">Ajustes</span>
                </button>
                <button onClick={() => openSettings('security')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 dark:text-slate-400 dark:hover:text-white transition-all text-left">
                  <span className="material-symbols-outlined text-xl">security</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">Segurança</span>
                </button>
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

      <CashierModal
        isOpen={isCashierModalOpen}
        onClose={onCloseCashierModal}
        isCashierOpen={isCashierOpen}
        session={cashierSession}
        onConfirm={(balance) => onSetSession(balance)}
        onToggle={() => onToggleCashier(false)}
        onRecordSkimming={onRecordSkimming}
      />

      <UserProfileModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        initialTab={activeSettingsTab}
      />
    </header>
  );
};
