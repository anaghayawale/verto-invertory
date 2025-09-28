import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { IProduct } from "../models/product.model";
import { isEmptyValue, isNumber } from "../utils/validations/filterData";

function validateCreateProduct(req: Request, res: Response, next: NextFunction): void {
  const product: IProduct = req.body;
  const errors: string[] = [];

  // Validate productName
  if (isEmptyValue(product.productName)) {
    errors.push("Product productName is required and must be a non-empty string");
  } else if (product.productName.trim().length > 100) {
    errors.push("Product productName cannot exceed 100 characters");
  }

  // Validate description (optional)
  if (isEmptyValue(product.description)) {
    if (typeof product.description !== "string") {
      errors.push("Description must be a string");
    } else if (product.description.length > 500) {
      errors.push("Description cannot exceed 500 characters");
    }
  }

  // Validate stockQuantity (required)
  if (isEmptyValue(product.stockQuantity)) {
    errors.push("Stock quantity is required");
  } else {
    if (!isNumber(Number(product.stockQuantity))) {
      errors.push("Stock quantity must be a whole number");
    } else {
      const quantity = Number(product.stockQuantity);
      if (quantity < 0) {
        errors.push("Stock quantity cannot be negative");
      }
    }
  }

  // Validate lowStockThreshold (required)
  if (isEmptyValue(product.lowStockThreshold)) {
    errors.push("Low stock threshold is required");
  } else {
    if (!isNumber(Number(product.lowStockThreshold))) {
      errors.push("Low stock threshold must be a whole number");
    } else {
      const threshold = Number(product.lowStockThreshold);
      if (threshold < 0) {
        errors.push("Low stock threshold cannot be negative");
      }
    }
  }

  // If there are validation errors, return them
  if (errors.length > 0) {
    res.status(400).json(new ApiError("Validation failed",  errors ));
    return;
  }

  // Sanitize data before proceeding
  if (product.productName && typeof product.productName === "string") {
    req.body.productName = product.productName.trim();
  }
  
  if (product.description && typeof product.description === "string") {
    req.body.description = product.description.trim();
  }

  // Convert string numbers to actual numbers if needed
  if (typeof req.body.stockQuantity === "string") {
    req.body.stockQuantity = parseInt(req.body.stockQuantity, 10);
  }

  if (typeof req.body.lowStockThreshold === "string") {
    req.body.lowStockThreshold = parseInt(req.body.lowStockThreshold, 10);
  }

  next();
}

// Middleware to check if request has valid body
function validateRequestBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400).json(new ApiResponse(400, "Request body is required"));
    return;
  }
  next();
}

export { validateCreateProduct, validateRequestBody };