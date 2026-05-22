import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILocation extends Document {
  _id: mongoose.Types.ObjectId;
  businessId: mongoose.Types.ObjectId;
  name: string;
  address: string;
  googlePlaceId: string;
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema = new Schema<ILocation>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    googlePlaceId: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Location: Model<ILocation> =
  mongoose.models.Location ||
  mongoose.model<ILocation>("Location", LocationSchema);

export default Location;
