import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PixelCanvas from '../components/PixelCanvas';
import BottomNav from '../components/BottomNav';
import styles from './GoldPage.module.css';

export default function GoldPage() {
  const navigate = useNavigate();
  const { authFetch } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateTime, setUpdateTime] = useState('');
  const [sjcMieng, setSjcMieng] = useState({ buy: 'N/A', sell: 'N/A' });
  const [sjcNhan, setSjcNhan] = useState({ buy: 'N/A', sell: 'N/A' });
  const [refreshing, setRefreshing] = useState(false);

  const fetchGoldPrices = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await authFetch('/api/gold');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUpdateTime(data.updateTime);
          setSjcMieng(data.sjcMieng);
          setSjcNhan(data.sjcNhan);
        } else {
          setError(data.error || 'Lỗi tải giá vàng');
        }
      } else {
        setError('Không thể kết nối API giá vàng');
      }
    } catch (e) {
      console.error(e);
      setError('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchGoldPrices();
    // Poll every 3 minutes
    const interval = setInterval(() => fetchGoldPrices(true), 180000);
    return () => clearInterval(interval);
  }, [fetchGoldPrices]);

  return (
    <div className={styles.page}>
      <PixelCanvas />

      <main className={styles.main}>
        {/* Header */}
        <header className={`${styles.header} rpg-box fade-in`}>
          <div className="px-titlebar">
            <span>◄ TRA CỨU GIÁ VÀNG miếng & nhẫn ►</span>
          </div>
        </header>

        {/* Live Gold Price Cards */}
        <div className={`${styles.contentCard} rpg-box fade-in fade-in-delay-1`}>
          <div className={styles.topInfo}>
            <div className={styles.updateTime}>
              <span className={styles.label}>Nguồn:</span> giavang.org 
              {updateTime && <span className={styles.time}> | Cập nhật: {updateTime}</span>}
            </div>
            
            <button 
              className={`pixel-btn ${refreshing ? styles.spinning : ''}`} 
              onClick={() => fetchGoldPrices(true)}
              disabled={loading || refreshing}
              style={{
                padding: '4px 10px',
                fontSize: '0.8rem',
                backgroundColor: '#fbbf24',
                color: '#78350f',
                border: '2px solid #b45309',
                cursor: 'pointer',
                fontWeight: 'bold',
                minWidth: '90px'
              }}
            >
              {refreshing ? '[ XOAY... ]' : '[ CẬP NHẬT ]'}
            </button>
          </div>

          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.blinkText}>[ ĐANG CÀO DỮ LIỆU GIÁ VÀNG... ]</div>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '1rem', marginBottom: '8px' }}>⚠️ {error}</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Sử dụng dữ liệu tạm thời:</div>
              <div className={styles.goldGrids}>
                {/* Fallback Display */}
                <div className={styles.goldBox}>
                  <div className={styles.boxTitle}>💰 Vàng Miếng SJC</div>
                  <div className={styles.pricesRow}>
                    <div className={styles.priceItem}>
                      <span className={styles.priceLabel}>Mua vào</span>
                      <span className={styles.priceVal}>{sjcMieng.buy}</span>
                    </div>
                    <div className={styles.priceItem}>
                      <span className={styles.priceLabel}>Bán ra</span>
                      <span className={styles.priceVal}>{sjcMieng.sell}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.goldGrids}>
              {/* Vàng Miếng SJC */}
              <div className={styles.goldBox}>
                <div className={styles.boxTitle}>
                  <span className={styles.goldIcon}>👑</span>
                  <span>Vàng Miếng SJC</span>
                </div>
                <div className={styles.pricesRow}>
                  <div className={`${styles.priceItem} ${styles.buyBox}`}>
                    <span className={styles.priceLabel}>MUA VÀO</span>
                    <span className={styles.priceVal}>{sjcMieng.buy}</span>
                    <span className={styles.priceUnit}>x1000đ/lượng</span>
                  </div>
                  <div className={`${styles.priceItem} ${styles.sellBox}`}>
                    <span className={styles.priceLabel}>BÁN RA</span>
                    <span className={styles.priceVal}>{sjcMieng.sell}</span>
                    <span className={styles.priceUnit}>x1000đ/lượng</span>
                  </div>
                </div>
              </div>

              {/* Vàng Nhẫn SJC */}
              <div className={styles.goldBox}>
                <div className={styles.boxTitle}>
                  <span className={styles.goldIcon}>💍</span>
                  <span>Vàng Nhẫn SJC</span>
                </div>
                <div className={styles.pricesRow}>
                  <div className={`${styles.priceItem} ${styles.buyBox}`}>
                    <span className={styles.priceLabel}>MUA VÀO</span>
                    <span className={styles.priceVal}>{sjcNhan.buy}</span>
                    <span className={styles.priceUnit}>x1000đ/lượng</span>
                  </div>
                  <div className={`${styles.priceItem} ${styles.sellBox}`}>
                    <span className={styles.priceLabel}>BÁN RA</span>
                    <span className={styles.priceVal}>{sjcNhan.sell}</span>
                    <span className={styles.priceUnit}>x1000đ/lượng</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NPC Dragon Advice Bubble */}
          <div className={styles.npcAdvice} style={{ marginTop: '20px' }}>
            <div className={styles.npcAvatar}>🐉</div>
            <div className={styles.speechBubble}>
              <span className={styles.npcName}>[ NPC RỒNG VÀNG 🐢 ]</span>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', lineHeight: '1.4' }}>
                "Hỡi nhà lữ hành! Giá vàng có lúc thăng lúc trầm, nhưng lúa trên tay bạn thì luôn đổi ra xu tươi mỗi ngày. Hãy chăm gieo trồng ruộng đất trước khi gom góp mua vàng miếng nhé!"
              </p>
            </div>
          </div>

          {/* Back Button */}
          <button 
            className="btn btn-outline" 
            style={{ marginTop: '24px', width: '100%' }}
            onClick={() => navigate('/utilities')}
          >
            [ QUAY LẠI TIỆN ÍCH ]
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
