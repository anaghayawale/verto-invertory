import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { Roles } from "../constants";
import { User } from "../models/user.model";
import { validateLoginData, validateRegisterData, LoginData, RegisterData } from "../utils/validations/userDataValidation";
import { bodyDataExists } from "../utils/validations/helper";
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
    const userData: RegisterData = req.body;

    if(bodyDataExists(userData.username, userData.password, userData.role)){
      return res.status(400).json(new ApiError("Missing required fields"));
    }

    const validData = validateRegisterData(userData);
    if(!validData.isValid){
      return res.status(400).json(new ApiError("Invalid Data", validData.errors));
    }

    const existingUser = await User.findOne({ username: userData.username.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json(new ApiError("Username already exists"));
    }

    const newUser = await User.create({
      username: userData.username,
      password: userData.password,
      role: userData.role && Object.values(Roles).includes(userData.role) ? userData.role : Roles.USER,
    });
    
    if (!newUser) {
      return res.status(500).json(new ApiError("Error creating user"));
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
    const loginData: LoginData = req.body;

    if(bodyDataExists(loginData.username, loginData.password)){
      return res.status(400).json(new ApiError("Missing required fields"));
    }

    const validData = validateLoginData(loginData);
    if(!validData.isValid){
      return res.status(400).json(new ApiError("Invalid Data", validData.errors));
    }

    const user = await User.findOne({ username: loginData.username });
    if (!user) {
      return res.status(401).json(new ApiError("Invalid username or password"));
    }

    const isMatch = await user.comparePassword(loginData.password);
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

export { createUser, loginUser, logoutUser }