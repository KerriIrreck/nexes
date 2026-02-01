import React, { useEffect } from 'react';
import { useSocial } from '../context/SocialContext';
import { Heart, MessageCircle, UserPlus, Bell, Shield, Check, X, FileText, Mail } from 'lucide-react';

const Notifications: React.FC = () => {
  const { notifications, users, clans, currentUser, markNotificationsAsRead, respondToClanInvite, t } = useSocial();
  
  // Mark as read when component mounts
  useEffect(() => {
    markNotificationsAsRead();
  }, []);

  const myNotifications = notifications.filter(n => n.userId === currentUser?.id);

  if (myNotifications.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400 dark:text-zinc-500">
          <Bell size={40} />
        </div>
        <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">No notifications yet</h3>
        <p className="text-zinc-500 dark:text-zinc-400">When people interact with you, they'll appear here.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
        <Bell className="text-nexus-600" />
        {t('nav_notifs')}
      </h1>
      
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {myNotifications.map(notif => {
            const actor = users.find(u => u.id === notif.actorId);
            if (!actor) return null;

            let icon;
            let text;
            let action = null;
            
            switch (notif.type) {
              case 'LIKE':
                icon = <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full"><Heart size={16} fill="currentColor" /></div>;
                text = <span>{t('liked')}</span>;
                break;
              case 'COMMENT':
                icon = <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-500 rounded-full"><MessageCircle size={16} fill="currentColor" /></div>;
                text = <span>{t('commented')}</span>;
                break;
              case 'FOLLOW':
                icon = <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full"><UserPlus size={16} /></div>;
                text = <span>{t('followed')}</span>;
                break;
              case 'NEW_POST':
                icon = <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-500 rounded-full"><FileText size={16} /></div>;
                text = <span>published a new post</span>;
                break;
              case 'MESSAGE':
                icon = <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500 rounded-full"><Mail size={16} /></div>;
                text = <span>sent you a private message</span>;
                break;
              case 'CLAN_INVITE':
                const clan = clans.find(c => c.id === notif.clanId);
                icon = <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-500 rounded-full"><Shield size={16} /></div>;
                text = <span>{t('invited')} <strong>{clan?.name || 'a clan'}</strong></span>;
                // Only show actions if still pending
                if (clan && clan.invitedUserIds.includes(currentUser?.id || '')) {
                    action = (
                        <div className="flex gap-2 mt-2">
                            <button 
                                onClick={() => respondToClanInvite(clan.id, true)}
                                className="flex items-center gap-1 px-3 py-1 bg-nexus-600 text-white text-xs font-bold rounded-full hover:bg-nexus-700"
                            >
                                <Check size={12} /> Accept
                            </button>
                            <button 
                                onClick={() => respondToClanInvite(clan.id, false)}
                                className="flex items-center gap-1 px-3 py-1 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-full hover:bg-zinc-300 dark:hover:bg-zinc-600"
                            >
                                <X size={12} /> Decline
                            </button>
                        </div>
                    );
                } else if (clan && clan.members.includes(currentUser?.id || '')) {
                     action = <div className="text-xs text-green-600 font-medium mt-1">Accepted</div>
                } else {
                     action = <div className="text-xs text-zinc-400 font-medium mt-1">Expired or Declined</div>
                }
                break;
            }

            return (
              <div key={notif.id} className={`p-4 flex items-start gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${!notif.read ? 'bg-nexus-50/50 dark:bg-nexus-900/10' : ''}`}>
                <div className="flex-shrink-0 mt-1">
                  <img src={actor.avatar} alt={actor.name} className="w-10 h-10 rounded-full object-cover" />
                </div>
                
                <div className="flex-1">
                  <p className="text-sm text-zinc-800 dark:text-zinc-200">
                    <span className="font-semibold text-zinc-900 dark:text-white">{actor.name}</span> {text}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5">
                    {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                  {action}
                </div>
                
                <div className="flex-shrink-0">
                  {icon}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Notifications;