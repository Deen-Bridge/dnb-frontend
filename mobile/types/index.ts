export interface User {
  id: string;
  email: string;
  name: string;
  displayName?: string;
  avatar?: string;
  role: "student" | "mentor" | "admin";
  isVerified: boolean;
  walletAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  educator: User;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  price: number;
  currency: string;
  enrolledCount: number;
  rating: number;
  reviewCount: number;
  isEnrolled?: boolean;
  progress?: number;
  createdAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage?: string;
  category: string;
  price: number;
  currency: string;
  pageCount: number;
  isPurchased?: boolean;
  createdAt: string;
}

export interface Space {
  id: string;
  name: string;
  description: string;
  coverImage?: string;
  mentor: User;
  memberCount: number;
  isLive: boolean;
  createdAt: string;
}

export interface Reel {
  id: string;
  title: string;
  videoUrl: string;
  thumbnail?: string;
  creator: User;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: User;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  type: "purchase" | "donation" | "earning";
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed";
  txHash?: string;
  description: string;
  createdAt: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export type RootStackParamList = {
  "(auth)": undefined;
  "(tabs)": undefined;
  "course/[id]": { id: string };
  "book/[id]": { id: string };
  "space/[id]": { id: string };
  "reel/[id]": { id: string };
  "chat/[id]": { id: string };
};

export type TabParamList = {
  index: undefined;
  courses: undefined;
  library: undefined;
  profile: undefined;
};
