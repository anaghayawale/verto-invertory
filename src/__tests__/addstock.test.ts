import { Request, Response } from "express";
import { increaseStockQuantity } from "../controllers/product.controller";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

jest.mock("../models/product.model"); 
jest.mock("../utils/cache");
import { Product } from "../models/product.model";
import { cacheService } from "../utils/cache";

const mockRequestResponse = () => {
  const req = {
    body: {},
    user: { username: "testUser" },
  } as unknown as Request;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  const next = jest.fn();

  return { req, res, next };
};

describe("increaseStockQuantity", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if validation fails", async () => {
    const { req, res, next } = mockRequestResponse();
    req.body = { productId: "123", stockQuantity: null }; // invalid

    // mock validation to fail
    jest.spyOn(require("../utils/validations/productValidation"), "validateStockOperation")
      .mockReturnValue({ isValid: false, errors: ["Invalid data"] });

    await increaseStockQuantity(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.any(ApiError));
  });

//   it("should return 404 if product not found", async () => {
//     const { req, res, next } = mockRequestResponse();
//     req.body = { productId: "p1", stockQuantity: 5 };

//     jest.spyOn(require("../src/validators/stockValidator"), "validateStockOperation")
//       .mockReturnValue({ isValid: true });

//     (Product.findById as jest.Mock).mockResolvedValue(null);

//     await increaseStockQuantity(req, res, next);

//     expect(res.status).toHaveBeenCalledWith(404);
//     expect(res.json).toHaveBeenCalledWith(expect.any(ApiError));
//   });

//   it("should update stock and return 200 response", async () => {
//     const { req, res, next } = mockRequestResponse();
//     req.body = { productId: "p1", stockQuantity: 10 };

//     jest.spyOn(require("../src/validators/stockValidator"), "validateStockOperation")
//       .mockReturnValue({ isValid: true });

//     const existingProduct = {
//       productId: "p1",
//       productName: "Test Product",
//       stockQuantity: 5,
//       lowStockThreshold: 15,
//     };

//     (Product.findById as jest.Mock).mockResolvedValue(existingProduct);

//     const updatedProduct = { ...existingProduct, stockQuantity: 15 };
//     (Product.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedProduct);

//     await increaseStockQuantity(req, res, next);

//     expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
//       "p1",
//       { stockQuantity: 15, updatedBy: "testUser" },
//       { new: true }
//     );

//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith(expect.any(ApiResponse));

//     // ✅ also check cache clear calls
//     expect(cacheService.clearByPattern).toHaveBeenCalledWith("product:");
//     expect(cacheService.clearByPattern).toHaveBeenCalledWith("products:low-stock");
//   });

//   it("should return 500 if update fails", async () => {
//     const { req, res, next } = mockRequestResponse();
//     req.body = { productId: "p1", stockQuantity: 10 };

//     jest.spyOn(require("../src/validators/stockValidator"), "validateStockOperation")
//       .mockReturnValue({ isValid: true });

//     const existingProduct = {
//       productId: "p1",
//       productName: "Test Product",
//       stockQuantity: 5,
//       lowStockThreshold: 10,
//     };

//     (Product.findById as jest.Mock).mockResolvedValue(existingProduct);
//     (Product.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

//     await increaseStockQuantity(req, res, next);

//     expect(res.status).toHaveBeenCalledWith(500);
//     expect(res.json).toHaveBeenCalledWith(expect.any(ApiError));
//   });
});
