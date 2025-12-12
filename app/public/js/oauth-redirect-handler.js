/**
 * OAuth Redirect Handler
 * Processes OAuth callback tokens from URL parameters
 */

(function() {
  'use strict';

  // Check for OAuth tokens in URL (from redirect)
  const urlParams = new URLSearchParams(window.location.search);
  const tokensParam = urlParams.get('tokens');
  
  if (tokensParam) {
    try {
      const tokenData = JSON.parse(decodeURIComponent(tokensParam));
      
      // Store tokens in localStorage for backwards compatibility
      if (tokenData.accessToken) {
        localStorage.setItem('haos_token', tokenData.accessToken);
      }
      if (tokenData.refreshToken) {
        localStorage.setItem('haos_refresh_token', tokenData.refreshToken);
      }
      if (tokenData.user) {
        localStorage.setItem('haos_user', JSON.stringify(tokenData.user));
      }
      
      console.log('[OAuth] Tokens stored from redirect');
      
      // Clean up URL (remove tokens parameter)
      const cleanUrl = window.location.pathname + '?login=success';
      window.history.replaceState({}, document.title, cleanUrl);
      
    } catch (error) {
      console.error('[OAuth] Failed to process tokens:', error);
    }
  }
  
  // Check for login success message
  if (urlParams.get('login') === 'success') {
    // Show success notification (if you have a notification system)
    console.log('[OAuth] ✅ Login successful!');
    
    // Trigger auth check
    if (window.HAOSAuth) {
      window.HAOSAuth.checkSession();
    }
  }
})();
