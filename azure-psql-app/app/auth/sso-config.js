// ============================================================================
// SSO Authentication Middleware - Azure AD & Google OAuth
// ============================================================================

const passport = require('passport');
const { Strategy: AzureADStrategy } = require('passport-azure-ad').OIDCStrategy;
const { Strategy: GoogleStrategy } = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const crypto = require('crypto');

// ============================================================================
// Configuration
// ============================================================================

const SSO_CONFIG = {
  AZURE_AD: {
    clientID: process.env.AZURE_AD_CLIENT_ID,
    clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
    tenantID: process.env.AZURE_AD_TENANT_ID || 'common', // 'common' for multi-tenant
    redirectUrl: `${process.env.APP_URL}/api/auth/callback/azure`,
    identityMetadata: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID || 'common'}/v2.0/.well-known/openid-configuration`,
    scope: ['openid', 'profile', 'email', 'offline_access'],
    responseType: 'code',
    responseMode: 'form_post',
  },
  GOOGLE: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.APP_URL}/api/auth/callback/google`,
    scope: [
      'openid',
      'profile',
      'email',
      'https://www.googleapis.com/auth/calendar',
    ],
  },
};

// ============================================================================
// Passport Configuration
// ============================================================================

function initializePassport(db) {
  // Session serialization
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const result = await db.query(
        'SELECT * FROM users WHERE id = $1 AND is_active = true',
        [id]
      );
      done(null, result.rows[0] || null);
    } catch (error) {
      done(error, null);
    }
  });

  // =========================================================================
  // Azure AD Strategy
  // =========================================================================
  passport.use(
    'azure-ad',
    new AzureADStrategy(
      {
        identityMetadata: SSO_CONFIG.AZURE_AD.identityMetadata,
        clientID: SSO_CONFIG.AZURE_AD.clientID,
        clientSecret: SSO_CONFIG.AZURE_AD.clientSecret,
        responseType: SSO_CONFIG.AZURE_AD.responseType,
        responseMode: SSO_CONFIG.AZURE_AD.responseMode,
        redirectUrl: SSO_CONFIG.AZURE_AD.redirectUrl,
        allowHttpForRedirectUrl: process.env.NODE_ENV === 'development',
        validateIssuer: true,
        passReqToCallback: false,
        scope: SSO_CONFIG.AZURE_AD.scope,
      },
      async (iss, sub, profile, accessToken, refreshToken, done) => {
        try {
          const user = await findOrCreateUser({
            provider: 'azure-ad',
            providerId: profile.oid || profile.sub,
            email: profile._json.email || profile.upn,
            displayName: profile.displayName,
            firstName: profile.name?.givenName,
            lastName: profile.name?.familyName,
            tenantId: profile._json.tid,
            accessToken,
            refreshToken,
          }, db);

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );

  // =========================================================================
  // Google OAuth Strategy
  // =========================================================================
  passport.use(
    'google',
    new GoogleStrategy(
      {
        clientID: SSO_CONFIG.GOOGLE.clientID,
        clientSecret: SSO_CONFIG.GOOGLE.clientSecret,
        callbackURL: SSO_CONFIG.GOOGLE.callbackURL,
        scope: SSO_CONFIG.GOOGLE.scope,
        accessType: 'offline',
        prompt: 'consent',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await findOrCreateUser({
            provider: 'google',
            providerId: profile.id,
            email: profile.emails[0].value,
            displayName: profile.displayName,
            firstName: profile.name?.givenName,
            lastName: profile.name?.familyName,
            avatarUrl: profile.photos[0]?.value,
            accessToken,
            refreshToken,
          }, db);

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

// ============================================================================
// User Management Functions
// ============================================================================

async function findOrCreateUser(userData, db) {
  const {
    provider,
    providerId,
    email,
    displayName,
    firstName,
    lastName,
    avatarUrl,
    tenantId,
    accessToken,
    refreshToken,
  } = userData;

  try {
    // Check if user exists
    let result = await db.query(
      'SELECT * FROM users WHERE sso_provider = $1 AND sso_provider_id = $2',
      [provider, providerId]
    );

    let user;

    if (result.rows.length > 0) {
      // Update existing user
      user = result.rows[0];
      
      result = await db.query(
        `UPDATE users SET
          display_name = $1,
          first_name = $2,
          last_name = $3,
          avatar_url = COALESCE($4, avatar_url),
          last_login_at = NOW(),
          updated_at = NOW()
        WHERE id = $5
        RETURNING *`,
        [displayName, firstName, lastName, avatarUrl, user.id]
      );
      
      user = result.rows[0];
    } else {
      // Create new user
      result = await db.query(
        `INSERT INTO users (
          email, display_name, first_name, last_name, avatar_url,
          sso_provider, sso_provider_id, sso_tenant_id,
          last_login_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        RETURNING *`,
        [
          email,
          displayName,
          firstName,
          lastName,
          avatarUrl,
          provider,
          providerId,
          tenantId,
        ]
      );
      
      user = result.rows[0];

      // Assign default 'user' role
      await db.query(
        `INSERT INTO user_role_assignments (user_id, role_id)
        SELECT $1, id FROM user_roles WHERE role_name = 'user'
        ON CONFLICT DO NOTHING`,
        [user.id]
      );
    }

    // Create/update session with tokens
    await createUserSession({
      userId: user.id,
      accessToken,
      refreshToken,
    }, db);

    return user;
  } catch (error) {
    console.error('Error in findOrCreateUser:', error);
    throw error;
  }
}

async function createUserSession(sessionData, db) {
  const { userId, accessToken, refreshToken, ipAddress, userAgent } = sessionData;
  
  // Generate secure session token
  const sessionToken = crypto.randomBytes(32).toString('hex');
  
  // Token expires in 7 days
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Encrypt tokens before storing
  const encryptedAccessToken = encryptToken(accessToken);
  const encryptedRefreshToken = refreshToken ? encryptToken(refreshToken) : null;

  await db.query(
    `INSERT INTO user_sessions (
      user_id, session_token, access_token, refresh_token,
      ip_address, user_agent, expires_at, token_expires_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() + INTERVAL '1 hour')
    ON CONFLICT (session_token) DO UPDATE SET
      access_token = EXCLUDED.access_token,
      refresh_token = EXCLUDED.refresh_token,
      last_activity_at = NOW()`,
    [
      userId,
      sessionToken,
      encryptedAccessToken,
      encryptedRefreshToken,
      ipAddress,
      userAgent,
      expiresAt,
    ]
  );

  return sessionToken;
}

// ============================================================================
// Token Encryption/Decryption
// ============================================================================

function encryptToken(token) {
  if (!token) return null;
  
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // 32 bytes
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return `${iv.toString('hex')}:${encrypted}`;
}

function decryptToken(encryptedToken) {
  if (!encryptedToken) return null;
  
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  
  const parts = encryptedToken.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// ============================================================================
// Authentication Middleware
// ============================================================================

function requireAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized. Please login.' });
}

function requireRole(...roles) {
  return async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const result = await req.app.locals.db.query(
        `SELECT r.role_name, r.permissions
        FROM user_role_assignments ura
        JOIN user_roles r ON ura.role_id = r.id
        WHERE ura.user_id = $1`,
        [req.user.id]
      );

      const userRoles = result.rows.map(row => row.role_name);
      const hasRole = roles.some(role => userRoles.includes(role));

      if (!hasRole) {
        return res.status(403).json({ 
          error: 'Forbidden. Insufficient permissions.',
          required: roles,
          current: userRoles
        });
      }

      req.userRoles = result.rows;
      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

// ============================================================================
// Session Configuration
// ============================================================================

function configureSession() {
  return session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax',
    },
    name: 'notes.sid', // Custom session name
  });
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  initializePassport,
  configureSession,
  requireAuth,
  requireRole,
  encryptToken,
  decryptToken,
};
