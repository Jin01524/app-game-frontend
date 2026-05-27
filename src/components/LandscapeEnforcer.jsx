import React from 'react';
import { useGameWindowSize } from '../hooks/useGameWindowSize';

/**
 * LandscapeEnforcer
 * Uses CSS transform to visually rotate the entire page 90 degrees if the device is in portrait.
 * It passes down the corrected `width` and `height` to the inner game canvases via the hook.
 */
export default function LandscapeEnforcer({ children }) {
  const { isPortrait, width, height } = useGameWindowSize();

  if (!isPortrait) {
    return (
      <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
        {children}
      </div>
    );
  }

  // Portrait mode -> CSS rotation
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      position: 'relative',
      backgroundColor: '#000'
    }}>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: `${width}px`,   // which is window.innerHeight
        height: `${height}px`, // which is window.innerWidth
        transform: 'translate(-50%, -50%) rotate(90deg)',
        transformOrigin: 'center center',
        overflow: 'hidden',
      }}>
        {children}
      </div>
    </div>
  );
}
