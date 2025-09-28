import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Create Express app with explicit type
const app: Application = express();

// CORS configuration
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Serve static files
app.use(express.static("public"));

// Cookie parser
app.use(cookieParser());

// Router imports
import homeRouter from "./routes/home.route";
app.use("/api/v1", homeRouter);

import productRouter from "./routes/product.route"; 
app.use("/api/v1/product", productRouter);

export { app };
