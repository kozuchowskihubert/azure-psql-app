/**
 * Send real confirmation email
 */
require('dotenv').config();
const nodemailer = require('nodemailer');

async function sendConfirmationEmail() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 40px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #00d4ff; margin: 0;">🎵 HAOS.fm</h1>
    </div>
    
    <h2 style="color: #00d4ff;">Twoja subskrypcja Premium została aktywowana!</h2>
    
    <p>Cześć <strong>Hubert</strong>,</p>
    
    <p>Dziękujemy za zakup subskrypcji <strong style="color: #00d4ff;">Premium</strong>!</p>
    
    <div style="background: #1a1a2e; padding: 20px; border-radius: 10px; margin: 20px 0;">
      <p style="margin: 5px 0;">💳 <strong>Kwota:</strong> 49.00 PLN</p>
      <p style="margin: 5px 0;">📅 <strong>Ważna do:</strong> 10 stycznia 2026</p>
      <p style="margin: 5px 0;">🎵 <strong>Plan:</strong> Premium</p>
    </div>
    
    <p>Masz teraz dostęp do wszystkich funkcji Premium:</p>
    <ul style="color: #ccc;">
      <li>✅ Nieograniczone projekty</li>
      <li>✅ Wszystkie instrumenty</li>
      <li>✅ Eksport WAV/MP3</li>
      <li>✅ Priorytetowe wsparcie</li>
    </ul>
    
    <div style="text-align: center; margin-top: 30px;">
      <a href="https://haos.fm/studio" style="background: linear-gradient(135deg, #00d4ff, #0099cc); color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">Otwórz Studio</a>
    </div>
    
    <hr style="border-color: #333; margin: 30px 0;">
    <p style="color: #666; font-size: 12px; text-align: center;">
      © 2025 HAOS.fm - Professional Music Production Platform
    </p>
  </div>
  `;

  console.log('📧 Sending confirmation email to hubertkozuchowski@gmail.com...');

  try {
    const result = await transporter.sendMail({
      from: 'HAOS.fm <admin@haos.fm>',
      to: 'hubertkozuchowski@gmail.com',
      subject: '🎉 Twoja subskrypcja Premium została aktywowana!',
      html: html
    });

    console.log('✅ Email wysłany!');
    console.log('   Message ID:', result.messageId);
  } catch (error) {
    console.error('❌ Błąd:', error.message);
  }
}

sendConfirmationEmail();
