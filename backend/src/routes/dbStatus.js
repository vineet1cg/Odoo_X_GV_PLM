const express = require('express');
const router  = express.Router();
const { getDBStatus, getPgPool } = require('../config/database');
const authMiddleware = require('../middleware/auth');

// GET /api/db/status — DB health & failover stats
// All roles see basic status, Admin sees full stats + sync log
router.get('/status', authMiddleware, async (req, res) => {
  const status = getDBStatus();

  // Non-admin: basic info only
  if (req.user.role !== 'Admin') {
    return res.json({
      success: true,
      data: {
        current: status.current,
        message: status.message,
      },
    });
  }

  // Admin: full stats + recent sync logs
  try {
    const pgPool = getPgPool();
    let recentLogs = [];
    if (pgPool) {
      try {
        const { rows } = await pgPool.query(
          `SELECT * FROM sync_log ORDER BY started_at DESC LIMIT 10`
        );
        recentLogs = rows;
      } catch { /* sync_log table may not exist yet */ }
    }

    res.json({
      success: true,
      data: { ...status, recentLogs },
    });
  } catch {
    res.json({ success: true, data: status });
  }
});

module.exports = router;
