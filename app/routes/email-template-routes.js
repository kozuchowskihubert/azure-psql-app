/**
 * Email Template Routes
 * Admin API for managing customizable email templates
 */

const express = require('express');
const router = express.Router();
const emailTemplateService = require('../services/email-template-service');
const emailService = require('../services/email-service');

// Middleware to check admin role (customize as needed)
const requireAdmin = (req, res, next) => {
  // TODO: Replace with actual admin check from your auth system
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

/**
 * GET /api/admin/email-templates
 * List all available email templates
 */
router.get('/', requireAdmin, (req, res) => {
  try {
    const templates = emailTemplateService.listTemplates();
    const languages = emailTemplateService.listLanguages();
    const branding = emailTemplateService.getBranding();
    
    res.json({
      success: true,
      templates,
      languages,
      branding
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/email-templates/:name
 * Get specific template details
 */
router.get('/:name', requireAdmin, (req, res) => {
  try {
    const { name } = req.params;
    const { language = 'en' } = req.query;
    
    const template = emailTemplateService.getTemplate(name, language);
    
    res.json({
      success: true,
      template,
      name,
      language
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

/**
 * PUT /api/admin/email-templates/:name
 * Update a specific template
 */
router.put('/:name', requireAdmin, (req, res) => {
  try {
    const { name } = req.params;
    const updates = req.body;
    
    const updatedTemplate = emailTemplateService.updateTemplate(name, updates);
    
    res.json({
      success: true,
      template: updatedTemplate,
      message: `Template '${name}' updated successfully`
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * PUT /api/admin/email-templates/branding
 * Update branding configuration
 */
router.put('/config/branding', requireAdmin, (req, res) => {
  try {
    const updates = req.body;
    const updatedBranding = emailTemplateService.updateBranding(updates);
    
    res.json({
      success: true,
      branding: updatedBranding,
      message: 'Branding updated successfully'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/admin/email-templates/reload
 * Reload templates from JSON file
 */
router.post('/reload', requireAdmin, (req, res) => {
  try {
    const result = emailTemplateService.reloadTemplates();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/email-templates/preview
 * Preview a template with sample data
 */
router.post('/preview', requireAdmin, (req, res) => {
  try {
    const { templateName, variables = {}, language = 'en' } = req.body;
    
    if (!templateName) {
      return res.status(400).json({ error: 'templateName is required' });
    }
    
    // Add sample data for preview
    const sampleVars = {
      name: 'John Doe',
      verificationUrl: 'https://haos.fm/verify/sample-token',
      dashboardUrl: 'https://haos.fm/dashboard',
      resetUrl: 'https://haos.fm/reset/sample-token',
      accountUrl: 'https://haos.fm/account',
      renewUrl: 'https://haos.fm/subscription/renew',
      retryUrl: 'https://haos.fm/account/payment',
      planName: 'Premium',
      amount: '49.99',
      currency: 'PLN',
      activationDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      daysLeft: '3',
      failureReason: 'Card declined - insufficient funds',
      inviterName: 'Jane Smith',
      projectName: 'Summer Beats 2025',
      projectUrl: 'https://haos.fm/project/123',
      sharerName: 'DJ Master',
      trackName: 'Midnight Groove',
      trackUrl: 'https://haos.fm/track/456',
      featureName: 'AI-Powered Mastering',
      featureDescription: 'Automatically master your tracks with our new AI engine.',
      featureUrl: 'https://haos.fm/features/ai-mastering',
      tracksCreated: '12',
      totalPlaytime: '3h 45m',
      collaborations: '4',
      ...variables
    };
    
    const { subject, html, text } = emailTemplateService.buildEmail(templateName, sampleVars, language);
    
    res.json({
      success: true,
      preview: {
        subject,
        html,
        text: text.substring(0, 500) + '...'
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/admin/email-templates/test-send
 * Send a test email
 */
router.post('/test-send', requireAdmin, async (req, res) => {
  try {
    const { templateName, to, variables = {}, language = 'en' } = req.body;
    
    if (!templateName || !to) {
      return res.status(400).json({ error: 'templateName and to are required' });
    }
    
    // Initialize email service if needed
    await emailService.initialize();
    
    const result = await emailService.sendTemplatedEmail(templateName, to, variables, language);
    
    res.json({
      success: result.success,
      message: result.success ? `Test email sent to ${to}` : 'Failed to send email',
      error: result.error
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/email-templates/validate/:name
 * Validate template variables
 */
router.get('/validate/:name', requireAdmin, (req, res) => {
  try {
    const { name } = req.params;
    const { variables = '{}' } = req.query;
    
    const providedVars = JSON.parse(variables);
    const validation = emailTemplateService.validateVariables(name, providedVars);
    
    res.json({
      success: true,
      validation
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
