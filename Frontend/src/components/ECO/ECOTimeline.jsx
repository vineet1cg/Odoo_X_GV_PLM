import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, ArrowRight, Check, X, Tag, Bell, Clock } from 'lucide-react';
import { timeAgo, formatDateTime } from '../../utils/dateUtils';
import useStaggeredAnimation from '../../hooks/useStaggeredAnimation';
import { useTranslation } from 'react-i18next';

const EVENT_CONFIG = {
  'ECO Created':              { icon: Plus, bg: '#0D9488', color: '#fff' },
  'Submitted for Approval':   { icon: ArrowRight, bg: '#3B82F6', color: '#fff' },
  'Approved':                 { icon: Check, bg: '#10B981', color: '#fff' },
  'Rejected':                 { icon: X, bg: '#EF4444', color: '#fff' },
  'Applied to Production':    { icon: Tag, bg: '#8B5CF6', color: '#fff' },
  'Notification Sent':        { icon: Bell, bg: 'transparent', color: '#94A3B8', outline: true },
};

function getEventConfig(action) {
  const key = Object.keys(EVENT_CONFIG).find(k => action?.includes(k));
  return EVENT_CONFIG[key] || EVENT_CONFIG['ECO Created'];
}

function getDurationBetween(from, to, t) {
  const fromD = new Date(from);
  const toD = new Date(to);
  const diffMs = Math.abs(toD - fromD);
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days} ${t(days === 1 ? 'time.day_later' : 'time.days_later', 'days later')}`;
  if (hours > 0) return `${hours} ${t(hours === 1 ? 'time.hour_later' : 'time.hours_later', 'hours later')}`;
  const mins = Math.floor(diffMs / (1000 * 60));
  return `${mins} ${t(mins === 1 ? 'time.minute_later' : 'time.minutes_later', 'minutes later')}`;
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

/**
 * ECOTimeline — Vertical timeline of ECO approval history with staggered animations.
 */
export default function ECOTimeline({ approvalLogs = [], ecoId, createdAt, createdBy }) {
  const { t } = useTranslation();
  const allEvents = useMemo(() => {
    const events = [];
    if (createdAt) {
      events.push({
        action: 'ECO Created',
        user: typeof createdBy === 'object' ? createdBy?.name : (createdBy || 'System'),
        timestamp: createdAt,
        comment: null,
      });
    }
    approvalLogs.forEach(log => {
      if (log.action !== 'ECO Created') {
        events.push(log);
      }
    });
    return events;
  }, [approvalLogs, createdAt, createdBy]);

  const { containerRef, getItemStyle } = useStaggeredAnimation(allEvents.length, 100);

  if (!allEvents.length) {
    return (
      <div style={{
        padding: 48, textAlign: 'center', fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        <Clock size={36} style={{ color: '#CBD5E1', margin: '0 auto 12px' }} />
        <p style={{ fontSize: 14, fontWeight: 600, color: '#64748B' }}>{t('eco.no_activity', 'No activity yet')}</p>
        <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>
          {t('eco.timeline_wait', 'Timeline events will appear as this ECO progresses.')}
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Clock size={15} style={{ color: '#64748B' }} />
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
          {t('eco.approval_timeline', 'Approval Timeline')}
        </h3>
        <span style={{
          padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 600,
          background: '#CCFBF1', color: '#0D9488',
        }}>
          {allEvents.length} {allEvents.length === 1 ? t('eco.event', 'event') : t('eco.events', 'events')}
        </span>
      </div>

      <div style={{ position: 'relative', paddingLeft: 32 }}>
        {/* Vertical line */}
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: '100%' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            position: 'absolute', left: 9, top: 0, width: 2,
            background: 'linear-gradient(180deg, #0D9488, #E2E8F0)',
          }}
        />

        {allEvents.map((event, idx) => {
          const config = getEventConfig(event.action);
          const Icon = config.icon;
          const isRejected = event.action?.includes('Rejected');
          const isApproved = event.action?.includes('Approved') || event.action?.includes('Applied');

          return (
            <div key={idx} style={getItemStyle(idx)}>
              {/* Duration pill between events */}
              {idx > 0 && allEvents[idx - 1]?.timestamp && event.timestamp && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
                  padding: '4px 0', marginLeft: -32,
                }}>
                  <div style={{
                    marginLeft: 22, padding: '2px 10px', borderRadius: 9999,
                    fontSize: 10, fontWeight: 500, color: '#94A3B8', background: '#F1F5F9',
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                  }}>
                    ↓ {getDurationBetween(allEvents[idx - 1].timestamp, event.timestamp, t)}
                  </div>
                </div>
              )}

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                style={{
                  position: 'relative', paddingBottom: idx < allEvents.length - 1 ? 8 : 0,
                  marginBottom: 4,
                }}
              >
                {/* Node circle */}
                <div style={{
                  position: 'absolute', left: -32, top: 4,
                  width: 20, height: 20, borderRadius: '50%',
                  background: config.outline ? '#fff' : config.bg,
                  border: config.outline ? `2px solid ${config.color}` : `2px solid ${config.bg}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  zIndex: 2,
                  boxShadow: '0 0 0 3px #fff',
                }}>
                  <Icon size={10} style={{ color: config.outline ? config.color : config.color }} />
                </div>

                {/* Event card */}
                <div style={{
                  padding: '12px 16px', borderRadius: 8, background: '#fff',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  transition: 'all 150ms ease',
                }}>
                  {/* Title + Actor */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>
                      {t(`eco.action_${event.action.toLowerCase().replace(/ /g, '_')}`, event.action)}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 12, color: '#94A3B8' }}>{t('reports.by', 'by')}</span>
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%', background: '#CCFBF1',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 8, fontWeight: 700, color: '#0D9488',
                      }}>
                        {getInitials(event.user)}
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 500, color: '#64748B' }}>
                        {event.user}
                      </span>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <p
                    style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0 0', cursor: 'help' }}
                    title={formatDateTime(event.timestamp)}
                  >
                    {timeAgo(event.timestamp)}
                  </p>

                  {/* Comment block */}
                  {event.comment && (
                    <div style={{
                      marginTop: 10, padding: '8px 12px', borderRadius: 6,
                      borderLeft: `3px solid ${isRejected ? '#EF4444' : isApproved ? '#10B981' : '#0D9488'}`,
                      background: isRejected ? '#FEF2F2' : isApproved ? '#F0FDF4' : '#F8FAFC',
                    }}>
                      <p style={{
                        fontSize: 12, fontStyle: 'italic', lineHeight: 1.6, margin: 0,
                        color: isRejected ? '#991B1B' : isApproved ? '#064E3B' : '#475569',
                      }}>
                        "{event.comment}"
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
