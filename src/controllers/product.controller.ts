import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { Product, IProduct } from "../models/product.model";
import { validateProductData, validateProductsArray } from "../utils/validations/validateProductData";
import { logger } from "../utils/logger";
import mongoose from "mongoose";
import { createPaginationResponse, getPaginationParams } from "../utils/pagination";

//------------------------- Add New Product -------------------------
const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const username = req.user?.username;
  if (!userId) {
    return res.status(409).json(new ApiError("User authentication required"));
  }

  let productsData = Array.isArray(req.body) ? req.body : [req.body];
  const validation = validateProductsArray(productsData);

  if (!validation.isValid) {
    return res.status(409).json(new ApiError("Validation failed", validation.errors));
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
      [`The following product(s) already exist: ${existingNames.join(", ")}`]
    ));
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

  const createdProducts = await Product.insertMany(productsToCreate);
  const productsResponse = createdProducts.map((p) => p.toJSON());

  logger.info(`Created ${createdProducts.length} product(s) by user ${userId}`);

  return res.status(201).json(
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
  const { page, limit, skip } = getPaginationParams(req.query)

  const totalProducts = await Product.countDocuments();

  const products = await Product.find().skip(skip).limit(limit).sort({ createdAt: -1 });

  const paginationResponse = createPaginationResponse(
    products.map(p => p.toJSON()),
    page,
    limit,
    totalProducts
  )

  return res.status(200).json(
    new ApiResponse(
      200,
      "Products fetched successfully",
      paginationResponse
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
      "Product fetched successfully",
      product.toJSON()
    )
  );
});

//------------------------- Update Product -------------------------
const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const updateData = req.body;

  const validation = validateProductData(updateData, { isCreate: false });
  if (!validation.isValid) {
    return res.status(400).json(new ApiError("Validation failed", validation.errors));
  }

  const updated = await Product.findByIdAndUpdate(
    updateData.productId,
    { ...updateData, updatedBy: req.user?.username },
    { new: true }
  );

  if (!updated) {
    return res.status(404).json(new ApiError("Product not found"));
  }

  return res.status(200).json(new ApiResponse(200, "Product updated successfully", updated));
});

//------------------------- Delete Product by ID -------------------------
const deleteProductById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json(new ApiError("Unauthorised", ["User authentication required"]));
  }

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(new ApiError("Invalid Data", ["Invalid product id"]));
  }

  const product: IProduct | null = await Product.findById(id);
  if (!product) {
    return res.status(404).json(
      new ApiError("Product not found", [`Product with id: ${id} does not exist.`])
    );
  }

  await Product.findByIdAndDelete(id);

  logger.info(`Product ${id} deleted by user ${userId}`);

  return res.status(200).json(
    new ApiResponse(
      200,
      "Product deleted successfully",
      { productId: id }
    )
  );
});

//------------------------- Delete Product in bulk -------------------------
const deleteProducts = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { productIds } = req.body;

  if (!userId) {
    return res
      .status(401)
      .json(new ApiError("Unauthorized", ["User authentication required"]));
  }

  if (!Array.isArray(productIds) || productIds.length === 0) {
    return res
      .status(400)
      .json(new ApiError("Invalid Data", ["Provide a non-empty array of productIds"]));
  }

  const MAX_BULK_DELETE = 10;
  if (productIds.length > MAX_BULK_DELETE) {
    return res
      .status(400)
      .json(new ApiError("Invalid data", [`Cannot delete more than ${MAX_BULK_DELETE} products at once. Received ${productIds.length} IDs.`]));
  }

  const invalidIds = productIds.filter(
    (id) => typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)
  );
  if (invalidIds.length > 0) {
    return res
      .status(400)
      .json(new ApiError("Invalid Data", invalidIds.map((id) => `Invalid product id: ${id}`)));
  }

  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const id of productIds) {
    if (seen.has(id)) dupes.add(id);
    seen.add(id);
  }
  if (dupes.size > 0) {
    return res
      .status(400)
      .json(new ApiError("Invalid Data", [`Duplicate product ids in request: ${[...dupes].join(", ")}`]));
  }

  const existing = await Product.find({ _id: { $in: productIds } }, { _id: 1 }).lean();
  const foundIds = new Set(existing.map((p: any) => p._id.toString()));

  const missingIds = productIds.filter((id) => !foundIds.has(id));
  if (missingIds.length > 0) {
    return res
      .status(404)
      .json(new ApiError("Products not found", missingIds.map((id) => `Product with id ${id} does not exist`)));
  }

  const result = await Product.deleteMany({ _id: { $in: productIds } });

  logger.info(`Deleted ${result.deletedCount} product(s): [${productIds.join(", ")}] by user ${userId}`);

  return res.status(200).json(
    new ApiResponse(200, "Products deleted successfully", {
      deletedCount: result.deletedCount ?? productIds.length,
      deletedIds: productIds,
    })
  );
});

//------------------------- Get Low Stock Products -------------------------
const getLowStockProducts = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPaginationParams(req.query)

  const totalLowStockProducts = await Product.countDocuments({
    $expr: { $lte: ["$stockQuantity", "$lowStockThreshold"] }
  })

  const products = await Product.find({
    $expr: { $lte: ["$stockQuantity", "$lowStockThreshold"] }
  })
    .skip(skip)
    .limit(limit)
    .sort({ stockQuantity: 1 })

  const stockDeficitAdded = products.map(p => ({
    ...p.toJSON(),
    stockDeficit: p.lowStockThreshold - p.stockQuantity
  }))

  const paginatedResponse = createPaginationResponse(
    stockDeficitAdded,
    page,
    limit,
    totalLowStockProducts
  )


  return res.status(200).json(
    new ApiResponse(
      200,
      products.length > 0
        ? "Low stock products fetched successfully"
        : "No products are currently low on stock",
      paginatedResponse
    )
  );
});

export {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProductById,
  deleteProducts,
  getLowStockProducts
};