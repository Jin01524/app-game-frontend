import React, { useState, useEffect, useRef } from 'react';

/**
 * LandscapeEnforcer
 *
 * Reality check on Chrome Android (Pixel 7a etc.):
 * - screen.orientation.lock() requires FULLSCREEN, not just standalone PWA.
 * - Manifest "orientation":"any" lets the user PHYSICALLY rotate to landscape.
 * - So the correct flow is:
 *     1. Show a small tap-to-fullscreen banner when in portrait.
 *     2. On tap → requestFullscreen() → screen.orientation.lock('landscape').
 *     3. If already landscape, render normally.
 *     4. If user refuses / not supported, show a gentle hint.
 */
export default function LandscapeEnforcer({ children }) {
  const [isPortrait, setIsPortrait] = useState(
    () => window.innerHeight > window.innerWidth
  );
  const [isLocked, setIsLocked] = useState(false);
  const [locking, setLocking] = useState(false);
  const [lockUnsupported, setLockUnsupported] = useState(false);

  useEffect(() => {
    const handler = () => {
      const portrait = window.innerHeight > window.innerWidth;
      setIsPortrait(portrait);
      if (!portrait) setIsLocked(true); // already landscape – good
    };
    handler();
    window.addEventListener('resize', handler);
    window.addEventListener('orientationchange', handler);
    return () => {
      window.removeEventListener('resize', handler);
      window.removeEventListener('orientationchange', handler);
      // Unlock and exit fullscreen when leaving page
      try { screen.orientation?.unlock(); } catch {}
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  const handleForce = async () => {
    setLocking(true);
    try {
      // Step 1: Go fullscreen (required for orientation lock on Chrome Android)
      await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
      // Step 2: Lock to landscape
      await screen.orientation.lock('landscape');
      setIsLocked(true);
    } catch (e) {
      // Lock not supported even in fullscreen (some devices/browsers)
      setLockUnsupported(true);
    } finally {
      setLocking(false);
    }
  };

  // Already landscape or locked → render normally
  if (!isPortrait || isLocked) {
    return <>{children}</>;
  }

  // Portrait mode – show overlay
  return (
    <>
      {/* Render page behind overlay so it's ready when rotated */}
      <div style={{ position: 'fixed', inset: 0, visibility: 'hidden', pointerEvents: 'none' }}>
        {children}
      </div>

      {/* Overlay */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'linear-gradient(160deg, #0a0a1a 0%, #0f172a 60%, #0a1628 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '28px',
        fontFamily: 'var(--font-pixel, monospace)',
        color: '#f8fafc',
        padding: '32px',
      }}>
        {/* Animated icon */}
        <div style={{ fontSize: '3.5rem', animation: 'rotatePhone 2s ease-in-out infinite' }}>
          📱
        </div>

        <div style={{ textAlign: 'center', lineHeight: 2 }}>
          <div style={{ fontSize: '1rem', color: '#22d3ee', marginBottom: '8px', letterSpacing: '0.1em' }}>
            [ XOA Y NGANG ]
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            {lockUnsupported
              ? 'Xoay điện thoại sang ngang để tiếp tục'
              : 'Bấm nút bên dưới để tự động chuyển sang ngang'}
          </div>
        </div>

        {!lockUnsupported && (
          <button
            onClick={handleForce}
            disabled={locking}
            style={{
              padding: '14px 32px',
              background: locking ? '#1e293b' : 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              border: '3px solid #22d3ee',
              color: 'white',
              fontFamily: 'var(--font-pixel, monospace)',
              fontSize: '0.85rem',
              cursor: locking ? 'wait' : 'pointer',
              borderRadius: '4px',
              letterSpacing: '0.05em',
            }}
          >
            {locking ? '⏳ ĐANG CHUYỂN...' : '[ CHUYỂN SANG NGANG ]'}
          </button>
        )}

        <div style={{ fontSize: '0.65rem', color: '#475569', textAlign: 'center' }}>
          Hoặc xoay điện thoại nếu đã bật tự động xoay
        </div>

        <style>{`
          @keyframes rotatePhone {
            0%   { transform: rotate(0deg); }
            35%  { transform: rotate(-90deg); }
            65%  { transform: rotate(-90deg); }
            100% { transform: rotate(0deg); }
          }
        `}</style>
      </div>
    </>
  );
}
