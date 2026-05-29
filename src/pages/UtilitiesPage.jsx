import React from 'react';
import { useNavigate } from 'react-router-dom';
import PixelCanvas from '../components/PixelCanvas';
import BottomNav from '../components/BottomNav';
import styles from './UtilitiesPage.module.css';

const UTILITIES = [
  { key: 'calculator', name: 'Máy tính', icon: '🧮', color: '#f59e0b' },
  { key: 'photos',     name: 'Photos',   icon: '🖼️', color: '#10b981' },
  { key: 'messaging',  name: 'Nhắn tin', icon: '💬', color: '#3b82f6' },
  { key: 'notes',      name: 'Ghi chú',  icon: '📝', color: '#8b5cf6' },
  { key: 'weather',    name: 'Thời tiết', icon: '🌤️', color: '#06b6d4' },
  { key: 'music',      name: 'Âm nhạc',  icon: '🎵', color: '#ec4899' },
  { key: 'clock',      name: 'Đồng hồ',  icon: '⏰', color: '#ef4444' },
  { key: 'settings',   name: 'Cài đặt',  icon: '⚙️', color: '#64748b' },
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
            {UTILITIES.map((u) => (
              <button
                key={u.key}
                className={styles.gridItem}
                onClick={() => {/* TODO: navigate to utility */}}
              >
                <div className={styles.iconWrap} style={{ '--util-color': u.color }}>
                  <span className={styles.icon}>{u.icon}</span>
                </div>
                <span className={styles.label}>{u.name}</span>
              </button>
            ))}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
