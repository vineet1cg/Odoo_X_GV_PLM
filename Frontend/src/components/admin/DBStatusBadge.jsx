import { useState, useEffect } from 'react';
import { Database, Activity, RefreshCw, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { secureGet } from '../../capacitor/nativeServices';

export default function DBStatusBadge() {
  const [status, setStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      const token = await secureGet('token');
      if (!token) return; // Don't poll if not logged in
      try {
        const res = await fetch('http://localhost:5000/api/db/status', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) return; // Silently skip on auth errors
        const data = await res.json();
        if (data.success) {
          setStatus(data.data);
          setLogs(data.data.recentLogs || []);
        }
      } catch (err) {
        // Silently ignore — server may not be ready yet
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  if (!status) return null;

  const isNormal  = status.current === 'postgres';
  const isSyncing = status.isSyncing;

  const config = isNormal
    ? { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500', icon: CheckCircle }
    : isSyncing
    ? { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500', icon: RefreshCw }
    : { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-500', icon: AlertTriangle };

  const StatusIcon = config.icon;

  return (
    <div className="relative">
      {/* Badge */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all hover:shadow-sm ${config.bg} ${config.border} ${config.text}`}
      >
        <div className={`w-2 h-2 rounded-full ${config.dot} ${!isNormal ? 'animate-pulse' : ''}`} />
        <StatusIcon size={12} className={isSyncing ? 'animate-spin' : ''} />
        <span className="hidden sm:inline">
          {isSyncing
            ? 'Syncing...'
            : isNormal
            ? 'PostgreSQL'
            : 'MongoDB Backup'}
        </span>
      </button>

      {/* Dropdown */}
      {expanded && (
        <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-xl border border-surface-200 overflow-hidden z-50 animate-fade-in">
          <div className="px-4 py-3 border-b border-surface-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database size={14} className="text-surface-500" />
              <h3 className="text-sm font-semibold text-surface-800">Database Status</h3>
            </div>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}>
              {status.current === 'postgres' ? 'Primary' : 'Backup'}
            </span>
          </div>

          <div className="px-4 py-3 space-y-3">
            {/* Connection status */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-2.5 rounded-lg border ${status.postgres?.healthy ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-surface-400 mb-1">PostgreSQL</p>
                <div className="flex items-center gap-1.5">
                  {status.postgres?.healthy
                    ? <CheckCircle size={12} className="text-emerald-500" />
                    : <XCircle size={12} className="text-red-500" />}
                  <span className={`text-xs font-semibold ${status.postgres?.healthy ? 'text-emerald-700' : 'text-red-700'}`}>
                    {status.postgres?.healthy ? 'Connected' : 'Down'}
                  </span>
                </div>
              </div>
              <div className={`p-2.5 rounded-lg border ${status.mongo?.healthy ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-surface-400 mb-1">MongoDB</p>
                <div className="flex items-center gap-1.5">
                  {status.mongo?.healthy
                    ? <CheckCircle size={12} className="text-emerald-500" />
                    : <XCircle size={12} className="text-red-500" />}
                  <span className={`text-xs font-semibold ${status.mongo?.healthy ? 'text-emerald-700' : 'text-red-700'}`}>
                    {status.mongo?.healthy ? 'Connected' : 'Down'}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats (admin) */}
            {status.stats && (
              <div className="bg-surface-50 rounded-lg p-3 border border-surface-200">
                <p className="text-[10px] font-bold uppercase tracking-wider text-surface-400 mb-2">Failover Statistics</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-surface-500">Failovers:</span>
                    <span className="ml-1 font-semibold text-surface-800">{status.stats.failoverCount}</span>
                  </div>
                  <div>
                    <span className="text-surface-500">Downtime:</span>
                    <span className="ml-1 font-semibold text-surface-800">
                      {status.stats.totalDowntimeMs > 0
                        ? `${Math.round(status.stats.totalDowntimeMs / 1000)}s`
                        : '0s'}
                    </span>
                  </div>
                  {status.stats.lastFailoverAt && (
                    <div className="col-span-2">
                      <span className="text-surface-500">Last failover:</span>
                      <span className="ml-1 font-semibold text-surface-800">
                        {new Date(status.stats.lastFailoverAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Status message */}
            <p className="text-xs text-surface-600 font-medium">{status.message}</p>

            {/* Recent sync logs */}
            {logs.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-surface-400 mb-1.5">Recent Sync Logs</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {logs.slice(0, 5).map((log, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-surface-600 py-1 border-b border-surface-50">
                      <Activity size={10} className="text-surface-400 flex-shrink-0" />
                      <span className="font-mono">{log.direction}</span>
                      <span>→</span>
                      <span className="font-semibold">{log.records_synced ?? 0} records</span>
                      <span className={`ml-auto font-bold ${log.status === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {log.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
