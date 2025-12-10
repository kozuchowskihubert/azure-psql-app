/**
 * HAOS Platform Authentication Utilities
 * JWT-based authentication for admin panel
 * Based on sanbud repository implementation
 */

// API Configuration
const API_CONFIG = {
    BASE_URL: process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000' 
        : window.location.origin,
    ENDPOINTS: {
        LOGIN: '/api/admin/auth/login',
        LOGOUT: '/api/admin/auth/logout',
        ME: '/api/admin/auth/me',
        STATUS: '/api/admin/auth/status',
        REFRESH: '/api/admin/auth/refresh'
    }
};

/**
 * Build full API URL
 */
export function buildApiUrl(path) {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${API_CONFIG.BASE_URL}/${cleanPath}`;
}

/**
 * Get authentication headers with JWT token
 */
export function getAuthHeaders() {
    const headers = {
        'Content-Type': 'application/json',
    };
    
    // Add JWT token if available
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('haosAdminToken');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }
    
    return headers;
}

/**
 * Authenticated fetch wrapper with JWT token
 */
export async function authFetch(endpoint, options = {}) {
    const url = buildApiUrl(endpoint);
    const headers = {
        ...getAuthHeaders(),
        ...options.headers,
    };
    
    const response = await fetch(url, {
        ...options,
        headers,
        // No credentials needed - using JWT in Authorization header
    });
    
    // Handle authentication errors
    if (response.status === 401) {
        console.warn('[Auth] 401 Unauthorized - clearing tokens');
        clearAuthData();
        // Don't redirect immediately - let calling code handle it
    }
    
    return response;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('haosAdminToken');
    const admin = localStorage.getItem('haosAdmin');
    return !!(token && admin);
}

/**
 * Get current admin from localStorage
 */
export function getCurrentAdmin() {
    if (typeof window === 'undefined') return null;
    
    try {
        const adminData = localStorage.getItem('haosAdmin');
        return adminData ? JSON.parse(adminData) : null;
    } catch (error) {
        console.error('[Auth] Error parsing admin data:', error);
        clearAuthData();
        return null;
    }
}

/**
 * Store authentication data
 */
export function storeAuthData(token, admin) {
    if (typeof window === 'undefined') return;
    
    try {
        localStorage.setItem('haosAdminToken', token);
        localStorage.setItem('haosAdmin', JSON.stringify(admin));
        console.log('[Auth] Authentication data stored');
    } catch (error) {
        console.error('[Auth] Error storing auth data:', error);
    }
}

/**
 * Clear authentication data
 */
export function clearAuthData() {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('haosAdminToken');
    localStorage.removeItem('haosAdmin');
    console.log('[Auth] Authentication data cleared');
}

/**
 * Login function
 */
export async function login(username, password) {
    try {
        console.log('[Auth] Attempting login for:', username);
        
        const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.LOGIN), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        console.log('[Auth] Login response:', { 
            status: response.status, 
            success: data.success, 
            hasToken: !!data.token 
        });

        if (response.ok && data.success && data.token) {
            // Store authentication data
            storeAuthData(data.token, data.admin);
            
            console.log('[Auth] Login successful for:', data.admin.username);
            
            return {
                success: true,
                admin: data.admin,
                token: data.token
            };
        } else {
            throw new Error(data.error || data.message || 'Login failed');
        }

    } catch (error) {
        console.error('[Auth] Login error:', error.message);
        throw error;
    }
}

/**
 * Logout function
 */
export async function logout() {
    try {
        // Call logout endpoint if authenticated
        if (isAuthenticated()) {
            console.log('[Auth] Logging out...');
            
            try {
                await authFetch(API_CONFIG.ENDPOINTS.LOGOUT, {
                    method: 'POST',
                });
            } catch (error) {
                console.warn('[Auth] Logout endpoint error (continuing):', error.message);
            }
        }
        
        // Clear local data regardless
        clearAuthData();
        
        // Redirect to login
        if (typeof window !== 'undefined') {
            window.location.href = '/admin-panel.html#login';
        }
        
        console.log('[Auth] Logout complete');
        
    } catch (error) {
        console.error('[Auth] Logout error:', error);
        // Clear data anyway
        clearAuthData();
    }
}

/**
 * Check authentication status with backend
 */
export async function checkAuthStatus() {
    try {
        const response = await authFetch(API_CONFIG.ENDPOINTS.STATUS);
        const data = await response.json();
        
        if (response.ok && data.authenticated) {
            // Update stored admin data
            if (data.admin) {
                localStorage.setItem('haosAdmin', JSON.stringify(data.admin));
            }
            
            return {
                authenticated: true,
                admin: data.admin
            };
        } else {
            // Clear invalid auth data
            clearAuthData();
            return {
                authenticated: false,
                admin: null
            };
        }
        
    } catch (error) {
        console.error('[Auth] Status check error:', error);
        return {
            authenticated: false,
            admin: null,
            error: error.message
        };
    }
}

/**
 * Refresh JWT token
 */
export async function refreshToken() {
    try {
        if (!isAuthenticated()) {
            throw new Error('Not authenticated');
        }
        
        const response = await authFetch(API_CONFIG.ENDPOINTS.REFRESH, {
            method: 'POST',
        });

        const data = await response.json();
        
        if (response.ok && data.success && data.token) {
            // Update token
            localStorage.setItem('haosAdminToken', data.token);
            console.log('[Auth] Token refreshed successfully');
            
            return {
                success: true,
                token: data.token
            };
        } else {
            throw new Error(data.error || 'Token refresh failed');
        }
        
    } catch (error) {
        console.error('[Auth] Token refresh error:', error);
        clearAuthData();
        throw error;
    }
}

/**
 * Get current admin info from backend
 */
export async function getCurrentAdminFromAPI() {
    try {
        const response = await authFetch(API_CONFIG.ENDPOINTS.ME);
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Update localStorage
            localStorage.setItem('haosAdmin', JSON.stringify(data.admin));
            return data.admin;
        } else {
            throw new Error(data.error || 'Failed to get admin info');
        }
        
    } catch (error) {
        console.error('[Auth] Get admin error:', error);
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            clearAuthData();
        }
        throw error;
    }
}

/**
 * Initialize authentication system
 * Call this on app startup
 */
export async function initializeAuth() {
    console.log('[Auth] Initializing authentication system...');
    
    // Check if we have stored auth data
    if (!isAuthenticated()) {
        console.log('[Auth] No stored authentication data');
        return { authenticated: false };
    }
    
    // Verify auth status with backend
    try {
        const status = await checkAuthStatus();
        
        if (status.authenticated) {
            console.log('[Auth] Authentication verified:', status.admin.username);
        } else {
            console.log('[Auth] Authentication verification failed');
        }
        
        return status;
        
    } catch (error) {
        console.error('[Auth] Authentication initialization error:', error);
        clearAuthData();
        return { authenticated: false, error: error.message };
    }
}

/**
 * Auto token refresh setup
 * Refresh token every 23 hours to prevent expiration
 */
export function setupAutoRefresh() {
    if (typeof window === 'undefined') return;
    
    const refreshInterval = 23 * 60 * 60 * 1000; // 23 hours in milliseconds
    
    const intervalId = setInterval(async () => {
        if (isAuthenticated()) {
            try {
                await refreshToken();
                console.log('[Auth] Auto-refresh completed');
            } catch (error) {
                console.error('[Auth] Auto-refresh failed:', error.message);
                clearInterval(intervalId);
            }
        } else {
            clearInterval(intervalId);
        }
    }, refreshInterval);
    
    console.log('[Auth] Auto-refresh setup completed');
    
    return intervalId;
}

/**
 * Check if user has specific role
 */
export function hasRole(role) {
    const admin = getCurrentAdmin();
    if (!admin || !admin.roles) return false;
    
    return admin.roles.includes(role) || admin.is_super_admin;
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin() {
    const admin = getCurrentAdmin();
    return !!(admin && admin.is_super_admin);
}

/**
 * Authentication guard for components/pages
 * Returns true if authenticated, false if not (and redirects)
 */
export function requireAuth() {
    if (typeof window === 'undefined') return true; // SSR
    
    if (!isAuthenticated()) {
        console.warn('[Auth] Authentication required, redirecting to login');
        window.location.href = '/admin-panel.html#login';
        return false;
    }
    
    return true;
}

/**
 * Role guard for components/pages
 */
export function requireRole(role) {
    if (!requireAuth()) return false;
    
    if (!hasRole(role)) {
        console.warn(`[Auth] Role '${role}' required, access denied`);
        alert(`Access denied. Required role: ${role}`);
        return false;
    }
    
    return true;
}

/**
 * Super admin guard for components/pages
 */
export function requireSuperAdmin() {
    if (!requireAuth()) return false;
    
    if (!isSuperAdmin()) {
        console.warn('[Auth] Super admin access required, access denied');
        alert('Access denied. Super admin privileges required.');
        return false;
    }
    
    return true;
}

// Debug helper for development
export function getDebugInfo() {
    if (typeof window === 'undefined') return {};
    
    return {
        isAuthenticated: isAuthenticated(),
        admin: getCurrentAdmin(),
        token: localStorage.getItem('haosAdminToken')?.substring(0, 20) + '...',
        apiUrl: API_CONFIG.BASE_URL,
        environment: process.env.NODE_ENV
    };
}