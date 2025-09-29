class ApiError extends Error {
  public success: boolean;
  public errors: string[];
  public msg: string;

  constructor(
    message: string = "Something went wrong",
    errors: string[] = [],
    stack: string = ""
  ) {
    super(message);

    this.success = false;
    this.msg = message;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
