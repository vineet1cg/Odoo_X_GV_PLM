const express = require('express');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/ecos/:id/export/pdf
router.get('/:id/export/pdf', authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;

    // Fetch ECO
    const ecoRes = await req.db('SELECT * FROM ecos WHERE id = $1', [id]);
    const eco = ecoRes.rows[0];

    if (!eco) {
      return res.status(404).json({ success: false, message: 'ECO not found' });
    }

    // Fetch related changes
    const changesRes = await req.db('SELECT * FROM eco_changes WHERE eco_id = $1', [id]);
    eco.changes = changesRes.rows;

    // Fetch related logs
    const logsRes = await req.db('SELECT * FROM approval_logs WHERE eco_id = $1 ORDER BY created_at ASC', [id]);
    eco.approvalLogs = logsRes.rows;

    // Fetch Product data
    let productData = null;
    if (eco.product_id) {
      const prodRes = await req.db('SELECT * FROM products WHERE id = $1', [eco.product_id]);
      productData = prodRes.rows[0];
    }

    // Fetch BOM data
    let bomData = null;
    if (eco.bom_id) {
      const bomRes = await req.db('SELECT * FROM boms WHERE id = $1', [eco.bom_id]);
      bomData = bomRes.rows[0];
    }

    // Fetch Creator data
    let createdByUser = null;
    if (eco.created_by) {
      const uRes = await req.db('SELECT name, email, role FROM users WHERE id = $1', [eco.created_by]);
      createdByUser = uRes.rows[0];
    }

    const exportedEco = {
      ...eco,
      product: productData,
      bom: bomData,
      createdBy: createdByUser || { name: 'Unknown', role: 'Engineering User' }
    };

    res.json({
      success: true,
      data: {
        eco: exportedEco,
        generatedAt: new Date(),
        generatedBy: {
          name: req.user.name,
          role: req.user.role
        }
      }
    });

  } catch (error) {
    console.error('Error exporting ECO PDF data:', error);
    res.status(500).json({ success: false, message: 'Failed to generate export data' });
  }
});

module.exports = router;
