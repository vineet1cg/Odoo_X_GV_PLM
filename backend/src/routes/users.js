const express = require('express');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roles');

const router = express.Router();

// GET /api/users — List all users (paginated with search)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    let sql = 'SELECT id, name, email, role, avatar, status, created_at FROM users WHERE 1=1';
    const params = [];

    if (req.query.search) {
      const pIdx = params.length + 1;
      sql += ` AND (name ILIKE $${pIdx} OR email ILIKE $${pIdx})`;
      params.push(`%${req.query.search}%`);
    }
    if (req.query.role && req.query.role !== 'All') {
      const pIdx = params.length + 1;
      sql += ` AND role = $${pIdx}`;
      params.push(String(req.query.role));
    }

    const countSql = `SELECT COUNT(*) FROM (${sql}) AS sub`;
    const countRes = await req.db(countSql, params);
    const total = parseInt(countRes.rows[0].count, 10);

    sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await req.db(sql, params);

    res.json({ 
      success: true, 
      data: result.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// GET /api/users/:id — Get single user
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await req.db(
      'SELECT id, name, email, role, avatar, status FROM users WHERE id = $1',
      [req.params.id]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
});

// POST /api/users — Create user (Admin only)
router.post('/', authMiddleware, roleMiddleware(['Admin']), async (req, res) => {
  try {
    const { name, email, role, status } = req.body;
    const avatar = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
    
    // Generate secure temporary password
    const digits = Math.floor(1000 + Math.random() * 9000);
    const tempPassword = `PLM${digits}!`;
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const id = `u${Date.now()}`;

    const result = await req.db(
      `INSERT INTO users (id, name, email, password, role, avatar, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING id, name, email, role, avatar, status`,
      [id, name, email.toLowerCase(), hashedPassword, role, avatar, status || 'Active']
    );
    
    res.status(201).json({ 
      success: true, 
      data: result.rows[0],
      tempPassword 
    });
  } catch (error) {
    if (error.code === '23505') { // Postgres unique violation
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    console.error('[USER CREATE PROB]', error);
    res.status(500).json({ success: false, message: 'Failed to create user' });
  }
});

// PUT /api/users/:id — Update user (Admin only)
router.put('/:id', authMiddleware, roleMiddleware(['Admin']), async (req, res) => {
  try {
    const { name, email, role, status } = req.body;
    
    let avatar = null;
    if (name) {
      avatar = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }

    const result = await req.db(
      `UPDATE users 
       SET name = COALESCE($1, name), 
           email = COALESCE($2, email), 
           role = COALESCE($3, role), 
           status = COALESCE($4, status),
           avatar = COALESCE($5, avatar),
           updated_at = NOW()
       WHERE id = $6 RETURNING id, name, email, role, avatar, status`,
      [name, email?.toLowerCase(), role, status, avatar, req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
});

module.exports = router;

