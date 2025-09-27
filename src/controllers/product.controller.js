import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Product } from "../models/product.model.js";
import { bodyDataExists } from "../utils/validations/bodyDataExists.js";

// ------------------------- Add New Product -------------------------
const addNewProduct = asyncHandler(async (req, res) => {
    const { name, description, stock_quantity, low_stock_threshold } = req.body;

    // Check if product with same name already exists
    const existingProduct = await Product.findOne({ name: name.trim() });
    if (existingProduct) {
        return res.status(400).json(
            new ApiResponse(400, {}, "Product with this name already exists")
        );
    }

    // Create new product instance
    const product = new Product({
        name: name.trim(),
        description: description || "",
        stock_quantity: stock_quantity || 0,
        low_stock_threshold: low_stock_threshold || 10
    });

    // Save the product
    const savedProduct = await product.save();
    
    if (!savedProduct) {
        return res.status(500).json(
            new ApiResponse(500, {}, "Error in adding product")
        );
    }

    console.log("Product added:", savedProduct);

    return res.status(201).json(
        new ApiResponse(201, { product: savedProduct }, "Product added successfully")
    );
});


export { addNewProduct };
