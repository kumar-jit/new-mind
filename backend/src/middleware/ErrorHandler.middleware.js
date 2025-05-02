import { logger } from "./Logger.middleware.js";
import { ErrorHandler } from "../utils/error/customeError.js";

export const globalErrorHandaler = (error, req, res, next) => {
    let message = "";
    if (error instanceof ErrorHandler) {
        message = `${
            error.message || "server error! Try later!!"
        } , requestUrl : ${req.originalUrl}`;
        res.status(error.status).json({ msg: error.message });
    } else {
        message = `${
            error.message || "server error! Try later!!"
        } , requestUrl : ${req.originalUrl}`;
        res.status(500).json({
            msg: "Internal server error! Please try again!!",
        });
    }
    logger.error(message);
    next();
};

// handling handleUncaughtError  Rejection
export const handleUncaughtError = () => {
    process.on("uncaughtException", (err) => {
        console.log(`Error: ${err}`);
        console.log("shutting down server bcz of uncaughtException");
    });
};
