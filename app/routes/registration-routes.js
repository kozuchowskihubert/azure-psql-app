/**
 * Registration Routes
 * Handles user registration, email verification, and password reset
 */

const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const emailService = require('../services/email-service');

const router = express.Router();

// Validation helpers
const validators = {
  email: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },
  password: (password) => {
    // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return re.test(password);
  },
  name: (name) => {
    return name && name.trim().length >= 2 && name.trim().length <= 100;
  },
};

/**
 * POST /api/auth/test-email
 * Send a test email to verify SMTP configuration and templates
 * Body params:
 *   - to: email address (default: admin@haos.fm)
 *   - template: "verification" | "welcome" | "password-reset" | "subscription" | "custom"
 *   - name: user name for personalization
 *   - subject: custom subject (for custom template)
 *   - text: custom text (for custom template)
 */
router.post('/test-email', async (req, res) => {
  const { to = 'admin@haos.fm', template = 'custom', name = 'Test User', subject, text } = req.body;
  
  try {
    let result;
    
    switch (template) {
      case 'verification':
        // Send verification email with test token
        const testToken = 'test_' + crypto.randomBytes(16).toString('hex');
        result = await emailService.sendVerificationEmail(to, name, testToken);
        break;
        
      case 'welcome':
        // Send welcome email
        result = await emailService.sendWelcomeEmail(to, name);
        break;
        
      case 'password-reset':
        // Send password reset email with test token
        const resetToken = 'test_' + crypto.randomBytes(16).toString('hex');
        result = await emailService.sendPasswordResetEmail(to, name, resetToken);
        break;
        
      case 'subscription':
        // Send subscription confirmation email
        result = await emailService.sendSubscriptionConfirmation(
          to, 
          name, 
          'Pro Plan', 
          '29.99', 
          'USD'
        );
        break;
        
      default:
        // Send custom email
        const customSubject = subject || 'SMTP Test from HAOS.fm';
        const customText = text || 'This is a test email from HAOS.fm SMTP setup.';
        result = await emailService.sendEmail({ 
          to, 
          subject: customSubject, 
          text: customText, 
          html: `<p>${customText}</p>` 
        });
    }
    
    if (result.success) {
      return res.json({ 
        success: true, 
        message: `Test ${template} email sent successfully!`, 
        messageId: result.messageId,
        template 
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        error: result.error || 'Failed to send test email.' 
      });
    }
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to send test email.' 
    });
  }
});

/**
 * POST /api/auth/register
 * Register a new user with email/password
 */
router.post('/register', async (req, res) => {
  const { email, password, name, acceptTerms } = req.body;

  // Validation
  const errors = [];

  if (!email || !validators.email(email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }

  if (!password || !validators.password(password)) {
    errors.push({
      field: 'password',
      message: 'Password must be at least 8 characters with uppercase, lowercase, and number',
    });
  }

  if (!name || !validators.name(name)) {
    errors.push({ field: 'name', message: 'Name must be between 2 and 100 characters' });
  }

  if (!acceptTerms) {
    errors.push({ field: 'acceptTerms', message: 'You must accept the Terms of Service' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  try {
    // Check if email already exists
    const existingUser = await pool.query(
      'SELECT id, email_verified FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      const user = existingUser.rows[0];
      
      // If user exists but not verified, allow re-sending verification
      if (!user.email_verified) {
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await pool.query(`
          UPDATE users 
          SET verification_token = $1, verification_token_expires = $2
          WHERE id = $3
        `, [verificationToken, tokenExpiry, user.id]);

        await emailService.sendVerificationEmail(email, name, verificationToken);

        return res.status(200).json({
          success: true,
          message: 'Verification email resent. Please check your inbox.',
          resent: true,
        });
      }

      return res.status(409).json({
        success: false,
        errors: [{ field: 'email', message: 'An account with this email already exists' }],
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const result = await pool.query(`
      INSERT INTO users (
        email, password_hash, display_name, 
        verification_token, verification_token_expires,
        email_verified, created_at
      ) VALUES ($1, $2, $3, $4, $5, FALSE, NOW())
      RETURNING id, email, display_name
    `, [email.toLowerCase(), passwordHash, name.trim(), verificationToken, tokenExpiry]);

    const newUser = result.rows[0];

    // Send verification email
    await emailService.sendVerificationEmail(email, name, verificationToken);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.display_name,
      },
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      errors: [{ field: 'general', message: 'Registration failed. Please try again.' }],
    });
  }
});

/**
 * GET /api/auth/verify-email
 * Verify email with token
 */
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({
      success: false,
      error: 'Verification token is required',
    });
  }

  try {
    const result = await pool.query(`
      SELECT id, email, display_name, email_verified, verification_token_expires
      FROM users
      WHERE verification_token = $1
    `, [token]);

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification token',
      });
    }

    const user = result.rows[0];

    if (user.email_verified) {
      return res.status(200).json({
        success: true,
        message: 'Email already verified',
        alreadyVerified: true,
      });
    }

    if (new Date(user.verification_token_expires) < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Verification token has expired. Please request a new one.',
        expired: true,
      });
    }

    // Update user as verified
    await pool.query(`
      UPDATE users
      SET email_verified = TRUE, verification_token = NULL, verification_token_expires = NULL
      WHERE id = $1
    `, [user.id]);

    // Send welcome email
    await emailService.sendWelcomeEmail(user.email, user.display_name);

    res.json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Verification failed. Please try again.',
    });
  }
});

/**
 * POST /api/auth/resend-verification
 * Resend verification email
 */
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;

  if (!email || !validators.email(email)) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid email address',
    });
  }

  try {
    const result = await pool.query(`
      SELECT id, display_name, email_verified
      FROM users
      WHERE email = $1
    `, [email.toLowerCase()]);

    if (result.rows.length === 0) {
      // Don't reveal if email exists
      return res.json({
        success: true,
        message: 'If an account exists with this email, a verification link has been sent.',
      });
    }

    const user = result.rows[0];

    if (user.email_verified) {
      return res.status(400).json({
        success: false,
        error: 'This email is already verified. You can log in.',
      });
    }

    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await pool.query(`
      UPDATE users
      SET verification_token = $1, verification_token_expires = $2
      WHERE id = $3
    `, [verificationToken, tokenExpiry, user.id]);

    await emailService.sendVerificationEmail(email, user.display_name, verificationToken);

    res.json({
      success: true,
      message: 'Verification email sent. Please check your inbox.',
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send verification email. Please try again.',
    });
  }
});

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email || !validators.email(email)) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid email address',
    });
  }

  try {
    const result = await pool.query(`
      SELECT id, display_name, email_verified
      FROM users
      WHERE email = $1
    `, [email.toLowerCase()]);

    // Always return success to prevent email enumeration
    if (result.rows.length === 0 || !result.rows[0].email_verified) {
      return res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
      });
    }

    const user = result.rows[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(`
      UPDATE users
      SET reset_token = $1, reset_token_expires = $2
      WHERE id = $3
    `, [resetToken, tokenExpiry, user.id]);

    await emailService.sendPasswordResetEmail(email, user.display_name, resetToken);

    res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process request. Please try again.',
    });
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      error: 'Reset token is required',
    });
  }

  if (!password || !validators.password(password)) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 8 characters with uppercase, lowercase, and number',
    });
  }

  try {
    const result = await pool.query(`
      SELECT id, email, reset_token_expires
      FROM users
      WHERE reset_token = $1
    `, [token]);

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token',
      });
    }

    const user = result.rows[0];

    if (new Date(user.reset_token_expires) < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Reset token has expired. Please request a new one.',
        expired: true,
      });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update password and clear token
    await pool.query(`
      UPDATE users
      SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL
      WHERE id = $2
    `, [passwordHash, user.id]);

    res.json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.',
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Password reset failed. Please try again.',
    });
  }
});

/**
 * POST /api/auth/login
 * Login with email/password
 */
router.post('/login', async (req, res) => {
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required',
    });
  }

  try {
    const result = await pool.query(`
      SELECT id, email, password_hash, display_name, email_verified, avatar_url, roles
      FROM users
      WHERE email = $1
    `, [email.toLowerCase()]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    const user = result.rows[0];

    // Check if password exists (social login users may not have one)
    if (!user.password_hash) {
      return res.status(401).json({
        success: false,
        error: 'This account uses social login. Please sign in with Google/Facebook.',
        socialLogin: true,
      });
    }

    // Check password
    const passwordValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(403).json({
        success: false,
        error: 'Please verify your email before logging in',
        needsVerification: true,
        email: user.email,
      });
    }

    // Create session
    req.session.userId = user.id;
    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.display_name,
      avatar: user.avatar_url,
      roles: user.roles || ['user'],
    };

    if (rememberMe) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    }

    // Update last login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.display_name,
        avatar: user.avatar_url,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed. Please try again.',
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout and destroy session
 */
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      error: 'Not authenticated',
    });
  }

  res.json({
    success: true,
    user: req.session.user,
  });
});

module.exports = router;
