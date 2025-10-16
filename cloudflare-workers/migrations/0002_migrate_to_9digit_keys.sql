-- Migration: 0002_migrate_to_9digit_keys.sql
-- Update to use 9-digit numeric keys instead of 32-char hex

-- Clear old sample keys with 32-char hex format
DELETE FROM auth_keys WHERE key_hash IN (
    'A1B2C3D4E5F6789012345678901234AB',
    'B2C3D4E5F6789012345678901234ABCD',
    'C3D4E5F6789012345678901234ABCDEF',
    'D4E5F6789012345678901234ABCDEF01',
    'E5F6789012345678901234ABCDEF0123'
);

-- Insert new sample 9-digit keys
INSERT OR IGNORE INTO auth_keys (key_hash, description) VALUES 
    ('123456789', 'Sample 9-digit key 1'),
    ('234567890', 'Sample 9-digit key 2'),
    ('345678901', 'Sample 9-digit key 3'),
    ('456789012', 'Sample 9-digit key 4'),
    ('567890123', 'Sample 9-digit key 5');
