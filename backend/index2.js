// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto'); // For GridFS filename
const path = require('path');    // For GridFS filename
const { GridFsStorage } = require('multer-gridfs-storage');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 5001; // Use a different port than React dev server

// --- Configuration ---
const mongoURI = 'mongodb://localhost:27017/large_file_uploads'; // Replace with your MongoDB URI

// --- Middleware ---
app.use(cors()); // Allow requests from React frontend
app.use(express.json());

// --- MongoDB Connection ---
mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

const conn = mongoose.connection;
let gfs, gridfsBucket;

conn.once('open', () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads'
    });
    gfs = gridfsBucket; // Simpler reference if needed elsewhere
    console.log('GridFS Initialized');
});

// --- Store active SSE connections ---
// Map<uploadId, { res: Response, fileId: string | null, progress: number, fileName: string }>
const sseClients = new Map();

// --- Multer Storage Engine (GridFS) ---
const storage = new GridFsStorage({
    url: mongoURI,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads',
                    metadata: { // Store original filename and uploadId
                        originalName: file.originalname,
                        uploadId: req.params.uploadId // Get uploadId from route param
                    }
                };
                resolve(fileInfo);
            });
        });
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 1024 * 1024 * 1024 * 2 }, // Example: 2GB limit - adjust as needed!
    fileFilter: function (req, file, cb) {
        // Basic validation (optional)
        // if (!file.originalname.match(/\.(jpg|jpeg|png|mp4|mov|pdf|zip)$/)) {
        //     return cb(new Error('Only specific file types are allowed!'), false);
        // }
        cb(null, true);
    }
});

// --- API Routes ---

// 1. SSE Endpoint for Progress Updates
app.get('/progress/:uploadId', (req, res) => {
    const { uploadId } = req.params;

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // Flush headers to establish connection

    // Store the client response object
    sseClients.set(uploadId, { res, fileId: null, progress: 0, fileName: 'N/A' });
    console.log(`SSE Client connected for uploadId: ${uploadId}`);

    // Send initial progress
    sendProgress(uploadId, 0);

    // Handle client disconnect
    req.on('close', () => {
        console.log(`SSE Client disconnected for uploadId: ${uploadId}`);
        sseClients.delete(uploadId);
        res.end(); // Ensure response stream is closed
    });
});


// 2. File Upload Endpoint
// We pass uploadId in the URL to easily associate it with the SSE connection
app.post('/upload/:uploadId', (req, res) => {
    const { uploadId } = req.params;

    if (!sseClients.has(uploadId)) {
        return res.status(400).json({ message: 'Invalid upload session. SSE connection not found.' });
    }

    // Create a custom upload handler to track progress
    const singleUpload = upload.single('file'); // 'file' is the field name in FormData

    singleUpload(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            console.error("Multer Error:", err);
            sendError(uploadId, `Upload Error: ${err.message}`);
            cleanupSSE(uploadId);
            return res.status(500).json({ message: `Multer error: ${err.message}` });
        } else if (err) {
            console.error("Unknown Upload Error:", err);
            sendError(uploadId, `Upload Error: ${err.message || 'Unknown error'}`);
            cleanupSSE(uploadId);
            return res.status(500).json({ message: `Upload error: ${err.message || 'Unknown error'}` });
        }

        if (!req.file) {
            sendError(uploadId, 'No file was uploaded.');
            cleanupSSE(uploadId);
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        // --- Progress Tracking ---
        // Multer-GridFS-Storage doesn't directly expose progress streams easily.
        // A more robust (but complex) solution would involve piping streams manually.
        // For simplicity here, we'll simulate progress reporting *after* GridFS confirms the write.
        // In a real-world scenario with huge files, you'd tap into the stream itself.

        console.log(`File ${req.file.originalname} uploaded successfully for ${uploadId}, fileId: ${req.file.id}`);

        // Update SSE client info
        const clientInfo = sseClients.get(uploadId);
        if (clientInfo) {
            clientInfo.fileId = req.file.id.toString();
            clientInfo.fileName = req.file.metadata.originalName || req.file.filename;
            // Send final progress update
            sendProgress(uploadId, 100, clientInfo.fileId, clientInfo.fileName, 'completed');
            cleanupSSE(uploadId); // Close SSE after completion
        }


        // Respond to the initial POST request
        res.status(201).json({
            message: 'File uploaded successfully!',
            fileId: req.file.id,
            fileName: req.file.filename,
            originalName: req.file.metadata.originalName,
            uploadId: uploadId
        });
    });

    // --- Simplified Progress Reporting (Simulated) ---
    // This part is tricky without direct stream access from multer-gridfs-storage.
    // We'll send progress updates from the SSE endpoint setup instead.
    // A more advanced approach involves overriding parts of multer or using a different strategy.
    // Let's assume the upload process *itself* could report progress if we had access to the stream.
    // For this example, we primarily rely on the SSE connection being established *before*
    // the upload starts and sending completion/error messages.
    // We can send an "uploading" status though.

    const clientInfo = sseClients.get(uploadId);
    if (clientInfo && req.headers['content-length']) {
        clientInfo.fileName = req.headers['x-file-name'] || 'file'; // Get filename from header if possible
        sendProgress(uploadId, 0, null, clientInfo.fileName, 'uploading');

        // ---- Real Stream Progress (Conceptual - Harder with multer-gridfs-storage) ----
        /*
        If you were piping manually:
        const totalBytes = parseInt(req.headers['content-length'], 10);
        let uploadedBytes = 0;
        req.on('data', chunk => {
             uploadedBytes += chunk.length;
             const percentage = Math.round((uploadedBytes / totalBytes) * 100);
             // Throttle sending progress updates (e.g., every 1%)
             if (percentage > clientInfo.progress) {
                 clientInfo.progress = percentage;
                 sendProgress(uploadId, percentage, null, clientInfo.fileName, 'uploading');
             }
        });
        req.on('end', () => {
            // Upload *stream* finished, now wait for GridFS write confirmation
        });
        */
    } else if (clientInfo) {
         clientInfo.fileName = req.headers['x-file-name'] || 'file';
         sendProgress(uploadId, 0, null, clientInfo.fileName, 'uploading');
    }


});

// --- Helper Functions ---
function sendProgress(uploadId, percentage, fileId = null, fileName = null, status = 'uploading') {
    const clientInfo = sseClients.get(uploadId);
    if (clientInfo && clientInfo.res) {
        const data = {
            uploadId,
            percentage: Math.min(100, Math.max(0, percentage)), // Clamp between 0-100
            status,
            fileId,
            fileName: fileName || clientInfo.fileName,
        };
        // Format for SSE: 'data: {...}\n\n'
        clientInfo.res.write(`data: ${JSON.stringify(data)}\n\n`);
        console.log(`SSE Sent to ${uploadId}:`, data);

        // Update stored progress if needed
        clientInfo.progress = data.percentage;
        if(fileName) clientInfo.fileName = fileName;
        if(fileId) clientInfo.fileId = fileId;

    } else {
         console.log(`SSE Cannot Send: No client found for uploadId: ${uploadId}`);
    }
}

function sendError(uploadId, errorMessage) {
     const clientInfo = sseClients.get(uploadId);
    if (clientInfo && clientInfo.res) {
        const data = {
            uploadId,
            status: 'error',
            message: errorMessage,
            fileName: clientInfo.fileName
        };
        clientInfo.res.write(`data: ${JSON.stringify(data)}\n\n`);
        console.log(`SSE Error Sent to ${uploadId}:`, data);
    }
}

function cleanupSSE(uploadId) {
    const clientInfo = sseClients.get(uploadId);
    if (clientInfo && clientInfo.res) {
        clientInfo.res.end(); // Close the connection
    }
    sseClients.delete(uploadId);
    console.log(`SSE Cleanup for uploadId: ${uploadId}`);
}


// --- Start Server ---
app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
});