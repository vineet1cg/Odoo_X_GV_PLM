// ============================================================//
//  Products.jsx — PRODUCT LISTING PAGE                        //
//  Search + status filter (All/Active/Archived)               //
//  Operations users only see Active products (isReadOnly)     //
// ============================================================//
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import { Search, Package, ArrowUpRight, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function Products() {
  const { t } = useTranslation();
  const { fetchPaginatedProducts, isReadOnly } = useApp();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const limit = 8;

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchPaginatedProducts({
        page,
        limit,
        search,
        status: statusFilter
      });
      if (data.success) {
        setProducts(data.data);
        setTotalPages(data.totalPages);
        setTotalProducts(data.total);
      }
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter, fetchPaginatedProducts]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [fetchProducts]);

  // Reset to page 1 when filter/search changes
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-800 tracking-tight">{t('products.title')}</h1>
          <p className="text-sm text-surface-500 mt-1">{t('products.subtitle')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('products.search')}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-200 bg-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition"
          />
        </div>
        <div className="flex gap-1 bg-surface-100 rounded-lg p-1">
          {['All', 'Active', 'Archived'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                statusFilter === status
                  ? 'bg-surface-100 text-surface-800 shadow-sm'
                  : 'text-surface-500 hover:text-surface-700'
              }`}
            >
              {t(`products.${status.toLowerCase()}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Table & Cards */}
      {isLoading ? (
        <div className="bg-surface-100 sm:rounded-xl sm:border border-surface-200 py-20 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="animate-spin text-primary-600" size={32} />
          <p className="text-surface-500 font-medium">{t('products.loading')}</p>
        </div>
      ) : products.length === 0 ? (
        <EmptyState title={t('products.no_products')} description={t('products.no_results')} icon={Package} />
      ) : (
        <>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-100 sm:rounded-xl sm:border border-surface-200 overflow-hidden"
        >
          {/* Desktop/Tablet Table View */}
          <div className="hidden sm:block overflow-x-auto w-full">
            <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">{t('eco.product')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">{t('products.sku')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">{t('products.category')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">{t('products.version')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">{t('products.status')}</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {products.map((product, idx) => (
                <motion.tr
                  key={product.id || product._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-surface-50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <Link to={`/products/${product.id || product._id}`} className="text-sm font-medium text-surface-800 hover:text-primary-600 transition-colors">
                      {product.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-surface-500">{product.sku}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-surface-500">{product.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold font-mono text-surface-700">v{product.version}</span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={product.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/products/${product.id || product._id}`}
                      className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 transition-all"
                    >
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
            {products.map((product, idx) => (
              <motion.div
                key={product.id || product._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white border text-left border-surface-200 rounded-xl p-4 shadow-sm"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <Link to={`/products/${product.id || product._id}`} className="text-base font-semibold text-surface-800 hover:text-primary-600">
                      {product.name}
                    </Link>
                    <p className="text-xs text-surface-500 font-mono mt-0.5">{product.sku}</p>
                  </div>
                  <StatusBadge status={product.status} />
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div>
                    <p className="text-[10px] text-surface-400 font-semibold uppercase tracking-wider">{t('products.category')}</p>
                    <p className="text-sm text-surface-700 font-medium">{product.category}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-surface-400 font-semibold uppercase tracking-wider">{t('products.version')}</p>
                    <p className="text-sm text-surface-700 font-medium font-mono">v{product.version}</p>
                  </div>
                </div>

                <Link
                  to={`/products/${product.id || product._id}`}
                  className="w-full inline-flex justify-center items-center gap-2 py-2.5 bg-surface-50 hover:bg-surface-100 text-surface-700 font-medium text-sm rounded-lg transition-colors border border-surface-200"
                >
                  {t('products.view_details')} <ArrowUpRight size={14} />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Pagination Controls */}
        <div className="px-6 py-4 border-t border-surface-200 bg-surface-50 flex items-center justify-between rounded-xl shadow-sm mt-4">
          <p className="text-sm text-surface-500">
            {t('admin.showing')} <span className="font-medium text-surface-800">{(page - 1) * limit + 1}</span> {t('admin.to')} <span className="font-medium text-surface-800">{Math.min(page * limit, totalProducts)}</span> {t('admin.of')} <span className="font-medium text-surface-800">{totalProducts}</span> {t('products.title')}
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
