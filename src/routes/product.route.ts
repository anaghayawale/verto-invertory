import { Router } from "express";
import { validateCreateProduct} from "../middlewares/validation.middleware"
import {
  addNewProduct
} from "../controllers/product.controller";

const productRoute = Router();

productRoute.route("/addProduct").post(validateCreateProduct, addNewProduct)

export default productRoute;