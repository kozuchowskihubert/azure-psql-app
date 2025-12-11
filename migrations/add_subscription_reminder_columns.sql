-- Add reminder_sent_at column to user_subscriptions
-- This tracks when we last sent an expiry reminder to prevent duplicate emails

ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMP;

-- Add expired_at column to track when subscription expired
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS expired_at TIMESTAMP;

-- Create index for efficient expiry queries
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expiry 
ON user_subscriptions (status, current_period_end) 
WHERE status = 'active';

-- Add comment
COMMENT ON COLUMN user_subscriptions.reminder_sent_at IS 'Timestamp when expiry reminder email was sent';
COMMENT ON COLUMN user_subscriptions.expired_at IS 'Timestamp when subscription expired';
