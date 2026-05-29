import React from 'react';
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

  const btnStyle = (active) => ({
    flex: 1,
    padding: '16px 0',
    background: active ? 'var(--px-green)' : 'var(--px-bg2)',
    color: active ? 'var(--px-bg)' : 'var(--px-text)',
    border: 'none',
    borderRight: '4px solid var(--px-border)',
    cursor: 'pointer',
    textTransform: 'uppercase',
    boxShadow: active ? 'inset 0 4px 0 rgba(0,0,0,0.2)' : 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });

  const imgStyle = { width: '32px', height: '32px', imageRendering: 'pixelated' };

  return (
    <div style={{
      position: 'fixed',
      bottom: '0',
      left: '0',
      width: '100%',
      display: 'flex',
      alignItems: 'flex-end',
      background: 'var(--px-bg)',
      borderTop: '4px solid var(--px-border)',
      zIndex: 100,
      fontFamily: 'var(--font-pixel)',
      fontSize: '0.8rem',
    }}>
      {/* Home */}
      <button onClick={() => navigate('/')} className="pixel-btn" style={btnStyle(isHome)}>
        <img src={homeIcon} alt="Trang Chủ" style={imgStyle} />
      </button>

      {/* Farm */}
      <button onClick={() => navigate('/home2d')} className="pixel-btn" style={btnStyle(isHouse)}>
        <img src={farmHouseIcon} alt="Nông Trại" style={imgStyle} />
      </button>

      {/* Center round button - Utilities */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 4px',
        borderRight: '4px solid var(--px-border)',
        background: 'var(--px-bg2)',
        alignSelf: 'stretch',
      }}>
        <button
          onClick={() => navigate('/utilities')}
          className="pixel-btn"
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: isUtilities
              ? 'linear-gradient(135deg, var(--px-green), #059669)'
              : 'linear-gradient(135deg, #334155, #1e293b)',
            border: `3px solid ${isUtilities ? 'var(--px-green)' : 'var(--px-border)'}`,
            boxShadow: isUtilities
              ? '0 0 12px rgba(16,185,129,0.5), inset 0 1px 0 rgba(255,255,255,0.2)'
              : '0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'translateY(-12px)',
            transition: 'transform 0.15s, box-shadow 0.15s',
            flexShrink: 0,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isUtilities ? '#fff' : 'var(--px-text)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </button>
      </div>

      {/* Market */}
      <button onClick={() => navigate('/market')} className="pixel-btn" style={{...btnStyle(isMarket), borderRight: '4px solid var(--px-border)'}}>
        <img src={marketIcon} alt="Chợ" style={imgStyle} />
      </button>

      {/* Lobby */}
      <button onClick={() => navigate('/lobby')} className="pixel-btn" style={{...btnStyle(isLobby), borderRight: 'none'}}>
        <img src={worldIcon} alt="Sảnh Chờ" style={imgStyle} />
      </button>
    </div>
  );
}
