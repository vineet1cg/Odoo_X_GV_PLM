import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function PublicECOView() {
  const { t } = useTranslation();
  const { id }                    = useParams();
  const [eco,     setEco]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error,   setError]       = useState(null);

  useEffect(() => {
    fetch(
      `http://localhost:5000/api/public/eco/${id}`
    )
      .then(r => r.json())
      .then(data => {
        if (data.success) setEco(data.data);
        else setError(data.message);
      })
      .catch(() => setError('Failed to load ECO data'))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Loading ────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F9F7F2',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '36px', height: '36px',
            border: '3px solid #E8E4DA',
            borderTop: '3px solid #A59D84',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: '#7A7868', fontSize: '14px' }}>
            {t('public_eco.loading', 'Loading ECO...')}
          </p>
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to   { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────
  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F9F7F2',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        padding: '24px',
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '320px',
        }}>
          <div style={{
            fontSize: '56px',
            marginBottom: '16px',
          }}>
            🔒
          </div>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#1E1D16',
            marginBottom: '8px',
          }}>
            {t('public_eco.not_available', 'ECO Not Available')}
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#7A7868',
            lineHeight: '1.6',
            marginBottom: '20px',
          }}>
            {error}
          </p>
          <div style={{
            fontSize: '12px',
            color: '#A59D84',
            padding: '10px 16px',
            background: '#ECEBDE',
            borderRadius: '8px',
          }}>
            {t('public_eco.only_approved', 'Only approved ECOs are publicly accessible. Please contact your Admin for access.')}
          </div>
        </div>
      </div>
    );
  }

  // ── Change type colors ─────────────────────────────────
  const changeColors = {
    modified: { bg: '#FEF3C7', border: '#D97706', text: '#92400E' },
    added:    { bg: '#DCFCE7', border: '#16A34A', text: '#166534' },
    removed:  { bg: '#FEE2E2', border: '#DC2626', text: '#991B1B' },
  };

  const changeLabels = {
    modified: t('public_eco.modified', 'MODIFIED'),
    added:    t('public_eco.added', 'ADDED'),
    removed:  t('public_eco.removed', 'REMOVED'),
  };

  // ── Main view ──────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      background: '#F9F7F2',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      padding: '0 0 40px 0',
    }}>

      {/* Header */}
      <div style={{
        background: '#0C1A2E',
        padding: '20px 24px 24px',
      }}>
        {/* PLM Flow branding */}
        <div style={{
          fontSize: '14px',
          fontWeight: 800,
          color: '#FFFFFF',
          letterSpacing: '-0.3px',
          marginBottom: '16px',
        }}>
          PLM<span style={{ color: '#C1BAA1' }}>Flow</span>
          <span style={{
            fontSize: '10px',
            fontWeight: 500,
            color: 'rgba(193,186,161,0.5)',
            marginLeft: '8px',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
          }}>
            {t('public_eco.factory_view', 'Factory View')}
          </span>
        </div>

        {/* Approved badge */}
        <span style={{
          display: 'inline-block',
          fontSize: '10px',
          fontWeight: 700,
          color: '#166534',
          background: '#DCFCE7',
          padding: '3px 10px',
          borderRadius: '20px',
          marginBottom: '10px',
          letterSpacing: '0.5px',
        }}>
          ✓ {t('public_eco.approved', 'APPROVED')}
        </span>

        {/* ECO number */}
        <p style={{
          fontSize: '13px',
          color: '#C1BAA1',
          marginBottom: '4px',
          letterSpacing: '0.5px',
        }}>
          {eco.ecoNumber}
        </p>

        {/* ECO title */}
        <h1 style={{
          fontSize: '20px',
          fontWeight: 800,
          color: '#FFFFFF',
          lineHeight: '1.2',
          letterSpacing: '-0.3px',
        }}>
          {eco.title}
        </h1>
      </div>

      {/* Body */}
      <div style={{ padding: '20px 16px', maxWidth: '600px', margin: '0 auto' }}>

        {/* Details card */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E8E4DA',
          overflow: 'hidden',
          marginBottom: '16px',
        }}>
          {[
            [t('eco.product', 'Product'),      eco.product?.name],
            [t('eco.new_version', 'New Version'),  eco.newVersion],
            [t('eco.type', 'Type'),         eco.type],
            [t('eco.priority', 'Priority'),     eco.priority],
            [t('public_eco.raised_by', 'Raised by'),    eco.raisedBy],
            [t('public_eco.approved_by', 'Approved by'),  eco.approvedBy],
            [t('eco.effective_date', 'Effective'),    eco.effectiveDate
              ? new Date(eco.effectiveDate)
                  .toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
              : t('public_eco.immediate', 'Immediate')],
          ].filter(([_, v]) => v).map(([label, value], i, arr) => (
            <div key={label} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              borderBottom: i < arr.length - 1
                ? '1px solid #F3F4F6' : 'none',
            }}>
              <span style={{
                fontSize: '12px',
                color: '#9CA3AF',
                fontWeight: 500,
              }}>
                {label}
              </span>
              <span style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#1E1D16',
                textAlign: 'right',
                maxWidth: '60%',
              }}>
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Description */}
        {eco.description && (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E8E4DA',
            padding: '16px',
            marginBottom: '16px',
          }}>
            <p style={{
              fontSize: '10px',
              fontWeight: 700,
              color: '#9CA3AF',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '8px',
            }}>
              {t('create_eco.reason', 'Description')}
            </p>
            <p style={{
              fontSize: '13px',
              color: '#374151',
              lineHeight: '1.7',
            }}>
              {eco.description}
            </p>
          </div>
        )}

        {/* Changes */}
        {eco.changes?.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <p style={{
              fontSize: '10px',
              fontWeight: 700,
              color: '#9CA3AF',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '10px',
              paddingLeft: '4px',
            }}>
              {t('public_eco.changes_applied', 'Changes Applied')} ({eco.changes.length})
            </p>
            {eco.changes.map((c, i) => {
              const ct = (c.changeType || 'modified').toLowerCase();
              const cc = changeColors[ct] || changeColors.modified;
              return (
                <div key={i} style={{
                  background: cc.bg,
                  borderLeft: `3px solid ${cc.border}`,
                  borderRadius: '0 8px 8px 0',
                  padding: '10px 14px',
                  marginBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  flexWrap: 'wrap',
                }}>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#1E1D16',
                    minWidth: '100px',
                  }}>
                    {c.fieldName || c.field}
                  </span>

                  {c.oldValue && (
                    <span style={{
                      fontSize: '12px',
                      color: '#DC2626',
                      textDecoration: 'line-through',
                    }}>
                      {c.oldValue}
                    </span>
                  )}

                  {c.oldValue && c.newValue && (
                    <span style={{
                      fontSize: '11px',
                      color: '#9CA3AF',
                    }}>→</span>
                  )}

                  {c.newValue && (
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#15803D',
                    }}>
                      {c.newValue}
                    </span>
                  )}

                  <span style={{
                    marginLeft: 'auto',
                    fontSize: '9px',
                    fontWeight: 700,
                    color: cc.text,
                    background: 'rgba(255,255,255,0.6)',
                    padding: '2px 7px',
                    borderRadius: '10px',
                    letterSpacing: '0.5px',
                  }}>
                    {changeLabels[ct] || 'MODIFIED'}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          padding: '16px',
          fontSize: '11px',
          color: '#B5B0A0',
        }}>
          {t('public_eco.footer_brand', 'PLM Flow by ERP Titans')}
          <br />
          {t('public_eco.footer_readonly', 'This is a read-only public view.')}
          <br />
          {t('public_eco.footer_copyright', '© 2024 · Odoo x Gujarat Vidyapith Hackathon 🏆')}
        </div>
      </div>
    </div>
  );
}
