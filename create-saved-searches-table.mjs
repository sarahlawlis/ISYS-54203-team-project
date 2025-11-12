import { Pool } from '@neondatabase/serverless';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

try {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS saved_searches (
      id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      created_by VARCHAR NOT NULL,
      filters TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✓ saved_searches table created successfully');

  // Create index for better performance
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_saved_searches_created_by
    ON saved_searches(created_by)
  `);

  console.log('✓ Index created successfully');
} catch (error) {
  console.error('Error creating table:', error);
} finally {
  await pool.end();
}
