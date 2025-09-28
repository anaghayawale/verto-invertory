import { Request, Response, NextFunction, RequestHandler } from "express";

type AsyncRequestHandler = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => Promise<Response | void>;

function asyncHandler(requestHandler: AsyncRequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(requestHandler(req, res, next)).catch(next);
  };
}

export { asyncHandler };