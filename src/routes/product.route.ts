import { Router } from "express";
import {
  createProduct,
  getAllProducts,
  getProductById
} from "../controllers/product.controller";
import { verifyAdmin, verifyToken } from "../middlewares/auth.middleware";

const productRoute = Router();

productRoute.route("/add").post(verifyToken, verifyAdmin, createProduct)
productRoute.route("/get").get(verifyToken, getAllProducts)
productRoute.route("/get/:id").get(verifyToken, getProductById)

export default productRoute;