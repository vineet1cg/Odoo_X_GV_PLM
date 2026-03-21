const { query } = require('../config/database');

const SLA_THRESHOLDS = {
  'New':       { escalate: 48 * 3600000 },
  'In Review': { escalate: 24 * 3600000 },
  'Approval':  { escalate: 16 * 3600000 },
};

let slaInterval = null;

async function checkSLA() {
  try {
    // Fetch non-escalated ECOs in active stages
    const res = await query(
      "SELECT id, eco_number, stage, stage_entered_at FROM ecos WHERE stage NOT IN ('Done', 'Rejected') AND sla_escalated = false"
    );

    const ecos = res.rows;
    const now = Date.now();

    for (const eco of ecos) {
      if (!eco.stage_entered_at) continue;

      const timeInStage = now - new Date(eco.stage_entered_at).getTime();
      const threshold = SLA_THRESHOLDS[eco.stage];

      if (threshold && timeInStage >= threshold.escalate) {
        console.log(`[SLA ESCALATION] 🚨 SLA Breach — ECO ${eco.eco_number} has been in ${eco.stage} stage for too long!`);
        
        // Mark as escalated in DB
        await query('UPDATE ecos SET sla_escalated = true WHERE id = $1', [eco.id]);
      }
    }
  } catch (err) {
    console.error('[SLA Monitor] Error running check:', err);
  }
}

function startSLAMonitor() {
  if (slaInterval) clearInterval(slaInterval);
  console.log('[SLA Monitor] Started (checking every 15 minutes)');
  
  // check every 15 minutes
  slaInterval = setInterval(checkSLA, 900000);
  
  // initial check after 5s
  setTimeout(checkSLA, 5000);
}

module.exports = { startSLAMonitor };
