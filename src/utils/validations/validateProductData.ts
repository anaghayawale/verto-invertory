import { isNonEmptyString, isNumber } from "./helper";

interface ProductData {
  productName?: string;
  description?: string;
  price?: number;
  stockQuantity?: number;
  lowStockThreshold?: number;
}

function validateProductData(product: ProductData) {
  const errors: string[] = [];

  const nameError = isNonEmptyString(product.productName, 100, "Product name");
  if (nameError) errors.push(nameError);

  const descError = isNonEmptyString(product.description, 500, "Description");
  if (descError) errors.push(descError);

  const priceError = isNumber(product.price, "Price", { min: 0 });
  if (priceError) errors.push(priceError);

  const stockError = isNumber(product.stockQuantity, "Stock quantity", { min: 0, integer: true });
  if (stockError) errors.push(stockError);

  if (product.lowStockThreshold !== undefined) {
    const lowStockError = isNumber(product.lowStockThreshold, "Low stock threshold", { min: 0, integer: true });
    if (lowStockError) errors.push(lowStockError);
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
    const validation = validateProductData(product);

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