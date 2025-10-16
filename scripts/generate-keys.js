#!/usr/bin/env node

/**
 * ESP32 Flash Tool - Key Generator
 * Generates secure 32-character hexadecimal keys for customer distribution
 */

const crypto = require('crypto');

// Generate a single key
function generateKey() {
    return crypto.randomBytes(16).toString('hex').toUpperCase();
}

// Generate multiple keys
function generateKeys(count, description = '') {
    const keys = [];
    const timestamp = new Date().toISOString().split('T')[0];
    
    console.log(`🔑 Generating ${count} ESP32 Flash Tool Keys`);
    console.log(`📅 Date: ${timestamp}`);
    console.log('=' .repeat(50));
    console.log();
    
    // Generate keys
    for (let i = 1; i <= count; i++) {
        const key = generateKey();
        keys.push({
            id: i,
            key: key,
            description: description || `Customer Key ${i} - ${timestamp}`
        });
        
        console.log(`Key ${i.toString().padStart(2, '0')}: ${key}`);
    }
    
    console.log();
    console.log('📋 SQL Commands (để add vào database):');
    console.log('-'.repeat(50));
    
    keys.forEach(item => {
        console.log(`INSERT INTO auth_keys (key_hash, description) VALUES ('${item.key}', '${item.description}');`);
    });
    
    console.log();
    console.log('📧 Keys để gửi cho khách hàng:');
    console.log('-'.repeat(50));
    
    keys.forEach(item => {
        console.log(`${item.key}`);
    });
    
    return keys;
}

// Validate key format
function validateKey(key) {
    if (!key || typeof key !== 'string') {
        return { valid: false, error: 'Key must be a string' };
    }
    
    const cleanKey = key.replace(/\s/g, '').toUpperCase();
    
    if (cleanKey.length !== 32) {
        return { valid: false, error: `Invalid length: ${cleanKey.length} (must be 32)` };
    }
    
    if (!/^[0-9A-F]{32}$/.test(cleanKey)) {
        return { valid: false, error: 'Invalid characters (only 0-9, A-F allowed)' };
    }
    
    return { valid: true, key: cleanKey };
}

// Main function
function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    if (!command) {
        console.log('🔑 ESP32 Flash Tool - Key Generator');
        console.log('Usage:');
        console.log('  node generate-keys.js single                    # Generate 1 key');
        console.log('  node generate-keys.js batch <count>             # Generate multiple keys');
        console.log('  node generate-keys.js batch <count> "description" # Generate with description');
        console.log('  node generate-keys.js validate <key>            # Validate key format');
        console.log('  node generate-keys.js samples                   # Show sample keys');
        console.log();
        console.log('Examples:');
        console.log('  node generate-keys.js single');
        console.log('  node generate-keys.js batch 10');
        console.log('  node generate-keys.js batch 5 "VIP Customer Keys"');
        console.log('  node generate-keys.js validate A1B2C3D4E5F6789012345678901234AB');
        return;
    }
    
    switch (command.toLowerCase()) {
        case 'single':
            console.log('🔑 Generated Key:');
            console.log(generateKey());
            console.log();
            console.log('📋 SQL Command:');
            const singleKey = generateKey();
            console.log(`INSERT INTO auth_keys (key_hash, description) VALUES ('${singleKey}', 'Generated ${new Date().toISOString()}');`);
            break;
            
        case 'batch':
            const count = parseInt(args[1]) || 5;
            const description = args[2] || '';
            
            if (count < 1 || count > 100) {
                console.log('❌ Count must be between 1 and 100');
                return;
            }
            
            generateKeys(count, description);
            break;
            
        case 'validate':
            const keyToValidate = args[1];
            if (!keyToValidate) {
                console.log('❌ Please provide a key to validate');
                return;
            }
            
            const validation = validateKey(keyToValidate);
            if (validation.valid) {
                console.log(`✅ Valid key: ${validation.key}`);
            } else {
                console.log(`❌ Invalid key: ${validation.error}`);
            }
            break;
            
        case 'samples':
            console.log('🧪 Sample Keys (ready to use):');
            console.log('-'.repeat(40));
            const samples = [
                'A1B2C3D4E5F6789012345678901234AB',
                'B2C3D4E5F6789012345678901234ABCD',
                'C3D4E5F6789012345678901234ABCDEF',
                'D4E5F6789012345678901234ABCDEF01',
                'E5F6789012345678901234ABCDEF0123'
            ];
            
            samples.forEach((key, index) => {
                console.log(`Sample ${index + 1}: ${key}`);
            });
            break;
            
        default:
            console.log('❌ Unknown command. Use no arguments to see usage.');
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { generateKey, generateKeys, validateKey };