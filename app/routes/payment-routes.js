/**
 * Payment Routes
 * API endpoints for payment processing
 */
const express = require('express');

const router = express.Router();
const Payment = require('../models/payment');
const PaymentService = require('../services/payment-service');

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
