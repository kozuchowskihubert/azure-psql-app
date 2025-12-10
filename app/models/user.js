/**
 * User Model
 * Handles user management, roles, and permissions
 */
const bcrypt = require('bcrypt');
const pool = require('../config/database');

class User {
  /**
   * Find user by ID
   */
  static async findById(userId) {
    const result = await pool.query(`
      SELECT u.*, 
        ARRAY_AGG(DISTINCT ur.role_name) FILTER (WHERE ur.role_name IS NOT NULL) as roles
      FROM users u
      LEFT JOIN user_role_assignments ura ON u.id = ura.user_id
      LEFT JOIN user_roles ur ON ura.role_id = ur.id
      WHERE u.id = $1
      GROUP BY u.id
    `, [userId]);
    return result.rows[0];
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const result = await pool.query(`
      SELECT * FROM users WHERE email = $1
    `, [email.toLowerCase()]);
    return result.rows[0];
  }

  /**
   * Find user by SSO provider
   */
  static async findBySSOProvider(provider, providerId) {
    const result = await pool.query(`
      SELECT * FROM users 
      WHERE sso_provider = $1 AND sso_provider_id = $2
    `, [provider, providerId]);
    return result.rows[0];
  }

  /**
   * Create a new user
   */
  static async create(data) {
    const result = await pool.query(`
      INSERT INTO users (
        email, display_name, first_name, last_name, avatar_url,
        sso_provider, sso_provider_id, sso_tenant_id,
        timezone, language, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      data.email.toLowerCase(),
      data.displayName || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      data.firstName,
      data.lastName,
      data.avatarUrl,
      data.ssoProvider || 'local',
      data.ssoProviderId || data.email.toLowerCase(),
      data.ssoTenantId,
      data.timezone || 'UTC',
      data.language || 'en',
      data.isActive !== false,
    ]);

    const user = result.rows[0];

    // Assign default role
    await this.assignRole(user.id, 'user');

    return user;
  }

  /**
   * Create or update user from SSO
   */
  static async upsertFromSSO(provider, profile) {
    const existing = await this.findBySSOProvider(provider, profile.id);

    if (existing) {
      // Update user
      const result = await pool.query(`
        UPDATE users SET
          display_name = COALESCE($3, display_name),
          first_name = COALESCE($4, first_name),
          last_name = COALESCE($5, last_name),
          avatar_url = COALESCE($6, avatar_url),
          last_login_at = NOW(),
          updated_at = NOW()
        WHERE sso_provider = $1 AND sso_provider_id = $2
        RETURNING *
      `, [
        provider,
        profile.id,
        profile.displayName,
        profile.firstName,
        profile.lastName,
        profile.avatarUrl,
      ]);
      return result.rows[0];
    }

    // Create new user
    return this.create({
      email: profile.email,
      displayName: profile.displayName,
      firstName: profile.firstName,
      lastName: profile.lastName,
      avatarUrl: profile.avatarUrl,
      ssoProvider: provider,
      ssoProviderId: profile.id,
      ssoTenantId: profile.tenantId,
    });
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId, data) {
    const updates = [];
    const values = [userId];
    let paramIndex = 2;

    const allowedFields = [
      'display_name', 'first_name', 'last_name', 'avatar_url',
      'timezone', 'language', 'date_format', 'time_format',
    ];

    const fieldMapping = {
      displayName: 'display_name',
      firstName: 'first_name',
      lastName: 'last_name',
      avatarUrl: 'avatar_url',
      dateFormat: 'date_format',
      timeFormat: 'time_format',
    };

    for (const [key, value] of Object.entries(data)) {
      const dbField = fieldMapping[key] || key;
      if (allowedFields.includes(dbField) && value !== undefined) {
        updates.push(`${dbField} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      return this.findById(userId);
    }

    updates.push('updated_at = NOW()');

    const result = await pool.query(`
      UPDATE users SET ${updates.join(', ')} WHERE id = $1 RETURNING *
    `, values);

    return result.rows[0];
  }

  /**
   * Deactivate user
   */
  static async deactivate(userId) {
    const result = await pool.query(`
      UPDATE users SET is_active = FALSE, updated_at = NOW()
      WHERE id = $1 RETURNING *
    `, [userId]);
    return result.rows[0];
  }

  /**
   * Reactivate user
   */
  static async reactivate(userId) {
    const result = await pool.query(`
      UPDATE users SET is_active = TRUE, updated_at = NOW()
      WHERE id = $1 RETURNING *
    `, [userId]);
    return result.rows[0];
  }

  /**
   * Get all users (admin)
   */
  static async findAll(options = {}) {
    const limit = options.limit || 50;
    const offset = options.offset || 0;
    const { search } = options;
    const { isActive } = options;

    let query = `
      SELECT u.*, 
        ARRAY_AGG(DISTINCT ur.role_name) FILTER (WHERE ur.role_name IS NOT NULL) as roles,
        sp.plan_code as subscription_plan
      FROM users u
      LEFT JOIN user_role_assignments ura ON u.id = ura.user_id
      LEFT JOIN user_roles ur ON ura.role_id = ur.id
      LEFT JOIN user_subscriptions us ON u.id = us.user_id AND us.status IN ('active', 'trialing')
      LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
    `;

    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(u.email ILIKE $${paramIndex} OR u.display_name ILIKE $${paramIndex})`);
      values.push(`%${search}%`);
      paramIndex++;
    }

    if (isActive !== undefined) {
      conditions.push(`u.is_active = $${paramIndex}`);
      values.push(isActive);
      paramIndex++;
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` GROUP BY u.id, sp.plan_code ORDER BY u.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * Count users
   */
  static async count(options = {}) {
    const { search } = options;
    const { isActive } = options;

    let query = 'SELECT COUNT(*) as count FROM users u';
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(u.email ILIKE $${paramIndex} OR u.display_name ILIKE $${paramIndex})`);
      values.push(`%${search}%`);
      paramIndex++;
    }

    if (isActive !== undefined) {
      conditions.push(`u.is_active = $${paramIndex}`);
      values.push(isActive);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count, 10);
  }

  // ============================================================================
  // ROLE MANAGEMENT
  // ============================================================================

  /**
   * Get all roles
   */
  static async getRoles() {
    const result = await pool.query('SELECT * FROM user_roles ORDER BY id');
    return result.rows;
  }

  /**
   * Get role by name
   */
  static async getRoleByName(roleName) {
    const result = await pool.query(
      'SELECT * FROM user_roles WHERE role_name = $1',
      [roleName],
    );
    return result.rows[0];
  }

  /**
   * Assign role to user
   */
  static async assignRole(userId, roleName, assignedBy = null) {
    const role = await this.getRoleByName(roleName);
    if (!role) {
      throw new Error(`Role ${roleName} not found`);
    }

    await pool.query(`
      INSERT INTO user_role_assignments (user_id, role_id, assigned_by)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, role_id) DO NOTHING
    `, [userId, role.id, assignedBy]);

    return this.findById(userId);
  }

  /**
   * Remove role from user
   */
  static async removeRole(userId, roleName) {
    const role = await this.getRoleByName(roleName);
    if (!role) {
      throw new Error(`Role ${roleName} not found`);
    }

    await pool.query(`
      DELETE FROM user_role_assignments 
      WHERE user_id = $1 AND role_id = $2
    `, [userId, role.id]);

    return this.findById(userId);
  }

  /**
   * Check if user has role
   */
  static async hasRole(userId, roleName) {
    const result = await pool.query(`
      SELECT 1 FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = $1 AND ur.role_name = $2
    `, [userId, roleName]);
    return result.rows.length > 0;
  }

  /**
   * Check if user has permission
   */
  static async hasPermission(userId, resource, action) {
    const result = await pool.query(`
      SELECT ur.permissions
      FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = $1
    `, [userId]);

    for (const row of result.rows) {
      const permissions = row.permissions || {};
      const resourcePerms = permissions[resource] || [];
      if (resourcePerms.includes(action) || resourcePerms.includes('*')) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get user's permissions
   */
  static async getPermissions(userId) {
    const result = await pool.query(`
      SELECT ur.permissions
      FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = $1
    `, [userId]);

    const merged = {};
    for (const row of result.rows) {
      const permissions = row.permissions || {};
      for (const [resource, actions] of Object.entries(permissions)) {
        if (!merged[resource]) merged[resource] = [];
        merged[resource] = [...new Set([...merged[resource], ...actions])];
      }
    }

    return merged;
  }

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  /**
   * Create user session
   */
  static async createSession(userId, tokens, metadata = {}) {
    const sessionToken = require('crypto').randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const result = await pool.query(`
      INSERT INTO user_sessions (
        user_id, access_token, refresh_token, id_token, token_expires_at,
        session_token, ip_address, user_agent, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      userId,
      tokens.accessToken,
      tokens.refreshToken,
      tokens.idToken,
      tokens.expiresAt,
      sessionToken,
      metadata.ipAddress,
      metadata.userAgent,
      expiresAt,
    ]);

    // Update last login
    await pool.query(`
      UPDATE users SET last_login_at = NOW() WHERE id = $1
    `, [userId]);

    return result.rows[0];
  }

  /**
   * Find session by token
   */
  static async findSession(sessionToken) {
    const result = await pool.query(`
      SELECT us.*, u.email, u.display_name, u.is_active
      FROM user_sessions us
      JOIN users u ON us.user_id = u.id
      WHERE us.session_token = $1 AND us.expires_at > NOW()
    `, [sessionToken]);
    return result.rows[0];
  }

  /**
   * Invalidate session
   */
  static async invalidateSession(sessionToken) {
    await pool.query(`
      DELETE FROM user_sessions WHERE session_token = $1
    `, [sessionToken]);
  }

  /**
   * Invalidate all user sessions
   */
  static async invalidateAllSessions(userId) {
    await pool.query(`
      DELETE FROM user_sessions WHERE user_id = $1
    `, [userId]);
  }

  /**
   * Clean expired sessions
   */
  static async cleanExpiredSessions() {
    await pool.query(`
      DELETE FROM user_sessions WHERE expires_at < NOW()
    `);
  }
}

module.exports = User;
