import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBusiness extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  googlePlaceId: string;
  reviewUrl: string;
  logo?: string;
  defaultLanguage: "en" | "hi";
  isActive: boolean;
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
    defaultLanguage: {
      type: String,
      enum: ["en", "hi"],
      default: "en",
    },
    isActive: {
      type: Boolean,
      default: true,
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
