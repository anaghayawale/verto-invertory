import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  productId?: string;
  productName: string;
  description?: string;
  stockQuantity: number;
  lowStockThreshold: number;
  createdAt?: Date;
  updatedAt?: Date;
}


const ProductSchema: Schema<IProduct> = new Schema(
  {
    productName: {
      type: String,
      required: [true, "Product name is required"],
      unique: true,
      trim: true,
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    stockQuantity: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock quantity cannot be negative"],
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      required: [true, "Low stock threshold is required"],
      min: [0, "Low stock threshold cannot be negative"],
      default: 10,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    versionKey: false,
    toJSON: {
       transform: function(doc, ret) {
        ret.productId = ret._id?.toString();
        delete ret._id;
        return ret;
      }
    }
  }
);

ProductSchema.pre<IProduct>("save", function (next) {
  if (this.isModified("productName")) {
    this.productName = this.productName.trim();
  }

  if (this.stockQuantity < 0) {
    this.stockQuantity = 0;
  }

  next();
});


export const Product: Model<IProduct> = mongoose.model<IProduct>(
  "Product",
  ProductSchema
);
