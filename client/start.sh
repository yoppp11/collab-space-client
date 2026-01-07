#!/bin/bash

# CollabSpace Client - Quick Start Script

echo "🚀 Starting CollabSpace Client..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
EOF
    echo "✅ .env.local created"
else
    echo "✅ .env.local exists"
fi

echo ""
echo "📦 Installing dependencies..."
pnpm install

echo ""
echo "🎨 Starting development server..."
pnpm dev
