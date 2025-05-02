# Project Title (Replace with your project name)

A brief description of your project. (e.g., A web-based file management system allowing users to upload, organize, view, and manage files and folders.)

## Architecture Decisions

This project utilizes a modern web stack designed for efficient development and scalable performance.

**1. Overall Stack:**
   - **Frontend:** React (with Vite)
   - **Backend:** Node.js (likely with Express.js)
   - **Database:** MongoDB (with Mongoose ODM)
   - **File Storage:** MongoDB GridFS

**2. Frontend (React + Vite + Redux Toolkit):**
   - **React:** Chosen for building a component-based, interactive user interface. Its declarative nature and large ecosystem facilitate UI development.
   - **Vite:** Used as the frontend build tool and development server. It offers significantly faster cold starts and Hot Module Replacement (HMR) compared to traditional bundlers, improving developer productivity.
   - **Redux Toolkit:** Employed for centralized state management.
     - **`createSlice`:** Simplifies reducer logic and action creation for managing the directory state (`DirSlice`).
     - **`createAsyncThunk`:** Handles asynchronous operations (API calls to the backend) for fetching data (root folder, specific folders via lazy loading, total stats, file viewing), creating, updating, and deleting files and folders.
     - **State Structure:** The Redux store maintains the current directory view (`items`), loading/error states, information about the root folder (`rootFolderInfo`), cached folder contents (`folderData`), UI state for expanded folders (`expandedFolders`), and overall statistics (`totalStats`).
     - **Lazy Loading:** The `WorkspaceFolderById` thunk and `folderData` state cache enable lazy loading of folder contents, improving initial load performance.
   - **Axios:** Used as the HTTP client to interact with the backend REST API. API endpoint URLs are configurable via environment variables (`VITE_HOST_URL`).

**3. Backend (Node.js + Express + Mongoose):**
   - **Node.js:** Provides an efficient, non-blocking I/O environment suitable for handling API requests, database interactions, and file streaming operations. Using JavaScript across the stack simplifies development.
   - **Express.js (Assumed):** A minimal and flexible Node.js web application framework likely used to structure the backend API, handle routing, and middleware.
   - **Mongoose:** Serves as the Object Data Modeling (ODM) library for MongoDB. It provides schema definition (`fileSchema`, `folderSchema`), validation, query building, and business logic hooks, making database interactions more structured and predictable.
     - **`folderSchema`:** Defines the structure for folders, including parent-child relationships (`parent`, `childFolders`, `childFiles`), path information, and counts. Indexes are used for efficient querying (text search on `name`/`path`, unique constraint on `name` within the same `parent`).
     - **`fileSchema`:** Defines the metadata associated with files (`filename`, `contentType`, `extension`, `version`) and links to the actual file content stored in GridFS via `fileId`. A unique index prevents duplicate filenames (including extension) within the same folder.

**4. Database (MongoDB):**
   - A NoSQL document database chosen for its flexibility and suitability for storing hierarchical data like file/folder structures. The schema design accommodates nested relationships and file metadata efficiently.

**5. File Storage (MongoDB GridFS):**
   - GridFS is used to store file content directly within MongoDB, overcoming the 16MB BSON document size limit by chunking files. This keeps file data and metadata together within the database, simplifying backups and deployment compared to storing files on a separate filesystem. The `fileSchema` links metadata records to the corresponding GridFS chunks via the `fileId`.

## Features (Based on implementation)

- View files and folders in a hierarchical structure.
- Lazy load folder contents for improved performance.
- Create new folders within existing folders.
- Upload files to specific folders.
- Rename files and folders.
- Delete files and folders.
- View basic statistics (total file/folder count).
- (Potentially) File versioning (based on `version` field in `fileSchema`, though logic isn't fully detailed).

## Prerequisites

- Node.js (v18.x or later recommended)
- npm or yarn
- MongoDB instance (local or cloud-based like MongoDB Atlas) accessible to the backend.
- for mongodb replica set is require
```bash
  #create folder in root (eg 27017 or as you like
   #open mongodb bin folder run the below cmd (../27017 -> folder)
  mongod --dbpath ../27017 --port 27017 --replSet "rs0"
```

## Setup Instructions

**1. Clone the Repository:**
   ```bash
   git clone [<your-repository-url>](https://github.com/kumar-jit/new-mind.git)
   cd new-mind
```
**2. Backend Setup
```bash
  cd backend
  npm install
  nodemon server.js
## http://localhost:8000
```
**2. Frontend Setup
```bash
  cd client
  npm install
  npm run dev
## http://localhost:5173
```
**3. Start using `start.sh`
```bash
  chmod +x start.sh
  ./start.sh
```

