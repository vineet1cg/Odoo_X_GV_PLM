// ============================================================//
//  database.js — Dual DB Connection Manager                    //
//  PostgreSQL (Supabase) primary + MongoDB Atlas backup        //
//  Auto-failover, health monitoring, delta sync                //
// ============================================================//
const { Pool } = require('pg');
const mongoose = require('mongoose');

// ── State ─────────────────────────────────────────
let currentDB    = 'postgres'; // 'postgres' | 'mongo'
let pgPool       = null;
let pgHealthy    = false;
let mongoHealthy = false;
let isSyncing    = false;
let healthInterval = null;

const dbStats = {
  failoverCount:   0,
  lastFailoverAt:  null,
  lastRecoveryAt:  null,
  totalDowntimeMs: 0,
  failoverStartAt: null,
};

// ── Init ──────────────────────────────────────────
async function initDatabases() {
  console.log('[DB] Initializing databases...');

  // Connect PostgreSQL (Supabase)
  if (process.env.DATABASE_URL) {
    try {
      pgPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        ssl: { rejectUnauthorized: false },
      });
      await pgPool.query('SELECT 1');
      pgHealthy = true;
      console.log('[DB] ✓ Supabase PostgreSQL connected');
    } catch (err) {
      pgHealthy = false;
      console.error('[DB] ✗ PostgreSQL connection failed:', err.message);
    }
  } else {
    pgHealthy = false;
    console.log('[DB] ⚠ No DATABASE_URL — PostgreSQL disabled');
  }

  // Connect MongoDB Atlas
  const mongoURI = process.env.MONGO_URI || process.env.MONGO_URL;
  if (mongoURI) {
    try {
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(mongoURI, {
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 10000,
        });
      }
      mongoHealthy = true;
      console.log('[DB] ✓ MongoDB Atlas connected');
    } catch (err) {
      mongoHealthy = false;
      console.error('[DB] ✗ MongoDB connection failed:', err.message);
    }
  } else {
    console.log('[DB] ⚠ No MONGO_URI — MongoDB disabled');
  }

  // Decide which DB to use
  if (pgHealthy) {
    currentDB = 'postgres';
    console.log('[DB] → Using PostgreSQL as primary');
  } else if (mongoHealthy) {
    currentDB = 'mongo';
    console.log('[DB] → PostgreSQL unavailable — using MongoDB as primary');
  } else {
    throw new Error('[DB] CRITICAL: Both databases unavailable');
  }

  startHealthMonitor();
}

// ── Health Monitor ────────────────────────────────
function startHealthMonitor() {
  if (!process.env.DATABASE_URL) return; // No PG = no failover needed
  healthInterval = setInterval(runHealthCheck, 10000);
  console.log('[DB] Health monitor started (10s interval)');
}

async function runHealthCheck() {
  if (isSyncing) return;

  const wasPgHealthy = pgHealthy;

  pgHealthy = await checkPgHealth();
  mongoHealthy = mongoose.connection.readyState === 1;

  // Postgres just died
  if (wasPgHealthy && !pgHealthy && currentDB === 'postgres') {
    console.log('[DB] ⚠ PostgreSQL failure detected — starting failover');
    await handleFailover();
  }

  // Postgres just recovered
  if (!wasPgHealthy && pgHealthy && currentDB === 'mongo') {
    console.log('[DB] ✓ PostgreSQL recovery detected — syncing back');
    await handleRecovery();
  }
}

async function checkPgHealth() {
  if (!pgPool) return false;
  try {
    await Promise.race([
      pgPool.query('SELECT 1'),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 3000)
      ),
    ]);
    return true;
  } catch {
    return false;
  }
}

// ── Failover (PG → Mongo) ─────────────────────────
async function handleFailover() {
  if (!mongoHealthy) {
    console.error('[DB] CRITICAL: Both databases down');
    return;
  }

  isSyncing = true;
  dbStats.failoverCount++;
  dbStats.lastFailoverAt  = new Date();
  dbStats.failoverStartAt = Date.now();

  try {
    await syncPostgresToMongo();
    currentDB = 'mongo';
    console.log('[DB] ✓ Failover complete — using MongoDB');
  } catch (err) {
    console.error('[DB] Failover sync error:', err.message);
    currentDB = 'mongo'; // switch anyway
  } finally {
    isSyncing = false;
  }
}

// ── Recovery (Mongo → PG) ─────────────────────────
async function handleRecovery() {
  isSyncing = true;

  if (dbStats.failoverStartAt) {
    dbStats.totalDowntimeMs += Date.now() - dbStats.failoverStartAt;
    dbStats.failoverStartAt = null;
  }
  dbStats.lastRecoveryAt = new Date();

  try {
    await syncMongoToPostgres();
    currentDB = 'postgres';
    console.log('[DB] ✓ Recovery complete — back on PostgreSQL');
  } catch (err) {
    console.error('[DB] Recovery sync error:', err.message);
    // Stay on Mongo if sync fails
  } finally {
    isSyncing = false;
  }
}

// ── Sync: PostgreSQL → MongoDB ────────────────────
async function syncPostgresToMongo() {
  const SyncState = require('../models/SyncState');
  let totalSynced = 0;

  try {
    // Get last sync checkpoint
    let lastSyncedAt = new Date(0);
    try {
      const { rows: [state] } = await pgPool.query(
        `SELECT last_synced_at FROM sync_state WHERE direction = 'pg_to_mongo'`
      );
      if (state) lastSyncedAt = state.last_synced_at;
    } catch { /* table may not exist yet */ }

    // Log sync start
    let logId = null;
    try {
      const { rows: [log] } = await pgPool.query(
        `INSERT INTO sync_log (direction, status) VALUES ('pg_to_mongo', 'started') RETURNING id`
      );
      logId = log.id;
    } catch { /* table may not exist */ }

    const ECO     = require('../models/ECO');
    const User    = require('../models/User');
    const Product = require('../models/Product');
    const BOM     = require('../models/BOM');

    // Sync ECOs
    try {
      const { rows: ecos } = await pgPool.query(
        `SELECT * FROM ecos WHERE updated_at > $1`, [lastSyncedAt]
      );
      for (const eco of ecos) {
        await ECO.findOneAndUpdate(
          { ecoNumber: eco.eco_number },
          {
            ecoNumber: eco.eco_number,
            title: eco.title,
            type: eco.type,
            stage: eco.stage,
            priority: eco.priority,
            description: eco.description,
            productId: eco.product_id,
            bomId: eco.bom_id,
            createdBy: eco.created_by,
            version: eco.version,
          },
          { upsert: true }
        );
        totalSynced++;
      }
      console.log(`[DB] Synced ${ecos.length} ECOs → MongoDB`);
    } catch (err) {
      console.error('[DB] ECO sync error:', err.message);
    }

    // Sync Users
    try {
      const { rows: users } = await pgPool.query(
        `SELECT * FROM users WHERE updated_at > $1`, [lastSyncedAt]
      );
      for (const user of users) {
        await User.findOneAndUpdate(
          { email: user.email },
          {
            name: user.name,
            email: user.email,
            password: user.password,
            role: user.role,
            version: user.version,
          },
          { upsert: true }
        );
        totalSynced++;
      }
      console.log(`[DB] Synced ${users.length} users → MongoDB`);
    } catch (err) {
      console.error('[DB] User sync error:', err.message);
    }

    // Sync Products
    try {
      const { rows: products } = await pgPool.query(
        `SELECT * FROM products WHERE updated_at > $1`, [lastSyncedAt]
      );
      for (const product of products) {
        await Product.findOneAndUpdate(
          { sku: product.sku },
          {
            name: product.name,
            sku: product.sku,
            version: product.version,
            status: product.status,
            category: product.category,
          },
          { upsert: true }
        );
        totalSynced++;
      }
      console.log(`[DB] Synced ${products.length} products → MongoDB`);
    } catch (err) {
      console.error('[DB] Product sync error:', err.message);
    }

    // Sync BOMs
    try {
      const { rows: boms } = await pgPool.query(
        `SELECT * FROM boms WHERE updated_at > $1`, [lastSyncedAt]
      );
      for (const bom of boms) {
        await BOM.findOneAndUpdate(
          { name: bom.name },
          {
            name: bom.name,
            productId: bom.product_id,
            version: bom.version,
            status: bom.status,
          },
          { upsert: true }
        );
        totalSynced++;
      }
      console.log(`[DB] Synced ${boms.length} BOMs → MongoDB`);
    } catch (err) {
      console.error('[DB] BOM sync error:', err.message);
    }

    // Update sync checkpoint
    try {
      await pgPool.query(
        `UPDATE sync_state SET last_synced_at = NOW() WHERE direction = 'pg_to_mongo'`
      );
    } catch { /* checkpoint table may not exist */ }

    // Update sync log — success
    if (logId) {
      try {
        await pgPool.query(
          `UPDATE sync_log SET records_synced = $1, status = 'success', completed_at = NOW() WHERE id = $2`,
          [totalSynced, logId]
        );
      } catch { /* best effort */ }
    }

    // Also store checkpoint in Mongo
    await SyncState.findOneAndUpdate(
      { direction: 'pg_to_mongo' },
      { lastSyncedAt: new Date() },
      { upsert: true }
    );

    console.log(`[DB] PG→Mongo sync complete: ${totalSynced} records`);
  } catch (err) {
    console.error('[DB] PG→Mongo sync failed:', err.message);
    throw err;
  }
}

// ── Sync: MongoDB → PostgreSQL ────────────────────
async function syncMongoToPostgres() {
  const SyncState = require('../models/SyncState');
  let totalSynced = 0;

  try {
    const mongoState = await SyncState.findOne({ direction: 'mongo_to_pg' });
    const lastSyncedAt = mongoState?.lastSyncedAt || new Date(0);

    const ECO     = require('../models/ECO');
    const User    = require('../models/User');
    const Product = require('../models/Product');
    const BOM     = require('../models/BOM');

    // Sync ECOs back
    try {
      const ecos = await ECO.find({ updatedAt: { $gt: lastSyncedAt } }).lean();
      for (const eco of ecos) {
        await pgPool.query(
          `INSERT INTO ecos (eco_number, title, type, stage, priority, description, product_id, bom_id, created_by, version, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())
           ON CONFLICT (eco_number) DO UPDATE SET
             title = EXCLUDED.title, stage = EXCLUDED.stage,
             priority = EXCLUDED.priority, description = EXCLUDED.description,
             updated_at = NOW()
           WHERE ecos.version < EXCLUDED.version`,
          [
            eco.ecoNumber, eco.title, eco.type, eco.stage,
            eco.priority, eco.description, eco.productId,
            eco.bomId, eco.createdBy, eco.version || 1,
            eco.createdAt || new Date(),
          ]
        );
        totalSynced++;
      }
      console.log(`[DB] Synced ${ecos.length} ECOs → PostgreSQL`);
    } catch (err) {
      console.error('[DB] ECO reverse sync error:', err.message);
    }

    // Sync Users back
    try {
      const users = await User.find({ updatedAt: { $gt: lastSyncedAt } }).lean();
      for (const user of users) {
        await pgPool.query(
          `INSERT INTO users (name, email, password, role, version, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,NOW())
           ON CONFLICT (email) DO UPDATE SET
             name = EXCLUDED.name, role = EXCLUDED.role, updated_at = NOW()
           WHERE users.version < EXCLUDED.version`,
          [user.name, user.email, user.password, user.role, user.version || 1, user.createdAt || new Date()]
        );
        totalSynced++;
      }
      console.log(`[DB] Synced ${users.length} users → PostgreSQL`);
    } catch (err) {
      console.error('[DB] User reverse sync error:', err.message);
    }

    // Sync Products back
    try {
      const products = await Product.find({ updatedAt: { $gt: lastSyncedAt } }).lean();
      for (const product of products) {
        await pgPool.query(
          `INSERT INTO products (name, sku, version, status, category, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,NOW())
           ON CONFLICT (sku) DO UPDATE SET
             version = EXCLUDED.version, status = EXCLUDED.status, updated_at = NOW()
           WHERE products.version < EXCLUDED.version`,
          [product.name, product.sku, product.version, product.status, product.category, product.createdAt || new Date()]
        );
        totalSynced++;
      }
      console.log(`[DB] Synced ${products.length} products → PostgreSQL`);
    } catch (err) {
      console.error('[DB] Product reverse sync error:', err.message);
    }

    // Update sync checkpoint in Mongo
    await SyncState.findOneAndUpdate(
      { direction: 'mongo_to_pg' },
      { lastSyncedAt: new Date() },
      { upsert: true }
    );

    console.log(`[DB] Mongo→PG sync complete: ${totalSynced} records`);
  } catch (err) {
    console.error('[DB] Mongo→PG sync failed:', err.message);
    throw err;
  }
}

// ── Main query function ───────────────────────────
// ALL routes use this instead of direct DB calls
async function dbQuery({ pg, mongo, fallback }) {
  if (currentDB === 'postgres' && pgHealthy && pgPool) {
    try {
      const result = await pgPool.query(pg.sql, pg.params || []);
      return result.rows;
    } catch (err) {
      console.error('[DB] PG query failed:', err.message);
      if (mongoHealthy && mongo) {
        console.log('[DB] Query falling back to MongoDB');
        return await mongo();
      }
      throw err;
    }
  }

  if ((currentDB === 'mongo' || !pgHealthy) && mongo) {
    try {
      return await mongo();
    } catch (err) {
      console.error('[DB] Mongo query failed:', err.message);
      if (fallback !== undefined) return fallback;
      throw err;
    }
  }

  if (fallback !== undefined) return fallback;
  throw new Error('[DB] No database available');
}

// ── Helpers ───────────────────────────────────────
function getDBStatus() {
  return {
    current:   currentDB,
    isSyncing,
    postgres:  { healthy: pgHealthy },
    mongo:     { healthy: mongoHealthy },
    stats: {
      failoverCount:   dbStats.failoverCount,
      lastFailoverAt:  dbStats.lastFailoverAt,
      lastRecoveryAt:  dbStats.lastRecoveryAt,
      totalDowntimeMs: dbStats.totalDowntimeMs,
    },
    message:
      currentDB === 'postgres'
        ? 'Running normally on PostgreSQL'
        : isSyncing
        ? 'Sync in progress...'
        : 'Running on MongoDB backup',
  };
}

function getPgPool()    { return pgPool; }
function getCurrentDB() { return currentDB; }
function stopHealthMonitor() {
  if (healthInterval) clearInterval(healthInterval);
}

module.exports = {
  initDatabases,
  dbQuery,
  getDBStatus,
  getPgPool,
  getCurrentDB,
  stopHealthMonitor,
};
