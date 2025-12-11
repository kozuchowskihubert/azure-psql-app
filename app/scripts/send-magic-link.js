const crypto = require('crypto');
const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const pool = new Pool({
  host: 'localhost',
  user: 'haos',
  database: 'haos_dev',
  port: 5432
});

async function sendMagicLink(email) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min
  
  // Save to database
  await pool.query(
    'INSERT INTO magic_links (email, token, expires_at) VALUES ($1, $2, $3)',
    [email, token, expiresAt]
  );
  
  console.log('Token saved to database');
  
  // Send email via Resend API
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.SMTP_PASS,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'HAOS <noreply@haos.fm>',
      to: email,
      subject: '🎵 Twój link do logowania - HAOS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1DB954;">Witaj w HAOS!</h2>
          <p>Kliknij poniższy link, aby się zalogować:</p>
          <p style="margin: 20px 0;">
            <a href="https://haos.fm/auth/magic?token=${token}" 
               style="background: #1DB954; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
              Zaloguj się do HAOS
            </a>
          </p>
          <p style="color: #666; font-size: 12px;">Link wygasa za 15 minut.</p>
        </div>
      `
    })
  });
  
  const result = await response.json();
  console.log('Email sent:', result);
  await pool.end();
}

const email = process.argv[2] || 'byqpatryk@gmail.com';
sendMagicLink(email).catch(console.error);
