import { Router } from "express";
import {
  createUser,
  loginUser,
  logoutUser
} from "../controllers/user.controller";
import { authenticate, verifyAdmin } from "../middlewares/auth.middleware";

const userRouter = Router();
userRouter.route("/createUser").post(authenticate, verifyAdmin, createUser);
userRouter.route("/loginUser").post(loginUser);
userRouter.route("/logoutUser").post(authenticate, logoutUser);

export default userRouter;