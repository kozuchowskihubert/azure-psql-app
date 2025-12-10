/**
 * HAOS Platform - Preset Manager API Routes
 * RESTful API for preset CRUD operations with tier-based access control
 * 
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost/haos_dev'
});

/**
 * Middleware: Check if user is authenticated
 */
function requireAuth(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
}

/**
 * Middleware: Check if user has premium access
 */
async function requirePremium(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const result = await pool.query(
            'SELECT roles FROM users WHERE id = $1',
            [req.session.userId]
        );

        if (!result.rows[0]) {
            return res.status(401).json({ error: 'User not found' });
        }

        const roles = result.rows[0].roles || [];
        if (!roles.includes('premium') && !roles.includes('admin')) {
            return res.status(403).json({ 
                error: 'Premium subscription required',
                upgradeUrl: '/pricing'
            });
        }

        next();
    } catch (error) {
        console.error('Premium check error:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

/**
 * GET /api/presets/categories
 * Get list of categories with counts
 * NOTE: This MUST come before /presets/:id to avoid route matching issues
 */
router.get('/presets/categories', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                category,
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE tier = 'free') as free,
                COUNT(*) FILTER (WHERE tier = 'premium') as premium
            FROM presets
            GROUP BY category
            ORDER BY category
        `);

        res.json({ categories: result.rows });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

/**
 * GET /api/presets
 * List presets with filtering and pagination
 * Query params: category, tier, search, genre, difficulty, page, limit, sort
 */
router.get('/presets', async (req, res) => {
    try {
        const {
            category,
            tier,
            search,
            genre,
            difficulty,
            tags,
            page = 1,
            limit = 50,
            sort = 'rating' // rating, downloads, created_at, name
        } = req.query;

        // Build WHERE clause
        const conditions = [];
        const params = [];
        let paramCount = 1;

        if (category) {
            conditions.push(`category = $${paramCount++}`);
            params.push(category);
        }

        if (tier) {
            conditions.push(`tier = $${paramCount++}`);
            params.push(tier);
        }
        // Note: We show all presets but lock premium content when accessed

        if (genre) {
            conditions.push(`genre = $${paramCount++}`);
            params.push(genre);
        }

        if (difficulty) {
            conditions.push(`difficulty = $${paramCount++}`);
            params.push(difficulty);
        }

        if (search) {
            conditions.push(`(name ILIKE $${paramCount} OR $${paramCount} = ANY(tags))`);
            params.push(`%${search}%`);
            paramCount++;
        }

        if (tags) {
            const tagArray = tags.split(',');
            conditions.push(`tags && $${paramCount}::text[]`);
            params.push(tagArray);
            paramCount++;
        }

        const whereClause = conditions.length > 0 
            ? 'WHERE ' + conditions.join(' AND ')
            : '';

        // Sorting
        const sortColumns = {
            rating: 'rating DESC, rating_count DESC',
            downloads: 'downloads DESC',
            created_at: 'created_at DESC',
            name: 'name ASC'
        };
        const orderBy = sortColumns[sort] || sortColumns.rating;

        // Pagination
        const offset = (page - 1) * limit;

        // Get total count
        const countQuery = `SELECT COUNT(*) FROM presets ${whereClause}`;
        const countResult = await pool.query(countQuery, params);
        const total = parseInt(countResult.rows[0].count);

        // Get presets
        const query = `
            SELECT 
                id, name, category, subcategory, tier, tags, 
                bpm, key, genre, difficulty, author, 
                downloads, rating, rating_count, preview_url, waveform_image,
                created_at
            FROM presets
            ${whereClause}
            ORDER BY ${orderBy}
            LIMIT $${paramCount} OFFSET $${paramCount + 1}
        `;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        res.json({
            presets: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching presets:', error);
        res.status(500).json({ error: 'Failed to fetch presets' });
    }
});

/**
 * GET /api/presets/:id
 * Get preset details with full parameters
 */
router.get('/presets/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'SELECT * FROM presets WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Preset not found' });
        }

        const preset = result.rows[0];

        // Check tier access
        if (preset.tier === 'premium') {
            const isPremium = req.session?.userId && await checkUserPremium(req.session.userId);
            if (!isPremium) {
                return res.status(403).json({
                    error: 'Premium preset - subscription required',
                    preset: {
                        id: preset.id,
                        name: preset.name,
                        category: preset.category,
                        tier: preset.tier
                    },
                    upgradeUrl: '/pricing'
                });
            }
        }

        res.json({ preset });
    } catch (error) {
        console.error('Error fetching preset:', error);
        res.status(500).json({ error: 'Failed to fetch preset' });
    }
});

/**
 * POST /api/presets
 * Create user preset (requires authentication)
 */
router.post('/presets', requireAuth, async (req, res) => {
    try {
        const {
            name,
            category,
            subcategory,
            tags = [],
            bpm,
            key,
            genre,
            module_params,
            sequence_data
        } = req.body;

        if (!name || !category || !module_params) {
            return res.status(400).json({ 
                error: 'Missing required fields: name, category, module_params' 
            });
        }

        const id = `user_preset_${req.session.userId}_${Date.now()}`;

        const result = await pool.query(`
            INSERT INTO presets (
                id, name, category, subcategory, tier, tags, 
                bpm, key, genre, difficulty, author, 
                module_params, sequence_data
            )
            VALUES ($1, $2, $3, $4, 'free', $5, $6, $7, $8, 'intermediate', $9, $10, $11)
            RETURNING *
        `, [
            id, name, category, subcategory, tags, 
            bpm, key, genre, 
            req.session.userEmail || 'User',
            JSON.stringify(module_params),
            sequence_data ? JSON.stringify(sequence_data) : null
        ]);

        // Add to user_presets
        await pool.query(
            'INSERT INTO user_presets (user_id, preset_id, is_favorite) VALUES ($1, $2, true)',
            [req.session.userId, id]
        );

        res.status(201).json({ preset: result.rows[0] });
    } catch (error) {
        console.error('Error creating preset:', error);
        res.status(500).json({ error: 'Failed to create preset' });
    }
});

/**
 * PUT /api/presets/:id/rate
 * Rate a preset
 */
router.put('/presets/:id/rate', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, review } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        // Check if preset exists
        const presetCheck = await pool.query('SELECT id FROM presets WHERE id = $1', [id]);
        if (presetCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Preset not found' });
        }

        // Insert or update rating
        await pool.query(`
            INSERT INTO preset_ratings (preset_id, user_id, rating, review)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (preset_id, user_id) 
            DO UPDATE SET rating = $3, review = $4
        `, [id, req.session.userId, rating, review]);

        // Recalculate preset rating
        const ratingResult = await pool.query(`
            SELECT AVG(rating)::DECIMAL(3,2) as avg_rating, COUNT(*) as count
            FROM preset_ratings
            WHERE preset_id = $1
        `, [id]);

        await pool.query(`
            UPDATE presets 
            SET rating = $1, rating_count = $2, updated_at = NOW()
            WHERE id = $3
        `, [
            ratingResult.rows[0].avg_rating,
            ratingResult.rows[0].count,
            id
        ]);

        res.json({ 
            success: true,
            rating: ratingResult.rows[0].avg_rating,
            rating_count: ratingResult.rows[0].count
        });
    } catch (error) {
        console.error('Error rating preset:', error);
        res.status(500).json({ error: 'Failed to rate preset' });
    }
});

/**
 * POST /api/presets/:id/favorite
 * Add preset to favorites
 */
router.post('/presets/:id/favorite', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query(`
            INSERT INTO user_presets (user_id, preset_id, is_favorite)
            VALUES ($1, $2, true)
            ON CONFLICT (user_id, preset_id)
            DO UPDATE SET is_favorite = true
        `, [req.session.userId, id]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error adding favorite:', error);
        res.status(500).json({ error: 'Failed to add favorite' });
    }
});

/**
 * DELETE /api/presets/:id/favorite
 * Remove preset from favorites
 */
router.delete('/presets/:id/favorite', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query(`
            UPDATE user_presets 
            SET is_favorite = false
            WHERE user_id = $1 AND preset_id = $2
        `, [req.session.userId, id]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error removing favorite:', error);
        res.status(500).json({ error: 'Failed to remove favorite' });
    }
});

/**
 * GET /api/presets/user/favorites
 * Get user's favorite presets
 */
router.get('/presets/user/favorites', requireAuth, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.*
            FROM presets p
            INNER JOIN user_presets up ON p.id = up.preset_id
            WHERE up.user_id = $1 AND up.is_favorite = true
            ORDER BY up.added_at DESC
        `, [req.session.userId]);

        res.json({ presets: result.rows });
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ error: 'Failed to fetch favorites' });
    }
});

/**
 * Helper: Check if user has premium access
 */
async function checkUserPremium(userId) {
    try {
        const result = await pool.query(
            'SELECT roles FROM users WHERE id = $1',
            [userId]
        );
        const roles = result.rows[0]?.roles || [];
        return roles.includes('premium') || roles.includes('admin');
    } catch {
        return false;
    }
}

module.exports = router;
