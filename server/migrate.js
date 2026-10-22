import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env variables if present
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const match = trimmed.match(/^([\w.-]+)\s*=\s*(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = value;
      }
    });
  }
} catch (e) {}

const targetPgUrl = process.argv[2] || process.env.DATABASE_URL;

if (!targetPgUrl || (!targetPgUrl.startsWith('postgres://') && !targetPgUrl.startsWith('postgresql://'))) {
  console.log(`
ℹ️ AGRIBAZZER PostgreSQL Migration Tool
--------------------------------------------------
Usage:
  node server/migrate.js <POSTGRES_CONNECTION_STRING>
  Or configure DATABASE_URL in .env and run: npm run migrate

Example:
  node server/migrate.js "postgres://user:password@ep-cool-fog-123456.us-east-2.aws.neon.tech/agribazzer?sslmode=require"
`);
  process.exit(0);
}

async function runMigration() {
  console.log('====================================================');
  console.log('  AGRIBAZZER POSTGRESQL MIGRATION & DATA TRANSFER');
  console.log('====================================================\n');

  console.log(`🎯 Target PostgreSQL: ${targetPgUrl.replace(/:[^:@]+@/, ':***@')}`);

  const pool = new pg.Pool({
    connectionString: targetPgUrl,
    ssl: targetPgUrl.includes('localhost') ? false : { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  const client = await pool.connect();
  console.log('✅ Connected to target PostgreSQL database.');

  try {
    // 1. Run Schema DDL
    const schemaPath = path.resolve(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      console.log('📜 Applying complete 17-table schema & indexes...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await client.query(schemaSql);
      console.log('✅ PostgreSQL Schema & Indexes applied successfully.');
    }

    // 2. Read SQLite and Transfer Data
    const sqlitePath = path.resolve(__dirname, 'agribazzer.sqlite');
    if (!fs.existsSync(sqlitePath)) {
      console.log('ℹ️ No existing SQLite database found at server/agribazzer.sqlite. Running fresh seed on Postgres...');
      const { seedDatabase } = await import('./seed.js');
      await seedDatabase();
      console.log('✅ PostgreSQL freshly seeded.');
      return;
    }

    console.log(`📁 Found local SQLite database at ${sqlitePath}. Reading records...`);
    const sqlite = new Database(sqlitePath, { readonly: true });

    // Table migration in foreign-key dependency order
    const tables = [
      'users',
      'farms',
      'crops',
      'produce_lots',
      'buyer_demands',
      'offers',
      'negotiations',
      'orders',
      'logistics',
      'payments',
      'procurement_centres',
      'procurement_tokens',
      'notifications',
      'grievances',
      'plant_scans',
      'market_prices',
      'weather_data'
    ];

    const migrationSummary = {};

    for (const table of tables) {
      try {
        const rows = sqlite.prepare(`SELECT * FROM ${table}`).all();
        if (!rows.length) {
          migrationSummary[table] = 0;
          continue;
        }

        let insertedCount = 0;
        for (const row of rows) {
          const keys = Object.keys(row);
          const columns = keys.join(', ');
          const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
          const values = keys.map(k => row[k]);

          const insertSql = `
            INSERT INTO ${table} (${columns})
            VALUES (${placeholders})
            ON CONFLICT (id) DO NOTHING
          `;

          const res = await client.query(insertSql, values);
          if (res.rowCount > 0) insertedCount++;
        }

        migrationSummary[table] = insertedCount;
        console.log(`  ✓ Table '${table}': ${insertedCount}/${rows.length} records migrated.`);
      } catch (tableErr) {
        console.warn(`  ⚠️ Table '${table}' transfer note:`, tableErr.message);
        migrationSummary[table] = 'ERROR: ' + tableErr.message;
      }
    }

    sqlite.close();

    console.log('\n====================================================');
    console.log('  MIGRATION SUMMARY');
    console.log('====================================================');
    console.table(migrationSummary);
    console.log('🎉 PostgreSQL Migration Completed Successfully!');

  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
