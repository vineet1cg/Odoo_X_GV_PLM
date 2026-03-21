import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import { Search, Layers, ArrowUpRight, Plus, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function BillOfMaterials() {
  const { t } = useTranslation();
  const { fetchPaginatedBoms, canCreateEco } = useApp();
  const [boms, setBoms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBoms, setTotalBoms] = useState(0);
  const limit = 8;

  const fetchBoms = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchPaginatedBoms({
        page,
        limit,
        search
      });
      if (data.success) {
        setBoms(data.data);
        setTotalPages(data.totalPages);
        setTotalBoms(data.total);
      }
    } catch (err) {
      console.error('Failed to fetch BoMs', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, fetchPaginatedBoms]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchBoms();
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [fetchBoms]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-800 tracking-tight">{t('boms.title')}</h1>
          <p className="text-sm text-surface-500 mt-1">{t('boms.subtitle')}</p>
        </div>
        {canCreateEco && (
          <Link
            to="/bom/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md"
          >
            <Plus size={16} /> {t('boms.new_bom')}
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('boms.search')}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-200 bg-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition"
        />
      </div>

      {/* Table & Cards */}
      {isLoading ? (
        <div className="bg-surface-100 sm:rounded-xl sm:border border-surface-200 py-20 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="animate-spin text-primary-600" size={32} />
          <p className="text-surface-500 font-medium">{t('boms.loading')}</p>
        </div>
      ) : boms.length === 0 ? (
        <EmptyState title={t('boms.no_boms')} description={t('boms.no_results')} icon={Layers} />
      ) : (
        <>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-surface-100 sm:rounded-xl sm:border border-surface-200 overflow-hidden">
          {/* Desktop/Tablet Table View */}
          <div className="hidden sm:block overflow-x-auto w-full">
            <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">{t('boms.bom_name')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">{t('eco.product')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">{t('products.version')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">{t('boms.components')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">{t('products.status')}</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {boms.map((bom, idx) => (
                <motion.tr
                  key={bom.id || bom._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-surface-50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <Link to={`/bom/${bom.id || bom._id}`} className="text-sm font-medium text-surface-800 hover:text-primary-600 transition-colors">
                      {bom.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <Link to={`/products/${bom.productId}`} className="text-sm text-primary-600 hover:underline">{bom.productName}</Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-surface-700">v{bom.version}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-surface-500">{bom.components?.length || 0} {t('boms.parts')}</span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={bom.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/bom/${bom.id || bom._id}`} className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 transition-all">
                      {t('actions.view')} <ArrowUpRight size={12} />
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 sm:hidden p-4 bg-surface-50">
            {boms.map((bom, idx) => (
              <motion.div
                key={bom.id || bom._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white border text-left border-surface-200 rounded-xl p-4 shadow-sm"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <Link to={`/bom/${bom.id || bom._id}`} className="text-base font-semibold text-surface-800 hover:text-primary-600">
                      {bom.name}
                    </Link>
                    <Link to={`/products/${bom.productId}`} className="block text-sm text-surface-500 hover:underline mt-0.5">
                      {bom.productName}
                    </Link>
                  </div>
                  <StatusBadge status={bom.status} />
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div>
                    <p className="text-[10px] text-surface-400 font-semibold uppercase tracking-wider">{t('products.version')}</p>
                    <p className="text-sm text-surface-700 font-medium">v{bom.version}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-surface-400 font-semibold uppercase tracking-wider">{t('boms.components')}</p>
                    <p className="text-sm text-surface-700 font-medium">{bom.components?.length || 0} {t('boms.parts')}</p>
                  </div>
                </div>

                <Link
                  to={`/bom/${bom.id || bom._id}`}
                  className="w-full inline-flex justify-center items-center gap-2 py-2.5 bg-surface-50 hover:bg-surface-100 text-surface-700 font-medium text-sm rounded-lg transition-colors border border-surface-200"
                >
                  {t('boms.view_bom')} <ArrowUpRight size={14} />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Pagination Controls */}
        <div className="px-6 py-4 border-t border-surface-200 bg-surface-50 flex items-center justify-between rounded-xl shadow-sm mt-4">
          <p className="text-sm text-surface-500">
            {t('admin.showing')} <span className="font-medium text-surface-800">{(page - 1) * limit + 1}</span> {t('admin.to')} <span className="font-medium text-surface-800">{Math.min(page * limit, totalBoms)}</span> {t('admin.of')} <span className="font-medium text-surface-800">{totalBoms}</span> {t('nav.boms')}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-surface-300 rounded-lg text-sm font-medium text-surface-700 bg-white hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} /> {t('admin.prev')}
            </button>
            <div className="px-3 py-1.5 text-sm font-medium text-surface-700">
              {t('admin.page')} {page} {t('admin.of')} {totalPages}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-surface-300 rounded-lg text-sm font-medium text-surface-700 bg-white hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t('admin.next')} <ChevronRight size={16} />
            </button>
          </div>
        </div>
        </>
      )}
    </div>
  );
}
