-- Migration: 022_instrument_purchases.sql
-- Create table for tracking user instrument purchases

CREATE TABLE IF NOT EXISTS user_instrument_purchases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    instrument_id VARCHAR(50) NOT NULL,
    stripe_session_id VARCHAR(255),
    payment_intent_id VARCHAR(255),
    amount INTEGER NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'EUR',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    activated_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    
    -- Unique constraint to prevent duplicate purchases
    UNIQUE(user_id, instrument_id)
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_instrument_purchases_user_id ON user_instrument_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_instrument_purchases_instrument_id ON user_instrument_purchases(instrument_id);
CREATE INDEX IF NOT EXISTS idx_user_instrument_purchases_status ON user_instrument_purchases(status);

-- Comments for documentation
COMMENT ON TABLE user_instrument_purchases IS 'Tracks virtual instrument purchases by users';
COMMENT ON COLUMN user_instrument_purchases.instrument_id IS 'ID of instrument: synth-studio, string-collection, guitar-essentials, complete-bundle';
COMMENT ON COLUMN user_instrument_purchases.amount IS 'Purchase amount in cents';
COMMENT ON COLUMN user_instrument_purchases.status IS 'pending, completed, refunded, cancelled';
