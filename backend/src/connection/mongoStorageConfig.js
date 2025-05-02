import multer from "multer";
// import { GridFsStorage } from "multer-gridfs-storage";
// import { ObjectId } from "mongodb";

// const baseUrl = process.env.MONGODB || '0.0.0.0:27017';
// const collectionName = process.env.DB_NAME || 'default'

// const storage = new GridFsStorage({
//     url: `mongodb://${baseUrl}/${collectionName}`,
//     file: async (req, file) => {
//         const id = new ObjectId();
//         return {
//           _id: id,
//           filename: file.originalname,
//           bucketName: 'uploads',
//           metadata: {
//             // handle folderId manually if really needed
//           }
//         };
//       }
// });

const  storage =  multer.memoryStorage()

export const upload = multer({ storage });
