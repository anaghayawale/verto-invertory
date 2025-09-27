import { Router } from "express";
import { validateRequestBody, validateCreateProduct} from "../middlewares/validation.js"
import {
  addNewProduct
} from "../controllers/product.controller.js";

const router = Router();

router.route("/addProduct").post(validateRequestBody, validateCreateProduct, addNewProduct)

export default router;