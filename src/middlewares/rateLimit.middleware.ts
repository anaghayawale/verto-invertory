import { Request, Response } from "express";
import { rateLimit } from 'express-rate-limit';
import { ApiError } from '../utils/ApiError';

const rateLimitErrorHandler = (req: Request, res: Response, message: string) => {
    return res.status(429).json(
        new ApiError(
            "Rate Limit Exceeded", 
            [message]
        )
    );
};

const globalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: (req: Request, res: Response) => rateLimitErrorHandler(
        req, 
        res, 
        "Too many requests from this IP, please try again after 15 minutes."
    ),
    standardHeaders: true, 
    legacyHeaders: false,
});

const authRateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, 
    max: 5, 
    message: (req: Request, res: Response) => rateLimitErrorHandler(
        req, 
        res, 
        "Too many authentication attempts from this IP, please try again in 5 minutes."
    ),
    standardHeaders: true, 
    legacyHeaders: false,
});

export { globalRateLimiter, authRateLimiter }