import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import packagejson from "../../package.json";

// ------------------------- Home Route -------------------------

const version = asyncHandler(async function (_, res: Response){
    res.status(200).json(
        new ApiResponse(200, packagejson.version)
    );
});

const healthCheck = asyncHandler(async function (_, res: Response){
    res.status(200).json({message: "Pong"})
});

export { healthCheck, version }