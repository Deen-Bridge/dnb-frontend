export const API_ENDPOINTS = {
  auth: {
    register: "/api/auth/register",
    login: "/api/auth/login",
    logout: "/api/auth/logout",
    refresh: "/api/auth/refresh",
    me: "/api/auth/me",
    verifyEmail: "/api/auth/verify-email",
    forgotPassword: "/api/auth/forgot-password",
    resetPassword: "/api/auth/reset-password",
  },
  users: {
    profile: "/api/users/profile",
    updateProfile: "/api/users/profile",
    avatar: "/api/users/avatar",
  },
  courses: {
    list: "/api/courses",
    byId: (id: string) => `/api/courses/${id}`,
    enroll: (id: string) => `/api/courses/${id}/enroll`,
    progress: (id: string) => `/api/courses/${id}/progress`,
    review: (id: string) => `/api/courses/${id}/review`,
    bookmark: (id: string) => `/api/courses/${id}/bookmark`,
  },
  books: {
    list: "/api/books",
    byId: (id: string) => `/api/books/${id}`,
    preview: (id: string) => `/api/books/${id}/preview`,
    bookmark: (id: string) => `/api/books/${id}/bookmark`,
  },
  spaces: {
    list: "/api/spaces",
    byId: (id: string) => `/api/spaces/${id}`,
    join: (id: string) => `/api/spaces/${id}/join`,
  },
  reels: {
    list: "/api/reels",
    byId: (id: string) => `/api/reels/${id}`,
    react: (id: string) => `/api/reels/${id}/react`,
  },
  messages: {
    conversations: "/api/messages/conversations",
    byConversation: (id: string) => `/api/messages/${id}`,
    send: (id: string) => `/api/messages/${id}/send`,
  },
  stellar: {
    wallet: {
      connect: "/api/stellar/wallet/connect",
      disconnect: "/api/stellar/wallet/disconnect",
      balance: "/api/stellar/wallet/balance",
    },
    payment: {
      initialize: "/api/stellar/payment/initialize",
      verify: "/api/stellar/payment/verify",
      transactions: "/api/stellar/payment/transactions",
    },
  },
  ai: {
    chat: "/chat",
    chatStream: "/chat/stream",
  },
  search: {
    query: "/api/search",
  },
  notifications: {
    list: "/api/notifications",
    markRead: (id: string) => `/api/notifications/${id}/read`,
    markAllRead: "/api/notifications/read-all",
  },
  earnings: {
    summary: "/api/earnings",
    statement: "/api/earnings/statement",
  },
} as const;
