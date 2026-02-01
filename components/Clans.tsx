import React, { useState, useEffect, useRef } from 'react';
import { useSocial } from '../context/SocialContext';
import { Users, Trophy, Plus, Shield, Crown, Star, Wand2, ArrowLeft, Camera, UserPlus, X, Check, Settings, Image, Send, Lock, Hash, Zap } from 'lucide-react';
import { generateClanDescription } from '../services/geminiService';
import PostCard from './PostCard';
import { fileToBase64 } from '../context/SocialContext';

const Clans: React.FC = () => {
  const { clans, posts, users, currentUser, joinClan, createClan, inviteUserToClan, promoteToModerator, demoteModerator, kickMember, updateClanBanner, viewedClanId, addPost, goToClan, addClanRole, assignClanRole, sendClanMessage, clanMessages, t } = useSocial();
  
  const [view, setView] = useState<'list' | 'create'>('list');
  const isDetailView = !!viewedClanId && view !== 'create';
  const activeClan = clans.find(c => c.id === viewedClanId);
  const [activeClanTab, setActiveClanTab] = useState<'board' | 'chat' | 'members'>('board');

  // Create Clan State
  const [newClanName, setNewClanName] = useState('');
  const [newClanDesc, setNewClanDesc] = useState('');
  const [newClanBanner, setNewClanBanner] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Invite Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Clan Post State
  const [clanPostContent, setClanPostContent] = useState('');
  
  // Chat State
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Settings - Role State
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleColor, setNewRoleColor] = useState('#3b82f6');

  const scrollToBottom = () => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
      if (activeClanTab === 'chat') {
          scrollToBottom();
      }
  }, [activeClanTab, clanMessages]);

  const handleCreate = async () => {
    if (!newClanName.trim() || !newClanDesc.trim()) return;
    createClan(newClanName, newClanDesc, newClanBanner);
    setNewClanName('');
    setNewClanDesc('');
    setNewClanBanner('');
    setView('list');
  };

  const handleGenerateDesc = async () => {
    if (!newClanName.trim()) return;
    setIsGenerating(true);
    const desc = await generateClanDescription(newClanName);
    if (desc) {
      setNewClanDesc(desc);
    }
    setIsGenerating(false);
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>, isUpdate = false) => {
    if (e.target.files && e.target.files[0]) {
      const base64 = await fileToBase64(e.target.files[0]);
      if (isUpdate && activeClan) {
          updateClanBanner(activeClan.id, base64);
      } else {
          setNewClanBanner(base64);
      }
    }
  };

  const handleClanPost = () => {
      if (!clanPostContent.trim() || !activeClan) return;
      addPost(clanPostContent, undefined, activeClan.id);
      setClanPostContent('');
  };

  const handleSendMessage = (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatInput.trim() || !activeClan) return;
      sendClanMessage(activeClan.id, chatInput);
      setChatInput('');
  };

  const handleAddRole = () => {
      if (!newRoleName.trim() || !activeClan) return;
      addClanRole(activeClan.id, newRoleName, newRoleColor);
      setNewRoleName('');
  };

  // --- Views ---

  if (view === 'create') {
      return (
        <div className="max-w-2xl mx-auto py-6 px-4">
            <button onClick={() => setView('list')} className="mb-6 flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
                <ArrowLeft size={20} /> Back to Clans
            </button>
            
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-800 animate-fade-in">
                <h3 className="text-xl font-bold mb-6 dark:text-white">Establish a New Clan</h3>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Clan Banner</label>
                        <div className="relative h-48 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 border-2 border-dashed border-zinc-300 dark:border-zinc-700">
                            {newClanBanner ? (
                                <img src={newClanBanner} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                                    <Camera size={32} />
                                    <span className="text-sm mt-2">Click to upload banner</span>
                                </div>
                            )}
                            <label className="absolute inset-0 cursor-pointer opacity-0 hover:opacity-100 bg-black/30 flex items-center justify-center transition-opacity">
                                <span className="text-white font-medium">Change Image</span>
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleBannerUpload(e)} />
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Clan Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Code Warriors"
                            value={newClanName}
                            onChange={(e) => setNewClanName(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-nexus-500"
                        />
                    </div>
                    
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
                            <button 
                                onClick={handleGenerateDesc}
                                disabled={isGenerating || !newClanName}
                                className="text-nexus-600 dark:text-nexus-400 text-xs font-medium flex items-center gap-1 hover:underline disabled:opacity-50"
                            >
                                <Wand2 size={12} />
                                {isGenerating ? 'Generating...' : 'AI Assist'}
                            </button>
                        </div>
                        <textarea
                            placeholder="What is this community about?"
                            value={newClanDesc}
                            onChange={(e) => setNewClanDesc(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-nexus-500 min-h-[100px]"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <button 
                    onClick={() => setView('list')} 
                    className="px-4 py-2 rounded-lg text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 font-medium"
                    >
                    Cancel
                    </button>
                    <button 
                    onClick={handleCreate}
                    disabled={!newClanName || !newClanDesc}
                    className="bg-nexus-600 text-white px-6 py-2 rounded-lg hover:bg-nexus-700 disabled:opacity-50 font-medium"
                    >
                    Create Clan
                    </button>
                </div>
            </div>
        </div>
      );
  }

  // Detail View
  if (isDetailView && activeClan) {
      const isOwner = activeClan.ownerId === currentUser?.id;
      const isModerator = activeClan.moderatorIds.includes(currentUser?.id || '');
      const isMember = activeClan.members.includes(currentUser?.id || '');
      const showInvite = true; 

      // Filter posts for this clan
      const clanPosts = posts.filter(p => p.clanId === activeClan.id);
      
      // Filter chats for this clan
      const chats = clanMessages.filter(m => m.clanId === activeClan.id);

      const handleBack = () => {
          goToClan(null); 
          setActiveClanTab('board');
      };
      
      // Level Calculation Visuals
      const currentXP = activeClan.experience || 0;
      const level = activeClan.level || 1;
      const nextLevelXP = 1000 * level; // Simple linear progression for visual
      const prevLevelXP = 1000 * (level - 1);
      const levelProgress = ((currentXP - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100;

      return (
        <div className="max-w-5xl mx-auto py-6 px-4">
             <button onClick={handleBack} className="mb-4 flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
                <ArrowLeft size={20} /> Back to Clans
            </button>

            {/* Banner Header */}
            <div className="relative h-64 rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800 mb-6 group">
                <img src={activeClan.banner} alt={activeClan.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white w-full pr-12">
                     <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-4xl font-bold mb-2 shadow-sm">{activeClan.name}</h1>
                            <div className="flex items-center gap-4 text-sm font-medium opacity-90">
                                <div className="flex items-center gap-1"><Users size={16} /> {activeClan.memberCount} {t('members')}</div>
                                <div className="flex items-center gap-1 text-amber-400"><Trophy size={16} /> {activeClan.powerScore} Power</div>
                                <div className="flex items-center gap-1 text-nexus-400 bg-nexus-900/50 px-2 py-0.5 rounded-full border border-nexus-400/30">
                                    <Zap size={14} fill="currentColor" /> Lvl {level}
                                </div>
                            </div>
                        </div>
                        
                        {(isOwner || isModerator) && (
                             <button onClick={() => setShowSettingsModal(true)} className="mb-2 mr-6 bg-white/20 hover:bg-white/30 p-2 rounded-full backdrop-blur-md transition-colors text-white">
                                 <Settings size={20} />
                             </button>
                        )}
                     </div>
                </div>
                {isOwner && (
                    <label className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full cursor-pointer transition-colors opacity-0 group-hover:opacity-100">
                        <Camera size={20} />
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleBannerUpload(e, true)} />
                    </label>
                )}
            </div>
            
            {/* Tabs */}
            <div className="flex gap-1 mb-6 border-b border-zinc-200 dark:border-zinc-800">
                <button 
                    onClick={() => setActiveClanTab('board')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeClanTab === 'board' ? 'border-nexus-600 text-nexus-600 dark:text-nexus-400' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                >
                    Community Board
                </button>
                <button 
                    onClick={() => setActiveClanTab('chat')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeClanTab === 'chat' ? 'border-nexus-600 text-nexus-600 dark:text-nexus-400' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                >
                    Clan Chat
                </button>
                <button 
                    onClick={() => setActiveClanTab('members')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeClanTab === 'members' ? 'border-nexus-600 text-nexus-600 dark:text-nexus-400' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                >
                    Members
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Main Content based on Tab */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* BOARD TAB */}
                    {activeClanTab === 'board' && (
                        <div>
                             {/* About Section (Brief) */}
                             <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 mb-6">
                                <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-3">{t('about')}</h2>
                                <p className="text-zinc-600 dark:text-zinc-300 whitespace-pre-line">{activeClan.description}</p>
                                
                                <div className="mt-6 flex gap-3">
                                    {!isMember && (
                                        <button 
                                            onClick={() => joinClan(activeClan.id)}
                                            className="bg-nexus-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-nexus-700 flex-1"
                                        >
                                            {t('join_clan')}
                                        </button>
                                    )}
                                    {isMember && showInvite && (
                                        <button 
                                            onClick={() => setShowInviteModal(true)}
                                            className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 px-4 py-2 rounded-lg font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center gap-2 flex-1"
                                        >
                                            <UserPlus size={18} /> {t('invite_members')}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Post Input */}
                            {isMember ? (
                                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-4 mb-4">
                                    <div className="flex gap-3">
                                        <img src={currentUser?.avatar} className="w-8 h-8 rounded-full" />
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                value={clanPostContent}
                                                onChange={(e) => setClanPostContent(e.target.value)}
                                                placeholder="Post to community board..."
                                                className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-full py-2 px-4 text-sm focus:ring-2 focus:ring-nexus-500 dark:text-white"
                                            />
                                            <button 
                                                onClick={handleClanPost}
                                                disabled={!clanPostContent.trim()}
                                                className="absolute right-1 top-1 p-1.5 bg-nexus-600 text-white rounded-full hover:bg-nexus-700 disabled:opacity-50"
                                            >
                                                <Send size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-nexus-50 dark:bg-nexus-900/10 rounded-xl p-4 mb-4 border border-nexus-200 dark:border-nexus-800/30 flex items-center gap-3">
                                    <div className="p-2 bg-nexus-100 dark:bg-nexus-900/50 rounded-full text-nexus-600 dark:text-nexus-400">
                                        <Lock size={20} />
                                    </div>
                                    <div className="text-sm text-zinc-700 dark:text-zinc-300">
                                        You are viewing this clan as a guest. <strong>Join</strong> to post.
                                    </div>
                                </div>
                            )}
                            
                            <div className="space-y-4">
                                {clanPosts.length > 0 ? (
                                    clanPosts.map(post => {
                                        const author = users.find(u => u.id === post.userId);
                                        if (!author) return null;
                                        return <PostCard key={post.id} post={post} author={author} />;
                                    })
                                ) : (
                                    <div className="text-center py-8 text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                                        No posts yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* CHAT TAB */}
                    {activeClanTab === 'chat' && (
                        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden h-[600px] flex flex-col">
                            {!isMember ? (
                                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                                    <Lock size={48} className="text-zinc-300 dark:text-zinc-600 mb-4" />
                                    <h3 className="text-xl font-bold text-zinc-800 dark:text-white mb-2">Members Only</h3>
                                    <p className="text-zinc-500 dark:text-zinc-400 mb-6">Join {activeClan.name} to access the private chat.</p>
                                    <button 
                                        onClick={() => joinClan(activeClan.id)}
                                        className="bg-nexus-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-nexus-700"
                                    >
                                        {t('join_clan')}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 dark:bg-zinc-950/50">
                                        {chats.length === 0 ? (
                                            <div className="text-center py-10 text-zinc-400 dark:text-zinc-600">
                                                <Hash size={32} className="mx-auto mb-2 opacity-50" />
                                                <p>Start the conversation!</p>
                                            </div>
                                        ) : (
                                            chats.map(msg => {
                                                const author = users.find(u => u.id === msg.userId);
                                                const isMe = msg.userId === currentUser?.id;
                                                return (
                                                    <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                                        <img src={author?.avatar} className="w-8 h-8 rounded-full flex-shrink-0" />
                                                        <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                                            <div className="flex items-baseline gap-2 mb-1">
                                                                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">{author?.name}</span>
                                                                <span className="text-[10px] text-zinc-400">{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                            </div>
                                                            <div className={`px-4 py-2 rounded-2xl text-sm ${isMe ? 'bg-nexus-600 text-white rounded-tr-none' : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-tl-none'}`}>
                                                                {msg.text}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        )}
                                        <div ref={chatEndRef} />
                                    </div>
                                    <form onSubmit={handleSendMessage} className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex gap-2">
                                        <input 
                                            type="text" 
                                            value={chatInput}
                                            onChange={e => setChatInput(e.target.value)}
                                            placeholder={`Message #${activeClan.name.toLowerCase().replace(/\s+/g, '-')}`}
                                            className="flex-1 bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg px-4 py-2 focus:ring-2 focus:ring-nexus-500 dark:text-white"
                                        />
                                        <button 
                                            type="submit"
                                            disabled={!chatInput.trim()} 
                                            className="bg-nexus-600 text-white p-2 rounded-lg hover:bg-nexus-700 disabled:opacity-50"
                                        >
                                            <Send size={20} />
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    )}

                    {/* MEMBERS TAB */}
                    {activeClanTab === 'members' && (
                         <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                                <h2 className="font-bold text-zinc-900 dark:text-white">{t('members')}</h2>
                                <span className="text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full">{activeClan.members.length}</span>
                            </div>
                            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-[500px] overflow-y-auto">
                                {activeClan.members.map(memberId => {
                                    const member = users.find(u => u.id === memberId);
                                    if (!member) return null;
                                    
                                    const memberIsOwner = activeClan.ownerId === memberId;
                                    const memberIsMod = activeClan.moderatorIds.includes(memberId);
                                    const memberCustomRoles = activeClan.memberRoles?.[memberId] || [];
                                    
                                    return (
                                        <div key={memberId} className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                                                <div>
                                                    <div className="font-medium text-zinc-900 dark:text-white flex items-center gap-2">
                                                        {member.name}
                                                        {/* Explicit Role Badge */}
                                                        {memberIsOwner ? (
                                                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800 border border-yellow-200">Owner</span>
                                                        ) : memberIsMod ? (
                                                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">Moderator</span>
                                                        ) : (
                                                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">Member</span>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Custom Fan Roles */}
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {memberCustomRoles.map(roleId => {
                                                            const roleDef = activeClan.fanRoles?.find(r => r.id === roleId);
                                                            if(!roleDef) return null;
                                                            return (
                                                                <span key={roleId} className="text-[10px] px-1.5 rounded-full text-white" style={{ backgroundColor: roleDef.color }}>
                                                                    {roleDef.name}
                                                                </span>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Actions Menu */}
                                            {(isOwner || (isModerator && !memberIsOwner && !memberIsMod)) && currentUser?.id !== memberId && (
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity items-center">
                                                    
                                                    {/* Role Assignment Dropdown Trigger */}
                                                    {activeClan.fanRoles && activeClan.fanRoles.length > 0 && (
                                                        <div className="relative group/roles">
                                                            <button className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded">
                                                                <Star size={14} className="text-zinc-500" />
                                                            </button>
                                                            <div className="hidden group-hover/roles:block absolute right-0 bottom-full mb-1 w-32 bg-white dark:bg-zinc-800 shadow-lg border border-zinc-200 dark:border-zinc-700 rounded-lg p-1 z-10">
                                                                {activeClan.fanRoles.map(role => {
                                                                    const hasRole = memberCustomRoles.includes(role.id);
                                                                    return (
                                                                        <button 
                                                                            key={role.id}
                                                                            onClick={() => assignClanRole(activeClan.id, memberId, role.id)}
                                                                            className={`w-full text-left text-xs px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center justify-between ${hasRole ? 'text-nexus-600 font-bold' : 'text-zinc-600 dark:text-zinc-300'}`}
                                                                        >
                                                                            {role.name}
                                                                            {hasRole && <Check size={10} />}
                                                                        </button>
                                                                    )
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {isOwner && (
                                                        memberIsMod ? (
                                                            <button 
                                                                onClick={() => demoteModerator(activeClan.id, memberId)}
                                                                className="text-xs bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 px-2 py-1 rounded text-zinc-600 dark:text-zinc-400"
                                                            >Demote</button>
                                                        ) : (
                                                            <button 
                                                                onClick={() => promoteToModerator(activeClan.id, memberId)}
                                                                className="text-xs bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 text-purple-700 dark:text-purple-300 px-2 py-1 rounded"
                                                            >Promote</button>
                                                        )
                                                    )}
                                                    <button 
                                                        onClick={() => kickMember(activeClan.id, memberId)}
                                                        className="text-xs bg-red-100 dark:bg-red-900/30 hover:bg-red-200 text-red-600 dark:text-red-400 px-2 py-1 rounded"
                                                    >Kick</button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                </div>

                {/* Right Column: Stats */}
                <div className="space-y-6">
                     {/* Stats */}
                     <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
                        <h3 className="font-bold text-zinc-900 dark:text-white mb-4">Clan Stats</h3>
                        <div className="space-y-4">
                            
                            {/* Level Progress */}
                            <div className="py-2 border-b border-zinc-100 dark:border-zinc-800">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-zinc-900 dark:text-white font-medium text-sm">Level {level}</span>
                                    <span className="text-zinc-500 dark:text-zinc-400 text-xs">{currentXP} XP</span>
                                </div>
                                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-nexus-500 rounded-full transition-all duration-500"
                                        style={{ width: `${levelProgress}%` }}
                                    ></div>
                                </div>
                                <div className="text-right mt-1">
                                    <span className="text-[10px] text-zinc-400">{Math.floor(nextLevelXP - currentXP)} XP to next level</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800">
                                <span className="text-zinc-500 dark:text-zinc-400 text-sm">Created</span>
                                <span className="text-zinc-900 dark:text-white font-medium text-sm">
                                    {new Date(activeClan.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800">
                                <span className="text-zinc-500 dark:text-zinc-400 text-sm">Power Rank</span>
                                <span className="text-zinc-900 dark:text-white font-medium text-sm">#{Math.max(1, Math.floor(activeClan.powerScore / 100))} Global</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-zinc-500 dark:text-zinc-400 text-sm">Visibility</span>
                                <span className="text-zinc-900 dark:text-white font-medium text-sm">Public</span>
                            </div>
                        </div>
                     </div>
                </div>
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-md border border-zinc-200 dark:border-zinc-800">
                        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                            <h3 className="font-bold dark:text-white">{t('invite_members')}</h3>
                            <button onClick={() => setShowInviteModal(false)} className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"><X size={20}/></button>
                        </div>
                        <div className="p-2 max-h-[300px] overflow-y-auto">
                            {users.filter(u => !activeClan.members.includes(u.id) && !activeClan.invitedUserIds.includes(u.id)).map(user => (
                                <div key={user.id} className="flex items-center justify-between p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <img src={user.avatar} className="w-8 h-8 rounded-full" />
                                        <div className="text-sm">
                                            <div className="font-medium text-zinc-900 dark:text-white">{user.name}</div>
                                            <div className="text-zinc-500 text-xs">{user.handle}</div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => inviteUserToClan(activeClan.id, user.id)}
                                        className="text-xs bg-nexus-100 dark:bg-nexus-900/30 text-nexus-700 dark:text-nexus-400 px-3 py-1.5 rounded-full font-medium hover:bg-nexus-200 dark:hover:bg-nexus-900/50"
                                    >
                                        {t('invite')}
                                    </button>
                                </div>
                            ))}
                            {users.filter(u => !activeClan.members.includes(u.id) && !activeClan.invitedUserIds.includes(u.id)).length === 0 && (
                                <div className="p-4 text-center text-zinc-500 text-sm">No users available to invite.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Clan Settings Modal */}
            {showSettingsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-lg border border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
                         <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                            <h3 className="font-bold dark:text-white flex items-center gap-2"><Settings size={18}/> Clan Settings</h3>
                            <button onClick={() => setShowSettingsModal(false)} className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"><X size={20}/></button>
                        </div>
                        
                        <div className="p-6 space-y-8">
                            {/* Banner Settings */}
                            <div>
                                <h4 className="font-semibold text-sm text-zinc-700 dark:text-zinc-300 mb-4 uppercase tracking-wide">Clan Appearance</h4>
                                <div className="space-y-3">
                                    <div className="relative h-32 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
                                        <img src={activeClan.banner} alt="Current Banner" className="w-full h-full object-cover" />
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 w-fit">
                                        <Image size={16} />
                                        <span className="dark:text-white">Change Banner Image</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleBannerUpload(e, true)} />
                                    </label>
                                </div>
                            </div>

                            <hr className="border-zinc-100 dark:border-zinc-800" />

                            {/* Role Settings */}
                            <div>
                                <h4 className="font-semibold text-sm text-zinc-700 dark:text-zinc-300 mb-4 uppercase tracking-wide">Manage Fan Roles</h4>
                                
                                <div className="flex gap-2 mb-6">
                                    <input 
                                        type="text" 
                                        placeholder="Role Name (e.g. Healer)" 
                                        value={newRoleName}
                                        onChange={(e) => setNewRoleName(e.target.value)}
                                        className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-nexus-500"
                                    />
                                    <input 
                                        type="color" 
                                        value={newRoleColor}
                                        onChange={(e) => setNewRoleColor(e.target.value)}
                                        className="w-10 h-10 p-0 rounded-lg border-0 cursor-pointer"
                                    />
                                    <button 
                                        onClick={handleAddRole}
                                        disabled={!newRoleName}
                                        className="px-4 py-2 bg-nexus-600 text-white rounded-lg text-sm font-medium hover:bg-nexus-700 disabled:opacity-50"
                                    >
                                        Add
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {activeClan.fanRoles && activeClan.fanRoles.length > 0 ? (
                                        activeClan.fanRoles.map(role => (
                                            <div key={role.id} className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: role.color }}></div>
                                                    <span className="font-medium text-zinc-900 dark:text-white">{role.name}</span>
                                                </div>
                                                {/* Delete role logic could go here */}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-zinc-500 text-sm py-4 italic">No custom roles created yet.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      );
  }

  // LIST VIEW with Left-side Feed
  const globalClanPosts = posts.filter(p => p.clanId !== undefined).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Shield className="text-nexus-600 dark:text-nexus-400" />
          {t('nav_clans')}
        </h1>
        <button 
          onClick={() => setView('create')}
          className="bg-nexus-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-nexus-700 flex items-center gap-2"
        >
          <Plus size={18} />
          {t('create_clan')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Left Column: Global Clan Feed (3/5) */}
          <div className="lg:col-span-3">
             <div className="mb-4">
                 <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                     <Hash className="text-zinc-400" size={20} /> Global Clan Activity
                 </h2>
             </div>
             <div className="space-y-4">
                 {globalClanPosts.length > 0 ? (
                     globalClanPosts.map(post => {
                         const author = users.find(u => u.id === post.userId);
                         const clan = clans.find(c => c.id === post.clanId);
                         if (!author || !clan) return null;
                         return (
                             <div key={post.id} className="relative">
                                 <div className="absolute top-[-10px] left-4 bg-zinc-800 text-white text-[10px] px-2 py-0.5 rounded-full z-10 flex items-center gap-1 cursor-pointer hover:bg-nexus-600" onClick={() => goToClan(clan.id)}>
                                     <Shield size={10} /> {clan.name}
                                 </div>
                                 <PostCard post={post} author={author} />
                             </div>
                         )
                     })
                 ) : (
                     <div className="text-center py-10 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                         <p className="text-zinc-500">No clan activity yet.</p>
                     </div>
                 )}
             </div>
          </div>

          {/* Right Column: Clan List (2/5) */}
          <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Trophy className="text-amber-500" size={20} /> Top Clans
              </h2>
            {clans.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <Shield size={48} className="mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">No Clans Yet</h3>
                    <button 
                        onClick={() => setView('create')}
                        className="mt-4 bg-nexus-600 text-white px-6 py-2 rounded-full font-medium hover:bg-nexus-700"
                    >
                        Create One
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {clans.map(clan => {
                        const isMember = clan.members.includes(currentUser?.id || '');
                        return (
                            <div 
                                key={clan.id} 
                                onClick={() => goToClan(clan.id)}
                                className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden flex cursor-pointer hover:shadow-md transition-all group"
                            >
                                <div className="w-24 bg-zinc-200 dark:bg-zinc-800 relative">
                                    <img src={clan.banner} alt={clan.name} className="w-full h-full object-cover" />
                                    {isMember && (
                                        <div className="absolute top-1 left-1 bg-green-500 text-white p-1 rounded-full border-2 border-white dark:border-zinc-900">
                                            <Check size={10} strokeWidth={4} />
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 flex-1 flex flex-col justify-center">
                                    <h3 className="font-bold text-zinc-900 dark:text-white truncate">{clan.name}</h3>
                                    <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                                        <span className="flex items-center gap-1"><Users size={12}/> {clan.memberCount}</span>
                                        <span className="flex items-center gap-1 text-amber-500"><Trophy size={12}/> {clan.powerScore}</span>
                                        <span className="flex items-center gap-1 text-nexus-500"><Zap size={12}/> Lvl {clan.level || 1}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default Clans;