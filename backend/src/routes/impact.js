const express = require('express');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roles');

const router = express.Router();

// GET /api/ecos/:id/impact
router.get('/:id/impact', authMiddleware, roleMiddleware(['Admin', 'Approver']), async (req, res) => {
  try {
    const id = req.params.id;

    // Fetch ECO
    const ecoRes = await req.db('SELECT * FROM ecos WHERE id = $1', [id]);
    const eco = ecoRes.rows[0];

    if (!eco) {
      return res.status(404).json({ success: false, message: 'ECO not found' });
    }

    // Fetch changes
    const changesRes = await req.db('SELECT * FROM eco_changes WHERE eco_id = $1', [id]);
    const changes = changesRes.rows || [];

    let totalCostImpactPerUnit = 0;
    const changedComponents = [];

    for (const change of changes) {
      const type = change.change_type;
      const field = change.field_name || '';

      if (field.startsWith('Component:') || field.toLowerCase().includes('material') || field.toLowerCase().includes('price')) {
        let costDiff = 0;

        const parseQuantity = (str) => {
          if (!str) return 0;
          const match = str.match(/qty:\s*(\d+)/i);
          return match ? parseInt(match[1], 10) : 1;
        };

        const fakeCostMap = {
          'ESP32': 5.50, 'Antenna': 1.20, 'LM7805': 0.85, 'Kalrez': 45.00,
          'Viton': 12.00, 'Relief Valve': 18.50, 'Spring': 2.50, 'Needle Bearings': 8.00,
          'Angular Contact': 14.00
        };

        const getCostForName = (name) => {
          if (!name || name === '—') return 0;
          for (let [key, val] of Object.entries(fakeCostMap)) {
            if (name.includes(key) || field.includes(key)) return val;
          }
          if (field.toLowerCase().includes('price') || name.includes('$') || name.includes('₹')) {
            const dollars = name.match(/[\$₹]?([0-9,.]+)/);
            if (dollars) return parseFloat(dollars[1].replace(/,/g, ''));
          }
          return 10.00;
        };

        const oldQty = parseQuantity(change.old_value);
        const newQty = parseQuantity(change.new_value);
        const oldC = getCostForName(change.old_value);
        const newC = getCostForName(change.new_value);

        if (type === 'added') costDiff = newC * newQty;
        else if (type === 'removed') costDiff = -(oldC * oldQty);
        else if (type === 'modified') {
          if (field.toLowerCase().includes('price')) costDiff = newC - oldC;
          else costDiff = (newC * (newQty || 1)) - (oldC * (oldQty || 1));
        }

        totalCostImpactPerUnit += costDiff;

        changedComponents.push({
          name: field.replace('Component: ', ''),
          oldValue: change.old_value || '—',
          newValue: change.new_value || '—',
          costDiff: parseFloat(costDiff.toFixed(2)),
          changeType: type
        });
      }
    }

    // Active orders simulation based on product
    const orderRes = await req.db(
      "SELECT COUNT(*) FROM ecos WHERE stage IN ('New', 'In Review', 'Approval') AND product_id = $1",
      [eco.product_id]
    );
    const activeOrders = Math.max(1, parseInt(orderRes.rows[0].count, 10) * 3);
    const unitsPerOrder = 100;
    const totalUnitsAffected = activeOrders * unitsPerOrder;
    const totalCostImpact = totalCostImpactPerUnit * totalUnitsAffected;

    let timeImpactPerUnit = 0;
    changedComponents.forEach(c => {
      if (c.changeType === 'added') timeImpactPerUnit += 5;
      if (c.changeType === 'removed') timeImpactPerUnit -= 3;
    });

    const totalTimeImpactHours = (timeImpactPerUnit * totalUnitsAffected) / 60;

    let riskLevel = 'LOW';
    if (Math.abs(totalCostImpact) > 100000) riskLevel = 'HIGH';
    else if (Math.abs(totalCostImpact) > 10000 || timeImpactPerUnit > 10) riskLevel = 'MEDIUM';

    res.json({
      success: true,
      data: {
        costImpact: {
          perUnit: parseFloat(totalCostImpactPerUnit.toFixed(2)),
          total: parseFloat(totalCostImpact.toFixed(2)),
          direction: totalCostImpactPerUnit > 0 ? 'increase' : 'decrease'
        },
        timeImpact: {
          perUnit: timeImpactPerUnit,
          total: parseFloat(totalTimeImpactHours.toFixed(1)),
          direction: timeImpactPerUnit > 0 ? 'increase' : 'decrease'
        },
        affectedOrders: { count: activeOrders, totalUnits: totalUnitsAffected },
        changedComponents,
        riskLevel,
        recommendation: riskLevel === 'LOW' ? 'Safe to approve' : 'Review impact report'
      }
    });

  } catch (error) {
    console.error('Impact prediction error:', error);
    res.status(500).json({ success: false, message: 'Failed to calculate ECO impact' });
  }
});

module.exports = router;
