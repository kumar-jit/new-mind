const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4000;
const UPLOAD_DIR = 'uploads';
const SSE_CLIENTS = {};

app.use(cors());
app.use(express.json());


const fileSchema = new mongoose.Schema({
  filename: String,
  size: Number,
  status: String,
});

const File = mongoose.model('File', fileSchema);

// SSE endpoint
app.get('/events/:id', (req, res) => {
  const clientId = req.params.id;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  SSE_CLIENTS[clientId] = res;

  req.on('close', () => {
    delete SSE_CLIENTS[clientId];
  });
});

// Upload handling
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

app.post('/upload/:id', upload.single('file'), async (req, res) => {
  const { id } = req.params;
  const file = req.file;

  const dbFile = new File({
    filename: file.originalname,
    size: file.size,
    status: 'uploaded',
  });
  await dbFile.save();

  // Simulate upload progress
  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    if (SSE_CLIENTS[id]) {
      SSE_CLIENTS[id].write(`data: ${JSON.stringify({ filename: file.originalname, progress })}\n\n`);
    }

    if (progress >= 100) {
      clearInterval(interval);
      if (SSE_CLIENTS[id]) {
        SSE_CLIENTS[id].write(`data: ${JSON.stringify({ filename: file.originalname, progress: 100, done: true })}\n\n`);
      }
    }
  }, 200);

  res.json({ message: 'Upload started', filename: file.originalname });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
