import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  name: string;
  image?: string;
  role: "business" | "admin";
  subscriptionTier: "free" | "pro" | "multi-location";
  subscriptionEnds?: Date;
  creditsUsedThisMonth: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
    },
    role: {
      type: String,
      enum: ["business", "admin"],
      default: "business",
    },
    subscriptionTier: {
      type: String,
      enum: ["free", "pro", "multi-location"],
      default: "free",
    },
    subscriptionEnds: {
      type: Date,
    },
    creditsUsedThisMonth: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Credit limits by tier
export const CREDIT_LIMITS: Record<string, number> = {
  free: 50,
  pro: 500,
  "multi-location": Infinity,
};

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
