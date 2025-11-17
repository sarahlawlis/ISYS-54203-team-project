import { Pool } from '@neondatabase/serverless';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

try {
  const result = await pool.query('SELECT * FROM saved_searches');
  console.log('Saved searches in database:');
  console.log(result.rows);
  console.log(`\nTotal: ${result.rows.length} searches`);
} catch (error) {
  console.error('Error querying saved searches:', error);
} finally {
  await pool.end();
}
