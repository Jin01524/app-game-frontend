import { useState, useEffect } from 'react';

export function useGameWindowSize() {
  const [size, setSize] = useState(() => {
    const isPortrait = window.innerHeight > window.innerWidth;
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      isPortrait
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const isPortrait = window.innerHeight > window.innerWidth;
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
        isPortrait
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}
