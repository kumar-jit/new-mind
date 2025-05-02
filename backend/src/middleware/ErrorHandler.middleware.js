import { logger } from "./Logger.middleware.js";
import { ErrorHandler } from "../utils/error/customeError.js"; 


export const globalErrorHandaler = (error, req, res, next) => {
    let message = "";
    if(error instanceof ErrorHandler){
        message = `${error.message || "server error! Try later!!" } , requestUrl : ${req.originalUrl}`; 
        res.status(error.status).json( { msg : error.message});
    }
    else{
        message = `${error.message || "server error! Try later!!" } , requestUrl : ${req.originalUrl}`; 
        res.status(500).json({ msg : "Internal server error! Please try again!!"});
    }
    logger.error(message);
    next();
}



// export const errorHandlerMiddleware = (err, req, res, next) => {

//     let message = `${err.message || "server error! Try later!!" } , requestUrl : ${req.originalUrl}`; 
//     logger.error(message);
    
//     err.message = err.message || "Internal server error";
//     err.statusCode = err.statusCode || 500;
//     res.status(err.statusCode).json({ success: false, error: err.message });
// };

// handling handleUncaughtError  Rejection
export const handleUncaughtError = () => {
    process.on("uncaughtException", (err) => {
        console.log(`Error: ${err}`);
        console.log("shutting down server bcz of uncaughtException");
    });
};