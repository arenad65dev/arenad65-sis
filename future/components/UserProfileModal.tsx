import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User } from '../types';

type SettingsTab = 'profile' | 'settings' | 'security';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SettingsTab;
  user: User | null;
  onUserUpdated: (user: User) => void;
}

import { authService } from '../services/authService';

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, initialTab = 'profile', user, onUserUpdated }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const [isSaving, setIsSaving] = useState(false);

  // Profile State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileImage, setProfileImage] = useState(user?.avatar || 'https://placehold.co/100x100?text=USER');

  // Preferences State
  const [notifications, setNotifications] = useState(user?.preferences?.notifications ?? true);
  const [sound, setSound] = useState(user?.preferences?.sound ?? true);
  const [weeklyReport, setWeeklyReport] = useState(user?.preferences?.weeklyReport ?? false);
  const [autoTheme, setAutoTheme] = useState(user?.preferences?.autoTheme ?? false);

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');


  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setProfileImage(user.avatar || 'https://placehold.co/100x100?text=USER');
      setNotifications(user.preferences?.notifications ?? true);
      setSound(user.preferences?.sound ?? true);
      setWeeklyReport(user.preferences?.weeklyReport ?? false);
      setAutoTheme(user.preferences?.autoTheme ?? false);
    }
  }, [user]);

  // Update profile image when user prop changes
  useEffect(() => {
    if (user?.avatar) {
      setProfileImage(user.avatar);
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedUser = await authService.updateProfile({
        name,
        email,
        avatar: profileImage,
        preferences: {
          notifications,
          sound,
          weeklyReport,
          autoTheme
        },
        ...(currentPassword && newPassword ? { currentPassword, newPassword } : {})
      });
      onUserUpdated(updatedUser);
      onClose();
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  const menuItems = [
    { id: 'profile', label: 'Meu Perfil', icon: 'person' },
    { id: 'settings', label: 'Preferências', icon: 'settings' },
    { id: 'security', label: 'Segurança', icon: 'security' },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[999] flex justify-center items-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md animate-fadeIn" onClick={onClose}></div>

      <div className="relative bg-white dark:bg-surface-dark w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden animate-fadeIn flex flex-col md:flex-row border border-white/10 h-[600px]">

        {/* Sidebar Interna */}
        <div className="w-full md:w-64 bg-slate-50/50 dark:bg-slate-900/30 border-r border-slate-100 dark:border-slate-800 p-8 flex flex-col gap-8">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-1">Conta</h3>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Configurações Pessoais</p>
          </div>

          <nav className="flex flex-col gap-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as SettingsTab)}
                className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all text-left ${activeTab === item.id
                  ? 'bg-primary text-slate-900 font-black shadow-lg shadow-primary/20'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
              >
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto p-5 bg-primary/5 rounded-3xl border border-primary/10">
            <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase leading-relaxed text-center">
              Arena D65 Enterprise<br />Sua conta é verificada
            </p>
          </div>
        </div>

        {/* Área de Conteúdo */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-surface-dark">
          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">

            {activeTab === 'profile' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex items-center gap-6">
                  <div className="relative group cursor-pointer" onClick={handleImageClick}>
                    <div className="size-24 rounded-[32px] overflow-hidden border-4 border-slate-50 dark:border-slate-800 shadow-xl group-hover:opacity-80 transition-all">
                      <img src={profileImage} className="w-full h-full object-cover" alt="Profile" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-[32px]">
                      <span className="material-symbols-outlined text-white text-3xl">photo_camera</span>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      className="hidden"
                      accept="image/*"
                    />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{user?.name || 'Usuário'}</h4>
                    <p className="text-[10px] text-primary font-black uppercase tracking-widest">{user?.role || 'Visitante'} • Ativo</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Nome de Exibição</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 text-xs font-black dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">E-mail de Contato</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 text-xs font-black dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Bio / Assinatura de OS</label>
                  <textarea rows={3} defaultValue={user?.department || 'Sem departamento definido.'} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 text-xs font-medium dark:text-white resize-none" />
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-8 animate-fadeIn">
                <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Preferências do Sistema</h4>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined">notifications</span>
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Notificações Push</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">Receber alertas de estoque e OS direto no navegador.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={notifications} onChange={(e) => setNotifications(e.target.checked)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined">volume_up</span>
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Sons de Alerta</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">Ativar sons para novos pedidos no PDV.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined">mail</span>
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Relatórios Semanais</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">Enviar resumo financeiro para meu e-mail aos domingos.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={weeklyReport} onChange={(e) => setWeeklyReport(e.target.checked)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined">dark_mode</span>
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Tema Escuro Automático</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">Alternar tema conforme horário do sistema.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={autoTheme} onChange={(e) => setAutoTheme(e.target.checked)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8 animate-fadeIn">
                <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Privacidade e Acesso</h4>

                <div className="p-8 bg-red-50 dark:bg-red-900/10 rounded-[32px] border border-red-100 dark:border-red-900/20 space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-red-500">lock_reset</span>
                    <h5 className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">Alterar Senha</h5>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="password"
                      placeholder="Senha Atual"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="px-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-red-500/20 text-xs font-black dark:text-white"
                    />
                    <input
                      type="password"
                      placeholder="Nova Senha"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="px-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-red-500/20 text-xs font-black dark:text-white"
                    />
                  </div>
                  <button className="px-6 py-3 bg-red-600 text-white font-black text-[9px] uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-red-600/20 active:scale-95 transition-all">Redefinir Credenciais</button>
                </div>
              </div>
            )}
          </div>

          <div className="p-10 border-t border-slate-100 dark:border-slate-800 flex gap-4 shrink-0 bg-slate-50/30 dark:bg-slate-900/10">
            <button
              onClick={onClose}
              className="px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-4 bg-primary text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              {isSaving ? (
                <div className="size-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="material-symbols-outlined text-lg">check_circle</span>
              )}
              {isSaving ? 'Salvando...' : 'Confirmar Alterações'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default UserProfileModal;
