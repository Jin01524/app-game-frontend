import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PixelCanvas from '../components/PixelCanvas';
import BottomNav from '../components/BottomNav';
import { toast } from '../utils/toast';
import styles from './UtilitiesPage.module.css';
import tarotIcon from '../../assets/tarot-app.png';
import spyIcon from '../../assets/spy-app.png';
import goldIcon from '../../assets/gold-app.png';
import wolfIcon from '../../assets/wolf-app.png';

const UTILITIES = [
  { key: 'calculator', name: 'Máy tính', icon: '🧮', color: '#f59e0b' },
  { key: 'messaging',  name: 'Nhắn tin', icon: '💬', color: '#3b82f6' },
  { key: 'weather',    name: 'Thời tiết', icon: '🌤️', color: '#06b6d4' },
  { key: 'tarot',      name: 'Xem Tarot', icon: tarotIcon, color: '#6366f1' },
  { key: 'spy',        name: 'Gián điệp', icon: spyIcon, color: '#ec4899' },
  { key: 'gold',       name: 'Giá Vàng',  icon: goldIcon, color: '#fbbf24' },
  { key: 'werewolf',   name: 'Ma Sói',    icon: wolfIcon, color: '#7c3aed' },
  { key: 'change-character', name: 'Đổi nhân vật', icon: '🎭', color: '#ec4899' },
  { key: 'my-movies', name: 'Phim của tôi', icon: '🎬', color: '#f43f5e' },
];

export default function UtilitiesPage() {
  const navigate = useNavigate();
  const { authFetch, user } = useAuth();
  const [hasUnread, setHasUnread] = useState(false);

  const logUtilityAccess = (key, name) => {
    authFetch('/api/profile/log-utility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ utilityKey: key, utilityName: name })
    }).catch(err => console.error('Failed to log utility access:', err));
  };

  useEffect(() => {
    if (!user) return;
    const checkUnread = async () => {
      try {
        const res = await authFetch('/api/messages/unread-count');
        if (res.ok) {
          const data = await res.json();
          setHasUnread(data.count > 0);
        }
      } catch (e) {
        console.error('Error fetching unread count:', e);
      }
    };
    
    checkUnread();
    const interval = setInterval(checkUnread, 5000); // Check every 5s
    return () => clearInterval(interval);
  }, [authFetch, user]);

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
                    logUtilityAccess(u.key, u.name);
                    if (u.key === 'calculator') {
                      navigate('/utilities/calculator');
                    } else if (u.key === 'messaging') {
                      navigate('/utilities/messaging');
                    } else if (u.key === 'weather') {
                      navigate('/utilities/weather');
                    } else if (u.key === 'tarot') {
                      navigate('/utilities/tarot');
                    } else if (u.key === 'spy') {
                      navigate('/utilities/spy');
                    } else if (u.key === 'gold') {
                      navigate('/utilities/gold');
                    } else if (u.key === 'werewolf') {
                      navigate('/utilities/werewolf');
                    } else if (u.key === 'change-character') {
                      navigate('/utilities/change-character');
                    } else if (u.key === 'my-movies') {
                      navigate('/utilities/my-movies');
                    }
                  }}
                >
                  <div className={styles.iconWrap} style={{ '--util-color': u.color }}>
                    {isImgIcon ? (
                      <img src={u.icon} alt={u.name} className={styles.iconImg} />
                    ) : (
                      <span className={styles.icon}>{u.icon}</span>
                    )}
                    {u.key === 'messaging' && hasUnread && (
                      <div className={styles.redDot} />
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

