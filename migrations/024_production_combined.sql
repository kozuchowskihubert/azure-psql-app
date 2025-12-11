-- Combined Production Migration
-- Run this on your production PostgreSQL database
-- This creates all missing payment-related tables

-- ============================================================================
-- USER ROLES (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO user_roles (role_name, description) VALUES 
    ('user', 'Regular user with standard access'),
    ('admin', 'Platform administrator with full access'),
    ('moderator', 'Content moderator'),
    ('premium', 'Premium subscriber')
ON CONFLICT (role_name) DO NOTHING;

CREATE TABLE IF NOT EXISTS user_role_assignments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES user_roles(id) ON DELETE CASCADE,
    assigned_by INTEGER REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_user_role_assignments_user_id ON user_role_assignments(user_id);

-- ============================================================================
-- INSTRUMENT PURCHASES
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_instrument_purchases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    instrument_id VARCHAR(50) NOT NULL,
    stripe_session_id VARCHAR(255),
    payment_intent_id VARCHAR(255),
    paypal_order_id VARCHAR(255),
    blik_transaction_id VARCHAR(255),
    amount INTEGER NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'EUR',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    activated_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    UNIQUE(user_id, instrument_id)
);

CREATE INDEX IF NOT EXISTS idx_user_instrument_purchases_user_id ON user_instrument_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_instrument_purchases_instrument_id ON user_instrument_purchases(instrument_id);
CREATE INDEX IF NOT EXISTS idx_user_instrument_purchases_status ON user_instrument_purchases(status);

-- ============================================================================
-- PAYMENT METHODS
-- ============================================================================
CREATE TABLE IF NOT EXISTS payment_methods (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_payment_method_id VARCHAR(255),
    card_brand VARCHAR(50),
    card_last_four VARCHAR(4),
    card_exp_month INTEGER,
    card_exp_year INTEGER,
    paypal_email VARCHAR(255),
    blik_phone_last_four VARCHAR(4),
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    billing_name VARCHAR(255),
    billing_address JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);

-- ============================================================================
-- TRANSACTIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    amount INTEGER NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'PLN',
    provider VARCHAR(50) NOT NULL,
    provider_transaction_id VARCHAR(255),
    provider_response JSONB DEFAULT '{}',
    description TEXT,
    metadata JSONB DEFAULT '{}',
    payment_method_id INTEGER REFERENCES payment_methods(id),
    subscription_id INTEGER,
    refund_of INTEGER REFERENCES transactions(id),
    tax_amount INTEGER DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    failure_code VARCHAR(100),
    failure_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_provider ON transactions(provider);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_provider_id ON transactions(provider_transaction_id);

-- ============================================================================
-- INVOICES
-- ============================================================================
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'open',
    subtotal INTEGER NOT NULL DEFAULT 0,
    tax_amount INTEGER NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 23.00,
    total INTEGER NOT NULL DEFAULT 0,
    amount_paid INTEGER NOT NULL DEFAULT 0,
    amount_due INTEGER NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'PLN',
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    line_items JSONB DEFAULT '[]',
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    paid_at TIMESTAMP WITH TIME ZONE,
    pdf_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- ============================================================================
-- WEBHOOK EVENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS webhook_events (
    id SERIAL PRIMARY KEY,
    provider VARCHAR(50) NOT NULL,
    event_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(255) NOT NULL,
    payload JSONB DEFAULT '{}',
    processed BOOLEAN DEFAULT FALSE,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(provider, event_id)
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_provider_event ON webhook_events(provider, event_id);

-- ============================================================================
-- COUPONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL,
    discount_value INTEGER NOT NULL,
    currency VARCHAR(10) DEFAULT 'PLN',
    min_amount INTEGER DEFAULT 0,
    max_discount INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_until TIMESTAMP WITH TIME ZONE,
    max_redemptions INTEGER,
    times_redeemed INTEGER DEFAULT 0,
    applies_to JSONB DEFAULT '["subscription", "one_time"]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coupon_redemptions (
    id SERIAL PRIMARY KEY,
    coupon_id INTEGER NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id INTEGER,
    transaction_id INTEGER REFERENCES transactions(id),
    discount_applied INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(coupon_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

-- ============================================================================
-- GRANT ADMIN ROLE TO admin@haos.fm
-- ============================================================================
DO $$
DECLARE
    v_user_id INTEGER;
    v_role_id INTEGER;
BEGIN
    -- Get admin user ID
    SELECT id INTO v_user_id FROM users WHERE email = 'admin@haos.fm';
    
    IF v_user_id IS NOT NULL THEN
        -- Get admin role ID
        SELECT id INTO v_role_id FROM user_roles WHERE role_name = 'admin';
        
        IF v_role_id IS NOT NULL THEN
            -- Assign admin role
            INSERT INTO user_role_assignments (user_id, role_id)
            VALUES (v_user_id, v_role_id)
            ON CONFLICT (user_id, role_id) DO NOTHING;
            
            RAISE NOTICE 'Admin role granted to admin@haos.fm (user_id: %)', v_user_id;
        END IF;
    END IF;
END $$;

-- Done!
SELECT 'Migration complete!' as status;
