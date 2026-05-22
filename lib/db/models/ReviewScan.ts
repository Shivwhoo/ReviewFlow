import mongoose, { Schema, Document, Model } from "mongoose";

export type Rating = 1 | 2 | 3 | 4 | 5;
export type Tone = "casual" | "professional" | "genz" | "short";

export interface IReviewScan extends Document {
  _id: mongoose.Types.ObjectId;
  qrId: string;
  businessId: mongoose.Types.ObjectId;
  locationId?: mongoose.Types.ObjectId;
  ipHash: string;
  rating: Rating;
  tagsSelected: string[];
  tone: Tone;
  aiPromptKey: string;
  reviewGenerated: string;
  userEdited: boolean;
  copiedAt?: Date;
  googleOpenedAt?: Date;
  createdAt: Date;
}

const ReviewScanSchema = new Schema<IReviewScan>(
  {
    qrId: {
      type: String,
      required: true,
    },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: "Location",
    },
    ipHash: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    tagsSelected: {
      type: [String],
      default: [],
    },
    tone: {
      type: String,
      enum: ["casual", "professional", "genz", "short"],
      required: true,
    },
    aiPromptKey: {
      type: String,
      required: true,
    },
    reviewGenerated: {
      type: String,
      required: true,
    },
    userEdited: {
      type: Boolean,
      default: false,
    },
    copiedAt: {
      type: Date,
    },
    googleOpenedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for analytics and abuse detection
ReviewScanSchema.index({ businessId: 1, createdAt: -1 });
ReviewScanSchema.index({ ipHash: 1, createdAt: -1 });
ReviewScanSchema.index({ aiPromptKey: 1 });

const ReviewScan: Model<IReviewScan> =
  mongoose.models.ReviewScan ||
  mongoose.model<IReviewScan>("ReviewScan", ReviewScanSchema);

export default ReviewScan;
