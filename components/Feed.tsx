import React, { useState } from 'react';
import { useSocial } from '../context/SocialContext';
import PostCard from './PostCard';
import { Image, Send, Wand2, Search, Filter, UserCheck, Heart, User, Globe, Plus, X, Eye, Video, Loader2, Sparkles } from 'lucide-react';
import { generatePostEnhancement, analyzeContentForModeration } from '../services/geminiService';
import { fileToBase64 } from '../context/SocialContext';
import { MediaItem } from '../types';

type FeedFilter = 'all' | 'following' | 'mine' | 'liked' | 'recommended';

const Feed: React.FC = () => {
  const { posts, users, currentUser, addPost, goToProfile, stories, addStory, deleteStory, t } = useSocial();
  const [newPostContent, setNewPostContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Post Media State
  const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<FeedFilter>('all');
  
  // Story State
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [storyContent, setStoryContent] = useState('');
  const [storyMedia, setStoryMedia] = useState<MediaItem | null>(null);
  const [viewingStoryId, setViewingStoryId] = useState<string | null>(null);

  // Active 24h stories
  const activeStories = stories.filter(s => {
      const expires = new Date(s.expiresAt);
      const now = new Date();
      return expires > now;
  });

  // Group stories by User
  const groupedStories = activeStories.reduce((acc, story) => {
      if (!acc[story.userId]) acc[story.userId] = [];
      acc[story.userId].push(story);
      return acc;
  }, {} as Record<string, typeof stories>);

  const handleCreatePost = async () => {
    if ((!newPostContent.trim() && selectedMedia.length === 0) || isUploading) return;

    // Safety check simulation for text
    if (newPostContent.trim()) {
        const isSafe = await analyzeContentForModeration(newPostContent);
        if (!isSafe) {
        alert("Post content flagged by AI moderation system. Please revise.");
        return;
        }
    }

    addPost(newPostContent, selectedMedia);
    setNewPostContent('');
    setSelectedMedia([]);
  };

  const handleAIEnhance = async () => {
    if (!newPostContent.trim()) return;
    setIsGenerating(true);
    const enhanced = await generatePostEnhancement(newPostContent);
    setNewPostContent(enhanced);
    setIsGenerating(false);
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      try {
        const files: File[] = Array.from(e.target.files);
        const newMediaItems: MediaItem[] = [];

        for (const file of files) {
            if (file.size > 5 * 1024 * 1024) {
                alert(`File ${file.name} is too large (max 5MB).`);
                continue;
            }
            const base64 = await fileToBase64(file);
            const type: 'image' | 'video' = file.type.startsWith('video') ? 'video' : 'image';
            newMediaItems.push({ url: base64, type });
        }
        setSelectedMedia(prev => [...prev, ...newMediaItems]);
      } catch (error) {
        console.error("Upload error:", error);
        alert("Failed to process files.");
      } finally {
        setIsUploading(false);
        e.target.value = '';
      }
    }
  };

  const handleStoryMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setIsUploading(true);
          try {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                alert(`File ${file.name} is too large (max 5MB).`);
                return;
            }
            const base64 = await fileToBase64(file);
            const type: 'image' | 'video' = file.type.startsWith('video') ? 'video' : 'image';
            setStoryMedia({ url: base64, type });
          } catch (error) {
             console.error("Story upload error:", error);
             alert("Failed to upload story media.");
          } finally {
             setIsUploading(false);
             e.target.value = '';
          }
      }
  };

  const handleCreateStory = () => {
      if ((!storyContent.trim() && !storyMedia) || isUploading) return;
      
      const content = storyMedia ? storyMedia.url : storyContent;
      const type: 'media' | 'text' = storyMedia ? 'media' : 'text';
      const mediaType = storyMedia ? storyMedia.type : undefined;

      addStory(content, type, mediaType); 
      setStoryContent('');
      setStoryMedia(null);
      setIsCreatingStory(false);
  };

  const removeSelectedMedia = (index: number) => {
      setSelectedMedia(prev => prev.filter((_, i) => i !== index));
  };

  // 1. Filter posts based on privacy settings, clan membership, AND the active filter tab
  const filteredPosts = posts.filter(post => {
      if (!currentUser) return false;
      const author = users.find(u => u.id === post.userId);
      // Ensure robust rendering even if author sync is delayed - assume public if unknown
      const isPrivate = author ? author.isPrivate : false;
      
      const isMe = post.userId === currentUser.id;
      const isFollowing = currentUser.followingIds?.includes(post.userId) || false;

      // Search Filter
      if (searchTerm && !post.content.toLowerCase().includes(searchTerm.toLowerCase())) return false;

      // Active Tab Filter Logic
      if (activeFilter === 'following') {
          if (!isFollowing) return false;
      }
      if (activeFilter === 'mine') {
          if (!isMe) return false;
      }
      if (activeFilter === 'liked') {
          if (!post.likedBy.includes(currentUser.id)) return false;
      }
      if (activeFilter === 'recommended') {
          // "For You" logic: Show public posts, exclude own posts to encourage discovery
          if (isMe) return false;
      }
      
      // Privacy & Safety Logic
      if (isMe) return true; // Always see own posts

      // If private account, MUST be following to see content
      if (isPrivate && !isFollowing) {
          return false;
      }

      // Public accounts are visible in 'all', 'recommended', or 'following' (already checked above)
      return true;
  });

  // 2. Sort posts based on context (Popularity for Recommended, Date for others)
  const visiblePosts = [...filteredPosts].sort((a, b) => {
      if (activeFilter === 'recommended') {
          // Sort by popularity (likes) descending
          const likesDiff = b.likedBy.length - a.likedBy.length;
          if (likesDiff !== 0) return likesDiff;
      }
      // Default: Newest first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const FilterButton = ({ type, label, icon: Icon }: { type: FeedFilter, label: string, icon: any }) => (
      <button 
        onClick={() => setActiveFilter(type)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
            activeFilter === type 
            ? 'bg-nexus-600 text-white shadow-md shadow-nexus-600/20' 
            : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700'
        }`}
      >
          <Icon size={14} />
          {label}
      </button>
  );

  return (
    <div className="max-w-2xl mx-auto py-6">

      {/* Stories Bar */}
      <div className="mb-6 overflow-x-auto no-scrollbar pb-2">
        <div className="flex gap-4 px-2">
            {/* My Story Add Button */}
            <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => setIsCreatingStory(true)}>
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-nexus-500 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center relative hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                     <Plus size={24} className="text-nexus-500" />
                     {currentUser && <img src={currentUser.avatar} className="absolute inset-0 w-full h-full rounded-full opacity-30 object-cover" />}
                </div>
                <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">Add Story</span>
            </div>

            {/* Other User Stories */}
            {Object.entries(groupedStories).map(([userId, userStories]) => {
                const author = users.find(u => u.id === userId);
                if (!author) return null;
                
                const isMe = currentUser?.id === userId;
                const isFollowing = currentUser?.followingIds.includes(userId);
                
                // Visible only to people who follow you (and friends/you)
                if (!isMe && !isFollowing) return null;

                const hasUnseen = true; // In a real app we'd check views
                
                return (
                    <div key={userId} className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => setViewingStoryId(userStories[0].id)}>
                        <div className={`w-16 h-16 rounded-full p-[2px] ${hasUnseen ? 'bg-gradient-to-tr from-yellow-400 to-nexus-600' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
                             <img src={author.avatar} className="w-full h-full rounded-full border-2 border-white dark:border-zinc-900 object-cover" />
                        </div>
                        <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium w-16 truncate text-center">{author.name}</span>
                    </div>
                );
            })}
        </div>
      </div>

      {/* Story Creator Modal */}
      {isCreatingStory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-zinc-900 rounded-xl w-full max-w-sm overflow-hidden flex flex-col h-[500px]">
                  <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between">
                      <h3 className="font-bold dark:text-white">Create Story</h3>
                      <button onClick={() => setIsCreatingStory(false)} className="text-zinc-500"><X size={20}/></button>
                  </div>
                  
                  <div className="flex-1 bg-zinc-100 dark:bg-zinc-950 relative flex items-center justify-center overflow-hidden">
                      {isUploading ? (
                          <div className="flex flex-col items-center gap-2 text-zinc-500">
                              <Loader2 size={32} className="animate-spin text-nexus-600" />
                              <span className="text-sm">Processing media...</span>
                          </div>
                      ) : storyMedia ? (
                          storyMedia.type === 'video' ? (
                              <video src={storyMedia.url} className="w-full h-full object-cover" controls />
                          ) : (
                              <img src={storyMedia.url} className="w-full h-full object-cover" />
                          )
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                            <textarea
                                value={storyContent}
                                onChange={(e) => setStoryContent(e.target.value)}
                                placeholder="Type something..."
                                className="bg-transparent text-white text-center text-xl font-bold placeholder-white/70 w-full p-4 resize-none focus:outline-none h-full flex items-center justify-center"
                                autoFocus
                            />
                        </div>
                      )}
                      
                      {storyMedia && (
                          <button 
                            onClick={() => setStoryMedia(null)}
                            className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"
                          >
                              <X size={16} />
                          </button>
                      )}
                  </div>

                  <div className="p-4 space-y-3">
                      <div className="flex justify-center gap-4">
                           <label className={`flex items-center gap-2 cursor-pointer bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                               <Image size={18} className="text-nexus-600" />
                               <span className="dark:text-white">Photo</span>
                               <input type="file" accept="image/*" className="hidden" onChange={handleStoryMediaUpload} disabled={isUploading} />
                           </label>
                           <label className={`flex items-center gap-2 cursor-pointer bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                               <Video size={18} className="text-pink-600" />
                               <span className="dark:text-white">Video</span>
                               <input type="file" accept="video/*" className="hidden" onChange={handleStoryMediaUpload} disabled={isUploading} />
                           </label>
                      </div>
                      <button 
                        onClick={handleCreateStory} 
                        className="w-full bg-nexus-600 text-white py-3 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                        disabled={(!storyContent.trim() && !storyMedia) || isUploading}
                      >
                          {isUploading ? <Loader2 size={18} className="animate-spin" /> : 'Share to Story'}
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

                           {story.userId === currentUser?.id && (
                               <div className="absolute bottom-4 right-4 text-white text-xs opacity-70 flex items-center gap-1 z-10">
                                    <Eye size={14} /> {story.viewers.length} views
                               </div>
                           )}
                       </div>
                   )
               })()}
          </div>
      )}
      
      {/* Create Post */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-4 mb-6 transition-colors">
        <div className="flex gap-3 mb-3">
          <img 
            src={currentUser?.avatar} 
            alt="Me" 
            className="w-10 h-10 rounded-full object-cover cursor-pointer border border-zinc-100 dark:border-zinc-700" 
            onClick={() => currentUser && goToProfile(currentUser.id)}
          />
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder={t('post_placeholder')}
            className="flex-1 resize-none border-none focus:ring-0 bg-zinc-50 dark:bg-zinc-950/50 dark:text-white rounded-lg p-3 min-h-[80px] placeholder-zinc-400 dark:placeholder-zinc-500"
          />
        </div>
        
        {/* Selected Media Preview Grid */}
        {selectedMedia.length > 0 && (
          <div className="mb-3 grid grid-cols-3 gap-2">
            {selectedMedia.map((media, index) => (
                <div key={index} className="relative group aspect-square rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    {media.type === 'video' ? (
                        <video src={media.url} className="w-full h-full object-cover" />
                    ) : (
                        <img src={media.url} alt="Selected" className="w-full h-full object-cover" />
                    )}
                    <button 
                        onClick={() => removeSelectedMedia(index)}
                        className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                    >
                        <X size={12} />
                    </button>
                    {media.type === 'video' && <div className="absolute bottom-1 right-1 bg-black/50 px-1 rounded text-[10px] text-white">VIDEO</div>}
                </div>
            ))}
          </div>
        )}

        {isUploading && (
            <div className="mb-3 flex items-center gap-2 text-sm text-nexus-600 dark:text-nexus-400">
                <Loader2 size={16} className="animate-spin" />
                <span>Processing media...</span>
            </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex gap-2">
            <label className={`flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer text-nexus-600 dark:text-nexus-400 text-sm font-medium transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
              <Image size={18} />
              <span>{t('photo')}</span>
              <input type="file" accept="image/*,video/*" className="hidden" onChange={handleMediaUpload} disabled={isUploading} />
            </label>
            <button 
              onClick={handleAIEnhance}
              disabled={isGenerating || !newPostContent || isUploading}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Wand2 size={18} />
              <span>{isGenerating ? '...' : t('ai_enhance')}</span>
            </button>
          </div>
          
          <button
            onClick={handleCreatePost}
            disabled={(!newPostContent.trim() && selectedMedia.length === 0) || isUploading}
            className="bg-nexus-600 text-white px-5 py-2 rounded-full font-medium hover:bg-nexus-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
          >
            <span>{t('post_btn')}</span>
            {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="mb-6 space-y-4">
        <div className="relative">
            <input
            type="text"
            placeholder={t('search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-nexus-500 placeholder-zinc-400 dark:placeholder-zinc-500 shadow-sm"
            />
            <Search className="absolute left-3.5 top-3 text-zinc-400 dark:text-zinc-500" size={18} />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            <FilterButton type="all" label="All Posts" icon={Globe} />
            <FilterButton type="recommended" label="For You" icon={Sparkles} />
            <FilterButton type="following" label="Following" icon={UserCheck} />
            <FilterButton type="mine" label="My Posts" icon={User} />
            <FilterButton type="liked" label="Liked" icon={Heart} />
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {visiblePosts.map(post => {
          const author = users.find(u => u.id === post.userId);
          // Don't skip if author is missing, render a fallback. This ensures posts aren't hidden by sync errors.
          if (!author) {
              return (
                  <div key={post.id} className="bg-red-50 p-4 rounded text-red-500 text-xs">
                      Error loading post author ({post.userId}). Post ID: {post.id}
                  </div>
              )
          }
          return <PostCard key={post.id} post={post} author={author} />;
        })}
        {visiblePosts.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <Filter size={48} className="mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">No posts found matching your criteria.</p>
            <div className="flex justify-center gap-2 mt-3">
                 <button 
                    onClick={() => { setSearchTerm(''); setActiveFilter('all'); }}
                    className="text-nexus-600 dark:text-nexus-400 text-sm hover:underline"
                >
                    Clear Search
                </button>
                 {activeFilter !== 'all' && (
                     <button 
                        onClick={() => setActiveFilter('all')}
                        className="text-nexus-600 dark:text-nexus-400 text-sm hover:underline"
                    >
                        View All Posts
                    </button>
                 )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;