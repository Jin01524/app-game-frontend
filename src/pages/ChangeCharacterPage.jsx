import React, { useState, useEffect } from 'react';
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
    title: 'Frog Ninja',
    description: 'Chú ếch tinh nghịch, thích phiêu lưu và chăm sóc nông trại.',
    emoji: '🐸'
  },
  {
    key: 'Samurai',
    title: 'Kiếm Sĩ Samurai',
    description: 'Kiếm sĩ Samurai kiên cường, bảo vệ sự yên bình cho khu chợ.',
    emoji: '⚔️'
  }
];

export default function ChangeCharacterPage() {
  const navigate = useNavigate();
  const { user, authFetch, updateCharacterType } = useAuth();
  const [saving, setSaving] = useState(false);
  
  const currentCharacter = user?.characterType || 'FrogNinja';
  
  // Set initial preview index based on user's current character
  const initialIndex = CHARACTERS.findIndex(c => c.key === currentCharacter);
  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0);

  const selectedChar = CHARACTERS[currentIndex];
  const isActive = selectedChar.key === currentCharacter;

  const handleLeft = () => {
    setCurrentIndex((prev) => (prev === 0 ? CHARACTERS.length - 1 : prev - 1));
  };

  const handleRight = () => {
    setCurrentIndex((prev) => (prev === CHARACTERS.length - 1 ? 0 : prev + 1));
  };

  const handleSelect = async () => {
    if (isActive) return;
    setSaving(true);
    try {
      const res = await authFetch('/api/profile/character-type', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterType: selectedChar.key })
      });
      const data = await res.json();
      if (res.ok) {
        updateCharacterType(selectedChar.key);
        toast.success(`Đổi nhân vật thành ${selectedChar.title} thành công!`);
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
        {/* Header with Exit (X) Button */}
        <header className={`${styles.header} rpg-box fade-in`}>
          <div className="px-titlebar" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>◄ ĐỔI NHÂN VẬT 🎭 ►</span>
          </div>
          <button 
            className={styles.closeHeaderBtn} 
            onClick={() => navigate('/utilities')}
            aria-label="Exit"
          >
            ✖
          </button>
        </header>

        <div className={`${styles.contentCard} rpg-box fade-in fade-in-delay-1`}>
          <div className="px-titlebar">
            <span>◄ CHỌN SKIN NHÂN VẬT ►</span>
          </div>
          
          <div className={styles.description}>
            Lựa chọn ngoại hình hiển thị tại Nông trại và Chợ (Các nhân vật chỉ thay đổi ngoại hình, không ảnh hưởng đến chỉ số).
          </div>

          {/* Carousel Section */}
          <div className={styles.carousel}>
            <button className={styles.arrowBtn} onClick={handleLeft}>
              ◄
            </button>
            
            <div className={styles.spriteFrame}>
              <div className={`${styles.spriteWrapper} ${isActive ? styles.activeSprite : ''}`}>
                <CharacterSprite characterType={selectedChar.key} action="idle" width={96} height={96} />
              </div>
            </div>
            
            <button className={styles.arrowBtn} onClick={handleRight}>
              ►
            </button>
          </div>

          {/* Character Details */}
          <div className={styles.infoWrapper}>
            <h3 className={styles.charName}>
              {selectedChar.emoji} {selectedChar.title}
            </h3>
            <p className={styles.charDesc}>{selectedChar.description}</p>
          </div>

          {/* Action Button */}
          <button
            className={`btn ${isActive ? 'btn-outline' : 'btn-primary'} ${styles.confirmBtn}`}
            disabled={isActive || saving}
            onClick={handleSelect}
          >
            {isActive ? '[ ĐANG SỬ DỤNG ]' : saving ? 'ĐANG LƯU...' : '[ XÁC NHẬN ]'}
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
