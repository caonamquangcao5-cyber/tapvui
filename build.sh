#!/bin/bash
echo "🔧 Building frontend..."
cd client
npm install
npm run build
echo "✅ Frontend built to client/dist/"
cd ..
echo "🔧 Installing backend dependencies..."
cd server
npm install
cd ..
echo "✅ Build complete!"
