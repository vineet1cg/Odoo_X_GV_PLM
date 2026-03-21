const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');

// GET /api/ecos/:id/risk
router.get('/:id/risk', auth, async (req, res) => {
  try {
    if (!['Approver', 'Admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Approver or Admin access required' });
    }

    // Fetch the specific ECO
    const ecoRes = await req.db('SELECT * FROM ecos WHERE id = $1', [req.params.id]);
    const eco = ecoRes.rows[0];

    if (!eco) return res.status(404).json({ success: false, message: 'ECO not found' });

    // Fetch changes for analysis
    const changesRes = await req.db('SELECT * FROM eco_changes WHERE eco_id = $1', [req.params.id]);
    eco.changes = changesRes.rows;

    // Fetch historical ECOs for comparison
    const histRes = await req.db(
      "SELECT * FROM ecos WHERE id != $1 AND stage IN ('Done', 'Rejected')",
      [eco.id]
    );
    const historicalECOs = histRes.rows;

    // For rejection rate analysis, we need logs for historical ECOs
    // In a large app, we'd do a JOIN, but for rules we'll iterate or use a specialized query
    for (const h of historicalECOs) {
      const logsRes = await req.db("SELECT action FROM approval_logs WHERE eco_id = $1", [h.id]);
      h.approvalLogs = logsRes.rows;
    }

    const risk = analyzeRisk(eco, historicalECOs);
    res.json({ success: true, data: risk });

  } catch (err) {
    console.error('[RISK] Analysis error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

function analyzeRisk(eco, historicalECOs) {
  let score       = 0;
  const warnings  = [];
  const positives = [];

  // 1. Cost impact (Old Value vs New Value in changes)
  const numericChanges = (eco.changes || []).filter(c => {
    const oldNum = parseFloat(c.old_value);
    const newNum = parseFloat(c.new_value);
    return !isNaN(oldNum) && !isNaN(newNum) && oldNum !== 0;
  });

  if (numericChanges.length > 0) {
    const avgPctChange = numericChanges.reduce((sum, c) => {
      const oldNum = parseFloat(c.old_value);
      const newNum = parseFloat(c.new_value);
      return sum + Math.abs(((newNum - oldNum) / oldNum) * 100);
    }, 0) / numericChanges.length;

    if (avgPctChange > 15) {
      score += 3;
      warnings.push(`Very high value change: ${avgPctChange.toFixed(1)}% average change`);
    } else if (avgPctChange > 8) {
      score += 2;
      warnings.push(`Significant value change: ${avgPctChange.toFixed(1)}% average change`);
    } else {
      score += 1;
    }
  } else {
    positives.push('No numeric field changes — low cost risk');
  }

  // 2. Change count
  const changeCount = (eco.changes || []).length;
  if (changeCount > 6) {
    score += 2;
    warnings.push(`${changeCount} simultaneous changes — high complexity`);
  } else if (changeCount > 3) {
    score += 1;
    warnings.push(`${changeCount} changes — moderate complexity`);
  } else {
    positives.push(`${changeCount} focused changes — low complexity`);
  }

  // 3. Historical rejection
  const similar = historicalECOs.filter(e => e.type === eco.type && e.product_id === eco.product_id);
  const rejectedCount = similar.filter(e => (e.approvalLogs || []).some(l => l.action === 'Rejected')).length;
  const rejectionRate = similar.length > 0 ? rejectedCount / similar.length : 0;

  if (rejectionRate > 0.4) {
    score += 2;
    warnings.push(`${Math.round(rejectionRate * 100)}% historical rejection rate — be cautious`);
  }

  // 4. Description
  const descLen = (eco.description || '').trim().length;
  if (descLen < 20) {
    score += 2;
    warnings.push('Insufficient change description');
  } else if (descLen < 60) {
    score += 1;
  } else {
    positives.push('Well-documented change description');
  }

  const level = score <= 2 ? 'LOW' : score <= 5 ? 'MEDIUM' : 'HIGH';
  const colorMap = {
    LOW:    { text: '#15803D', bg: '#DCFCE7', border: '#BBF7D0' },
    MEDIUM: { text: '#B45309', bg: '#FEF3C7', border: '#FDE68A' },
    HIGH:   { text: '#BE123C', bg: '#FFE4E6', border: '#FECDD3' },
  };

  return {
    level,
    score,
    maxScore:12,
    colors: colorMap[level],
    warnings,
    positives,
    recommendation: level === 'LOW' ? 'Safe to approve' : 'Review warnings carefully',
    analyzedAt: new Date(),
  };
}

module.exports = router;
