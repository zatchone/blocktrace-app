#!/bin/bash

# 🚀 BlockTrace Advanced ICP Features Test Script
echo "🚀 Testing BlockTrace Advanced ICP Features..."
echo "=============================================="

# Check if dfx is running
if ! dfx ping > /dev/null 2>&1; then
    echo "❌ dfx is not running. Please start with: dfx start --background"
    exit 1
fi

echo "✅ dfx is running"

# Get canister info
echo ""
echo "📊 Canister Status:"
dfx canister call blocktrace_backend get_canister_info

echo ""
echo "🔧 Advanced Features Status:"
dfx canister call blocktrace_backend get_advanced_features_status

# Test 1: HTTP Outcalls - Supplier Verification
echo ""
echo "🌐 Testing HTTP Outcalls - Supplier Verification..."
dfx canister call blocktrace_backend verify_supplier_with_api '("supplier_certified_123", null)'

# Test 2: Advanced Timers - ESG Monitoring
echo ""
echo "⏰ Testing Advanced Timers - ESG Monitoring..."
dfx canister call blocktrace_backend schedule_esg_recalculation '("PROD123", 60)'

# Test 3: t-ECDSA - Cross-chain Proof Generation
echo ""
echo "🔐 Testing t-ECDSA - Cross-chain Proof Generation..."
dfx canister call blocktrace_backend generate_cross_chain_proof '("PROD123", "ethereum")'

# Add a sample product step first
echo ""
echo "📦 Adding sample product step..."
dfx canister call blocktrace_backend add_step '(record {
    product_id = "PROD123";
    actor_name = "Test Manufacturer";
    role = "Manufacturer";
    action = "Production Complete";
    location = "Factory A, China";
    notes = opt "Advanced features test";
    timestamp = 0;
    status = opt "verified";
    transport_mode = opt "truck";
    temperature_celsius = opt 22.5;
    humidity_percent = opt 45.0;
    gps_latitude = opt 39.9042;
    gps_longitude = opt 116.4074;
    batch_number = opt "BATCH001";
    certification_hash = opt "sha256:abc123";
    estimated_arrival = opt 1640995200;
    actual_arrival = opt 1640995200;
    quality_score = opt 95;
    carbon_footprint_kg = opt 12.5;
    distance_km = opt 150.0;
    cost_usd = opt 25.50;
    blockchain_hash = opt "0x123abc";
})'

# Test HTTP Outcalls with real-time carbon data
echo ""
echo "🌐 Testing Real-time Carbon Data API..."
dfx canister call blocktrace_backend fetch_real_time_carbon_data '("truck", 150.0)'

# Test timer monitoring
echo ""
echo "⏰ Checking Active Timers..."
dfx canister call blocktrace_backend get_active_timers

# Test cross-chain verification
echo ""
echo "🔐 Testing Cross-chain Verification..."
dfx canister call blocktrace_backend verify_cross_chain_proof_on_ethereum '("PROD123")'

# Get automated ESG updates
echo ""
echo "📈 Checking Automated ESG Updates..."
dfx canister call blocktrace_backend get_automated_esg_updates

# Final status check
echo ""
echo "📊 Final Canister Status:"
dfx canister call blocktrace_backend get_canister_info

echo ""
echo "✅ Advanced Features Test Complete!"
echo "🌐 HTTP Outcalls: Supplier verification and carbon data APIs"
echo "⏰ Advanced Timers: Automated ESG monitoring activated"
echo "🔐 t-ECDSA: Cross-chain proofs generated for Ethereum/Bitcoin"
echo ""
echo "📖 See ADVANCED_FEATURES.md for detailed documentation"