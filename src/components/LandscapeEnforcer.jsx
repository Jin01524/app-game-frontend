import React, { useState, useEffect } from 'react';

/**
 * LandscapeEnforcer – Ensures the page renders in landscape orientation.
 *
 * Strategy (in order of priority):
 * 1. Use Screen Orientation API to lock landscape.
 *    Works in installed PWAs (display: standalone) and fullscreen mode.
 *    When the lock succeeds, the OS rotates the entire viewport – vw/vh/canvas
 *    all update correctly. No CSS tricks needed.
 *
 * 2. If the lock fails (regular browser tab, API not supported), show a
 *    "Please rotate your device" overlay when the device is in portrait.
 *    This avoids broken canvas/vw/vh rendering from CSS rotation tricks.
 */
export default function LandscapeEnforcer({ children }) {
  const [lockFailed, setLockFailed] = useState(false);
  const [isPortrait, setIsPortrait] = useState(
    () => window.innerHeight > window.innerWidth
  );

  useEffect(() => {
    // 1. Try native orientation lock (works in installed PWA)
    const tryLock = async () => {
      if (screen.orientation && typeof screen.orientation.lock === 'function') {
        try {
          await screen.orientation.lock('landscape');
          setLockFailed(false);
        } catch {
          // Lock failed: running in a regular browser tab
          setLockFailed(true);
        }
      } else {
        setLockFailed(true);
      }
    };
    tryLock();

    // 2. Track orientation for the fallback overlay
    const handleResize = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      // Unlock when leaving the page
      try { screen.orientation?.unlock(); } catch {}
    };
  }, []);

  // Lock succeeded → OS handles rotation, render normally
  if (!lockFailed) {
    return <>{children}</>;
  }

  // Lock failed but already in landscape → render normally
  if (!isPortrait) {
    return <>{children}</>;
  }

  // Lock failed and still in portrait → show rotate overlay
  return (
    <>
      {/* Dimmed children underneath so layout doesn't shift */}
      <div style={{ visibility: 'hidden', width: '100vw', height: '100vh', overflow: 'hidden' }}>
        {children}
      </div>

      {/* Rotate overlay */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'linear-gradient(135deg, #0a0a1a 0%, #0f172a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        color: 'white',
        fontFamily: 'var(--font-pixel, monospace)',
      }}>
        {/* Animated phone rotate icon */}
        <div style={{ fontSize: '4rem', animation: 'spin-cw 1.8s ease-in-out infinite' }}>📱</div>
        <div style={{ fontSize: '0.9rem', textAlign: 'center', color: '#94a3b8', lineHeight: 1.8 }}>
          <div style={{ fontSize: '1.1rem', color: '#f8fafc', marginBottom: '8px' }}>
            [ XOAY ĐIỆN THOẠI ]
          </div>
          Trang này yêu cầu<br />chế độ <span style={{ color: '#22d3ee' }}>màn hình ngang</span>
        </div>
        <style>{`
          @keyframes spin-cw {
            0%   { transform: rotate(0deg); }
            40%  { transform: rotate(90deg); }
            60%  { transform: rotate(90deg); }
            100% { transform: rotate(90deg) scale(1.1); }
          }
        `}</style>
      </div>
    </>
  );
}
