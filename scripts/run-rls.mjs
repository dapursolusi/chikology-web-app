import fs from 'fs';
import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set');
  process.exit(1);
}

const sqlPath = new URL('../drizzle/rls_and_buckets.sql', import.meta.url).pathname;
const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
const sql = postgres(DATABASE_URL);

try {
  await sql.unsafe(sqlContent);
  console.log('✅ RLS policies applied successfully');
} catch (err) {
  console.error('❌', err.message);
  process.exit(1);
} finally {
  await sql.end();
}
