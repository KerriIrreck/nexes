import React from 'react';
import { SocialProvider, useSocial } from './context/SocialContext';
import Layout from './components/Layout';
import Feed from './components/Feed';
import Profile from './components/Profile';
import Clans from './components/Clans';
import AdminPanel from './components/AdminPanel';
import Notifications from './components/Notifications';
import Settings from './components/Settings';
import Auth from './components/Auth';
import Messages from './components/Messages';
import Search from './components/Search';

const AppContent: React.FC = () => {
  const { currentUser, activeTab } = useSocial();

  if (!currentUser) {
    return <Auth />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'feed': return <Feed />;
      case 'search': return <Search />;
      case 'profile': return <Profile />;
      case 'clans': return <Clans />;
      case 'messages': return <Messages />;
      case 'admin': return <AdminPanel />;
      case 'notifications': return <Notifications />;
      case 'settings': return <Settings />;
      default: return <Feed />;
    }
  };

  return (
    <Layout>
      {renderContent()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <SocialProvider>
      <AppContent />
    </SocialProvider>
  );
};

export default App;
