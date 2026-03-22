import { Inbox, CheckCircle, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import i18n from '../../i18n/index';

export default function ApproverDashboard() {
  const t = (key, opt) => i18n.t(key, opt);
  const { ecoList } = useApp();

  const pendingApprovals = (ecoList || []).filter(e => (e?.stage === 'Approval') || (e?.stage === 'In Review'));
  const urgentApprovals = pendingApprovals.filter(e => e?.priority === 'High');

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-800 tracking-tight">{t('dashboards.app_title')}</h1>
        <p className="text-sm text-surface-500 mt-1">{t('dashboards.app_sub')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card title={t('dashboards.pending_review')} value={pendingApprovals.length} subtitle={t('dashboards.awaiting_sig')} icon={Inbox} color="primary" delay={0} />
        <Card title={t('dashboards.urgent_actions')} value={urgentApprovals.length} subtitle={t('dashboards.high_priority')} icon={AlertTriangle} color="danger" delay={1} />
        <Card title={t('dashboards.completed_today')} value="0" subtitle={t('dashboards.recently_approved')} icon={CheckCircle} color="success" delay={2} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-surface-100 rounded-xl border border-surface-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-surface-800">{t('dashboards.assigned_to_me')}</h2>
        </div>
        <div className="divide-y divide-surface-100">
          {pendingApprovals.length > 0 ? pendingApprovals.map(eco => (
            <Link key={eco.id || eco._id} to={`/eco/${eco.id || eco._id}`} className="flex items-center justify-between px-6 py-4 hover:bg-surface-50 transition-colors">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-surface-400">{eco.ecoNumber || eco.eco_number}</span>
                  {eco.priority === 'High' && <span className="text-[10px] bg-danger-100 text-danger-700 px-1.5 py-0.5 rounded font-bold uppercase">{t('priority.High')}</span>}
                </div>
                <p className="text-sm font-medium text-surface-800 truncate">{eco.title}</p>
                <p className="text-xs text-surface-400 mt-0.5">{t('dashboards.submitted_by', 'Submitted by')} {eco.createdByName || eco.creator_name}</p>
              </div>
              <div className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg shadow-sm">
                {t('dashboards.review_diff')}
              </div>
            </Link>
          )) : (
            <div className="px-6 py-12 text-center">
              <CheckCircle size={32} className="mx-auto text-success-400 mb-3" />
              <p className="text-surface-500 font-medium">{t('dashboards.all_caught_up')}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
