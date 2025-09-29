import { ApiError } from "../utils/ApiError";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Roles } from "../constants";
import { logger } from "../utils/logger";
import { asyncHandler } from "../utils/asyncHandler";

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        username: string;
        role: string;
    };
}

// -------------------------Verify Token -------------------------
const verifyToken = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
        const accessToken = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");
        if (!accessToken) {
            return res.status(401).json(new ApiError("Unauthorized"));
        }

        try {
            const decoded = jwt.verify(accessToken, `${process.env.JWT_SECRET}`) as {
                userId: string;
                username: string;
                role: string;
            };

            req.user = decoded;
            next();
        } catch (err) {
            logger.error("ERROR: ", err)
            return res.status(401).json(new ApiError("Invalid or expired token"));
        }
    }
)

// -------------------------Verify Admin Role --------------------
const verifyAdmin = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json(new ApiError("Forbidden"));
    }

    if (req.user.role !== Roles.ADMIN) {
        return res.status(403).json(new ApiError("Access denied. Admin role required"));
    }

    next();
});

// -------------------------Verify User Role --------------------
const verifyUser = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json(new ApiError("Forbidden"));
    }

    if (req.user.role !== Roles.USER && req.user.role !== Roles.ADMIN) {
        return res.status(403).json(new ApiError("Access denied. User or Admin role required"));
    }

    next();
})

export { verifyToken, verifyAdmin, verifyUser }