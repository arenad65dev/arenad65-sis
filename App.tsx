
import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Module, CashierSession, User } from './types';
import Sidebar from './components/Sidebar';
import { Header } from './components/Header';
import DashboardView from './views/DashboardView';
import POSView from './views/POSView';
import InventoryView from './views/InventoryView';
import LoginView from './views/LoginView';
import UserManagementView from './views/UserManagementView';
import { authService } from './services/authService';
import { cashierService } from './services/cashierService';
import CashierInfoModal from './components/CashierInfoModal';
import CashierModal from './components/CashierModal';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(authService.getCurrentUser());
  const [activeModule, setActiveModule] = useState<Module>(Module.DASHBOARD);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isCashierModalOpen, setIsCashierModalOpen] = useState(false);
  const [isCashierInfoModalOpen, setIsCashierInfoModalOpen] = useState(false);



  const [cashierSession, setCashierSession] = useState<CashierSession | null>(null);

  useEffect(() => {
    document.documentElement.className = theme;
    document.body.className = theme === 'dark' ? 'bg-background-dark overflow-hidden h-screen' : 'bg-background-light overflow-hidden h-screen';
  }, [theme]);

  // Auto-close sidebar on mobile when navigating
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [activeModule]);

  // Check for current cashier session on app load
  useEffect(() => {
    const checkCurrentSession = async () => {
      if (currentUser) {
        try {
          const session = await cashierService.getCurrentSession();
          setCashierSession(session);
        } catch (error) {
          console.error('Error checking current session:', error);
        }
      }
    };

    checkCurrentSession();
  }, [currentUser]);

  const handleOpenCashier = async (initialBalance: number) => {
    try {
      const result = await cashierService.openCashier(initialBalance);
      setCashierSession(result.session);
      setIsCashierInfoModalOpen(true);
    } catch (error) {
      console.error('Error opening cashier:', error);
      // Handle error (show toast, etc.)
    }
  };

  const handleCloseCashier = async () => {
    if (!cashierSession) return;
    
    try {
      // For now, we'll close without final balance
      // In a real implementation, you might want to show a modal to input final balance
      await cashierService.closeCashier(cashierSession.id, 0);
      setCashierSession(null);
    } catch (error) {
      console.error('Error closing cashier:', error);
      // Handle error
    }
  };

  const handleRecordSkimming = async (amount: number, reason: string) => {
    try {
      const result = await cashierService.recordSkimming(amount, reason);
      setCashierSession(result.session);
    } catch (error) {
      console.error('Error recording skimming:', error);
      // Handle error
    }
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
                toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
                onOpenCashierModal={() => setIsCashierModalOpen(true)}
                isCashierOpen={!!cashierSession}
                activeModule={activeModule}
                setActiveModule={setActiveModule}
                theme={theme}
                toggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
                onLogout={() => {
                  authService.logout();
                  setCurrentUser(null);
                }}
              />
              <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                {activeModule === Module.DASHBOARD && <DashboardView onNavigate={setActiveModule} />}
                {activeModule === Module.POS && <POSView isCashierOpen={!!cashierSession} onOpenCashier={() => setIsCashierModalOpen(true)} />}
                {activeModule === Module.INVENTORY && <InventoryView />}
                {activeModule === Module.USERS && <UserManagementView />}
                {activeModule === Module.FINANCE && <div className="p-8"><h1>Financeiro</h1><p>Em desenvolvimento...</p></div>}
                {activeModule === Module.MAINTENANCE && <div className="p-8"><h1>Manutenção</h1><p>Em desenvolvimento...</p></div>}
                {activeModule === Module.CRM && <div className="p-8"><h1>CRM</h1><p>Em desenvolvimento...</p></div>}
              </main>
            </div>
            <CashierInfoModal
              isOpen={isCashierInfoModalOpen}
              onClose={() => setIsCashierInfoModalOpen(false)}
              session={cashierSession || undefined}
            />
            <CashierModal
              isOpen={isCashierModalOpen}
              onClose={() => setIsCashierModalOpen(false)}
              isCashierOpen={!!cashierSession}
              session={cashierSession}
              onConfirm={(balance) => handleOpenCashier(balance)}
              onToggle={handleCloseCashier}
              onRecordSkimming={handleRecordSkimming}
            />
          </>
        )}
      </div>
    </QueryClientProvider>
  );
};

export default App;
