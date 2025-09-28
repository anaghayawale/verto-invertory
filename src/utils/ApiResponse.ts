class ApiResponse<T> {
  public success: boolean;
  public data?: T;
  public message: string;

  constructor(status: number, message: string = "Success", data?: T) {
    this.success = status < 400;
    this.message = message;
    if (data !== undefined) {
      this.data = data;
    }
  }
}

export { ApiResponse };
