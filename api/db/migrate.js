const { Pool } = require('pg');

module.exports = async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();

        // Create users table
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255),
                name VARCHAR(255),
                bio TEXT,
                google_id VARCHAR(255) UNIQUE,
                azure_id VARCHAR(255) UNIQUE,
                default_workspace VARCHAR(100) DEFAULT 'haos-platform',
                theme VARCHAR(50) DEFAULT 'dark',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                last_login_at TIMESTAMP WITH TIME ZONE
            );
        `);

        // Create indexes
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
            CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;
            CREATE INDEX IF NOT EXISTS idx_users_azure_id ON users(azure_id) WHERE azure_id IS NOT NULL;
        `);

        // Create session table
        await client.query(`
            CREATE TABLE IF NOT EXISTS session (
                sid VARCHAR NOT NULL COLLATE "default",
                sess JSON NOT NULL,
                expire TIMESTAMP(6) NOT NULL,
                PRIMARY KEY (sid)
            );
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS IDX_session_expire ON session (expire);
        `);

        // Create user_presets table
        await client.query(`
            CREATE TABLE IF NOT EXISTS user_presets (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                preset_type VARCHAR(50) NOT NULL,
                preset_data JSONB NOT NULL,
                is_public BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_user_presets_user_id ON user_presets(user_id);
            CREATE INDEX IF NOT EXISTS idx_user_presets_type ON user_presets(preset_type);
            CREATE INDEX IF NOT EXISTS idx_user_presets_public ON user_presets(is_public) WHERE is_public = TRUE;
        `);

        // Create user_tracks table
        await client.query(`
            CREATE TABLE IF NOT EXISTS user_tracks (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                genre VARCHAR(100),
                blob_url TEXT NOT NULL,
                blob_name VARCHAR(255) NOT NULL,
                file_size BIGINT,
                duration INTEGER,
                plays INTEGER DEFAULT 0,
                is_public BOOLEAN DEFAULT FALSE,
                uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_user_tracks_user_id ON user_tracks(user_id);
            CREATE INDEX IF NOT EXISTS idx_user_tracks_public ON user_tracks(is_public) WHERE is_public = TRUE;
            CREATE INDEX IF NOT EXISTS idx_user_tracks_genre ON user_tracks(genre);
        `);

        // Create update trigger function
        await client.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        `);

        // Create triggers
        await client.query(`
            DROP TRIGGER IF EXISTS update_users_updated_at ON users;
            CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        `);

        await client.query(`
            DROP TRIGGER IF EXISTS update_user_presets_updated_at ON user_presets;
            CREATE TRIGGER update_user_presets_updated_at BEFORE UPDATE ON user_presets
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        `);

        await client.query(`
            DROP TRIGGER IF EXISTS update_user_tracks_updated_at ON user_tracks;
            CREATE TRIGGER update_user_tracks_updated_at BEFORE UPDATE ON user_tracks
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        `);

        // Get table info
        const result = await client.query(`
            SELECT 
                table_name, 
                (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
            FROM information_schema.tables t
            WHERE table_schema = 'public' 
                AND table_type = 'BASE TABLE'
                AND table_name IN ('users', 'session', 'user_presets', 'user_tracks')
            ORDER BY table_name;
        `);

        client.release();
        await pool.end();

        res.status(200).json({
            success: true,
            message: 'Database migration completed successfully',
            tables: result.rows
        });

    } catch (error) {
        console.error('Migration error:', error);
        await pool.end();
        res.status(500).json({
            success: false,
            error: error.message,
            hint: 'Make sure DATABASE_URL or POSTGRES_URL environment variable is set'
        });
    }
};
