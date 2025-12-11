/**
 * Email Template Service
 * Loads and processes customizable email templates from JSON configuration
 * Supports multi-language, variable substitution, and custom branding
 */

const fs = require('fs');
const path = require('path');

class EmailTemplateService {
  constructor() {
    this.templates = null;
    this.defaultLanguage = 'en';
    this.configPath = path.join(__dirname, '../config/email-templates.json');
    this.loadTemplates();
  }

  /**
   * Load templates from JSON file
   */
  loadTemplates() {
    try {
      const configData = fs.readFileSync(this.configPath, 'utf8');
      this.templates = JSON.parse(configData);
      console.log('✓ Email templates loaded');
    } catch (error) {
      console.error('❌ Failed to load email templates:', error.message);
      this.templates = this.getDefaultTemplates();
    }
  }

  /**
   * Reload templates (useful for hot-reloading in development)
   */
  reloadTemplates() {
    this.loadTemplates();
    return { success: true, message: 'Templates reloaded' };
  }

  /**
   * Get branding configuration
   */
  getBranding() {
    return this.templates?.branding || {
      companyName: 'HAOS.fm',
      primaryColor: '#FF6B35',
      secondaryColor: '#39FF14',
      accentColor: '#00D9FF',
      backgroundColor: '#0A0A0A',
      textColor: '#F4E8D8',
      supportEmail: 'admin@haos.fm',
      websiteUrl: 'https://haos.fm'
    };
  }

  /**
   * Get template by name and language
   * Falls back to English if language not available
   */
  getTemplate(templateName, language = 'en') {
    const baseTemplate = this.templates?.templates?.[templateName];
    if (!baseTemplate) {
      throw new Error(`Template '${templateName}' not found`);
    }

    // Check for language-specific override
    const langOverride = this.templates?.languages?.[language]?.templates?.[templateName];
    
    // Merge base template with language override
    return {
      ...baseTemplate,
      ...langOverride
    };
  }

  /**
   * Get common phrases for a language
   */
  getCommonPhrases(language = 'en') {
    return this.templates?.languages?.[language]?.common || 
           this.templates?.languages?.['en']?.common || {};
  }

  /**
   * Replace variables in text
   * Supports {{variable}} syntax and **bold** markdown
   */
  replaceVariables(text, variables) {
    if (!text) return '';
    
    let result = text;
    
    // Replace {{variable}} patterns
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value || '');
    }
    
    // Convert **bold** to <strong>
    result = result.replace(/\*\*(.+?)\*\*/g, '<strong style="color: #F4E8D8;">$1</strong>');
    
    return result;
  }

  /**
   * Process array content (paragraphs, list items)
   */
  processContent(content, variables) {
    if (Array.isArray(content)) {
      return content.map(item => this.replaceVariables(item, variables));
    }
    return this.replaceVariables(content, variables);
  }

  /**
   * Build HTML email from template
   */
  buildEmail(templateName, variables = {}, language = 'en') {
    const template = this.getTemplate(templateName, language);
    const branding = this.getBranding();
    const common = this.getCommonPhrases(language);
    
    // Merge branding and common vars into variables
    const allVars = {
      ...branding,
      ...common,
      year: new Date().getFullYear(),
      ...variables
    };

    // Process template fields
    const subject = this.replaceVariables(template.subject, allVars);
    const title = this.replaceVariables(template.title, allVars);
    const heading = this.replaceVariables(template.heading, allVars);
    const content = this.processContent(template.content, allVars);
    const ctaText = this.replaceVariables(template.ctaText, allVars);
    const ctaUrl = this.replaceVariables(template.ctaUrl, allVars);
    const footer = this.replaceVariables(template.footer, allVars);

    // Build HTML
    const html = this.generateHTML({
      branding,
      title,
      heading,
      content,
      ctaText,
      ctaUrl,
      footer,
      template,
      allVars
    });

    return { subject, html, text: this.htmlToText(html) };
  }

  /**
   * Generate HTML email with consistent styling
   */
  generateHTML({ branding, title, heading, content, ctaText, ctaUrl, footer, template, allVars }) {
    const contentHtml = Array.isArray(content) 
      ? content.map(p => `<p style="margin: 0 0 16px; line-height: 1.6;">${p}</p>`).join('')
      : `<p style="margin: 0 0 16px; line-height: 1.6;">${content}</p>`;

    // Build benefits/warning list if present
    let listHtml = '';
    const listItems = template.benefits || template.warningItems || template.lostAccessItems;
    const listTitle = template.warningTitle || template.lostAccessTitle;
    
    if (listItems) {
      const processedItems = listItems.map(item => this.replaceVariables(item, allVars));
      listHtml = `
        <div style="background: rgba(255, 107, 53, 0.1); border-left: 3px solid ${branding.primaryColor}; padding: 16px; border-radius: 8px; margin: 24px 0;">
          ${listTitle ? `<p style="color: ${branding.textColor}; margin: 0 0 12px; font-size: 14px;"><strong>${this.replaceVariables(listTitle, allVars)}</strong></p>` : ''}
          <ul style="color: ${branding.textColor}; margin: 0; padding-left: 20px; font-size: 14px;">
            ${processedItems.map(item => `<li style="margin: 8px 0;">${item}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    // Build details table if present
    let detailsHtml = '';
    if (template.details) {
      const rows = Object.entries(template.details).map(([key, value]) => {
        const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
        const processedValue = this.replaceVariables(value, allVars);
        return `
          <tr>
            <td style="color: ${branding.mutedColor}; font-size: 14px; padding: 8px 0; border-bottom: 1px solid #1a1a1a;">${label}</td>
            <td style="color: ${branding.textColor}; font-size: 14px; text-align: right; padding: 8px 0; border-bottom: 1px solid #1a1a1a;"><strong>${processedValue}</strong></td>
          </tr>
        `;
      }).join('');
      
      detailsHtml = `
        <div style="background: rgba(57, 255, 20, 0.05); border: 1px solid #2a2a2a; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
            ${rows}
          </table>
        </div>
      `;
    }

    // Build reassurance box if present
    let reassuranceHtml = '';
    if (template.reassurance) {
      reassuranceHtml = `
        <div style="background: rgba(57, 255, 20, 0.05); border-left: 3px solid ${branding.secondaryColor}; padding: 16px; border-radius: 8px; margin: 24px 0;">
          <p style="color: ${branding.textColor}; margin: 0; font-size: 14px;">
            ${this.replaceVariables(template.reassurance, allVars)}
          </p>
        </div>
      `;
    }

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${branding.backgroundColor}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${branding.backgroundColor}; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background: linear-gradient(145deg, #1a1a1a 0%, #0d0d0d 100%); border-radius: 16px; overflow: hidden; border: 1px solid #2a2a2a;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${branding.primaryColor}22 0%, transparent 100%); padding: 32px; text-align: center; border-bottom: 1px solid #2a2a2a;">
              <img src="${branding.logoUrl}" alt="${branding.companyName}" style="height: 48px; margin-bottom: 16px;">
              <h1 style="color: ${branding.textColor}; font-size: 28px; margin: 0; font-weight: 700; letter-spacing: -0.5px;">
                ${heading}
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px; color: ${branding.textColor}; font-size: 16px; line-height: 1.6;">
              ${contentHtml}
              ${detailsHtml}
              ${listHtml}
              ${reassuranceHtml}
              
              <!-- CTA Button -->
              ${ctaUrl ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${ctaUrl}" style="display: inline-block; background: linear-gradient(135deg, ${branding.primaryColor} 0%, #e55a2b 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px ${branding.primaryColor}44;">
                      ${ctaText}
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}
              
              <!-- Footer Note -->
              ${footer ? `
              <p style="margin: 24px 0 0; font-size: 14px; color: ${branding.mutedColor};">
                ${footer}
              </p>
              ` : ''}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #0a0a0a; padding: 24px; text-align: center; border-top: 1px solid #2a2a2a;">
              <p style="color: ${branding.mutedColor}; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} ${branding.companyName}. All rights reserved.
              </p>
              <p style="color: ${branding.mutedColor}; font-size: 12px; margin: 8px 0 0;">
                <a href="${branding.websiteUrl}" style="color: ${branding.primaryColor}; text-decoration: none;">${branding.websiteUrl}</a>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  /**
   * Convert HTML to plain text
   */
  htmlToText(html) {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gs, '')
      .replace(/<script[^>]*>.*?<\/script>/gs, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Get list of available templates
   */
  listTemplates() {
    return Object.keys(this.templates?.templates || {});
  }

  /**
   * Get list of supported languages
   */
  listLanguages() {
    return Object.keys(this.templates?.languages || {});
  }

  /**
   * Validate template variables
   */
  validateVariables(templateName, providedVars) {
    const template = this.templates?.templates?.[templateName];
    if (!template) return { valid: false, error: 'Template not found' };
    
    const required = template.variables || [];
    const missing = required.filter(v => !providedVars.hasOwnProperty(v));
    
    return {
      valid: missing.length === 0,
      missing,
      provided: Object.keys(providedVars)
    };
  }

  /**
   * Get default templates (fallback)
   */
  getDefaultTemplates() {
    return {
      branding: {
        companyName: 'HAOS.fm',
        primaryColor: '#FF6B35',
        secondaryColor: '#39FF14',
        backgroundColor: '#0A0A0A',
        textColor: '#F4E8D8',
        supportEmail: 'admin@haos.fm',
        websiteUrl: 'https://haos.fm'
      },
      templates: {},
      languages: { en: { common: {} } }
    };
  }

  /**
   * Update template configuration
   */
  updateTemplate(templateName, updates) {
    if (!this.templates.templates[templateName]) {
      throw new Error(`Template '${templateName}' not found`);
    }
    
    this.templates.templates[templateName] = {
      ...this.templates.templates[templateName],
      ...updates
    };
    
    // Save to file
    this.saveTemplates();
    return this.templates.templates[templateName];
  }

  /**
   * Update branding configuration
   */
  updateBranding(updates) {
    this.templates.branding = {
      ...this.templates.branding,
      ...updates
    };
    
    this.saveTemplates();
    return this.templates.branding;
  }

  /**
   * Save templates to JSON file
   */
  saveTemplates() {
    try {
      this.templates.meta.lastUpdated = new Date().toISOString().split('T')[0];
      fs.writeFileSync(this.configPath, JSON.stringify(this.templates, null, 2));
      console.log('✓ Email templates saved');
      return true;
    } catch (error) {
      console.error('❌ Failed to save templates:', error.message);
      return false;
    }
  }
}

// Export singleton instance
const emailTemplateService = new EmailTemplateService();
module.exports = emailTemplateService;
