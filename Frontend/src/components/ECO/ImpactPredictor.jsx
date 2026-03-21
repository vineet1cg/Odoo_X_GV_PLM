import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, AlertTriangle, CheckCircle, ShieldAlert, Clock, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { secureGet } from '../../capacitor/nativeServices';
import { useTranslation } from 'react-i18next';

export default function ImpactPredictor({ ecoId, eco, onApprove, onReject }) {
  const { t } = useTranslation();
  const [impact, setImpact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchImpact = async () => {
      try {
        setLoading(true);
        const token = await secureGet('token');
        const res = await fetch(`http://localhost:5000/api/ecos/${ecoId}/impact`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success && isMounted) {
          setImpact(data.data);
        } else if (isMounted) {
          setError(data.message || t('eco.impact_fail', 'Failed to analyze impact'));
        }
      } catch (err) {
        if (isMounted) setError(err.toString());
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchImpact();
    return () => { isMounted = false; };
  }, [ecoId]);

  if (loading) {
    return (
      <div className="bg-surface-100 rounded-xl border border-surface-200 p-6 mb-6 animate-pulse">
        <div className="h-6 w-1/3 bg-surface-200 rounded mb-2"></div>
        <div className="h-4 w-1/4 bg-surface-200 rounded mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="h-24 bg-surface-200 rounded-xl"></div>
          <div className="h-24 bg-surface-200 rounded-xl"></div>
          <div className="h-24 bg-surface-200 rounded-xl"></div>
        </div>
        <div className="h-10 bg-surface-200 rounded-xl"></div>
      </div>
    );
  }

  if (error || !impact) {
    return null; // Fallback gracefully if error
  }

  const { costImpact, timeImpact, affectedOrders, changedComponents, riskLevel, recommendation } = impact;

  const riskStyles = {
    LOW: 'bg-green-100 text-green-800 border-green-200',
    MEDIUM: 'bg-amber-100 text-amber-800 border-amber-200',
    HIGH: 'bg-red-100 text-red-800 border-red-200 shadow-sm shadow-red-500/20'
  };

  const riskCircle = {
    LOW: 'bg-green-500',
    MEDIUM: 'bg-amber-500',
    HIGH: 'bg-red-500 animate-pulse'
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6 relative overflow-hidden"
    >
      {/* Decorative gradient background based on risk */}
      <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 -mr-20 -mt-20 pointer-events-none ${
        riskLevel === 'HIGH' ? 'bg-red-500' : riskLevel === 'MEDIUM' ? 'bg-amber-500' : 'bg-green-500'
      }`} />

      <div className="flex items-start justify-between mb-6 relative z-10">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {t('eco.impact_analysis', 'Predicted Impact Analysis')}
          </h2>
          <p className="text-sm text-slate-500 mt-1">{t('eco.impact_analysis_desc', 'Calculated intelligently before you approve')}</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold font-mono tracking-widest ${riskStyles[riskLevel]}`}>
          <div className={`w-2 h-2 rounded-full ${riskCircle[riskLevel]}`} />
          {t(`status.${riskLevel.toLowerCase()}`, riskLevel)} {t('eco.risk', 'RISK')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 relative z-10">
        {/* Cost Impact */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 flex justify-between items-center">
            {t('eco.net_cost_change', 'Net Cost Change')}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-3xl font-black ${
              costImpact.direction === 'increase' ? 'text-red-600' : costImpact.direction === 'decrease' ? 'text-green-600' : 'text-slate-700'
            }`}>
              {costImpact.direction === 'increase' ? '+' : ''}{formatCurrency(costImpact.perUnit)}
            </span>
            {costImpact.direction === 'increase' && <ArrowUpRight className="text-red-600" size={24} />}
            {costImpact.direction === 'decrease' && <ArrowDownRight className="text-green-600" size={24} />}
            {costImpact.direction === 'neutral' && <Minus className="text-slate-400" size={24} />}
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">{t('eco.per_unit_produced', 'per unit produced')}</p>
          <div className="mt-4 pt-3 border-t border-slate-200/60">
            <p className="text-[11px] text-slate-600">
              {t('eco.total_impact', 'Total impact')} <strong className="text-slate-800">{costImpact.direction === 'increase' ? '+' : ''}{formatCurrency(costImpact.total)}</strong> {t('eco.across_orders', 'across active orders')}
            </p>
          </div>
        </div>

        {/* Time Impact */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 flex justify-between items-center">
            {t('eco.labor_time_change', 'Labor / Time Change')}
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl font-black ${
              timeImpact.direction === 'increase' ? 'text-red-600' : timeImpact.direction === 'decrease' ? 'text-green-600' : 'text-slate-700'
            }`}>
              {timeImpact.direction === 'increase' ? '+' : ''}{Math.abs(timeImpact.perUnit)}
            </span>
            <span className="text-sm font-bold text-slate-500">{t('common.mins', 'mins')}</span>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">per unit assembled</p>
          <div className="mt-4 pt-3 border-t border-slate-200/60">
            <p className="text-[11px] text-slate-600 flex items-center gap-1">
              <Clock size={12} /> {t('common.total', 'Total')} <strong className="text-slate-800">{timeImpact.direction === 'increase' ? '+' : ''}{timeImpact.total} {t('common.hours', 'hours')}</strong> {t('eco.capacity_change', 'capacity change')}
            </p>
          </div>
        </div>

        {/* Orders Affected */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 flex justify-between items-center">
            {t('eco.production_scope', 'Production Scope')}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-amber-600">{affectedOrders.count}</span>
            <span className="text-sm font-bold text-amber-700/70">{t('eco.wip_orders', 'WIP orders')}</span>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">active in manufacturing</p>
          <div className="mt-4 pt-3 border-t border-slate-200/60">
            <p className="text-[11px] text-slate-600 flex items-center gap-1">
              <Package size={12} /> <strong className="text-slate-800">{affectedOrders.totalUnits.toLocaleString()} {t('common.total_units', 'total units')}</strong> {t('eco.immediately_affected', 'immediately affected')}
            </p>
          </div>
        </div>
      </div>

      {changedComponents && changedComponents.length > 0 && (
        <div className="mb-6 relative z-10 border border-slate-200 rounded-xl overflow-hidden">
          <button 
            onClick={() => setExpanded(!expanded)}
            className="w-full px-4 py-3 bg-slate-50 flex items-center justify-between text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            {t('eco.direct_changes_breakdown', 'Breakdown of Direct Changes')}
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
              {expanded ? t('actions.hide_details', 'Hide Details') : t('actions.view_components', 'View Components')}
            </span>
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.div 
                initial={{ height: 0 }} 
                animate={{ height: 'auto' }} 
                exit={{ height: 0 }} 
                className="overflow-hidden"
              >
                <div className="p-0 border-t border-slate-200">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-2 font-semibold">{t('eco.component_field', 'Component / Field')}</th>
                        <th className="px-4 py-2 font-semibold">{t('eco.change', 'Change')}</th>
                        <th className="px-4 py-2 font-semibold text-right">{t('eco.unit_impact', 'Unit Impact')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {changedComponents.map((c, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-medium text-slate-800 border-l-4" style={{
                            borderLeftColor: c.changeType === 'added' ? '#10b981' : c.changeType === 'removed' ? '#ef4444' : '#f59e0b'
                          }}>
                            {c.name}
                          </td>
                          <td className="px-4 py-3 text-slate-600 text-xs">
                            <div className="line-through text-slate-400">{c.oldValue !== '—' && c.oldValue}</div>
                            <div className="font-medium text-slate-800">{c.newValue !== '—' && c.newValue}</div>
                          </td>
                          <td className={`px-4 py-3 text-right font-bold ${c.costDiff > 0 ? 'text-red-600' : c.costDiff < 0 ? 'text-green-600' : 'text-slate-400'}`}>
                            {c.costDiff > 0 ? '+' : ''}{c.costDiff === 0 ? '—' : formatCurrency(c.costDiff)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Recommendation Block */}
      <div className={`p-4 rounded-xl flex gap-3 relative z-10 items-start ${
        riskLevel === 'HIGH' ? 'bg-red-50 text-red-900 border border-red-100' : 
        riskLevel === 'MEDIUM' ? 'bg-amber-50 text-amber-900 border border-amber-100' : 
        'bg-teal-50 text-teal-900 border border-teal-100'
      }`}>
        <div className="mt-0.5">
          {riskLevel === 'HIGH' ? <ShieldAlert size={20} className="text-red-600" /> :
           riskLevel === 'MEDIUM' ? <AlertTriangle size={20} className="text-amber-600" /> :
           <CheckCircle size={20} className="text-teal-600" />}
        </div>
        <div>
          <h4 className="font-bold text-sm mb-0.5">{t('eco.system_recommendation', 'System Recommendation')}</h4>
          <p className="text-sm font-medium opacity-90">{recommendation}</p>
        </div>
      </div>
      


    </motion.div>
  );
}
