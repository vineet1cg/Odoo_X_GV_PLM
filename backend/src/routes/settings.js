const express = require('express');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roles');

const router = express.Router();

// GET /api/settings/:key — Get a setting
router.get('/:key', authMiddleware, async (req, res) => {
  try {
    const result = await req.db('SELECT value FROM settings WHERE key = $1', [req.params.key]);
    const value = result.rows[0]?.value;

    // Default values if not found
    let defaultValue = null;
    if (req.params.key === 'eco_stages') defaultValue = ['New', 'In Review', 'Approval', 'Done'];
    if (req.params.key === 'approval_rules') defaultValue = [];

    res.json({
      success: true,
      data: value !== undefined ? value : defaultValue
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
});

// PUT /api/settings/:key — Update a setting (Admin only)
router.put('/:key', authMiddleware, roleMiddleware(['Admin']), async (req, res) => {
  try {
    const { value } = req.body;

    const result = await req.db(
      `INSERT INTO settings (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()
       RETURNING value`,
      [req.params.key, JSON.stringify(value)]
    );

    res.json({ success: true, data: result.rows[0].value });
  } catch (error) {
    console.error('[SETTINGS UPDATE PROB]', error);
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
});

module.exports = router;

