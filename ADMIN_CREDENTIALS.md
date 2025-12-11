# 🔐 HAOS.fm Admin Credentials

## Default Admin Account

### For Local Development:

**Email:** `admin@haos.fm`  
**Password:** `haos2025!Admin`

> ⚠️ **IMPORTANT:** Change this password immediately after first login!

---

## Creating the Admin User

### Step 1: Run Database Migration
```bash
cd /Users/haos/azure-psql-app
psql -d haos_dev -f migrations/001_init_auth.sql
```

### Step 2: Create Admin User
```bash
cd /Users/haos/azure-psql-app
node scripts/create-admin.js
```

This will create the admin user with the default credentials above.

---

## Alternative: Create Test User (Optional)

If you want to create a test user instead, uncomment this line in `migrations/001_init_auth.sql`:

```sql
-- Uncomment this line:
INSERT INTO users (email, password, name) VALUES 
('test@haos.fm', '$2b$10$ZK9K6gqYYqYYqYYqYYqYYuK7E5XKZ6gqYYqYYqYYqYYq', 'Test User');
```

**Test User Credentials:**
- Email: `test@haos.fm`
- Password: `test123`

---

## Login URLs

### Local Development:
- **Login Page:** http://localhost:3000/login.html
- **Dashboard:** http://localhost:3000/dashboard.html
- **API Keys:** http://localhost:3000/api-keys.html
- **Community:** http://localhost:3000/community.html

### Production (Vercel):
- **Login Page:** https://your-domain.vercel.app/login.html
- **Dashboard:** https://your-domain.vercel.app/dashboard.html

---

## Manual Database Query (If Needed)

If you want to manually create a user in the database:

```sql
-- Connect to database
psql -d haos_dev

-- Create admin user (password: haos2025!Admin)
INSERT INTO users (email, password, name, created_at, updated_at)
VALUES (
  'admin@haos.fm',
  '$2b$10$XYZ...', -- Use bcrypt hash
  'HAOS Admin',
  NOW(),
  NOW()
);

-- Verify user was created
SELECT id, email, name, created_at FROM users WHERE email = 'admin@haos.fm';
```

---

## Password Hashing (Node.js)

If you need to generate a bcrypt hash for a custom password:

```javascript
const bcrypt = require('bcrypt');

async function hashPassword(password) {
  const hash = await bcrypt.hash(password, 10);
  console.log('Hashed password:', hash);
}

hashPassword('your-password-here');
```

---

## Resetting Password

### Method 1: Using the Script
1. Delete the existing user:
   ```sql
   DELETE FROM users WHERE email = 'admin@haos.fm';
   ```
2. Run the create-admin script again:
   ```bash
   node scripts/create-admin.js
   ```

### Method 2: Direct Database Update
```sql
-- Update password (this is for 'newpassword123')
UPDATE users 
SET password = '$2b$10$NewHashHere...', 
    updated_at = NOW()
WHERE email = 'admin@haos.fm';
```

---

## Security Notes

### For Production:
1. **Never commit credentials** to Git
2. **Change default passwords** immediately
3. **Use strong passwords** (16+ characters, mixed case, numbers, symbols)
4. **Enable 2FA** when implementing additional security features
5. **Rotate passwords regularly** (every 90 days)

### For Development:
- The test credentials above are fine for local development
- Don't use these in production!
- Keep your `.env` file in `.gitignore`

---

## OAuth Alternative

Instead of email/password, you can also log in with:

- **Google OAuth** (if configured in `.env`)
- **Azure AD** (if configured in `.env`)

To enable OAuth, add these to your `.env`:

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

---

## Troubleshooting

### "Invalid credentials" error
- Check that the user exists: `SELECT * FROM users WHERE email = 'admin@haos.fm';`
- Verify password hash is correct
- Try resetting the password

### "Database connection error"
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in `.env`
- Check database exists: `psql -l | grep haos`

### "User not found"
- Run the create-admin script
- Or uncomment test user in migration and re-run it

---

## Quick Start Commands

```bash
# 1. Start PostgreSQL
brew services start postgresql@14

# 2. Create database (if needed)
createdb haos_dev

# 3. Run migration
psql -d haos_dev -f migrations/001_init_auth.sql

# 4. Create admin user
node scripts/create-admin.js

# 5. Start server
cd app && npm start

# 6. Login at http://localhost:3000/login.html
```

---

**Default Credentials Summary:**

| Email | Password | Type |
|-------|----------|------|
| admin@haos.fm | haos2025!Admin | Admin (created by script) |
| test@haos.fm | test123 | Test User (optional) |

**Remember to change these after first login!** 🔒
