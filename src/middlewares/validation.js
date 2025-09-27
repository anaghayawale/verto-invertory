import { ApiResponse } from "../utils/ApiResponse.js";

// Generic validation middleware
const validate = (validationRules) => {
  return (req, res, next) => {
    const errors = [];
    
    // Run all validation rules
    validationRules.forEach(rule => {
      const error = rule(req.body);
      if (error) {
        errors.push(error);
      }
    });

    if (errors.length > 0) {
      return res.status(400).json(
        new ApiResponse(400, {}, "Validation failed", errors)
      );
    }

    next();
  };
};

// Product validation rules
const productValidationRules = {
  name: (body) => {
    if (!body.name || body.name.trim().length === 0) {
      return 'Product name is required';
    }
    if (typeof body.name !== 'string') {
      return 'Product name must be a string';
    }
    if (body.name.trim().length > 100) {
      return 'Product name cannot exceed 100 characters';
    }
    return null;
  },

  description: (body) => {
    if (body.description !== undefined) {
      if (typeof body.description !== 'string') {
        return 'Description must be a string';
      }
      if (body.description.length > 500) {
        return 'Description cannot exceed 500 characters';
      }
    }
    return null;
  },

  stockQuantity: (body) => {
    if (body.stock_quantity !== undefined) {
      if (!Number.isInteger(body.stock_quantity)) {
        return 'Stock quantity must be a whole number';
      }
      if (body.stock_quantity < 0) {
        return 'Stock quantity cannot be negative';
      }
    }
    return null;
  },

  lowStockThreshold: (body) => {
    if (body.low_stock_threshold !== undefined) {
      if (!Number.isInteger(body.low_stock_threshold)) {
        return 'Low stock threshold must be a whole number';
      }
      if (body.low_stock_threshold < 0) {
        return 'Low stock threshold cannot be negative';
      }
    }
    return null;
  }
};

// Validation middleware for creating products
const validateCreateProduct = validate([
  productValidationRules.name,
  productValidationRules.description,
  productValidationRules.stockQuantity,
  productValidationRules.lowStockThreshold
]);

// Middleware to check if request has valid body
const validateRequestBody = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json(
      new ApiResponse(400, {}, "Request body is required")
    );
  }
  next();
};

export {
  validateCreateProduct,
  validateRequestBody
};