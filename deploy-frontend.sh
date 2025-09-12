#!/bin/bash

# Deploy BlockTrace Frontend to Internet Computer

echo "🚀 Deploying BlockTrace Frontend to ICP..."

# Build the Next.js app for static export
cd src/blocktrace-frontend-main
npm run build
npm run export

# Deploy to ICP
cd ../..
dfx deploy --network ic blocktrace_frontend

echo "✅ Frontend deployed to ICP!"
echo "🔗 Your app will be available at: https://<canister-id>.ic0.app"