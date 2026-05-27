import React, { useState, useEffect } from 'react';
import { useGameWindowSize } from '../hooks/useGameWindowSize';

/**
 * LandscapeEnforcer - Wraps the page content and forces a landscape aspect ratio.
 * When in portrait mode, this rotates the content 90 degrees using CSS transform.
 */
export default function LandscapeEnforcer({ children }) {
  const { isPortrait, width, height } = useGameWindowSize();

  if (isPortrait) {
    // When portrait, we rotate the container 90deg.
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#000',
        zIndex: 0,
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: `${width}px`,   // Swapped width
          height: `${height}px`, // Swapped height
          transform: 'translate(-50%, -50%) rotate(90deg)',
          transformOrigin: 'center center',
          overflow: 'hidden',
          backgroundColor: '#000',
        }}>
          {children}
        </div>
      </div>
    );
  }

  // Already landscape, render normally
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {children}
    </div>
  );
}
