import { Router } from "express";
import {
  createProduct,
  deleteProductById,
  deleteProducts,
  getAllProducts,
  getLowStockProducts,
  getProductById,
  updateProduct
} from "../controllers/product.controller";
import { verifyAdmin, verifyToken } from "../middlewares/auth.middleware";

const productRoute = Router();

productRoute.route("/add").post(verifyToken, verifyAdmin, createProduct)
productRoute.route("/get").get(verifyToken, getAllProducts)
productRoute.route("/get/:id").get(verifyToken, getProductById)
productRoute.route("/update").patch(verifyToken, updateProduct) 
productRoute.route("/delete/:id").delete(verifyToken, deleteProductById) 
productRoute.route("/low-stock").get(verifyToken, getLowStockProducts)
productRoute.route("/delete").delete(verifyToken, deleteProducts) 

export default productRoute;