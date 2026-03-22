// ============================================================//
//  EcoList.jsx — ECO LISTING PAGE                             //
//  Search bar + stage filter + table with desktop/mobile view //
//  "New ECO" button only shows if canCreateEco === true       //
// ============================================================//
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import SLATimer from '../components/ECO/SLATimer';
import { Search, FileText, Plus, ArrowUpRight, Filter, Paperclip, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { secureGet } from '../capacitor/nativeServices';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/index';
import { API_BASE_URL } from '../config/api';

export default function EcoList() {
  const t = (key, opt) => i18n.t(key, opt);
  const { fetchPaginatedEcos, canCreateEco } = useApp();
  const [ecos, setEcos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [slaData, setSlaData] = useState({});
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEcos, setTotalEcos] = useState(0);
  const limit = 8;

  const stages = ['All', 'New', 'In Review', 'Approval', 'Done'];

  const fetchEcos = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchPaginatedEcos({
        page,
        limit,
        search: search || '',
        stage: stageFilter || 'All'
      });
      if (data.success) {
        setEcos(data.data || []);
        setTotalPages(data.totalPages || 1);
        setTotalEcos(data.total || 0);
      }
    } catch (err) {
      console.error('CRITICAL: Failed to fetch ECOs.', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, stageFilter, fetchPaginatedEcos]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchEcos();
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [fetchEcos]);

  // Reset to page 1 when filter/search changes
  useEffect(() => {
    setPage(1);
  }, [search, stageFilter]);

  useEffect(() => {
    let isMounted = true;
    const fetchSla = async () => {
      try {
        const token = await secureGet('token');
        const res = await fetch(`${API_BASE_URL}/ecos/sla/status`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success && isMounted) {
          const map = {};
          (json.data || []).forEach(d => { 
            const ecoId = d.ecoId || d.eco_id;
            if (ecoId) map[ecoId] = d; 
          });
          setSlaData(map);
        }
      } catch (err) { }
    };
    if (ecos.length > 0) fetchSla();
    return () => { isMounted = false; };
  }, [ecos]);




  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-800 tracking-tight">{t('eco.title')}</h1>
          <p className="text-sm text-surface-500 mt-1">{t('eco.subtitle')}</p>
        </div>
        {canCreateEco && (
          <Link
            to="/eco/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md"
          >
            <Plus size={16} /> {t('eco.new_eco')}
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('eco.search')}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-200 bg-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter size={14} className="text-surface-400 mr-1" />
          {stages.map(stage => (
            <button
              key={stage}
              onClick={() => setStageFilter(stage)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                stageFilter === stage
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-surface-100 text-surface-500 hover:bg-surface-200 hover:text-surface-700'
              }`}
            >
              {t(`eco.${stage.toLowerCase().replace(/\s/g, '_')}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Table & Cards */}
      {isLoading ? (
        <div className="bg-surface-100 sm:rounded-xl sm:border border-surface-200 py-20 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="animate-spin text-primary-600" size={32} />
          <p className="text-surface-500 font-medium">{t('eco.loading')}</p>
        </div>
      ) : ecos.length === 0 ? (
        <EmptyState
          title={t('eco.no_ecos')}
          description={t('boms.no_results')}
          icon={FileText}
          action={canCreateEco ? (
            <Link to="/eco/create" className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
              <Plus size={16} /> {t('eco.new_eco')}
            </Link>
          ) : null}
        />
      ) : (
        <>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-surface-100 sm:rounded-xl sm:border border-surface-200 overflow-hidden">
          {/* Desktop/Tablet Table View */}
          <div className="hidden sm:block overflow-x-auto w-full">
            <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">{t('eco.eco_num')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">{t('eco.eco_title')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">{t('eco.type')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">{t('eco.product')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">{t('eco.stage')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">{t('eco.priority_label')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">{t('eco.created_by')}</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {ecos.map((eco, idx) => (
                <motion.tr
                  key={eco.id || eco._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.04 }}
                  className="hover:bg-surface-50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link to={`/eco/${eco.id || eco._id}`} className="text-sm font-mono font-medium text-primary-600 hover:text-primary-700">{eco.ecoNumber}</Link>
                      {(eco.attachedImages?.length > 0 || eco.imageChanges?.length > 0) && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-semibold ring-1 ring-inset ring-indigo-500/20">
                          <Paperclip size={9} /> {(eco.attachedImages?.length || 0) + (eco.imageChanges?.length || 0)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link to={`/eco/${eco.id || eco._id}`} className="text-sm font-medium text-surface-800 hover:text-primary-600 transition-colors">{eco.title}</Link>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={eco.type} />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-surface-500">{eco.productName}</span>
                  </td>
                  <td className="px-6 py-4 flex flex-col items-start gap-1">
                    <StatusBadge status={eco.stage} />
                    {slaData[eco._id || eco.id] && (
                      <div className="mt-1">
                        <SLATimer
                          enteredAt={slaData[eco._id || eco.id].enteredAt}
                          stage={eco.stage}
                          slaStatus={slaData[eco._id || eco.id].slaStatus}
                          percentageUsed={slaData[eco._id || eco.id].percentageUsed}
                          compact={true}
                        />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {eco.priority === 'High' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-danger-50 text-danger-700">
                        {t('priority.High')}
                      </span>
                    ) : (
                      <span className="text-sm text-surface-600">{t(`priority.${eco.priority}`)}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-surface-500">{eco.createdByName}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/eco/${eco.id || eco._id}`} className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 transition-all">
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
            {ecos.map((eco, idx) => (
              <motion.div
                key={eco.id || eco._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="bg-white border text-left border-surface-200 rounded-xl p-4 shadow-sm"
              >
                <div className="flex justify-between items-start mb-3">
                   <div>
                      <Link to={`/eco/${eco.id || eco._id}`} className="text-sm font-mono font-medium text-primary-600 hover:text-primary-700">{eco.ecoNumber}</Link>
                      <Link to={`/eco/${eco.id || eco._id}`} className="block text-base font-semibold text-surface-800 hover:text-primary-600 mt-1">{eco.title}</Link>
                   </div>
                   <div className="flex flex-col gap-1 items-end">
                      <StatusBadge status={eco.stage} />
                      <StatusBadge status={eco.priority} />
                   </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div>
                    <p className="text-[10px] text-surface-400 font-semibold uppercase tracking-wider">{t('eco.type')}</p>
                    <div className="mt-0.5"><StatusBadge status={eco.type}/></div>
                  </div>
                  <div>
                    <p className="text-[10px] text-surface-400 font-semibold uppercase tracking-wider">{t('eco.product')}</p>
                    <p className="text-sm text-surface-700 font-medium truncate mt-0.5">{eco.productName}</p>
                  </div>
                </div>

                <Link
                  to={`/eco/${eco.id || eco._id}`}
                  className="w-full inline-flex justify-center items-center gap-2 py-2.5 bg-surface-50 hover:bg-surface-100 text-surface-700 font-medium text-sm rounded-lg transition-colors border border-surface-200"
                >
                  {t('eco.view_eco')} <ArrowUpRight size={14} />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Pagination Controls */}
        <div className="px-6 py-4 border-t border-surface-200 bg-surface-50 flex items-center justify-between rounded-xl shadow-sm mt-4">
          <p className="text-sm text-surface-500">
            {t('admin.showing')} <span className="font-medium text-surface-800">{(page - 1) * limit + 1}</span> {t('admin.to')} <span className="font-medium text-surface-800">{Math.min(page * limit, totalEcos)}</span> {t('admin.of')} <span className="font-medium text-surface-800">{totalEcos}</span> {t('nav.ecos')}
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
