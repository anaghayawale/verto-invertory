import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import homeRouter from "./routes/home.route";
import userRouter from "./routes/user.route";
import productRoute from "./routes/product.route";
import { globalRateLimiter } from "./middlewares/rateLimit.middleware";

const app: Application = express();

app.use(cors({origin: '*',credentials: true,}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(globalRateLimiter)

app.use("/", homeRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/product", productRoute);

export { app };
