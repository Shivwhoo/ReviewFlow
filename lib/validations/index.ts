import { z } from "zod";

/** Schema for POST /api/review/generate */
export const generateReviewSchema = z.object({
  businessId: z.string().min(1, "Business ID is required"),
  rating: z.number().int().min(1).max(5),
  tags: z.array(z.string()).default([]),
  tone: z.enum(["casual", "professional", "genz", "short"]),
  language: z.enum(["en", "hi"]).optional(),
  userNotes: z.string().optional(),
  length: z.enum(["shorter", "longer"]).optional(),
});

export type GenerateReviewInput = z.infer<typeof generateReviewSchema>;

/** Schema for POST /api/review/track */
export const trackReviewSchema = z.object({
  qrId: z.string().min(1),
  businessId: z.string().min(1),
  locationId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  tags: z.array(z.string()).default([]),
  tone: z.enum(["casual", "professional", "genz", "short"]),
  reviewGenerated: z.string().min(1),
  userEdited: z.boolean().default(false),
  copiedAt: z.string().datetime().optional(),
  googleOpenedAt: z.string().datetime().optional(),
});

export type TrackReviewInput = z.infer<typeof trackReviewSchema>;

/** Schema for POST /api/business/qr-codes/claim */
export const claimQRSchema = z.object({
  qrId: z.string().min(1, "QR ID is required"),
  locationId: z.string().optional(),
});

export type ClaimQRInput = z.infer<typeof claimQRSchema>;

/** Schema for POST /api/admin/qr-codes/batch */
export const batchQRSchema = z.object({
  count: z.number().int().min(1).max(1000),
  printedBatch: z.string().optional(),
});

export type BatchQRInput = z.infer<typeof batchQRSchema>;

/** Schema for business onboarding answers */
export const onboardingAnswersSchema = z.object({
  uniqueFeatures: z.string().min(1, "This field is required"),
  targetCustomer: z.string().min(1, "This field is required"),
  popularProducts: z.string().min(1, "This field is required"),
  compliments: z.string().min(1, "This field is required"),
  reviewTone: z.enum(["warm", "professional", "enthusiastic"]),
  keywords: z.string().optional(),
});

export type OnboardingAnswersInput = z.infer<typeof onboardingAnswersSchema>;

/** Schema for business profile update */
export const updateBusinessSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  googlePlaceId: z.string().optional(),
  logo: z.string().url().optional(),
  defaultLanguage: z.enum(["en", "hi"]).optional(),
  onboardingAnswers: onboardingAnswersSchema.optional(),
  onboardingCompleted: z.boolean().optional(),
});

export type UpdateBusinessInput = z.infer<typeof updateBusinessSchema>;

/** Schema for location CRUD */
export const locationSchema = z.object({
  name: z.string().min(1).max(200),
  address: z.string().min(1).max(500),
  googlePlaceId: z.string().min(1),
});

export type LocationInput = z.infer<typeof locationSchema>;
