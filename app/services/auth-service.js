/**
 * HAOS Unified Authentication Service
 * Modern, secure, frictionless authentication system
 * 
 * Features:
 * - Anonymous sessions (instant access)
 * - OAuth (Google, Apple, Facebook)
 * - Magic links (passwordless)
 * - Email/password (traditional)
 * - Secure session management
 * - HTTPOnly cookies
 * - JWT with refresh tokens
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const emailService = require('./email-service');

class HAOSAuthService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'haos-platform-secret-2025';
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'haos-refresh-secret-2025';
    this.accessTokenExpiry = 15 * 60; // 15 minutes
    this.refreshTokenExpiry = 7 * 24 * 60 * 60; // 7 days
    this.sessionExpiry = 30 * 24 * 60 * 60; // 30 days
  }

  // ============================================================================
  // ANONYMOUS SESSIONS
  // ============================================================================

  /**
   * Create anonymous session for instant platform access
   * No signup required - users can explore immediately
   */
  async createAnonymousSession() {
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + this.sessionExpiry * 1000);

    try {
      await pool.query(`
        INSERT INTO user_sessions (
          session_id, session_type, tier, created_at, expires_at
        ) VALUES ($1, 'anonymous', 'free', NOW(), $2)
      `, [sessionId, expiresAt]);

      return {
        sessionId,
        type: 'anonymous',
        tier: 'free',
        features: ['radio', 'synth-preview', 'browse'],
        expiresAt
      };
    } catch (error) {
      console.error('[Auth] Failed to create anonymous session:', error);
      throw new Error('Could not create session');
    }
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId) {
    if (!sessionId) return null;

    try {
      const result = await pool.query(`
        SELECT 
          s.session_id, s.user_id, s.session_type, s.tier,
          s.access_token, s.refresh_token, s.expires_at,
          u.email, u.display_name, u.avatar_url, u.google_id, u.subscription_tier
        FROM user_sessions s
        LEFT JOIN users u ON s.user_id = u.id
        WHERE s.session_id = $1 AND s.expires_at > NOW()
      `, [sessionId]);

      if (result.rows.length === 0) return null;

      const session = result.rows[0];
      return {
        id: session.session_id,
        userId: session.user_id,
        type: session.session_type,
        tier: session.subscription_tier || session.tier,
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: session.expires_at,
        user: session.user_id ? {
          id: session.user_id,
          email: session.email,
          name: session.display_name,
          displayName: session.display_name,
          avatar: session.avatar_url,
          avatarUrl: session.avatar_url,
          googleId: session.google_id,
          subscriptionTier: session.subscription_tier
        } : null
      };
    } catch (error) {
      console.error('[Auth] Failed to get session:', error);
      return null;
    }
  }

  /**
   * Destroy session (logout)
   */
  async destroySession(sessionId) {
    if (!sessionId) return;

    try {
      await pool.query(`
        DELETE FROM user_sessions WHERE session_id = $1
      `, [sessionId]);
    } catch (error) {
      console.error('[Auth] Failed to destroy session:', error);
    }
  }

  // ============================================================================
  // OAUTH AUTHENTICATION
  // ============================================================================

  /**
   * Login with OAuth provider (Google, Apple, Facebook)
   */
  async loginWithOAuth(provider, profile) {
    try {
      // Find or create user from OAuth profile
      let user = await this.findUserByOAuth(provider, profile.id);

      if (!user) {
        user = await this.createUserFromOAuth(provider, profile);
      } else {
        // Update user info if changed
        await this.updateUserFromOAuth(user.id, profile);
      }

      // Create authenticated session
      return this.createUserSession(user);
    } catch (error) {
      console.error('[Auth] OAuth login failed:', error);
      throw new Error('OAuth authentication failed');
    }
  }

  /**
   * Find user by OAuth provider
   */
  async findUserByOAuth(provider, providerId) {
    try {
      const result = await pool.query(`
        SELECT u.* FROM users u
        JOIN oauth_accounts o ON u.id = o.user_id
        WHERE o.provider = $1 AND o.provider_user_id = $2
      `, [provider, providerId]);

      return result.rows[0] || null;
    } catch (error) {
      console.error('[Auth] Failed to find OAuth user:', error);
      return null;
    }
  }

  /**
   * Create user from OAuth profile
   */
  async createUserFromOAuth(provider, profile) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create user
      const userResult = await client.query(`
        INSERT INTO users (
          email, display_name, avatar_url, email_verified, created_at
        ) VALUES ($1, $2, $3, TRUE, NOW())
        RETURNING *
      `, [
        profile.email || `${provider}_${profile.id}@haos.fm`,
        profile.name || `${provider} User`,
        profile.picture || profile.avatar || null
      ]);

      const user = userResult.rows[0];

      // Link OAuth account
      await client.query(`
        INSERT INTO oauth_accounts (
          user_id, provider, provider_user_id, access_token, refresh_token, created_at
        ) VALUES ($1, $2, $3, $4, $5, NOW())
      `, [user.id, provider, profile.id, profile.accessToken, profile.refreshToken]);

      await client.query('COMMIT');

      console.log(`[Auth] New user created via ${provider}: ${user.email}`);
      return user;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('[Auth] Failed to create OAuth user:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update user from OAuth profile
   */
  async updateUserFromOAuth(userId, profile) {
    try {
      await pool.query(`
        UPDATE users
        SET display_name = COALESCE($1, display_name),
            avatar_url = COALESCE($2, avatar_url),
            updated_at = NOW()
        WHERE id = $3
      `, [profile.name, profile.picture || profile.avatar, userId]);
    } catch (error) {
      console.error('[Auth] Failed to update OAuth user:', error);
    }
  }

  // ============================================================================
  // MAGIC LINK AUTHENTICATION
  // ============================================================================

  /**
   * Send magic link to email
   */
  async sendMagicLink(email) {
    try {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await pool.query(`
        INSERT INTO magic_links (email, token, expires_at, created_at)
        VALUES ($1, $2, $3, NOW())
      `, [email.toLowerCase(), token, expiresAt]);

      const magicLink = `${process.env.APP_URL || 'http://localhost:3000'}/auth/magic?token=${token}`;
      
      await emailService.sendEmail({
        to: email,
        subject: '🎵 Your HAOS.fm Magic Link',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #FF6B35;">Welcome to HAOS.fm!</h1>
            <p>Click the button below to sign in instantly:</p>
            <a href="${magicLink}" style="display: inline-block; background: linear-gradient(135deg, #FF6B35 0%, #D4AF37 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
              Sign In to HAOS.fm
            </a>
            <p style="color: #666; font-size: 14px;">This link expires in 15 minutes.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `
      });

      console.log(`[Auth] Magic link sent to: ${email}`);
      return { success: true };
    } catch (error) {
      console.error('[Auth] Failed to send magic link:', error);
      throw new Error('Could not send magic link');
    }
  }

  /**
   * Verify magic link and create session
   */
  async verifyMagicLink(token) {
    try {
      const result = await pool.query(`
        SELECT email FROM magic_links
        WHERE token = $1 AND expires_at > NOW() AND used_at IS NULL
      `, [token]);

      if (result.rows.length === 0) {
        throw new Error('Invalid or expired magic link');
      }

      const { email } = result.rows[0];

      // Mark magic link as used
      await pool.query(`
        UPDATE magic_links SET used_at = NOW()
        WHERE token = $1
      `, [token]);

      // Find or create user
      let user = await this.findUserByEmail(email);
      if (!user) {
        user = await this.createUserFromEmail(email);
      }

      // Create session
      return this.createUserSession(user);
    } catch (error) {
      console.error('[Auth] Magic link verification failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // EMAIL/PASSWORD AUTHENTICATION
  // ============================================================================

  /**
   * Register with email/password
   */
  async registerWithEmail(email, password, name) {
    try {
      // Check if user exists
      const existing = await this.findUserByEmail(email);
      if (existing) {
        throw new Error('Email already registered');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const result = await pool.query(`
        INSERT INTO users (
          email, password_hash, display_name, email_verified, created_at
        ) VALUES ($1, $2, $3, FALSE, NOW())
        RETURNING *
      `, [email.toLowerCase(), passwordHash, name]);

      const user = result.rows[0];

      // Send verification email (optional)
      await this.sendMagicLink(email);

      console.log(`[Auth] New user registered: ${email}`);
      return user;
    } catch (error) {
      console.error('[Auth] Registration failed:', error);
      throw error;
    }
  }

  /**
   * Login with email/password
   */
  async loginWithEmail(email, password) {
    try {
      const user = await this.findUserByEmail(email);
      
      if (!user || !user.password_hash) {
        throw new Error('Invalid email or password');
      }

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        throw new Error('Invalid email or password');
      }

      return this.createUserSession(user);
    } catch (error) {
      console.error('[Auth] Email login failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================

  /**
   * Find user by email
   */
  async findUserByEmail(email) {
    try {
      const result = await pool.query(`
        SELECT * FROM users WHERE email = $1
      `, [email.toLowerCase()]);

      return result.rows[0] || null;
    } catch (error) {
      console.error('[Auth] Failed to find user by email:', error);
      return null;
    }
  }

  /**
   * Find user by ID
   */
  async getUserById(userId) {
    try {
      const result = await pool.query(`
        SELECT id, email, display_name, avatar_url, subscription_tier,
               email_verified, created_at
        FROM users WHERE id = $1
      `, [userId]);

      return result.rows[0] || null;
    } catch (error) {
      console.error('[Auth] Failed to find user by ID:', error);
      return null;
    }
  }

  /**
   * Create user from email (magic link)
   */
  async createUserFromEmail(email) {
    try {
      const result = await pool.query(`
        INSERT INTO users (
          email, display_name, email_verified, created_at
        ) VALUES ($1, $2, TRUE, NOW())
        RETURNING *
      `, [email.toLowerCase(), email.split('@')[0]]);

      console.log(`[Auth] New user created from magic link: ${email}`);
      return result.rows[0];
    } catch (error) {
      console.error('[Auth] Failed to create user from email:', error);
      throw error;
    }
  }

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  /**
   * Create authenticated user session with tokens
   */
  async createUserSession(user) {
    const sessionId = crypto.randomUUID();
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    const expiresAt = new Date(Date.now() + this.sessionExpiry * 1000);

    try {
      console.log('[Auth] Creating session for user:', {
        userId: user.id,
        email: user.email,
        tier: user.subscription_tier || 'basic'
      });
      
      await pool.query(`
        INSERT INTO user_sessions (
          session_id, user_id, session_type, tier,
          access_token, refresh_token, created_at, expires_at
        ) VALUES ($1, $2, 'authenticated', $3, $4, $5, NOW(), $6)
      `, [
        sessionId,
        user.id,
        user.subscription_tier || 'basic',
        accessToken,
        refreshToken,
        expiresAt
      ]);
      
      console.log('[Auth] Session created successfully:', sessionId);

      return {
        sessionId,
        userId: user.id,
        type: 'authenticated',
        tier: user.subscription_tier || 'basic',
        accessToken,
        refreshToken,
        expiresAt,
        user: {
          id: user.id,
          email: user.email,
          name: user.display_name,
          avatar: user.avatar_url
        }
      };
    } catch (error) {
      console.error('[Auth] ❌ Failed to create user session:', error);
      console.error('[Auth] Error details:', {
        message: error.message,
        code: error.code,
        detail: error.detail,
        hint: error.hint
      });
      throw new Error(`Could not create session: ${error.message}`);
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, this.jwtRefreshSecret);
      const user = await this.getUserById(decoded.sub);

      if (!user) {
        throw new Error('User not found');
      }

      const newAccessToken = this.generateAccessToken(user);

      // Update session
      await pool.query(`
        UPDATE user_sessions
        SET access_token = $1, updated_at = NOW()
        WHERE user_id = $2 AND refresh_token = $3
      `, [newAccessToken, user.id, refreshToken]);

      return newAccessToken;
    } catch (error) {
      console.error('[Auth] Token refresh failed:', error);
      throw new Error('Invalid refresh token');
    }
  }

  // ============================================================================
  // JWT TOKEN GENERATION
  // ============================================================================

  /**
   * Generate short-lived access token (15 minutes)
   */
  generateAccessToken(user) {
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        tier: user.subscription_tier || 'basic',
        type: 'access',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + this.accessTokenExpiry
      },
      this.jwtSecret
    );
  }

  /**
   * Generate long-lived refresh token (7 days)
   */
  generateRefreshToken(user) {
    return jwt.sign(
      {
        sub: user.id,
        type: 'refresh',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + this.refreshTokenExpiry
      },
      this.jwtRefreshSecret
    );
  }

  /**
   * Verify JWT token
   */
  verifyToken(token, type = 'access') {
    const secret = type === 'refresh' ? this.jwtRefreshSecret : this.jwtSecret;
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      return null;
    }
  }

  // ============================================================================
  // FEATURE ACCESS CONTROL
  // ============================================================================

  /**
   * Check if user/session can access feature
   */
  canAccess(session, feature) {
    const permissions = {
      free: ['radio', 'synth-preview', 'browse'],
      basic: ['radio', 'synth-preview', 'browse', 'save', 'upload', 'collaborate-basic'],
      premium: ['*'], // All features
      pro: ['*'] // All features
    };

    const tier = session?.tier || 'free';
    const allowed = permissions[tier] || permissions.free;

    return allowed.includes('*') || allowed.includes(feature);
  }
}

// Singleton instance
module.exports = new HAOSAuthService();
