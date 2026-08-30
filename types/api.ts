import { z } from "zod";

// ---------------------------------------------------------------------------
// User & Auth Types (Derived from Zod)
// ---------------------------------------------------------------------------
export const UserRoleSchema = z.enum(["student", "educator", "admin", "superadmin", "creator"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserSchema = z.object({
  _id: z.string().optional(),
  id: z.string().optional(),
  name: z.string(),
  email: z.string().email(),
  role: z.string().default("student"),
  avatar: z.string().optional(),
  bio: z.string().optional(),
  gender: z.string().optional(),
  age: z.union([z.number(), z.string()]).optional(),
  country: z.string().optional(),
  language: z.string().optional(),
  interests: z.array(z.string()).optional(),
  headline: z.string().optional(),
  walletAddress: z.string().optional(),
  stellarWallet: z.string().optional(),
  isEmailVerified: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
}).transform((user) => ({
  ...user,
  _id: user._id || user.id || "",
  id: user.id || user._id || "",
}));

export type User = z.infer<typeof UserSchema>;

// ---------------------------------------------------------------------------
// Stellar Wallet & Payment Types (Derived from Zod)
// ---------------------------------------------------------------------------
export const StellarWalletInfoSchema = z.object({
  publicKey: z.string(),
  usdcBalance: z.string().default("0.00"),
  xlmBalance: z.string().default("0.0000"),
  hasTrustline: z.boolean().default(false),
  connected: z.boolean().optional(),
});
export type StellarWalletInfo = z.infer<typeof StellarWalletInfoSchema>;

export const StellarPaymentInitItemSchema = z.object({
  _id: z.string().optional(),
  title: z.string().optional(),
  price: z.number(),
});

export const StellarPaymentInitCreatorSchema = z.object({
  name: z.string().optional(),
  wallet: z.string(),
});

export const StellarPaymentInitPayloadSchema = z.object({
  xdr: z.string(),
  networkPassphrase: z.string(),
  sep7Uri: z.string().optional(),
});

export const StellarPaymentInitResponseSchema = z.object({
  success: z.boolean(),
  transactionId: z.string(),
  item: StellarPaymentInitItemSchema,
  creator: StellarPaymentInitCreatorSchema,
  payment: StellarPaymentInitPayloadSchema,
  sep7Uri: z.string().optional(),
  message: z.string().optional(),
});
export type StellarPaymentInitResponse = z.infer<typeof StellarPaymentInitResponseSchema>;

export const StellarPaymentSubmitResponseSchema = z.object({
  success: z.boolean(),
  transaction: z.object({
    hash: z.string(),
    explorerUrl: z.string().optional(),
  }).optional(),
  message: z.string().optional(),
});
export type StellarPaymentSubmitResponse = z.infer<typeof StellarPaymentSubmitResponseSchema>;

export const StellarTransactionSchema = z.object({
  _id: z.string(),
  itemTitle: z.string().optional(),
  itemType: z.enum(["course", "book", "donation"]).or(z.string()),
  amount: z.number(),
  status: z.enum(["pending", "submitted", "confirmed", "failed", "expired"]).or(z.string()),
  creator: z.object({ name: z.string().optional(), email: z.string().optional() }).optional(),
  creatorWallet: z.string().optional(),
  buyer: z.object({ name: z.string().optional(), email: z.string().optional() }).optional(),
  buyerWallet: z.string().optional(),
  donor: z.object({ name: z.string().optional() }).optional(),
  donorWallet: z.string().optional(),
  cause: z.string().optional(),
  note: z.string().optional(),
  anonymous: z.boolean().optional(),
  createdAt: z.string(),
  explorerUrl: z.string().optional(),
  txHash: z.string().optional(),
});
export type StellarTransaction = z.infer<typeof StellarTransactionSchema>;

// ---------------------------------------------------------------------------
// Course & Book Domain Types (Derived from Zod)
// ---------------------------------------------------------------------------
export const ReviewSchema = z.object({
  _id: z.string().optional(),
  user: z.union([
    z.string(),
    z.object({
      _id: z.string().optional(),
      id: z.string().optional(),
      name: z.string().optional(),
      avatar: z.string().optional(),
    }),
  ]).optional(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  review: z.string().optional(),
  createdAt: z.string().optional(),
});
export type Review = z.infer<typeof ReviewSchema>;

export const CourseLessonSchema = z.object({
  _id: z.string().optional(),
  title: z.string(),
  duration: z.string().or(z.number()).optional(),
  videoUrl: z.string().optional(),
  isFree: z.boolean().optional(),
});

export const CourseSectionSchema = z.object({
  _id: z.string().optional(),
  title: z.string(),
  lessons: z.array(CourseLessonSchema).optional(),
});

export const CourseSchema = z.object({
  _id: z.string().optional(),
  id: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  price: z.number().default(0),
  thumbnail: z.string().optional(),
  category: z.string().optional(),
  level: z.string().optional(),
  instructor: z.union([
    z.string(),
    z.object({
      _id: z.string().optional(),
      id: z.string().optional(),
      name: z.string().optional(),
      avatar: z.string().optional(),
      bio: z.string().optional(),
    }),
  ]).optional(),
  sections: z.array(CourseSectionSchema).optional(),
  reviews: z.array(ReviewSchema).optional(),
  ratings: z.number().optional(),
  totalStudents: z.number().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type Course = z.infer<typeof CourseSchema>;

export const BookSchema = z.object({
  _id: z.string().optional(),
  id: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  price: z.number().default(0),
  coverImage: z.string().optional(),
  thumbnail: z.string().optional(),
  fileUrl: z.string().optional(),
  author: z.union([
    z.string(),
    z.object({
      _id: z.string().optional(),
      id: z.string().optional(),
      name: z.string().optional(),
      avatar: z.string().optional(),
    }),
  ]).optional(),
  category: z.string().optional(),
  pages: z.number().optional(),
  reviews: z.array(ReviewSchema).optional(),
  ratings: z.number().optional(),
  totalPurchases: z.number().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type Book = z.infer<typeof BookSchema>;

// ---------------------------------------------------------------------------
// Space & Donation Types
// ---------------------------------------------------------------------------
export const SpaceSchema = z.object({
  _id: z.string().optional(),
  id: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
  host: z.union([
    z.string(),
    z.object({
      _id: z.string().optional(),
      id: z.string().optional(),
      name: z.string().optional(),
      avatar: z.string().optional(),
    }),
  ]).optional(),
  scheduledFor: z.string().optional(),
  durationMinutes: z.number().optional(),
  maxCapacity: z.number().optional(),
  isLive: z.boolean().optional(),
  status: z.enum(["scheduled", "live", "ended", "cancelled"]).optional(),
  waitlistCount: z.number().optional(),
  createdAt: z.string().optional(),
});
export type Space = z.infer<typeof SpaceSchema>;

export const DonationStatsSchema = z.object({
  totalDonations: z.number().default(0),
  totalAmount: z.number().default(0),
  causesCount: z.number().default(0),
  recentDonations: z.array(StellarTransactionSchema).default([]),
});
export type DonationStats = z.infer<typeof DonationStatsSchema>;

// ---------------------------------------------------------------------------
// Generic Pagination & Standard API Response
// ---------------------------------------------------------------------------
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T = any> { // TODO(types): Generic fallback for unspecialized payloads
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
