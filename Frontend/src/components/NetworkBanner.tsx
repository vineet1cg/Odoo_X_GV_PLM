import React, { useEffect, useState } from 'react';
import { addNetworkListener, getNetworkStatus } from '../capacitor/nativeServices';

const NetworkBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    getNetworkStatus().then((s) => setIsOnline(s.connected));

    const listener = addNetworkListener((connected) => {
      setIsOnline(connected);
      setShowBanner(!connected);
      if (connected) setTimeout(() => setShowBanner(false), 3000);
      else setShowBanner(true);
    });

    return () => { listener.then(l => l.remove()); };
  }, []);

  if (!showBanner) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: isOnline
          ? 'rgba(34, 197, 94, 0.15)'
          : 'rgba(239, 68, 68, 0.15)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${isOnline ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
        padding: '10px 20px',
        textAlign: 'center',
        color: isOnline ? '#4ade80' : '#f87171',
        fontSize: '13px',
        fontWeight: 600,
        letterSpacing: '0.05em',
      }}
    >
      {isOnline ? '✓ CONNECTION RESTORED' : '⚠ NO NETWORK — OFFLINE MODE'}
    </div>
  );
};

export default NetworkBanner;
