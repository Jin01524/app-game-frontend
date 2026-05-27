import React, { useState, useEffect } from 'react';

/**
 * LandscapeEnforcer – Simulates landscape orientation on portrait mobile devices
 * by rotating the content 90° clockwise using CSS transforms.
 * On desktop or when already in landscape, renders children normally.
 */
export default function LandscapeEnforcer({ children }) {
  const [isPortrait, setIsPortrait] = useState(
    () => window.innerHeight > window.innerWidth
  );

  useEffect(() => {
    const handler = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    window.addEventListener('resize', handler);
    window.addEventListener('orientationchange', handler);
    return () => {
      window.removeEventListener('resize', handler);
      window.removeEventListener('orientationchange', handler);
    };
  }, []);

  // Desktop or already landscape – render as-is
  if (!isPortrait) {
    return <>{children}</>;
  }

  // Portrait on mobile – rotate 90° to simulate landscape
  // Technique: centre a width×height = 100vh×100vw element then rotate 90deg
  // so it visually fills the screen in landscape orientation.
  return (
    <div
      style={{
        position: 'fixed',
        top: 'calc((100vh - 100vw) / 2)',
        left: 'calc((100vw - 100vh) / 2)',
        width: '100vh',
        height: '100vw',
        transform: 'rotate(90deg)',
        transformOrigin: 'center center',
        overflow: 'hidden',
        zIndex: 0,
      }}
    >
      {children}
    </div>
  );
}
