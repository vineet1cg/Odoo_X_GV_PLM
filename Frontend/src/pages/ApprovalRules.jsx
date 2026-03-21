import { ShieldCheck, Plus, CheckCircle, XCircle } from 'lucide-react';
import { approvalRules } from '../data/mockData';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function ApprovalRules() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-800 tracking-tight">{t('admin.approval_rules', 'Approval Rules')}</h1>
          <p className="text-sm text-surface-500 mt-1">{t('admin.approval_rules_desc', 'Manage conditional logic for ECO routing and required signatures')}</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition">
          <Plus size={16} /> {t('actions.add_rule', 'Add Rule')}
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {approvalRules.length === 0 ? (
          <div className="col-span-full p-12 text-center text-surface-500 bg-surface-100 rounded-xl border border-dashed border-surface-300">
            {t('admin.no_rules', 'No active approval rules.')}
          </div>
        ) : (
          approvalRules.map(rule => (
            <div key={rule.id} className="bg-white rounded-xl border border-surface-200 p-5 shadow-sm hover:border-primary-300 transition-colors relative flex flex-col h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className={rule.status === 'Active' ? 'text-primary-600' : 'text-surface-400'} />
                  <h3 className="text-sm font-bold text-surface-800">{rule.name}</h3>
                </div>
                {rule.status === 'Active' ? (
                  <CheckCircle size={16} className="text-success-500" />
                ) : (
                  <XCircle size={16} className="text-surface-300" />
                )}
              </div>
              
              <div className="space-y-3 flex-1">
                <div>
                  <p className="text-xs text-surface-500 mb-1">{t('admin.condition', 'Condition')}</p>
                  <p className="text-sm font-mono text-primary-700 bg-primary-50 px-2 py-1 rounded inline-block">{rule.conditions}</p>
                </div>
                <div>
                  <p className="text-xs text-surface-500 mb-1">{t('admin.required_role', 'Required Role')}</p>
                  <p className="text-sm font-medium text-surface-700">{rule.requiredRole}</p>
                </div>
                <div>
                  <p className="text-xs text-surface-500 mb-1">{t('admin.applies_stage', 'Applies at Stage')}</p>
                  <p className="text-sm font-medium text-surface-700">{rule.stage}</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-surface-100 flex gap-2">
                <button className="flex-1 py-1.5 text-sm font-medium text-surface-600 bg-surface-50 hover:bg-surface-100 rounded-lg transition-colors">{t('actions.edit', 'Edit')}</button>
                <button className="flex-1 py-1.5 text-sm font-medium text-danger-600 bg-danger-50 hover:bg-danger-100 rounded-lg transition-colors">{rule.status === 'Active' ? t('actions.disable', 'Disable') : t('actions.enable', 'Enable')}</button>
              </div>
            </div>
          ))
        )}
      </motion.div>
    </div>
  );
}
