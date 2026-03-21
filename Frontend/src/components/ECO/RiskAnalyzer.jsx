// ============================================================//
//  RiskAnalyzer.jsx — Smart Risk Analysis Panel               //
//  Fetches risk score on mount, shows LOW/MEDIUM/HIGH badge   //
//  with specific warnings ABOVE the approve button            //
//  Pure React + inline styles — works on web and Capacitor    //
// ============================================================//
import { useState, useEffect } from 'react';
import { fetchRiskAnalysis } from '../../services/riskService';
import { useTranslation } from 'react-i18next';

export default function RiskAnalyzer({ ecoId }) {
  const { t } = useTranslation();
  const [risk,    setRisk]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [open,    setOpen]    = useState(true);

  useEffect(() => {
    if (!ecoId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchRiskAnalysis(ecoId)
      .then(data => {
        if (isMounted) {
          setRisk(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error('[RiskAnalyzer]', err.message);
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [ecoId]);

  // ── Loading state ──────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center gap-2.5 px-4 py-3.5 bg-surface-100 border border-surface-200 rounded-xl mb-4">
        <div
          className="w-4 h-4 border-2 border-surface-200 rounded-full flex-shrink-0"
          style={{
            borderTopColor: '#A59D84',
            animation: 'risk-spin 1s linear infinite',
          }}
        />
        <span className="text-sm text-surface-500">
          {t('eco.analyzing_risk', 'Analyzing risk factors...')}
        </span>
        <style>{`
          @keyframes risk-spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────
  if (error) {
    return (
      <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl mb-4 text-sm text-amber-800">
        ⚠ {t('eco.risk_unavailable', 'Risk analysis unavailable — {{error}}', { error })}
      </div>
    );
  }

  if (!risk) return null;

  const { level, score, scorePercent, colors,
          warnings, positives, recommendation } = risk;

  const levelIcon = {
    LOW:    '✓',
    MEDIUM: '⚠',
    HIGH:   '✕',
  };

  return (
    <div
      className="rounded-xl overflow-hidden mb-4"
      style={{
        border: `1px solid ${colors.border}`,
        borderLeft: `4px solid ${colors.text}`,
      }}
    >
      {/* ── Header row ───────────────────────────────── */}
      <div
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2.5 px-4 py-3 cursor-pointer select-none"
        style={{ background: colors.bg }}
      >
        {/* Risk badge */}
        <span
          className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold flex-shrink-0"
          style={{ background: colors.text }}
        >
          {levelIcon[level]}
        </span>

        {/* Level label */}
        <div className="flex-1 flex items-center gap-2.5 flex-wrap">
          <span
            className="text-xs font-bold uppercase tracking-wide"
            style={{ color: colors.text, letterSpacing: '0.8px' }}
          >
            {t(`status.${level.toLowerCase()}`, level)} {t('eco.risk', 'RISK')}
          </span>
          <span className="text-xs text-surface-500">
            {t('eco.score', 'Score')}: {score} / 12 &nbsp;·&nbsp; {scorePercent}%
          </span>
        </div>

        {/* Score bar */}
        <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
          <div
            className="h-full rounded-full"
            style={{
              width: `${scorePercent}%`,
              background: colors.text,
              transition: 'width 600ms ease',
            }}
          />
        </div>

        {/* Chevron */}
        <span
          className="text-xs text-surface-400 flex-shrink-0"
          style={{
            transition: 'transform 200ms',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          ▼
        </span>
      </div>

      {/* ── Body ─────────────────────────────────────── */}
      {open && (
        <div className="px-4 py-3.5 bg-surface-100">

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-1.5">
                {t('eco.risk_factors', 'Risk Factors')}
              </p>
              {warnings.map((w, i) => (
                <div
                  key={i}
                  className="flex gap-2 items-start py-1.5"
                  style={{
                    borderBottom: i < warnings.length - 1
                      ? '1px solid var(--color-border, #F3F1EC)'
                      : 'none',
                  }}
                >
                  <span className="text-xs flex-shrink-0 mt-px" style={{ color: colors.text }}>
                    ⚠
                  </span>
                  <span className="text-sm text-surface-600 leading-relaxed">
                    {w}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Positives */}
          {positives.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-1.5">
                {t('eco.positive_factors', 'Positive Factors')}
              </p>
              {positives.map((p, i) => (
                <div
                  key={i}
                  className="flex gap-2 items-start py-1.5"
                  style={{
                    borderBottom: i < positives.length - 1
                      ? '1px solid var(--color-border, #F3F1EC)'
                      : 'none',
                  }}
                >
                  <span className="text-xs flex-shrink-0 mt-px text-emerald-600">
                    ✓
                  </span>
                  <span className="text-sm text-surface-600 leading-relaxed">
                    {p}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Recommendation box */}
          <div
            className="px-3.5 py-2.5 rounded-lg text-sm font-medium leading-relaxed"
            style={{
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              color: colors.text,
            }}
          >
            {recommendation}
          </div>
        </div>
      )}
    </div>
  );
}
