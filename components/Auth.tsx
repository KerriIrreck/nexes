import React, { useState } from 'react';
import { useSocial } from '../context/SocialContext';
import { KeyRound, Mail, Smartphone, ArrowRight, User, AtSign, Camera, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { fileToBase64 } from '../context/SocialContext';

type AuthView = 'login' | 'register' | 'forgot_password';

const Auth: React.FC = () => {
  const { login, register, breathingEnabled, t } = useSocial();
  const [view, setView] = useState<AuthView>('login');
  
  // Login/Register State
  const [identifier, setIdentifier] = useState(''); // Email or UZU
  const [password, setPassword] = useState('');
  
  // Registration specific state
  const [email, setEmail] = useState(''); // Separated for register
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [avatar, setAvatar] = useState<string>('');

  // Forgot Password specific state
  const [resetSent, setResetSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (view === 'forgot_password') {
        handleResetPassword();
        return;
    }

    if (view === 'register') {
        if (!email || !password || !name || !handle) {
            alert("Please fill in all profile details.");
            return;
        }
        // Attempt registration
        const result = register(email, name, handle, avatar, password);
        if (!result.success) {
            alert(result.message); 
        }
    } else {
        // Login
        if (!identifier) return;
        const result = login(identifier, password);
        if (!result.success) {
            alert(result.message);
        }
    }
  };

  const handleResetPassword = () => {
    if (!identifier) return;
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
        setIsLoading(false);
        setResetSent(true);
    }, 1500);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const base64 = await fileToBase64(e.target.files[0]);
      setAvatar(base64);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors ${breathingEnabled ? 'breathing-bg' : 'bg-zinc-100 dark:bg-zinc-950'}`}>
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-xl w-full max-w-md transition-all duration-300 border border-zinc-200 dark:border-zinc-800">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-nexus-600 rounded-2xl mx-auto flex items-center justify-center mb-4 text-white text-3xl font-bold transform rotate-3 shadow-lg shadow-nexus-200 dark:shadow-none">
            N
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {view === 'register' ? t('signup') : view === 'forgot_password' ? 'Reset Password' : t('welcome')}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">
            {view === 'forgot_password' ? 'Enter your email to receive instructions.' : t('login_subtitle')}
          </p>
        </div>

        {/* FORGOT PASSWORD SUCCESS VIEW */}
        {view === 'forgot_password' && resetSent ? (
            <div className="text-center animate-fade-in">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} className="text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">Check your email</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                    We've sent a password reset link to <span className="font-medium text-zinc-800 dark:text-zinc-200">{identifier}</span>
                </p>
                <button 
                    onClick={() => {
                        setView('login');
                        setResetSent(false);
                        setIdentifier('');
                    }}
                    className="w-full bg-nexus-600 text-white py-2.5 rounded-lg font-semibold hover:bg-nexus-700 transition-colors"
                >
                    Back to Sign In
                </button>
            </div>
        ) : (
            /* MAIN FORM */
            <form onSubmit={handleSubmit} className="space-y-4">
            
            {view === 'register' && (
                <div className="space-y-4 animate-fade-in">
                    <div className="flex justify-center mb-2">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full bg-zinc-100 dark:bg-zinc-800 border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center overflow-hidden">
                                {avatar ? (
                                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={32} className="text-zinc-400" />
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 bg-nexus-600 text-white p-2 rounded-full cursor-pointer hover:bg-nexus-700 shadow-sm transition-transform hover:scale-105">
                                <Camera size={16} />
                                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Display Name</label>
                        <div className="relative">
                            <div className="absolute left-3 top-2.5 text-zinc-400"><User size={18} /></div>
                            <input 
                                type="text" 
                                required={view === 'register'}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-nexus-500"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">UZU Handle</label>
                        <div className="relative">
                            <div className="absolute left-3 top-2.5 text-zinc-400"><AtSign size={18} /></div>
                            <input 
                                type="text" 
                                required={view === 'register'}
                                value={handle}
                                onChange={(e) => setHandle(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-nexus-500"
                                placeholder="johndoe"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Email Address</label>
                        <div className="relative">
                            <div className="absolute left-3 top-2.5 text-zinc-400"><Mail size={18} /></div>
                            <input 
                                type="email" 
                                required={view === 'register'}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-nexus-500"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Login Identifier Field */}
            {view !== 'register' && (
                <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    {view === 'forgot_password' ? 'Email Address' : 'UZU Handle or Email'}
                    </label>
                    <div className="relative">
                    <div className="absolute left-3 top-2.5 text-zinc-400">
                        <User size={18} />
                    </div>
                    <input 
                        type="text" 
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-nexus-500"
                        placeholder={view === 'forgot_password' ? 'you@example.com' : '@handle or email'}
                    />
                    </div>
                </div>
            )}

            {view !== 'forgot_password' && (
                <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Password</label>
                    <div className="relative">
                    <div className="absolute left-3 top-2.5 text-zinc-400">
                        <KeyRound size={18} />
                    </div>
                    <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-nexus-500"
                        placeholder="••••••••"
                    />
                    </div>
                    {view === 'login' && (
                        <div className="flex justify-end mt-1">
                            <button 
                                type="button"
                                onClick={() => setView('forgot_password')}
                                className="text-xs text-nexus-600 dark:text-nexus-400 hover:underline"
                            >
                                Forgot Password?
                            </button>
                        </div>
                    )}
                </div>
            )}

            <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-nexus-600 text-white py-2.5 rounded-lg font-semibold hover:bg-nexus-700 transition-colors flex items-center justify-center gap-2 group shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    'Processing...'
                ) : (
                    <>
                        {view === 'register' ? t('signup') : view === 'forgot_password' ? 'Send Reset Link' : t('signin')}
                        {view !== 'forgot_password' && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                    </>
                )}
            </button>

            {view === 'forgot_password' && (
                <button 
                    type="button"
                    onClick={() => setView('login')}
                    className="w-full text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 text-sm font-medium flex items-center justify-center gap-2 mt-2"
                >
                    <ArrowLeft size={16} />
                    Back to Sign In
                </button>
            )}
            </form>
        )}

        {view !== 'forgot_password' && (
            <div className="mt-6 text-center text-sm border-t border-zinc-100 dark:border-zinc-800 pt-4">
            <span className="text-zinc-500 dark:text-zinc-400">
                {view === 'register' ? 'Already have an account?' : "Don't have an account?"}
            </span>
            <button 
                onClick={() => {
                    setView(view === 'register' ? 'login' : 'register');
                }}
                className="ml-2 text-nexus-600 dark:text-nexus-400 font-medium hover:underline"
            >
                {view === 'register' ? t('signin') : t('signup')}
            </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default Auth;