import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PixelCanvas from '../components/PixelCanvas';
import BottomNav from '../components/BottomNav';
import CharacterSprite from '../components/CharacterSprite';
import { toast } from '../utils/toast';
import styles from './ChangeCharacterPage.module.css';

const CHARACTERS = [
  {
    key: 'FrogNinja',
    name: 'Frog Ninja',
    title: 'Chú Ếch Ninja',
    description: 'Chú ếch tinh nghịch, nhanh nhẹn, thích phiêu lưu và chăm sóc nông trại.',
    stats: { speed: 5, power: 3, luck: 4 },
    emoji: '🐸'
  },
  {
    key: 'Samurai',
    name: 'Samurai',
    title: 'Kiếm Sĩ Samurai',
    description: 'Kiếm sĩ Samurai kiên cường, trung nghĩa, bảo vệ bình yên cho khu chợ.',
    stats: { speed: 3, power: 5, luck: 4 },
    emoji: '⚔️'
  }
];

export default function ChangeCharacterPage() {
  const navigate = useNavigate();
  const { user, authFetch, updateCharacterType } = useAuth();
  const [saving, setSaving] = useState(false);

  const currentCharacter = user?.characterType || 'FrogNinja';

  const handleSelect = async (characterType) => {
    if (characterType === currentCharacter) return;
    setSaving(true);
    try {
      const res = await authFetch('/api/profile/character-type', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterType })
      });
      const data = await res.json();
      if (res.ok) {
        updateCharacterType(characterType);
        toast.success(`Đổi nhân vật thành ${characterType === 'FrogNinja' ? 'Frog Ninja' : 'Samurai'} thành công!`);
      } else {
        toast.error(data.error || 'Có lỗi xảy ra');
      }
    } catch (e) {
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <PixelCanvas />
      
      <main className={styles.main}>
        <header className={`${styles.header} rpg-box fade-in`}>
          <div className="px-titlebar">
            <span>◄ ĐỔI NHÂN VẬT 🎭 ►</span>
          </div>
        </header>

        <div className={`${styles.contentCard} rpg-box fade-in fade-in-delay-1`}>
          <div className="px-titlebar">
            <span>◄ DANH SÁCH NHÂN VẬT ►</span>
          </div>
          
          <div className={styles.description}>
            Chọn nhân vật để hiển thị hình ảnh của bạn tại Nông trại và Chợ nông sản
          </div>

          <div className={styles.grid}>
            {CHARACTERS.map((char) => {
              const isActive = char.key === currentCharacter;
              return (
                <div 
                  key={char.key} 
                  className={`${styles.card} ${isActive ? styles.activeCard : ''}`}
                >
                  <div className={styles.spriteWrapper}>
                    <CharacterSprite characterType={char.key} action="idle" width={72} height={72} />
                  </div>
                  
                  <div className={styles.infoWrapper}>
                    <h3 className={styles.charName}>
                      {char.emoji} {char.title}
                    </h3>
                    <p className={styles.charDesc}>{char.description}</p>
                    
                    {/* Stats display */}
                    <div className={styles.stats}>
                      <div className={styles.statRow}>
                        <span className={styles.statLabel}>TỐC ĐỘ:</span>
                        <span className={styles.statValue}>
                          {'⚡'.repeat(char.stats.speed)}
                          {/* {'☆'.repeat(5 - char.stats.speed)} */}
                        </span>
                      </div>
                      <div className={styles.statRow}>
                        <span className={styles.statLabel}>SỨC MẠNH:</span>
                        <span className={styles.statValue}>
                          {'⚔️'.repeat(char.stats.power)}
                          {/* {'☆'.repeat(5 - char.stats.power)} */}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    className={`btn ${isActive ? 'btn-outline' : 'btn-primary'} ${styles.selectBtn}`}
                    disabled={isActive || saving}
                    onClick={() => handleSelect(char.key)}
                  >
                    {isActive ? '[ ĐANG SỬ DỤNG ]' : saving ? 'ĐANG LƯU...' : '[ CHỌN NHÂN VẬT ]'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <button 
          className="btn btn-outline" 
          onClick={() => navigate('/utilities')}
          style={{ width: '100%', marginTop: '16px' }}
        >
          [ QUAY LẠI TIỆN ÍCH ]
        </button>
      </main>

      <BottomNav />
    </div>
  );
}
