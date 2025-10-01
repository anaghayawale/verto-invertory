import { Router } from "express";
import {
  createProduct,
  decreaseStockQuantity,
  deleteProductById,
  deleteProducts,
  getAllProducts,
  getLowStockProducts,
  getProductById,
  increaseStockQuantity,
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
productRoute.route("/add-stock").put(verifyToken, increaseStockQuantity)
productRoute.route("/remove-stock").put(verifyToken, decreaseStockQuantity)


export default productRoute;