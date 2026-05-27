import { useState, useEffect } from 'react';

export function useGameWindowSize() {
  const [size, setSize] = useState(() => {
    const isPortrait = window.innerHeight > window.innerWidth;
    return {
      width: isPortrait ? window.innerHeight : window.innerWidth,
      height: isPortrait ? window.innerWidth : window.innerHeight,
      isPortrait
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const isPortrait = window.innerHeight > window.innerWidth;
      setSize({
        width: isPortrait ? window.innerHeight : window.innerWidth,
        height: isPortrait ? window.innerWidth : window.innerHeight,
        isPortrait
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}
