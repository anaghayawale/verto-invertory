import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { Roles } from "../constants";
import { User } from "../models/user.model";
import { validateLoginData } from "../utils/validations/validateLoginData";
import { bodyDataExists } from "../utils/validations/bodyDataExists";
import { logger } from "../utils/logger";
import { asyncHandler } from "../utils/asyncHandler";

const generateToken = (user: { _id: any; username: string; role: string }): string => {
  return jwt.sign(
    {
      userId: user._id.toString(),
      username: user.username,
      role: user.role,
    },
    `${process.env.JWT_SECRET}`,
    { expiresIn: "1h" }
  );
};

// -------------------------Create User -------------------------
const createUser = asyncHandler(async (req: Request, res: Response) => {
    const { username, password, role } = req.body;

    if(bodyDataExists(username, password, role)){
      return res.status(409).json(new ApiError("Invalid Data",));
    }

    const validData = validateLoginData(username, password, false, role)
    if(!validData.isValid){
      return res.status(409).json(new ApiError("Invalid Data", validData.errors));
    }

    const existingUser = await User.findOne({ username: username.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json(new ApiError("Username already exists"));
    }

    const newUser = await User.create({
      username,
      password,
      role: role && Object.values(Roles).includes(role) ? role : Roles.USER,
    });
    if (!newUser) {
      return res.status(401).json(new ApiError("Error creating user"));
    }

    const token = generateToken(newUser);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000,
    });

    return res.status(201).json(
      new ApiResponse(201, "User created successfully", {
        userId: newUser.userId,
        username: newUser.username,
        role: newUser.role,
        token: token
      })
    );
});

// -------------------------Login User -------------------------
const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if(bodyDataExists(username, password)){
      return res.status(409).json(new ApiError("Invalid Data",));
    }

    const validData = validateLoginData(username, password, true)
    if(!validData.isValid){
      return res.status(409).json(new ApiError("Invalid Data", validData.errors));
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json(new ApiError("Invalid username or password" ));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json(new ApiError("Invalid username or password"));
    }

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000,
    });

     return res.status(200).json(new ApiResponse(200, "Login successful", {
      username: user.username,
      role: user.role,
      token: token
    }));
});

// -------------------------Logout User -------------------------
const logoutUser = asyncHandler(async (_, res: Response) => {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Logout successful"));
});

export { createUser, loginUser, logoutUser}

