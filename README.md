# Project Title: New Mind - Web-based File Management System

A web-based file management system allowing users to upload, organize, view, and manage files and folders.

## Architecture Decisions

This project utilizes a modern web stack for efficient development and scalable performance.

### 1. Overall Stack
- **Frontend:** React (with Vite)
- **Backend:** Node.js (with Express.js)
- **Database:** MongoDB (with Mongoose ODM)
- **File Storage:** MongoDB GridFS

### 2. Frontend (React + Vite + Redux Toolkit)
- **React:** For building component-based, interactive UI.
- **Vite:** Fast dev server and HMR support.
- **Redux Toolkit:** Manages application state.
  - `createSlice`: Simplifies reducer/action logic for folders/files.
  - `createAsyncThunk`: Handles async actions (API calls).
  - **State Includes:** 
    - Current folder view
    - Loading/error status
    - Root folder info
    - Folder cache (`folderData`)
    - Expanded folders UI state
    - Statistics (`totalStats`)
  - **Lazy Loading:** `WorkspaceFolderById` and `folderData` for efficient navigation.
- **Axios:** HTTP client with base URL from `.env` (`VITE_HOST_URL`).

### 3. Backend (Node.js + Express + Mongoose)
- **Node.js:** Non-blocking I/O for API and file handling.
- **Express.js:** Routing and middleware.
- **Mongoose:** ODM for MongoDB.
  - `folderSchema`: Handles folder structure, paths, and children.
  - `fileSchema`: Handles file metadata and links to GridFS content.
  - Indexing for text search and unique file names.

### 4. Database (MongoDB)
- NoSQL DB suited for hierarchical file/folder structures.
- Schema supports parent-child relationships.

### 5. File Storage (GridFS)
- Stores files over 16MB by chunking.
- Keeps metadata and content in one system.
- Links file metadata to GridFS with `fileId`.

## Features
- Browse folders/files hierarchically.
- Lazy load folders for performance.
- Create folders inside others.
- Upload files to folders.
- Rename or delete files/folders.
- Basic stats (total files/folders).
- (Optional) File versioning (based on `version` field).

## Prerequisites
- Node.js (v18+)
- npm or yarn
- MongoDB (local or Atlas)
- MongoDB Replica Set setup for GridFS

### Example MongoDB Replica Set Setup
```bash
# Create data directory (e.g., mkdir ../27017)
# Run from MongoDB bin folder
mongod --dbpath ../27017 --port 27017 --replSet "rs0"
```

## Setup Instructions

### 1. Clone Repository
```bash
git clone https://github.com/kumar-jit/new-mind.git
cd new-mind
```

### 2. Backend Setup
```bash
cd backend
npm install
nodemon server.js
# Server runs on http://localhost:8000
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
# App runs on http://localhost:5173
```

### 4. Use `start.sh` (Optional)
```bash
chmod +x start.sh
./start.sh
```
### 4. Screen Shot
![image](https://github.com/user-attachments/assets/14588246-6a6b-468d-a404-0dbb4dca66a0)
![image](https://github.com/user-attachments/assets/c29a741c-da75-42c9-a1bd-20688ee06ea7)
![image](https://github.com/user-attachments/assets/773a0d1b-4a62-40b0-b8d0-707e285ab508)
![image](https://github.com/user-attachments/assets/42088cf8-d46e-4928-ab95-1bc854204865)
![image](https://github.com/user-attachments/assets/cfafcc06-69f6-47ea-8fbc-158a615e8c64)
![image](https://github.com/user-attachments/assets/2f6f2619-95b9-447d-aad8-4a0b14d50dd1)





