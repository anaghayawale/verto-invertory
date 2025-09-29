import { Router } from "express";
import {
  createUser,
  loginUser,
  logoutUser
} from "../controllers/user.controller";
import { verifyToken, verifyAdmin } from "../middlewares/auth.middleware";

const userRouter = Router();
userRouter.route("/create-user").post(verifyToken, verifyAdmin, createUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/logout").post(verifyToken, logoutUser);

export default userRouter;