/**
 * Payment Routes
 * API endpoints for payment processing
 */
const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();
const Payment = require('../models/payment');
const PaymentService = require('../services/payment-service');

// JWT verification middleware
const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'haos-fm-secret-change-in-production';

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      // Token invalid, continue without user
    }
  }
  next();
};

// Apply JWT verification to all payment routes
router.use(verifyJWT);

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// ============================================================================
// PAYMENT METHODS
// ============================================================================

/**
 * GET /api/payments/methods
 * Get user's payment methods
 */
router.get('/methods', requireAuth, async (req, res) => {
  try {
    const methods = await Payment.getUserPaymentMethods(req.user.id);
    res.json({
      success: true,
      paymentMethods: methods.map((m) => ({
        id: m.id,
        provider: m.provider,
        isDefault: m.is_default,
        cardBrand: m.card_brand,
        cardLastFour: m.card_last_four,
        cardExpMonth: m.card_exp_month,
        cardExpYear: m.card_exp_year,
        paypalEmail: m.paypal_email ? maskEmail(m.paypal_email) : null,
        createdAt: m.created_at,
      })),
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ error: 'Failed to fetch payment methods' });
  }
});

/**
 * POST /api/payments/methods
 * Add a payment method
 */
router.post('/methods', requireAuth, async (req, res) => {
  try {
    const method = await Payment.addPaymentMethod(req.user.id, req.body);
    res.json({
      success: true,
      paymentMethod: method,
    });
  } catch (error) {
    console.error('Error adding payment method:', error);
    res.status(500).json({ error: 'Failed to add payment method' });
  }
});

/**
 * PUT /api/payments/methods/:id/default
 * Set a payment method as default
 */
router.put('/methods/:id/default', requireAuth, async (req, res) => {
  try {
    const method = await Payment.setDefaultPaymentMethod(req.user.id, req.params.id);
    if (!method) {
      return res.status(404).json({ error: 'Payment method not found' });
    }
    res.json({
      success: true,
      paymentMethod: method,
    });
  } catch (error) {
    console.error('Error setting default payment method:', error);
    res.status(500).json({ error: 'Failed to set default payment method' });
  }
});

/**
 * DELETE /api/payments/methods/:id
 * Remove a payment method
 */
router.delete('/methods/:id', requireAuth, async (req, res) => {
  try {
    const method = await Payment.removePaymentMethod(req.user.id, req.params.id);
    if (!method) {
      return res.status(404).json({ error: 'Payment method not found' });
    }
    res.json({
      success: true,
      message: 'Payment method removed',
    });
  } catch (error) {
    console.error('Error removing payment method:', error);
    res.status(500).json({ error: 'Failed to remove payment method' });
  }
});

// ============================================================================
// TRANSACTIONS
// ============================================================================

/**
 * GET /api/payments/transactions
 * Get user's transaction history
 */
router.get('/transactions', requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const transactions = await Payment.getUserTransactions(req.user.id, { limit, offset });
    res.json({
      success: true,
      transactions: transactions.map(formatTransaction),
      pagination: {
        limit,
        offset,
        hasMore: transactions.length === limit,
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

/**
 * GET /api/payments/transactions/:id
 * Get transaction details
 */
router.get('/transactions/:id', requireAuth, async (req, res) => {
  try {
    const transaction = await Payment.getTransactionById(req.params.id);

    if (!transaction || transaction.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({
      success: true,
      transaction: formatTransaction(transaction),
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// ============================================================================
// INVOICES
// ============================================================================

/**
 * GET /api/payments/invoices
 * Get user's invoices
 */
router.get('/invoices', requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const invoices = await Payment.getUserInvoices(req.user.id, { limit, offset });
    res.json({
      success: true,
      invoices: invoices.map(formatInvoice),
      pagination: {
        limit,
        offset,
        hasMore: invoices.length === limit,
      },
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

/**
 * GET /api/payments/invoices/:id
 * Get invoice details
 */
router.get('/invoices/:id', requireAuth, async (req, res) => {
  try {
    const invoice = await Payment.getInvoiceById(req.params.id);

    if (!invoice || invoice.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json({
      success: true,
      invoice: formatInvoice(invoice),
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

/**
 * GET /api/payments/invoices/:id/download
 * Download invoice PDF
 */
router.get('/invoices/:id/download', requireAuth, async (req, res) => {
  try {
    const invoice = await Payment.getInvoiceById(req.params.id);

    if (!invoice || invoice.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    if (invoice.pdf_url) {
      return res.redirect(invoice.pdf_url);
    }

    // Generate PDF on the fly if not available
    // For now, return a simple HTML invoice
    res.setHeader('Content-Type', 'text/html');
    res.send(generateInvoiceHTML(invoice));
  } catch (error) {
    console.error('Error downloading invoice:', error);
    res.status(500).json({ error: 'Failed to download invoice' });
  }
});

// ============================================================================
// ONE-TIME PAYMENTS
// ============================================================================

/**
 * POST /api/payments/create-payment-intent
 * Create a payment intent for one-time payments
 */
router.post('/create-payment-intent', requireAuth, async (req, res) => {
  try {
    const { amount, currency, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const result = await PaymentService.createPaymentIntent(
      req.user.id,
      amount,
      currency || 'PLN',
      { description },
    );

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

/**
 * POST /api/payments/blik
 * Create BLIK payment
 */
router.post('/blik', requireAuth, async (req, res) => {
  try {
    const { amount, description, blikCode } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const result = await PaymentService.createBLIKPayment(
      req.user.id,
      amount,
      description || 'HAOS.fm Payment',
      { blikCode },
    );

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error creating BLIK payment:', error);
    res.status(500).json({ error: 'Failed to create BLIK payment' });
  }
});

/**
 * POST /api/payments/blik/:transactionId/confirm
 * Confirm BLIK payment with code
 */
router.post('/blik/:transactionId/confirm', requireAuth, async (req, res) => {
  try {
    const { blikCode } = req.body;

    if (!blikCode || !/^\d{6}$/.test(blikCode)) {
      return res.status(400).json({ error: 'Valid 6-digit BLIK code is required' });
    }

    const result = await PaymentService.processBLIKWithCode(
      req.params.transactionId,
      blikCode,
    );

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error confirming BLIK payment:', error);
    res.status(500).json({ error: 'Failed to confirm BLIK payment' });
  }
});

// ============================================================================
// INSTRUMENT & PRODUCT PURCHASES
// ============================================================================

/**
 * GET /api/payments/instruments
 * Get available instruments for purchase
 */
router.get('/instruments', async (req, res) => {
  const instruments = [
    {
      id: 'synth-studio',
      name: 'Synth Studio Pro',
      category: 'synthesizer',
      price: 29900,
      currency: 'EUR',
      description: 'Professional analog synthesizer emulation with 128 presets',
      features: ['Analog Warmth Engine', '128 Factory Presets', 'MPE Support', 'Real-time Modulation'],
      image: '/images/instruments/synth.jpg'
    },
    {
      id: 'string-collection',
      name: 'String Collection',
      category: 'strings',
      price: 19900,
      currency: 'EUR',
      description: 'Orchestral strings including violin, viola, cello, and bass',
      features: ['Solo & Ensemble Modes', 'Expressive Articulations', 'Legato System', 'Room Ambience'],
      image: '/images/instruments/strings.jpg'
    },
    {
      id: 'guitar-essentials',
      name: 'Guitar Essentials',
      category: 'guitar',
      price: 14900,
      currency: 'EUR',
      description: 'Electric and acoustic guitar simulations with amp modeling',
      features: ['12 Guitar Models', '8 Amp Simulations', 'Effects Chain', 'Direct Recording'],
      image: '/images/instruments/guitar.jpg'
    },
    {
      id: 'complete-bundle',
      name: 'Complete Instrument Bundle',
      category: 'bundle',
      price: 49900,
      currency: 'EUR',
      description: 'All instruments with lifetime updates and premium support',
      features: ['All Instruments Included', 'Lifetime Updates', 'Priority Support', 'Exclusive Presets'],
      image: '/images/instruments/bundle.jpg'
    }
  ];

  res.json({
    success: true,
    instruments: instruments.map(i => ({
      ...i,
      priceFormatted: new Intl.NumberFormat('en-EU', { style: 'currency', currency: i.currency }).format(i.price / 100)
    }))
  });
});

/**
 * POST /api/payments/instruments/purchase
 * Create checkout session for instrument purchase
 */
router.post('/instruments/purchase', requireAuth, async (req, res) => {
  try {
    const { instrumentId, paymentMethod } = req.body;

    const instrumentPrices = {
      'synth-studio': { price: 29900, name: 'Synth Studio Pro', currency: 'EUR' },
      'string-collection': { price: 19900, name: 'String Collection', currency: 'EUR' },
      'guitar-essentials': { price: 14900, name: 'Guitar Essentials', currency: 'EUR' },
      'complete-bundle': { price: 49900, name: 'Complete Instrument Bundle', currency: 'EUR' }
    };

    const instrument = instrumentPrices[instrumentId];
    if (!instrument) {
      return res.status(400).json({ error: 'Invalid instrument' });
    }

    // Check if user already owns this instrument
    const existingPurchase = await Payment.getUserPurchases(req.user.id, instrumentId);
    if (existingPurchase && existingPurchase.length > 0) {
      return res.status(400).json({ error: 'You already own this instrument' });
    }

    // Create payment intent based on selected method
    const result = await PaymentService.createPaymentIntent(
      req.user.id,
      instrument.price,
      instrument.currency,
      {
        description: `Purchase: ${instrument.name}`,
        metadata: {
          type: 'instrument_purchase',
          instrumentId,
          instrumentName: instrument.name
        }
      }
    );

    res.json({
      success: true,
      ...result,
      instrument: {
        id: instrumentId,
        name: instrument.name,
        price: instrument.price / 100,
        currency: instrument.currency
      }
    });
  } catch (error) {
    console.error('Error creating instrument purchase:', error);
    res.status(500).json({ error: 'Failed to create purchase' });
  }
});

/**
 * GET /api/payments/instruments/owned
 * Get user's owned instruments
 */
router.get('/instruments/owned', requireAuth, async (req, res) => {
  try {
    const purchases = await Payment.getUserInstrumentPurchases(req.user.id);
    res.json({
      success: true,
      instruments: purchases || []
    });
  } catch (error) {
    console.error('Error fetching owned instruments:', error);
    res.status(500).json({ error: 'Failed to fetch owned instruments' });
  }
});

/**
 * POST /api/payments/create-checkout-session
 * Create Stripe Checkout session for instruments
 */
router.post('/create-checkout-session', requireAuth, async (req, res) => {
  try {
    const { instrumentId, successUrl, cancelUrl } = req.body;

    const instrumentPrices = {
      'synth-studio': { priceId: process.env.STRIPE_PRICE_SYNTH || 'price_synth', name: 'Synth Studio Pro', amount: 29900 },
      'string-collection': { priceId: process.env.STRIPE_PRICE_STRINGS || 'price_strings', name: 'String Collection', amount: 19900 },
      'guitar-essentials': { priceId: process.env.STRIPE_PRICE_GUITAR || 'price_guitar', name: 'Guitar Essentials', amount: 14900 },
      'complete-bundle': { priceId: process.env.STRIPE_PRICE_BUNDLE || 'price_bundle', name: 'Complete Instrument Bundle', amount: 49900 }
    };

    const instrument = instrumentPrices[instrumentId];
    if (!instrument) {
      return res.status(400).json({ error: 'Invalid instrument' });
    }

    // Use Stripe if configured
    if (PaymentService.isProviderAvailable('stripe')) {
      const session = await PaymentService.createInstrumentCheckoutSession(
        req.user.id,
        instrumentId,
        instrument,
        { successUrl, cancelUrl }
      );
      return res.json({ success: true, url: session.url, sessionId: session.sessionId });
    }

    // Fallback for testing without Stripe
    res.json({
      success: true,
      mode: 'sandbox',
      message: 'Stripe not configured - sandbox mode',
      redirectUrl: successUrl || '/instruments.html?purchase=success',
      instrument: instrumentId
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// ============================================================================
// PAYPAL INSTRUMENT PURCHASES
// ============================================================================

/**
 * POST /api/payments/paypal/create-order
 * Create PayPal order for instrument purchase
 */
router.post('/paypal/create-order', requireAuth, async (req, res) => {
  try {
    const { instrumentId } = req.body;

    const instrumentPrices = {
      'synth-studio': { name: 'Synth Studio Pro', amount: 29900, currency: 'EUR' },
      'string-collection': { name: 'String Collection', amount: 19900, currency: 'EUR' },
      'guitar-essentials': { name: 'Guitar Essentials', amount: 14900, currency: 'EUR' },
      'complete-bundle': { name: 'Complete Instrument Bundle', amount: 49900, currency: 'EUR' }
    };

    const instrument = instrumentPrices[instrumentId];
    if (!instrument) {
      return res.status(400).json({ error: 'Invalid instrument' });
    }

    // Check if user already owns this instrument
    const existingPurchase = await Payment.getUserPurchases(req.user.id, instrumentId);
    if (existingPurchase && existingPurchase.length > 0) {
      return res.status(400).json({ error: 'You already own this instrument' });
    }

    // Check if PayPal is configured
    if (!PaymentService.isProviderAvailable('paypal')) {
      // Sandbox mode
      return res.json({
        success: true,
        mode: 'sandbox',
        message: 'PayPal not configured - use sandbox mode',
        orderId: `SANDBOX-${Date.now()}`,
        approvalUrl: `/instruments.html?paypal=sandbox&instrument=${instrumentId}`
      });
    }

    const order = await PaymentService.createPayPalOrder(
      req.user.id,
      instrument.amount,
      instrument.currency,
      {
        description: `Purchase: ${instrument.name}`,
        instrumentId,
        type: 'instrument_purchase'
      }
    );

    res.json({
      success: true,
      orderId: order.orderId,
      approvalUrl: order.approvalUrl,
      status: order.status
    });
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    res.status(500).json({ error: error.message || 'Failed to create PayPal order' });
  }
});

/**
 * POST /api/payments/paypal/capture-order
 * Capture PayPal order after user approval
 */
router.post('/paypal/capture-order', requireAuth, async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    // Sandbox mode
    if (!PaymentService.isProviderAvailable('paypal')) {
      return res.json({
        success: true,
        mode: 'sandbox',
        message: 'PayPal capture simulated',
        status: 'COMPLETED'
      });
    }

    const result = await PaymentService.capturePayPalOrder(orderId, req.user.id);

    res.json({
      success: true,
      orderId: result.orderId,
      status: result.status,
      captureId: result.captureId
    });
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    res.status(500).json({ error: error.message || 'Failed to capture PayPal payment' });
  }
});

// ============================================================================
// BLIK INSTRUMENT PURCHASES
// ============================================================================

/**
 * POST /api/payments/blik/create-payment
 * Create BLIK payment for instrument purchase
 */
router.post('/blik/create-payment', requireAuth, async (req, res) => {
  try {
    const { instrumentId, email } = req.body;

    const instrumentPrices = {
      'synth-studio': { name: 'Synth Studio Pro', amount: 29900 }, // In PLN groszy (299 PLN)
      'string-collection': { name: 'String Collection', amount: 19900 },
      'guitar-essentials': { name: 'Guitar Essentials', amount: 14900 },
      'complete-bundle': { name: 'Complete Instrument Bundle', amount: 49900 }
    };

    const instrument = instrumentPrices[instrumentId];
    if (!instrument) {
      return res.status(400).json({ error: 'Invalid instrument' });
    }

    // Check if user already owns this instrument
    const existingPurchase = await Payment.getUserPurchases(req.user.id, instrumentId);
    if (existingPurchase && existingPurchase.length > 0) {
      return res.status(400).json({ error: 'You already own this instrument' });
    }

    const result = await PaymentService.createBLIKPayment(
      req.user.id,
      instrument.amount,
      `Purchase: ${instrument.name}`,
      {
        instrumentId,
        email: email || req.user.email,
        type: 'instrument_purchase'
      }
    );

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error creating BLIK payment:', error);
    res.status(500).json({ error: error.message || 'Failed to create BLIK payment' });
  }
});

/**
 * POST /api/payments/blik/confirm
 * Confirm BLIK payment with 6-digit code
 */
router.post('/blik/confirm', requireAuth, async (req, res) => {
  try {
    const { transactionId, blikCode } = req.body;

    if (!transactionId) {
      return res.status(400).json({ error: 'Transaction ID is required' });
    }

    if (!blikCode || !/^\d{6}$/.test(blikCode)) {
      return res.status(400).json({ error: 'Valid 6-digit BLIK code is required' });
    }

    const result = await PaymentService.processBLIKWithCode(transactionId, blikCode);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error confirming BLIK payment:', error);
    res.status(500).json({ error: error.message || 'Failed to confirm BLIK payment' });
  }
});

/**
 * GET /api/payments/providers
 * Get available payment providers
 */
router.get('/providers', (req, res) => {
  res.json({
    success: true,
    providers: {
      stripe: PaymentService.isProviderAvailable('stripe'),
      paypal: PaymentService.isProviderAvailable('paypal'),
      blik: PaymentService.isProviderAvailable('blik'),
      payu: PaymentService.isProviderAvailable('payu')
    },
    sandbox: {
      stripe: !PaymentService.isProviderAvailable('stripe'),
      paypal: !PaymentService.isProviderAvailable('paypal'),
      blik: !PaymentService.isProviderAvailable('blik'),
      payu: !PaymentService.isProviderAvailable('payu')
    }
  });
});

// ============================================================================
// PAYU PAYMENT ROUTES
// ============================================================================

/**
 * POST /api/payments/payu/create-order
 * Create PayU payment order
 */
router.post('/payu/create-order', requireAuth, async (req, res) => {
  try {
    const { planCode, billingCycle, amount, description, payMethod, blikCode } = req.body;

    if (!planCode || !amount) {
      return res.status(400).json({ error: 'Missing required fields: planCode, amount' });
    }

    const orderData = {
      userId: req.user.id,
      planCode,
      amount: parseFloat(amount),
      email: req.user.email,
      firstName: req.user.firstName || req.user.username || 'HAOS',
      lastName: req.user.lastName || 'User',
      customerIp: req.ip || req.connection.remoteAddress || '127.0.0.1',
      description: description || `HAOS.fm ${planCode} Subscription`,
      payMethod
    };

    let order;
    if (payMethod === 'blik' && blikCode) {
      // Create BLIK payment with code
      order = await PaymentService.createPayUBlikPayment(orderData, blikCode);
    } else {
      // Create regular payment order
      order = await PaymentService.createPayUOrder(orderData);
    }

    res.json({
      success: true,
      orderId: order.orderId,
      extOrderId: order.extOrderId,
      redirectUri: order.redirectUri,
      status: order.status,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('Error creating PayU order:', error);
    res.status(500).json({ error: error.message || 'Failed to create PayU order' });
  }
});

/**
 * GET /api/payments/payu/methods
 * Get available PayU payment methods
 */
router.get('/payu/methods', (req, res) => {
  try {
    const methods = PaymentService.getPayUMethods();
    res.json({
      success: true,
      methods
    });
  } catch (error) {
    console.error('Error getting PayU methods:', error);
    res.status(500).json({ error: 'Failed to get payment methods' });
  }
});

/**
 * GET /api/payments/payu/order/:orderId
 * Get PayU order status
 */
router.get('/payu/order/:orderId', requireAuth, async (req, res) => {
  try {
    const orderStatus = await PaymentService.getPayUOrderStatus(req.params.orderId);
    res.json({
      success: true,
      order: orderStatus
    });
  } catch (error) {
    console.error('Error getting PayU order status:', error);
    res.status(500).json({ error: error.message || 'Failed to get order status' });
  }
});

// ============================================================================
// WEBHOOKS (No auth required - verified by signatures)
// ============================================================================

/**
 * POST /api/payments/webhooks/stripe
 * Stripe webhook handler
 */
router.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    const result = await PaymentService.processStripeWebhook(req.body, signature);
    res.json(result);
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/payments/webhooks/paypal
 * PayPal webhook handler
 */
router.post('/webhooks/paypal', async (req, res) => {
  try {
    const result = await PaymentService.processPayPalWebhook(req.body, req.headers);
    res.json(result);
  } catch (error) {
    console.error('PayPal webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/payments/webhooks/przelewy24
 * Przelewy24/BLIK webhook handler
 */
router.post('/webhooks/przelewy24', async (req, res) => {
  try {
    const result = await PaymentService.processPrzelewy24Webhook(req.body);
    res.json(result);
  } catch (error) {
    console.error('Przelewy24 webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/payments/webhooks/payu
 * PayU webhook handler
 */
router.post('/webhooks/payu', express.json(), async (req, res) => {
  try {
    const signature = req.headers['openpayu-signature'];
    
    if (!signature) {
      return res.status(400).json({ error: 'Missing signature header' });
    }

    const result = await PaymentService.processPayUWebhook(req.body, signature);
    
    // PayU expects 200 OK response
    res.status(200).send('OK');
  } catch (error) {
    console.error('PayU webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatTransaction(t) {
  return {
    id: t.id,
    type: t.type,
    status: t.status,
    amount: t.amount / 100,
    amountFormatted: formatPrice(t.amount, t.currency),
    currency: t.currency,
    provider: t.provider,
    description: t.description,
    createdAt: t.created_at,
    completedAt: t.completed_at,
    cardBrand: t.card_brand,
    cardLastFour: t.card_last_four,
  };
}

function formatInvoice(inv) {
  return {
    id: inv.id,
    invoiceNumber: inv.invoice_number,
    status: inv.status,
    subtotal: inv.subtotal / 100,
    taxAmount: inv.tax_amount / 100,
    total: inv.total / 100,
    totalFormatted: formatPrice(inv.total, inv.currency),
    amountPaid: inv.amount_paid / 100,
    amountDue: inv.amount_due / 100,
    currency: inv.currency,
    invoiceDate: inv.invoice_date,
    dueDate: inv.due_date,
    paidAt: inv.paid_at,
    lineItems: inv.line_items,
    pdfUrl: inv.pdf_url,
  };
}

function formatPrice(amountInCents, currency = 'PLN') {
  const amount = amountInCents / 100;
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency,
  }).format(amount);
}

function maskEmail(email) {
  const [local, domain] = email.split('@');
  const maskedLocal = local.length > 2
    ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1]
    : local;
  return `${maskedLocal}@${domain}`;
}

function generateInvoiceHTML(invoice) {
  const lineItems = invoice.line_items || [];
  const itemsHtml = lineItems.map((item) => `
    <tr>
      <td>${item.description}</td>
      <td>${item.quantity}</td>
      <td>${formatPrice(item.unit_price, invoice.currency)}</td>
      <td>${formatPrice(item.amount, invoice.currency)}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <title>Invoice ${invoice.invoice_number}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .logo { font-size: 24px; font-weight: bold; color: #FF6B35; }
    .invoice-details { text-align: right; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f5f5f5; }
    .totals { text-align: right; margin-top: 20px; }
    .total-row { font-size: 18px; font-weight: bold; }
    .status-paid { color: green; }
    .status-open { color: orange; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">HAOS.fm</div>
    <div class="invoice-details">
      <h2>Invoice ${invoice.invoice_number}</h2>
      <p>Date: ${new Date(invoice.invoice_date).toLocaleDateString('pl-PL')}</p>
      <p>Status: <span class="status-${invoice.status}">${invoice.status.toUpperCase()}</span></p>
    </div>
  </div>
  
  <div class="customer">
    <h3>Bill To:</h3>
    <p>${invoice.customer_name || 'Customer'}</p>
    <p>${invoice.customer_email || ''}</p>
  </div>
  
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Qty</th>
        <th>Unit Price</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>
  
  <div class="totals">
    <p>Subtotal: ${formatPrice(invoice.subtotal, invoice.currency)}</p>
    <p>Tax (${invoice.tax_rate || 23}%): ${formatPrice(invoice.tax_amount, invoice.currency)}</p>
    <p class="total-row">Total: ${formatPrice(invoice.total, invoice.currency)}</p>
  </div>
  
  <div class="footer">
    <p><small>Thank you for choosing HAOS.fm!</small></p>
  </div>
</body>
</html>
  `;
}

module.exports = router;
