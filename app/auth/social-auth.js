/**
 * HAOS Social Authentication
 * Google, Facebook, Apple OAuth with Passport.js
 */

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const AppleStrategy = require('passport-apple').Strategy;
const jwt = require('jsonwebtoken');

let pool;

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'haos-fm-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';
const JWT_REFRESH_EXPIRES_IN = '30d';

/**
 * Generate JWT tokens for user
 */
function generateTokens(user) {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.display_name || user.name,
    roles: user.roles || ['user'],
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'haos.fm',
    audience: 'haos.fm-users',
  });

  const refreshToken = jwt.sign(
    { id: user.id, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
}

/**
 * Find or create user from OAuth profile
 */
async function findOrCreateUser(profile, provider) {
  const email = profile.emails?.[0]?.value || `${profile.id}@${provider}.oauth`;
  const providerId = profile.id;
  const displayName = profile.displayName || profile.name?.givenName || 'User';
  const avatarUrl = profile.photos?.[0]?.value;

  try {
    // Check if user exists by provider ID
    let providerColumn;
    switch (provider) {
      case 'google': providerColumn = 'google_id'; break;
      case 'facebook': providerColumn = 'facebook_id'; break;
      case 'apple': providerColumn = 'apple_id'; break;
      default: throw new Error(`Unknown provider: ${provider}`);
    }

    // First try to find by provider ID
    let result = await pool.query(
      `SELECT * FROM users WHERE ${providerColumn} = $1`,
      [providerId]
    );

    if (result.rows.length > 0) {
      // Update last login
      await pool.query(
        'UPDATE users SET last_login_at = NOW() WHERE id = $1',
        [result.rows[0].id]
      );
      return result.rows[0];
    }

    // Then try to find by email
    result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length > 0) {
      // Link provider to existing account
      await pool.query(
        `UPDATE users SET ${providerColumn} = $1, last_login_at = NOW() WHERE id = $2`,
        [providerId, result.rows[0].id]
      );
      return result.rows[0];
    }

    // Create new user
    const newUser = await pool.query(
      `INSERT INTO users (email, display_name, avatar_url, ${providerColumn}, created_at, last_login_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [email, displayName, avatarUrl, providerId]
    );

    return newUser.rows[0];
  } catch (error) {
    console.error(`[SocialAuth] Error in findOrCreateUser:`, error);
    throw error;
  }
}

/**
 * Initialize social authentication strategies
 */
function initializeSocialAuth(dbPool) {
  pool = dbPool;

  // Passport serialization
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      done(null, result.rows[0] || null);
    } catch (error) {
      done(error, null);
    }
  });

  // ============================================================================
  // GOOGLE OAuth
  // ============================================================================
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (googleClientId && googleClientSecret) {
    passport.use(new GoogleStrategy({
      clientID: googleClientId,
      clientSecret: googleClientSecret,
      callbackURL: `${process.env.APP_URL || 'http://localhost:3000'}/auth/google/callback`,
      scope: ['profile', 'email'],
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateUser(profile, 'google');
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }));
    console.log('✓ Google OAuth configured');
  } else {
    console.log('⚠️  Google OAuth not configured (missing credentials)');
  }

  // ============================================================================
  // FACEBOOK OAuth
  // ============================================================================
  const facebookAppId = process.env.FACEBOOK_APP_ID;
  const facebookAppSecret = process.env.FACEBOOK_APP_SECRET;
  
  if (facebookAppId && facebookAppSecret) {
    passport.use(new FacebookStrategy({
      clientID: facebookAppId,
      clientSecret: facebookAppSecret,
      callbackURL: `${process.env.APP_URL || 'http://localhost:3000'}/auth/facebook/callback`,
      profileFields: ['id', 'emails', 'displayName', 'photos'],
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateUser(profile, 'facebook');
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }));
    console.log('✓ Facebook OAuth configured');
  } else {
    console.log('⚠️  Facebook OAuth not configured (missing credentials)');
  }

  // ============================================================================
  // APPLE OAuth
  // ============================================================================
  const appleClientId = process.env.APPLE_CLIENT_ID;
  const appleTeamId = process.env.APPLE_TEAM_ID;
  const appleKeyId = process.env.APPLE_KEY_ID;
  const applePrivateKey = process.env.APPLE_PRIVATE_KEY;
  
  if (appleClientId && appleTeamId && appleKeyId && applePrivateKey) {
    passport.use(new AppleStrategy({
      clientID: appleClientId,
      teamID: appleTeamId,
      keyID: appleKeyId,
      privateKeyString: applePrivateKey,
      callbackURL: `${process.env.APP_URL || 'http://localhost:3000'}/auth/apple/callback`,
      scope: ['name', 'email'],
    }, async (req, accessToken, refreshToken, idToken, profile, done) => {
      try {
        const user = await findOrCreateUser(profile, 'apple');
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }));
    console.log('✓ Apple OAuth configured');
  } else {
    console.log('⚠️  Apple OAuth not configured (missing credentials)');
  }
}

module.exports = {
  initializeSocialAuth,
  generateTokens,
  findOrCreateUser,
};
