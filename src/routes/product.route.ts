import { Router } from "express";
import { validateRequestBody, validateCreateProduct} from "../middlewares/validation"
import {
  addNewProduct
} from "../controllers/product.controller";

const router = Router();

router.route("/addProduct").post(validateRequestBody, validateCreateProduct, addNewProduct)

export default router;