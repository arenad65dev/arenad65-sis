
import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Module, CashierSession } from './types';
import Sidebar from './components/Sidebar';
import { Header } from './components/Header';
import DashboardView from './views/DashboardView';
import UserManagementView from './views/UserManagementView';
import FinanceView from './views/FinanceView';
import POSView from './views/POSView';
import CourtManagementView from './views/CourtManagementView';
import InventoryView from './views/InventoryView';
import CRMView from './views/CRMView';
import ReportsView from './views/ReportsView';
import LoginView from './views/LoginView';
import CashierInfoModal from './components/CashierInfoModal';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<Module>(Module.DASHBOARD);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isCashierModalOpen, setIsCashierModalOpen] = useState(false);
  const [isCashierInfoModalOpen, setIsCashierInfoModalOpen] = useState(false);

  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // If not logged in, show login view
  // Check auth later in render

  const [cashierSession, setCashierSession] = useState<CashierSession>(() => {
    const saved = localStorage.getItem('arena_cashier_session');
    if (saved) return JSON.parse(saved);
    return { isOpen: false, openedBy: '', openedAt: '', initialBalance: 0, totalSales: 0, totalSkimmings: 0, skimmingHistory: [] };
  });

  useEffect(() => {
    document.documentElement.className = theme;
    document.body.className = theme === 'dark' ? 'bg-background-dark overflow-hidden h-screen' : 'bg-background-light overflow-hidden h-screen';
  }, [theme]);

  const handleOpenCashier = (initialBalance: number) => {
    const newSession: CashierSession = {
      isOpen: true,
      openedBy: 'Carlos Silva',
      openedAt: new Date().toLocaleString('pt-BR'),
      initialBalance: initialBalance,
      totalSales: 1250.80, // Simulator mock
      totalSkimmings: 0,
      skimmingHistory: []
    };
    setCashierSession(newSession);
    localStorage.setItem('arena_cashier_session', JSON.stringify(newSession));
    setIsCashierInfoModalOpen(true);
  };

  const handleCloseCashier = () => {
    const closedSession = { isOpen: false, openedBy: '', openedAt: '', initialBalance: 0, totalSales: 0, totalSkimmings: 0, skimmingHistory: [] };
    setCashierSession(closedSession);
    localStorage.removeItem('arena_cashier_session');
  };

  const handleRecordSkimming = (amount: number, reason: string) => {
    setCashierSession(prev => {
      const newSession = {
        ...prev,
        totalSkimmings: (prev.totalSkimmings || 0) + amount,
        skimmingHistory: [...(prev.skimmingHistory || []), {
          amount,
          reason,
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }]
      };
      localStorage.setItem('arena_cashier_session', JSON.stringify(newSession));
      return newSession;
    });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen w-full overflow-hidden text-slate-900 dark:text-slate-100">
        {!currentUser ? (
          <LoginView onLogin={setCurrentUser} />
        ) : (
          <>
            <Sidebar
              activeModule={activeModule}
              setActiveModule={setActiveModule}
              isOpen={isSidebarOpen}
              toggle={() => setSidebarOpen(!isSidebarOpen)}
              currentUser={currentUser}
            />

            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
              <Header
                user={currentUser}
                onOpenCashierModal={() => setIsCashierModalOpen(true)}
                onCloseCashierModal={() => setIsCashierModalOpen(false)}
                isCashierOpen={cashierSession?.isOpen || false}
                activeModule={activeModule}
                onLogout={() => setCurrentUser(null)}
              />
              <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                {activeModule === Module.DASHBOARD && <DashboardView onNavigate={setActiveModule} />}
                {activeModule === Module.FINANCE && <FinanceView />}
                {activeModule === Module.POS && <POSView isCashierOpen={cashierSession.isOpen} onOpenCashier={() => setIsCashierModalOpen(true)} />}
                {activeModule === Module.USERS && <UserManagementView />}
                {activeModule === Module.COURTS && <CourtManagementView />}
                {activeModule === Module.INVENTORY && <InventoryView />}
                {activeModule === Module.CRM && <CRMView />}
                {activeModule === Module.REPORTS && <ReportsView />}
              </main>
            </div>
            <CashierInfoModal
              isOpen={isCashierInfoModalOpen}
              onClose={() => setIsCashierInfoModalOpen(false)}
              session={cashierSession}
            />
          </>
        )}
      </div>
    </QueryClientProvider>
  );
};

export default App;
