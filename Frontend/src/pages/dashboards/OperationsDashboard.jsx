import { Package, Layers, Activity } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Card from '../../components/ui/Card';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function OperationsDashboard() {
  const { t } = useTranslation();
  const { products, bomList } = useApp();
  const activeProducts = products.filter(p => p.status === 'Active');
  const activeBoms = bomList.filter(b => b.status === 'Active');

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-800 tracking-tight">{t('dashboards.ops_title')}</h1>
        <p className="text-sm text-surface-500 mt-1">{t('dashboards.ops_sub')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Card title={t('dashboards.active_prods')} value={activeProducts.length} subtitle={t('dashboards.ready_mfg')} icon={Package} color="success" delay={0} />
        <Card title={t('dashboards.active_boms')} value={activeBoms.length} subtitle={t('dashboards.approved_ml')} icon={Layers} color="primary" delay={1} />
        <Card title={t('dashboards.sys_status')} value={t('status.online', 'Online')} subtitle={t('dashboards.all_nominal')} icon={Activity} color="surface" delay={2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-surface-100 rounded-xl border border-surface-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-surface-800">{t('dashboards.recently_activated')}</h2>
            <Link to="/products" className="text-xs text-primary-600 hover:underline">{t('dashboards.view_all')}</Link>
          </div>
          <div className="divide-y divide-surface-100">
            {activeProducts.slice(0, 5).map(product => (
              <Link key={product.id} to={`/products/${product.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-surface-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-surface-800">{product.name}</p>
                  <p className="text-xs text-surface-500 mt-0.5">{product.sku}</p>
                </div>
                <span className="px-2 py-1 bg-success-50 text-success-700 text-xs font-bold rounded">v{product.version}</span>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
