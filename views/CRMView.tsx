
import React, { useState, useMemo } from 'react';
import { MOCK_USERS } from '../constants';
import { User } from '../types';
import NotificationModal from '../components/NotificationModal';
import AddAthleteModal from '../components/AddAthleteModal';
import AthleteProfileModal from '../components/AthleteProfileModal';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell } from 'recharts';

interface Toast {
  id: number;
  message: string;
}

const CRMView: React.FC = () => {
  const [athletes, setAthletes] = useState<User[]>(MOCK_USERS);
  const [selectedUser, setSelectedUser] = useState<User>(MOCK_USERS[0]);
  const [activeTab, setActiveTab] = useState('Todos');
  const [search, setSearch] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  // Configurações de Fidelidade (Estado Simulado)
  const [crmSettings, setCrmSettings] = useState({
    pointsPerReal: 1,
    pointsPerVisit: 10,
    birthdayBonus: 50,
    silverThreshold: 1000,
    goldThreshold: 5000,
    autoNotifyBirthday: true
  });

  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Modal States
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [isAddAthleteModalOpen, setIsAddAthleteModalOpen] = useState(false);
  const [isAthleteProfileOpen, setIsAthleteProfileOpen] = useState(false);
  const [notifyType, setNotifyType] = useState<'BIRTHDAY' | 'CHURN' | 'GENERAL'>('GENERAL');

  const addToast = (message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const currentMonth = new Date().getMonth() + 1;

  const filteredUsers = useMemo(() => {
    return athletes.filter(user => {
      const matchSearch = user.name.toLowerCase().includes(search.toLowerCase()) || user.id.includes(search);
      
      let matchTab = true;
      if (activeTab === 'Nível Ouro') matchTab = user.level === 'Ouro';
      else if (activeTab === 'Nível Prata') matchTab = user.level === 'Prata';
      else if (activeTab === 'Nível Bronze') matchTab = user.level === 'Bronze';
      else if (activeTab === 'Inativos') matchTab = (user.lastActivityDays || 0) >= 15;
      else if (activeTab === 'Aniversariantes') {
        const birthMonth = user.birthday ? parseInt(user.birthday.split('-')[0]) : 0;
        matchTab = birthMonth === currentMonth;
      }
      
      return matchSearch && matchTab;
    });
  }, [search, activeTab, currentMonth, athletes]);

  const stats = useMemo(() => {
    const totalLTV = athletes.reduce((acc, u) => acc + (u.totalSpent || 0), 0);
    const churnRisk = athletes.filter(u => (u.lastActivityDays || 0) >= 15).length;
    const birthdays = athletes.filter(u => {
      const m = u.birthday ? parseInt(u.birthday.split('-')[0]) : 0;
      return m === currentMonth;
    }).length;
    return { totalLTV, churnRisk, birthdays };
  }, [currentMonth, athletes]);

  const handleNotify = (data: any) => {
    addToast(`Notificação enviada para ${selectedUser.name}!`);
  };

  const handleAddAthlete = (newAthlete: Partial<User>) => {
    const athleteWithId: User = {
      ...newAthlete,
      id: Math.floor(Math.random() * 90000 + 10000).toString()
    } as User;
    
    setAthletes(prev => [athleteWithId, ...prev]);
    setSelectedUser(athleteWithId);
    addToast(`Atleta ${newAthlete.name} cadastrado com sucesso!`);
  };

  const saveCrmSettings = () => {
    setIsSavingSettings(true);
    setTimeout(() => {
      setIsSavingSettings(false);
      addToast("Configurações de fidelidade atualizadas!");
      setActiveTab('Todos');
    }, 1000);
  };

  const handleGenerateReport = () => {
    setIsGeneratingReport(true);
    setTimeout(() => {
      setIsGeneratingReport(false);
      addToast(`Relatório de ${selectedUser.name} gerado com sucesso! (PDF)`);
    }, 2000);
  };

  const openNotify = (type: 'BIRTHDAY' | 'CHURN' | 'GENERAL') => {
    setNotifyType(type);
    setIsNotifyModalOpen(true);
  };

  const isUserBirthday = selectedUser.birthday && parseInt(selectedUser.birthday.split('-')[0]) === currentMonth;
  const isUserInactive = (selectedUser.lastActivityDays || 0) >= 15;

  const frequencyData = [
    { day: 'SEG', value: 40 },
    { day: 'TER', value: 70 },
    { day: 'QUA', value: 20 },
    { day: 'QUI', value: 90 },
    { day: 'SEX', value: 100 },
    { day: 'SÁB', value: 60 },
    { day: 'DOM', value: 30 },
  ];

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden animate-fadeIn relative pb-12">
      
      {/* Toasts */}
      <div className="fixed top-20 right-8 z-[250] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="px-6 py-4 bg-slate-900 text-white dark:bg-primary dark:text-slate-900 rounded-2xl shadow-2xl flex items-center gap-3 animate-fadeIn border border-white/10 pointer-events-auto">
            <span className="material-symbols-outlined text-lg">campaign</span>
            <span className="text-[10px] font-black uppercase tracking-widest">{t.message}</span>
          </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        {/* KPIs CRM */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
          <div className="p-6 bg-white dark:bg-surface-dark rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-primary/20">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Potencial LTV Total</p>
             <p className="text-2xl font-black dark:text-white">R$ {stats.totalLTV.toLocaleString()}</p>
          </div>
          <div className="p-6 bg-white dark:bg-surface-dark rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Alertas de Churn</p>
             <p className="text-2xl font-black text-red-500">{stats.churnRisk} Atletas</p>
          </div>
          <div className="p-6 bg-white dark:bg-surface-dark rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Aniversariantes do Mês</p>
             <p className="text-2xl font-black text-primary-blue">{stats.birthdays} Celebrando</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-black tracking-tight dark:text-white leading-none">
              {activeTab === 'Configurações' ? 'Ajustes de Pontuação' : 'CRM e Fidelidade'}
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              {activeTab === 'Configurações' ? 'Configure as regras de gameficação.' : 'Gestão Proativa de Atletas.'}
            </p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input 
                type="text"
                placeholder="Buscar Atleta..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all dark:text-white text-sm font-medium shadow-sm"
              />
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setActiveTab(activeTab === 'Configurações' ? 'Todos' : 'Configurações')}
                className={`size-12 rounded-2xl border transition-all flex items-center justify-center group ${
                  activeTab === 'Configurações' 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent' 
                  : 'bg-white dark:bg-surface-dark border-slate-200 dark:border-slate-800 text-slate-500 hover:text-primary'
                }`}
                title="Configurações de Fidelidade"
              >
                <span className={`material-symbols-outlined transition-transform duration-500 ${activeTab === 'Configurações' ? 'rotate-180' : 'group-hover:rotate-90'}`}>
                  {activeTab === 'Configurações' ? 'arrow_back' : 'settings'}
                </span>
              </button>

              <button 
                onClick={() => setIsAddAthleteModalOpen(true)}
                className="h-12 px-6 bg-primary text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 shrink-0"
              >
                <span className="material-symbols-outlined text-[20px]">person_add</span>
                Novo Atleta
              </button>
            </div>
          </div>
        </div>

        <div className="p-2 bg-white dark:bg-surface-dark rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex gap-1 overflow-x-auto scrollbar-hide shrink-0">
          {['Todos', 'Nível Ouro', 'Nível Prata', 'Nível Bronze', 'Inativos', 'Aniversariantes'].map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border shrink-0 ${
                activeTab === tab ? 'bg-primary text-slate-900 border-transparent shadow-lg shadow-primary/10' : 'text-slate-400 border-transparent hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto bg-white dark:bg-surface-dark rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm custom-scrollbar">
          {activeTab === 'Configurações' ? (
            /* PAINEL DE CONFIGURAÇÕES DO CRM */
            <div className="p-10 space-y-10 animate-fadeIn">
              <div className="flex items-center gap-4 mb-2">
                <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl font-black">loyalty</span>
                </div>
                <div>
                  <h3 className="text-2xl font-black dark:text-white uppercase tracking-tight">Regras do Programa</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Defina como seus atletas ganham pontos e sobem de nível</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Atribuição de Pontos */}
                <div className="space-y-6 p-8 bg-slate-50/50 dark:bg-slate-900/50 rounded-[32px] border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">add_circle</span>
                    <h4 className="text-xs font-black dark:text-white uppercase tracking-widest">Ganho de Pontos</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Pontos por R$ 1,00 Gasto (Bar/Quadras)</label>
                      <input 
                        type="number" 
                        value={crmSettings.pointsPerReal}
                        onFocus={handleFocus}
                        onChange={(e) => setCrmSettings({...crmSettings, pointsPerReal: parseInt(e.target.value) || 0})}
                        className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 text-sm font-black dark:text-white transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Pontos por Presença (Check-in)</label>
                      <input 
                        type="number" 
                        value={crmSettings.pointsPerVisit}
                        onFocus={handleFocus}
                        onChange={(e) => setCrmSettings({...crmSettings, pointsPerVisit: parseInt(e.target.value) || 0})}
                        className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 text-sm font-black dark:text-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Automações */}
                <div className="space-y-6 p-8 bg-slate-50/50 dark:bg-slate-900/50 rounded-[32px] border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary-blue">auto_awesome</span>
                    <h4 className="text-xs font-black dark:text-white uppercase tracking-widest">Automações</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Bônus de Aniversário (Pontos)</label>
                      <input 
                        type="number" 
                        value={crmSettings.birthdayBonus}
                        onFocus={handleFocus}
                        onChange={(e) => setCrmSettings({...crmSettings, birthdayBonus: parseInt(e.target.value) || 0})}
                        className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 text-sm font-black dark:text-white transition-all"
                      />
                    </div>
                    <div className="flex items-center justify-between p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Notificação Automática</span>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">Avisar aniversariantes no dia</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={crmSettings.autoNotifyBirthday}
                          onChange={(e) => setCrmSettings({...crmSettings, autoNotifyBirthday: e.target.checked})}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tiers de Nível */}
              <div className="p-8 bg-slate-50/50 dark:bg-slate-900/50 rounded-[32px] border border-slate-100 dark:border-slate-800 space-y-8">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">trending_up</span>
                  <h4 className="text-xs font-black dark:text-white uppercase tracking-widest">Progressão de Nível (Pontuação Mínima)</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-2">
                      <span className="size-2 rounded-full bg-slate-400"></span> Nível Prata
                    </label>
                    <input 
                      type="number" 
                      value={crmSettings.silverThreshold}
                      onFocus={handleFocus}
                      onChange={(e) => setCrmSettings({...crmSettings, silverThreshold: parseInt(e.target.value) || 0})}
                      className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 text-sm font-black dark:text-white transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-yellow-500 uppercase tracking-widest ml-2 flex items-center gap-2">
                      <span className="size-2 rounded-full bg-yellow-500"></span> Nível Ouro
                    </label>
                    <input 
                      type="number" 
                      value={crmSettings.goldThreshold}
                      onFocus={handleFocus}
                      onChange={(e) => setCrmSettings({...crmSettings, goldThreshold: parseInt(e.target.value) || 0})}
                      className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 text-sm font-black dark:text-white transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-4">
                <button 
                  onClick={() => setActiveTab('Todos')}
                  className="px-8 py-5 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-600 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={saveCrmSettings}
                  disabled={isSavingSettings}
                  className="px-12 py-5 bg-primary text-slate-900 font-black text-xs uppercase tracking-widest rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3"
                >
                  {isSavingSettings ? (
                    <div className="size-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span className="material-symbols-outlined">save</span>
                  )}
                  {isSavingSettings ? "Salvando..." : "Salvar Configurações"}
                </button>
              </div>
            </div>
          ) : (
            /* LISTA DE ATLETAS */
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 sticky top-0 z-10">
                  <th className="px-8 py-5">Atleta</th>
                  <th className="px-6 py-5">Nível</th>
                  <th className="px-6 py-5 text-right">Saldo</th>
                  <th className="px-6 py-5 text-right">LTV</th>
                  <th className="px-8 py-5 text-right">Status Inat.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map(user => (
                  <tr 
                    key={user.id} 
                    onClick={() => setSelectedUser(user)}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer group ${selectedUser.id === user.id ? 'bg-primary/5' : ''}`}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="size-12 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 ring-2 ring-transparent group-hover:ring-primary transition-all">
                            <img src={user.avatar} className="w-full h-full object-cover" />
                          </div>
                          {user.lastActivityDays! >= 15 && (
                             <div className="absolute -top-1 -right-1 size-4 bg-red-500 border-2 border-white dark:border-surface-dark rounded-full"></div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-sm font-black dark:text-white transition-colors ${selectedUser.id === user.id ? 'text-primary' : ''}`}>
                            {user.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">#{user.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                        user.level === 'Ouro' ? 'bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-500 dark:border-yellow-900/40' : 
                        user.level === 'Prata' ? 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' : 
                        'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/30 dark:text-orange-500 dark:border-orange-900/40'
                      }`}>
                        {user.level}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-right text-sm font-black dark:text-slate-200">{user.points} pts</td>
                    <td className="px-6 py-6 text-right text-sm font-black text-primary-blue">R$ {user.totalSpent?.toLocaleString()}</td>
                    <td className="px-8 py-6 text-right">
                      <span className={`text-[11px] font-black ${user.lastActivityDays! >= 15 ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>
                          {user.lastActivityDays === 0 ? 'Hoje' : `${user.lastActivityDays}d`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <aside className="w-full lg:w-[420px] bg-white dark:bg-surface-dark rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto flex flex-col p-10 custom-scrollbar relative shrink-0">
        
        {/* Banner de Contexto */}
        {(isUserBirthday || isUserInactive) && (
          <div className={`absolute top-0 left-0 right-0 py-3 px-8 text-center text-[9px] font-black uppercase tracking-widest animate-pulse ${isUserBirthday ? 'bg-primary text-slate-900' : 'bg-red-500 text-white'}`}>
            {isUserBirthday ? 'Aniversariante do Mês! 🎂' : 'Atleta em Risco de Churn ⚠️'}
          </div>
        )}

        <div className={`flex flex-col items-center mb-10 ${isUserBirthday || isUserInactive ? 'mt-8' : ''}`}>
          <div className="relative mb-6">
            <div className="size-32 rounded-[40px] overflow-hidden border-4 border-white dark:border-surface-dark shadow-2xl ring-2 ring-primary">
              <img src={selectedUser.avatar} className="w-full h-full object-cover" />
            </div>
          </div>
          <h3 className="text-3xl font-black tracking-tighter text-center dark:text-white leading-none mb-2">{selectedUser.name}</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-8">Atleta {selectedUser.level} • {selectedUser.points} Pontos</p>
          
          <div className="grid grid-cols-2 gap-3 w-full">
            <button 
              onClick={() => openNotify(isUserBirthday ? 'BIRTHDAY' : isUserInactive ? 'CHURN' : 'GENERAL')}
              className="h-14 bg-primary text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-lg">campaign</span>
              Notificar
            </button>
            <button 
              onClick={() => setIsAthleteProfileOpen(true)}
              className="h-14 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-black text-[10px] uppercase tracking-widest rounded-2xl dark:text-white hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">account_circle</span>
              Perfil
            </button>
          </div>
        </div>

        <div className="space-y-10 flex-1">
          <div>
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg text-primary">monitoring</span>
              Frequência Semanal
            </h4>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={frequencyData}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 'bold' }} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '10px' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={24}>
                    {frequencyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.value > 80 ? '#13ec5b' : '#13ec5b33'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg text-primary-blue">history_edu</span>
              Timeline Recente
            </h4>
            <div className="space-y-6 pl-4 border-l-2 border-slate-100 dark:border-slate-800 ml-2">
              {[
                { title: 'Check-in Realizado', time: 'Hoje, 10:00 - Quadra Areia', icon: 'sports_tennis', color: 'green' },
                { title: 'Consumo Bar (POS)', time: 'Ontem, 19:45 - R$ 45,00', icon: 'local_bar', color: 'slate' },
                { title: 'Upgrade de Nível', time: '10 Out, 15:00 (+150 pts)', icon: 'trending_up', color: 'primary' },
              ].map((h, i) => (
                <div key={i} className="relative group">
                  <div className={`absolute -left-[27px] top-1 size-5 rounded-full border-4 border-white dark:border-surface-dark shadow-md flex items-center justify-center ${
                    h.color === 'green' ? 'bg-green-500' : h.color === 'primary' ? 'bg-primary text-slate-900' : 'bg-slate-400'
                  }`}>
                     <span className="material-symbols-outlined text-[10px] font-black text-white dark:text-slate-900">{h.icon}</span>
                  </div>
                  <p className="text-[11px] font-black dark:text-slate-200 uppercase tracking-tight mb-0.5">{h.title}</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">{h.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800">
           <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lifetime Value</span>
              <span className="text-xl font-black text-primary-blue">R$ {selectedUser.totalSpent?.toLocaleString()}</span>
           </div>
          <button 
            onClick={handleGenerateReport}
            disabled={isGeneratingReport}
            className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[24px] font-black text-[11px] uppercase tracking-widest shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {isGeneratingReport ? (
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined">description</span>
            )}
            {isGeneratingReport ? 'Processando...' : 'Gerar Relatório de Fidelidade'}
          </button>
        </div>
      </aside>

      {/* Modals */}
      <NotificationModal 
        isOpen={isNotifyModalOpen}
        onClose={() => setIsNotifyModalOpen(false)}
        targetUser={selectedUser}
        onSend={handleNotify}
        type={notifyType}
      />

      <AddAthleteModal 
        isOpen={isAddAthleteModalOpen}
        onClose={() => setIsAddAthleteModalOpen(false)}
        onSave={handleAddAthlete}
      />

      <AthleteProfileModal 
        isOpen={isAthleteProfileOpen}
        onClose={() => setIsAthleteProfileOpen(false)}
        athlete={selectedUser}
      />
    </div>
  );
};

export default CRMView;
