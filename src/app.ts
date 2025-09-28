import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import homeRouter from "./routes/home.route";
import productRouter from "./routes/product.route"; 

const app: Application = express();

app.use(cors({origin: '*',credentials: true,}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/v1", homeRouter);
app.use("/api/v1/product", productRouter);

export { app };
