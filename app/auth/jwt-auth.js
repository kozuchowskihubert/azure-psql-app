/**
 * JWT Authentication Middleware for HAOS Platform
 * Based on sanbud repository implementation
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class HAOSJWTAuth {
    constructor(config = {}) {
        this.jwtSecret = config.jwtSecret || process.env.JWT_SECRET_KEY || 'haos-secret-key-change-in-production';
        this.tokenExpiry = config.tokenExpiry || '24h';
        this.adminUsers = new Map(); // In-memory admin store for demo
        
        // Initialize default admin user
        this.initializeDefaultAdmin();
    }

    /**
     * Initialize default admin user for demo purposes
     * In production, this should come from database
     */
    async initializeDefaultAdmin() {
        const defaultAdmin = {
            id: 1,
            username: 'admin',
            email: 'admin@haos.app',
            password_hash: await bcrypt.hash('HAOS2025Admin!', 12),
            is_active: true,
            is_super_admin: true,
            roles: ['admin', 'super_admin'],
            created_at: new Date(),
            last_login: null
        };

        this.adminUsers.set('admin', defaultAdmin);
        console.log('✓ JWT Auth: Default admin user initialized');
    }

    /**
     * Login endpoint - generate JWT token
     */
    async login(username, password) {
        try {
            // Find admin user
            const admin = this.adminUsers.get(username);
            
            if (!admin) {
                throw new Error('Invalid credentials');
            }

            // Verify password
            const passwordValid = await bcrypt.compare(password, admin.password_hash);
            
            if (!passwordValid) {
                throw new Error('Invalid credentials');
            }

            if (!admin.is_active) {
                throw new Error('Account is disabled');
            }

            // Generate JWT token
            const tokenPayload = {
                admin_id: admin.id,
                username: admin.username,
                email: admin.email,
                is_super_admin: admin.is_super_admin,
                roles: admin.roles,
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
            };

            const token = jwt.sign(tokenPayload, this.jwtSecret, { algorithm: 'HS256' });

            // Update last login
            admin.last_login = new Date();

            return {
                success: true,
                message: 'Login successful',
                token: token,
                admin: {
                    id: admin.id,
                    username: admin.username,
                    email: admin.email,
                    roles: admin.roles,
                    is_super_admin: admin.is_super_admin
                }
            };

        } catch (error) {
            throw new Error(`Login failed: ${error.message}`);
        }
    }

    /**
     * Verify JWT token middleware
     */
    tokenRequired(req, res, next) {
        try {
            let token = null;

            // Check for token in Authorization header
            if (req.headers.authorization) {
                const authHeader = req.headers.authorization;
                const parts = authHeader.split(' ');
                
                if (parts.length === 2 && parts[0] === 'Bearer') {
                    token = parts[1];
                } else {
                    return res.status(401).json({
                        error: 'Unauthorized',
                        message: 'Invalid authorization header format'
                    });
                }
            }

            if (!token) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Token is missing'
                });
            }

            // Verify token
            const decoded = jwt.verify(token, this.jwtSecret);

            // Get admin user
            const admin = this.adminUsers.get(decoded.username);
            
            if (!admin || !admin.is_active) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Admin account not found or inactive'
                });
            }

            // Attach admin info to request
            req.currentAdmin = {
                id: decoded.admin_id,
                username: decoded.username,
                email: decoded.email,
                roles: decoded.roles,
                is_super_admin: decoded.is_super_admin
            };

            next();

        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Token has expired'
                });
            } else if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Invalid token'
                });
            } else {
                return res.status(500).json({
                    error: 'Internal Server Error',
                    message: 'Token verification failed'
                });
            }
        }
    }

    /**
     * Role-based access control
     */
    requireRole(...allowedRoles) {
        return (req, res, next) => {
            if (!req.currentAdmin) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Authentication required'
                });
            }

            const userRoles = req.currentAdmin.roles || [];
            const hasRole = allowedRoles.some(role => userRoles.includes(role));

            if (!hasRole) {
                return res.status(403).json({
                    error: 'Forbidden',
                    message: `Insufficient permissions. Required: ${allowedRoles.join(', ')}`,
                    currentRoles: userRoles
                });
            }

            next();
        };
    }

    /**
     * Super admin access only
     */
    requireSuperAdmin(req, res, next) {
        if (!req.currentAdmin) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required'
            });
        }

        if (!req.currentAdmin.is_super_admin) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Super admin access required'
            });
        }

        next();
    }

    /**
     * Get current admin info
     */
    getCurrentAdmin(req, res) {
        if (!req.currentAdmin) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Not authenticated'
            });
        }

        return res.json({
            success: true,
            admin: req.currentAdmin
        });
    }

    /**
     * Logout endpoint (client-side token removal)
     */
    logout(req, res) {
        // Since JWT is stateless, logout is handled client-side
        // Could implement token blacklist here for additional security
        
        return res.json({
            success: true,
            message: 'Logged out successfully'
        });
    }

    /**
     * Refresh token endpoint
     */
    async refreshToken(req, res) {
        try {
            if (!req.currentAdmin) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Not authenticated'
                });
            }

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

            const token = jwt.sign(tokenPayload, this.jwtSecret, { algorithm: 'HS256' });

            return res.json({
                success: true,
                token: token,
                message: 'Token refreshed successfully'
            });

        } catch (error) {
            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to refresh token'
            });
        }
    }

    /**
     * Create admin routes
     */
    createAuthRoutes() {
        const express = require('express');
        const router = express.Router();

        // Login endpoint
        router.post('/login', async (req, res) => {
            try {
                const { username, password } = req.body;

                if (!username || !password) {
                    return res.status(400).json({
                        error: 'Bad Request',
                        message: 'Username and password are required'
                    });
                }

                const result = await this.login(username, password);
                return res.json(result);

            } catch (error) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: error.message
                });
            }
        });

        // Get current admin
        router.get('/me', this.tokenRequired.bind(this), (req, res) => {
            this.getCurrentAdmin(req, res);
        });

        // Logout
        router.post('/logout', this.tokenRequired.bind(this), (req, res) => {
            this.logout(req, res);
        });

        // Refresh token
        router.post('/refresh', this.tokenRequired.bind(this), (req, res) => {
            this.refreshToken(req, res);
        });

        // Auth status check
        router.get('/status', (req, res) => {
            const token = req.headers.authorization?.split(' ')[1];
            
            if (!token) {
                return res.json({
                    authenticated: false,
                    admin: null
                });
            }

            try {
                const decoded = jwt.verify(token, this.jwtSecret);
                const admin = this.adminUsers.get(decoded.username);

                if (admin && admin.is_active) {
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
                } else {
                    return res.json({
                        authenticated: false,
                        admin: null
                    });
                }
            } catch (error) {
                return res.json({
                    authenticated: false,
                    admin: null,
                    error: 'Invalid token'
                });
            }
        });

        return router;
    }

    /**
     * Add admin user (for setup)
     */
    async addAdmin(userData) {
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        
        const admin = {
            id: Date.now(), // Simple ID generation
            username: userData.username,
            email: userData.email,
            password_hash: hashedPassword,
            is_active: userData.is_active !== false,
            is_super_admin: userData.is_super_admin || false,
            roles: userData.roles || ['admin'],
            created_at: new Date(),
            last_login: null
        };

        this.adminUsers.set(userData.username, admin);
        
        return {
            id: admin.id,
            username: admin.username,
            email: admin.email,
            roles: admin.roles,
            is_super_admin: admin.is_super_admin
        };
    }

    /**
     * List all admin users (for management)
     */
    listAdmins() {
        return Array.from(this.adminUsers.values()).map(admin => ({
            id: admin.id,
            username: admin.username,
            email: admin.email,
            is_active: admin.is_active,
            is_super_admin: admin.is_super_admin,
            roles: admin.roles,
            created_at: admin.created_at,
            last_login: admin.last_login
        }));
    }
}

module.exports = HAOSJWTAuth;