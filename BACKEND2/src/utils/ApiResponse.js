class ApiResponse {
    constructor(statusCode, data = null, message = "Success", meta = null) {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        if (meta && Object.keys(meta).length) {
            this.meta = meta;
        }
        this.success = statusCode < 400;
    }
}

export default ApiResponse;