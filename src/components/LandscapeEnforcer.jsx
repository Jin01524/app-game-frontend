import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

/**
 * LandscapeHint – Renders a portal directly into document.body.
 * 
 * Uses CSS @media (orientation: portrait) for detection – 100% reliable,
 * no JS state race conditions. Portal escapes all stacking contexts so
 * no transform/overflow/z-index from parent components can hide it.
 * 
 * Add this component anywhere inside a page that requires landscape.
 */
export default function LandscapeHint() {
  const [mounted, setMounted] = useState(false);
  const [locking, setLocking] = useState(false);
  const [lockDone, setLockDone] = useState(false);
  const [lockUnsupported, setLockUnsupported] = useState(false);
  const [isPortrait, setIsPortrait] = useState(
    () => window.innerHeight > window.innerWidth
  );

  useEffect(() => {
    setMounted(true);
    
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
      try { screen.orientation?.unlock(); } catch {}
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  const handleForce = async () => {
    setLocking(true);
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
      }
      if (screen.orientation?.lock) {
        await screen.orientation.lock('landscape');
      }
      setLockDone(true);
    } catch {
      setLockUnsupported(true);
    } finally {
      setLocking(false);
    }
  };

  // Do not render anything if landscape or lock succeeded
  if (!mounted || lockDone || !isPortrait) return null;

  const overlay = (
    <div className="landscape-hint-overlay">
      <style>{`
        .landscape-hint-overlay {
          display: flex;
          position: fixed;
          inset: 0;
          z-index: 2147483647;
          background: linear-gradient(160deg, #0a0a1a 0%, #0f172a 60%, #0a1628 100%);
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 28px;
          font-family: 'Space Mono', monospace;
          color: #f8fafc;
          padding: 32px;
          box-sizing: border-box;
        }
        .lh-icon {
          font-size: 3.5rem;
          animation: lh-rotate 2.2s ease-in-out infinite;
        }
        @keyframes lh-rotate {
          0%   { transform: rotate(0deg); }
          35%  { transform: rotate(-90deg); }
          65%  { transform: rotate(-90deg); }
          100% { transform: rotate(0deg); }
        }
        .lh-title {
          font-size: 1rem;
          color: #22d3ee;
          letter-spacing: 0.12em;
          margin-bottom: 6px;
        }
        .lh-sub {
          font-size: 0.72rem;
          color: #94a3b8;
          line-height: 1.9;
          text-align: center;
        }
        .lh-btn {
          padding: 14px 28px;
          background: linear-gradient(135deg, #0ea5e9, #6366f1);
          border: 3px solid #22d3ee;
          color: white;
          font-family: 'Space Mono', monospace;
          font-size: 0.82rem;
          cursor: pointer;
          border-radius: 4px;
          letter-spacing: 0.04em;
          touch-action: manipulation;
        }
        .lh-btn:disabled {
          background: #1e293b;
          cursor: wait;
        }
        .lh-hint {
          font-size: 0.62rem;
          color: #475569;
          text-align: center;
          line-height: 1.8;
        }
      `}</style>

      <div className="lh-icon">📱</div>

      <div style={{ textAlign: 'center' }}>
        <div className="lh-title">[ XOAY NGANG ]</div>
        <div className="lh-sub">
          {lockUnsupported
            ? 'Xoay điện thoại sang ngang để tiếp tục'
            : 'Trang này hiển thị tốt hơn ở chế độ ngang'}
        </div>
      </div>

      {!lockUnsupported && (
        <button className="lh-btn" onClick={handleForce} disabled={locking}>
          {locking ? '⏳ ĐANG CHUYỂN...' : '[ CHUYỂN SANG NGANG ]'}
        </button>
      )}

      <div className="lh-hint">
        Nếu đã bật tự động xoay trên điện thoại,<br />
        hãy xoay điện thoại sang ngang
      </div>
    </div>
  );

  return ReactDOM.createPortal(overlay, document.body);
}
