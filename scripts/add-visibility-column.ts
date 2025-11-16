import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function addVisibilityColumn() {
  try {
    // Add visibility column (defaults to 'public' for existing searches)
    await pool.query(`
      ALTER TABLE saved_searches
      ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'public';
    `);
    console.log('✓ Successfully added visibility column to saved_searches table');
    console.log('  All existing searches have been set to "public" visibility');
  } catch (error) {
    console.error('Error adding visibility column:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

addVisibilityColumn();
