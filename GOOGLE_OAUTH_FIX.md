# 🔴 GOOGLE OAUTH FIX - redirect_uri_mismatch

**Błąd**: `Błąd 400: redirect_uri_mismatch`  
**Przyczyna**: Redirect URI nie jest autoryzowany w Google Cloud Console  
**Rozwiązanie**: Dodaj poprawne URI do Google Console

---

## ✅ Szybkie Rozwiązanie (5 minut)

### Krok 1: Otwórz Google Cloud Console

1. Idź do: https://console.cloud.google.com/
2. Zaloguj się jako `hubertkozuchowski@gmail.com`
3. Wybierz projekt HAOS.fm (lub projekt z OAuth credentials)

### Krok 2: Znajdź OAuth Credentials

1. Nawigacja: **APIs & Services** → **Credentials**
2. Znajdź w sekcji "OAuth 2.0 Client IDs"
3. Kliknij na nazwę klienta (np. "HAOS.fm Web Client")

### Krok 3: Dodaj Authorized Redirect URIs

W sekcji **"Authorized redirect URIs"** dodaj:

```
https://haos.fm/auth/google/callback
```

**⚠️ WAŻNE**: Musi być dokładnie ten URL, bez żadnych dodatkowych znaków!

### Krok 4: Dodaj Authorized JavaScript Origins

W sekcji **"Authorized JavaScript origins"** dodaj:

```
https://haos.fm
```

### Krok 5: (Opcjonalnie) Dodaj localhost dla testów

Jeśli chcesz testować lokalnie, dodaj też:

**Authorized JavaScript origins:**
```
http://localhost:3000
```

**Authorized redirect URIs:**
```
http://localhost:3000/auth/google/callback
```

### Krok 6: Zapisz Zmiany

1. Kliknij **"SAVE"** na dole strony
2. Zmiany mogą potrwać 5-30 minut (zazwyczaj natychmiastowo)

---

## 🔍 Weryfikacja

### Test 1: Sprawdź czy redirect URI jest poprawny
```bash
# Powinien pokazać: redirect_uri=https%3A%2F%2Fhaos.fm%2Fauth%2Fgoogle%2Fcallback
curl -sI "https://haos.fm/auth/google" | grep -i location
```

### Test 2: Przetestuj OAuth flow
1. Otwórz: https://haos.fm/login.html
2. Kliknij "Continue with Google"
3. Popup powinien otworzyć Google login (bez błędu 400)

### Test 3: Użyj test page
1. Otwórz: https://haos.fm/test-oauth.html
2. Kliknij "Test 2: Open OAuth Popup"
3. Sprawdź czy popup przekierowuje do Google (bez błędu)

---

## 📋 Checklist - Co Dodać Do Google Console

- [ ] **Authorized JavaScript origins:**
  - [ ] `https://haos.fm`
  - [ ] `http://localhost:3000` (opcjonalnie dla testów)

- [ ] **Authorized redirect URIs:**
  - [ ] `https://haos.fm/auth/google/callback`
  - [ ] `http://localhost:3000/auth/google/callback` (opcjonalnie)

- [ ] **OAuth Consent Screen:**
  - [ ] App name: "HAOS.fm"
  - [ ] User support email: `hubertkozuchowski@gmail.com`
  - [ ] Developer contact: `hubertkozuchowski@gmail.com`
  - [ ] Scopes: `email`, `profile`, `openid`

---

## 🎯 Oczekiwany Wynik

Po dodaniu redirect URI:

1. ✅ Popup otwiera się do `/auth/google`
2. ✅ Google redirectuje do swojego login screen
3. ✅ Po zalogowaniu Google redirectuje z powrotem do `https://haos.fm/auth/google/callback`
4. ✅ Callback przetwarza dane i zamyka popup
5. ✅ Token zapisany w localStorage
6. ✅ Użytkownik zalogowany!

---

## 🐛 Jeśli Nadal Nie Działa

### Problem A: Nadal błąd 400
- **Sprawdź**: Czy dokładnie skopiowałeś URL (bez spacji, bez slash na końcu)
- **Rozwiązanie**: Skasuj i dodaj ponownie redirect URI

### Problem B: Inne błędy OAuth
- **Sprawdź**: OAuth Consent Screen - musi być skonfigurowany
- **Rozwiązanie**: Uzupełnij wszystkie wymagane pola w Consent Screen

### Problem C: "Access blocked: Authorization Error"
- **Sprawdź**: Status aplikacji - czy jest "In production" czy "Testing"
- **Rozwiązanie**: 
  - Jeśli "Testing" - dodaj swój email do Test users
  - Jeśli chcesz publicznie - zmień na "In production" (wymaga weryfikacji)

### Problem D: Popup się nie otwiera
- **Sprawdź**: Console browser (F12) - czy jest błąd popup blocked
- **Rozwiązanie**: Odblokuj popupy w ustawieniach przeglądarki

---

## 📸 Zrzuty Ekranu - Gdzie Co Jest

### 1. Google Cloud Console - Credentials
```
APIs & Services → Credentials → OAuth 2.0 Client IDs
```

### 2. Edit OAuth Client
```
Click on client name → Edit button (pencil icon)
```

### 3. Authorized redirect URIs section
```
Scroll down → "Authorized redirect URIs" → + ADD URI
```

### 4. Save
```
Scroll to bottom → SAVE button
```

---

## 🔗 Useful Links

- **Google Cloud Console**: https://console.cloud.google.com/
- **OAuth 2.0 Playground**: https://developers.google.com/oauthplayground/
- **Passport Google OAuth Docs**: https://www.passportjs.org/packages/passport-google-oauth20/

---

## ✅ Po Naprawie

1. **Przetestuj login**: https://haos.fm/login.html
2. **Przetestuj subscription**: https://haos.fm/subscription.html
3. **Sprawdź czy sesja działa**: https://haos.fm/account.html

---

**Czas naprawy**: ~5 minut  
**Trudność**: Łatwa (konfiguracja w Google Console)  
**Status**: Czekamy na dodanie redirect URI w Google Console 🔧
