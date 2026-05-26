import React from 'react';

const suitSymbols = {
  S: '♠',
  C: '♣',
  D: '♦',
  H: '♥'
};

const suitColors = {
  S: 'black',
  C: 'black',
  D: '#ef4444',
  H: '#ef4444'
};

export default function PlayingCard({ card, hidden, selected, onClick, style, disabled }) {
  const suit = card ? card.slice(-1) : '';
  const rank = card ? card.slice(0, -1) : '';

  const baseStyle = {
    width: 'clamp(40px, 6vw, 80px)',
    aspectRatio: '5/7',
    borderRadius: '6px',
    border: '2px solid #333',
    backgroundColor: disabled && !hidden ? '#ccc' : 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '4px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
    cursor: disabled ? 'default' : 'pointer',
    userSelect: 'none',
    position: 'relative',
    transition: 'transform 0.1s ease, filter 0.1s ease',
    transform: selected ? 'translateY(-15px)' : 'none',
    filter: disabled ? 'brightness(0.7)' : 'none',
    fontFamily: 'sans-serif',
    ...style
  };

  if (hidden) {
    return (
      <div 
        style={{
          ...baseStyle,
          backgroundColor: '#1e3a8a',
          backgroundImage: 'linear-gradient(45deg, #1e40af 25%, transparent 25%, transparent 75%, #1e40af 75%, #1e40af), linear-gradient(45deg, #1e40af 25%, transparent 25%, transparent 75%, #1e40af 75%, #1e40af)',
          backgroundSize: '10px 10px',
          backgroundPosition: '0 0, 5px 5px',
          border: '2px solid white'
        }}
        onClick={onClick}
      />
    );
  }

  return (
    <div style={baseStyle} onClick={onClick}>
      <div style={{ color: suitColors[suit], fontSize: 'clamp(10px, 1.5vw, 16px)', fontWeight: 'bold', lineHeight: '1' }}>
        <div>{rank}</div>
        <div style={{ fontSize: '0.8em' }}>{suitSymbols[suit]}</div>
      </div>
      <div style={{ color: suitColors[suit], fontSize: 'clamp(16px, 2.5vw, 28px)', textAlign: 'center', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
        {suitSymbols[suit]}
      </div>
      <div style={{ color: suitColors[suit], fontSize: 'clamp(10px, 1.5vw, 16px)', fontWeight: 'bold', lineHeight: '1', transform: 'rotate(180deg)' }}>
        <div>{rank}</div>
        <div style={{ fontSize: '0.8em' }}>{suitSymbols[suit]}</div>
      </div>
    </div>
  );
}
