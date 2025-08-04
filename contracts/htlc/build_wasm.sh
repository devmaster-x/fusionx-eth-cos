#!/bin/bash

# Build script for optimized HTLC contract
# This script uses Docker to build the .wasm file reliably

echo "🚀 Building optimized HTLC contract..."

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf target/
rm -f *.wasm

# Build using CosmWasm optimizer
echo "🔨 Building with CosmWasm optimizer..."
docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/optimizer:0.16.0

# Check if build was successful
if [ -f "artifacts/htlc.wasm" ]; then
    echo "✅ Build successful!"
    echo "📦 Optimized .wasm file created: artifacts/htlc.wasm"
    echo "📊 File size: $(ls -lh artifacts/htlc.wasm | awk '{print $5}')"
    
    # Copy to root for easy access
    cp artifacts/htlc.wasm ./htlc_optimized.wasm
    echo "📋 Copied to: ./htlc_optimized.wasm"
    
    echo ""
    echo "🎉 Your optimized HTLC contract is ready for deployment!"
    echo "📁 Files created:"
    echo "   - artifacts/htlc.wasm (original)"
    echo "   - ./htlc_optimized.wasm (copy)"
    echo ""
    echo "🚀 You can now upload htlc_optimized.wasm to your UI for deployment."
else
    echo "❌ Build failed. Check the error messages above."
    exit 1
fi 