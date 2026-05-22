#!/bin/bash
set -e

# Ensure we're at the root
cd /vercel/input

# Install all dependencies (this will resolve workspaces from root)
npm install --legacy-peer-deps

# Build only the API server
npm run build -w=artifacts/api-server

echo "Build completed successfully"
