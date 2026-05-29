import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PixelCanvas from '../components/PixelCanvas';
import BottomNav from '../components/BottomNav';
import styles from './TarotPage.module.css';
import { TAROT_CARDS } from '../utils/tarotData';

// Vite dynamic glob import to load all Tarot card WebP images from Assets
const tarotImages = import.meta.glob('../../assets/tarot-cards/*.webp', { eager: true, import: 'default' });

const getCardImageUrl = (filename) => {
  const path = `../../assets/tarot-cards/${filename}`;
  return tarotImages[path] || '';
};

export default function TarotPage() {
  const navigate = useNavigate();
  
  // State holds drawn cards for [Past, Present, Future]
  const [drawn, setDrawn] = useState([null, null, null]);

  const drawCardForIndex = (idx) => {
    if (drawn[idx]) return; // Already drawn for this slot

    // Filter out already drawn cards to prevent duplicates
    const drawnIds = drawn.filter(c => c !== null).map(c => c.id);
    const available = TAROT_CARDS.filter(c => !drawnIds.includes(c.id));

    if (available.length === 0) return;

    const randomIndex = Math.floor(Math.random() * available.length);
    const selectedCard = available[randomIndex];

    const nextDrawn = [...drawn];
    nextDrawn[idx] = selectedCard;
    
    setDrawn(nextDrawn);
  };

  const handleReset = () => {
    setDrawn([null, null, null]);
  };

  const anyDrawn = drawn.some(c => c !== null);

  return (
    <div className={styles.page}>
      <PixelCanvas />

      <main className={styles.main}>
        {/* Header */}
        <header className={`${styles.header} rpg-box fade-in`}>
          <div className="px-titlebar">
            <span>◄ XEM BÀI TAROT 🔮 ►</span>
          </div>
        </header>

        {/* Tarot Main Card */}
        <div className={`${styles.tarotCardContainer} rpg-box fade-in fade-in-delay-1`}>
          <div className="px-titlebar">
            <span>◄ QUẺ BÀI SỐ MỆNH (3 LÁ) ►</span>
          </div>

          <div style={{ fontSize: '0.80rem', opacity: 0.85, textAlign: 'center', lineHeight: '1.4' }}>
            Bấm vào từng lá bài để lật mở quá khứ, hiện tại và tương lai của bạn!
          </div>

          {/* Spread Section */}
          <div className={styles.spread}>
            {/* Card 1: Past */}
            <div className={styles.cardSlot}>
              <span className={styles.slotLabel}>🕒 QUÁ KHỨ</span>
              <div 
                className={`${styles.tarotCard} ${drawn[0] ? styles.flipped : ''}`}
                onClick={() => drawCardForIndex(0)}
              >
                <div className={`${styles.cardFace} ${styles.cardBack}`}>
                  <div className={styles.cardBackContent}>
                    <span className={styles.mysticSymbol}>✨</span>
                  </div>
                </div>
                {drawn[0] && (
                  <div className={`${styles.cardFace} ${styles.cardFront}`}>
                    <img 
                      src={getCardImageUrl(drawn[0].filename)} 
                      alt={drawn[0].name} 
                      className={styles.cardImg} 
                    />
                    <div className={styles.cardLabelOverlay}>
                      <span className={styles.cardNameOverlay}>{drawn[0].name.split(' (')[0]}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Card 2: Present */}
            <div className={styles.cardSlot}>
              <span className={styles.slotLabel}>👁️ HIỆN TẠI</span>
              <div 
                className={`${styles.tarotCard} ${drawn[1] ? styles.flipped : ''}`}
                onClick={() => drawCardForIndex(1)}
              >
                <div className={`${styles.cardFace} ${styles.cardBack}`}>
                  <div className={styles.cardBackContent}>
                    <span className={styles.mysticSymbol}>🔮</span>
                  </div>
                </div>
                {drawn[1] && (
                  <div className={`${styles.cardFace} ${styles.cardFront}`}>
                    <img 
                      src={getCardImageUrl(drawn[1].filename)} 
                      alt={drawn[1].name} 
                      className={styles.cardImg} 
                    />
                    <div className={styles.cardLabelOverlay}>
                      <span className={styles.cardNameOverlay}>{drawn[1].name.split(' (')[0]}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Card 3: Future */}
            <div className={styles.cardSlot}>
              <span className={styles.slotLabel}>🚀 TƯƠNG LAI</span>
              <div 
                className={`${styles.tarotCard} ${drawn[2] ? styles.flipped : ''}`}
                onClick={() => drawCardForIndex(2)}
              >
                <div className={`${styles.cardFace} ${styles.cardBack}`}>
                  <div className={styles.cardBackContent}>
                    <span className={styles.mysticSymbol}>✨</span>
                  </div>
                </div>
                {drawn[2] && (
                  <div className={`${styles.cardFace} ${styles.cardFront}`}>
                    <img 
                      src={getCardImageUrl(drawn[2].filename)} 
                      alt={drawn[2].name} 
                      className={styles.cardImg} 
                    />
                    <div className={styles.cardLabelOverlay}>
                      <span className={styles.cardNameOverlay}>{drawn[2].name.split(' (')[0]}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          {anyDrawn && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="btn btn-outline"
                style={{ flex: 1, color: '#fca5a5', borderColor: '#fca5a5' }}
                onClick={handleReset}
              >
                [ 🔄 RÚT LƯỢT MỚI / XÓA HẾT ]
              </button>
            </div>
          )}
        </div>

        {/* Scroll Section - Displays interpretations if any cards are drawn */}
        {anyDrawn && (
          <div className={`${styles.scrollContainer} fade-in`}>
            <div className={styles.scrollTitle}>
              <span>📜</span> CHI TIẾT QUẺ BÀI TAROT:
            </div>
            
            {drawn[0] && (
              <div className={styles.scrollBlock}>
                <div className={styles.blockTitle}>🕒 QUÁ KHỨ — {drawn[0].name}</div>
                <div>{drawn[0].descPast}</div>
              </div>
            )}

            {drawn[1] && (
              <div className={styles.scrollBlock}>
                <div className={styles.blockTitle}>👁️ HIỆN TẠI — {drawn[1].name}</div>
                <div>{drawn[1].descPresent}</div>
              </div>
            )}

            {drawn[2] && (
              <div className={styles.scrollBlock}>
                <div className={styles.blockTitle}>🚀 TƯƠNG LAI — {drawn[2].name}</div>
                <div>{drawn[2].descFuture}</div>
              </div>
            )}
          </div>
        )}

        <button 
          className="btn btn-outline" 
          onClick={() => navigate('/utilities')}
        >
          [ QUAY LẠI TIỆN ÍCH ]
        </button>
      </main>

      <BottomNav />
    </div>
  );
}
