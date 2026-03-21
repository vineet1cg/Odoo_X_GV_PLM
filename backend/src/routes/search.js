const express = require('express');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/search?q=query&type=all
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const q = req.query.q;
    if (!q || q.length < 2) {
      return res.json({ success: true, data: { results: { ecos: [], products: [], boms: [] }, totalCount: 0, query: q } });
    }

    const searchPattern = `%${q}%`;
    const userRole = req.user.role;

    const [ecosRes, productsRes, bomsRes] = await Promise.all([
      // Search ECOs
      req.db(
        `SELECT id, title, eco_number, stage, type, product_id, created_at FROM ecos 
         WHERE title ILIKE $1 OR eco_number ILIKE $1 OR description ILIKE $1 LIMIT 5`,
        [searchPattern]
      ),

      // Search Products (Operations only see Active)
      req.db(
        `SELECT id, name, sku, version, status, category FROM products 
         WHERE (name ILIKE $1 OR sku ILIKE $1) 
         ${userRole === 'Operations User' ? "AND status = 'Active'" : ""} 
         LIMIT 5`,
        [searchPattern]
      ),

      // Search BOMs
      req.db(
        `SELECT id, name, version, status, product_id FROM boms 
         WHERE name ILIKE $1 
         LIMIT 5`,
        [searchPattern]
      )
    ]);

    const ecos = ecosRes.rows;
    const products = productsRes.rows;
    const boms = bomsRes.rows;

    res.json({
      success: true,
      data: {
        results: {
          ecos: ecos.map(e => ({
            id: e.id,
            type: 'eco',
            title: e.title,
            subtitle: `${e.eco_number || ''} · ${e.stage || ''}`,
            badge: e.stage,
            url: `/eco/${e.id}`
          })),
          products: products.map(p => ({
            id: p.id,
            type: 'product',
            title: p.name,
            subtitle: `${p.sku || ''} · ${p.status || ''} · v${p.version || ''}`,
            badge: p.status,
            url: `/products/${p.id}`
          })),
          boms: boms.map(b => ({
            id: b.id,
            type: 'bom',
            title: b.name,
            subtitle: `v${b.version || ''}`,
            badge: b.status || b.version,
            url: `/boms/${b.id}`
          }))
        },
        totalCount: ecos.length + products.length + boms.length,
        query: q
      }
    });

  } catch (error) {
    console.error('Search API error:', error);
    res.status(500).json({ success: false, message: 'Failed to search' });
  }
});

module.exports = router;
