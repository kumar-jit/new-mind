#!/bin/bash

# Navigate to root directory of the project before running

# Run backend and client concurrently
echo "Starting backend and frontend..."

# Open both services in parallel
(
  cd backend
  echo "Starting backend with nodemon..."
  npx nodemon index.js
) &

(
  cd client
  echo "Starting Vite frontend..."
  npm run dev
)

# Wait for both to finish (optional if you want to wait)
wait
