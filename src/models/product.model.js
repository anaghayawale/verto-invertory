import mongoose, {Schema} from "mongoose";

const ProductSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  stock_quantity: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock quantity cannot be negative'],
    default: 0
  },
  low_stock_threshold: {
    type: Number,
    required: [true, 'Low stock threshold is required'],
    min: [0, 'Low stock threshold cannot be negative'],
    default: 10
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false
});

// Pre-save middleware
ProductSchema.pre('save', function(next) {
  // Trim name if modified
  if (this.isModified('name')) {
    this.name = this.name.trim();
  }
  
  // Ensure stock_quantity is not negative
  if (this.stock_quantity < 0) {
    this.stock_quantity = 0;
  }
  
  next();
});

export const Product = mongoose.model("Product", ProductSchema);