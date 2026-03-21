const express = require('express');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/activities — List activity timeline, most recent first
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await req.db('SELECT * FROM activities ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch activities' });
  }
});

// POST /api/activities — Create activity entry
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { type, title, description, user, ecoId } = req.body;
    const id = `a${Date.now()}`;
    
    const result = await req.db(
      `INSERT INTO activities (id, type, title, description, user_name, eco_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`,
      [id, type, title, description, user, ecoId || null]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('[ACTIVITIES PROB]', error);
    res.status(500).json({ success: false, message: 'Failed to create activity' });
  }
});

module.exports = router;

