import React from 'react';
import { NavigationTab } from '../types';
import { useSocial } from '../context/SocialContext';
import { Home, User, Shield, ShieldAlert, LogOut, Menu, Bell, Sun, Moon, Settings as SettingsIcon, MessageCircle, X, Search } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, logout, theme, toggleTheme, notifications, activeTab, setActiveTab, goToProfile, breathingEnabled, directMessages, t, toast, closeToast } = useSocial();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const unreadCount = notifications.filter(n => n.userId === currentUser?.id && !n.read).length;
  const unreadMessagesCount = directMessages.filter(m => m.receiverId === currentUser?.id && !m.read).length;

  const handleNavClick = (tab: NavigationTab) => {
    if (tab === 'profile' && currentUser) {
      goToProfile(currentUser.id); // Reset profile view to self when clicking nav item
    } else {
      setActiveTab(tab);
    }
    setMobileMenuOpen(false);
  };

  const NavItem = ({ tab, icon: Icon, label, badge }: { tab: NavigationTab; icon: any; label: string; badge?: number }) => {
    // Hide Admin tab if not admin
    if (tab === 'admin' && currentUser?.role !== 'ADMIN') return null;

    return (
      <button
        onClick={() => handleNavClick(tab)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors mb-1 ${
          activeTab === tab 
            ? 'bg-nexus-100 text-nexus-900 dark:bg-nexus-900 dark:text-white font-semibold' 
            : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-white'
        }`}
      >
        <div className="flex items-center space-x-3">
          <Icon size={20} className={activeTab === tab ? 'text-nexus-600 dark:text-nexus-400' : 'text-zinc-500 dark:text-zinc-400'} />
          <span>{label}</span>
        </div>
        {badge && badge > 0 ? (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{badge}</span>
        ) : null}
      </button>
    );
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative overflow-hidden">
      
      {/* Background Waves */}
      {breathingEnabled && (
          <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
              <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-400/20 dark:bg-purple-900/10 rounded-full blur-[100px] animate-blob mix-blend-multiply dark:mix-blend-screen"></div>
              <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-400/20 dark:bg-blue-900/10 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen" style={{ animationDelay: '2s' }}></div>
              <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-pink-400/20 dark:bg-pink-900/10 rounded-full blur-[100px] animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen" style={{ animationDelay: '4s' }}></div>
          </div>
      )}

      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex justify-between items-center sticky top-0 z-50 relative">
        <div className="font-bold text-xl text-nexus-600 dark:text-nexus-400">Nexes</div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <Menu size={24} className="text-zinc-700 dark:text-zinc-200" />
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 z-40 transform transition-transform duration-200 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6">
          <div className="text-2xl font-bold text-nexus-600 dark:text-nexus-400 mb-8 flex items-center gap-2">
            <div className="w-8 h-8 bg-nexus-600 rounded-lg flex items-center justify-center text-white text-lg">N</div>
            Nexes
          </div>

          <nav className="space-y-1">
            <NavItem tab="feed" icon={Home} label={t('nav_feed')} />
            <NavItem tab="search" icon={Search} label={t('nav_search')} />
            <NavItem tab="messages" icon={MessageCircle} label={t('nav_messages')} badge={unreadMessagesCount} />
            <NavItem tab="notifications" icon={Bell} label={t('nav_notifs')} badge={unreadCount} />
            <NavItem tab="profile" icon={User} label={t('nav_profile')} />
            <NavItem tab="clans" icon={Shield} label={t('nav_clans')} />
            <NavItem tab="admin" icon={ShieldAlert} label={t('nav_admin')} />
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
           {/* Settings Link */}
           <button 
             onClick={() => handleNavClick('settings')}
             className={`w-full flex items-center space-x-3 px-4 py-2 mb-2 text-sm rounded-lg transition-colors ${
                 activeTab === 'settings' 
                 ? 'text-nexus-600 dark:text-nexus-400 bg-nexus-50 dark:bg-nexus-900/20 font-medium' 
                 : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
             }`}
           >
             <SettingsIcon size={18} />
             <span>{t('nav_settings')}</span>
           </button>

          <div className="flex items-center justify-between mb-4 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Appearance</div>
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
          
          <div className="flex items-center space-x-3 mb-4 px-2">
            <img src={currentUser?.avatar} alt="User" className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-700" />
            <div className="flex-1 overflow-hidden">
              <p className="font-semibold text-sm text-zinc-900 dark:text-white truncate">{currentUser?.name}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{currentUser?.handle}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            <span>{t('nav_signout')}</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 min-w-0 relative z-10">
        {children}
      </main>

      {/* Push Notification (Toast) */}
      {toast && (
          <div className="fixed top-4 right-4 z-[60] animate-fade-in-up">
              <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 p-4 max-w-sm flex items-start gap-3">
                  {toast.icon ? (
                      <img src={toast.icon} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          toast.type === 'success' ? 'bg-green-100 text-green-600' : 
                          toast.type === 'error' ? 'bg-red-100 text-red-600' : 
                          'bg-nexus-100 text-nexus-600'
                      }`}>
                          <Bell size={20} />
                      </div>
                  )}
                  <div className="flex-1 pt-0.5">
                      <div className="font-semibold text-sm text-zinc-900 dark:text-white">{toast.title}</div>
                      <div className="text-sm text-zinc-500 dark:text-zinc-400 leading-snug">{toast.message}</div>
                  </div>
                  <button onClick={closeToast} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                      <X size={16} />
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default Layout;