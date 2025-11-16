import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function addDescriptionColumn() {
  try {
    await pool.query(`
      ALTER TABLE saved_searches
      ADD COLUMN IF NOT EXISTS description TEXT;
    `);
    console.log('✓ Successfully added description column to saved_searches table');
  } catch (error) {
    console.error('Error adding description column:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

addDescriptionColumn();
