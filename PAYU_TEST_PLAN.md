# 🧪 Test PayU Payment Flow - Step by Step

**Data**: 12 grudnia 2025  
**Cel**: Przetestować pełny flow subskrypcji z PayU po zalogowaniu Google  
**Status**: 🔄 READY TO TEST

---

## 📋 Pre-Test Checklist

Przed rozpoczęciem testu sprawdź:

- [x] OAuth Google naprawiony (sesja tworzona poprawnie)
- [x] Subscription API działający (`/api/subscriptions/plans`)
- [x] PayU credentials na Vercel (POS_ID, CLIENT_SECRET, MD5_KEY)
- [x] Database schema (4 tabele subskrypcji w produkcji)
- [x] Webhook endpoint (`/api/payments/webhooks/payu`)
- [ ] Google Console redirect URI dodany (`https://haos.fm/auth/google/callback`)
- [ ] Vercel deployment zakończony

---

## 🎯 Test Flow

### Krok 1: Google Login ✅
**Cel**: Zaloguj się przez Google i sprawdź czy sesja się utrzymuje

1. **Otwórz**: https://haos.fm/login.html
2. **Kliknij**: "Continue with Google"
3. **Zaloguj się** przez Google
4. **Sprawdź**:
   - ✅ Popup zamyka się automatycznie
   - ✅ Nie redirectuje z powrotem do login page
   - ✅ Jesteś zalogowany (sprawdź przez /account.html)

**Test command**:
```bash
# Po zalogowaniu sprawdź sesję
curl -s https://haos.fm/api/auth/me --cookie "haos_session=YOUR_SESSION_ID" | jq
```

**Expected**: `authenticated: true`, `user: {...}`

---

### Krok 2: Subscription Page 📋
**Cel**: Sprawdź czy strona subskrypcji pokazuje plany

1. **Otwórz**: https://haos.fm/subscription.html
2. **Sprawdź**:
   - ✅ Widzisz 4 plany (Free, Basic, Premium, Pro)
   - ✅ Ceny są poprawne (19.99, 49.99, 99.99 PLN)
   - ✅ Nie widzisz "Sign In Required" prompt
   - ✅ Przycisk "Proceed to Checkout" jest aktywny

**Test command**:
```bash
# Sprawdź czy API zwraca plany
curl -s https://haos.fm/api/subscriptions/plans | jq '.plans[].name'
```

**Expected**: `"Free"`, `"Basic"`, `"Premium"`, `"Pro"`

---

### Krok 3: Wybór Planu 💳
**Cel**: Wybierz plan Basic i przejdź do checkout

1. **Na stronie subscription.html**:
   - Wybierz plan: **Basic** (19.99 PLN/miesiąc)
   - Billing cycle: **Monthly**
   - Payment method: **PayU** (powinien być pre-selected)

2. **Kliknij**: "Proceed to Checkout"

3. **Sprawdź**:
   - ✅ Przycisk zmienia się na "Processing..."
   - ✅ Pojawia się redirect do PayU
   - ✅ URL zaczyna się od `https://secure.payu.com/...`

**Debug**:
Jeśli nie działa, otwórz Console (F12) i sprawdź błędy

---

### Krok 4: PayU Payment Gateway 💰
**Cel**: Przeprowadź płatność na stronie PayU

1. **Na stronie PayU**:
   - Kwota: **19.99 PLN**
   - Opis: "HAOS.fm Basic - Monthly Subscription"
   - Seller: POS ID 4417691

2. **Wybierz metodę płatności**:
   - **Karta** (test): `4444 3333 2222 1111`, CVV: `123`
   - **BLIK** (tylko real): Kod z aplikacji bankowej
   - **Przelew**: Wybierz bank testowy

3. **Dokończ płatność**

4. **Sprawdź**:
   - ✅ PayU potwierdza płatność
   - ✅ Redirectuje z powrotem do haos.fm
   - ✅ Widzisz "Subscription Success" page

**Notes**:
- W trybie production: prawdziwa płatność
- W trybie sandbox: użyj test cards

---

### Krok 5: Webhook Processing 🔔
**Cel**: Sprawdź czy webhook PayU aktywował subskrypcję

**Automatyczne** (PayU wyśle webhook w 1-30 sekund po płatności):

**Monitor logs**:
```bash
# Sprawdź Vercel logs dla webhook calls
vercel logs --follow
```

**Szukaj**:
```
📩 PayU notification: Order ABC123 - Status: COMPLETED
✅ PayU payment COMPLETED for user: YOUR_USER_ID
🎉 Subscription 'basic' activated for user: YOUR_USER_ID
```

**Test command**:
```bash
# Sprawdź czy subskrypcja została utworzona
curl -s https://haos.fm/api/subscriptions/current \
  --cookie "haos_session=YOUR_SESSION_ID" | jq
```

**Expected**:
```json
{
  "success": true,
  "subscription": {
    "plan_code": "basic",
    "status": "active",
    "trial_days": 7,
    "current_period_end": "2026-01-12..."
  }
}
```

---

### Krok 6: Weryfikacja Subskrypcji ✅
**Cel**: Sprawdź czy subskrypcja działa w aplikacji

1. **Sprawdź Dashboard**:
   - Otwórz: https://haos.fm/account.html
   - Powinieneś widzieć: **"Basic Plan - Active"**

2. **Sprawdź Features**:
   - 25 tracks limit (zamiast 3 dla free)
   - Export WAV enabled
   - 1GB cloud storage

3. **Test Database**:
```bash
# Sprawdź w bazie danych (local)
psql $DATABASE_URL -c "
  SELECT plan_code, status, billing_cycle, 
         current_period_start, current_period_end, trial_end 
  FROM user_subscriptions 
  WHERE user_id = YOUR_USER_ID;
"
```

**Expected**:
```
 plan_code | status | billing_cycle | current_period_start | current_period_end | trial_end  
-----------+--------+---------------+---------------------+--------------------+------------
 basic     | active | monthly       | 2025-12-12 ...      | 2026-01-12 ...     | 2025-12-19
```

---

## 🐛 Troubleshooting

### Problem A: OAuth redirect loop
**Symptom**: Po Google login wraca do login page  
**Fix**: ✅ NAPRAWIONE - deployed

### Problem B: "Authentication required" na subscription page
**Symptom**: Strona wymaga logowania mimo zalogowania  
**Solution**: Sprawdź cookies - czy `haos_session` jest ustawiony

### Problem C: "Failed to create subscription"
**Symptom**: Błąd po kliknięciu "Proceed to Checkout"  
**Możliwe przyczyny**:
1. User nie jest zalogowany (sprawdź `/api/auth/me`)
2. PayU credentials nie są ustawione na Vercel
3. Błąd w PayU API (sprawdź console logs)

**Debug**:
```bash
# Sprawdź PayU endpoint
curl -X POST https://haos.fm/api/subscriptions/subscribe \
  -H "Content-Type: application/json" \
  -H "Cookie: haos_session=YOUR_SESSION" \
  -d '{"planCode":"basic","billingCycle":"monthly","provider":"payu"}'
```

### Problem D: PayU redirect nie działa
**Symptom**: Brak redirectu do PayU po checkout  
**Solution**: 
1. Sprawdź response z `/api/subscriptions/subscribe`
2. Powinien zawierać `redirectUri`
3. Sprawdź console (F12) czy są błędy JavaScript

### Problem E: Webhook nie aktywuje subskrypcji
**Symptom**: Płatność przeszła, ale brak subskrypcji  
**Solution**:
1. Sprawdź Vercel logs - czy webhook został wywołany
2. Sprawdź signature verification - czy MD5 key jest poprawny
3. Sprawdź `user_id` extraction z `extOrderId`

**Debug webhook locally**:
```bash
# Symuluj webhook call
curl -X POST http://localhost:3000/api/payments/webhooks/payu \
  -H "Content-Type: application/json" \
  -H "OpenPayU-Signature: signature=test;algorithm=MD5" \
  -d '{
    "order": {
      "orderId": "TEST123",
      "extOrderId": "HAOS_YOUR_USER_ID_123456",
      "status": "COMPLETED",
      "totalAmount": "1999",
      "currencyCode": "PLN"
    }
  }'
```

---

## 📊 Success Criteria

Test jest **SUCCESSFUL** gdy:

- ✅ Google login działa (sesja się utrzymuje)
- ✅ Subscription page pokazuje plany
- ✅ Checkout redirect do PayU
- ✅ Płatność przechodzi na PayU
- ✅ Webhook aktywuje subskrypcję
- ✅ `/api/subscriptions/current` zwraca active subscription
- ✅ Account page pokazuje Basic plan
- ✅ Features są aktywowane (25 tracks, WAV export)

---

## 📝 Test Results Template

```markdown
## Test Results - [Data]

### Test 1: Google Login
- Status: ✅ / ❌
- Notes: ...

### Test 2: Subscription Page
- Status: ✅ / ❌
- Plans visible: Yes/No
- Notes: ...

### Test 3: Checkout
- Status: ✅ / ❌
- PayU redirect: Yes/No
- Notes: ...

### Test 4: Payment
- Status: ✅ / ❌
- Amount: 19.99 PLN
- Payment method: Card/BLIK/Bank
- Notes: ...

### Test 5: Webhook
- Status: ✅ / ❌
- Webhook received: Yes/No
- Subscription activated: Yes/No
- Notes: ...

### Test 6: Verification
- Status: ✅ / ❌
- Dashboard shows plan: Yes/No
- Features working: Yes/No
- Notes: ...

### Overall Result
- ✅ SUCCESS / ❌ FAILED
- Issues found: ...
- Next steps: ...
```

---

## 🔗 Quick Links

- **Login**: https://haos.fm/login.html
- **Subscription**: https://haos.fm/subscription.html
- **Account**: https://haos.fm/account.html
- **Test OAuth**: https://haos.fm/test-oauth.html
- **Vercel Dashboard**: https://vercel.com/kozuchowskihubert/azure-psql-app
- **Google Console**: https://console.cloud.google.com/

---

**Last Updated**: 12 grudnia 2025  
**Next**: Rozpocznij test od Kroku 1! 🚀
