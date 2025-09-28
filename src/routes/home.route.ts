import { Router } from "express";
import { healthCheck, version } from "../controllers/home.controller";

const router = Router();

router.route("/healthCheck").get(healthCheck);
router.route("/version").get(version);

export default router;