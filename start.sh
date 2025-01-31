#!/bin/bash

# Start backend
echo "Starting backend server..."
cd backend
npm install
npm start &

# Wait for backend to start
sleep 5

# Start frontend
echo "Starting frontend server..."
cd ../frontend
npm install
npm run dev &

echo "Both servers are starting..."
echo "Frontend will be available at: http://localhost:5173"
echo "Backend will be available at: http://localhost:5000"
