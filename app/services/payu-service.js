/**
 * PayU Payment Service for HAOS.fm
 * REST API v2.1 Integration
 * 
 * Features:
 * - BLIK payments (1.5% fee)
 * - Card payments (1.9% fee)
 * - Bank transfers (1.5% fee)
 * - Installments (Raty PayU)
 * - OAuth 2.0 authentication
 */

const axios = require('axios');
const crypto = require('crypto');

class PayUService {
  constructor() {
    // Credentials from PayU Dashboard
    this.posId = process.env.PAYU_POS_ID || '4417691';
    this.clientId = process.env.PAYU_CLIENT_ID || '4417691'; // Same as POS ID for REST API
    this.clientSecret = process.env.PAYU_CLIENT_SECRET || 'e99ab64248affbea2f55ec849f252cbe';
    this.md5Key = process.env.PAYU_MD5_KEY || '0dba4fc3dd8f994d5ef0b18aa8e9cb6e';
    
    // Environment
    this.mode = process.env.PAYU_MODE || 'sandbox';
    this.baseUrl = this.mode === 'sandbox' 
      ? 'https://secure.snd.payu.com' 
      : 'https://secure.payu.com';
    
    // OAuth token cache
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Get OAuth 2.0 access token
   */
  async authenticate() {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/pl/standard/user/oauth/authorize`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret
        }),
        {
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded' 
          }
        }
      );
      
      this.accessToken = response.data.access_token;
      // Token expires in 43199 seconds (12 hours) - refresh 5 min early
      this.tokenExpiry = Date.now() + (43199 - 300) * 1000;
      
      console.log('✅ PayU OAuth token obtained');
      return this.accessToken;
    } catch (error) {
      console.error('❌ PayU authentication failed:', error.response?.data || error.message);
      throw new Error('PayU authentication failed');
    }
  }

  /**
   * Create a new payment order
   * 
   * @param {Object} orderData - Order details
   * @param {string} orderData.userId - User ID from HAOS.fm
   * @param {string} orderData.planCode - Subscription plan code
   * @param {number} orderData.amount - Amount in PLN (e.g., 49.99)
   * @param {string} orderData.email - Customer email
   * @param {string} orderData.firstName - Customer first name
   * @param {string} orderData.lastName - Customer last name
   * @param {string} orderData.customerIp - Customer IP address
   * @param {string} orderData.description - Order description
   * @param {string} [orderData.payMethod] - Payment method ('blik', 'c', 'ai' for installments)
   */
  async createOrder(orderData) {
    await this.authenticate();

    // Convert amount to grosze (smallest currency unit)
    const totalAmount = Math.round(orderData.amount * 100).toString();

    const orderPayload = {
      notifyUrl: `${process.env.APP_URL || 'https://haos.fm'}/api/payments/webhooks/payu`,
      continueUrl: `${process.env.APP_URL || 'https://haos.fm'}/subscription/success`,
      customerIp: orderData.customerIp,
      merchantPosId: this.posId,
      description: orderData.description || `HAOS.fm ${orderData.planCode} Subscription`,
      currencyCode: 'PLN',
      totalAmount: totalAmount,
      extOrderId: `HAOS_${orderData.userId}_${Date.now()}`, // Unique order ID with user ID for subscription activation (underscore separated)
      products: [{
        name: orderData.description || `HAOS.fm ${orderData.planCode} Plan`,
        unitPrice: totalAmount,
        quantity: '1'
      }],
      buyer: {
        email: orderData.email,
        phone: orderData.phone || '',
        firstName: orderData.firstName,
        lastName: orderData.lastName,
        language: 'pl'
      }
    };

    // Add payment method if specified (e.g., BLIK)
    if (orderData.payMethod) {
      orderPayload.payMethods = {
        payMethod: {
          type: orderData.payMethod === 'blik' ? 'PBL' : orderData.payMethod,
          value: orderData.payMethod === 'blik' ? 'blik' : orderData.payMethod
        }
      };
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/api/v2_1/orders`,
        orderPayload,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          maxRedirects: 0, // Don't follow redirects - PayU returns 302 with JSON
          validateStatus: (status) => status === 200 || status === 201 || status === 302
        }
      );

      // PayU returns orderId and redirectUri in response body even with 302
      const data = response.data;
      console.log('✅ PayU order created:', data.orderId);

      return {
        success: true,
        orderId: data.orderId,
        extOrderId: orderPayload.extOrderId,
        redirectUri: data.redirectUri, // User should be redirected here
        status: data.status?.statusCode || 'SUCCESS',
        amount: orderData.amount,
        currency: 'PLN'
      };
    } catch (error) {
      console.error('❌ PayU order creation failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.status?.statusDesc || 'PayU order creation failed');
    }
  }

  /**
   * Create BLIK payment with code
   * 
   * @param {Object} orderData - Order details
   * @param {string} blikCode - 6-digit BLIK code from user's banking app
   */
  async createBlikPayment(orderData, blikCode) {
    const order = await this.createOrder({
      ...orderData,
      payMethod: 'blik'
    });

    // If BLIK code provided, authorize payment
    if (blikCode && blikCode.length === 6) {
      try {
        await axios.put(
          `${this.baseUrl}/api/v2_1/orders/${order.orderId}/status`,
          {
            orderId: order.orderId,
            orderStatus: 'PENDING',
            payMethod: {
              type: 'PBL',
              value: 'blik',
              blikCode: blikCode
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('✅ BLIK payment authorized');
        return { ...order, blikAuthorized: true };
      } catch (error) {
        console.error('❌ BLIK authorization failed:', error.response?.data);
        throw new Error('Invalid BLIK code or payment authorization failed');
      }
    }

    return order;
  }

  /**
   * Get order status
   * 
   * @param {string} orderId - PayU order ID
   */
  async getOrderStatus(orderId) {
    await this.authenticate();

    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v2_1/orders/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      return {
        orderId: response.data.orders[0].orderId,
        extOrderId: response.data.orders[0].extOrderId,
        status: response.data.orders[0].status,
        amount: parseInt(response.data.orders[0].totalAmount) / 100,
        currency: response.data.orders[0].currencyCode,
        customerEmail: response.data.orders[0].buyer.email
      };
    } catch (error) {
      console.error('❌ Failed to get PayU order status:', error.response?.data);
      throw new Error('Failed to retrieve order status');
    }
  }

  /**
   * Cancel (void) an order
   * SinglePlatform: DELETE /api/v2_1/orders/{orderId}
   * 
   * @param {string} orderId - PayU order ID
   */
  async cancelOrder(orderId) {
    await this.authenticate();

    try {
      const response = await axios.delete(
        `${this.baseUrl}/api/v2_1/orders/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ PayU order cancelled: ${orderId}`);

      return {
        success: true,
        orderId: response.data.orderId,
        extOrderId: response.data.extOrderId,
        status: response.data.status?.statusCode
      };
    } catch (error) {
      console.error('❌ Failed to cancel PayU order:', error.response?.data);
      throw new Error(error.response?.data?.status?.statusDesc || 'Failed to cancel order');
    }
  }

  /**
   * Verify PayU webhook notification signature
   * 
   * @param {Object} notification - Notification body from webhook
   * @param {string} signature - OpenPayu-Signature header
   */
  verifyNotification(notification, signature) {
    // Extract signature components
    // Format: signature=<hash>;algorithm=MD5|SHA256
    const signatureParts = signature.split(';');
    const receivedSignature = signatureParts[0].replace('signature=', '');
    const algorithm = signatureParts[1]?.replace('algorithm=', '') || 'MD5';

    // Concatenate notification JSON with second key (MD5)
    const payload = JSON.stringify(notification) + this.md5Key;

    // Calculate hash
    let calculatedSignature;
    if (algorithm === 'MD5') {
      calculatedSignature = crypto.createHash('md5').update(payload).digest('hex');
    } else if (algorithm.startsWith('SHA')) {
      calculatedSignature = crypto.createHash('sha256').update(payload).digest('hex');
    }

    const isValid = calculatedSignature === receivedSignature;
    
    if (!isValid) {
      console.error('❌ PayU notification signature mismatch');
      console.log('Received:', receivedSignature);
      console.log('Calculated:', calculatedSignature);
    }

    return isValid;
  }

  /**
   * Handle PayU webhook notification
   * 
   * @param {Object} notification - Notification body
   */
  async handleNotification(notification) {
    const order = notification.order;
    
    console.log(`📩 PayU notification: Order ${order.orderId} - Status: ${order.status}`);

    return {
      orderId: order.orderId,
      extOrderId: order.extOrderId,
      status: order.status, // PENDING, WAITING_FOR_CONFIRMATION, COMPLETED, CANCELED
      amount: parseInt(order.totalAmount) / 100,
      currency: order.currencyCode,
      customerEmail: order.buyer.email,
      payMethod: order.payMethod?.type
    };
  }

  /**
   * Refund an order
   * 
   * @param {string} orderId - PayU order ID
   * @param {number} amount - Amount to refund in PLN (optional, full refund if not specified)
   * @param {string} description - Refund description
   */
  async refundOrder(orderId, amount = null, description = 'Refund') {
    await this.authenticate();

    const orderStatus = await this.getOrderStatus(orderId);
    const refundAmount = amount ? Math.round(amount * 100).toString() : (orderStatus.amount * 100).toString();

    try {
      const response = await axios.post(
        `${this.baseUrl}/api/v2_1/orders/${orderId}/refunds`,
        {
          refund: {
            description: description,
            amount: refundAmount
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ PayU refund created:', response.data.refund.refundId);

      return {
        success: true,
        refundId: response.data.refund.refundId,
        orderId: orderId,
        amount: parseInt(refundAmount) / 100,
        status: response.data.refund.status
      };
    } catch (error) {
      console.error('❌ PayU refund failed:', error.response?.data);
      throw new Error('Refund failed');
    }
  }

  /**
   * Check if PayU is available (credentials configured)
   */
  isAvailable() {
    return !!(this.posId && this.clientSecret && this.md5Key);
  }

  /**
   * Get available payment methods from PayU API
   * This fetches actual enabled methods for your POS
   */
  async getPaymentMethodsFromAPI() {
    await this.authenticate();
    
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v2_1/paymethods?lang=pl`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const methods = [];
      
      // Add pay-by-link methods (bank transfers, BLIK, etc.)
      if (response.data.payByLinks && response.data.payByLinks.length > 0) {
        response.data.payByLinks.forEach(pbl => {
          if (pbl.status === 'ENABLED') {
            methods.push({
              code: pbl.value,
              name: pbl.name,
              brandImageUrl: pbl.brandImageUrl,
              minAmount: pbl.minAmount,
              maxAmount: pbl.maxAmount,
              type: 'PBL'
            });
          }
        });
      }
      
      // Add card tokens if any
      if (response.data.cardTokens && response.data.cardTokens.length > 0) {
        response.data.cardTokens.forEach(card => {
          if (card.status === 'ACTIVE') {
            methods.push({
              code: card.value,
              name: `${card.cardScheme} **** ${card.cardNumberMasked.slice(-4)}`,
              brandImageUrl: card.brandImageUrl,
              type: 'CARD_TOKEN'
            });
          }
        });
      }
      
      console.log(`✅ PayU API returned ${methods.length} payment methods`);
      return methods;
    } catch (error) {
      console.error('❌ Failed to fetch PayU payment methods:', error.response?.data || error.message);
      // Fall back to static methods if API fails
      return this.getPaymentMethods();
    }
  }

  /**
   * Get static payment methods for Polish market (fallback)
   * Use this when you know what methods should be available
   */
  getPaymentMethods() {
    return [
      {
        code: 'blik',
        name: 'BLIK',
        description: 'Instant payment via mobile banking app',
        fee: '1.5%',
        icon: '📱'
      },
      {
        code: 'c',
        name: 'Card Payment',
        description: 'Visa, Mastercard, Maestro',
        fee: '1.9%',
        icon: '💳'
      },
      {
        code: 't',
        name: 'Bank Transfer',
        description: '26 Polish banks',
        fee: '1.5%',
        icon: '🏦'
      },
      {
        code: 'ai',
        name: 'Installments (Raty PayU)',
        description: 'Pay in installments',
        fee: 'Varies',
        icon: '📅'
      }
    ];
  }
}

module.exports = new PayUService();
