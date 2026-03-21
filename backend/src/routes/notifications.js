const express = require('express');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/notifications — List all notifications
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await req.db('SELECT * FROM notifications ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

// PATCH /api/notifications/:id/read — Mark notification as read
router.patch('/:id/read', authMiddleware, async (req, res) => {
  try {
    const result = await req.db(
      'UPDATE notifications SET read = true WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark notification as read' });
  }
});

// POST /api/notifications — Create notification
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, type, ecoId } = req.body;
    const id = `n${Date.now()}`;
    
    const result = await req.db(
      `INSERT INTO notifications (id, title, type, eco_id, read, created_at)
       VALUES ($1, $2, $3, $4, false, NOW()) RETURNING *`,
      [id, title, type || 'info', ecoId || null]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create notification' });
  }
});

module.exports = router;

