import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOnboardingAnswers {
  uniqueFeatures: string;
  targetCustomer: string;
  popularProducts: string;
  compliments: string;
  reviewTone: "warm" | "professional" | "enthusiastic";
  keywords?: string;
}

export interface ICustomTag {
  name: string;
  emoji?: string;
  isActive?: boolean;
}

export interface IBusiness extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  googlePlaceId: string;
  reviewUrl: string;
  logo?: string;
  phoneNumber?: string;
  defaultLanguage: "en" | "hi";
  isActive: boolean;
  onboardingCompleted: boolean;
  onboardingAnswers?: IOnboardingAnswers;
  aiContextPrompt?: string;
  customTags?: ICustomTag[];
  createdAt: Date;
  updatedAt: Date;
}

const BusinessSchema = new Schema<IBusiness>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    googlePlaceId: {
      type: String,
      required: true,
      trim: true,
    },
    reviewUrl: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    defaultLanguage: {
      type: String,
      enum: ["en", "hi"],
      default: "en",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    onboardingAnswers: {
      uniqueFeatures: { type: String, default: "" },
      targetCustomer: { type: String, default: "" },
      popularProducts: { type: String, default: "" },
      compliments: { type: String, default: "" },
      reviewTone: { type: String, default: "warm" },
      keywords: { type: String, default: "" },
    },
    aiContextPrompt: {
      type: String,
      default: "",
    },
    customTags: {
      type: [{
        name: { type: String, required: true },
        emoji: { type: String, default: "" },
        isActive: { type: Boolean, default: true }
      }],
      default: []
    },
  },
  {
    timestamps: true,
  }
);

const Business: Model<IBusiness> =
  mongoose.models.Business ||
  mongoose.model<IBusiness>("Business", BusinessSchema);

export default Business;
