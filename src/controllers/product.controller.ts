import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { Product, IProduct } from "../models/product.model";
import { validateProductsArray } from "../utils/validations/validateProductData";
import { logger } from "../utils/logger";

//------------------------- Add New Product -------------------------
const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const username = req.user?.username;
    if (!userId) {
      return res.status(409).json(new ApiError("User authentication required"));
      
    }

    let productsData = Array.isArray(req.body) ? req.body : [req.body];
    const validation = validateProductsArray(productsData);
    console.log(validation.isValid , validation.errors)
    if (!validation.isValid) {
      res.status(409).json(new ApiError("Validation failed", validation.errors));
    }

    const productNames = productsData.map((p) => p.productName);
    const existingProducts = await Product.find({
      productName: {
        $in: productNames.map((name) => new RegExp(`^${name}$`, "i")),
      },
    });

    if (existingProducts.length > 0) {
      const existingNames = existingProducts.map((p) => p.productName);
      return res.status(409).json(new ApiError(
        "Product(s) already exist",
        [
          `The following product(s) already exist: ${existingNames.join(
            ", "
          )}`,
        ]
      ))
    }

    const productsToCreate = productsData.map((product) => ({
      productName: product.productName,
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity,
      lowStockThreshold: product.lowStockThreshold,
      createdBy: username,
      updatedBy: username,
    }));
    console.log(productsToCreate)
    const createdProducts = await Product.insertMany(productsToCreate);

    const productsResponse = createdProducts.map((p) => p.toJSON());

    logger.info(
      `Created ${createdProducts.length} product(s) by user ${userId}`
    );

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          productsResponse.length === 1
            ? "Product created successfully"
            : `Successfully created ${productsResponse.length} products`,
          productsResponse.length === 1 ? productsResponse[0] : {
            count: productsResponse.length,
            products: productsResponse,
          }
        )
      );
  }
);

//------------------------- Get All Products -------------------------
const getAllProducts = asyncHandler(async (req: Request, res: Response) => {
  const products = await Product.find();

  return res.status(200).json(
    new ApiResponse(
      200,
      "Products fetched successfully",
      {
        count: products.length,
        products: products.map(p => p.toJSON())
      }
    )
  );
});

//------------------------- Get Product By ID -------------------------
const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const product: IProduct | null = await Product.findById(id);

  if (!product) {
    return res.status(404).json(
      new ApiError("Product not found", [`Product with id: ${id} does not exist.`])
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      "Products fetched successfully",
      {
        count: 1,
        products: [product]
      }
    )
  );
});

export { getAllProducts, createProduct, getProductById };
