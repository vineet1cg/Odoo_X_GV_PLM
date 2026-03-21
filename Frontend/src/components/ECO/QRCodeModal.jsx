import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';

export default function QRCodeModal({ eco }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  // Build the public URL for this ECO
  // This is what the QR code encodes
  const ecoId    = eco._id || eco.id;
  const publicUrl =
    `${window.location.origin}/eco/${ecoId}/public`;

  // ── Download QR as PNG ────────────────────────────────
  const handleDownload = () => {
    const svgEl = document.getElementById('plm-qr-svg');
    if (!svgEl) return;

    const svgData  = new XMLSerializer().serializeToString(svgEl);
    const canvas   = document.createElement('canvas');
    canvas.width   = 300;
    canvas.height  = 300;
    const ctx      = canvas.getContext('2d');
    const img      = new Image();

    img.onload = () => {
      // White background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 300, 300);
      ctx.drawImage(img, 0, 0, 300, 300);

      const link    = document.createElement('a');
      link.download = `${eco.ecoNumber || 'ECO'}-qr.png`;
      link.href     = canvas.toDataURL('image/png');
      link.click();
    };

    img.src = 'data:image/svg+xml;base64,' +
      btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <>
      {/* ── Trigger button ───────────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        title={t('eco.view_qr', 'View QR Code')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '7px 14px',
          background: 'transparent',
          border: '1px solid var(--color-border, #E8E4DA)',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--color-text-secondary, #4A4840)',
          cursor: 'pointer',
          transition: 'all 200ms',
          fontFamily: 'inherit',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = '#A59D84';
          e.currentTarget.style.color = '#A59D84';
          e.currentTarget.style.background = '#F5F3EE';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor =
            'var(--color-border, #E8E4DA)';
          e.currentTarget.style.color =
            'var(--color-text-secondary, #4A4840)';
          e.currentTarget.style.background = 'transparent';
        }}
      >
        {/* QR icon — pure SVG, no library */}
        <svg
          width="14" height="14"
          viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <rect x="3" y="3" width="5" height="5"/>
          <rect x="16" y="3" width="5" height="5"/>
          <rect x="3" y="16" width="5" height="5"/>
          <path d="M21 16h-3a2 2 0 0 0-2 2v3"/>
          <path d="M21 21v.01"/>
          <path d="M12 7v3a2 2 0 0 1-2 2H7"/>
          <path d="M3 12h.01"/>
          <path d="M12 3h.01"/>
          <path d="M12 16v.01"/>
          <path d="M16 12h1"/>
          <path d="M21 12v.01"/>
          <path d="M12 21v-1"/>
        </svg>
        {t('eco.qr_code', 'QR Code')}
      </button>

      {/* ── Modal overlay ────────────────────────────── */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '24px',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: '18px',
              padding: '32px',
              maxWidth: '380px',
              width: '100%',
              textAlign: 'center',
              boxShadow:
                '0 20px 60px rgba(0,0,0,0.2), ' +
                '0 0 0 1px rgba(255,255,255,0.1)',
              position: 'relative',
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              style={{
                position: 'absolute',
                top: '14px', right: '14px',
                width: '28px', height: '28px',
                borderRadius: '50%',
                background: '#F3F4F6',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                color: '#9CA3AF',
                transition: 'all 150ms',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#E5E7EB';
                e.currentTarget.style.color = '#374151';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#F3F4F6';
                e.currentTarget.style.color = '#9CA3AF';
              }}
            >
              ✕
            </button>

            {/* Label */}
            <p style={{
              fontSize: '10px',
              fontWeight: 700,
              color: '#9CA3AF',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              marginBottom: '4px',
            }}>
              {t('eco.qr_code', 'QR Code')}
            </p>

            {/* ECO number */}
            <p style={{
              fontSize: '20px',
              fontWeight: 800,
              color: '#111827',
              letterSpacing: '-0.5px',
              marginBottom: '6px',
            }}>
              {eco.ecoNumber}
            </p>

            {/* ECO title */}
            <p style={{
              fontSize: '13px',
              color: '#6B7280',
              marginBottom: '24px',
              lineHeight: '1.4',
            }}>
              {eco.title}
            </p>

            {/* QR code */}
            <div style={{
              display: 'inline-block',
              padding: '16px',
              background: '#FFFFFF',
              border: '1px solid #E8E4DA',
              borderRadius: '14px',
              marginBottom: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              <QRCodeSVG
                id="plm-qr-svg"
                value={publicUrl}
                size={180}
                level="H"
                includeMargin={false}
                fgColor="#111827"
                bgColor="#FFFFFF"
              />
            </div>

            {/* Stage badge */}
            {eco.stage === 'Done' ? (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#166534',
                background: '#DCFCE7',
                border: '1px solid #BBF7D0',
                padding: '4px 12px',
                borderRadius: '20px',
                marginBottom: '20px',
              }}>
                <span>✓</span>
                {t('eco.qr_public', 'Publicly accessible — no login required')}
              </div>
            ) : (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#B45309',
                background: '#FEF3C7',
                border: '1px solid #FDE68A',
                padding: '4px 12px',
                borderRadius: '20px',
                marginBottom: '20px',
              }}>
                <span>⚠</span>
                {t('eco.qr_private', 'Only visible after approval')}
              </div>
            )}

            {/* Hint text */}
            <p style={{
              fontSize: '12px',
              color: '#9CA3AF',
              lineHeight: '1.6',
              marginBottom: '24px',
            }}>
              {t('eco.qr_hint', 'Scan with any phone camera to open this ECO on the factory floor.')}
            </p>

            {/* Action buttons */}
            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center',
            }}>
              {/* Download button */}
              <button
                onClick={handleDownload}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 20px',
                  background: '#F9F7F2',
                  border: '1px solid #E8E4DA',
                  borderRadius: '9px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#374151',
                  cursor: 'pointer',
                  transition: 'all 150ms',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#ECEBDE';
                  e.currentTarget.style.borderColor = '#C1BAA1';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#F9F7F2';
                  e.currentTarget.style.borderColor = '#E8E4DA';
                }}
              >
                ↓ {t('actions.download', 'Download')}
              </button>

              {/* Open link button */}
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 20px',
                  background: '#A59D84',
                  border: 'none',
                  borderRadius: '9px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  transition: 'all 150ms',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#8C8570';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#A59D84';
                }}
              >
                ↗ {t('actions.open_link', 'Open Link')}
              </a>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
