// ============================================================//
//  DiffView.jsx — CHANGE COMPARISON TABLE                     //
//  Shows old vs new values in color-coded grid                //
//  Green = Added, Red = Removed, Amber = Modified             //
//  Used inside EcoDetail.jsx to display ECO changes           //
// ============================================================//
import { Plus, Minus, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function DiffView({ changes }) {
  const { t } = useTranslation();

  const typeConfig = {
    added: { bg: 'bg-success-50', border: 'border-success-200', text: 'text-success-700', icon: Plus, label: t('eco.added', 'Added') },
    removed: { bg: 'bg-danger-50', border: 'border-danger-200', text: 'text-danger-700', icon: Minus, label: t('eco.removed', 'Removed') },
    modified: { bg: 'bg-warning-50', border: 'border-warning-200', text: 'text-warning-700', icon: Pencil, label: t('eco.modified', 'Modified') },
  };

  if (!changes || changes.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-surface-700 uppercase tracking-wider">{t('eco.changes', 'Changes')}</h3>
      <div className="border border-surface-200 rounded-xl overflow-hidden overflow-x-auto">
        <div className="min-w-[600px]">
        {/* Header */}
        <div className="grid grid-cols-12 bg-surface-50 border-b border-surface-200 px-4 py-2.5">
          <div className="col-span-1 text-xs font-semibold text-surface-400 uppercase">{t('eco.type', 'Type')}</div>
          <div className="col-span-3 text-xs font-semibold text-surface-400 uppercase">{t('eco.field', 'Field')}</div>
          <div className="col-span-4 text-xs font-semibold text-surface-400 uppercase">{t('eco.old_value', 'Old Value')}</div>
          <div className="col-span-4 text-xs font-semibold text-surface-400 uppercase">{t('eco.new_value', 'New Value')}</div>
        </div>
        {/* Rows */}
        {changes.map((change, idx) => {
          const config = typeConfig[change.type] || typeConfig.modified;
          const Icon = config.icon;
          return (
            <div key={idx} className={`grid grid-cols-12 px-4 py-3 border-b border-surface-100 last:border-b-0 ${config.bg} transition-colors`}>
              <div className="col-span-1 flex items-center">
                <span className={`w-6 h-6 rounded-full ${config.border} border flex items-center justify-center`}>
                  <Icon size={12} className={config.text} />
                </span>
              </div>
              <div className="col-span-3 flex items-center">
                <span className="text-sm font-medium text-surface-700">{change.field}</span>
              </div>
              <div className="col-span-4 flex items-center">
                <span className={`text-sm font-mono ${change.type === 'removed' || change.type === 'modified' ? 'text-danger-600 line-through' : 'text-surface-400'}`}>
                  {change.oldValue}
                </span>
              </div>
              <div className="col-span-4 flex items-center">
                <span className={`text-sm font-mono ${change.type === 'added' || change.type === 'modified' ? 'text-success-700 font-semibold' : 'text-surface-400'}`}>
                  {change.newValue}
                </span>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}
