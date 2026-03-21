const express = require('express');
const router  = express.Router();

// GET /api/public/eco/:id
// Returns approved ECO data for public QR scan view
router.get('/eco/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    // Using req.db isn't available here because it's public (no middleware)
    // Actually, dbMiddleware is global in server.js. Let's check server.js.
    // Yes, app.use(dbMiddleware) is global.
    const ecoRes = await req.db('SELECT * FROM ecos WHERE id = $1', [id]);
    const eco = ecoRes.rows[0];

    if (!eco) {
      return res.status(404).json({ success: false, message: 'ECO not found' });
    }

    if (eco.stage !== 'Done') {
      return res.status(403).json({
        success: false,
        message: 'This ECO is not yet approved for public access'
      });
    }

    // Fetch changes
    const changesRes = await req.db('SELECT * FROM eco_changes WHERE eco_id = $1', [id]);
    
    // Fetch logs (to find approval info)
    const logsRes = await req.db("SELECT * FROM approval_logs WHERE eco_id = $1 AND action = 'Approved' LIMIT 1", [id]);
    const approvedLog = logsRes.rows[0];

    const publicData = {
      ecoNumber:    eco.eco_number,
      title:        eco.title,
      type:         eco.type,
      stage:        eco.stage,
      priority:     eco.priority,
      description:  eco.description,
      product: {
        name:    eco.product_name || 'Generic Product',
        sku:     '',
        version: '',
      },
      newVersion:    eco.new_version,
      effectiveDate: eco.effective_date,
      versionUpdate: eco.version_update,
      changes:       changesRes.rows.map(c => ({
        fieldName:  c.field_name,
        oldValue:   c.old_value,
        newValue:   c.new_value,
        changeType: c.change_type,
      })),
      approvedBy:  approvedLog?.user_name || null,
      approvedAt:  approvedLog?.created_at || null,
      raisedBy:    eco.created_by_name || null,
      createdAt:   eco.created_at,
    };

    res.json({ success: true, data: publicData });

  } catch (err) {
    console.error('[PUBLIC] ECO fetch error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to load ECO' });
  }
});

module.exports = router;
