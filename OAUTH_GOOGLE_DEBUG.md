# 🔐 OAuth Google - Diagnostic Report

**Data**: 12 grudnia 2025  
**Problem**: OAuth Google nie działa  
**Status**: 🔍 DEBUGGING IN PROGRESS

---

## ✅ Sprawdzone - Działa Prawidłowo

### 1. **Backend Endpoints** ✅
```bash
# Endpoint istnieje i redirectuje do Google
curl -I https://haos.fm/auth/google
# HTTP/2 302 
# location: https://accounts.google.com/o/oauth2/v2/auth?...
```

### 2. **Passport Configuration** ✅
- `passport-google-oauth20` zainstalowany
- GoogleStrategy skonfigurowany w `/app/auth/social-auth.js`
- Callbacks poprawnie ustawione w `/app/auth/core-auth-routes.js`
- Routes zamontowane pod `/auth` w `app.js`

### 3. **Environment Variables** ✅
- `GOOGLE_CLIENT_ID` - ustawione ✅
- `GOOGLE_CLIENT_SECRET` - ustawione ✅
- Callback URL: `${APP_URL}/auth/google/callback`

### 4. **Frontend Components** ✅
- `auth-manager.js` załadowany w `login.html`
- `window.HAOSAuth.loginWithGoogle()` dostępne
- Popup logic zaimplementowany

---

## 🔍 Co Sprawdzić Dalej

### A. **Popup Blocker** 🚫
Przeglądarki często blokują popupy. Sprawdź:
1. Czy użytkownik pozwolił na popupy dla haos.fm
2. Czy popup się otwiera (console log)
3. Czy jest komunikat o zablokowaniu

### B. **Google Console Configuration** 🔧
Sprawdź Google Cloud Console:
1. Czy `haos.fm` jest w "Authorized JavaScript origins"
2. Czy `/auth/google/callback` jest w "Authorized redirect URIs"
3. Czy OAuth Consent Screen jest skonfigurowany

### C. **Production Environment Variables** 🌐
Sprawdź Vercel Environment Variables:
```bash
GOOGLE_CLIENT_ID=***
GOOGLE_CLIENT_SECRET=***
APP_URL=https://haos.fm
```

### D. **CORS i Security Headers** 🔒
Sprawdź headers w callback:
- `Cross-Origin-Opener-Policy: same-origin`
- Może blokować popup communication

---

## 🧪 Test Tools

### Strona Testowa
```
http://localhost:3000/test-oauth.html (local)
https://haos.fm/test-oauth.html (production)
```

**4 Testy:**
1. ✅ Test endpoint accessibility
2. ✅ Test popup opening
3. ✅ Test full OAuth flow
4. ✅ Test session checking

### Manual Console Test
```javascript
// W konsoli przeglądarki:

// Test 1: Czy HAOSAuth istnieje
console.log(window.HAOSAuth);

// Test 2: Otwórz popup
const popup = window.open('/auth/google', 'test', 'width=600,height=700');
console.log('Popup:', popup);

// Test 3: Sprawdź czy popup się otworzył
setTimeout(() => console.log('Closed:', popup.closed), 2000);

// Test 4: Po zamknięciu sprawdź token
console.log('Token:', localStorage.getItem('haos_token'));
```

---

## 📝 Flow Diagram

```
User clicks "Login with Google"
    ↓
loginWithGoogle() called
    ↓
window.open('/auth/google', popup)
    ↓
Browser: Popup blocked? → Show warning
    ↓
Popup opens → /auth/google
    ↓
Passport redirects → https://accounts.google.com/...
    ↓
User authenticates on Google
    ↓
Google redirects back → /auth/google/callback
    ↓
Passport processes callback → findOrCreateUser()
    ↓
handleOAuthSuccess() → Inject HTML with tokens
    ↓
Popup: localStorage.setItem('haos_token', ...)
    ↓
Popup: window.opener.postMessage({type: 'oauth-success'})
    ↓
Popup: window.close()
    ↓
Main window: Receives postMessage
    ↓
Main window: checkSession() → /api/auth/me
    ↓
✅ User authenticated!
```

---

## 🐛 Możliwe Problemy

### 1. **Popup Blocker**
**Symptom**: Nic się nie dzieje po kliknięciu  
**Solution**: Instrukcja dla użytkownika jak odblokować popupy

### 2. **Google Consent Screen**
**Symptom**: Popup pokazuje błąd "Access blocked"  
**Solution**: Skonfiguruj OAuth consent screen w Google Cloud Console

### 3. **Redirect URI Mismatch**
**Symptom**: Google pokazuje błąd "redirect_uri_mismatch"  
**Solution**: Dodaj dokładny URL do Google Console

### 4. **Session/Cookie Issues**
**Symptom**: Callback działa, ale sesja nie jest zachowana  
**Solution**: Sprawdź cookies i localStorage

### 5. **CORS/Opener Policy**
**Symptom**: Popup nie może komunikować z parent window  
**Solution**: Sprawdź `Cross-Origin-Opener-Policy` header

---

## ✅ Next Steps

1. **Otwórz test page**: https://haos.fm/test-oauth.html
2. **Uruchom Test 2**: "Open OAuth Popup" - sprawdź czy popup się otwiera
3. **Jeśli popup się otwiera**: 
   - Sprawdź czy Google pokazuje login screen
   - Zaloguj się i zobacz co się dzieje po powrocie
4. **Jeśli popup jest blokowany**:
   - Sprawdź console (F12) czy jest komunikat o blokowaniu
   - Odblokuj popupy w ustawieniach przeglądarki
5. **Jeśli Google pokazuje błąd**:
   - Sprawdź redirect URI w Google Console
   - Dodaj wszystkie warianty: http://localhost:3000, https://haos.fm

---

## 📚 Useful Links

- **Google OAuth Docs**: https://developers.google.com/identity/protocols/oauth2
- **Passport Google Strategy**: https://www.passportjs.org/packages/passport-google-oauth20/
- **Google Cloud Console**: https://console.cloud.google.com/

---

**Status**: Infrastruktura działa ✅  
**Następny krok**: Diagnoza z test page 🧪  
**ETA**: Powinno działać po odblokow popupów lub naprawieniu Google Console config
