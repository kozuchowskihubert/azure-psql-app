/**
 * Social Authentication Providers
 * Facebook, Google, Apple Sign-In with Passport.js
 */

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('../config/database');

// ============================================================================
// Configuration
// ============================================================================

const AUTH_CONFIG = {
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.APP_URL || 'http://localhost:3000'}/auth/google/callback`,
    scope: ['openid', 'profile', 'email'],
  },
  facebook: {
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: `${process.env.APP_URL || 'http://localhost:3000'}/auth/facebook/callback`,
    profileFields: ['id', 'emails', 'name', 'displayName', 'photos'],
    scope: ['email', 'public_profile'],
  },
  apple: {
    clientID: process.env.APPLE_CLIENT_ID, // Service ID
    teamID: process.env.APPLE_TEAM_ID,
    keyID: process.env.APPLE_KEY_ID,
    privateKey: process.env.APPLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    callbackURL: `${process.env.APP_URL || 'http://localhost:3000'}/auth/apple/callback`,
    scope: ['name', 'email'],
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Find or create a user from OAuth profile
 */
async function findOrCreateUser(profile) {
  const {
    provider,
    providerId,
    email,
    displayName,
    firstName,
    lastName,
    avatarUrl,
  } = profile;

  try {
    // Check if user exists by provider ID
    let result = await pool.query(
      'SELECT * FROM users WHERE sso_provider = $1 AND sso_provider_id = $2',
      [provider, providerId],
    );

    if (result.rows.length > 0) {
      // Update existing user
      const user = result.rows[0];
      result = await pool.query(
        `UPDATE users SET
          display_name = COALESCE($1, display_name),
          first_name = COALESCE($2, first_name),
          last_name = COALESCE($3, last_name),
          avatar_url = COALESCE($4, avatar_url),
          last_login_at = NOW(),
          updated_at = NOW()
        WHERE id = $5
        RETURNING *`,
        [displayName, firstName, lastName, avatarUrl, user.id],
      );
      return result.rows[0];
    }

    // Check if user exists by email (link accounts)
    if (email) {
      result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email],
      );

      if (result.rows.length > 0) {
        // Link this provider to existing account
        const user = result.rows[0];
        result = await pool.query(
          `UPDATE users SET
            sso_provider = $1,
            sso_provider_id = $2,
            avatar_url = COALESCE($3, avatar_url),
            last_login_at = NOW(),
            updated_at = NOW()
          WHERE id = $4
          RETURNING *`,
          [provider, providerId, avatarUrl, user.id],
        );
        return result.rows[0];
      }
    }

    // Create new user
    result = await pool.query(
      `INSERT INTO users (
        email, display_name, first_name, last_name, avatar_url,
        sso_provider, sso_provider_id, last_login_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *`,
      [email, displayName, firstName, lastName, avatarUrl, provider, providerId],
    );

    const newUser = result.rows[0];

    // Assign default 'user' role
    await pool.query(
      'INSERT INTO user_roles (user_id, role_name) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [newUser.id, 'user'],
    );

    return newUser;
  } catch (error) {
    console.error('Error in findOrCreateUser:', error);
    throw error;
  }
}

// ============================================================================
// Initialize Passport Strategies
// ============================================================================

function initializeSocialAuth() {
  // Serialize user to session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const result = await pool.query(
        `SELECT u.*, 
          ARRAY_AGG(DISTINCT ur.role_name) FILTER (WHERE ur.role_name IS NOT NULL) as roles
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        WHERE u.id = $1 AND u.is_active = true
        GROUP BY u.id`,
        [id],
      );

      if (result.rows.length === 0) {
        return done(null, false);
      }

      const user = result.rows[0];
      user.roles = user.roles || ['user'];

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  });

  // =========================================================================
  // Google OAuth Strategy
  // =========================================================================
  if (AUTH_CONFIG.google.clientID && AUTH_CONFIG.google.clientSecret) {
    passport.use(
      'google',
      new GoogleStrategy(
        {
          clientID: AUTH_CONFIG.google.clientID,
          clientSecret: AUTH_CONFIG.google.clientSecret,
          callbackURL: AUTH_CONFIG.google.callbackURL,
          scope: AUTH_CONFIG.google.scope,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const user = await findOrCreateUser({
              provider: 'google',
              providerId: profile.id,
              email: profile.emails?.[0]?.value,
              displayName: profile.displayName,
              firstName: profile.name?.givenName,
              lastName: profile.name?.familyName,
              avatarUrl: profile.photos?.[0]?.value,
            });
            return done(null, user);
          } catch (error) {
            return done(error, null);
          }
        },
      ),
    );
    console.log('✓ Google OAuth configured');
  }

  // =========================================================================
  // Facebook OAuth Strategy
  // =========================================================================
  if (AUTH_CONFIG.facebook.clientID && AUTH_CONFIG.facebook.clientSecret) {
    try {
      // eslint-disable-next-line global-require
      const FacebookStrategy = require('passport-facebook').Strategy;

      passport.use(
        'facebook',
        new FacebookStrategy(
          {
            clientID: AUTH_CONFIG.facebook.clientID,
            clientSecret: AUTH_CONFIG.facebook.clientSecret,
            callbackURL: AUTH_CONFIG.facebook.callbackURL,
            profileFields: AUTH_CONFIG.facebook.profileFields,
          },
          async (accessToken, refreshToken, profile, done) => {
            try {
              const user = await findOrCreateUser({
                provider: 'facebook',
                providerId: profile.id,
                email: profile.emails?.[0]?.value,
                displayName: profile.displayName,
                firstName: profile.name?.givenName,
                lastName: profile.name?.familyName,
                avatarUrl: profile.photos?.[0]?.value,
              });
              return done(null, user);
            } catch (error) {
              return done(error, null);
            }
          },
        ),
      );
      console.log('✓ Facebook OAuth configured');
    } catch (err) {
      console.log('⚠️ Facebook OAuth not configured (passport-facebook not installed)');
    }
  }

  // =========================================================================
  // Apple Sign-In Strategy
  // =========================================================================
  if (AUTH_CONFIG.apple.clientID && AUTH_CONFIG.apple.teamID && AUTH_CONFIG.apple.privateKey) {
    try {
      // eslint-disable-next-line global-require
      const AppleStrategy = require('passport-apple').Strategy;

      passport.use(
        'apple',
        new AppleStrategy(
          {
            clientID: AUTH_CONFIG.apple.clientID,
            teamID: AUTH_CONFIG.apple.teamID,
            keyID: AUTH_CONFIG.apple.keyID,
            privateKeyString: AUTH_CONFIG.apple.privateKey,
            callbackURL: AUTH_CONFIG.apple.callbackURL,
            scope: AUTH_CONFIG.apple.scope,
          },
          async (accessToken, refreshToken, idToken, profile, done) => {
            try {
              // Apple provides limited profile info
              const user = await findOrCreateUser({
                provider: 'apple',
                providerId: profile.id || idToken.sub,
                email: profile.email || idToken.email,
                displayName: profile.name
                  ? `${profile.name.firstName || ''} ${profile.name.lastName || ''}`.trim()
                  : null,
                firstName: profile.name?.firstName,
                lastName: profile.name?.lastName,
                avatarUrl: null, // Apple doesn't provide avatar
              });
              return done(null, user);
            } catch (error) {
              return done(error, null);
            }
          },
        ),
      );
      console.log('✓ Apple Sign-In configured');
    } catch (err) {
      console.log('⚠️ Apple Sign-In not configured (passport-apple not installed)');
    }
  }
}

// ============================================================================
// Check which providers are available
// ============================================================================

function getAvailableProviders() {
  const providers = [];

  if (AUTH_CONFIG.google.clientID && AUTH_CONFIG.google.clientSecret) {
    providers.push({
      id: 'google',
      name: 'Google',
      icon: 'fab fa-google',
      color: '#4285F4',
    });
  }

  if (AUTH_CONFIG.facebook.clientID && AUTH_CONFIG.facebook.clientSecret) {
    providers.push({
      id: 'facebook',
      name: 'Facebook',
      icon: 'fab fa-facebook-f',
      color: '#1877F2',
    });
  }

  if (AUTH_CONFIG.apple.clientID && AUTH_CONFIG.apple.teamID) {
    providers.push({
      id: 'apple',
      name: 'Apple',
      icon: 'fab fa-apple',
      color: '#000000',
    });
  }

  return providers;
}

module.exports = {
  initializeSocialAuth,
  findOrCreateUser,
  getAvailableProviders,
  AUTH_CONFIG,
};
