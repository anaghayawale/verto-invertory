import { Router } from "express";
import {
  createUser,
  loginUser,
  logoutUser
} from "../controllers/user.controller";
import { verifyToken, verifyAdmin } from "../middlewares/auth.middleware";
import { authRateLimiter } from "../middlewares/rateLimit.middleware";

const userRouter = Router();
userRouter.route("/create-user").post(authRateLimiter, verifyToken, verifyAdmin, createUser);
userRouter.route("/login").post(authRateLimiter, loginUser);
userRouter.route("/logout").post(verifyToken, logoutUser);

export default userRouter;