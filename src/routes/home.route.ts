import { Router } from "express";
import { healthCheck, version } from "../controllers/home.controller";

const homeRouter = Router();

homeRouter.route("/healthCheck").get(healthCheck);
homeRouter.route("/version").get(version);

export default homeRouter;