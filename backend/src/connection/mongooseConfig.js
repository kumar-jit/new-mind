import mongoose from "mongoose";

const baseUrl = process.env.MONGODB || "0.0.0.0:27017";
const dbName = process.env.DB_NAME || "default";
const bucketName = "uploads";
const mongoUri = `mongodb://${baseUrl}/${dbName}?replicaSet=rs0`;

let gfs = null;

/**
 * Connects to MongoDB and initializes GridFSBucket.
 */
export const connectUsingMongoose = async () => {
    try {
        const conn = await mongoose.connect(mongoUri, {});
        console.info(`MongoDB connected at ${mongoUri}`);

        const db = mongoose.connection.db;

        gfs = new mongoose.mongo.GridFSBucket(db, {
            bucketName: bucketName,
        });

        console.log(`GridFS initialized with bucket: '${bucketName}'`);
    } catch (err) {
        console.error("MongoDB connection failed:", err);
        throw err;
    }
};

/**
 * Returns the initialized GridFSBucket.
 */
export const getGridfsBucket = () => {
    if (!gfs) {
        throw new Error(
            "GridFS is not initialized. Make sure to call connectUsingMongoose() first."
        );
    }
    return gfs;
};
