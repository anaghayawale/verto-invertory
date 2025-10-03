import { connectDB, clearDB, disconnectDB } from "../test-utils/db";
import mongoose from "mongoose";

describe("MongoDB Memory Server", () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterEach(async () => {
    await clearDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it("should connect to the in-memory database", async () => {
    expect(mongoose.connection.readyState).toBe(1); 
  });
});
