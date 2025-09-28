import { ApiError } from "../utils/ApiError";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Roles } from "../constants";

export interface AuthRequest extends Request {
  user?: { 
    userId: string;
    username: string; 
    role: string; 
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const accessToken = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");
  if (!accessToken) {
    return res.status(401).json(new ApiError("Access token required"));
  }
  console.log("now here")
  try {
    const decoded = jwt.verify(accessToken, `${process.env.JWT_SECRET}`) as {
      userId: string;
      username: string;
      role: string;
    };
    
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json(new ApiError("Invalid or expired token"));
  }
};


export const verifyAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
console.log("user who is trying to create - ",req.user)
  if (!req.user) {
    return res.status(401).json(new ApiError("Authentication required"));
  }

  if (req.user.role !== Roles.ADMIN) {
    return res.status(403).json(new ApiError("Access denied. Admin role required"));
  }

  next();
};

export const verifyUser = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json(new ApiError("Authentication required"));
  }

  if (req.user.role !== Roles.USER && req.user.role !== Roles.ADMIN) {
    return res.status(403).json(new ApiError("Access denied. User or Admin role required"));
  }

  next();
};


export const authorize = (allowedRoles: Roles[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json(new ApiError("Unauthorized"));
    }

    if (!allowedRoles.includes(req.user.role as Roles)) {
      return res.status(403).json(new ApiError("Forbidden"));
    }

    next();
};