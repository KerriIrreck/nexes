import React, { useState } from 'react';
import { Post, User } from '../types';
import { useSocial } from '../context/SocialContext';
import { Heart, MessageCircle, Share2, Trash2, Pencil, X, Check, Copy, Link as LinkIcon, Play, Database, Globe, Loader2, Send } from 'lucide-react';
import { translateText } from '../services/geminiService';

interface PostCardProps {
  post: Post;
  author: User;
}

const PostCard: React.FC<PostCardProps> = ({ post, author }) => {
  const { currentUser, users, likePost, addComment, deletePost, editPost, goToProfile, language, t, getFriends, sendDirectMessage } = useSocial();
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Translation State
  const [translatedContent, setTranslatedContent] = useState('');
  const [showTranslation, setShowTranslation] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  // Generate the formatted ID for display
  const numericId = post.id.replace(/\D/g, '');
  const permalink = `nexes.post.${numericId || post.id}`;

  const isLiked = currentUser ? post.likedBy.includes(currentUser.id) : false;
  const friends = getFriends();

  const handleLike = () => likePost(post.id);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(post.id, commentText);
    setCommentText('');
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this post?')) {
      deletePost(post.id);
    }
  };

  const handleSaveEdit = () => {
      if (editContent.trim()) {
          editPost(post.id, editContent);
          setIsEditing(false);
      }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
      e.stopPropagation();
      navigator.clipboard.writeText(permalink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleTranslate = async () => {
      if (showTranslation) {
          setShowTranslation(false);
          return;
      }

      if (translatedContent) {
          setShowTranslation(true);
          return;
      }

      setIsTranslating(true);
      const translated = await translateText(post.content, language);
      setTranslatedContent(translated);
      setShowTranslation(true);
      setIsTranslating(false);
  };
  
  const handleShareToFriend = (e: React.MouseEvent, friendId: string) => {
      e.stopPropagation();
      sendDirectMessage(friendId, "", 'text', post.id, undefined);
      setShowShareModal(false);
      alert("Post shared!");
  };

  const toggleShareModal = (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowShareModal(!showShareModal);
  };

  const isAuthor = currentUser?.id === post.userId;
  const canDelete = currentUser?.role === 'ADMIN' || isAuthor;

  // Helper to render media grid
  const renderMedia = () => {
      if (!post.media || post.media.length === 0) {
          // Backward compatibility for old posts if any still exist in local storage without 'media' key
          // @ts-ignore
          if (post.imageUrl) return (
             <div className="w-full bg-zinc-100 dark:bg-zinc-950">
                <img src={(post as any).imageUrl} alt="Post content" className="w-full h-auto max-h-[800px] object-cover mx-auto block" />
             </div>
          );
          return null;
      }

      if (post.media.length === 1) {
          const item = post.media[0];
          return (
             <div className="w-full bg-zinc-100 dark:bg-zinc-950">
                 {item.type === 'video' ? (
                     <video src={item.url} controls className="w-full max-h-[800px] mx-auto block" />
                 ) : (
                     <img src={item.url} alt="Post content" className="w-full h-auto max-h-[800px] object-cover mx-auto block" />
                 )}
             </div>
          );
      }

      // Special Grid for 3 items (One main, two smaller)
      if (post.media.length === 3) {
           return (
              <div className="grid grid-cols-2 gap-0.5 aspect-[4/3]">
                  <div className="relative col-span-2 row-span-2 bg-zinc-100 dark:bg-zinc-950">
                      {post.media[0].type === 'video' ? (
                          <video src={post.media[0].url} className="w-full h-full object-cover" controls />
                      ) : (
                          <img src={post.media[0].url} className="w-full h-full object-cover" />
                      )}
                  </div>
                  <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-950">
                       {post.media[1].type === 'video' ? (
                          <video src={post.media[1].url} className="w-full h-full object-cover" controls />
                      ) : (
                          <img src={post.media[1].url} className="w-full h-full object-cover" />
                      )}
                  </div>
                  <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-950">
                       {post.media[2].type === 'video' ? (
                          <video src={post.media[2].url} className="w-full h-full object-cover" controls />
                      ) : (
                          <img src={post.media[2].url} className="w-full h-full object-cover" />
                      )}
                  </div>
              </div>
          );
      }

      // Default Grid for 2, 4 or more items (Simple square grid)
      return (
          <div className={`grid gap-0.5 ${post.media.length % 2 === 0 ? 'grid-cols-2' : 'grid-cols-2'}`}>
              {post.media.map((item, index) => (
                  <div key={index} className="relative aspect-square bg-zinc-100 dark:bg-zinc-950">
                      {item.type === 'video' ? (
                          <div className="w-full h-full relative group">
                               <video src={item.url} className="w-full h-full object-cover" controls />
                          </div>
                      ) : (
                          <img src={item.url} alt={`Content ${index}`} className="w-full h-full object-cover" />
                      )}
                  </div>
              ))}
          </div>
      );
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden mb-4 transition-colors relative group/card">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img 
            src={author.avatar} 
            alt={author.name} 
            className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 border border-zinc-100 dark:border-zinc-700"
            onClick={() => goToProfile(author.id)}
          />
          <div>
            <h3 
                className="font-semibold text-zinc-900 dark:text-white cursor-pointer hover:underline text-base flex items-center gap-1.5"
                onClick={() => goToProfile(author.id)}
            >
                {author.name}
                {post.baseTxId && (
                    <div className="group/base relative">
                        <Database size={12} className="text-blue-500" />
                        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-zinc-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/base:opacity-100 pointer-events-none whitespace-nowrap z-10 font-mono">
                            Base L2: {post.baseTxId.substring(0, 8)}...
                        </div>
                    </div>
                )}
            </h3>
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <span>{author.handle}</span>
                <span>•</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
            {isAuthor && !isEditing && (
                <button onClick={() => setIsEditing(true)} className="text-zinc-400 hover:text-nexus-600 dark:text-zinc-500 dark:hover:text-nexus-400 transition-colors" title={t('edit_post')}>
                    <Pencil size={18} />
                </button>
            )}
            {canDelete && !isEditing && (
                <button onClick={handleDelete} className="text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 transition-colors" title={t('delete')}>
                    <Trash2 size={18} />
                </button>
            )}
        </div>
      </div>

      {/* Media Content */}
      {renderMedia()}

      {/* Content / Description at Bottom */}
      <div className="px-4 py-3">
        {isEditing ? (
            <div className="space-y-2">
                <textarea 
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-nexus-500"
                    rows={3}
                />
                <div className="flex justify-end gap-2">
                    <button onClick={() => setIsEditing(false)} className="text-xs px-3 py-1.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 hover:opacity-80">
                        {t('cancel')}
                    </button>
                    <button onClick={handleSaveEdit} className="text-xs px-3 py-1.5 rounded bg-nexus-600 text-white hover:bg-nexus-700">
                        {t('save_post')}
                    </button>
                </div>
            </div>
        ) : (
            <div>
                 <p className="text-zinc-800 dark:text-zinc-100 whitespace-pre-wrap text-base leading-relaxed">
                     {showTranslation ? translatedContent : post.content}
                 </p>
                 {/* Translation Controls */}
                 {post.content && (
                     <div className="mt-2">
                         <button 
                             onClick={handleTranslate}
                             disabled={isTranslating}
                             className="text-xs flex items-center gap-1.5 text-nexus-600 dark:text-nexus-400 font-medium hover:underline"
                         >
                             {isTranslating ? (
                                 <Loader2 size={12} className="animate-spin" />
                             ) : (
                                 <Globe size={12} />
                             )}
                             {isTranslating ? 'Translating...' : showTranslation ? 'See Original' : `Translate`}
                         </button>
                     </div>
                 )}
            </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/50">
        <div className="flex space-x-6 relative">
          <button 
            onClick={handleLike}
            className={`flex items-center space-x-2 transition-colors group ${
              isLiked ? 'text-red-500' : 'text-zinc-600 dark:text-zinc-300 hover:text-red-500 dark:hover:text-red-400'
            }`}
          >
            <Heart size={20} className={`${isLiked ? 'fill-red-500' : 'group-hover:fill-red-500'}`} />
            <span className="text-sm font-medium">{post.likedBy.length}</span>
          </button>
          
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-zinc-600 dark:text-zinc-300 hover:text-nexus-600 dark:hover:text-nexus-400 transition-colors"
          >
            <MessageCircle size={20} />
            <span className="text-sm font-medium">{post.comments.length}</span>
          </button>

          <button 
            onClick={toggleShareModal}
            className="flex items-center space-x-2 text-zinc-600 dark:text-zinc-300 hover:text-nexus-600 dark:hover:text-nexus-400 transition-colors"
            title="Share"
          >
             <Share2 size={20} />
          </button>
          
           {/* Share Popover */}
           {showShareModal && (
              <div 
                className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 z-50 p-2"
                onClick={(e) => e.stopPropagation()}
              >
                  <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 px-2 py-1 uppercase">{t('share_to')}</h4>
                  <div className="max-h-48 overflow-y-auto">
                      {friends.length > 0 ? (
                          friends.map(friend => (
                              <button 
                                key={friend.id}
                                onClick={(e) => handleShareToFriend(e, friend.id)}
                                className="w-full flex items-center gap-2 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg text-left"
                              >
                                  <img src={friend.avatar} className="w-6 h-6 rounded-full" />
                                  <span className="text-sm text-zinc-800 dark:text-zinc-200 truncate">{friend.name}</span>
                                  <Send size={12} className="ml-auto text-zinc-400" />
                              </button>
                          ))
                      ) : (
                          <div className="text-xs text-zinc-400 p-2 italic">Follow people back to add friends.</div>
                      )}
                  </div>
                  <div className="border-t border-zinc-100 dark:border-zinc-700 mt-2 pt-2">
                        <button 
                            onClick={(e) => { handleCopyLink(e); setShowShareModal(false); }}
                            className="w-full flex items-center gap-2 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg text-left text-sm text-zinc-600 dark:text-zinc-300"
                        >
                            <LinkIcon size={14} /> Copy Link
                        </button>
                  </div>
              </div>
           )}
        </div>

        {/* Post ID / Permalink Display */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-600 font-mono opacity-60 hover:opacity-100 transition-opacity select-all cursor-text" onClick={handleCopyLink}>
            <LinkIcon size={10} />
            {permalink}
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="bg-zinc-50 dark:bg-zinc-950/30 p-4 border-t border-zinc-100 dark:border-zinc-800">
          <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">{t('comments')}</h4>
          <div className="space-y-4 mb-4">
            {post.comments.map(comment => {
              const commenter = users.find(u => u.id === comment.userId);
              // Fallback if user is deleted or not found
              const commenterName = commenter ? commenter.name : 'Unknown User';
              const commenterAvatar = commenter ? commenter.avatar : `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.userId}`;

              return (
                <div key={comment.id} className="flex gap-3 group">
                   <img 
                      src={commenterAvatar} 
                      alt={commenterName} 
                      className="w-8 h-8 rounded-full object-cover cursor-pointer hover:opacity-80"
                      onClick={() => goToProfile(comment.userId)}
                   />
                   <div className="flex-1">
                     <div className="bg-white dark:bg-zinc-800 px-3 py-2 rounded-2xl rounded-tl-none shadow-sm border border-zinc-200 dark:border-zinc-700 inline-block max-w-full">
                        <div className="flex items-baseline gap-2 mb-0.5">
                            <span 
                                className="font-semibold text-xs text-zinc-900 dark:text-white cursor-pointer hover:underline"
                                onClick={() => goToProfile(comment.userId)}
                            >
                                {commenterName}
                            </span>
                            <span className="text-[10px] text-zinc-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span className="text-sm text-zinc-800 dark:text-zinc-200 block leading-snug">{comment.text}</span>
                     </div>
                   </div>
                </div>
              );
            })}
            {post.comments.length === 0 && <p className="text-xs text-zinc-400 dark:text-zinc-500 italic">No comments yet. Be the first to start the conversation!</p>}
          </div>
          
          <form onSubmit={handleCommentSubmit} className="flex gap-3 items-center">
            <img 
                src={currentUser?.avatar} 
                className="w-8 h-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-700" 
            />
            <div className="flex-1 relative">
                <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="w-full pl-4 pr-12 py-2 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-nexus-500 text-sm placeholder-zinc-400 dark:placeholder-zinc-500"
                />
                <button 
                type="submit" 
                disabled={!commentText.trim()}
                className="absolute right-1 top-1 p-1.5 bg-nexus-600 text-white rounded-full hover:bg-nexus-700 disabled:opacity-50 transition-colors"
                >
                    <Check size={14} />
                </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;