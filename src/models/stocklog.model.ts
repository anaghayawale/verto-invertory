import { Actions } from "@src/constants";
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStockLog extends Document {
  stockLogId?: string;
  productId: mongoose.Types.ObjectId;
  actionType: Actions;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  performedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const StockLogSchema: Schema<IStockLog> = new Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
    },
    actionType: {
      type: String,
      required: [true, "Action type is required"],
      enum: {
        values: Object.values(Actions),
        message: "Action type must be either add or remove",
      },
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be greater than 0"],
    },
    previousStock: {
      type: Number,
      required: [true, "Previous stock is required"],
      min: [0, "Previous stock cannot be negative"],
    },
    newStock: {
      type: Number,
      required: [true, "New stock is required"],
      min: [0, "New stock cannot be negative"],
    },
    reason: {
      type: String,
      trim: true,
      maxlength: [200, "Reason cannot exceed 200 characters"],
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Performed by user is required"],
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: false },
    versionKey: false,
    toJSON: {
      transform: function (doc, ret: any) {
        ret.stockLogId = ret._id?.toString();
        delete ret._id;
        return ret;
      },
    },
  }
);

StockLogSchema.index({ productId: 1, createdAt: -1 });
StockLogSchema.index({ performedBy: 1, createdAt: -1 });

export const StockLog: Model<IStockLog> = mongoose.model<IStockLog>(
  "StockLog",
  StockLogSchema
);