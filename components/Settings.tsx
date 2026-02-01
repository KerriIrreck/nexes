import React, { useState } from 'react';
import { useSocial } from '../context/SocialContext';
import { Lock, Eye, Shield, Save, KeyRound, Wind, Globe, Database, Check } from 'lucide-react';
import { Language } from '../types';

const Settings: React.FC = () => {
  const { currentUser, changePassword, togglePrivacy, toggleBreathing, breathingEnabled, setLanguage, language, baseConnected, toggleBaseConnection, t } = useSocial();
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword !== confirmPassword) {
        setPasswordMsg({ type: 'error', text: "New passwords do not match." });
        return;
    }

    const result = changePassword(currentPassword, newPassword);
    if (result.success) {
        setPasswordMsg({ type: 'success', text: result.message });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    } else {
        setPasswordMsg({ type: 'error', text: result.message });
    }
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
        <Shield className="text-nexus-600" />
        {t('settings_title')}
      </h1>

      <div className="space-y-6">
        
        {/* Web3 / Base Integration */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2 relative z-10">
                <Database size={20} className="text-blue-500" /> Base (L2) Connection
            </h2>
            
            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg relative z-10">
                <div>
                    <div className="font-medium text-zinc-900 dark:text-white flex items-center gap-2">
                        {baseConnected ? 'Connected to Base Mainnet' : 'Connect Database to Base'}
                        {baseConnected && <Check size={14} className="text-green-500" />}
                    </div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        {baseConnected 
                            ? "New posts will be stamped with a unique transaction hash on the Base blockchain." 
                            : "Enable to sync your content timestamps to the Base blockchain."}
                    </div>
                </div>
                <button 
                    onClick={toggleBaseConnection}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        baseConnected ? 'bg-blue-600' : 'bg-zinc-200 dark:bg-zinc-700'
                    }`}
                >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        baseConnected ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                </button>
            </div>
            {baseConnected && (
                <div className="mt-3 text-xs font-mono text-zinc-400 pl-2">
                    Wallet: 0x71C...9A21 (Simulated)
                </div>
            )}
        </div>

        {/* Language Section */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                <Globe size={20} className="text-zinc-500" /> {t('lang_title')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                {(['en', 'es', 'fr', 'de', 'ja', 'ru'] as Language[]).map((lang) => (
                    <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                            language === lang 
                            ? 'bg-nexus-50 border-nexus-200 text-nexus-700 dark:bg-nexus-900/30 dark:border-nexus-800 dark:text-nexus-300' 
                            : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                        }`}
                    >
                        {lang === 'en' ? 'English' : lang === 'es' ? 'Español' : lang === 'fr' ? 'Français' : lang === 'de' ? 'Deutsch' : lang === 'ja' ? '日本語' : 'Русский'}
                    </button>
                ))}
            </div>
        </div>

        {/* Appearance Section */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                <Wind size={20} className="text-zinc-500" /> Appearance
            </h2>
            
            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                <div>
                    <div className="font-medium text-zinc-900 dark:text-white">{t('breathing_title')}</div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        {breathingEnabled 
                            ? "Background animates subtly." 
                            : "Background is static."}
                    </div>
                </div>
                <button 
                    onClick={toggleBreathing}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-nexus-500 focus:ring-offset-2 ${
                        breathingEnabled ? 'bg-nexus-600' : 'bg-zinc-200 dark:bg-zinc-700'
                    }`}
                >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        breathingEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                </button>
            </div>
        </div>

        {/* Privacy Section */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                <Eye size={20} className="text-zinc-500" /> Privacy & Visibility
            </h2>
            
            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                <div>
                    <div className="font-medium text-zinc-900 dark:text-white">{t('privacy_title')}</div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        {currentUser.isPrivate 
                            ? "Only followers can see your posts." 
                            : "Anyone can see your posts."}
                    </div>
                </div>
                <button 
                    onClick={togglePrivacy}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-nexus-500 focus:ring-offset-2 ${
                        currentUser.isPrivate ? 'bg-nexus-600' : 'bg-zinc-200 dark:bg-zinc-700'
                    }`}
                >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        currentUser.isPrivate ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                </button>
            </div>
        </div>

        {/* Security Section */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                <Lock size={20} className="text-zinc-500" /> {t('security_title')}
            </h2>
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Current Password</label>
                    <div className="relative">
                        <KeyRound size={16} className="absolute left-3 top-3 text-zinc-400" />
                        <input 
                            type="password" 
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-nexus-500"
                        />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">New Password</label>
                        <input 
                            type="password" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-nexus-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Confirm New Password</label>
                        <input 
                            type="password" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-nexus-500"
                        />
                    </div>
                </div>

                {passwordMsg && (
                    <div className={`text-sm p-2 rounded ${passwordMsg.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {passwordMsg.text}
                    </div>
                )}

                <div className="flex justify-end pt-2">
                    <button 
                        type="submit" 
                        className="bg-nexus-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-nexus-700 flex items-center gap-2"
                    >
                        <Save size={18} /> {t('save')}
                    </button>
                </div>
            </form>
        </div>

      </div>
    </div>
  );
};

export default Settings;