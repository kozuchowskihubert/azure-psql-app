-- ============================================================================
-- Subscription & Payment Schema for HAOS.fm
-- ============================================================================
-- This schema adds:
-- - Subscription plans and tiers (free, basic, premium, pro)
-- - Payment processing (BLIK, PayPal, Stripe)
-- - Transaction history and invoices
-- - Feature access controls
-- ============================================================================

-- ============================================================================
-- SUBSCRIPTION PLANS
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscription_plans (
    id SERIAL PRIMARY KEY,
    plan_code VARCHAR(50) UNIQUE NOT NULL, -- 'free', 'basic', 'premium', 'pro'
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Pricing (in cents/groszy to avoid floating point issues)
    price_monthly INTEGER NOT NULL DEFAULT 0, -- Price in cents
    price_yearly INTEGER NOT NULL DEFAULT 0,  -- Yearly price (with discount)
    currency VARCHAR(3) DEFAULT 'PLN',
    
    -- Feature limits
    features JSONB DEFAULT '{}'::JSONB, 
    /*
    Example features:
    {
        "max_tracks": 10,
        "max_presets": 50,
        "export_formats": ["mp3", "wav"],
        "cloud_storage_mb": 500,
        "collaboration": false,
        "priority_support": false,
        "api_access": false,
        "custom_branding": false,
        "offline_mode": false
    }
    */
    
    -- Plan metadata
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE, -- Show as "popular" or "recommended"
    sort_order INTEGER DEFAULT 0,
    trial_days INTEGER DEFAULT 0, -- Free trial period
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default plans
INSERT INTO subscription_plans (plan_code, name, description, price_monthly, price_yearly, currency, features, is_featured, trial_days, sort_order) 
VALUES 
    ('free', 'Free', 'Perfect for getting started with HAOS.fm', 0, 0, 'PLN', 
     '{"max_tracks": 3, "max_presets": 10, "export_formats": ["mp3"], "cloud_storage_mb": 100, "collaboration": false, "priority_support": false, "api_access": false, "custom_branding": false, "offline_mode": false}'::JSONB,
     false, 0, 1),
    ('basic', 'Basic', 'For hobbyist producers and musicians', 1999, 19990, 'PLN',
     '{"max_tracks": 25, "max_presets": 100, "export_formats": ["mp3", "wav"], "cloud_storage_mb": 2000, "collaboration": false, "priority_support": false, "api_access": false, "custom_branding": false, "offline_mode": true}'::JSONB,
     false, 7, 2),
    ('premium', 'Premium', 'For serious producers who need more power', 4999, 49990, 'PLN',
     '{"max_tracks": -1, "max_presets": -1, "export_formats": ["mp3", "wav", "flac", "ogg"], "cloud_storage_mb": 10000, "collaboration": true, "priority_support": true, "api_access": false, "custom_branding": false, "offline_mode": true}'::JSONB,
     true, 14, 3),
    ('pro', 'Pro Studio', 'For professional studios and labels', 9999, 99990, 'PLN',
     '{"max_tracks": -1, "max_presets": -1, "export_formats": ["mp3", "wav", "flac", "ogg", "aiff", "stems"], "cloud_storage_mb": -1, "collaboration": true, "priority_support": true, "api_access": true, "custom_branding": true, "offline_mode": true}'::JSONB,
     false, 30, 4)
ON CONFLICT (plan_code) DO NOTHING;

-- ============================================================================
-- USER SUBSCRIPTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),
    
    -- Subscription status
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'past_due', 'trialing', 'paused'
    
    -- Billing cycle
    billing_cycle VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'yearly'
    
    -- Important dates
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_period_end TIMESTAMP WITH TIME ZONE,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    -- Cancellation handling
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    cancellation_reason TEXT,
    
    -- External references
    stripe_subscription_id VARCHAR(255),
    paypal_subscription_id VARCHAR(255),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_active_subscription UNIQUE (user_id) -- One active subscription per user
);

CREATE INDEX idx_user_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_period_end ON user_subscriptions(current_period_end);

-- ============================================================================
-- PAYMENT METHODS
-- ============================================================================

CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Payment provider
    provider VARCHAR(50) NOT NULL, -- 'stripe', 'paypal', 'blik', 'przelewy24'
    provider_payment_method_id VARCHAR(255), -- Provider's reference ID
    
    -- Card details (encrypted/tokenized - not actual numbers)
    card_brand VARCHAR(50), -- 'visa', 'mastercard', 'amex'
    card_last_four VARCHAR(4),
    card_exp_month INTEGER,
    card_exp_year INTEGER,
    
    -- PayPal/BLIK specific
    paypal_email VARCHAR(255),
    blik_phone_last_four VARCHAR(4),
    
    -- Status
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    billing_name VARCHAR(255),
    billing_address JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payment_methods_user ON payment_methods(user_id);
CREATE INDEX idx_payment_methods_default ON payment_methods(user_id, is_default) WHERE is_default = TRUE;

-- ============================================================================
-- TRANSACTIONS & PAYMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
    payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
    
    -- Transaction details
    type VARCHAR(50) NOT NULL, -- 'subscription', 'one_time', 'refund', 'credit'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'
    
    -- Amount (in cents/groszy)
    amount INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'PLN',
    
    -- Tax/VAT
    tax_amount INTEGER DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 23.00, -- Polish VAT rate
    
    -- Provider details
    provider VARCHAR(50), -- 'stripe', 'paypal', 'blik', 'przelewy24'
    provider_transaction_id VARCHAR(255),
    provider_response JSONB, -- Full response from provider
    
    -- Descriptions
    description TEXT,
    invoice_number VARCHAR(100),
    
    -- Error handling
    failure_code VARCHAR(100),
    failure_message TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_subscription ON transactions(subscription_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_provider ON transactions(provider, provider_transaction_id);
CREATE INDEX idx_transactions_created ON transactions(created_at);

-- ============================================================================
-- INVOICES
-- ============================================================================

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
    
    -- Invoice details
    invoice_number VARCHAR(100) UNIQUE NOT NULL, -- e.g., "HAOS-2025-000001"
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'open', 'paid', 'void', 'uncollectible'
    
    -- Amounts (in cents/groszy)
    subtotal INTEGER NOT NULL,
    tax_amount INTEGER DEFAULT 0,
    total INTEGER NOT NULL,
    amount_paid INTEGER DEFAULT 0,
    amount_due INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'PLN',
    
    -- Dates
    invoice_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    paid_at TIMESTAMP WITH TIME ZONE,
    
    -- Customer details (snapshot at invoice time)
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_address JSONB,
    customer_tax_id VARCHAR(50), -- NIP for Polish businesses
    
    -- Line items
    line_items JSONB NOT NULL DEFAULT '[]'::JSONB,
    /*
    Example:
    [
        {"description": "Premium Plan - Monthly", "quantity": 1, "unit_price": 4999, "amount": 4999}
    ]
    */
    
    -- PDF invoice URL
    pdf_url TEXT,
    
    -- Notes
    notes TEXT,
    footer TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_invoices_user ON invoices(user_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);

-- ============================================================================
-- WEBHOOK EVENTS (for tracking provider webhooks)
-- ============================================================================

CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Provider details
    provider VARCHAR(50) NOT NULL, -- 'stripe', 'paypal', 'blik'
    event_id VARCHAR(255) NOT NULL, -- Provider's event ID
    event_type VARCHAR(100) NOT NULL, -- e.g., 'payment_intent.succeeded'
    
    -- Payload
    payload JSONB NOT NULL,
    
    -- Processing status
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processed', 'failed', 'skipped'
    processing_error TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    
    -- Idempotency
    idempotency_key VARCHAR(255),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_webhook_event UNIQUE (provider, event_id)
);

CREATE INDEX idx_webhook_events_provider ON webhook_events(provider, event_type);
CREATE INDEX idx_webhook_events_status ON webhook_events(status);
CREATE INDEX idx_webhook_events_created ON webhook_events(created_at);

-- ============================================================================
-- COUPON CODES & DISCOUNTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100),
    description TEXT,
    
    -- Discount type
    discount_type VARCHAR(20) NOT NULL, -- 'percent', 'fixed_amount'
    discount_value INTEGER NOT NULL, -- Percentage (e.g., 20 for 20%) or amount in cents
    currency VARCHAR(3) DEFAULT 'PLN',
    
    -- Applicability
    applies_to_plans INTEGER[], -- NULL means all plans
    
    -- Usage limits
    max_redemptions INTEGER, -- NULL for unlimited
    times_redeemed INTEGER DEFAULT 0,
    
    -- Validity
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    duration VARCHAR(20) DEFAULT 'once', -- 'once', 'repeating', 'forever'
    duration_months INTEGER, -- For 'repeating'
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active) WHERE is_active = TRUE;

-- Coupon redemptions
CREATE TABLE IF NOT EXISTS coupon_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id INTEGER NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
    
    -- Discount applied
    discount_applied INTEGER NOT NULL, -- Amount in cents
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_coupon UNIQUE (coupon_id, user_id)
);

-- ============================================================================
-- FEATURE FLAGS (for subscription-based access control)
-- ============================================================================

CREATE TABLE IF NOT EXISTS feature_flags (
    id SERIAL PRIMARY KEY,
    feature_code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Access requirements
    minimum_plan_code VARCHAR(50) REFERENCES subscription_plans(plan_code),
    required_permission VARCHAR(100), -- Override for specific permissions
    
    -- Status
    is_enabled BOOLEAN DEFAULT TRUE,
    is_beta BOOLEAN DEFAULT FALSE, -- Beta features require explicit opt-in
    
    -- Rollout
    rollout_percentage INTEGER DEFAULT 100, -- For gradual rollouts
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_feature_flags_code ON feature_flags(feature_code);
CREATE INDEX idx_feature_flags_plan ON feature_flags(minimum_plan_code);

-- User feature overrides (for beta access or exceptions)
CREATE TABLE IF NOT EXISTS user_feature_overrides (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    feature_id INTEGER REFERENCES feature_flags(id) ON DELETE CASCADE,
    
    -- Override type
    override_type VARCHAR(20) NOT NULL, -- 'grant', 'deny'
    
    -- Validity
    expires_at TIMESTAMP WITH TIME ZONE,
    reason TEXT,
    granted_by UUID REFERENCES users(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    PRIMARY KEY (user_id, feature_id)
);

-- Insert default feature flags
INSERT INTO feature_flags (feature_code, name, description, minimum_plan_code) VALUES
    ('unlimited_tracks', 'Unlimited Tracks', 'Create unlimited music tracks', 'premium'),
    ('unlimited_presets', 'Unlimited Presets', 'Save unlimited synth presets', 'premium'),
    ('collaboration', 'Collaboration', 'Real-time collaboration with other producers', 'premium'),
    ('flac_export', 'FLAC Export', 'Export tracks in lossless FLAC format', 'premium'),
    ('stems_export', 'Stems Export', 'Export individual stems/tracks separately', 'pro'),
    ('api_access', 'API Access', 'Access HAOS.fm via REST API', 'pro'),
    ('custom_branding', 'Custom Branding', 'Add your own branding to exports', 'pro'),
    ('priority_support', 'Priority Support', '24/7 priority customer support', 'premium'),
    ('offline_mode', 'Offline Mode', 'Use HAOS.fm without internet connection', 'basic'),
    ('cloud_backup', 'Cloud Backup', 'Automatic cloud backup of your projects', 'basic')
ON CONFLICT (feature_code) DO NOTHING;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get user's current subscription with plan details
CREATE OR REPLACE FUNCTION get_user_subscription(p_user_id UUID)
RETURNS TABLE (
    subscription_id UUID,
    plan_code VARCHAR(50),
    plan_name VARCHAR(100),
    status VARCHAR(50),
    features JSONB,
    current_period_end TIMESTAMP WITH TIME ZONE,
    is_trial BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        us.id,
        sp.plan_code,
        sp.name,
        us.status,
        sp.features,
        us.current_period_end,
        (us.trial_ends_at IS NOT NULL AND us.trial_ends_at > NOW()) as is_trial
    FROM user_subscriptions us
    JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = p_user_id
    AND us.status IN ('active', 'trialing', 'past_due')
    ORDER BY us.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has access to a feature
CREATE OR REPLACE FUNCTION user_has_feature(p_user_id UUID, p_feature_code VARCHAR(100))
RETURNS BOOLEAN AS $$
DECLARE
    v_has_access BOOLEAN := FALSE;
    v_user_plan VARCHAR(50);
    v_min_plan VARCHAR(50);
    v_plan_order INTEGER;
    v_user_plan_order INTEGER;
    v_override_type VARCHAR(20);
BEGIN
    -- Check for user override first
    SELECT ufo.override_type INTO v_override_type
    FROM user_feature_overrides ufo
    JOIN feature_flags ff ON ufo.feature_id = ff.id
    WHERE ufo.user_id = p_user_id 
    AND ff.feature_code = p_feature_code
    AND (ufo.expires_at IS NULL OR ufo.expires_at > NOW());
    
    IF v_override_type = 'grant' THEN
        RETURN TRUE;
    ELSIF v_override_type = 'deny' THEN
        RETURN FALSE;
    END IF;
    
    -- Get user's current plan
    SELECT sp.plan_code INTO v_user_plan
    FROM user_subscriptions us
    JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = p_user_id
    AND us.status IN ('active', 'trialing');
    
    -- Default to free plan if no subscription
    IF v_user_plan IS NULL THEN
        v_user_plan := 'free';
    END IF;
    
    -- Get minimum plan required for feature
    SELECT ff.minimum_plan_code INTO v_min_plan
    FROM feature_flags ff
    WHERE ff.feature_code = p_feature_code
    AND ff.is_enabled = TRUE;
    
    IF v_min_plan IS NULL THEN
        -- Feature doesn't exist or isn't enabled
        RETURN FALSE;
    END IF;
    
    -- Compare plan levels
    SELECT sort_order INTO v_plan_order FROM subscription_plans WHERE plan_code = v_min_plan;
    SELECT sort_order INTO v_user_plan_order FROM subscription_plans WHERE plan_code = v_user_plan;
    
    RETURN v_user_plan_order >= v_plan_order;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- USER FEATURE OVERRIDES
-- Allows granting or denying specific features to users regardless of plan
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_feature_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feature_code VARCHAR(100) NOT NULL,
    access_type VARCHAR(20) NOT NULL CHECK (access_type IN ('grant', 'deny')),
    expires_at TIMESTAMP WITH TIME ZONE,
    reason TEXT,
    granted_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_feature UNIQUE (user_id, feature_code)
);

CREATE INDEX idx_user_feature_overrides_user ON user_feature_overrides(user_id);
CREATE INDEX idx_user_feature_overrides_feature ON user_feature_overrides(feature_code);
CREATE INDEX idx_user_feature_overrides_expires ON user_feature_overrides(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================================================
-- USER ROLES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_name VARCHAR(50) NOT NULL CHECK (role_name IN ('user', 'creator', 'moderator', 'admin', 'super_admin')),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    granted_by UUID REFERENCES users(id),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT unique_user_role UNIQUE (user_id, role_name)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_name);

-- Generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS VARCHAR(100) AS $$
DECLARE
    v_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
    v_sequence INTEGER;
    v_invoice_number VARCHAR(100);
BEGIN
    -- Get the next sequence number for this year
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(invoice_number FROM 'HAOS-' || v_year::TEXT || '-(\d+)') AS INTEGER)
    ), 0) + 1
    INTO v_sequence
    FROM invoices
    WHERE invoice_number LIKE 'HAOS-' || v_year::TEXT || '-%';
    
    v_invoice_number := 'HAOS-' || v_year::TEXT || '-' || LPAD(v_sequence::TEXT, 6, '0');
    
    RETURN v_invoice_number;
END;
$$ LANGUAGE plpgsql;
