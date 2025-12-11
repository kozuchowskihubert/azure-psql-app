/**
 * Payment Model
 * Handles payment methods, transactions, and invoices
 */
const pool = require('../config/database');

class Payment {
  /**
   * Add a payment method for a user
   */
  static async addPaymentMethod(userId, data) {
    const result = await pool.query(`
      INSERT INTO payment_methods (
        user_id, provider, provider_payment_method_id,
        card_brand, card_last_four, card_exp_month, card_exp_year,
        paypal_email, blik_phone_last_four,
        is_default, billing_name, billing_address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      userId,
      data.provider,
      data.providerPaymentMethodId,
      data.cardBrand,
      data.cardLastFour,
      data.cardExpMonth,
      data.cardExpYear,
      data.paypalEmail,
      data.blikPhoneLastFour,
      data.isDefault || false,
      data.billingName,
      JSON.stringify(data.billingAddress || {}),
    ]);

    // If this is the default, unset other defaults
    if (data.isDefault) {
      await pool.query(`
        UPDATE payment_methods 
        SET is_default = FALSE 
        WHERE user_id = $1 AND id != $2
      `, [userId, result.rows[0].id]);
    }

    return result.rows[0];
  }

  /**
   * Get user's payment methods
   */
  static async getUserPaymentMethods(userId) {
    const result = await pool.query(`
      SELECT * FROM payment_methods
      WHERE user_id = $1 AND is_active = TRUE
      ORDER BY is_default DESC, created_at DESC
    `, [userId]);
    return result.rows;
  }

  /**
   * Get default payment method
   */
  static async getDefaultPaymentMethod(userId) {
    const result = await pool.query(`
      SELECT * FROM payment_methods
      WHERE user_id = $1 AND is_active = TRUE AND is_default = TRUE
      LIMIT 1
    `, [userId]);
    return result.rows[0];
  }

  /**
   * Set a payment method as default
   */
  static async setDefaultPaymentMethod(userId, paymentMethodId) {
    await pool.query(`
      UPDATE payment_methods 
      SET is_default = FALSE 
      WHERE user_id = $1
    `, [userId]);

    const result = await pool.query(`
      UPDATE payment_methods 
      SET is_default = TRUE 
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `, [paymentMethodId, userId]);
    return result.rows[0];
  }

  /**
   * Remove a payment method
   */
  static async removePaymentMethod(userId, paymentMethodId) {
    const result = await pool.query(`
      UPDATE payment_methods 
      SET is_active = FALSE 
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `, [paymentMethodId, userId]);
    return result.rows[0];
  }

  /**
   * Create a transaction
   */
  static async createTransaction(data) {
    const result = await pool.query(`
      INSERT INTO transactions (
        user_id, subscription_id, payment_method_id,
        type, status, amount, currency,
        tax_amount, tax_rate,
        provider, provider_transaction_id, provider_response,
        description, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      data.userId,
      data.subscriptionId,
      data.paymentMethodId,
      data.type,
      data.status || 'pending',
      data.amount,
      data.currency || 'PLN',
      data.taxAmount || 0,
      data.taxRate || 23.00,
      data.provider,
      data.providerTransactionId,
      JSON.stringify(data.providerResponse || {}),
      data.description,
      JSON.stringify(data.metadata || {}),
    ]);
    return result.rows[0];
  }

  /**
   * Update transaction status
   */
  static async updateTransactionStatus(transactionId, status, providerResponse = null, error = null) {
    const updates = ['status = $2', 'updated_at = NOW()'];
    const values = [transactionId, status];
    let paramIndex = 3;

    if (providerResponse) {
      updates.push(`provider_response = $${paramIndex}`);
      values.push(JSON.stringify(providerResponse));
      paramIndex++;
    }

    if (error) {
      updates.push(`failure_code = $${paramIndex}`);
      values.push(error.code);
      paramIndex++;
      updates.push(`failure_message = $${paramIndex}`);
      values.push(error.message);
      paramIndex++;
    }

    if (status === 'completed') {
      updates.push('completed_at = NOW()');
    }

    const result = await pool.query(`
      UPDATE transactions 
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING *
    `, values);
    return result.rows[0];
  }

  /**
   * Get user's transaction history
   */
  static async getUserTransactions(userId, options = {}) {
    const limit = options.limit || 50;
    const offset = options.offset || 0;

    const result = await pool.query(`
      SELECT t.*, 
        pm.provider as payment_provider,
        pm.card_brand,
        pm.card_last_four
      FROM transactions t
      LEFT JOIN payment_methods pm ON t.payment_method_id = pm.id
      WHERE t.user_id = $1
      ORDER BY t.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);
    return result.rows;
  }

  /**
   * Get transaction by ID
   */
  static async getTransactionById(transactionId) {
    const result = await pool.query(
      'SELECT * FROM transactions WHERE id = $1',
      [transactionId],
    );
    return result.rows[0];
  }

  /**
   * Get transaction by provider ID
   */
  static async getTransactionByProviderId(provider, providerTransactionId) {
    const result = await pool.query(`
      SELECT * FROM transactions 
      WHERE provider = $1 AND provider_transaction_id = $2
    `, [provider, providerTransactionId]);
    return result.rows[0];
  }

  /**
   * Create an invoice
   */
  static async createInvoice(data) {
    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber();

    const result = await pool.query(`
      INSERT INTO invoices (
        user_id, transaction_id, subscription_id,
        invoice_number, status,
        subtotal, tax_amount, total, amount_paid, amount_due, currency,
        invoice_date, due_date,
        customer_name, customer_email, customer_address, customer_tax_id,
        line_items, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *
    `, [
      data.userId,
      data.transactionId,
      data.subscriptionId,
      invoiceNumber,
      data.status || 'open',
      data.subtotal,
      data.taxAmount || 0,
      data.total,
      data.amountPaid || 0,
      data.amountDue || data.total,
      data.currency || 'PLN',
      data.invoiceDate || new Date(),
      data.dueDate,
      data.customerName,
      data.customerEmail,
      JSON.stringify(data.customerAddress || {}),
      data.customerTaxId,
      JSON.stringify(data.lineItems || []),
      data.notes,
    ]);
    return result.rows[0];
  }

  /**
   * Generate invoice number
   */
  static async generateInvoiceNumber() {
    const result = await pool.query('SELECT generate_invoice_number() as invoice_number');
    return result.rows[0].invoice_number;
  }

  /**
   * Get user's invoices
   */
  static async getUserInvoices(userId, options = {}) {
    const limit = options.limit || 50;
    const offset = options.offset || 0;

    const result = await pool.query(`
      SELECT * FROM invoices
      WHERE user_id = $1
      ORDER BY invoice_date DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);
    return result.rows;
  }

  /**
   * Get invoice by ID
   */
  static async getInvoiceById(invoiceId) {
    const result = await pool.query(
      'SELECT * FROM invoices WHERE id = $1',
      [invoiceId],
    );
    return result.rows[0];
  }

  /**
   * Mark invoice as paid
   */
  static async markInvoicePaid(invoiceId, amountPaid = null) {
    const result = await pool.query(`
      UPDATE invoices 
      SET status = 'paid', 
          amount_paid = COALESCE($2, total),
          amount_due = 0,
          paid_at = NOW(),
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [invoiceId, amountPaid]);
    return result.rows[0];
  }

  /**
   * Record a webhook event
   */
  static async recordWebhookEvent(data) {
    const result = await pool.query(`
      INSERT INTO webhook_events (
        provider, event_id, event_type, payload, idempotency_key
      ) VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (provider, event_id) DO NOTHING
      RETURNING *
    `, [
      data.provider,
      data.eventId,
      data.eventType,
      JSON.stringify(data.payload),
      data.idempotencyKey,
    ]);
    return result.rows[0];
  }

  /**
   * Mark webhook as processed
   */
  static async markWebhookProcessed(webhookId, error = null) {
    const result = await pool.query(`
      UPDATE webhook_events 
      SET status = $2, 
          processing_error = $3,
          processed_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [webhookId, error ? 'failed' : 'processed', error?.message]);
    return result.rows[0];
  }

  /**
   * Apply a coupon
   */
  static async applyCoupon(userId, couponCode, subscriptionId = null) {
    // Validate coupon
    const couponResult = await pool.query(`
      SELECT * FROM coupons
      WHERE code = $1 
      AND is_active = TRUE
      AND (valid_from IS NULL OR valid_from <= NOW())
      AND (valid_until IS NULL OR valid_until > NOW())
      AND (max_redemptions IS NULL OR times_redeemed < max_redemptions)
    `, [couponCode]);

    if (couponResult.rows.length === 0) {
      throw new Error('Invalid or expired coupon code');
    }

    const coupon = couponResult.rows[0];

    // Check if user already used this coupon
    const existingResult = await pool.query(`
      SELECT * FROM coupon_redemptions
      WHERE coupon_id = $1 AND user_id = $2
    `, [coupon.id, userId]);

    if (existingResult.rows.length > 0) {
      throw new Error('You have already used this coupon');
    }

    return coupon;
  }

  /**
   * Redeem a coupon
   */
  static async redeemCoupon(userId, couponId, subscriptionId, discountApplied) {
    const result = await pool.query(`
      INSERT INTO coupon_redemptions (coupon_id, user_id, subscription_id, discount_applied)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [couponId, userId, subscriptionId, discountApplied]);

    // Increment redemption count
    await pool.query(`
      UPDATE coupons SET times_redeemed = times_redeemed + 1 WHERE id = $1
    `, [couponId]);

    return result.rows[0];
  }

  // ============================================================================
  // INSTRUMENT PURCHASES
  // ============================================================================

  /**
   * Record an instrument purchase
   */
  static async recordInstrumentPurchase(userId, instrumentId, paymentDetails) {
    const result = await pool.query(`
      INSERT INTO user_instrument_purchases (
        user_id, instrument_id, 
        stripe_session_id, payment_intent_id,
        amount, currency, status
      ) VALUES ($1, $2, $3, $4, $5, $6, 'completed')
      ON CONFLICT (user_id, instrument_id) DO NOTHING
      RETURNING *
    `, [
      userId,
      instrumentId,
      paymentDetails.stripeSessionId,
      paymentDetails.paymentIntentId,
      paymentDetails.amount,
      paymentDetails.currency
    ]);
    return result.rows[0];
  }

  /**
   * Get user's purchased instruments
   */
  static async getUserInstrumentPurchases(userId) {
    const result = await pool.query(`
      SELECT * FROM user_instrument_purchases
      WHERE user_id = $1 AND status = 'completed'
      ORDER BY purchased_at DESC
    `, [userId]);
    return result.rows;
  }

  /**
   * Check if user owns a specific instrument
   */
  static async getUserPurchases(userId, instrumentId) {
    const result = await pool.query(`
      SELECT * FROM user_instrument_purchases
      WHERE user_id = $1 AND instrument_id = $2 AND status = 'completed'
    `, [userId, instrumentId]);
    return result.rows;
  }

  /**
   * Find transaction by payment provider and provider transaction ID
   */
  static async findTransactionByProvider(provider, providerTransactionId) {
    const result = await pool.query(`
      SELECT * FROM transactions
      WHERE provider = $1 AND provider_transaction_id = $2
      LIMIT 1
    `, [provider, providerTransactionId]);
    return result.rows[0];
  }

  /**
   * Update transaction status
   */
  static async updateTransactionStatus(transactionId, status) {
    const result = await pool.query(`
      UPDATE transactions 
      SET status = $1, 
          updated_at = CURRENT_TIMESTAMP,
          completed_at = CASE WHEN $1 = 'completed' THEN CURRENT_TIMESTAMP ELSE completed_at END
      WHERE id = $2
      RETURNING *
    `, [status, transactionId]);
    return result.rows[0];
  }

  /**
   * Create a new transaction
   */
  static async createTransaction(data) {
    const result = await pool.query(`
      INSERT INTO transactions (
        user_id, type, status, amount, currency,
        provider, provider_transaction_id, description, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      data.userId,
      data.type || 'subscription',
      data.status || 'pending',
      data.amount,
      data.currency || 'PLN',
      data.provider,
      data.providerTransactionId,
      data.description,
      JSON.stringify(data.metadata || {})
    ]);
    return result.rows[0];
  }
}

module.exports = Payment;
