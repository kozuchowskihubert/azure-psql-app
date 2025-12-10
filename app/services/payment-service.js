/**
 * Payment Service
 * Handles payment processing with Stripe, PayPal, and BLIK (Przelewy24)
 */
const Payment = require('../models/payment');
const Subscription = require('../models/subscription');

// Initialize payment providers (these need to be configured with actual API keys)
let stripe = null;
let paypal = null;

// Initialize Stripe if configured
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

// Initialize PayPal if configured
if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) {
  // PayPal SDK would be initialized here
  paypal = {
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    mode: process.env.PAYPAL_MODE || 'sandbox',
  };
}

// BLIK/Przelewy24 configuration
const przelewy24Config = {
  merchantId: process.env.P24_MERCHANT_ID,
  posId: process.env.P24_POS_ID,
  crc: process.env.P24_CRC,
  apiKey: process.env.P24_API_KEY,
  sandbox: process.env.P24_SANDBOX === 'true',
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

        if (userId && planCode) {
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
   * Create BLIK payment (via Przelewy24)
   */
  static async createBLIKPayment(userId, amount, description, options = {}) {
    if (!przelewy24Config.merchantId) {
      throw new Error('Przelewy24/BLIK is not configured');
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
        blikCode: options.blikCode,
        returnUrl: options.returnUrl,
      },
    });

    // In production, this would call Przelewy24 API
    // For BLIK specifically, the flow is:
    // 1. Create transaction with P24
    // 2. User enters BLIK code on their banking app
    // 3. User confirms in banking app
    // 4. Webhook confirms payment

    const baseUrl = przelewy24Config.sandbox
      ? 'https://sandbox.przelewy24.pl'
      : 'https://secure.przelewy24.pl';

    return {
      transactionId: transaction.id,
      sessionId,
      paymentUrl: `${baseUrl}/trnRequest/${sessionId}`,
      amount: amount / 100,
      currency: 'PLN',
      // For BLIK direct payment (when blikCode is provided)
      requiresBlikCode: !options.blikCode,
    };
  }

  /**
   * Process BLIK payment with code
   */
  static async processBLIKWithCode(transactionId, blikCode) {
    if (!przelewy24Config.merchantId) {
      throw new Error('Przelewy24/BLIK is not configured');
    }

    const transaction = await Payment.getTransactionById(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // In production, this would:
    // 1. Send BLIK code to Przelewy24
    // 2. Wait for confirmation
    // 3. Return result

    // Simulate processing
    await Payment.updateTransactionStatus(transactionId, 'processing');

    return {
      transactionId,
      status: 'processing',
      message: 'Please confirm the payment in your banking app',
    };
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
}

module.exports = PaymentService;
