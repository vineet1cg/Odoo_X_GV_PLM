const express = require('express');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/db/status — Check health of PostgreSQL
router.get('/status', authMiddleware, (req, res) => {
  try {
    const status = req.dbStatus();
    res.json({
      success: true,
      data: {
        healthy: status.postgres.healthy,
        message: status.message,
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve database status' });
  }
});

module.exports = router;
