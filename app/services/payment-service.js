/**
 * Payment Service
 * Handles payment processing with Stripe, PayPal, PayU, and BLIK (Przelewy24)
 */
const Payment = require('../models/payment');
const Subscription = require('../models/subscription');
const crypto = require('crypto');
const emailService = require('./email-service');

// Initialize payment providers (these need to be configured with actual API keys)
let stripe = null;
let paypal = null;
let payuService = null;

// Initialize Stripe if configured
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

// Initialize PayPal if configured
if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) {
  paypal = {
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    mode: process.env.PAYPAL_MODE || 'sandbox',
    baseUrl: process.env.PAYPAL_MODE === 'live' 
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com'
  };
}

// Initialize PayU if configured
if (process.env.PAYU_POS_ID && process.env.PAYU_CLIENT_SECRET) {
  payuService = require('./payu-service');
}

// BLIK/Przelewy24 configuration
const przelewy24Config = {
  merchantId: process.env.P24_MERCHANT_ID,
  posId: process.env.P24_POS_ID || process.env.P24_MERCHANT_ID,
  crc: process.env.P24_CRC,
  apiKey: process.env.P24_API_KEY,
  sandbox: process.env.P24_SANDBOX !== 'false',
  baseUrl: process.env.P24_SANDBOX !== 'false'
    ? 'https://sandbox.przelewy24.pl'
    : 'https://secure.przelewy24.pl'
};

class PaymentService {
  /**
   * Check if a payment provider is configured
   */
  static isProviderAvailable(provider) {
    switch (provider) {
      case 'stripe':
        return !!stripe;
      case 'paypal':
        return !!paypal;
      case 'payu':
        return !!payuService && payuService.isAvailable();
      case 'blik':
      case 'przelewy24':
        return !!przelewy24Config.merchantId;
      default:
        return false;
    }
  }

  /**
   * Get available payment providers
   */
  static getAvailableProviders() {
    const providers = [];
    if (this.isProviderAvailable('stripe')) providers.push('stripe');
    if (this.isProviderAvailable('paypal')) providers.push('paypal');
    if (this.isProviderAvailable('payu')) providers.push('payu');
    if (this.isProviderAvailable('blik')) providers.push('blik');
    return providers;
  }

  // ============================================================================
  // STRIPE
  // ============================================================================

  /**
   * Create Stripe checkout session for subscription
   */
  static async createStripeCheckoutSession(userId, planCode, options = {}) {
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    const plan = await Subscription.getPlanByCode(planCode);
    if (!plan) {
      throw new Error('Plan not found');
    }

    const billingCycle = options.billingCycle || 'monthly';
    const price = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: plan.currency.toLowerCase(),
          product_data: {
            name: `${plan.name} - ${billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}`,
            description: plan.description,
          },
          unit_amount: price,
          recurring: {
            interval: billingCycle === 'yearly' ? 'year' : 'month',
          },
        },
        quantity: 1,
      }],
      success_url: `${options.successUrl || process.env.APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${options.cancelUrl || process.env.APP_URL}/subscription/cancel`,
      client_reference_id: userId,
      metadata: {
        userId,
        planCode,
        billingCycle,
      },
      subscription_data: {
        metadata: {
          userId,
          planCode,
        },
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  /**
   * Create Stripe checkout session for instrument purchase
   */
  static async createInstrumentCheckoutSession(userId, instrumentId, instrument, options = {}) {
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: instrument.name,
            description: `Virtual instrument for HAOS.fm Studio`,
          },
          unit_amount: instrument.amount,
        },
        quantity: 1,
      }],
      success_url: `${options.successUrl || process.env.APP_URL}/instruments.html?purchase=success&instrument=${instrumentId}`,
      cancel_url: `${options.cancelUrl || process.env.APP_URL}/instruments.html?purchase=cancelled`,
      client_reference_id: String(userId),
      metadata: {
        userId: String(userId),
        instrumentId,
        type: 'instrument_purchase'
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  /**
   * Create Stripe customer portal session
   */
  static async createStripePortalSession(userId, stripeCustomerId) {
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.APP_URL}/account/subscription`,
    });

    return {
      url: session.url,
    };
  }

  /**
   * Process Stripe webhook
   */
  static async processStripeWebhook(rawBody, signature) {
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    // Record webhook
    const webhookRecord = await Payment.recordWebhookEvent({
      provider: 'stripe',
      eventId: event.id,
      eventType: event.type,
      payload: event.data.object,
    });

    if (!webhookRecord) {
      // Duplicate event, skip
      return { skipped: true };
    }

    try {
      await this.handleStripeEvent(event);
      await Payment.markWebhookProcessed(webhookRecord.id);
    } catch (err) {
      await Payment.markWebhookProcessed(webhookRecord.id, err);
      throw err;
    }

    return { processed: true };
  }

  /**
   * Handle Stripe event
   */
  static async handleStripeEvent(event) {
    const data = event.data.object;

    switch (event.type) {
      case 'checkout.session.completed': {
        const userId = data.metadata?.userId || data.client_reference_id;
        const planCode = data.metadata?.planCode;
        const billingCycle = data.metadata?.billingCycle || 'monthly';
        const instrumentId = data.metadata?.instrumentId;

        // Handle instrument purchase
        if (instrumentId && userId) {
          await Payment.recordInstrumentPurchase(userId, instrumentId, {
            stripeSessionId: data.id,
            paymentIntentId: data.payment_intent,
            amount: data.amount_total,
            currency: data.currency
          });
        }
        // Handle subscription
        else if (userId && planCode) {
          await Subscription.createSubscription(userId, planCode, billingCycle, {
            stripeSubscriptionId: data.subscription,
          });
        }
        break;
      }

      case 'invoice.paid': {
        const subscriptionId = data.subscription;
        const amountPaid = data.amount_paid;

        // Create transaction record
        await Payment.createTransaction({
          userId: data.metadata?.userId,
          type: 'subscription',
          status: 'completed',
          amount: amountPaid,
          currency: data.currency.toUpperCase(),
          provider: 'stripe',
          providerTransactionId: data.id,
          providerResponse: data,
          description: `Subscription payment - ${data.lines?.data?.[0]?.description || 'HAOS.fm'}`,
        });
        break;
      }

      case 'invoice.payment_failed': {
        const userId = data.metadata?.userId;
        if (userId) {
        // Update subscription status to past_due
          await Subscription.updateStatus(userId, 'past_due');
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const userId = data.metadata?.userId;
        if (userId) {
          await Subscription.cancelSubscription(userId, true, 'Cancelled via Stripe');
        }
        break;
      }

      case 'customer.subscription.updated': {
      // Handle plan changes, status updates, etc.
        break;
      }

      default:
        // Ignore unhandled event types
        break;
    }
  }

  // ============================================================================
  // PAYPAL
  // ============================================================================

  /**
   * Get PayPal access token
   */
  static async getPayPalAccessToken() {
    if (!paypal) {
      throw new Error('PayPal is not configured');
    }

    const auth = Buffer.from(`${paypal.clientId}:${paypal.clientSecret}`).toString('base64');
    
    const response = await fetch(`${paypal.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      throw new Error('Failed to get PayPal access token');
    }

    const data = await response.json();
    return data.access_token;
  }

  /**
   * Create PayPal order for one-time purchase
   */
  static async createPayPalOrder(userId, amount, currency, options = {}) {
    if (!paypal) {
      throw new Error('PayPal is not configured');
    }

    const accessToken = await this.getPayPalAccessToken();

    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: `HAOS-${userId}-${Date.now()}`,
        description: options.description || 'HAOS.fm Purchase',
        custom_id: JSON.stringify({
          userId,
          instrumentId: options.instrumentId,
          type: options.type || 'instrument_purchase'
        }),
        amount: {
          currency_code: currency.toUpperCase(),
          value: (amount / 100).toFixed(2) // Convert cents to dollars
        }
      }],
      application_context: {
        brand_name: 'HAOS.fm',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: options.returnUrl || `${process.env.APP_URL || 'http://localhost:3000'}/instruments.html?paypal=success`,
        cancel_url: options.cancelUrl || `${process.env.APP_URL || 'http://localhost:3000'}/instruments.html?paypal=cancelled`
      }
    };

    const response = await fetch(`${paypal.baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `HAOS-${Date.now()}`
      },
      body: JSON.stringify(orderPayload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create PayPal order');
    }

    const order = await response.json();

    // Create pending transaction
    await Payment.createTransaction({
      userId,
      type: options.type || 'one_time',
      status: 'pending',
      amount,
      currency: currency.toUpperCase(),
      provider: 'paypal',
      providerTransactionId: order.id,
      description: options.description,
      metadata: {
        instrumentId: options.instrumentId,
        orderId: order.id
      }
    });

    // Find approval URL
    const approvalUrl = order.links.find(link => link.rel === 'approve')?.href;

    return {
      orderId: order.id,
      approvalUrl,
      status: order.status
    };
  }

  /**
   * Capture PayPal order after approval
   */
  static async capturePayPalOrder(orderId, userId) {
    if (!paypal) {
      throw new Error('PayPal is not configured');
    }

    const accessToken = await this.getPayPalAccessToken();

    const response = await fetch(`${paypal.baseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to capture PayPal payment');
    }

    const capture = await response.json();

    // Update transaction status
    const transaction = await Payment.getTransactionByProviderId('paypal', orderId);
    if (transaction) {
      await Payment.updateTransactionStatus(
        transaction.id,
        capture.status === 'COMPLETED' ? 'completed' : 'failed',
        capture
      );

      // If instrument purchase, record it
      if (transaction.metadata?.instrumentId && capture.status === 'COMPLETED') {
        const customData = JSON.parse(capture.purchase_units?.[0]?.custom_id || '{}');
        if (customData.instrumentId) {
          await Payment.recordInstrumentPurchase(userId, customData.instrumentId, {
            paypalOrderId: orderId,
            amount: transaction.amount,
            currency: transaction.currency
          });
        }
      }
    }

    return {
      orderId,
      status: capture.status,
      captureId: capture.purchase_units?.[0]?.payments?.captures?.[0]?.id
    };
  }

  /**
   * Create PayPal subscription
   */
  static async createPayPalSubscription(userId, planCode, options = {}) {
    if (!paypal) {
      throw new Error('PayPal is not configured');
    }

    const plan = await Subscription.getPlanByCode(planCode);
    if (!plan) {
      throw new Error('Plan not found');
    }

    const billingCycle = options.billingCycle || 'monthly';
    const price = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;

    // In production, this would use PayPal's SDK to create a subscription
    // For now, return a mock response structure
    return {
      subscriptionId: `PAYPAL-${Date.now()}`,
      approvalUrl: `https://www.${paypal.mode === 'sandbox' ? 'sandbox.' : ''}paypal.com/checkoutnow`,
      planCode,
      price: price / 100, // Convert from cents
      currency: plan.currency,
    };
  }

  /**
   * Process PayPal webhook
   */
  static async processPayPalWebhook(payload, headers) {
    if (!paypal) {
      throw new Error('PayPal is not configured');
    }

    // Verify webhook signature (in production)
    // const verified = await paypalVerifyWebhook(payload, headers);

    const webhookRecord = await Payment.recordWebhookEvent({
      provider: 'paypal',
      eventId: payload.id,
      eventType: payload.event_type,
      payload: payload.resource,
    });

    if (!webhookRecord) {
      return { skipped: true };
    }

    try {
      await this.handlePayPalEvent(payload);
      await Payment.markWebhookProcessed(webhookRecord.id);
    } catch (err) {
      await Payment.markWebhookProcessed(webhookRecord.id, err);
      throw err;
    }

    return { processed: true };
  }

  /**
   * Handle PayPal event
   */
  static async handlePayPalEvent(payload) {
    switch (payload.event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED': {
        const customId = payload.resource.custom_id; // userId|planCode
        const [userId, planCode] = customId?.split('|') || [];

        if (userId && planCode) {
          await Subscription.createSubscription(userId, planCode, 'monthly', {
            paypalSubscriptionId: payload.resource.id,
          });
        }
        break;
      }

      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.EXPIRED': {
        const customId = payload.resource.custom_id;
        const [userId] = customId?.split('|') || [];

        if (userId) {
          await Subscription.cancelSubscription(userId, true, 'Cancelled via PayPal');
        }
        break;
      }

      case 'PAYMENT.SALE.COMPLETED': {
        // const billingAgreementId = payload.resource.billing_agreement_id;
        // Record the payment
        await Payment.createTransaction({
          type: 'subscription',
          status: 'completed',
          amount: Math.round(parseFloat(payload.resource.amount.total) * 100),
          currency: payload.resource.amount.currency,
          provider: 'paypal',
          providerTransactionId: payload.resource.id,
          providerResponse: payload.resource,
        });
        break;
      }

      default:
        // Ignore unhandled event types
        break;
    }
  }

  // ============================================================================
  // BLIK / PRZELEWY24
  // ============================================================================

  /**
   * Generate P24 signature
   */
  static generateP24Signature(data) {
    const signString = Object.values(data).join('|') + '|' + przelewy24Config.crc;
    return crypto.createHash('sha384').update(signString).digest('hex');
  }

  /**
   * Create BLIK payment (via Przelewy24)
   */
  static async createBLIKPayment(userId, amount, description, options = {}) {
    if (!przelewy24Config.merchantId) {
      // Sandbox mode without real credentials
      const sessionId = `HAOS-BLIK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const transaction = await Payment.createTransaction({
        userId,
        type: options.type || 'one_time',
        status: 'pending',
        amount,
        currency: 'PLN',
        provider: 'blik',
        providerTransactionId: sessionId,
        description,
        metadata: {
          instrumentId: options.instrumentId,
          sandbox: true
        }
      });

      return {
        transactionId: transaction.id,
        sessionId,
        mode: 'sandbox',
        message: 'BLIK sandbox mode - P24 not configured',
        requiresBlikCode: true,
        amount: amount / 100,
        currency: 'PLN'
      };
    }

    const sessionId = `HAOS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create pending transaction
    const transaction = await Payment.createTransaction({
      userId,
      type: options.type || 'one_time',
      status: 'pending',
      amount,
      currency: 'PLN',
      provider: 'blik',
      providerTransactionId: sessionId,
      description,
      metadata: {
        instrumentId: options.instrumentId,
        returnUrl: options.returnUrl
      }
    });

    // Register transaction with Przelewy24
    const registerData = {
      merchantId: parseInt(przelewy24Config.merchantId),
      posId: parseInt(przelewy24Config.posId),
      sessionId,
      amount,
      currency: 'PLN',
      description: description || 'HAOS.fm Purchase',
      email: options.email || 'customer@haos.fm',
      country: 'PL',
      language: 'pl',
      method: 181, // BLIK method code for P24
      urlReturn: options.returnUrl || `${process.env.APP_URL || 'http://localhost:3000'}/instruments.html?blik=success`,
      urlStatus: `${process.env.APP_URL || 'http://localhost:3000'}/api/payments/webhooks/przelewy24`
    };

    // Generate signature
    const signData = {
      sessionId,
      merchantId: przelewy24Config.merchantId,
      amount,
      currency: 'PLN',
    };
    registerData.sign = this.generateP24Signature(signData);

    try {
      const response = await fetch(`${przelewy24Config.baseUrl}/api/v1/transaction/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${przelewy24Config.posId}:${przelewy24Config.apiKey}`).toString('base64')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to register P24 transaction');
      }

      const result = await response.json();

      return {
        transactionId: transaction.id,
        sessionId,
        token: result.data?.token,
        paymentUrl: `${przelewy24Config.baseUrl}/trnRequest/${result.data?.token}`,
        amount: amount / 100,
        currency: 'PLN',
        requiresBlikCode: true
      };
    } catch (error) {
      console.error('P24 registration error:', error);
      throw error;
    }
  }

  /**
   * Process BLIK payment with 6-digit code
   */
  static async processBLIKWithCode(transactionId, blikCode) {
    // Validate BLIK code format
    if (!blikCode || !/^\d{6}$/.test(blikCode)) {
      throw new Error('Invalid BLIK code - must be 6 digits');
    }

    const transaction = await Payment.getTransactionById(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (!przelewy24Config.merchantId) {
      // Sandbox mode - simulate successful payment
      await Payment.updateTransactionStatus(transactionId, 'completed', { sandbox: true });
      
      // Record instrument purchase if applicable
      if (transaction.metadata?.instrumentId) {
        await Payment.recordInstrumentPurchase(transaction.user_id, transaction.metadata.instrumentId, {
          blikTransactionId: transactionId,
          amount: transaction.amount,
          currency: 'PLN'
        });
      }

      return {
        transactionId,
        status: 'completed',
        mode: 'sandbox',
        message: 'BLIK payment simulated successfully'
      };
    }

    // Update transaction to processing
    await Payment.updateTransactionStatus(transactionId, 'processing');

    // Send BLIK code to Przelewy24
    const chargeData = {
      token: transaction.provider_transaction_id,
      blikCode
    };

    try {
      const response = await fetch(`${przelewy24Config.baseUrl}/api/v1/transaction/charge`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${przelewy24Config.posId}:${przelewy24Config.apiKey}`).toString('base64')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(chargeData)
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        await Payment.updateTransactionStatus(transactionId, 'failed', result);
        throw new Error(result.error || 'BLIK payment failed');
      }

      return {
        transactionId,
        status: 'processing',
        message: 'Please confirm the payment in your banking app'
      };
    } catch (error) {
      console.error('BLIK charge error:', error);
      throw error;
    }
  }

  /**
   * Process Przelewy24 webhook
   */
  static async processPrzelewy24Webhook(payload) {
    if (!przelewy24Config.merchantId) {
      throw new Error('Przelewy24 is not configured');
    }

    // Verify webhook signature
    // const expectedSign = crypto.createHash('md5')
    //   .update(`${payload.sessionId}|${payload.orderId}|${payload.amount}|${payload.currency}|${przelewy24Config.crc}`)
    //   .digest('hex');

    const webhookRecord = await Payment.recordWebhookEvent({
      provider: 'przelewy24',
      eventId: payload.orderId?.toString() || `p24-${Date.now()}`,
      eventType: 'payment.completed',
      payload,
    });

    if (!webhookRecord) {
      return { skipped: true };
    }

    try {
      // Find transaction by session ID
      const transaction = await Payment.getTransactionByProviderId('blik', payload.sessionId);

      if (transaction) {
        // Update transaction status
        await Payment.updateTransactionStatus(
          transaction.id,
          payload.error ? 'failed' : 'completed',
          payload,
        );

        // If this was a subscription payment, activate subscription
        if (transaction.subscription_id) {
          // Subscription.activateAfterPayment(transaction.subscription_id);
        }
      }

      await Payment.markWebhookProcessed(webhookRecord.id);
    } catch (err) {
      await Payment.markWebhookProcessed(webhookRecord.id, err);
      throw err;
    }

    return { processed: true };
  }

  // ============================================================================
  // ONE-TIME PAYMENTS
  // ============================================================================

  /**
   * Create a one-time payment intent (Stripe)
   */
  static async createPaymentIntent(userId, amount, currency = 'PLN', options = {}) {
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency.toLowerCase(),
      metadata: {
        userId,
        ...options.metadata,
      },
      description: options.description,
    });

    // Create pending transaction
    await Payment.createTransaction({
      userId,
      type: 'one_time',
      status: 'pending',
      amount,
      currency,
      provider: 'stripe',
      providerTransactionId: paymentIntent.id,
      description: options.description,
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  // ============================================================================
  // REFUNDS
  // ============================================================================

  /**
   * Process refund
   */
  static async processRefund(transactionId, amount = null, reason = null) {
    const transaction = await Payment.getTransactionById(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.status !== 'completed') {
      throw new Error('Can only refund completed transactions');
    }

    const refundAmount = amount || transaction.amount;

    let providerRefund = null;

    switch (transaction.provider) {
      case 'stripe':
        if (stripe) {
          providerRefund = await stripe.refunds.create({
            payment_intent: transaction.provider_transaction_id,
            amount: refundAmount,
            reason: reason || 'requested_by_customer',
          });
        }
        break;

      case 'paypal':
      // PayPal refund API call would go here
        break;

      case 'blik':
      case 'przelewy24':
      // P24 refund API call would go here
        break;

      default:
        // Unknown provider - log warning but continue
        break;
    }

    // Create refund transaction
    const refundTransaction = await Payment.createTransaction({
      userId: transaction.user_id,
      type: 'refund',
      status: 'completed',
      amount: -refundAmount, // Negative for refund
      currency: transaction.currency,
      provider: transaction.provider,
      providerTransactionId: providerRefund?.id || `refund-${transactionId}`,
      providerResponse: providerRefund,
      description: `Refund for transaction ${transactionId}`,
      metadata: { originalTransactionId: transactionId, reason },
    });

    // Update original transaction
    await Payment.updateTransactionStatus(transactionId, 'refunded');

    return refundTransaction;
  }

  // ============================================================================
  // PAYU
  // ============================================================================

  /**
   * Create PayU payment order
   */
  static async createPayUOrder(orderData) {
    if (!payuService) {
      throw new Error('PayU is not configured');
    }

    try {
      const order = await payuService.createOrder(orderData);

      // Store transaction in database (convert amount to cents)
      await Payment.createTransaction({
        userId: orderData.userId,
        type: 'subscription',
        status: 'pending',
        amount: Math.round(order.amount * 100), // Convert PLN to groszy (cents)
        currency: order.currency,
        provider: 'payu',
        providerTransactionId: order.orderId,
        providerResponse: order,
        description: orderData.description,
        metadata: {
          planCode: orderData.planCode,
          extOrderId: order.extOrderId
        }
      });

      return order;
    } catch (error) {
      console.error('PayU order creation error:', error);
      throw error;
    }
  }

  /**
   * Create PayU BLIK payment with code
   */
  static async createPayUBlikPayment(orderData, blikCode) {
    if (!payuService) {
      throw new Error('PayU is not configured');
    }

    try {
      const order = await payuService.createBlikPayment(orderData, blikCode);

      // Store transaction in database (convert amount to cents)
      await Payment.createTransaction({
        userId: orderData.userId,
        type: 'subscription',
        status: 'pending',
        amount: Math.round(order.amount * 100), // Convert PLN to groszy (cents)
        currency: order.currency,
        provider: 'payu',
        providerTransactionId: order.orderId,
        providerResponse: order,
        description: orderData.description,
        metadata: {
          planCode: orderData.planCode,
          extOrderId: order.extOrderId,
          payMethod: 'blik',
          blikAuthorized: order.blikAuthorized
        }
      });

      return order;
    } catch (error) {
      console.error('PayU BLIK payment error:', error);
      throw error;
    }
  }

  /**
   * Get PayU order status
   */
  static async getPayUOrderStatus(orderId) {
    if (!payuService) {
      throw new Error('PayU is not configured');
    }

    return await payuService.getOrderStatus(orderId);
  }

  /**
   * Get PayU payment methods
   */
  static getPayUMethods() {
    if (!payuService) {
      throw new Error('PayU is not configured');
    }

    return payuService.getPaymentMethods();
  }

  /**
   * Process PayU webhook notification
   */
  static async processPayUWebhook(notification, signature) {
    if (!payuService) {
      throw new Error('PayU is not configured');
    }

    // Verify signature
    const isValid = payuService.verifyNotification(notification, signature);
    if (!isValid) {
      throw new Error('Invalid PayU webhook signature');
    }

    // Handle notification
    const orderData = await payuService.handleNotification(notification);

    console.log(`📩 PayU webhook: Order ${orderData.orderId} - Status: ${orderData.status}`);
    console.log(`   ExtOrderId: ${orderData.extOrderId}`);

    // Extract userId from extOrderId (format: HAOS_{userId}_{timestamp})
    let userId = null;
    let planCode = null;
    
    if (orderData.extOrderId) {
      // Support both formats: HAOS_{userId}_{timestamp} (new) and HAOS-{userId}-{timestamp} (old)
      const separator = orderData.extOrderId.includes('_') ? '_' : '-';
      const parts = orderData.extOrderId.split(separator);
      
      if (parts[0] === 'HAOS' && parts.length >= 3) {
        // Format: HAOS_{userId}_{timestamp} - userId is in the middle
        // Join all parts except first (HAOS) and last (timestamp)
        userId = parts.slice(1, -1).join(separator);
        console.log(`   Extracted userId: ${userId}`);
      }
    }

    // Try to find transaction in database first
    const transaction = await Payment.findTransactionByProvider('payu', orderData.orderId);
    
    if (transaction) {
      // We have a transaction record
      userId = userId || transaction.user_id;
      const metadata = transaction.metadata || {};
      planCode = metadata.planCode;
      
      let newStatus = 'pending';
      
      switch (orderData.status) {
        case 'COMPLETED':
          newStatus = 'completed';
          break;
        case 'CANCELED':
          newStatus = 'failed';
          break;
        case 'PENDING':
        case 'WAITING_FOR_CONFIRMATION':
          newStatus = 'pending';
          break;
      }

      await Payment.updateTransactionStatus(transaction.id, newStatus);
    }

    // Activate subscription if payment completed
    if (orderData.status === 'COMPLETED' && userId) {
      console.log(`✅ PayU payment COMPLETED for user: ${userId}`);
      
      // Determine plan code (from transaction metadata, description, or default)
      if (!planCode) {
        // Try to extract from description (e.g., "HAOS.fm monthly Plan" or "HAOS.fm premium Subscription")
        const description = notification.order?.description || '';
        const descLower = description.toLowerCase();
        
        if (descLower.includes('premium') || descLower.includes('pro')) {
          planCode = 'premium';
        } else if (descLower.includes('basic') || descLower.includes('starter')) {
          planCode = 'basic';
        } else {
          planCode = 'premium'; // Default to premium for paid subscriptions
        }
      }
      
      try {
        // Create subscription for user
        await Subscription.createSubscription(userId, planCode, 'monthly');
        console.log(`🎉 Subscription '${planCode}' activated for user: ${userId}`);
        
        // Send confirmation email
        try {
          // Get user details for email
          const { Pool } = require('pg');
          const pool = new Pool({ connectionString: process.env.DATABASE_URL });
          const userResult = await pool.query('SELECT email, username FROM users WHERE id = $1', [userId]);
          pool.end();
          
          if (userResult.rows[0]) {
            const user = userResult.rows[0];
            const amount = (notification.order?.totalAmount || 0) / 100; // Convert from grosze
            const currency = notification.order?.currencyCode || 'PLN';
            
            await emailService.sendSubscriptionConfirmation(
              user.email,
              user.username,
              planCode.charAt(0).toUpperCase() + planCode.slice(1), // Capitalize
              amount,
              currency
            );
            console.log(`📧 Subscription confirmation email sent to: ${user.email}`);
          }
        } catch (emailError) {
          console.error(`⚠️ Failed to send confirmation email:`, emailError.message);
          // Don't fail the webhook - subscription was created successfully
        }
      } catch (subError) {
        console.error(`❌ Failed to create subscription for user ${userId}:`, subError.message);
        // Don't throw - webhook was received successfully
      }
    }

    return {
      success: true,
      orderId: orderData.orderId,
      status: orderData.status,
      userId: userId
    };
  }

  /**
   * Refund PayU order
   */
  static async refundPayUOrder(orderId, amount = null, reason = '') {
    if (!payuService) {
      throw new Error('PayU is not configured');
    }

    return await payuService.refundOrder(orderId, amount, reason);
  }
}

module.exports = PaymentService;
