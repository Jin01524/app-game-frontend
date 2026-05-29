import React from 'react';
import { useNavigate } from 'react-router-dom';
import PixelCanvas from '../components/PixelCanvas';
import BottomNav from '../components/BottomNav';
import styles from './UtilitiesPage.module.css';
import tarotIcon from '../../assets/tarot-app.png';

const UTILITIES = [
  { key: 'calculator', name: 'Máy tính', icon: '🧮', color: '#f59e0b' },
  { key: 'photos',     name: 'Photos',   icon: '🖼️', color: '#10b981' },
  { key: 'messaging',  name: 'Nhắn tin', icon: '💬', color: '#3b82f6' },
  { key: 'weather',    name: 'Thời tiết', icon: '🌤️', color: '#06b6d4' },
  { key: 'tarot',      name: 'Xem Tarot', icon: tarotIcon, color: '#6366f1' },
];

export default function UtilitiesPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <PixelCanvas />
      <main className={styles.main}>
        <header className={`${styles.header} rpg-box fade-in`}>
          <div className="px-titlebar">
            <span>◄ TIỆN ÍCH ►</span>
          </div>
        </header>

        <div className={`${styles.gridCard} rpg-box fade-in fade-in-delay-1`}>
          <div className={styles.grid}>
            {UTILITIES.map((u) => {
              const isImgIcon = typeof u.icon === 'string' && (u.icon.includes('/') || u.icon.includes('.') || u.icon.startsWith('data:'));
              return (
                <button
                  key={u.key}
                  className={styles.gridItem}
                  onClick={() => {
                    if (u.key === 'calculator') {
                      navigate('/utilities/calculator');
                    } else if (u.key === 'photos') {
                      navigate('/utilities/photos');
                    } else if (u.key === 'weather') {
                      navigate('/utilities/weather');
                    } else if (u.key === 'tarot') {
                      navigate('/utilities/tarot');
                    }
                  }}
                >
                  <div className={styles.iconWrap} style={{ '--util-color': u.color }}>
                    {isImgIcon ? (
                      <img src={u.icon} alt={u.name} className={styles.iconImg} />
                    ) : (
                      <span className={styles.icon}>{u.icon}</span>
                    )}
                  </div>
                  <span className={styles.label}>{u.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
