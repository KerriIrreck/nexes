
export enum UserRole {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN'
}

export interface UserStatus {
  text: string;
  emoji: string; // The "sticker"
}

export interface UserPreferences {
  language?: string;
  theme?: 'light' | 'dark';
  breathingEnabled?: boolean;
}

export interface User {
  id: string;
  name: string;
  handle: string;
  email: string;
  password?: string;
  avatar: string;
  coverImage: string;
  bio: string;
  location?: string;
  role: UserRole;
  followers: number;
  following: number;
  followingIds: string[]; 
  belledUserIds?: string[]; // IDs of users this user has turned notifications on for
  joinedAt: string;
  isBanned?: boolean;
  isPrivate?: boolean;
  status?: UserStatus;
  preferences?: UserPreferences;
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

export interface Post {
  id: string;
  userId: string;
  clanId?: string;
  content: string;
  media: MediaItem[]; // Replaced single imageUrl with array
  likedBy: string[];
  comments: Comment[];
  createdAt: string;
  isDeleted?: boolean;
  baseTxId?: string; // Blockchain Transaction ID
}

export interface ClanRole {
  id: string;
  name: string;
  color: string; // Hex code for badge color
}

export interface ClanMessage {
  id: string;
  clanId: string;
  userId: string;
  text: string;
  createdAt: string;
}

export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'sticker' | 'gif';

export interface DirectMessage {
  id: string;
  senderId: string;
  receiverId: string;
  type: MessageType;
  content?: string; // Text content or URL for media
  sharedPostId?: string;
  sharedStoryId?: string;
  createdAt: string;
  read: boolean;
  reactions: Record<string, string>; // userId -> emoji
}

export interface Friendship {
  user1Id: string;
  user2Id: string;
  streak: number;
  lastInteraction: string; // ISO Date of last message exchange
}

export interface Clan {
  id: string;
  name: string;
  description: string;
  banner: string;
  ownerId: string;
  moderatorIds: string[];
  invitedUserIds: string[];
  memberCount: number;
  powerScore: number;
  members: string[];
  // Custom Roles
  fanRoles: ClanRole[];
  memberRoles: Record<string, string[]>; // userId -> array of roleIds
  // Leveling & Meta
  createdAt: string;
  level: number;
  experience: number;
}

export interface Story {
  id: string;
  userId: string;
  content: string; // Text content or Media URL
  mediaType?: 'image' | 'video'; // If present, content is the URL
  type: 'text' | 'media'; 
  createdAt: string;
  expiresAt: string; // 24h expiration
  isPinned: boolean;
  viewers: string[];
}

export type NotificationType = 'LIKE' | 'COMMENT' | 'FOLLOW' | 'CLAN_INVITE' | 'NEW_POST' | 'MESSAGE';

export interface Notification {
  id: string;
  userId: string;
  actorId: string;
  type: NotificationType;
  postId?: string;
  clanId?: string;
  read: boolean;
  createdAt: string;
}

export type NavigationTab = 'feed' | 'search' | 'profile' | 'clans' | 'messages' | 'admin' | 'notifications' | 'settings';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export type Theme = 'light' | 'dark';
export type Language = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'ru';