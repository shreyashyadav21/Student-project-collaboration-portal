const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { PGlite } = require('@electric-sql/pglite');

let dbDriver = null; // 'pg' or 'pglite'
let pgPool = null;
let pgliteInstance = null;

const schemaPath = path.join(__dirname, '../../database/schema.sql');
const seedPath = path.join(__dirname, '../../database/seed.sql');

async function initializeDatabase() {
  const useNativePg = Boolean(
    process.env.DATABASE_URL ||
    (process.env.PGUSER && process.env.PGDATABASE) ||
    process.env.USE_POSTGRES_SERVER === 'true'
  );

  if (useNativePg) {
    try {
      console.log('[Database] Attempting connection to PostgreSQL server...');
      const poolConfig = process.env.DATABASE_URL
        ? { connectionString: process.env.DATABASE_URL }
        : {
            host: process.env.PGHOST || 'localhost',
            port: parseInt(process.env.PGPORT || '5432', 10),
            user: process.env.PGUSER || 'postgres',
            password: process.env.PGPASSWORD || 'postgres',
            database: process.env.PGDATABASE || 'student_portal',
            connectionTimeoutMillis: 3000,
          };

      const testPool = new Pool(poolConfig);
      const res = await testPool.query('SELECT NOW()');
      console.log('[Database] Connected to external PostgreSQL server successfully at:', res.rows[0].now);
      pgPool = testPool;
      dbDriver = 'pg';
    } catch (err) {
      console.warn('[Database] External PostgreSQL server not reachable:', err.message);
      console.log('[Database] Falling back to embedded PostgreSQL (PGlite)...');
    }
  }

  if (!dbDriver) {
    const dataDir = path.join(__dirname, 'pgdata');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    console.log('[Database] Initializing embedded PostgreSQL (PGlite) with persistence at:', dataDir);
    pgliteInstance = new PGlite(dataDir);
    await pgliteInstance.waitReady;
    dbDriver = 'pglite';
    console.log('[Database] Embedded PostgreSQL initialized successfully.');
  }

  // Ensure tables exist
  await ensureSchema();
}

async function query(text, params = []) {
  if (!dbDriver) {
    await initializeDatabase();
  }

  if (dbDriver === 'pg') {
    return await pgPool.query(text, params);
  } else {
    // PGlite compatibility wrapper
    const res = await pgliteInstance.query(text, params);
    return {
      rows: res.rows || [],
      rowCount: res.rows ? res.rows.length : (res.affectedRows || 0),
      fields: res.fields || []
    };
  }
}

async function exec(sql) {
  if (!dbDriver) {
    await initializeDatabase();
  }
  if (dbDriver === 'pg') {
    return await pgPool.query(sql);
  } else {
    return await pgliteInstance.exec(sql);
  }
}

async function ensureSchema() {
  try {
    const checkTable = await query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users';"
    );

    if (checkTable.rows.length === 0) {
      console.log('[Database] Tables not found. Executing schema.sql...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      if (dbDriver === 'pg') {
        await pgPool.query(schemaSql);
      } else {
        await pgliteInstance.exec(schemaSql);
      }
      console.log('[Database] Schema created successfully.');

      // Seed sample data
      if (fs.existsSync(seedPath)) {
        console.log('[Database] Seeding initial data from seed.sql...');
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        if (dbDriver === 'pg') {
          await pgPool.query(seedSql);
        } else {
          await pgliteInstance.exec(seedSql);
        }
        console.log('[Database] Initial data seeded successfully.');
      }
    } else {
      console.log('[Database] Existing database schema verified.');
    }
  } catch (err) {
    console.error('[Database] Error checking/applying schema:', err);
    throw err;
  }
}

module.exports = {
  query,
  exec,
  initializeDatabase,
  getDriver: () => dbDriver
};
