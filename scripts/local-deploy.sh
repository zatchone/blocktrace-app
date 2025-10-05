#!/usr/bin/env bash
# Helper: start a clean local dfx replica and deploy canisters
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "Stopping any running dfx replica..."
dfx stop || true

echo "Starting dfx local replica with a clean state..."
dfx start --clean --background

echo "Deploying canisters..."
dfx deploy

echo "Done. Visit the frontend URL printed by dfx deploy or run 'dfx canister id blocktrace_frontend' to get the canister id."
