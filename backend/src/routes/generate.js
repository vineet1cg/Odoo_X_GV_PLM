const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// ============================================================//
//  POST /api/generate/description                             //
//  Smart template-based ECO description generator             //
//  Body: { eco: object, changes: array }                      //
//  Returns: { success: true, data: { description: string } }  //
// ============================================================//
router.post('/description', auth, async (req, res) => {
  try {
    const { eco, changes } = req.body;

    if (!changes || changes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No changes provided'
      });
    }

    const description = generateDescription(eco || {}, changes);

    res.json({
      success: true,
      data: { description }
    });

  } catch (err) {
    console.error('[GENERATE] Error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// ============================================================//
//  CORE GENERATOR — Template-based description builder        //
//  Accepts both { field, type } and { fieldName, changeType } //
// ============================================================//
function generateDescription(eco, changes) {
  // Normalize field names — accept both conventions
  const normalized = changes.map(c => ({
    fieldName: c.fieldName || c.field || 'Unknown field',
    oldValue: c.oldValue || '',
    newValue: c.newValue || '',
    changeType: c.changeType || c.type || 'modified',
  }));

  const modified = normalized.filter(c => c.changeType === 'modified');
  const added = normalized.filter(c => c.changeType === 'added');
  const removed = normalized.filter(c => c.changeType === 'removed');
  const lines = [];

  const productType = eco.type === 'BoM'
    ? 'Bill of Materials' : 'product specification';

  const actionWord =
    modified.length > 0 && added.length === 0 && removed.length === 0
      ? 'modifications to'
      : added.length > 0 && modified.length === 0
        ? 'additions to'
        : removed.length > 0 && modified.length === 0
          ? 'removals from' : 'updates to';

  lines.push(
    `This Engineering Change Order proposes ${actionWord} the ` +
    `${productType} for ${eco.productName || 'the specified product'}.`
  );

  modified.forEach(c => {
    const oldNum = parseFloat(c.oldValue);
    const newNum = parseFloat(c.newValue);
    const isNum = !isNaN(oldNum) && !isNaN(newNum);
    const dir = isNum
      ? newNum > oldNum ? 'increased' : 'decreased'
      : 'updated';
    const reason = getChangeReason(c.fieldName, c.oldValue, c.newValue);

    if (isNum) {
      const pct = Math.abs(
        ((newNum - oldNum) / oldNum) * 100
      ).toFixed(1);
      lines.push(
        `The ${c.fieldName.toLowerCase()} has been ${dir} from ` +
        `${c.oldValue} to ${c.newValue} (${pct}% change) ${reason}.`
      );
    } else {
      lines.push(
        `The ${c.fieldName.toLowerCase()} has been ${dir} from ` +
        `"${c.oldValue}" to "${c.newValue}" ${reason}.`
      );
    }
  });

  added.forEach(c => {
    lines.push(
      `A new ${c.fieldName.toLowerCase()} of ${c.newValue} ` +
      `has been introduced ${getAddedReason(c.fieldName)}.`
    );
  });

  removed.forEach(c => {
    lines.push(
      `The ${c.fieldName.toLowerCase()} ` +
      `(previously ${c.oldValue}) has been removed ` +
      `as it is no longer required per revised specifications.`
    );
  });

  if (eco.priority === 'High') {
    lines.push(
      'This change is classified as high priority and ' +
      'requires expedited review and approval.'
    );
  }

  if (eco.effectiveDate) {
    const date = new Date(eco.effectiveDate)
      .toLocaleDateString('en-IN');
    lines.push(
      `This change is scheduled to take effect on ` +
      `${date}, pending approval.`
    );
  }

  return lines.join(' ');
}

// ============================================================//
//  REASON MAPS — Context-aware justifications                 //
// ============================================================//
function getChangeReason(field, oldVal, newVal) {
  const f = field.toLowerCase();
  const up = parseFloat(newVal) > parseFloat(oldVal);
  const map = {
    screw: up ? 'to improve structural integrity and durability'
      : 'to reduce material costs',
    bolt: up ? 'to improve structural integrity'
      : 'to optimize assembly time',
    weight: up ? 'to meet load-bearing requirements'
      : 'to reduce shipping costs',
    thickness: up ? 'to meet updated safety specifications'
      : 'to reduce material usage',
    quantity: up ? 'to align with revised production requirements'
      : 'to optimize inventory costs',
    length: up ? 'to meet dimensional specifications'
      : 'to reduce material waste',
    cost: up ? 'due to material price adjustments'
      : 'following cost optimization review',
    price: up ? 'due to supplier price revision'
      : 'following negotiated supplier discount',
    time: up ? 'to ensure quality compliance'
      : 'to improve operational efficiency',
    duration: up ? 'to meet quality standards'
      : 'to reduce cycle time',
    temperature: 'to meet updated process specifications',
    pressure: 'to meet revised safety requirements',
    voltage: 'to comply with updated electrical specifications',
  };
  const key = Object.keys(map).find(k => f.includes(k));
  return key ? map[key] : 'to meet revised engineering specifications';
}

function getAddedReason(field) {
  const f = field.toLowerCase();
  const map = {
    inspection: 'to validate the quality of the implemented change',
    test: 'to ensure compliance with updated quality standards',
    check: 'to verify the modified specification',
    verification: 'to confirm the change meets design intent',
    coating: 'to improve surface protection and longevity',
    seal: 'to prevent contamination and improve durability',
    sensor: 'to enable real-time monitoring',
    label: 'to comply with updated identification requirements',
  };
  const key = Object.keys(map).find(k => f.includes(k));
  return key
    ? map[key]
    : 'to support the proposed engineering change';
}

module.exports = router;
