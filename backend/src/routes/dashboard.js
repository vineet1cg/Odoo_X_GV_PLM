const express = require('express');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard/stats — Aggregate statistics for all dashboard variants
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    // 1. Basic counts
    const countsRes = await req.db(`
      SELECT 
        (SELECT COUNT(*) FROM products) as product_total,
        (SELECT COUNT(*) FROM products WHERE status = 'Active') as product_active,
        (SELECT COUNT(*) FROM boms) as bom_total,
        (SELECT COUNT(*) FROM ecos) as eco_total,
        (SELECT COUNT(*) FROM users) as user_total
    `);
    
    const baseCounts = countsRes.rows[0];

    // 2. ECO Breakdown by Stage
    const stageRes = await req.db('SELECT stage, COUNT(*) FROM ecos GROUP BY stage');
    const stageCounts = { New: 0, 'In Review': 0, Approval: 0, Done: 0, Rejected: 0 };
    stageRes.rows.forEach(r => {
      if (stageCounts[r.stage] !== undefined) stageCounts[r.stage] = parseInt(r.count, 10);
    });

    // 3. ECO Breakdown by Priority
    const priorityRes = await req.db('SELECT priority, COUNT(*) FROM ecos GROUP BY priority');
    const priorityCounts = { High: 0, Medium: 0, Low: 0 };
    priorityRes.rows.forEach(r => {
      if (priorityCounts[r.priority] !== undefined) priorityCounts[r.priority] = parseInt(r.count, 10);
    });

    // 4. ECO Breakdown by Type
    const typeRes = await req.db('SELECT type, COUNT(*) FROM ecos GROUP BY type');
    const typeCounts = { Product: 0, BoM: 0 };
    typeRes.rows.forEach(r => {
      if (typeCounts[r.type] !== undefined) typeCounts[r.type] = parseInt(r.count, 10);
    });

    res.json({
      success: true,
      data: {
        products: { total: parseInt(baseCounts.product_total), active: parseInt(baseCounts.product_active) },
        boms: { total: parseInt(baseCounts.bom_total) },
        ecos: { 
          total: parseInt(baseCounts.eco_total), 
          byStage: stageCounts, 
          byPriority: priorityCounts, 
          byType: typeCounts 
        },
        users: { total: parseInt(baseCounts.user_total) }
      }
    });
  } catch (error) {
    console.error('[DASHBOARD PROB]', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
  }
});

module.exports = router;

