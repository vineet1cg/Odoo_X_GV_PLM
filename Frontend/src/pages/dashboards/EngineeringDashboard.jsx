import { FileText, Clock, GitBranch, Edit2, ArrowUpRight, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { activityTimeline } from '../../data/mockData';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import i18n from '../../i18n/index';

export default function EngineeringDashboard() {
  const t = (key, opt) => i18n.t(key, opt);
  const { ecoList, canCreateEco } = useApp();

  const draftEcos = (ecoList || []).filter(e => e?.stage === 'Draft' || e?.stage === 'New');
  const inReviewEcos = (ecoList || []).filter(e => e?.stage === 'Approval' || e?.stage === 'In Review');
  const recentEditedEcos = (ecoList || []).filter(Boolean).slice(0, 5); 

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-800 tracking-tight">{t('dashboards.eng_title')}</h1>
        <p className="text-sm text-surface-500 mt-1">{t('dashboards.eng_sub')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Card title={t('dashboards.my_drafts')} value={draftEcos.length} subtitle={t('dashboards.awaiting_sub')} icon={FileText} color="surface" delay={0} />
        <Card title={t('dashboards.in_review')} value={inReviewEcos.length} subtitle={t('dashboards.pending_app')} icon={Clock} color="primary" delay={1} />
        {canCreateEco && (
          <Link to="/eco/create" className="p-4 rounded-xl border-2 border-dashed border-primary-200 hover:border-primary-400 bg-primary-50 hover:bg-primary-100 transition-all flex flex-col items-center justify-center text-primary-700 min-h-[100px] h-full group">
            <Plus size={24} className="mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">{t('dashboards.draft_new')}</span>
            <span className="text-xs text-primary-500 mt-1">{t('dashboards.start_new')}</span>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-surface-100 rounded-xl border border-surface-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-surface-800">{t('dashboards.recent_work')}</h2>
            <Link to="/eco" className="text-xs text-primary-600 hover:underline">{t('dashboards.view_drafts')}</Link>
          </div>
          <div className="divide-y divide-surface-100">
            {recentEditedEcos.map(eco => (
              <Link key={eco.id || eco._id} to={`/eco/${eco.id || eco._id}`} className="flex items-center justify-between px-6 py-4 hover:bg-surface-50 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-surface-400">{eco.ecoNumber || eco.eco_number}</span>
                    <StatusBadge status={eco.type} />
                  </div>
                  <p className="text-sm font-medium text-surface-800 truncate">{eco.title}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={eco.stage} />
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
