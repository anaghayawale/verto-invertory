import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { Product, IProduct } from "../models/product.model";
import { logger } from "../utils/logger";
import mongoose from "mongoose";
import { createPaginationResponse, getPaginationParams } from "../utils/pagination";
import { cacheService, CacheService } from "../utils/cache";
import { 
  CreateProductData, 
  StockOperationData, 
  UpdateProductData, 
  validateProductId, 
  validateProductsArray, 
  validateStockOperation, 
  validateUpdateProduct 
} from "../utils/validations/productValidation";

//------------------------- Add New Product -------------------------
const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const username = req.user?.username;
  
  if (!userId) {
    return res.status(401).json(new ApiError("User authentication required"));
  }

  const productsData: CreateProductData[] = Array.isArray(req.body) ? req.body : [req.body];
  
  const validation = validateProductsArray(productsData);
  if (!validation.isValid) {
    return res.status(400).json(new ApiError("Validation failed", validation.errors));
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
});

//------------------------- Get All Products -------------------------
const getAllProducts = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const cacheKey = CacheService.generateProductKey(page, limit);

  const cachedData = cacheService.get(cacheKey);
  if (cachedData) {
    logger.info('Products retrieved from cache', { page, limit });
    return res.status(200).json(
      new ApiResponse(200, "Products fetched successfully", cachedData)
    );
  }

  const totalProducts = await Product.countDocuments();
  const products = await Product.find()
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  
  const paginationResponse = createPaginationResponse(
    products.map(p => p.toJSON()),
    page,
    limit,
    totalProducts
  );

  cacheService.set(cacheKey, paginationResponse, 5 * 60);

  return res.status(200).json(
    new ApiResponse(200, "Products fetched successfully", paginationResponse)
  );
});

//------------------------- Get Product By ID -------------------------
const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const isValidId = validateProductId(id);
  if (!isValidId.isValid) {
    return res.status(400).json(new ApiError("Invalid product ID", isValidId.errors));
  }

  const product: IProduct | null = await Product.findById(id);
  if (!product) {
    return res.status(404).json(
      new ApiError("Product not found", [`Product with id: ${id} does not exist.`])
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Product fetched successfully", product.toJSON())
  );
});

//------------------------- Update Product -------------------------
const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const updateData: UpdateProductData = req.body;

  const validation = validateUpdateProduct(updateData);
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

  cacheService.clearByPattern('product:');
  cacheService.clearByPattern('products:low-stock');
  cacheService.del(CacheService.generateSingleProductKey(updateData.productId));

  return res.status(200).json(
    new ApiResponse(200, "Product updated successfully", updated.toJSON())
  );
});

//------------------------- Delete Product by ID -------------------------
const deleteProductById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json(new ApiError("Unauthorized", ["User authentication required"]));
  }

  const isValidId = validateProductId(id);
  if (!isValidId.isValid) {
    return res.status(400).json(new ApiError("Invalid product ID", isValidId.errors));
  }

  const product: IProduct | null = await Product.findById(id);
  if (!product) {
    return res.status(404).json(
      new ApiError("Product not found", [`Product with id: ${id} does not exist.`])
    );
  }

  await Product.findByIdAndDelete(id);

  cacheService.clearByPattern('product:');
  cacheService.clearByPattern('products:low-stock');
  cacheService.del(CacheService.generateSingleProductKey(id));

  logger.info(`Product ${id} deleted by user ${userId}`);

  return res.status(200).json(
    new ApiResponse(200, "Product deleted successfully", { productId: id })
  );
});

//------------------------- Delete Products in Bulk -------------------------
const deleteProducts = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { productIds } = req.body;

  if (!userId) {
    return res.status(401).json(
      new ApiError("Unauthorized", ["User authentication required"])
    );
  }

  if (!Array.isArray(productIds) || productIds.length === 0) {
    return res.status(400).json(
      new ApiError("Invalid Data", ["Provide a non-empty array of productIds"])
    );
  }

  const MAX_BULK_DELETE = 10;
  if (productIds.length > MAX_BULK_DELETE) {
    return res.status(400).json(
      new ApiError(
        "Invalid Data", 
        [`Cannot delete more than ${MAX_BULK_DELETE} products at once. Received ${productIds.length} IDs.`]
      )
    );
  }

  const invalidIds = productIds.filter(
    (id) => typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)
  );
  if (invalidIds.length > 0) {
    return res.status(400).json(
      new ApiError("Invalid Data", invalidIds.map((id) => `Invalid product id: ${id}`))
    );
  }

  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const id of productIds) {
    if (seen.has(id)) duplicates.add(id);
    seen.add(id);
  }
  
  if (duplicates.size > 0) {
    return res.status(400).json(
      new ApiError("Invalid Data", [`Duplicate product ids in request: ${[...duplicates].join(", ")}`])
    );
  }

  const existing = await Product.find({ _id: { $in: productIds } }, { _id: 1 }).lean();
  const foundIds = new Set(existing.map((p: any) => p._id.toString()));

  const missingIds = productIds.filter((id) => !foundIds.has(id));
  if (missingIds.length > 0) {
    return res.status(404).json(
      new ApiError("Products not found", missingIds.map((id) => `Product with id ${id} does not exist`))
    );
  }

  const result = await Product.deleteMany({ _id: { $in: productIds } });

  cacheService.clearByPattern('product:');
  cacheService.clearByPattern('products:low-stock');
  productIds.forEach((id: string) => {
    cacheService.del(CacheService.generateSingleProductKey(id));
  });

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
  const { page, limit, skip } = getPaginationParams(req.query);
  const cacheKey = `${CacheService.generateLowStockKey}:page:${page}:limit:${limit}`;

  const cachedData = cacheService.get(cacheKey);
  if (cachedData) {
    logger.info('Low stock products retrieved from cache', { page, limit });
    return res.status(200).json(
      new ApiResponse(200, "Low stock products fetched successfully", cachedData)
    );
  }

  const totalLowStockProducts = await Product.countDocuments({
    $expr: { $lte: ["$stockQuantity", "$lowStockThreshold"] }
  });

  const products = await Product.find({
    $expr: { $lte: ["$stockQuantity", "$lowStockThreshold"] }
  })
    .skip(skip)
    .limit(limit)
    .sort({ stockQuantity: 1 });

  const stockDeficitAdded = products.map(p => ({
    ...p.toJSON(),
    stockDeficit: p.lowStockThreshold - p.stockQuantity
  }));

  const paginatedResponse = createPaginationResponse(
    stockDeficitAdded,
    page,
    limit,
    totalLowStockProducts
  );

  cacheService.set(cacheKey, paginatedResponse, 2 * 60);

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

//------------------------- Increase Stock Quantity -------------------------
const increaseStockQuantity = asyncHandler(async (req: Request, res: Response) => {
  const stock: StockOperationData = req.body;
  const username = req.user?.username;
  
  const isValidData = validateStockOperation(stock);
  if (!isValidData.isValid) {
    return res.status(400).json(new ApiError("Invalid Data", isValidData.errors));
  }
  
  const existingProduct = await Product.findById(stock.productId);
  if (!existingProduct) {
    return res.status(404).json(new ApiError("Product not found"));
  }

  const newStockQuantity = existingProduct.stockQuantity + stock.stockQuantity;
  
  const updatedProduct = await Product.findByIdAndUpdate(
    stock.productId,
    { 
      stockQuantity: newStockQuantity,
      updatedBy: username 
    },
    { new: true }
  );
    
  if (!updatedProduct) {
    return res.status(500).json(new ApiError("Error updating stock quantity"));
  }

  cacheService.clearByPattern('product:');
  cacheService.clearByPattern('products:low-stock');
  cacheService.del(CacheService.generateSingleProductKey(existingProduct.productId));

  const isLowStock = newStockQuantity <= existingProduct.lowStockThreshold;
    
  return res.status(200).json(
    new ApiResponse(
      200,
      "Stock quantity increased successfully",
      {
        productId: updatedProduct.productId,
        productName: updatedProduct.productName,
        previousStock: existingProduct.stockQuantity,
        newStock: newStockQuantity,
        updatedBy: username,
        lowStockThreshold: updatedProduct.lowStockThreshold,
        stockDeficit: isLowStock ? existingProduct.lowStockThreshold - newStockQuantity : 0
      }
    )
  );
});

//------------------------- Decrease Stock Quantity -------------------------
const decreaseStockQuantity = asyncHandler(async (req: Request, res: Response) => {
  const stock: StockOperationData = req.body;
  const username = req.user?.username;
  
  const isValidData = validateStockOperation(stock);
  if (!isValidData.isValid) {
    return res.status(400).json(new ApiError("Invalid Data", isValidData.errors));
  }
  
  const existingProduct = await Product.findById(stock.productId);
  if (!existingProduct) {
    return res.status(404).json(new ApiError("Product not found"));
  }

  if (stock.stockQuantity > existingProduct.stockQuantity) {
    return res.status(400).json(
      new ApiError("Insufficient Stock", [
        `Cannot remove ${stock.stockQuantity} units. Only ${existingProduct.stockQuantity} units available in stock.`
      ])
    );
  }

  const newStockQuantity = existingProduct.stockQuantity - stock.stockQuantity;
    
  const updatedProduct = await Product.findByIdAndUpdate(
    stock.productId,
    { 
      stockQuantity: newStockQuantity,
      updatedBy: username 
    },
    { new: true }
  );
  
  if (!updatedProduct) {
    return res.status(500).json(new ApiError("Error updating stock quantity"));
  }

  cacheService.clearByPattern('product:');
  cacheService.clearByPattern('products:low-stock');
  cacheService.del(CacheService.generateSingleProductKey(existingProduct.productId));

  const isLowStock = newStockQuantity <= existingProduct.lowStockThreshold;
    
  return res.status(200).json(
    new ApiResponse(
      200,
      "Stock quantity decreased successfully",
      {
        productId: updatedProduct.productId,
        productName: updatedProduct.productName,
        previousStock: existingProduct.stockQuantity,
        newStock: newStockQuantity,
        updatedBy: username,
        lowStockThreshold: updatedProduct.lowStockThreshold,
        stockDeficit: isLowStock ? existingProduct.lowStockThreshold - newStockQuantity : 0
      }
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
  getLowStockProducts,
  increaseStockQuantity,
  decreaseStockQuantity
};