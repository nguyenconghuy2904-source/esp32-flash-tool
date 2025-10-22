-- Migration: 0003_add_rate_limiting.sql
-- Add rate limiting and IP blocking support

-- Create blocked_ips table for tracking blocked IPs
CREATE TABLE IF NOT EXISTS blocked_ips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip_address TEXT NOT NULL,
    reason TEXT,
    blocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    unblocked_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_blocked_ip_address ON blocked_ips(ip_address);
CREATE INDEX IF NOT EXISTS idx_blocked_expires ON blocked_ips(expires_at);

-- Add attempt tracking to usage_logs
ALTER TABLE usage_logs ADD COLUMN success INTEGER DEFAULT 1;
ALTER TABLE usage_logs ADD COLUMN error_message TEXT;

-- Create index for failed attempts
CREATE INDEX IF NOT EXISTS idx_usage_success ON usage_logs(success);
