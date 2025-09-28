import { Router } from "express";
import { validateRequestBody, validateCreateProduct} from "../middlewares/validation"
import {
  addNewProduct
} from "../controllers/product.controller";

const productRoute = Router();

productRoute.route("/addProduct").post(validateRequestBody, validateCreateProduct, addNewProduct)

export default productRoute;