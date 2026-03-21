const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// PATCH /api/preferences/language
router.patch('/language', auth, async (req, res) => {
  try {
    const { language } = req.body;
    const validLangs = ['en', 'hi', 'gu'];

    if (!validLangs.includes(language)) {
      return res.status(400).json({ success: false, message: 'Language must be en, hi, or gu' });
    }

    // We store preferences as JSONB in the users table
    // Using jsonb_set to update just the language key
    await req.db(
      "UPDATE users SET preferences = jsonb_set(COALESCE(preferences, '{}'), '{language}', $1::jsonb) WHERE id = $2",
      [JSON.stringify(language), req.user.id]
    );

    res.json({
      success: true,
      data: { language },
      message: 'Language preference saved'
    });

  } catch (err) {
    console.error('[PREF PROB]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/preferences
router.get('/', auth, async (req, res) => {
  try {
    const result = await req.db('SELECT preferences FROM users WHERE id = $1', [req.user.id]);
    const prefs = result.rows[0]?.preferences || { language: 'en' };

    res.json({
      success: true,
      data: prefs
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
