import { Inbox } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function EmptyState({ title, description, icon: Icon = Inbox, action }) {
  const { t } = useTranslation();
  const displayTitle = title || t('common.no_data', 'No data found');
  const displayDesc = description || t('common.no_data_desc', 'There are no items to display.');

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-surface-200 rounded-2xl bg-surface-50/50"
    >
      <div className="w-16 h-16 bg-surface-200/50 rounded-2xl shadow-sm flex items-center justify-center mb-5 text-surface-500">
        <Icon size={32} strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-bold text-surface-800 mb-2 tracking-tight">{displayTitle}</h3>
      <p className="text-sm text-surface-500 font-medium max-w-sm mx-auto mb-6">{displayDesc}</p>
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </motion.div>
  );
}
