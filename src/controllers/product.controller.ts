import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { Product, IProduct } from "../models/product.model";

// ------------------------- Add New Product -------------------------
const addNewProduct = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const {
      productName,
      description,
      stockQuantity,
      lowStockThreshold,
    }: {
      productName: string;
      description?: string;
      stockQuantity?: number;
      lowStockThreshold?: number;
    } = req.body;

    const product = new Product({
      productName: productName.trim(),
      description: description || "",
      stockQuantity: stockQuantity || 0,
      lowStockThreshold: lowStockThreshold || 10,
    });

    const savedProduct: IProduct = await product.save();

    if (!savedProduct) {
      return res
        .status(500)
        .json(new ApiError("Error in adding product"));
    }

    // console.log("Product added:", savedProduct);

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          "Product added successfully",
          { product: savedProduct },
        )
      );
  }
);

export { addNewProduct };
