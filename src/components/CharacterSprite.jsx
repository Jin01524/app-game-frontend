import React, { useState, useEffect } from 'react';

// Vite dynamic glob import to load all character PNG files
const characterImages = import.meta.glob('../../assets/character/**/*.png', { eager: true, import: 'default' });

export default function CharacterSprite({ characterType = 'FrogNinja', action = 'idle', width = 48, height = 48 }) {
  const [frameIndex, setFrameIndex] = useState(1);
  const charType = characterType || 'FrogNinja';

  // Get total frames
  const getFrameCount = () => {
    if (charType === 'Samurai') return 10;
    // FrogNinja
    if (action === 'idle') return 11;
    if (action === 'run') return 12;
    return 1;
  };

  useEffect(() => {
    const frameCount = getFrameCount();
    if (frameCount <= 1) return;

    // reset frameIndex to 1 when characterType or action changes
    setFrameIndex(1);

    const interval = setInterval(() => {
      setFrameIndex((prev) => {
        if (prev >= frameCount) return 1;
        return prev + 1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [charType, action]);

  // Resolve path
  let path = '';
  if (charType === 'Samurai') {
    path = `../../assets/character/Samurai/idle (${frameIndex}).png`;
  } else {
    if (action === 'idle') {
      path = `../../assets/character/FrogNinja/idle (${frameIndex}).png`;
    } else if (action === 'run') {
      path = `../../assets/character/FrogNinja/run (${frameIndex}).png`;
    } else {
      path = `../../assets/character/FrogNinja/idle (1).png`;
    }
  }

  const src = characterImages[path] || '';

  return (
    <img 
      src={src} 
      alt={charType} 
      style={{ 
        width: `${width}px`, 
        height: `${height}px`, 
        imageRendering: 'pixelated',
        objectFit: 'contain'
      }} 
    />
  );
}
