import React, { useEffect, useRef } from 'react';

/**
 * PixelCanvas — Light RPG Background
 * Renders: scrolling checkerboard pattern and floating clouds/particles
 */
export default function PixelCanvas() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let time = 0;

    // Clouds / Particles
    const particles = Array.from({ length: 15 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 20 + Math.random() * 40,
      speed: 0.2 + Math.random() * 0.5,
    }));

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function draw() {
      time++;
      const W = canvas.width;
      const H = canvas.height;

      // 1. Base color (pastel sky blue)
      ctx.fillStyle = '#bae6fd';
      ctx.fillRect(0, 0, W, H);

      // 2. Checkerboard tile pattern (scrolling slowly diagonally)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      const tileSize = 64;
      const offsetX = (time * 0.2) % (tileSize * 2);
      const offsetY = (time * 0.2) % (tileSize * 2);

      for (let x = -tileSize * 2; x < W + tileSize; x += tileSize) {
        for (let y = -tileSize * 2; y < H + tileSize; y += tileSize) {
          // Checkerboard logic
          if (Math.floor(x / tileSize) % 2 === Math.floor(y / tileSize) % 2) {
            ctx.fillRect(x + offsetX, y + offsetY, tileSize, tileSize);
          }
        }
      }

      // 3. Floating clouds / particles
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      for (let p of particles) {
        // Draw a simple 8-bit cloud shape
        ctx.fillRect(p.x, p.y, p.size, p.size * 0.6);
        ctx.fillRect(p.x - p.size * 0.2, p.y + p.size * 0.2, p.size * 1.4, p.size * 0.4);
        
        p.x -= p.speed;
        if (p.x < -p.size * 2) {
          p.x = W + p.size;
          p.y = Math.random() * H;
        }
      }

      // 4. Subtle grid lines (like a tilemap)
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.lineWidth = 2;
      for (let x = 0; x < W; x += tileSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += tileSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        display: 'block',
      }}
    />
  );
}
