import React, { useState, useEffect, useRef } from 'react';
import { useSocial, fileToBase64 } from '../context/SocialContext';
import { Send, Hash, User as UserIcon, Image, Video, Smile, Paperclip, Flame, MoreVertical, Edit2, Trash2, X, Check } from 'lucide-react';
import { MessageType } from '../types';

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '🎉', '👋'];
const STICKERS = [
    'https://cdn-icons-png.flaticon.com/128/9260/9260761.png',
    'https://cdn-icons-png.flaticon.com/128/9408/9408201.png',
    'https://cdn-icons-png.flaticon.com/128/166/166538.png',
    'https://cdn-icons-png.flaticon.com/128/742/742751.png'
];

const Messages: React.FC = () => {
    const { currentUser, users, getFriends, getFriendship, directMessages, sendDirectMessage, editDirectMessage, deleteDirectMessage, markDmAsRead, addDmReaction, posts, t } = useSocial();
    const friends = getFriends();
    const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
    const [messageInput, setMessageInput] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    
    const chatEndRef = useRef<HTMLDivElement>(null);
    // Track message count to determine when to auto-scroll
    const prevMessageCountRef = useRef<number>(0);

    const activeChatMessages = selectedFriendId 
        ? directMessages.filter(m => (m.senderId === currentUser?.id && m.receiverId === selectedFriendId) || (m.senderId === selectedFriendId && m.receiverId === currentUser?.id))
        : [];
    
    const currentFriendship = selectedFriendId ? getFriendship(selectedFriendId) : undefined;

    useEffect(() => {
        if (selectedFriendId) {
            markDmAsRead(selectedFriendId);
            // Initial scroll on open
            scrollToBottom();
            prevMessageCountRef.current = activeChatMessages.length;
        }
    }, [selectedFriendId]); // Only scroll on friend selection change

    useEffect(() => {
        // Smart scroll: Only scroll if a NEW message was added (count increased)
        // This prevents snapping to bottom when editing or when just reading history
        if (activeChatMessages.length > prevMessageCountRef.current) {
            scrollToBottom();
        }
        prevMessageCountRef.current = activeChatMessages.length;
    }, [activeChatMessages.length]);

    const scrollToBottom = () => {
        // Small timeout to ensure DOM is updated
        setTimeout(() => {
            chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 50);
    };

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!messageInput.trim() || !selectedFriendId) return;
        sendDirectMessage(selectedFriendId, messageInput, 'text');
        setMessageInput('');
        setShowEmojiPicker(false);
    };

    const handleStartEdit = (messageId: string, content: string) => {
        setEditingMessageId(messageId);
        setEditContent(content);
        setHoveredMessageId(null); // Hide menu
    };

    const handleSaveEdit = () => {
        if (editingMessageId && editContent.trim()) {
            editDirectMessage(editingMessageId, editContent);
            setEditingMessageId(null);
            setEditContent('');
        }
    };

    const handleCancelEdit = () => {
        setEditingMessageId(null);
        setEditContent('');
    };

    const handleDelete = (messageId: string) => {
        if (confirm("Are you sure you want to delete this message?")) {
            deleteDirectMessage(messageId);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && selectedFriendId) {
            const file = e.target.files[0];
            const base64 = await fileToBase64(file);
            const type: MessageType = file.type.startsWith('video') ? 'video' : 'image';
            sendDirectMessage(selectedFriendId, base64, type);
            setShowAttachMenu(false);
        }
    };

    const handleEmojiClick = (emoji: string) => {
        setMessageInput(prev => prev + emoji);
    };

    const handleStickerClick = (url: string) => {
        if (selectedFriendId) {
            sendDirectMessage(selectedFriendId, url, 'sticker');
            setShowEmojiPicker(false);
        }
    };

    const selectedFriend = users.find(u => u.id === selectedFriendId);

    const MessageContent = ({ message }: { message: any }) => {
        switch (message.type) {
            case 'image':
                return <img src={message.content} alt="Sent image" className="rounded-lg max-w-full max-h-60 object-cover" />;
            case 'video':
                return <video src={message.content} controls className="rounded-lg max-w-full max-h-60" />;
            case 'audio':
                return (
                    <div className="flex items-center gap-2 min-w-[220px] bg-black/10 rounded p-2">
                        <span className="text-xs italic opacity-70">Voice messages are no longer supported.</span>
                    </div>
                );
            case 'sticker':
                return <img src={message.content} alt="Sticker" className="w-24 h-24 object-contain" />;
            default: // text
                return <div>{message.content}</div>;
        }
    };

    return (
        <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-2rem)] flex bg-white dark:bg-zinc-900 md:rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 m-0 md:m-4 overflow-hidden">
            {/* Friends List (Sidebar) */}
            <div className={`w-full md:w-80 border-r border-zinc-100 dark:border-zinc-800 flex flex-col ${selectedFriendId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 font-bold text-lg dark:text-white">
                    {t('nav_messages')}
                </div>
                <div className="flex-1 overflow-y-auto">
                    {friends.length === 0 ? (
                        <div className="p-4 text-center text-zinc-500 text-sm">
                            <p>No friends yet.</p>
                            <p className="text-xs mt-1">Follow people who follow you back to become friends.</p>
                        </div>
                    ) : (
                        friends.map(friend => {
                            // Find last message
                            const lastMsg = directMessages
                                .filter(m => (m.senderId === currentUser?.id && m.receiverId === friend.id) || (m.senderId === friend.id && m.receiverId === currentUser?.id))
                                .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                            
                            const unreadCount = directMessages.filter(m => m.senderId === friend.id && m.receiverId === currentUser?.id && !m.read).length;
                            const friendship = getFriendship(friend.id);

                            return (
                                <button 
                                    key={friend.id}
                                    onClick={() => setSelectedFriendId(friend.id)}
                                    className={`w-full flex items-center gap-3 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-left border-b border-zinc-50 dark:border-zinc-800/50 ${selectedFriendId === friend.id ? 'bg-nexus-50 dark:bg-nexus-900/10' : ''}`}
                                >
                                    <div className="relative">
                                        <img src={friend.avatar} className="w-12 h-12 rounded-full object-cover" />
                                        {unreadCount > 0 && (
                                            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm">
                                                {unreadCount}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <div className="font-semibold text-zinc-900 dark:text-white truncate max-w-[120px]">{friend.name}</div>
                                            {friendship && friendship.streak > 0 && (
                                                <div className="flex items-center gap-0.5 text-orange-500 text-xs font-bold bg-orange-100 dark:bg-orange-900/30 px-1.5 py-0.5 rounded-full">
                                                    <Flame size={12} fill="currentColor" /> {friendship.streak}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-xs text-zinc-500 truncate mt-1">
                                            {lastMsg ? (
                                                <span className={!lastMsg.read && lastMsg.receiverId === currentUser?.id ? 'font-bold text-zinc-800 dark:text-zinc-200' : ''}>
                                                    {lastMsg.senderId === currentUser?.id ? 'You: ' : ''}
                                                    {lastMsg.type !== 'text' ? `Sent a ${lastMsg.type}` : lastMsg.content || 'Shared content'}
                                                </span>
                                            ) : 'Start a conversation'}
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col relative ${!selectedFriendId ? 'hidden md:flex' : 'flex'}`}>
                {selectedFriend ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900 z-10 shrink-0">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setSelectedFriendId(null)} className="md:hidden text-zinc-500"><UserIcon size={24}/></button>
                                <img src={selectedFriend.avatar} className="w-10 h-10 rounded-full" />
                                <div>
                                    <div className="font-bold text-zinc-900 dark:text-white">{selectedFriend.name}</div>
                                    {currentFriendship && currentFriendship.streak > 0 && (
                                        <div className="text-xs text-orange-500 font-medium flex items-center gap-1">
                                            <Flame size={12} fill="currentColor" /> {currentFriendship.streak} Day Spark!
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Messages Container */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50 dark:bg-zinc-950/50 min-h-0">
                            {activeChatMessages.length === 0 && (
                                <div className="text-center py-20 text-zinc-400">
                                    <p>No messages yet. Say hello!</p>
                                </div>
                            )}
                            
                            {activeChatMessages.map(msg => {
                                const isMe = msg.senderId === currentUser?.id;
                                const isEditing = editingMessageId === msg.id;
                                const sharedPost = msg.sharedPostId ? posts.find(p => p.id === msg.sharedPostId) : null;
                                
                                return (
                                    <div 
                                        key={msg.id} 
                                        className={`flex flex-col group relative ${isMe ? 'items-end' : 'items-start'}`}
                                        onMouseEnter={() => !isEditing && setHoveredMessageId(msg.id)}
                                        onMouseLeave={() => setHoveredMessageId(null)}
                                    >
                                        <div className={`max-w-[85%] rounded-2xl p-3 relative ${
                                            isMe 
                                            ? 'bg-nexus-600 text-white rounded-tr-none' 
                                            : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-tl-none'
                                        }`}>
                                            {isEditing ? (
                                                <div className="min-w-[200px]">
                                                    <input 
                                                        type="text" 
                                                        value={editContent}
                                                        onChange={(e) => setEditContent(e.target.value)}
                                                        className="w-full bg-white/20 text-white placeholder-white/70 rounded px-2 py-1 mb-2 text-sm outline-none border border-white/30"
                                                        autoFocus
                                                    />
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={handleCancelEdit} className="p-1 hover:bg-white/20 rounded"><X size={14}/></button>
                                                        <button onClick={handleSaveEdit} className="p-1 hover:bg-white/20 rounded"><Check size={14}/></button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <MessageContent message={msg} />
                                            )}
                                            
                                            {/* Shared Post Preview */}
                                            {sharedPost && !isEditing && (
                                                <div className="mt-2 bg-white/20 dark:bg-black/20 rounded-lg p-2 overflow-hidden text-left">
                                                    <div className="text-[10px] opacity-80 mb-1 flex items-center gap-1">
                                                        <img src={users.find(u => u.id === sharedPost.userId)?.avatar} className="w-3 h-3 rounded-full" />
                                                        <span className="truncate max-w-[100px]">{users.find(u => u.id === sharedPost.userId)?.name}</span>
                                                    </div>
                                                    {sharedPost.media && sharedPost.media.length > 0 && (
                                                        <div className="w-full h-24 mb-1 rounded bg-black/10">
                                                            {sharedPost.media[0].type === 'image' && <img src={sharedPost.media[0].url} className="w-full h-full object-cover rounded" />}
                                                        </div>
                                                    )}
                                                    <div className="text-xs truncate line-clamp-2">{sharedPost.content}</div>
                                                </div>
                                            )}

                                            {/* Reactions Display */}
                                            {Object.keys(msg.reactions || {}).length > 0 && (
                                                <div className="absolute -bottom-3 right-0 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full px-1.5 py-0.5 text-[10px] shadow-sm flex gap-0.5">
                                                    {Object.values(msg.reactions).map((emoji, i) => <span key={i}>{emoji}</span>)}
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-[10px] text-zinc-400 mt-1 px-1">
                                            {new Date(msg.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                        </div>

                                        {/* Actions Menu (Edit/Delete) */}
                                        {isMe && hoveredMessageId === msg.id && !isEditing && (
                                            <div className="absolute top-1 right-[calc(100%+8px)] bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 py-1 flex flex-col z-20 animate-fade-in">
                                                {msg.type === 'text' && (
                                                    <button 
                                                        onClick={() => handleStartEdit(msg.id, msg.content)}
                                                        className="px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-xs flex items-center gap-2 text-zinc-700 dark:text-zinc-200"
                                                    >
                                                        <Edit2 size={12} /> Edit
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleDelete(msg.id)}
                                                    className="px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-xs flex items-center gap-2 text-red-600 dark:text-red-400"
                                                >
                                                    <Trash2 size={12} /> Delete
                                                </button>
                                            </div>
                                        )}

                                        {/* Reaction Picker Popover */}
                                        {hoveredMessageId === msg.id && !isEditing && (
                                            <div className={`absolute top-0 -mt-8 bg-white dark:bg-zinc-800 shadow-lg rounded-full px-2 py-1 flex gap-1 animate-fade-in z-20 border border-zinc-200 dark:border-zinc-700 ${isMe ? 'right-0' : 'left-0'}`}>
                                                {['❤️', '😂', '😮', '🔥'].map(emoji => (
                                                    <button 
                                                        key={emoji} 
                                                        onClick={() => addDmReaction(msg.id, emoji)}
                                                        className="hover:scale-125 transition-transform"
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-3 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex gap-2 items-end relative shrink-0">
                            {/* Attachment Menu */}
                            {showAttachMenu && (
                                <div className="absolute bottom-16 left-4 bg-white dark:bg-zinc-800 shadow-xl rounded-xl border border-zinc-200 dark:border-zinc-700 p-2 flex flex-col gap-2 z-20 animate-fade-in w-40">
                                    <label className="flex items-center gap-2 px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg cursor-pointer text-sm text-zinc-700 dark:text-zinc-200">
                                        <Image size={18} className="text-blue-500" /> Photo
                                        <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                                    </label>
                                    <label className="flex items-center gap-2 px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg cursor-pointer text-sm text-zinc-700 dark:text-zinc-200">
                                        <Video size={18} className="text-pink-500" /> Video
                                        <input type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />
                                    </label>
                                </div>
                            )}

                            {/* Emoji/Sticker Picker */}
                            {showEmojiPicker && (
                                <div className="absolute bottom-16 left-10 w-64 bg-white dark:bg-zinc-800 shadow-xl rounded-xl border border-zinc-200 dark:border-zinc-700 z-20 overflow-hidden flex flex-col h-64">
                                    <div className="flex border-b border-zinc-200 dark:border-zinc-700">
                                        <div className="flex-1 text-center py-2 text-xs font-bold text-zinc-500 bg-zinc-50 dark:bg-zinc-900">Emojis</div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-2 grid grid-cols-5 gap-2">
                                        {EMOJIS.map(e => (
                                            <button key={e} type="button" onClick={() => handleEmojiClick(e)} className="text-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded p-1">{e}</button>
                                        ))}
                                    </div>
                                    <div className="border-t border-zinc-200 dark:border-zinc-700">
                                        <div className="text-center py-1 text-xs font-bold text-zinc-500 bg-zinc-50 dark:bg-zinc-900">Stickers</div>
                                        <div className="p-2 flex gap-2 overflow-x-auto">
                                            {STICKERS.map((s, i) => (
                                                <button key={i} type="button" onClick={() => handleStickerClick(s)} className="hover:scale-110 transition-transform">
                                                    <img src={s} className="w-10 h-10 object-contain" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button 
                                type="button" 
                                onClick={() => setShowAttachMenu(!showAttachMenu)}
                                className="p-2 text-zinc-500 hover:text-nexus-600 transition-colors"
                            >
                                <Paperclip size={20} />
                            </button>

                            <button 
                                type="button" 
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className="p-2 text-zinc-500 hover:text-yellow-500 transition-colors"
                            >
                                <Smile size={20} />
                            </button>

                            <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center px-3">
                                <input 
                                    type="text" 
                                    value={messageInput}
                                    onChange={e => setMessageInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 py-2.5 text-zinc-900 dark:text-white placeholder-zinc-400"
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={!messageInput.trim()}
                                className="bg-nexus-600 text-white p-2.5 rounded-full hover:bg-nexus-700 transition-colors shadow-sm disabled:opacity-50"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-400">
                        <Hash size={48} className="mb-4 opacity-20" />
                        <p>Select a friend to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;