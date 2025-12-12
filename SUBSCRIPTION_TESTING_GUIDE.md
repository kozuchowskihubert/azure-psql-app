# 🧪 HAOS.fm Subscription System - Testing Guide

**Status**: ✅ All infrastructure deployed and working  
**Date**: 12 grudnia 2025  
**Environment**: Production (https://haos.fm)

---

## 🎯 System Overview

### Available Subscription Plans

| Plan | Monthly | Yearly | Features |
|------|---------|--------|----------|
| **Free** | 0 PLN | 0 PLN | 3 tracks, 10 presets, mp3 export, 100MB storage |
| **Basic** | 19.99 PLN | 199.90 PLN | 25 tracks, 100 presets, mp3+wav export, 1GB storage |
| **Premium** | 49.99 PLN | 499.90 PLN | Unlimited tracks/presets, all formats, 10GB storage |
| **Pro** | 99.99 PLN | 999.90 PLN | Everything + stems export, priority support, 100GB storage |

### Payment Provider

- **PayU** (Production Mode)
- POS ID: `4417691`
- Webhook URL: `https://haos.fm/api/payments/webhooks/payu`
- OAuth 2.0 authentication

---

## 📋 Testing Checklist

### ✅ Phase 1: API Endpoints (COMPLETED)

- [x] **GET /api/subscriptions/plans** - Returns all 4 plans with formatted prices
- [x] **GET /api/subscriptions/providers** - Returns available payment providers
- [x] **POST /api/payments/webhooks/payu** - Accepts PayU notifications (requires signature)

**Test Results:**
```bash
# Plans endpoint
curl https://haos.fm/api/subscriptions/plans | jq '.plans[].name'
# Returns: "Free", "Basic", "Premium", "Pro" ✅

# Webhook endpoint (correctly rejects unsigned requests)
curl -X POST https://haos.fm/api/payments/webhooks/payu -d '{}'
# Returns: {"error": "Missing signature header"} ✅
```

---

### 🔄 Phase 2: Subscription Purchase Flow (TO TEST)

#### Step 1: User Authentication Required

The `/api/subscriptions/subscribe` endpoint requires authentication:

```javascript
// Endpoint expects req.user.id from session/JWT
requireAuth middleware checks for authenticated user
```

**To Test:**
1. Create test user account on https://haos.fm
2. Login and obtain session cookie or JWT token
3. Use authenticated request for subscription

#### Step 2: Create Subscription Request

**Endpoint**: `POST /api/subscriptions/subscribe`

**Request Body**:
```json
{
  "planCode": "basic",
  "billingCycle": "monthly",
  "provider": "payu"
}
```

**Expected Response**:
```json
{
  "success": true,
  "provider": "payu",
  "orderId": "ABC123...",
  "redirectUri": "https://secure.payu.com/...",
  "extOrderId": "HAOS_userId_timestamp"
}
```

**Test Plans**:
- [ ] Subscribe to `basic` plan (monthly)
- [ ] Subscribe to `premium` plan (yearly) 
- [ ] Subscribe to `pro` plan (monthly)
- [ ] Try subscribing to `free` plan (should succeed without PayU)

#### Step 3: PayU Payment Redirect

1. Frontend should redirect user to `redirectUri` from response
2. User completes payment on PayU gateway
3. PayU redirects back to `continueUrl` or `notifyUrl`

**PayU Test Cards** (Sandbox):
```
Card Number: 4444 3333 2222 1111
CVV: 123
Expiry: Any future date
```

#### Step 4: Webhook Processing

When payment completes, PayU sends notification to:
```
POST https://haos.fm/api/payments/webhooks/payu
```

**Webhook Headers**:
```
Content-Type: application/json
OpenPayU-Signature: signature=ABC123...;algorithm=MD5
```

**Webhook Body**:
```json
{
  "order": {
    "orderId": "ABC123",
    "extOrderId": "HAOS_userId_12345",
    "status": "COMPLETED",
    "totalAmount": "1999",
    "currencyCode": "PLN",
    "buyer": {
      "email": "user@example.com"
    }
  }
}
```

**Processing Logic**:
1. ✅ Verify signature using MD5 key
2. ✅ Extract `userId` from `extOrderId` (format: `HAOS_{userId}_{timestamp}`)
3. ✅ Update transaction status in database
4. ✅ Create subscription record for user
5. ✅ Activate plan features

**Test Cases**:
- [ ] Test with `status: "COMPLETED"` → Should activate subscription
- [ ] Test with `status: "PENDING"` → Should keep pending
- [ ] Test with `status: "CANCELED"` → Should mark failed
- [ ] Test invalid signature → Should reject (400 error)

#### Step 5: Subscription Verification

**Endpoint**: `GET /api/subscriptions/current` (requires auth)

**Expected Response** (after successful payment):
```json
{
  "success": true,
  "subscription": {
    "id": 123,
    "user_id": 456,
    "plan_code": "basic",
    "plan_name": "Basic",
    "status": "active",
    "billing_cycle": "monthly",
    "current_period_start": "2025-12-12T00:00:00Z",
    "current_period_end": "2026-01-12T00:00:00Z",
    "trial_end": "2025-12-19T00:00:00Z",
    "features": {
      "max_tracks": 25,
      "max_presets": 100,
      "export_formats": ["mp3", "wav"]
    }
  },
  "features": {
    "canCreateTracks": true,
    "canExport": true,
    "remainingTracks": 25
  }
}
```

**Test Cases**:
- [ ] Check subscription status after payment
- [ ] Verify trial period (7 days for Basic, 14 for Premium, 30 for Pro)
- [ ] Verify features are correctly applied
- [ ] Test feature limits (max_tracks, max_presets)

---

### 🔧 Phase 3: Subscription Management (TO TEST)

#### Cancel Subscription

**Endpoint**: `POST /api/subscriptions/cancel` (requires auth)

**Request Body**:
```json
{
  "immediate": false,
  "reason": "Too expensive"
}
```

**Expected Behavior**:
- `immediate: false` → Cancel at end of billing period
- `immediate: true` → Cancel immediately

**Test Cases**:
- [ ] Cancel with `immediate: false` → Should set `cancel_at_period_end`
- [ ] Cancel with `immediate: true` → Should deactivate immediately
- [ ] Try canceling Free plan → Should work without issues

#### Upgrade/Downgrade Plan

**Endpoint**: `POST /api/subscriptions/upgrade` (TO BE IMPLEMENTED)

**Request Body**:
```json
{
  "newPlanCode": "premium",
  "billingCycle": "yearly"
}
```

**Expected Behavior**:
- Calculate prorated amount
- Create PayU order for difference
- Update subscription on payment completion

---

## 🧪 Manual Testing Steps

### Quick Test Flow (5 minutes)

1. **Verify Plans API**:
   ```bash
   curl https://haos.fm/api/subscriptions/plans | jq '.plans[].name'
   ```

2. **Create Test User**:
   - Visit https://haos.fm/register
   - Create account: `test@example.com`
   - Login and note session cookie

3. **Subscribe to Basic Plan**:
   ```bash
   curl -X POST https://haos.fm/api/subscriptions/subscribe \
     -H "Cookie: connect.sid=YOUR_SESSION_COOKIE" \
     -H "Content-Type: application/json" \
     -d '{"planCode": "basic", "billingCycle": "monthly", "provider": "payu"}'
   ```

4. **Complete Payment**:
   - Copy `redirectUri` from response
   - Open in browser
   - Complete test payment on PayU

5. **Wait for Webhook** (30 seconds):
   - PayU sends notification
   - Check server logs: `heroku logs --tail -a haos-fm`
   - Look for: `✅ PayU payment COMPLETED` and `🎉 Subscription activated`

6. **Verify Subscription**:
   ```bash
   curl https://haos.fm/api/subscriptions/current \
     -H "Cookie: connect.sid=YOUR_SESSION_COOKIE"
   ```

### Full End-to-End Test (30 minutes)

1. Test all 4 plans (Free, Basic, Premium, Pro)
2. Test both billing cycles (monthly, yearly)
3. Test subscription cancellation
4. Test subscription features enforcement
5. Test webhook with different statuses
6. Test invalid signatures and error cases

---

## 🐛 Debugging Tools

### Check Database Directly

```bash
# Connect to production database
psql $DATABASE_URL

# Check subscription plans
SELECT * FROM subscription_plans;

# Check active subscriptions
SELECT * FROM user_subscriptions WHERE status = 'active';

# Check recent transactions
SELECT * FROM transactions WHERE provider = 'payu' ORDER BY created_at DESC LIMIT 10;
```

### Monitor Webhook Calls

```bash
# Watch server logs for PayU webhooks
heroku logs --tail -a haos-fm | grep "PayU"

# Look for these messages:
# 📩 PayU notification: Order ABC123 - Status: COMPLETED
# ✅ PayU payment COMPLETED for user: 123
# 🎉 Subscription 'basic' activated for user: 123
```

### Test Webhook Signature

PayU signature format:
```
OpenPayU-Signature: signature=ABC123...;algorithm=MD5
```

Signature calculation:
```javascript
const crypto = require('crypto');
const signature = crypto
  .createHash('md5')
  .update(JSON.stringify(notification) + MD5_KEY)
  .digest('hex');
```

---

## 📊 Success Metrics

After testing, verify:

- [ ] **API Response Time**: < 500ms for plan listings
- [ ] **Payment Success Rate**: > 95% (excluding user cancellations)
- [ ] **Webhook Processing**: < 2 seconds from PayU notification to subscription activation
- [ ] **Error Rate**: < 1% for valid requests
- [ ] **Database Integrity**: No orphaned records, all foreign keys valid

---

## 🚨 Known Issues & Limitations

1. **No Refund UI**: Refunds require manual API call or PayU dashboard
2. **No Subscription History**: Only current subscription visible to user
3. **No Email Notifications**: No confirmation emails after subscription changes
4. **Single Active Subscription**: Users can't have multiple simultaneous paid plans
5. **No Proration**: Upgrades/downgrades require manual calculation

---

## 📝 Test Data

### Test Users (To Create)

| Email | Password | Purpose |
|-------|----------|---------|
| test-free@haos.fm | Test123! | Test free plan |
| test-basic@haos.fm | Test123! | Test basic monthly |
| test-premium@haos.fm | Test123! | Test premium yearly |
| test-pro@haos.fm | Test123! | Test pro plan |

### Test Transactions (Expected After Testing)

| User | Plan | Amount | Status | Notes |
|------|------|--------|--------|-------|
| test-basic | basic | 19.99 PLN | completed | Trial: 7 days |
| test-premium | premium | 499.90 PLN | completed | Yearly, Trial: 14 days |
| test-pro | pro | 99.99 PLN | completed | Trial: 30 days |

---

## 🔗 Related Documentation

- [PayU Integration Complete](./PAYU_INTEGRATION_COMPLETE.md)
- [PayU Webhook Setup Guide](./PAYU_WEBHOOK_SETUP_GUIDE.md)
- [PayU Production Checklist](./PAYU_PRODUCTION_CHECKLIST.md)
- [Subscription Routes](./app/routes/subscription-routes.js)
- [PayU Service](./app/services/payu-service.js)

---

## ✅ Next Steps

1. **Manual Testing**: Complete Phase 2 testing (subscription purchase flow)
2. **Frontend Integration**: Build subscription selection UI
3. **Email Notifications**: Add confirmation emails for subscription events
4. **Admin Dashboard**: Build UI to manage subscriptions, refunds, etc.
5. **Analytics**: Add tracking for subscription conversions and churn

---

**Last Updated**: 12 grudnia 2025  
**Tested By**: _Awaiting manual testing_  
**Status**: Infrastructure complete, ready for end-to-end testing
