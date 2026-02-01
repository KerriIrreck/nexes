import React from 'react';
import { useSocial } from '../context/SocialContext';
import { UserRole } from '../types';
import { ShieldAlert, Trash2, Ban, Users, FileText, Shield, UserX, TrendingUp, Activity, MessageSquare } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const { currentUser, users, posts, clans, deletePost, banUser, t, directMessages } = useSocial();

  // Calculate Statistics
  const totalUsers = users.length;
  const totalPosts = posts.length;
  const totalClans = clans.length;
  const bannedUsers = users.filter(u => u.isBanned).length;
  const newUsersToday = users.filter(u => {
      const today = new Date();
      const joined = new Date(u.joinedAt);
      return joined.getDate() === today.getDate() &&
             joined.getMonth() === today.getMonth() &&
             joined.getFullYear() === today.getFullYear();
  }).length;

  if (currentUser?.role !== UserRole.ADMIN) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <ShieldAlert size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-zinc-800 dark:text-white">Access Denied</h2>
        <p className="text-zinc-500 dark:text-zinc-400">You need administrator privileges to view this page.</p>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, color, subtext }: { title: string, value: number, icon: any, color: string, subtext?: string }) => (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex items-start justify-between transition-transform hover:scale-[1.02]">
        <div>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-zinc-900 dark:text-white">{value}</h3>
            {subtext && <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1"><TrendingUp size={12}/> {subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color} text-white`}>
            <Icon size={24} />
        </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="text-red-600" />
                {t('admin_dashboard')}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                Overview of platform activity and moderation tools.
            </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <Activity size={16} className="text-green-500" />
            System Operational
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
        <StatCard 
            title="Total Users" 
            value={totalUsers} 
            icon={Users} 
            color="bg-blue-500" 
            subtext={`${newUsersToday} joined today`}
        />
        <StatCard 
            title="Active Posts" 
            value={totalPosts} 
            icon={FileText} 
            color="bg-purple-500" 
        />
        <StatCard 
            title="Clans Created" 
            value={totalClans} 
            icon={Shield} 
            color="bg-amber-500" 
        />
        <StatCard 
            title="Banned Users" 
            value={bannedUsers} 
            icon={UserX} 
            color="bg-red-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Management */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col h-[500px]">
          <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 flex justify-between items-center">
            <h2 className="font-semibold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                <Users size={18} /> User Management
            </h2>
            <span className="text-xs font-medium px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded-full text-zinc-700 dark:text-zinc-300">{users.length} Users</span>
          </div>
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 font-medium">User</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {users.map(user => (
                  <tr key={user.id} className={user.isBanned ? 'bg-red-50 dark:bg-red-900/10' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors'}>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar} className="w-8 h-8 rounded-full bg-zinc-200" alt={user.name} />
                        <div>
                          <div className="font-medium text-zinc-900 dark:text-zinc-100">{user.name}</div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                        user.role === UserRole.ADMIN 
                        ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800' 
                        : 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                         {user.isBanned ? (
                             <span className="inline-flex items-center gap-1 text-red-600 font-bold text-xs"><Ban size={12}/> {t('banned')}</span>
                         ) : (
                             <span className="text-green-600 font-medium text-xs">Active</span>
                         )}
                    </td>
                    <td className="px-6 py-3 text-right">
                      {!user.isBanned && user.role !== UserRole.ADMIN && (
                        <button 
                          onClick={() => banUser(user.id)}
                          className="text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium text-xs bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors hover:bg-red-100 dark:hover:bg-red-900/40"
                        >
                          Ban User
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Content Moderation */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col h-[500px]">
          <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 flex justify-between items-center">
            <h2 className="font-semibold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                <FileText size={18} /> Recent Activity
            </h2>
            <span className="text-xs font-medium px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded-full text-zinc-700 dark:text-zinc-300">{posts.length} Posts</span>
          </div>
          <div className="overflow-y-auto flex-1">
             <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 font-medium">Post</th>
                  <th className="px-6 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {posts.length === 0 ? (
                    <tr>
                        <td colSpan={2} className="px-6 py-8 text-center text-zinc-500">No posts to display.</td>
                    </tr>
                ) : (
                    posts.map(post => {
                        const author = users.find(u => u.id === post.userId);
                        return (
                            <tr key={post.id} className="text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                <td className="px-6 py-3">
                                    <p className="truncate max-w-[180px] font-medium text-zinc-900 dark:text-zinc-100 mb-0.5" title={post.content}>{post.content}</p>
                                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                                        <span className="font-medium">{author?.name || 'Unknown'}</span>
                                        <span>•</span>
                                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-3 text-right">
                                    <button 
                                    onClick={() => deletePost(post.id)}
                                    className="text-zinc-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                                    title="Delete Post"
                                    >
                                    <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        )
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Private Message Monitor */}
      <div className="mt-8 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[500px]">
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 flex justify-between items-center">
            <h2 className="font-semibold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                <MessageSquare size={18} /> Private Messages Monitor (Spy Mode)
            </h2>
            <span className="text-xs font-medium px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded-full text-zinc-700 dark:text-zinc-300">{directMessages.length} Messages</span>
        </div>
        <div className="overflow-y-auto flex-1">
            <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 sticky top-0 z-10">
                    <tr>
                        <th className="px-6 py-3 font-medium">Time</th>
                        <th className="px-6 py-3 font-medium">From</th>
                        <th className="px-6 py-3 font-medium">To</th>
                        <th className="px-6 py-3 font-medium">Type</th>
                        <th className="px-6 py-3 font-medium">Content</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {directMessages.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">No messages found.</td>
                        </tr>
                    ) : (
                        [...directMessages].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(msg => {
                            const sender = users.find(u => u.id === msg.senderId);
                            const receiver = users.find(u => u.id === msg.receiverId);
                            return (
                                <tr key={msg.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-6 py-3 text-zinc-500 text-xs">
                                        {new Date(msg.createdAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-2">
                                            {sender && <img src={sender.avatar} className="w-5 h-5 rounded-full" />}
                                            <span className="font-medium text-zinc-900 dark:text-zinc-100">{sender?.name || 'Unknown'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-2">
                                            {receiver && <img src={receiver.avatar} className="w-5 h-5 rounded-full" />}
                                            <span className="font-medium text-zinc-900 dark:text-zinc-100">{receiver?.name || 'Unknown'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className="px-2 py-0.5 rounded text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 uppercase">
                                            {msg.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-zinc-700 dark:text-zinc-300 max-w-xs truncate">
                                        {msg.type === 'text' ? msg.content : `[Media: ${msg.type}]`}
                                    </td>
                                </tr>
                            )
                        })
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;