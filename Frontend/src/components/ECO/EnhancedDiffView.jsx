import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Plus, Minus, Edit3, ChevronDown, ChevronUp, Image as ImageIcon } from 'lucide-react';
import { getChangeTypeLabel, getChangeTypeColor, countChangeTypes, calculateCostImpact } from '../../utils/ecoUtils';
import useStaggeredAnimation from '../../hooks/useStaggeredAnimation';

/**
 * Enhanced DiffView — Visual diff comparison for ECO changes.
 * Supports both BoM diffs (component tables) and Product diffs (field comparison).
 */
export default function EnhancedDiffView({ eco, oldBom, newBom, type }) {
  const changes = eco?.changes || [];
  const imageChanges = eco?.imageChanges || [];
  const [showUnchanged, setShowUnchanged] = useState(false);
  const changeCounts = useMemo(() => countChangeTypes(changes), [changes]);
  const { containerRef, getItemStyle } = useStaggeredAnimation(changes.length, 50);

  const costImpact = useMemo(() => {
    if (oldBom && newBom) return calculateCostImpact(oldBom.components, newBom.components);
    return null;
  }, [oldBom, newBom]);

  const getChangeIcon = useCallback((changeType) => {
    if (changeType === 'added') return <Plus size={12} />;
    if (changeType === 'removed') return <Minus size={12} />;
    return <Edit3 size={12} />;
  }, []);

  if (!changes.length && !imageChanges.length) {
    return (
      <div style={{
        padding: 48, textAlign: 'center', background: '#fff', borderRadius: 8,
        border: '1px solid #E2E8F0', fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        <Edit3 size={36} style={{ color: '#CBD5E1', margin: '0 auto 12px' }} />
        <p style={{ fontSize: 14, fontWeight: 600, color: '#64748B' }}>{t('eco.no_changes', 'No changes recorded')}</p>
        <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>{t('eco.no_changes_desc', 'This ECO has no tracked changes yet.')}</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }} ref={containerRef}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 16, flexWrap: 'wrap', gap: 10,
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
            Change Comparison
          </h3>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {changeCounts.modified > 0 && (
              <span style={{
                padding: '3px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 600,
                background: '#FFF7ED', color: '#C2410C', border: '1px solid #FDE68A',
              }}>
                {changeCounts.modified} {t('eco.modified', 'Modified')}
              </span>
            )}
            {changeCounts.added > 0 && (
              <span style={{
                padding: '3px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 600,
                background: '#F0FDF4', color: '#166534', border: '1px solid #A7F3D0',
              }}>
                {changeCounts.added} {t('eco.added', 'Added')}
              </span>
            )}
            {changeCounts.removed > 0 && (
              <span style={{
                padding: '3px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 600,
                background: '#FFF1F2', color: '#9F1239', border: '1px solid #FECACA',
              }}>
                {changeCounts.removed} {t('eco.removed', 'Removed')}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowUnchanged(!showUnchanged)}
          style={{
            display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px',
            borderRadius: 6, fontSize: 12, fontWeight: 500, background: '#F8FAFC',
            color: '#64748B', border: '1px solid #E2E8F0', cursor: 'pointer',
            transition: 'all 150ms ease', fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {showUnchanged ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {showUnchanged ? t('actions.collapse', 'Collapse') : t('actions.expand_all', 'Expand All')}
        </button>
      </div>

      {/* Version Headers */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12,
        marginBottom: 16,
      }}>
        <div style={{
          padding: '8px 14px', borderRadius: 6, background: '#F1F5F9',
          fontSize: 12, fontWeight: 600, color: '#475569', textAlign: 'center',
        }}>
          {t('eco.before', 'Before')} {eco?.versionUpdate && eco?.newVersion ? `(${t('eco.current', 'Current')})` : ''}
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ArrowRight size={14} style={{ color: '#94A3B8' }} />
        </div>
        <div style={{
          padding: '8px 14px', borderRadius: 6, background: '#CCFBF1',
          fontSize: 12, fontWeight: 600, color: '#0D9488', textAlign: 'center',
        }}>
          {t('eco.after', 'After')} {eco?.newVersion ? `(v${eco.newVersion})` : ''}
        </div>
      </div>

      {/* Change Rows */}
      <div style={{
        borderRadius: 8, overflow: 'hidden', border: '1px solid #E2E8F0',
      }}>
        {changes.map((change, idx) => {
          const ct = change.type || change.changeType || 'modified';
          const colors = getChangeTypeColor(ct);

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              style={{
                ...getItemStyle(idx),
                display: 'grid', gridTemplateColumns: '180px 1fr auto 1fr', gap: 0,
                alignItems: 'center', borderBottom: idx < changes.length - 1 ? '1px solid #F1F5F9' : 'none',
                background: colors.bg, borderLeft: `3px solid ${colors.border}`,
                padding: '12px 16px', transition: 'background 150ms ease',
              }}
            >
              {/* Field Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: colors.text, display: 'flex' }}>
                  {getChangeIcon(ct)}
                </span>
                <span style={{
                  fontSize: 13, fontWeight: 600, color: '#0F172A',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {change.field || change.fieldName}
                </span>
                {ct !== 'modified' && (
                  <span style={{
                    padding: '1px 7px', borderRadius: 4, fontSize: 10, fontWeight: 700,
                    background: colors.badge, color: colors.text, textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {getChangeTypeLabel(ct)}
                  </span>
                )}
              </div>

              {/* Old Value */}
              <div style={{ padding: '0 12px' }}>
                <span style={{
                  fontSize: 13,
                  color: ct === 'added' ? '#94A3B8' : ct === 'removed' ? '#9F1239' : '#DC2626',
                  textDecoration: ct === 'removed' || ct === 'modified' ? 'line-through' : 'none',
                  fontStyle: ct === 'added' ? 'italic' : 'normal',
                }}>
                  {change.oldValue || '—'}
                </span>
              </div>

              {/* Arrow */}
              <div style={{ display: 'flex', justifyContent: 'center', padding: '0 8px' }}>
                <ArrowRight size={14} style={{ color: '#CBD5E1' }} />
              </div>

              {/* New Value */}
              <div style={{ padding: '0 12px' }}>
                <span style={{
                  fontSize: 13, fontWeight: ct === 'removed' ? 400 : 600,
                  color: ct === 'removed' ? '#94A3B8' : '#166534',
                  textDecoration: ct === 'removed' ? 'line-through' : 'none',
                  fontStyle: ct === 'removed' ? 'italic' : 'normal',
                }}>
                  {change.newValue || '—'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Cost Impact */}
      {costImpact && costImpact.amount !== 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            marginTop: 16, padding: '14px 20px', borderRadius: 8,
            background: '#FFFBEB', border: '1px solid #FDE68A',
            display: 'flex', alignItems: 'center', gap: 10,
          }}
        >
          <span style={{ fontSize: 13, color: '#92400E', fontWeight: 500 }}>
            {t('eco.total_cost_impact', 'Total cost impact:')}
          </span>
          <span style={{ fontSize: 14, fontWeight: 700, color: costImpact.amount >= 0 ? '#DC2626' : '#059669' }}>
            {costImpact.amount >= 0 ? '+' : ''}₹{Math.abs(costImpact.amount).toLocaleString()}
            {' '}{t('eco.per_unit', 'per unit')} ({costImpact.amount >= 0 ? '+' : ''}{costImpact.percent}%)
          </span>
        </motion.div>
      )}

      {/* Image Changes */}
      {imageChanges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ marginTop: 20 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <ImageIcon size={15} style={{ color: '#64748B' }} />
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('eco.image_changes', 'Image Changes')}
            </h4>
            <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>
              ({imageChanges.length})
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {imageChanges.map(ic => {
              const ctColor = getChangeTypeColor(ic.changeType);
              return (
                <div key={ic.id} style={{
                  borderRadius: 8, border: '1px solid #E2E8F0', overflow: 'hidden',
                  background: '#fff',
                }}>
                  <div style={{
                    padding: '10px 14px', borderBottom: '1px solid #F1F5F9',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#0F172A' }}>{ic.label}</span>
                    <span style={{
                      padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700,
                      background: ctColor.badge, color: ctColor.text, textTransform: 'uppercase',
                    }}>
                      {getChangeTypeLabel(ic.changeType)}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: ic.oldImage ? '1fr 1fr' : '1fr', gap: 0 }}>
                    {ic.oldImage && (
                      <div style={{ padding: 8, background: '#FFF1F2', textAlign: 'center' }}>
                        <div style={{
                          width: '100%', aspectRatio: '4/3', borderRadius: 6, overflow: 'hidden',
                          background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <img src={ic.oldImage.url} alt={ic.oldImage.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        </div>
                        <p style={{ fontSize: 10, color: '#9F1239', marginTop: 4, fontWeight: 500 }}>{t('eco.before', 'Before')}</p>
                      </div>
                    )}
                    {ic.newImage && (
                      <div style={{ padding: 8, background: '#F0FDF4', textAlign: 'center' }}>
                        <div style={{
                          width: '100%', aspectRatio: '4/3', borderRadius: 6, overflow: 'hidden',
                          background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <img src={ic.newImage.url} alt={ic.newImage.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        </div>
                        <p style={{ fontSize: 10, color: '#166534', marginTop: 4, fontWeight: 500 }}>{t('eco.after', 'After')}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
