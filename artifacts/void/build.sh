#!/bin/bash
set -e

echo "Installing dependencies with legacy peer deps..."
npm install --legacy-peer-deps

echo "Building with Vite..."
npm run build

echo "Build complete!"
