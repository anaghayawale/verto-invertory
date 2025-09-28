import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";

// ------------------------- Home Route -------------------------

const version = asyncHandler(async function (req: Request, res: Response): Promise<void> {
    res.status(200).json(
        new ApiResponse(200, "New-Server: 1.1.0")
    );
});

const healthCheck = asyncHandler(async function (req: Request, res: Response): Promise<void> {
    res.status(200).json(
        new ApiResponse(200, "Health Check Passed")
    );
});

export { healthCheck, version }