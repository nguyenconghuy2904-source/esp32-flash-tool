-- Migration: 0005_add_firmware_id.sql
-- Add firmware_id column to auth_keys table

ALTER TABLE auth_keys ADD COLUMN firmware_id TEXT;

CREATE INDEX IF NOT EXISTS idx_firmware_id ON auth_keys(firmware_id);

-- Update existing test keys to have firmware_id (optional)
UPDATE auth_keys SET firmware_id = 'test' WHERE key_hash LIKE 'A1B2C3D4%' OR key_hash LIKE 'B2C3D4E5%';
