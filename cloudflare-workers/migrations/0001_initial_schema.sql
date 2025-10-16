-- Migration: 0001_initial_schema.sql
-- Create auth_keys table for storing authentication keys

CREATE TABLE IF NOT EXISTS auth_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key_hash TEXT UNIQUE NOT NULL,
    device_id TEXT,
    is_used INTEGER DEFAULT 0,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    used_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_key_hash ON auth_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_device_id ON auth_keys(device_id);
CREATE INDEX IF NOT EXISTS idx_is_used ON auth_keys(is_used);

-- Create usage_logs table for tracking key usage
CREATE TABLE IF NOT EXISTS usage_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key_hash TEXT NOT NULL,
    device_id TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_usage_key_hash ON usage_logs(key_hash);
CREATE INDEX IF NOT EXISTS idx_usage_timestamp ON usage_logs(timestamp);

-- Insert sample authentication keys
INSERT OR IGNORE INTO auth_keys (key_hash, description) VALUES 
    ('A1B2C3D4E5F6789012345678901234AB', 'Sample key 1'),
    ('B2C3D4E5F6789012345678901234ABCD', 'Sample key 2'),
    ('C3D4E5F6789012345678901234ABCDEF', 'Sample key 3'),
    ('D4E5F6789012345678901234ABCDEF01', 'Sample key 4'),
    ('E5F6789012345678901234ABCDEF0123', 'Sample key 5');