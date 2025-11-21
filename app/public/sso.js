// =============================================================================
// Single Sign-On (SSO) Client-Side Implementation
// =============================================================================
// This is a placeholder implementation for SSO authentication.
// Backend OAuth integration required for production use.
//
// Environment Variables Needed:
//   - ENABLE_SSO=true
//   - GOOGLE_CLIENT_ID=your_google_client_id
//   - MICROSOFT_CLIENT_ID=your_microsoft_client_id
//   - GITHUB_CLIENT_ID=your_github_client_id
//   - JWT_SECRET=your_jwt_secret
// =============================================================================

const SSO_CONFIG = {
    google: {
        name: 'Google',
        authUrl: '/api/auth/google',
        icon: 'google',
        color: '#4285F4',
    },
    microsoft: {
        name: 'Microsoft',
        authUrl: '/api/auth/microsoft',
        icon: 'microsoft',
        color: '#00A4EF',
    },
    github: {
        name: 'GitHub',
        authUrl: '/api/auth/github',
        icon: 'github',
        color: '#333333',
    },
};

// Check session on page load
document.addEventListener('DOMContentLoaded', () => {
    checkExistingSession();
    setupFormHandlers();
});

/**
 * Check if user has active session
 */
function checkExistingSession() {
    const session = getSessionFromStorage();
    if (session && !isSessionExpired(session)) {
        displaySessionPanel(session);
    }
}

/**
 * Handle SSO provider login
 */
async function handleSSOLogin(provider) {
    showLoading(`Connecting to ${SSO_CONFIG[provider].name}...`);

    try {
        // In production, this would redirect to OAuth provider
        const response = await fetch(`${window.location.origin}${SSO_CONFIG[provider].authUrl}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ provider }),
        });

        if (response.status === 404 || !response.ok) {
            // Backend not configured, show demo mode
            setTimeout(() => {
                hideLoading();
                simulateSuccessfulLogin(provider);
            }, 1500);
        } else {
            // Backend available, handle OAuth flow
            const data = await response.json();
            if (data.authUrl) {
                window.location.href = data.authUrl;
            } else {
                createSession(data.user, provider);
                displaySessionPanel({ provider, user: data.user });
            }
            hideLoading();
        }
    } catch (error) {
        hideLoading();
        console.log('SSO backend not configured, using demo mode');
        setTimeout(() => simulateSuccessfulLogin(provider), 1000);
    }
}

/**
 * Simulate successful login (demo mode)
 */
function simulateSuccessfulLogin(provider) {
    const demoUser = {
        email: `demo.user@${provider}.com`,
        name: `Demo User (${SSO_CONFIG[provider].name})`,
        picture: `https://ui-avatars.com/api/?name=Demo+User&background=random`,
        provider,
    };

    createSession(demoUser, provider);
    displaySessionPanel({ provider, user: demoUser });

    showToast(`✅ Demo login successful! (SSO backend not configured)`, 'success');
}

/**
 * Handle email/password login
 */
document.getElementById('email-login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    showLoading('Signing in...');

    try {
        const response = await fetch(`${window.location.origin}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (response.status === 404 || !response.ok) {
            // Backend not configured
            setTimeout(() => {
                hideLoading();
                simulateEmailLogin(email);
            }, 1500);
        } else {
            const data = await response.json();
            createSession(data.user, 'email');
            displaySessionPanel({ provider: 'email', user: data.user });
            hideLoading();
        }
    } catch (error) {
        hideLoading();
        setTimeout(() => simulateEmailLogin(email), 1000);
    }
});

/**
 * Simulate email login
 */
function simulateEmailLogin(email) {
    const demoUser = {
        email,
        name: email.split('@')[0],
        picture: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=random`,
        provider: 'email',
    };

    createSession(demoUser, 'email');
    displaySessionPanel({ provider: 'email', user: demoUser });

    showToast(`✅ Demo login successful! (Auth backend not configured)`, 'success');
}

/**
 * Create user session
 */
function createSession(user, provider) {
    const session = {
        user,
        provider,
        createdAt: Date.now(),
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
        token: generateDemoToken(),
    };

    localStorage.setItem('user-session', JSON.stringify(session));

    // Also store in sessionStorage for current tab
    sessionStorage.setItem('authenticated', 'true');

    return session;
}

/**
 * Get session from storage
 */
function getSessionFromStorage() {
    const sessionStr = localStorage.getItem('user-session');
    if (sessionStr) {
        try {
            return JSON.parse(sessionStr);
        } catch (error) {
            return null;
        }
    }
    return null;
}

/**
 * Check if session expired
 */
function isSessionExpired(session) {
    return Date.now() > session.expiresAt;
}

/**
 * Display session management panel
 */
function displaySessionPanel(session) {
    const panel = document.getElementById('session-panel');
    const userEmail = document.getElementById('user-email');
    const sessionExpiry = document.getElementById('session-expiry');
    const ssoProvider = document.getElementById('sso-provider');

    userEmail.textContent = session.user.email;

    const daysLeft = Math.ceil((session.expiresAt - Date.now()) / (24 * 60 * 60 * 1000));
    sessionExpiry.textContent = daysLeft > 0 ? `In ${daysLeft} days` : 'Expired';

    ssoProvider.textContent = SSO_CONFIG[session.provider]?.name || 'Email';

    panel.classList.remove('hidden');
}

/**
 * Handle logout
 */
function handleLogout() {
    if (confirm('Are you sure you want to sign out?')) {
        localStorage.removeItem('user-session');
        sessionStorage.removeItem('authenticated');

        showToast('Signed out successfully', 'success');

        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
}

/**
 * Generate demo JWT token
 */
function generateDemoToken() {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
        iat: Date.now(),
        exp: Date.now() + (7 * 24 * 60 * 60 * 1000),
        demo: true,
    }));
    const signature = btoa('demo-signature');

    return `${header}.${payload}.${signature}`;
}

/**
 * Setup form handlers
 */
function setupFormHandlers() {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

/**
 * Show loading overlay
 */
function showLoading(message) {
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    overlay.innerHTML = `
        <div class="bg-white rounded-xl p-8 text-center">
            <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p class="text-gray-700 font-semibold">${message}</p>
        </div>
    `;
    document.body.appendChild(overlay);
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.remove();
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white transform transition-all duration-300 z-50`;

    switch (type) {
        case 'success':
            toast.classList.add('bg-green-600');
            break;
        case 'error':
            toast.classList.add('bg-red-600');
            break;
        default:
            toast.classList.add('bg-blue-600');
    }

    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.style.transform = 'translateY(0)', 10);
    setTimeout(() => {
        toast.style.transform = 'translateY(100px)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// =============================================================================
// Session Management Utilities
// =============================================================================

/**
 * Get current user from session
 */
function getCurrentUser() {
    const session = getSessionFromStorage();
    if (session && !isSessionExpired(session)) {
        return session.user;
    }
    return null;
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    const session = getSessionFromStorage();
    return session && !isSessionExpired(session);
}

/**
 * Get auth token for API calls
 */
function getAuthToken() {
    const session = getSessionFromStorage();
    if (session && !isSessionExpired(session)) {
        return session.token;
    }
    return null;
}

/**
 * Refresh session (extend expiry)
 */
function refreshSession() {
    const session = getSessionFromStorage();
    if (session && !isSessionExpired(session)) {
        session.expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000);
        localStorage.setItem('user-session', JSON.stringify(session));
        return true;
    }
    return false;
}

// Export utilities for use in other scripts
window.SSOUtils = {
    getCurrentUser,
    isAuthenticated,
    getAuthToken,
    refreshSession,
    handleLogout,
};
