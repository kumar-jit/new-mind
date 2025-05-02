import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { globalErrorHandaler } from "./src/middleware/ErrorHandler.middleware.js";
import { invalidRoutesHandlerMiddleware } from "./src/middleware/InvalideRoute.middleware.js";
import folderRouter from "./src/routers/Folder.route.js";
import fileRouter from "./src/routers/Files.route.js";

export const app = express();
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "*", // Allow all origins by default, or specify your own
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    })
);

app.use("/api/v1/folder", folderRouter);
app.use("/api/v1/file", fileRouter);

app.get("/", (req, res, next) => {
    res.send("working");
});

app.use(invalidRoutesHandlerMiddleware);
app.use(globalErrorHandaler);
