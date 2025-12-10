/**
 * HAOS Admin Authentication Routes
 * JWT-based authentication system for admin panel
 */

const express = require('express');
const HAOSJWTAuth = require('../auth/jwt-auth');

// Initialize JWT auth system
const jwtAuth = new HAOSJWTAuth({
    jwtSecret: process.env.JWT_SECRET_KEY || 'haos-platform-secret-2025',
    tokenExpiry: '24h'
});

const router = express.Router();

// ============================================================================
// Admin Authentication Endpoints
// ============================================================================

/**
 * POST /api/admin/auth/login
 * Admin login with JWT token generation
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        console.log(`[Auth] Login attempt for username: ${username}`);

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username and password are required'
            });
        }

        const result = await jwtAuth.login(username, password);
        
        console.log(`[Auth] Login successful for: ${username}`);
        
        return res.json(result);

    } catch (error) {
        console.error('[Auth] Login error:', error.message);
        return res.status(401).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/admin/auth/me
 * Get current admin info
 */
router.get('/me', jwtAuth.tokenRequired.bind(jwtAuth), (req, res) => {
    return res.json({
        success: true,
        admin: req.currentAdmin
    });
});

/**
 * POST /api/admin/auth/logout
 * Logout endpoint (client handles token removal)
 */
router.post('/logout', jwtAuth.tokenRequired.bind(jwtAuth), (req, res) => {
    console.log(`[Auth] Logout for user: ${req.currentAdmin.username}`);
    return res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

/**
 * POST /api/admin/auth/refresh
 * Refresh JWT token
 */
router.post('/refresh', jwtAuth.tokenRequired.bind(jwtAuth), async (req, res) => {
    try {
        // Generate new token
        const tokenPayload = {
            admin_id: req.currentAdmin.id,
            username: req.currentAdmin.username,
            email: req.currentAdmin.email,
            is_super_admin: req.currentAdmin.is_super_admin,
            roles: req.currentAdmin.roles,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
        };

        const jwt = require('jsonwebtoken');
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET_KEY || 'haos-platform-secret-2025');

        return res.json({
            success: true,
            token: token,
            message: 'Token refreshed successfully'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Failed to refresh token'
        });
    }
});

/**
 * GET /api/admin/auth/status
 * Check authentication status
 */
router.get('/status', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.json({
            authenticated: false,
            admin: null
        });
    }

    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY || 'haos-platform-secret-2025');

        return res.json({
            authenticated: true,
            admin: {
                id: decoded.admin_id,
                username: decoded.username,
                email: decoded.email,
                roles: decoded.roles,
                is_super_admin: decoded.is_super_admin
            }
        });
    } catch (error) {
        return res.json({
            authenticated: false,
            admin: null,
            error: error.name
        });
    }
});

// ============================================================================
// Admin Management Endpoints (Super Admin Only)
// ============================================================================

/**
 * GET /api/admin/auth/admins
 * List all admin users
 */
router.get('/admins', jwtAuth.tokenRequired.bind(jwtAuth), jwtAuth.requireSuperAdmin.bind(jwtAuth), (req, res) => {
    try {
        const admins = jwtAuth.listAdmins();
        return res.json({
            success: true,
            admins: admins
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Failed to retrieve admin list'
        });
    }
});

/**
 * POST /api/admin/auth/admins
 * Create new admin user
 */
router.post('/admins', jwtAuth.tokenRequired.bind(jwtAuth), jwtAuth.requireSuperAdmin.bind(jwtAuth), async (req, res) => {
    try {
        const { username, email, password, is_super_admin, roles } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username, email, and password are required'
            });
        }

        const newAdmin = await jwtAuth.addAdmin({
            username,
            email,
            password,
            is_super_admin: is_super_admin || false,
            roles: roles || ['admin']
        });

        console.log(`[Auth] New admin created: ${username} by ${req.currentAdmin.username}`);

        return res.json({
            success: true,
            admin: newAdmin,
            message: 'Admin user created successfully'
        });

    } catch (error) {
        console.error('[Auth] Admin creation error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to create admin user'
        });
    }
});

// ============================================================================
// Feature Management Integration
// ============================================================================

/**
 * GET /api/admin/features/state
 * Get current feature toggle state (protected)
 */
router.get('/features/state', jwtAuth.tokenRequired.bind(jwtAuth), (req, res) => {
    // This will integrate with the feature toggle system
    // For now, return empty state
    return res.json({
        success: true,
        state: {
            features: [],
            instruments: [],
            services: [],
            timestamp: new Date().toISOString()
        }
    });
});

/**
 * POST /api/admin/features/state
 * Save feature toggle state (protected)
 */
router.post('/features/state', jwtAuth.tokenRequired.bind(jwtAuth), (req, res) => {
    // This will integrate with the feature toggle system
    // For now, just acknowledge the save
    const { state } = req.body;
    
    console.log(`[Features] State saved by ${req.currentAdmin.username}:`, Object.keys(state || {}));
    
    return res.json({
        success: true,
        message: 'Feature state saved successfully',
        timestamp: new Date().toISOString()
    });
});

/**
 * POST /api/admin/features/toggle
 * Toggle individual feature (protected)
 */
router.post('/features/toggle', jwtAuth.tokenRequired.bind(jwtAuth), (req, res) => {
    const { id, enabled } = req.body;
    
    if (!id || typeof enabled !== 'boolean') {
        return res.status(400).json({
            success: false,
            error: 'Feature ID and enabled state are required'
        });
    }

    console.log(`[Features] ${enabled ? 'Enabling' : 'Disabling'} feature ${id} by ${req.currentAdmin.username}`);
    
    // This will integrate with the feature toggle system
    return res.json({
        success: true,
        message: `Feature ${id} ${enabled ? 'enabled' : 'disabled'} successfully`,
        feature: { id, enabled }
    });
});

// ============================================================================
// Debug and Setup Endpoints (Development Only)
// ============================================================================

if (process.env.NODE_ENV === 'development') {
    /**
     * GET /api/admin/auth/debug/check
     * Debug endpoint to check admin configuration
     */
    router.get('/debug/check', (req, res) => {
        try {
            const admins = jwtAuth.listAdmins();
            return res.json({
                success: true,
                debug: {
                    adminCount: admins.length,
                    admins: admins.map(admin => ({
                        username: admin.username,
                        email: admin.email,
                        is_active: admin.is_active,
                        is_super_admin: admin.is_super_admin,
                        roles: admin.roles
                    })),
                    environment: process.env.NODE_ENV,
                    jwtConfigured: !!(process.env.JWT_SECRET_KEY),
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    /**
     * POST /api/admin/auth/debug/setup
     * Development setup endpoint
     */
    router.post('/debug/setup', async (req, res) => {
        try {
            console.log('[Auth] Development setup initiated');
            
            // Reset and create default admin
            await jwtAuth.initializeDefaultAdmin();
            
            return res.json({
                success: true,
                message: 'Development setup completed',
                defaultAdmin: {
                    username: 'admin',
                    password: 'HAOS2025Admin!',
                    note: 'Default credentials for development'
                }
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
}

// Export the router and auth instance
module.exports = {
    router,
    jwtAuth
};