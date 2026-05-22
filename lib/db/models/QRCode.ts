import mongoose, { Schema, Document, Model } from "mongoose";

export interface IQRCode extends Document {
  _id: mongoose.Types.ObjectId;
  qrId: string;
  assignedToBusinessId?: mongoose.Types.ObjectId;
  assignedToLocationId?: mongoose.Types.ObjectId;
  printedBatch?: string;
  isActive: boolean;
  createdAt: Date;
  activatedAt?: Date;
  updatedAt: Date;
}

const QRCodeSchema = new Schema<IQRCode>(
  {
    qrId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    assignedToBusinessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      default: null,
      index: true,
    },
    assignedToLocationId: {
      type: Schema.Types.ObjectId,
      ref: "Location",
      default: null,
    },
    printedBatch: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    activatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const QRCode: Model<IQRCode> =
  mongoose.models.QRCode || mongoose.model<IQRCode>("QRCode", QRCodeSchema);

export default QRCode;
