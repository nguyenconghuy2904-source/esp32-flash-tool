-- Migration: 0004_add_test_keys.sql
-- Add support for test keys that can be used with multiple devices

-- Add allow_multiple_devices column to auth_keys
ALTER TABLE auth_keys ADD COLUMN allow_multiple_devices INTEGER DEFAULT 0;
ALTER TABLE auth_keys ADD COLUMN max_uses INTEGER DEFAULT 1;
ALTER TABLE auth_keys ADD COLUMN current_uses INTEGER DEFAULT 0;

-- Create index for test keys
CREATE INDEX IF NOT EXISTS idx_allow_multiple ON auth_keys(allow_multiple_devices);

-- Insert 5 test keys that can be used with multiple devices
INSERT OR IGNORE INTO auth_keys (key_hash, description, allow_multiple_devices, max_uses) VALUES 
    ('111111111', 'Test Key 1 - Unlimited use', 1, 999999),
    ('222222222', 'Test Key 2 - Unlimited use', 1, 999999),
    ('333333333', 'Test Key 3 - Unlimited use', 1, 999999),
    ('444444444', 'Test Key 4 - Unlimited use', 1, 999999),
    ('555555555', 'Test Key 5 - Unlimited use', 1, 999999);

-- Update existing keys to have standard 1 use limit
UPDATE auth_keys 
SET max_uses = 1, allow_multiple_devices = 0 
WHERE allow_multiple_devices IS NULL;
