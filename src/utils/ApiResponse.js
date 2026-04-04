class ApiResponse {
  constructor(success, data, message, meta, errors) {
    this.success = success;
    if (data    !== undefined) this.data    = data;
    if (message !== undefined) this.message = message;
    if (meta    !== undefined) this.meta    = meta;
    if (errors  !== undefined) this.errors  = errors; // array of { field, message }
  }

  static ok(data, message, meta) {
    return new ApiResponse(true, data, message, meta);
  }

  static fail(message, errors) {
    return new ApiResponse(false, undefined, message, undefined, errors);
  }
}

module.exports = ApiResponse;
