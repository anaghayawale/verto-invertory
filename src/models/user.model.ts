import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";
import { Roles } from "../constants";


export interface IUser extends Document {
  userId?: string;
  username: string;
  password: string;
  role: Roles;
  createdAt: Date;
  updatedAt: Date;
comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      validate: {
        validator: function (value: string) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
            value
          );
        },
        message:
          "Password must contain at least 1 uppercase, 1 lowercase, 1 number, 1 special character and be at least 8 characters long",
      },
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: {
        values: Object.values(Roles),
        message: "Role must be either 'admin' or 'user'",
      },
      default: Roles.USER,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    toJSON: {
      transform: function (doc, ret: any) {
        ret.userId = ret._id?.toString();
        delete ret._id;
        delete ret.password;
        return ret;
      },
    },
  }
);

UserSchema.pre<IUser>("save", function (next) {
  if (this.isModified("username")) {
    this.username = this.username.trim().toLowerCase();
  }
  next();
});

UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);