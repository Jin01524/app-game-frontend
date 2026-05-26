import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import homeIcon from '../../assets/home.png';
import farmHouseIcon from '../../assets/farm-house.png';
import marketIcon from '../../assets/market.png';
import worldIcon from '../../assets/world.png';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/' || location.pathname === '/welcome';
  const isHouse = location.pathname === '/home2d';
  const isMarket = location.pathname === '/market';
  const isLobby = location.pathname === '/lobby';

  return (
    <div style={{
      position: 'fixed',
      bottom: '0',
      left: '0',
      width: '100%',
      display: 'flex',
      background: 'var(--px-bg)',
      borderTop: '4px solid var(--px-border)',
      zIndex: 100,
      fontFamily: 'var(--font-pixel)',
      fontSize: '0.8rem'
    }}>
      <button 
        onClick={() => navigate('/')}
        className="pixel-btn"
        style={{
          flex: 1,
          padding: '16px 0',
          background: isHome ? 'var(--px-green)' : 'var(--px-bg2)',
          color: isHome ? 'var(--px-bg)' : 'var(--px-text)',
          border: 'none',
          borderRight: '4px solid var(--px-border)',
          cursor: 'pointer',
          textTransform: 'uppercase',
          boxShadow: isHome ? 'inset 0 4px 0 rgba(0,0,0,0.2)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <img src={homeIcon} alt="Trang Chủ" style={{ width: '32px', height: '32px', imageRendering: 'pixelated' }} />
      </button>

      <button 
        onClick={() => navigate('/home2d')}
        className="pixel-btn"
        style={{
          flex: 1,
          padding: '16px 0',
          background: isHouse ? 'var(--px-green)' : 'var(--px-bg2)',
          color: isHouse ? 'var(--px-bg)' : 'var(--px-text)',
          border: 'none',
          borderRight: '4px solid var(--px-border)',
          cursor: 'pointer',
          textTransform: 'uppercase',
          boxShadow: isHouse ? 'inset 0 4px 0 rgba(0,0,0,0.2)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <img src={farmHouseIcon} alt="Thế Giới" style={{ width: '32px', height: '32px', imageRendering: 'pixelated' }} />
      </button>

      <button 
        onClick={() => navigate('/market')}
        className="pixel-btn"
        style={{
          flex: 1,
          padding: '16px 0',
          background: isMarket ? 'var(--px-green)' : 'var(--px-bg2)',
          color: isMarket ? 'var(--px-bg)' : 'var(--px-text)',
          border: 'none',
          cursor: 'pointer',
          textTransform: 'uppercase',
          borderRight: '4px solid var(--px-border)',
          boxShadow: isMarket ? 'inset 0 4px 0 rgba(0,0,0,0.2)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <img src={marketIcon} alt="Chợ" style={{ width: '32px', height: '32px', imageRendering: 'pixelated' }} />
      </button>

      <button 
        onClick={() => navigate('/lobby')}
        className="pixel-btn"
        style={{
          flex: 1,
          padding: '16px 0',
          background: isLobby ? 'var(--px-green)' : 'var(--px-bg2)',
          color: isLobby ? 'var(--px-bg)' : 'var(--px-text)',
          border: 'none',
          cursor: 'pointer',
          textTransform: 'uppercase',
          boxShadow: isLobby ? 'inset 0 4px 0 rgba(0,0,0,0.2)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <img src={worldIcon} alt="Sảnh Chờ" style={{ width: '32px', height: '32px', imageRendering: 'pixelated' }} />
      </button>
    </div>
  );
}
