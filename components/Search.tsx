import React, { useState } from 'react';
import { useSocial } from '../context/SocialContext';
import { Search as SearchIcon, UserPlus, UserMinus, User, ArrowRight } from 'lucide-react';

const Search: React.FC = () => {
    const { users, currentUser, followUser, goToProfile, t } = useSocial();
    const [query, setQuery] = useState('');

    const filteredUsers = users.filter(u => 
        (u.name.toLowerCase().includes(query.toLowerCase()) || 
         u.handle.toLowerCase().includes(query.toLowerCase())) &&
        u.id !== currentUser?.id
    );

    const handleFollow = (e: React.MouseEvent, userId: string) => {
        e.stopPropagation();
        followUser(userId);
    };

    return (
        <div className="max-w-2xl mx-auto py-6 px-4">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
                <SearchIcon className="text-nexus-600" />
                {t('nav_search')}
            </h1>

            <div className="relative mb-8">
                <input
                    type="text"
                    placeholder="Search people by name or handle..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-nexus-500 shadow-sm"
                    autoFocus
                />
                <SearchIcon className="absolute left-4 top-3.5 text-zinc-400" size={20} />
            </div>

            <div className="space-y-3">
                {query && filteredUsers.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="bg-zinc-100 dark:bg-zinc-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                            <User size={24} className="text-zinc-400" />
                        </div>
                        <p className="text-zinc-500 dark:text-zinc-400">No users found matching "{query}"</p>
                    </div>
                ) : (
                    filteredUsers.map(user => {
                        const isFollowing = currentUser?.followingIds.includes(user.id);
                        
                        return (
                            <div 
                                key={user.id}
                                onClick={() => goToProfile(user.id)}
                                className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center justify-between hover:border-nexus-200 dark:hover:border-nexus-900 transition-all cursor-pointer group"
                            >
                                <div className="flex items-center gap-4">
                                    <img src={user.avatar} className="w-12 h-12 rounded-full object-cover" alt={user.name} />
                                    <div>
                                        <h3 className="font-bold text-zinc-900 dark:text-white">{user.name}</h3>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">{user.handle}</p>
                                        {user.bio && (
                                            <p className="text-xs text-zinc-400 mt-1 line-clamp-1 max-w-[200px]">{user.bio}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={(e) => handleFollow(e, user.id)}
                                        className={`p-2 rounded-full transition-colors ${
                                            isFollowing 
                                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700' 
                                            : 'bg-nexus-50 dark:bg-nexus-900/30 text-nexus-600 dark:text-nexus-400 hover:bg-nexus-100 dark:hover:bg-nexus-900/50'
                                        }`}
                                        title={isFollowing ? "Unfollow" : "Follow"}
                                    >
                                        {isFollowing ? <UserMinus size={18} /> : <UserPlus size={18} />}
                                    </button>
                                    <div className="p-2 text-zinc-300 dark:text-zinc-600 group-hover:text-nexus-500 transition-colors">
                                        <ArrowRight size={18} />
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                {!query && (
                    <div className="text-center py-12 text-zinc-400 dark:text-zinc-600">
                        <SearchIcon size={48} className="mx-auto mb-2 opacity-20" />
                        <p>Type to find people</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;