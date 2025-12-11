/**
 * Email Service
 * SMTP email service for HAOS.fm platform
 * Handles verification emails, password resets, and notifications
 * Now supports customizable JSON templates via email-template-service
 */

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const emailTemplateService = require('./email-template-service');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
    this.fromEmail = process.env.EMAIL_FROM || process.env.SMTP_FROM || 'noreply@haos.fm';
    this.fromName = process.env.SMTP_FROM_NAME || 'HAOS.fm';
    this.replyTo = process.env.EMAIL_REPLY_TO || 'admin@haos.fm';
    this.logoBase64 = null; // Cache for base64 logo
    this.templateService = emailTemplateService;
  }

  /**
   * Get logo as base64 data URL (cached)
   */
  getLogoBase64() {
    if (this.logoBase64) return this.logoBase64;
    
    try {
      const logoPath = path.join(__dirname, '../public/images/haos-logo-white.png');
      const logoBuffer = fs.readFileSync(logoPath);
      this.logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
      console.log('✓ Logo loaded and encoded as base64');
      return this.logoBase64;
    } catch (error) {
      console.error('❌ Failed to load logo:', error.message);
      // Fallback to external URL
      return `${process.env.APP_URL || 'http://localhost:3000'}/images/haos-logo-white.png`;
    }
  }

  /**
   * Initialize the SMTP transporter
   */
  async initialize() {
    if (this.initialized) return;

    const config = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    };

    // Only initialize if credentials are provided
    if (!config.auth.user || !config.auth.pass) {
      console.log('⚠️  SMTP not configured - email service disabled');
      console.log('   Set SMTP_HOST, SMTP_USER, SMTP_PASS environment variables');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport(config);
      
      // Verify connection
      await this.transporter.verify();
      this.initialized = true;
      console.log('✓ SMTP email service initialized');
    } catch (error) {
      console.error('❌ SMTP initialization failed:', error.message);
      this.transporter = null;
    }
  }

  /**
   * Send an email with logo attachment
   */
  async sendEmail({ to, subject, html, text }) {
    if (!this.transporter) {
      console.log(`📧 [DEV MODE] Would send email to ${to}: ${subject}`);
      return { success: true, devMode: true };
    }

    try {
      // Prepare logo attachment
      const logoPath = path.join(__dirname, '../public/images/haos-logo-white.png');
      
      const result = await this.transporter.sendMail({
        from: this.fromEmail,
        replyTo: this.replyTo,
        to,
        subject,
        html,
        text: text || this.stripHtml(html),
        attachments: [{
          filename: 'haos-logo-white.png',
          path: logoPath,
          cid: 'haos-logo' // Content-ID for embedding in HTML
        }]
      });

      console.log(`✉️  Email sent to ${to}: ${subject}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send email using customizable template
   * @param {string} templateName - Name of template from email-templates.json
   * @param {string} to - Recipient email address
   * @param {Object} variables - Template variables to replace
   * @param {string} language - Language code (default: 'en')
   */
  async sendTemplatedEmail(templateName, to, variables = {}, language = 'en') {
    try {
      const { subject, html, text } = this.templateService.buildEmail(templateName, variables, language);
      return await this.sendEmail({ to, subject, html, text });
    } catch (error) {
      console.error(`Failed to send templated email '${templateName}':`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get available templates
   */
  getAvailableTemplates() {
    return this.templateService.listTemplates();
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages() {
    return this.templateService.listLanguages();
  }

  /**
   * Reload templates from JSON (hot-reload)
   */
  reloadTemplates() {
    return this.templateService.reloadTemplates();
  }

  /**
   * Strip HTML tags for plain text version
   */
  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  /**
   * Create HAOS.fm branded email template
   */
  createEmailTemplate({ title, heading, content, ctaText, ctaUrl, footerNote }) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || 'HAOS.fm'}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0A0A0A; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
  <!-- Background glow effects -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0A0A0A; padding: 40px 20px; position: relative;">
    <tr>
      <td align="center">
        <!-- Main container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(145deg, #1a1a1a 0%, #0d0d0d 100%); border-radius: 20px; border: 1px solid #2a2a2a; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5); overflow: hidden;">
          
          <!-- Animated header bar -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #FF6B35 0%, #D4AF37 50%, #00D9FF 100%);"></td>
          </tr>
          
          <!-- Logo & Brand Header -->
          <tr>
            <td align="center" style="padding: 48px 40px 32px; background: linear-gradient(180deg, #1a1a1a 0%, #151515 100%); position: relative;">
              <!-- HAOS Logo (attached with CID) -->
              <div style="margin-bottom: 24px; padding: 20px; background: radial-gradient(circle, rgba(255, 107, 53, 0.1) 0%, transparent 70%); border-radius: 50%; display: inline-block;">
                <img src="cid:haos-logo" alt="HAOS.fm" style="width: 120px; height: auto; display: block; filter: drop-shadow(0 4px 20px rgba(255, 107, 53, 0.3));" />
              </div>
              
              <!-- Tagline -->
              <p style="color: #6B6B6B; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; margin: 0; font-weight: 600;">Where Chaos Becomes Creation</p>
            </td>
          </tr>
          
          <!-- Main content area -->
          <tr>
            <td style="padding: 40px; background: #151515;">
              <!-- Personalized greeting -->
              <h2 style="color: #F4E8D8; font-size: 28px; font-weight: 700; margin: 0 0 24px; line-height: 1.3;">${heading}</h2>
              
              <!-- Content -->
              <div style="color: #999; font-size: 16px; line-height: 1.8; margin: 0 0 32px;">
                ${content}
              </div>
              
              ${ctaText && ctaUrl ? `
              <!-- Call to action button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${ctaUrl}" style="display: inline-block; background: linear-gradient(135deg, #FF6B35 0%, #D4AF37 100%); color: #0A0A0A; font-weight: 700; font-size: 16px; letter-spacing: 2px; text-decoration: none; padding: 18px 56px; border-radius: 12px; text-transform: uppercase; box-shadow: 0 8px 24px rgba(255, 107, 53, 0.3), 0 0 40px rgba(212, 175, 55, 0.2); transition: all 0.3s ease;">
                      ${ctaText}
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}
            </td>
          </tr>
          
          <!-- Feature highlights -->
          <tr>
            <td style="padding: 32px 40px; background: #0d0d0d; border-top: 1px solid #2a2a2a;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 10px;">
                    <div style="color: #00D9FF; font-size: 24px; margin-bottom: 8px;">🎹</div>
                    <div style="color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Modular Synth</div>
                  </td>
                  <td align="center" style="padding: 0 10px;">
                    <div style="color: #FF6B35; font-size: 24px; margin-bottom: 8px;">🎚️</div>
                    <div style="color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Live Mixing</div>
                  </td>
                  <td align="center" style="padding: 0 10px;">
                    <div style="color: #D4AF37; font-size: 24px; margin-bottom: 8px;">🎧</div>
                    <div style="color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">24/7 Radio</div>
                  </td>
                  <td align="center" style="padding: 0 10px;">
                    <div style="color: #39FF14; font-size: 24px; margin-bottom: 8px;">👥</div>
                    <div style="color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Collaborate</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background: #0A0A0A; border-top: 1px solid #2a2a2a;">
              ${footerNote ? `<p style="color: #555; font-size: 13px; text-align: center; margin: 0 0 20px; line-height: 1.6;">${footerNote}</p>` : ''}
              
              <!-- Social links -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td align="center">
                    <a href="https://haos.fm" style="display: inline-block; margin: 0 8px; color: #666; text-decoration: none; font-size: 12px;">Website</a>
                    <span style="color: #333;">•</span>
                    <a href="https://haos.fm/sounds" style="display: inline-block; margin: 0 8px; color: #666; text-decoration: none; font-size: 12px;">Sounds</a>
                    <span style="color: #333;">•</span>
                    <a href="https://haos.fm/account" style="display: inline-block; margin: 0 8px; color: #666; text-decoration: none; font-size: 12px;">Account</a>
                  </td>
                </tr>
              </table>
              
              <!-- Copyright -->
              <p style="color: #444; font-size: 12px; text-align: center; margin: 0; line-height: 1.6;">
                © ${new Date().getFullYear()} HAOS.fm • Hardware Analog Oscillator Synthesis<br/>
                <span style="color: #333; font-size: 10px;">Where Chaos Becomes Creation</span>
              </p>
            </td>
          </tr>
          
          <!-- Bottom gradient bar -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #00D9FF 0%, #6A0DAD 50%, #FF6B35 100%);"></td>
          </tr>
        </table>
        
        <!-- Email client note -->
        <p style="color: #333; font-size: 11px; text-align: center; margin: 24px 0 0; max-width: 500px;">
          This email was sent from HAOS.fm. If you have any questions, reply to this email or contact us at <a href="mailto:admin@haos.fm" style="color: #FF6B35; text-decoration: none;">admin@haos.fm</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(email, name, verificationToken) {
    const verificationUrl = `${process.env.APP_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    
    const html = this.createEmailTemplate({
      title: 'Verify your HAOS.fm account',
      heading: `Welcome to HAOS.fm, ${name || 'Creator'}! 🎵`,
      content: `
        <p style="margin: 0 0 20px;">Thank you for joining the <strong style="color: #FF6B35;">HAOS universe</strong>. You're one step away from unlocking professional music production tools, modular synthesis, and a vibrant community of creators.</p>
        
        <p style="margin: 0 0 20px;">Click the button below to verify your email address and activate your account:</p>
        
        <div style="background: rgba(255, 107, 53, 0.05); border-left: 3px solid #FF6B35; padding: 16px; border-radius: 8px; margin: 24px 0;">
          <p style="color: #F4E8D8; margin: 0; font-size: 14px;">
            <strong>⏰ Quick verification</strong><br/>
            This link will expire in <strong>24 hours</strong>. Verify now to start creating!
          </p>
        </div>
        
        <p style="margin: 24px 0 0; font-size: 14px; color: #666;">
          Or copy and paste this link:<br/>
          <a href="${verificationUrl}" style="color: #FF6B35; word-break: break-all; font-size: 12px;">${verificationUrl}</a>
        </p>
      `,
      ctaText: '✓ Verify Email Address',
      ctaUrl: verificationUrl,
      footerNote: 'If you didn\'t create an account on HAOS.fm, you can safely ignore this email.'
    });

    return this.sendEmail({
      to: email,
      subject: `🎵 ${name || 'Welcome'}, verify your HAOS.fm account`,
      html,
    });
  }

  /**
   * Send welcome email after verification
   */
  async sendWelcomeEmail(email, name) {
    const platformUrl = `${process.env.APP_URL || 'http://localhost:3000'}/haos-platform`;
    
    const html = this.createEmailTemplate({
      title: '🎉 Welcome to HAOS.fm',
      heading: `🎉 You're In, ${name || 'Creator'}!`,
      content: `
        <p style="margin: 0 0 20px;">Your email has been verified and your account is fully activated. Welcome to the HAOS.fm community!</p>
        
        <div style="background: rgba(57, 255, 20, 0.05); border-left: 3px solid #39FF14; padding: 16px; border-radius: 8px; margin: 24px 0;">
          <h3 style="color: #39FF14; margin: 0 0 12px; font-size: 16px;">✓ Full Access Unlocked</h3>
          <ul style="color: #F4E8D8; margin: 0; padding-left: 20px; line-height: 1.8; font-size: 14px;">
            <li><strong>🎹 Modular Synthesizer</strong> - Build your own sounds from scratch</li>
            <li><strong>🎚️ Pattern Sequencer</strong> - Create evolving rhythms and melodies</li>
            <li><strong>🎧 24/7 Radio Stream</strong> - Listen to community creations</li>
            <li><strong>📚 Sound Library</strong> - Access hundreds of presets and samples</li>
            <li><strong>💾 Project Export</strong> - Download and share your work</li>
            <li><strong>👥 Collaboration</strong> - Connect with other creators</li>
          </ul>
        </div>
        
        <p style="margin: 24px 0 0; font-size: 15px; color: #888;">
          Ready to start creating? Jump into the platform and explore what's possible when chaos becomes creation.
        </p>
      `,
      ctaText: '🚀 Start Creating Now',
      ctaUrl: platformUrl,
      footerNote: 'Need help getting started? Check out our <a href="' + (process.env.APP_URL || 'http://localhost:3000') + '/docs" style="color: #FF6B35;">Quick Start Guide</a>.'
    });

    return this.sendEmail({
      to: email,
      subject: '🎉 Welcome to HAOS.fm - Your account is ready!',
      html,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email, name, resetToken) {
    const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const html = this.createEmailTemplate({
      title: '🔐 Reset Your Password',
      heading: `🔐 Password Reset Request`,
      content: `
        <p style="margin: 0 0 20px;">Hi <strong>${name || 'there'}</strong>,</p>
        
        <p style="margin: 0 0 20px;">We received a request to reset your HAOS.fm password. Click the button below to create a new password:</p>
        
        <div style="background: rgba(255, 107, 53, 0.05); border-left: 3px solid #FF6B35; padding: 16px; border-radius: 8px; margin: 24px 0;">
          <p style="color: #F4E8D8; margin: 0; font-size: 14px;">
            <strong>🔒 Security Notice</strong><br/>
            This reset link will expire in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email - your password won't be changed.
          </p>
        </div>
        
        <p style="margin: 24px 0 0; font-size: 14px; color: #666;">
          Or copy and paste this link:<br/>
          <a href="${resetUrl}" style="color: #FF6B35; word-break: break-all; font-size: 12px;">${resetUrl}</a>
        </p>
      `,
      ctaText: '🔑 Reset Password',
      ctaUrl: resetUrl,
      footerNote: 'For security reasons, this link expires in 1 hour. Need help? Contact us at <a href="mailto:admin@haos.fm" style="color: #FF6B35;">admin@haos.fm</a>.'
    });

    return this.sendEmail({
      to: email,
      subject: '🔐 Reset your HAOS.fm password',
      html,
    });
  }

  /**
   * Send subscription confirmation email
   */
  async sendSubscriptionConfirmation(email, name, planName, amount, currency) {
    const accountUrl = `${process.env.APP_URL || 'http://localhost:3000'}/account`;
    
    const html = this.createEmailTemplate({
      title: '⚡ Subscription Active',
      heading: `⚡ Upgrade Complete!`,
      content: `
        <p style="margin: 0 0 20px;">Hey <strong>${name || 'Creator'}</strong>,</p>
        
        <p style="margin: 0 0 24px;">Your subscription to <strong style="color: #39FF14;">${planName}</strong> has been activated and you now have access to premium features!</p>
        
        <div style="background: rgba(57, 255, 20, 0.05); border: 1px solid #2a2a2a; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
            <tr>
              <td style="color: #888; font-size: 14px; padding: 8px 0; border-bottom: 1px solid #1a1a1a;">Plan</td>
              <td style="color: #F4E8D8; font-size: 14px; text-align: right; padding: 8px 0; border-bottom: 1px solid #1a1a1a;"><strong>${planName}</strong></td>
            </tr>
            <tr>
              <td style="color: #888; font-size: 14px; padding: 8px 0; border-bottom: 1px solid #1a1a1a;">Amount</td>
              <td style="color: #39FF14; font-size: 14px; text-align: right; padding: 8px 0; border-bottom: 1px solid #1a1a1a;"><strong>${amount} ${currency.toUpperCase()}</strong></td>
            </tr>
            <tr>
              <td style="color: #888; font-size: 14px; padding: 8px 0;">Activated</td>
              <td style="color: #F4E8D8; font-size: 14px; text-align: right; padding: 8px 0;">${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</td>
            </tr>
          </table>
        </div>
        
        <div style="background: rgba(0, 217, 255, 0.05); border-left: 3px solid #00D9FF; padding: 16px; border-radius: 8px; margin: 24px 0;">
          <p style="color: #F4E8D8; margin: 0; font-size: 14px;">
            <strong>💎 Premium Benefits Active</strong><br/>
            You now have unlimited cloud storage, priority support, advanced effects, and early access to new features!
          </p>
        </div>
        
        <p style="margin: 24px 0 0; font-size: 14px; color: #888;">
          Questions about your subscription? Visit your account dashboard or contact us anytime.
        </p>
      `,
      ctaText: '📊 View Account Dashboard',
      ctaUrl: accountUrl,
      footerNote: 'Receipts are available in your <a href="' + accountUrl + '" style="color: #FF6B35;">account dashboard</a>. Need help? Email <a href="mailto:admin@haos.fm" style="color: #FF6B35;">admin@haos.fm</a>.'
    });

    return this.sendEmail({
      to: email,
      subject: `⚡ Your ${planName} subscription is active!`,
      html,
    });
  }

  /**
   * Send subscription expiry reminder email (3 days before)
   */
  async sendSubscriptionExpiryReminder(email, name, planName, expiryDate, renewUrl) {
    const accountUrl = `${process.env.APP_URL || 'http://localhost:3000'}/account`;
    const formattedDate = new Date(expiryDate).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
    const daysLeft = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    
    const html = this.createEmailTemplate({
      title: '⏰ Subscription Expiring Soon',
      heading: `⏰ Your ${planName} expires in ${daysLeft} days`,
      content: `
        <p style="margin: 0 0 20px;">Hey <strong>${name || 'Creator'}</strong>,</p>
        
        <p style="margin: 0 0 24px;">Your <strong style="color: #FF6B35;">${planName}</strong> subscription will expire on <strong>${formattedDate}</strong>.</p>
        
        <div style="background: rgba(255, 107, 53, 0.1); border: 1px solid #FF6B35; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <p style="color: #F4E8D8; margin: 0; font-size: 14px;">
            <strong>🎵 Don't lose access to:</strong>
          </p>
          <ul style="color: #F4E8D8; margin: 12px 0 0; padding-left: 20px; font-size: 14px;">
            <li style="margin: 8px 0;">Unlimited cloud storage for your tracks</li>
            <li style="margin: 8px 0;">Advanced effects & synthesis tools</li>
            <li style="margin: 8px 0;">Priority support</li>
            <li style="margin: 8px 0;">Early access to new features</li>
          </ul>
        </div>
        
        <p style="margin: 24px 0 0; font-size: 14px; color: #888;">
          Renew now to continue enjoying premium features without interruption.
        </p>
      `,
      ctaText: '🔄 Renew Subscription',
      ctaUrl: renewUrl || accountUrl,
      footerNote: 'Manage your subscription in your <a href="' + accountUrl + '" style="color: #FF6B35;">account dashboard</a>.'
    });

    return this.sendEmail({
      to: email,
      subject: `⏰ Your ${planName} subscription expires in ${daysLeft} days`,
      html,
    });
  }

  /**
   * Send subscription expired notification
   */
  async sendSubscriptionExpired(email, name, planName, renewUrl) {
    const accountUrl = `${process.env.APP_URL || 'http://localhost:3000'}/account`;
    
    const html = this.createEmailTemplate({
      title: '📭 Subscription Expired',
      heading: `📭 Your ${planName} has expired`,
      content: `
        <p style="margin: 0 0 20px;">Hey <strong>${name || 'Creator'}</strong>,</p>
        
        <p style="margin: 0 0 24px;">Your <strong style="color: #888;">${planName}</strong> subscription has expired. You've been switched back to the free plan.</p>
        
        <div style="background: rgba(136, 136, 136, 0.1); border: 1px solid #444; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <p style="color: #F4E8D8; margin: 0; font-size: 14px;">
            <strong>📉 You've lost access to:</strong>
          </p>
          <ul style="color: #888; margin: 12px 0 0; padding-left: 20px; font-size: 14px;">
            <li style="margin: 8px 0;">Unlimited cloud storage (now limited to 100MB)</li>
            <li style="margin: 8px 0;">Advanced effects & synthesis tools</li>
            <li style="margin: 8px 0;">Priority support</li>
            <li style="margin: 8px 0;">Early access to new features</li>
          </ul>
        </div>
        
        <div style="background: rgba(57, 255, 20, 0.05); border-left: 3px solid #39FF14; padding: 16px; border-radius: 8px; margin: 24px 0;">
          <p style="color: #F4E8D8; margin: 0; font-size: 14px;">
            <strong>✨ Your projects are safe!</strong><br/>
            All your tracks and projects are still saved. Resubscribe anytime to regain full access.
          </p>
        </div>
        
        <p style="margin: 24px 0 0; font-size: 14px; color: #888;">
          Miss the premium features? Renew now and pick up where you left off.
        </p>
      `,
      ctaText: '🚀 Reactivate Premium',
      ctaUrl: renewUrl || accountUrl,
      footerNote: 'Questions? Email <a href="mailto:admin@haos.fm" style="color: #FF6B35;">admin@haos.fm</a>.'
    });

    return this.sendEmail({
      to: email,
      subject: `📭 Your ${planName} subscription has expired`,
      html,
    });
  }

  /**
   * Send payment failed notification
   */
  async sendPaymentFailed(email, name, planName, reason, retryUrl) {
    const accountUrl = `${process.env.APP_URL || 'http://localhost:3000'}/account`;
    
    const html = this.createEmailTemplate({
      title: '❌ Payment Failed',
      heading: `❌ Payment failed for ${planName}`,
      content: `
        <p style="margin: 0 0 20px;">Hey <strong>${name || 'Creator'}</strong>,</p>
        
        <p style="margin: 0 0 24px;">We couldn't process your payment for <strong style="color: #FF6B35;">${planName}</strong>.</p>
        
        ${reason ? `
        <div style="background: rgba(255, 107, 53, 0.1); border: 1px solid #FF6B35; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <p style="color: #F4E8D8; margin: 0; font-size: 14px;">
            <strong>Reason:</strong> ${reason}
          </p>
        </div>
        ` : ''}
        
        <p style="margin: 0 0 24px; font-size: 14px; color: #888;">
          Please update your payment method or try again to keep your subscription active.
        </p>
      `,
      ctaText: '💳 Update Payment Method',
      ctaUrl: retryUrl || accountUrl,
      footerNote: 'Need help? Email <a href="mailto:admin@haos.fm" style="color: #FF6B35;">admin@haos.fm</a>.'
    });

    return this.sendEmail({
      to: email,
      subject: `❌ Payment failed for your ${planName} subscription`,
      html,
    });
  }
}

// Export singleton instance
const emailService = new EmailService();
module.exports = emailService;
