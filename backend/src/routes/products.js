const express = require('express');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/products — List all products (paginated)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    // Filter by role
    if (req.user.role === 'Operations User') {
      sql += ' AND status = $1';
      params.push('Active');
    } else if (req.query.status && req.query.status !== 'All') {
      sql += ' AND status = $' + (params.length + 1);
      params.push(String(req.query.status));
    }

    // Search filter
    if (req.query.search) {
      sql += ` AND (name ILIKE $${params.length + 1} OR sku ILIKE $${params.length + 1})`;
      params.push(`%${req.query.search}%`);
    }

    // Get total count (for pagination)
    const countSql = `SELECT COUNT(*) FROM (${sql}) AS sub`;
    const countRes = await req.db(countSql, params);
    const total = parseInt(countRes.rows[0].count, 10);

    // Get paginated data
    sql += ` ORDER BY updated_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
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
    console.error('[PRODUCTS PROB]', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
});

// GET /api/products/:id — Get single product
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await req.db(
      'SELECT * FROM products WHERE id = $1',
      [req.params.id]
    );

    const product = result.rows[0];

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (req.user.role === 'Operations User' && product.status !== 'Active') {
      return res.status(403).json({ success: false, message: 'Access denied. You can only view active products.' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
});

module.exports = router;

