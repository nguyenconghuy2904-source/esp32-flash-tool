#!/bin/bash

# Cloudflare D1 Database Setup Script
# Run this script to set up your D1 database

echo "🚀 Setting up Cloudflare D1 Database for ESP32 Flash Tool..."

# Step 1: Create D1 database
echo "📦 Creating D1 database..."
wrangler d1 create esp32-flash-keys

echo ""
echo "⚠️  IMPORTANT: Copy the database ID from the output above and update it in wrangler.toml"
echo ""
echo "📝 After updating wrangler.toml, run the migration:"
echo "   wrangler d1 migrations apply esp32-flash-keys --local"
echo "   wrangler d1 migrations apply esp32-flash-keys --remote"
echo ""
echo "🔧 To manage your database:"
echo "   wrangler d1 execute esp32-flash-keys --command=\"SELECT * FROM auth_keys;\""
echo ""
echo "📊 To add new keys:"
echo "   wrangler d1 execute esp32-flash-keys --command=\"INSERT INTO auth_keys (key_hash, description) VALUES ('YOUR32CHARHEXKEY', 'Description');\""