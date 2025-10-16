#!/bin/bash

# ESP32 Flash Tool - Key Generator Script
# Generates secure 32-character hexadecimal keys for authentication

echo "🔑 ESP32 Flash Tool - Key Generator"
echo "=================================="

# Function to generate a single key
generate_key() {
    # Generate 32 random hex characters (16 bytes = 32 hex chars)
    openssl rand -hex 16 | tr '[:lower:]' '[:upper:]'
}

# Function to generate multiple keys
generate_multiple_keys() {
    local count=$1
    local description=$2
    
    echo "Generating $count keys..."
    echo ""
    echo "SQL Commands to add keys to database:"
    echo "-----------------------------------"
    
    for i in $(seq 1 $count); do
        key=$(generate_key)
        echo "INSERT INTO auth_keys (key_hash, description) VALUES ('$key', '$description - Key $i');"
    done
    
    echo ""
    echo "Keys for end users:"
    echo "------------------"
    
    for i in $(seq 1 $count); do
        key=$(generate_key)
        echo "Key $i: $key"
    done
}

# Function to validate key format
validate_key() {
    local key=$1
    if [[ $key =~ ^[A-F0-9]{32}$ ]]; then
        echo "✅ Valid key format: $key"
        return 0
    else
        echo "❌ Invalid key format: $key"
        echo "   Keys must be exactly 32 hexadecimal characters (0-9, A-F)"
        return 1
    fi
}

# Main menu
show_menu() {
    echo ""
    echo "Select an option:"
    echo "1) Generate single key"
    echo "2) Generate multiple keys"
    echo "3) Validate existing key"
    echo "4) Generate keys for production batch"
    echo "5) Show key format requirements"
    echo "q) Quit"
    echo ""
    read -p "Enter your choice: " choice
}

# Production batch generator
generate_production_batch() {
    echo ""
    echo "🏭 Production Key Batch Generator"
    echo "================================"
    
    read -p "Enter batch description (e.g., 'Production Batch Nov 2024'): " batch_desc
    read -p "Enter number of keys to generate: " key_count
    
    if ! [[ "$key_count" =~ ^[0-9]+$ ]] || [ "$key_count" -lt 1 ] || [ "$key_count" -gt 1000 ]; then
        echo "❌ Invalid number. Please enter 1-1000"
        return
    fi
    
    timestamp=$(date +"%Y%m%d_%H%M%S")
    sql_file="keys_batch_${timestamp}.sql"
    csv_file="keys_batch_${timestamp}.csv"
    
    echo "-- Generated on $(date)" > $sql_file
    echo "-- Batch: $batch_desc" >> $sql_file
    echo "-- Total keys: $key_count" >> $sql_file
    echo "" >> $sql_file
    
    echo "KeyID,Key,Description,Generated" > $csv_file
    
    echo "Generating $key_count keys for batch: $batch_desc"
    echo ""
    
    for i in $(seq 1 $key_count); do
        key=$(generate_key)
        key_id="BATCH_$(printf "%04d" $i)"
        
        # Add to SQL file
        echo "INSERT INTO auth_keys (key_hash, description) VALUES ('$key', '$batch_desc - $key_id');" >> $sql_file
        
        # Add to CSV file  
        echo "$key_id,$key,$batch_desc - $key_id,$(date)" >> $csv_file
        
        # Show progress
        if [ $((i % 10)) -eq 0 ]; then
            echo "Generated $i/$key_count keys..."
        fi
    done
    
    echo ""
    echo "✅ Batch generation complete!"
    echo "📁 Files created:"
    echo "   - $sql_file (for database import)"
    echo "   - $csv_file (for record keeping)"
    echo ""
    echo "🚀 To add keys to database:"
    echo "   cd cloudflare-workers"
    echo "   cat ../$sql_file | wrangler d1 execute esp32-flash-keys"
}

# Show requirements
show_requirements() {
    echo ""
    echo "🔐 ESP32 Flash Tool Key Requirements"
    echo "==================================="
    echo ""
    echo "📏 Format: 32 hexadecimal characters"
    echo "🔤 Characters: 0-9, A-F (uppercase preferred)"
    echo "📝 Example: A1B2C3D4E5F6789012345678901234AB"
    echo ""
    echo "✅ Valid examples:"
    echo "   ABCDEF1234567890ABCDEF1234567890"
    echo "   1234567890ABCDEF1234567890ABCDEF"
    echo "   FEDCBA0987654321FEDCBA0987654321"
    echo ""
    echo "❌ Invalid examples:"
    echo "   ABC123 (too short)"
    echo "   GHIJKLMNOPQRSTUVWXYZ123456789012 (contains G-Z)"
    echo "   abcdef1234567890abcdef1234567890 (lowercase)"
}

# Main program loop
while true; do
    show_menu
    
    case $choice in
        1)
            key=$(generate_key)
            echo ""
            echo "🔑 Generated Key:"
            echo "   $key"
            echo ""
            echo "📋 SQL Command:"
            echo "   INSERT INTO auth_keys (key_hash, description) VALUES ('$key', 'Generated key $(date)');"
            ;;
        2)
            echo ""
            read -p "How many keys to generate? " num_keys
            read -p "Description for these keys: " desc
            
            if [[ "$num_keys" =~ ^[0-9]+$ ]] && [ "$num_keys" -gt 0 ] && [ "$num_keys" -le 100 ]; then
                echo ""
                generate_multiple_keys $num_keys "$desc"
            else
                echo "❌ Please enter a valid number between 1-100"
            fi
            ;;
        3)
            echo ""
            read -p "Enter key to validate: " test_key
            validate_key "$test_key"
            ;;
        4)
            generate_production_batch
            ;;
        5)
            show_requirements
            ;;
        q|Q)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please try again."
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
done