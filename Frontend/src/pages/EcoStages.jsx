import { GitMerge, Plus, GripVertical } from 'lucide-react';
import { ECO_STAGES } from '../data/mockData';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function EcoStages() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-800 tracking-tight">{t('nav.eco_stages')}</h1>
          <p className="text-sm text-surface-500 mt-1">{t('nav.eco_stages_desc')}</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition">
          <Plus size={16} /> {t('actions.new_stage')}
        </button>
      </div>

      <div className="max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-surface-100 rounded-xl border border-surface-200 shadow-sm p-2">
          {ECO_STAGES.length === 0 ? (
            <div className="text-center p-12 text-surface-500">{t('nav.no_stages')}</div>
          ) : (
            <div className="space-y-2">
              {ECO_STAGES.map((stage, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-white border border-surface-200 rounded-lg group hover:border-primary-300 transition-colors">
                  <GripVertical size={16} className="text-surface-300 cursor-grab active:cursor-grabbing hover:text-surface-500" />
                  <div className="w-8 h-8 rounded-full bg-surface-100 flex items-center justify-center font-bold text-surface-500 text-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-surface-800">{stage}</h3>
                    <p className="text-xs text-surface-400 mt-0.5">{t('nav.workflow_step', { step: idx + 1 })}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="text-surface-400 hover:text-primary-600 transition-colors">{t('actions.edit')}</button>
                    {idx > 0 && idx < ECO_STAGES.length - 1 && (
                      <button className="text-surface-400 hover:text-danger-600 transition-colors">{t('actions.remove')}</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
        
        <div className="mt-4 p-4 rounded-lg bg-surface-50 border text-surface-600 text-sm flex items-start gap-3">
          <GitMerge size={16} className="mt-0.5 text-primary-500" />
          <p>{t('nav.eco_stages_help')}</p>
        </div>
      </div>
    </div>
  );
}
