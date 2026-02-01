import React, { useState } from 'react';
import { useSocial } from '../context/SocialContext';
import PostCard from './PostCard';
import { MapPin, Calendar, Link as LinkIcon, Edit2, X, Save, Camera, Shield, UserPlus, UserMinus, FileText, MessageSquare, Heart, Smile, Pin, Trash2, Eye, Bell, BellOff } from 'lucide-react';
import { User } from '../types';
import { fileToBase64 } from '../context/SocialContext';

const Profile: React.FC = () => {
  const { currentUser, users, posts, clans, updateProfile, viewedProfileId, followUser, toggleBell, goToClan, stories, pinStory, deleteStory, t } = useSocial();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [viewingStoryId, setViewingStoryId] = useState<string | null>(null);
  
  // Status Editing State
  const [statusText, setStatusText] = useState('');
  const [statusEmoji, setStatusEmoji] = useState('👋');

  const profileId = viewedProfileId || currentUser?.id;
  const profileUser = users.find(u => u.id === profileId);

  if (!profileUser || !currentUser) return <div>User not found</div>;

  const isOwnProfile = profileUser.id === currentUser.id;
  const isFollowing = currentUser.followingIds?.includes(profileUser.id);
  const isBelled = currentUser.belledUserIds?.includes(profileUser.id);
  
  // Stats Calculation
  const userPosts = posts.filter(p => p.userId === profileUser.id);
  const postsCount = userPosts.length;
  const commentsCount = posts.reduce((acc, post) => acc + post.comments.filter(c => c.userId === profileUser.id).length, 0);
  const likesGivenCount = posts.reduce((acc, post) => acc + (post.likedBy.includes(profileUser.id) ? 1 : 0), 0);
  const joinedClans = clans.filter(c => c.members.includes(profileUser.id));
  const clansCount = joinedClans.length;
  
  // Stories
  const userStories = stories.filter(s => s.userId === profileUser.id);
  const pinnedStories = userStories.filter(s => s.isPinned);
  const activeStories = userStories.filter(s => new Date(s.expiresAt) > new Date());

  // Privacy Logic for Profile Posts Visibility
  const visiblePosts = userPosts.filter(p => {
      // If viewing own profile, see all
      if (isOwnProfile) return true;
      // If private, must follow
      if (profileUser.isPrivate && !isFollowing) return false;
      return true;
  });

  const startEditing = () => {
    setEditForm({
      name: profileUser.name,
      handle: profileUser.handle,
      bio: profileUser.bio,
      location: profileUser.location || '',
      avatar: profileUser.avatar,
      coverImage: profileUser.coverImage,
    });
    // Init status
    setStatusText(profileUser.status?.text || '');
    setStatusEmoji(profileUser.status?.emoji || '👋');
    setIsEditing(true);
  };

  const handleSave = () => {
    updateProfile({
        ...editForm,
        status: { text: statusText, emoji: statusEmoji }
    });
    setIsEditing(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: 'avatar' | 'coverImage') => {
    if (e.target.files && e.target.files[0]) {
      const base64 = await fileToBase64(e.target.files[0]);
      setEditForm(prev => ({ ...prev, [field]: base64 }));
    }
  };

  const renderCover = (src: string | undefined, className: string) => {
    if (!src) return <div className={`${className} bg-zinc-200 dark:bg-zinc-800`} />;
    const isColor = src.startsWith('#') || src.startsWith('rgb');
    if (isColor) {
      return <div className={className} style={{ backgroundColor: src }} />;
    }
    return <img src={src} alt="Cover" className={`${className} object-cover`} />;
  };

  const StatBox = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: number, color: string }) => (
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color} bg-opacity-10 dark:bg-opacity-20`}>
              <Icon size={20} className={color.replace('bg-', 'text-')} />
          </div>
          <div>
              <div className="text-xl font-bold text-zinc-900 dark:text-white">{value}</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{label}</div>
          </div>
      </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-10">
      
      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-lg border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
              <h2 className="font-bold text-lg text-zinc-900 dark:text-white">{t('edit_profile')}</h2>
              <button onClick={() => setIsEditing(false)} className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4">
              {/* Status Edit */}
              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-700">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Current Status</label>
                  <div className="flex gap-2">
                       <input 
                         type="text" 
                         value={statusEmoji}
                         onChange={(e) => setStatusEmoji(e.target.value)}
                         className="w-12 text-center text-xl p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-nexus-500"
                         maxLength={2}
                         placeholder="emoji"
                       />
                       <input 
                         type="text"
                         value={statusText}
                         onChange={(e) => setStatusText(e.target.value)}
                         className="flex-1 p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-nexus-500"
                         placeholder="What's happening?"
                       />
                  </div>
              </div>

              {/* Images */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Cover Image</label>
                  <div className="relative h-24 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    {renderCover(editForm.coverImage, "w-full h-full")}
                    <label className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                      <Camera className="text-white" />
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'coverImage')} />
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    <img src={editForm.avatar} className="w-full h-full object-cover" />
                    <label className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                      <Camera size={16} className="text-white" />
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
                    </label>
                  </div>
                  <div className="text-sm text-zinc-500">Click to change avatar</div>
                </div>
              </div>

              {/* Text Fields */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Display Name</label>
                <input 
                  type="text" 
                  value={editForm.name} 
                  onChange={e => setEditForm(prev => ({...prev, name: e.target.value}))}
                  className="w-full p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-nexus-500" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Handle</label>
                <input 
                  type="text" 
                  value={editForm.handle} 
                  onChange={e => setEditForm(prev => ({...prev, handle: e.target.value}))}
                  className="w-full p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-nexus-500" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Location</label>
                <input 
                  type="text" 
                  value={editForm.location} 
                  onChange={e => setEditForm(prev => ({...prev, location: e.target.value}))}
                  className="w-full p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-nexus-500" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Bio</label>
                <textarea 
                  value={editForm.bio} 
                  onChange={e => setEditForm(prev => ({...prev, bio: e.target.value}))}
                  className="w-full p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-nexus-500 min-h-[100px]" 
                />
              </div>
            </div>

            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-nexus-600 text-white hover:bg-nexus-700 flex items-center gap-2">
                <Save size={18} /> {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Story Viewer Modal */}
      {viewingStoryId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black p-0 md:p-4">
               <button onClick={() => setViewingStoryId(null)} className="absolute top-4 right-4 text-white z-50 p-2 bg-black/20 rounded-full"><X size={24}/></button>
               {(() => {
                   const story = stories.find(s => s.id === viewingStoryId);
                   const author = story ? users.find(u => u.id === story.userId) : null;
                   
                   if (!story || !author) {
                       setViewingStoryId(null);
                       return null;
                   }

                   return (
                       <div className="relative w-full max-w-md aspect-[9/16] bg-zinc-900 rounded-lg overflow-hidden flex flex-col">
                           <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent flex items-center gap-3 z-10">
                               <img src={author.avatar} className="w-10 h-10 rounded-full border border-white/50" />
                               <div className="text-white">
                                   <div className="font-bold text-sm">{author.name}</div>
                                   <div className="text-xs opacity-70">
                                       {new Date(story.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                               </div>
                           </div>
                           
                           <div className="flex-1 bg-black flex items-center justify-center text-center overflow-hidden">
                               {story.type === 'media' ? (
                                   story.mediaType === 'video' ? (
                                       <video src={story.content} controls autoPlay className="w-full h-full object-contain" />
                                   ) : (
                                       <img src={story.content} className="w-full h-full object-contain" />
                                   )
                               ) : (
                                   <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-8">
                                       <p className="text-white text-2xl font-bold shadow-sm">{story.content}</p>
                                   </div>
                               )}
                           </div>
                       </div>
                   )
               })()}
          </div>
      )}

      {/* Cover Image */}
      <div className="h-48 md:h-64 bg-zinc-300 w-full relative">
        {renderCover(profileUser.coverImage, "w-full h-full")}
        {isOwnProfile && (
            <button onClick={startEditing} className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/30 transition-all">
            <Edit2 size={20} />
            </button>
        )}
      </div>

      {/* Profile Header */}
      <div className="px-6 relative">
        <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 mb-6">
          <div className="relative">
            <img 
              src={profileUser.avatar} 
              alt={profileUser.name} 
              className="w-32 h-32 rounded-full border-4 border-white dark:border-zinc-900 shadow-md object-cover bg-white"
            />
            {profileUser.status && (
                <div className="absolute bottom-0 right-0 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm rounded-full px-2 py-1 flex items-center gap-1 max-w-[150px]">
                    <span>{profileUser.status.emoji}</span>
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-200 truncate">{profileUser.status.text}</span>
                </div>
            )}
          </div>
          
          <div className="mt-4 md:mt-0 md:ml-6 flex-1">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{profileUser.name}</h1>
            <p className="text-zinc-500 dark:text-zinc-300 font-medium">{profileUser.handle}</p>
          </div>

          <div className="mt-4 md:mt-0 flex gap-3">
            {isOwnProfile ? (
                <button onClick={startEditing} className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-full font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 bg-white dark:bg-transparent transition-colors">
                {t('edit_profile')}
                </button>
            ) : (
                <>
                    <button 
                        onClick={() => toggleBell(profileUser.id)}
                        className={`p-2 rounded-full border transition-colors ${
                            isBelled 
                            ? 'bg-nexus-100 dark:bg-nexus-900/30 text-nexus-600 dark:text-nexus-400 border-nexus-200 dark:border-nexus-800' 
                            : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                        }`}
                        title={isBelled ? "Turn off notifications" : "Turn on notifications"}
                    >
                        {isBelled ? <Bell size={20} fill="currentColor" /> : <BellOff size={20} />}
                    </button>
                    <button 
                        onClick={() => followUser(profileUser.id)}
                        className={`px-6 py-2 rounded-full font-medium flex items-center gap-2 transition-colors ${
                            isFollowing 
                            ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-300 dark:hover:bg-zinc-600' 
                            : 'bg-nexus-600 text-white hover:bg-nexus-700'
                        }`}
                    >
                        {isFollowing ? (
                            <>
                                <UserMinus size={18} /> Unsubscribe
                            </>
                        ) : (
                            <>
                                <UserPlus size={18} /> Subscribe
                            </>
                        )}
                    </button>
                </>
            )}
          </div>
        </div>

        {/* Bio, Details & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-1 space-y-6">
            <div className="space-y-4">
                {/* Pinned Stories / Highlights - Circular Display */}
                {pinnedStories.length > 0 && (
                    <div className="mb-4">
                         <div className="font-semibold text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3 flex items-center gap-1">
                            <Pin size={12} /> Highlights
                        </div>
                        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                            {pinnedStories.map(story => (
                                <div key={story.id} className="flex flex-col items-center gap-1 cursor-pointer group" onClick={() => setViewingStoryId(story.id)}>
                                    <div className="w-16 h-16 rounded-full p-[2px] bg-zinc-200 dark:bg-zinc-700 group-hover:bg-nexus-500 transition-colors">
                                        <div className="w-full h-full rounded-full border-2 border-white dark:border-zinc-900 overflow-hidden bg-black">
                                            {story.type === 'media' ? (
                                                 story.mediaType === 'video' ? (
                                                      <video src={story.content} className="w-full h-full object-cover" />
                                                 ) : (
                                                      <img src={story.content} className="w-full h-full object-cover" />
                                                 )
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center">
                                                    <span className="text-[8px] text-white">TEXT</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {isOwnProfile && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); pinStory(story.id); }}
                                            className="text-[10px] text-zinc-400 hover:text-red-500"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <p className="text-zinc-700 dark:text-zinc-200 whitespace-pre-line leading-relaxed">{profileUser.bio}</p>
                
                <div className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
                {profileUser.location && (
                    <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>{profileUser.location}</span>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <LinkIcon size={16} />
                    <a href="#" className="text-nexus-600 dark:text-nexus-400 hover:underline">nexes.social</a>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>Joined {new Date(profileUser.joinedAt).toLocaleDateString()}</span>
                </div>
                </div>

                <div className="flex gap-4 py-4 border-t border-b border-zinc-200 dark:border-zinc-800">
                <div className="text-center">
                    <span className="block font-bold text-zinc-900 dark:text-white">{profileUser.following}</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">{t('following')}</span>
                </div>
                <div className="text-center">
                    <span className="block font-bold text-zinc-900 dark:text-white">{profileUser.followers}</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">{t('followers')}</span>
                </div>
                </div>
            </div>

            {/* Clans Section */}
            {joinedClans.length > 0 && (
                <div className="space-y-3">
                    <h2 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                        <Shield size={16} className="text-nexus-600" />
                        {t('nav_clans')}
                    </h2>
                    <div className="space-y-2">
                        {joinedClans.map(clan => (
                            <div 
                                key={clan.id} 
                                onClick={() => goToClan(clan.id)}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            >
                                <img src={clan.banner} alt={clan.name} className="w-10 h-10 rounded-lg object-cover" />
                                <div className="overflow-hidden">
                                    <h3 className="font-medium text-sm text-zinc-900 dark:text-white truncate">{clan.name}</h3>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{clan.memberCount} members</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>

          {/* Right Column: Stats Grid & Posts */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Activity Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <StatBox icon={FileText} label={t('stats_posts')} value={postsCount} color="bg-blue-500" />
                <StatBox icon={MessageSquare} label={t('stats_comments')} value={commentsCount} color="bg-green-500" />
                <StatBox icon={Heart} label={t('stats_likes')} value={likesGivenCount} color="bg-red-500" />
                <StatBox icon={Shield} label={t('stats_clans')} value={clansCount} color="bg-purple-500" />
            </div>

            <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg text-zinc-900 dark:text-white mb-2">Posts</h2>
                {isOwnProfile && (
                     <div className="text-xs text-zinc-500">
                         {activeStories.length} active stories
                     </div>
                )}
            </div>
            
            {/* Active Stories Management (Only for owner - keep rectangular for management) */}
            {isOwnProfile && activeStories.length > 0 && (
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-700 mb-4">
                     <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-3">Manage Active Stories</h3>
                     <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                         {activeStories.map(story => (
                             <div key={story.id} className="relative flex-shrink-0 w-24 h-40 bg-black rounded-lg overflow-hidden group">
                                 {story.type === 'media' ? (
                                     story.mediaType === 'video' ? (
                                         <video src={story.content} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                     ) : (
                                         <img src={story.content} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                     )
                                 ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center p-2 text-center text-[8px] text-white">
                                        {story.content}
                                    </div>
                                 )}
                                 
                                 <div className="absolute top-1 right-1 flex flex-col gap-1">
                                    <button 
                                        onClick={() => deleteStory(story.id)}
                                        className="bg-black/50 text-white p-1 rounded hover:bg-red-600 transition-colors"
                                    >
                                        <Trash2 size={10} />
                                    </button>
                                    <button 
                                        onClick={() => pinStory(story.id)}
                                        className={`p-1 rounded transition-colors ${story.isPinned ? 'bg-amber-500 text-white' : 'bg-black/50 text-white hover:bg-amber-500'}`}
                                        title={story.isPinned ? "Unpin Highlight" : "Pin to Highlights"}
                                    >
                                        <Pin size={10} fill={story.isPinned ? "currentColor" : "none"} />
                                    </button>
                                 </div>
                                 <div className="absolute bottom-1 left-1 text-[10px] text-white flex items-center gap-1">
                                     <Eye size={10} /> {story.viewers.length}
                                 </div>
                             </div>
                         ))}
                     </div>
                </div>
            )}
            
            {(profileUser.isPrivate && !isFollowing && !isOwnProfile) ? (
                 <div className="p-8 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 text-center">
                     <Lock size={32} className="mx-auto text-zinc-400 mb-2" />
                     <h3 className="text-zinc-900 dark:text-white font-medium">This account is private</h3>
                     <p className="text-zinc-500 text-sm">Follow to see their posts.</p>
                 </div>
            ) : visiblePosts.length > 0 ? (
              visiblePosts.map(post => (
                <PostCard key={post.id} post={post} author={profileUser} />
              ))
            ) : (
              <div className="p-8 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 text-center text-zinc-400 dark:text-zinc-500">
                No posts yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple lock icon for private profile
const Lock = ({size, className}: {size: number, className: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);

export default Profile;