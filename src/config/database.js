import 'dotenv/config';
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const databaseUrl = process.env.DATABASE_URL;

if (process.env.NEON_LOCAL === 'true') {
  const url = new URL(databaseUrl);
  neonConfig.fetchEndpoint = `http://${url.hostname}:${url.port || 5432}/sql`;
  neonConfig.useSecureWebSocket = false;
  neonConfig.poolQueryViaFetch = true;
}

const sql = neon(databaseUrl);
const db = drizzle(sql);

export { db, sql };