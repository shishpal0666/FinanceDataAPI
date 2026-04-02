class ApiResponse {
  constructor(success, data, message, meta) {
    this.success = success;
    if (data !== undefined) this.data = data;
    if (message !== undefined) this.message = message;
    if (meta !== undefined) this.meta = meta;
  }

  static ok(data, message, meta) {
    return new ApiResponse(true, data, message, meta);
  }

  static fail(message) {
    return new ApiResponse(false, undefined, message);
  }
}

module.exports = ApiResponse;
