import { Users, ShieldCheck, GitMerge, Activity } from 'lucide-react';
import Card from '../../components/ui/Card';
import { motion } from 'framer-motion';
import { users } from '../../data/mockData';
import { useTranslation } from 'react-i18next';

export default function AdminDashboard() {
  const { t } = useTranslation();
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-800 tracking-tight">{t('dashboards.admin_title')}</h1>
        <p className="text-sm text-surface-500 mt-1">{t('dashboards.admin_sub')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card title={t('dashboards.active_users')} value={users.length} subtitle={t('dashboards.across_roles')} icon={Users} color="primary" delay={0} />
        <Card title={t('dashboards.approval_rules')} value="12" subtitle={t('dashboards.active_cond')} icon={ShieldCheck} color="success" delay={1} />
        <Card title={t('dashboards.eco_stages')} value="5" subtitle={t('dashboards.workflow_steps')} icon={GitMerge} color="purple" delay={2} />
        <Card title={t('dashboards.sys_health')} value="99.9%" subtitle={t('dashboards.uptime')} icon={Activity} color="surface" delay={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-surface-100 rounded-xl border border-surface-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-surface-800">{t('dashboards.user_overview')}</h2>
          </div>
          <div className="divide-y divide-surface-100">
            {users.map(user => (
              <div key={user.id} className="flex items-center justify-between px-6 py-4 hover:bg-surface-50 transition-colors">
                <div className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{user.avatar}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-800">{user.name}</p>
                    <p className="text-xs text-surface-500">{user.email}</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-surface-100 text-surface-700 text-xs font-bold rounded border border-surface-200">{t('roles.' + user.role, user.role)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
