/**
 * Run migrations against Neon Local using pg driver.
 * Use when NEON_LOCAL=true (drizzle-kit migrate doesn't support pg for Neon Local).
 */
import 'dotenv/config';
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

const connectionString = process.env.DATABASE_URL;
const isNeonLocal = process.env.NEON_LOCAL === 'true';

const pool = new pg.Pool({
  connectionString,
  ssl: isNeonLocal ? { rejectUnauthorized: false } : { rejectUnauthorized: true }
});

const db = drizzle(pool);

await migrate(db, { migrationsFolder: './drizzle' });
await pool.end();
console.log('Migrations complete.');
