
import React, { useState } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface LoginViewProps {
    onLogin: (user: User) => void;
}



const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const { user } = await authService.login(email, password);
            onLogin(user);
        } catch (err: any) {
            console.error(err);
            if (err.response) {
                setError(err.response.data.message || 'Erro no servidor: ' + err.response.status);
            } else if (err.request) {
                setError('Erro de conexão. Verifique se o backend está rodando.');
            } else {
                setError('Erro desconhecido: ' + err.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full flex min-h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">

            {/* Branding Column (Left) */}
            <div className="hidden lg:flex w-[50%] relative overflow-hidden bg-primary dark:bg-primary-dark items-center justify-center p-12 shrink-0">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542144582-130d44648b90?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary-dark/95 z-0"></div>

                <div className="relative z-10 flex flex-col items-center text-center">
                    <img
                        src="./logo_arena_transp.png"
                        alt="Arena D65 Logo"
                        className="w-full max-w-[400px] object-contain drop-shadow-2xl mb-8 animate-fadeIn"
                    />
                    <div className="space-y-4 max-w-lg">
                        <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-tight">
                            Arena D65 <br /> <span className="text-primary-blue bg-white px-2 py-0.5 rounded-lg">Gestão Empresarial</span>
                        </h2>
                        <p className="text-white/80 font-medium text-lg">
                            Plataforma completa para gestão de complexos esportivos.
                        </p>
                    </div>
                </div>
            </div>

            {/* Login Form Column (Right) */}
            <div className="w-full lg:w-[50%] flex items-center justify-center p-8 lg:p-12 relative shrink-0">
                <div className="w-full max-w-md space-y-8 animate-fadeIn">

                    <div className="text-center lg:text-left">
                        <div className="lg:hidden flex justify-center mb-6">
                            <img src="./logo_arena_cor.png" alt="Arena D65" className="h-16 object-contain" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Bem-vindo de volta</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Faça login para acessar o painel de controle.</p>
                    </div>



                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100 animate-fadeIn">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider pl-1">Email Corporativo</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="exemplo@arenad65.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center pl-1">
                                <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Senha</label>
                                <a href="#" className="text-xs font-bold text-primary hover:text-primary-dark transition-colors">Esqueceu a senha?</a>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-black uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-slate-900/10"
                        >
                            {isLoading ? 'Autenticando...' : 'Acessar Painel'}
                        </button>
                    </form>

                </div>
            </div>

        </div>
    );
};

export default LoginView;

