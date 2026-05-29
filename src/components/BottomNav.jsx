import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import homeIcon from '../../assets/home.png';
import farmHouseIcon from '../../assets/farm-house.png';
import marketIcon from '../../assets/market.png';
import worldIcon from '../../assets/world.png';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const isHome = path === '/' || path === '/welcome';
  const isHouse = path.startsWith('/home2d');
  const isUtilities = path === '/utilities';
  const isMarket = path === '/market';
  const isLobby = path === '/lobby';

  const [hoveredIdx, setHoveredIdx] = useState(null);

  const btnStyle = (active, idx) => {
    const isHovered = hoveredIdx === idx;
    return {
      flex: 1,
      height: '64px',
      background: active
        ? 'linear-gradient(180deg, #fef08a, #f59e0b)' // Active premium retro gold
        : isHovered
          ? '#f8fafc' // Light gray hover
          : '#ffffff', // Clean white base
      color: 'var(--px-text)',
      border: 'none',
      borderRight: '4px solid var(--px-border)',
      cursor: 'pointer',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '4px',
      boxShadow: active
        ? 'inset 0 6px 0 rgba(0,0,0,0.15)' // Pressed down inset shadow
        : isHovered
          ? 'inset 0 -6px 0 #cbd5e1' // Deep bottom shadow on hover
          : 'inset 0 -4px 0 #e2e8f0', // Standard bottom shadow
      transition: 'all 0.1s steps(2)',
      paddingBottom: active ? '0' : isHovered ? '2px' : '4px', // 3D press down motion
      transform: active ? 'translateY(2px)' : isHovered ? 'translateY(1px)' : 'none',
      userSelect: 'none',
    };
  };

  const imgStyle = (active, idx) => {
    const isHovered = hoveredIdx === idx;
    return {
      width: '32px',
      height: '32px',
      imageRendering: 'pixelated',
      filter: active
        ? 'drop-shadow(0 2px 0 rgba(0,0,0,0.25))'
        : isHovered
          ? 'drop-shadow(0 3px 0 rgba(0,0,0,0.15))'
          : 'grayscale(15%)',
      transition: 'transform 0.1s steps(2)',
      transform: active ? 'scale(1.1)' : isHovered ? 'scale(1.05)' : 'none',
    };
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '0',
      left: '0',
      width: '100%',
      display: 'flex',
      alignItems: 'flex-end',
      background: '#ffffff',
      borderTop: '4px solid var(--px-border)',
      boxShadow: '0 -8px 24px rgba(0,0,0,0.12)',
      zIndex: 100,
      fontFamily: 'var(--font-pixel)',
      fontSize: '0.8rem',
      height: '68px',
      overflow: 'visible',
    }}>
      {/* Home */}
      <button
        onClick={() => navigate('/')}
        onMouseEnter={() => setHoveredIdx(0)}
        onMouseLeave={() => setHoveredIdx(null)}
        className="pixel-btn"
        style={btnStyle(isHome, 0)}
      >
        <img src={homeIcon} alt="Trang Chủ" style={imgStyle(isHome, 0)} />
      </button>

      {/* Farm */}
      <button
        onClick={() => navigate('/home2d')}
        onMouseEnter={() => setHoveredIdx(1)}
        onMouseLeave={() => setHoveredIdx(null)}
        className="pixel-btn"
        style={btnStyle(isHouse, 1)}
      >
        <img src={farmHouseIcon} alt="Nông Trại" style={imgStyle(isHouse, 1)} />
      </button>

      {/* Center round button - Utilities */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 8px',
        borderRight: '4px solid var(--px-border)',
        background: '#ffffff',
        boxShadow: 'inset 0 -4px 0 #e2e8f0',
        alignSelf: 'stretch',
      }}>
        <button
          onClick={() => navigate('/utilities')}
          onMouseEnter={() => setHoveredIdx(2)}
          onMouseLeave={() => setHoveredIdx(null)}
          className="pixel-btn"
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: isUtilities
              ? 'linear-gradient(135deg, #fbbf24, #d97706)' // Glowing gold/amber
              : hoveredIdx === 2
                ? 'linear-gradient(135deg, #64748b, #334155)' // Lighter metal slate on hover
                : 'linear-gradient(135deg, #475569, #1e293b)', // Inactive metal slate
            border: '4px solid var(--px-border)',
            boxShadow: isUtilities
              ? '0 0 16px rgba(245,158,11,0.6), inset 0 2px 0 rgba(255,255,255,0.4)'
              : hoveredIdx === 2
                ? '0 4px 0 #0f172a, 0 6px 12px rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.2)'
                : '0 4px 0 #0f172a, inset 0 2px 0 rgba(255,255,255,0.1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: isUtilities
              ? 'translateY(-8px)'
              : hoveredIdx === 2
                ? 'translateY(-10px) scale(1.05)'
                : 'translateY(-12px)',
            transition: 'transform 0.15s steps(2), box-shadow 0.15s steps(2)',
            flexShrink: 0,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{
            filter: 'drop-shadow(0 2px 0 rgba(0,0,0,0.3))'
          }}>
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
        </button>
      </div>

      {/* Market */}
      <button
        onClick={() => navigate('/market')}
        onMouseEnter={() => setHoveredIdx(3)}
        onMouseLeave={() => setHoveredIdx(null)}
        className="pixel-btn"
        style={btnStyle(isMarket, 3)}
      >
        <img src={marketIcon} alt="Chợ" style={imgStyle(isMarket, 3)} />
      </button>

      {/* Lobby */}
      <button
        onClick={() => navigate('/lobby')}
        onMouseEnter={() => setHoveredIdx(4)}
        onMouseLeave={() => setHoveredIdx(null)}
        className="pixel-btn"
        style={{...btnStyle(isLobby, 4), borderRight: 'none'}}
      >
        <img src={worldIcon} alt="Sảnh Chờ" style={imgStyle(isLobby, 4)} />
      </button>
    </div>
  );
}
