import { isNonEmptyString, isNumber, validationResult } from "./helper";
import mongoose from "mongoose";

export interface CreateProductData {
  productName: string;
  description: string;
  price: number;
  stockQuantity: number;
  lowStockThreshold: number;
}

export interface UpdateProductData extends Partial<CreateProductData>{
    productId: string;
}

export interface StockOperationData {
    productId: string;
    stockQuantity: number;
}

export function validateCreateProduct(product: CreateProductData): validationResult {
    const errors: string[] = [];

    const nameError = isNonEmptyString(product.productName, 100, "Product name");
    if (nameError) errors.push(nameError);

     const descError = isNonEmptyString(product.description, 500, "Description");
    if (descError) errors.push(descError);

    const priceError = isNumber(product.price, "Price", { min: 0 });
    if (priceError) errors.push(priceError);

    const stockError = isNumber(product.stockQuantity, "Stock quantity", {
      min: 0,
      integer: true,
    });
    if (stockError) errors.push(stockError);

    const lowStockError = isNumber(product.lowStockThreshold, "Low stock threshold", {
        min: 0,
        integer: true,
    });
    if (lowStockError) errors.push(lowStockError);

    return {
        isValid: errors.length == 0,
        errors
    };
}

export function validateProductsArray(products: CreateProductData[]): validationResult {
  const errors: string[] = [];

  if (!Array.isArray(products)) {
    errors.push("Request body must be an array of products");
    return { isValid: false, errors };
  }

  if (products.length === 0) {
    errors.push("Products array cannot be empty");
    return { isValid: false, errors };
  }

  if (products.length > 50) {
    errors.push("Cannot create more than 50 products at once");
    return { isValid: false, errors };
  }

  products.forEach((product, index) => {
    const validation = validateCreateProduct(product);
    if (!validation.isValid) {
      validation.errors.forEach((error) => {
        errors.push(`Product at index ${index}: ${error}`);
      });
    }
  });

  const productNames = products
    .map((p) => p.productName?.trim().toLowerCase())
    .filter((name): name is string => Boolean(name));

  const duplicates = productNames.filter(
    (name, index) => productNames.indexOf(name) !== index
  );
  
  if (duplicates.length > 0) {
    const uniqueDuplicates = [...new Set(duplicates)];
    errors.push(
      `Duplicate product names found in request: ${uniqueDuplicates.join(", ")}`
    );
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateUpdateProduct(product: UpdateProductData): validationResult {
    const errors: string[] = [];

    const isValidProductId = validateProductId(product.productId)
    if(!isValidProductId.isValid){
        isValidProductId.errors.push("Invalid product Id")
        return isValidProductId;
    }
let hasUpdateField = false;
    // Product name (optional)
  if (product.productName !== undefined) {
    const nameError = isNonEmptyString(product.productName, 100, "Product name");
    if (nameError) errors.push(nameError);
    hasUpdateField = true;
  }

  // Description (optional)
  if (product.description !== undefined) {
    const descError = isNonEmptyString(product.description, 500, "Description");
    if (descError) errors.push(descError);
    hasUpdateField = true;
  }

  // Price (optional)
  if (product.price !== undefined) {
    const priceError = isNumber(product.price, "Price", { min: 0 });
    if (priceError) errors.push(priceError);
    hasUpdateField = true;
  }

  // Stock Quantity (optional)
  if (product.stockQuantity !== undefined) {
    const stockError = isNumber(product.stockQuantity, "Stock quantity", {
      min: 0,
      integer: true,
    });
    if (stockError) errors.push(stockError);
    hasUpdateField = true;
  }

  // Low Stock Threshold (optional)
  if (product.lowStockThreshold !== undefined) {
    const lowStockError = isNumber(product.lowStockThreshold, "Low stock threshold", {
      min: 0,
      integer: true,
    });
    if (lowStockError) errors.push(lowStockError);
    hasUpdateField = true;
  }

  // Ensure at least one field is being updated
  if (!hasUpdateField) {
    errors.push("At least one field (productName, description, price, stockQuantity, lowStockThreshold) must be provided to update");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateProductId(productId: unknown): validationResult {
    const errors: string[] = [];

    if (!productId || typeof productId !== "string" || productId.trim() === "") {
      errors.push("productId is required for update and must be a non-empty string");
    } else if (mongoose.Types.ObjectId.isValid(productId)){
        errors.push("Invalid product Id");
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

export function validateStockOperation(data: StockOperationData): validationResult {
  const errors: string[] = [];

  const isValidId = validateProductId(data.productId)
  if (!isValidId) {
    errors.push("productId is required and must be a non-empty string");
  } 

  const quantityError = isNumber(data.stockQuantity, "stockQuantity", {
    min: 0, 
    max: 10000, 
  });
  if (quantityError) errors.push(quantityError);

  return {
    isValid: errors.length === 0,
    errors,
  };
}