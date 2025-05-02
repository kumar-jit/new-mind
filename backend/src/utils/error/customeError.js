export class ErrorHandler extends Error {
    constructor(statusCode, error) {
        super(error);
        this.status = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}