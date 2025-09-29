import { isNonEmptyString, isNumber } from "./helper";

export interface ProductData {
  productId?: string;
  productName: string;
  description: string;
  price: number;
  stockQuantity: number;
  lowStockThreshold: number;
}

function validateProductData(
  product: Partial<ProductData>,
  { isCreate = true }: { isCreate?: boolean } = {}
) {
  const errors: string[] = [];

  if (!isCreate) {
    if (!product.productId || typeof product.productId !== "string" || product.productId.trim() === "") {
      errors.push("productId is required for update and must be a non-empty string");
    }
  }

   let hasUpdateField = false;

  // Product name
  if (isCreate || product.productName !== undefined) {
    const nameError = isNonEmptyString(product.productName, 100, "Product name");
    if (nameError) errors.push(nameError);
    hasUpdateField = true
  }

  // Description
  if (isCreate || product.description !== undefined) {
    const descError = isNonEmptyString(product.description, 500, "Description");
    if (descError) errors.push(descError);
    hasUpdateField = true
  }

  // Price
  if (isCreate || product.price !== undefined) {
    const priceError = isNumber(product.price, "Price", { min: 0 });
    if (priceError) errors.push(priceError);
    hasUpdateField = true
  }

  // Stock Quantity
  if (isCreate || product.stockQuantity !== undefined) {
    const stockError = isNumber(product.stockQuantity, "Stock quantity", {
      min: 0,
      integer: true,
    });
    if (stockError) errors.push(stockError);
    hasUpdateField = true
  }

  // Low Stock Threshold
  if (isCreate || product.lowStockThreshold !== undefined) {
    const lowStockError = isNumber(product.lowStockThreshold, "Low stock threshold", {
      min: 0,
      integer: true,
    });
    if (lowStockError) errors.push(lowStockError);
    hasUpdateField = true
  }

   if (!isCreate && product.productId && !hasUpdateField) {
    errors.push("At least one field (productName, description, price, stockQuantity, lowStockThreshold) must be provided to update");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}


function validateProductsArray(products: ProductData[]) {
  const errors: string[] = [];

  if (!Array.isArray(products)) {
    errors.push("Request body must be an array of products");
    return { isValid: false, errors };
  }

  if (products.length === 0) {
    errors.push("Products array cannot be empty");
    return { isValid: false, errors };
  }

  products.forEach((product, index) => {
    const validation = validateProductData(product, { isCreate : true});

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
    errors: errors,
  };
}

export { validateProductData, validateProductsArray };