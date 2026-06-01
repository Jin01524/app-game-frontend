import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PixelCanvas from '../components/PixelCanvas';
import BottomNav from '../components/BottomNav';
import { toast } from '../utils/toast';
import styles from './AccommodationPage.module.css';

const DISTRICTS = [
  'Tất cả',
  'Ngũ Hành Sơn',
  'Hải Châu',
  'Sơn Trà',
  'Cẩm Lệ',
  'Liên Chiểu',
  'Thanh Khê'
];

export default function AccommodationPage() {
  const navigate = useNavigate();
  const { authFetch } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('Tất cả');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRooms = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await authFetch('/api/profile/accommodation');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setRooms(data);
          if (isRefresh) {
            toast.success(`Đã cập nhật ${data.length} tin đăng phòng trọ mới nhất!`);
          }
        } else {
          setError('Không thể xử lý dữ liệu phòng trọ.');
        }
      } else {
        setError('Lỗi tải dữ liệu từ máy chủ.');
      }
    } catch (e) {
      console.error(e);
      setError('Lỗi kết nối mạng.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Filter rooms by district
  const filteredRooms = rooms.filter(room => {
    if (selectedDistrict === 'Tất cả') return true;
    return room.district.includes(selectedDistrict);
  });

  return (
    <div className={styles.page}>
      <PixelCanvas />

      <main className={styles.main}>
        {/* Header */}
        <header className={`${styles.header} rpg-box fade-in`}>
          <div className="px-titlebar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <span>◄ TÌM PHÒNG TRỌ ĐÀ NẴNG 🏠 ►</span>
            <button 
              className={`pixel-btn ${refreshing ? styles.spinning : ''}`} 
              onClick={() => fetchRooms(true)}
              disabled={loading || refreshing}
              style={{
                padding: '3px 8px',
                fontSize: '0.65rem',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                border: '2px solid #991b1b',
                cursor: 'pointer',
                fontWeight: 'bold',
                lineHeight: 1
              }}
            >
              {refreshing ? 'XOAY...' : 'TẢI MỚI'}
            </button>
          </div>
        </header>

        {/* Filter Bar */}
        <div className={`${styles.filterCard} rpg-box fade-in fade-in-delay-1`}>
          <div className={styles.filterTitle}>📍 Lọc theo Quận/Huyện:</div>
          <div className={styles.filterScroll}>
            {DISTRICTS.map(d => (
              <button
                key={d}
                className={`${styles.filterBtn} ${selectedDistrict === d ? styles.activeFilter : ''}`}
                onClick={() => setSelectedDistrict(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Container */}
        <div className={`${styles.listCard} rpg-box fade-in fade-in-delay-2`}>
          {loading ? (
            <div className={styles.centerContainer}>
              <div className={styles.blinkText}>[ 🛵 ĐANG CÀO PHÒNG TRỌ ĐÀ NẴNG... ]</div>
            </div>
          ) : error ? (
            <div className={styles.centerContainer}>
              <div style={{ color: 'var(--px-red)', fontWeight: 'bold', marginBottom: '8px' }}>⚠️ {error}</div>
              <button className="btn btn-primary" onClick={() => fetchRooms()}>Thử lại</button>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className={styles.centerContainer}>
              <div style={{ color: 'var(--px-text-dim)' }}>[ Không tìm thấy phòng trọ nào ở khu vực này ]</div>
            </div>
          ) : (
            <div className={styles.grid}>
              {filteredRooms.map(room => (
                <div 
                  key={room.id}
                  className={styles.roomCard}
                  onClick={() => setSelectedRoom(room)}
                >
                  <div className={styles.imgWrapper}>
                    <img src={room.image} alt={room.title} referrerPolicy="no-referrer" className={styles.thumbnail} loading="lazy" />
                    <div className={styles.areaBadge}>{room.area} m²</div>
                  </div>
                  <div className={styles.details}>
                    <h3 className={styles.roomTitle}>{room.title}</h3>
                    <div className={styles.priceRow}>
                      <span className={styles.price}>{room.price}</span>
                    </div>
                    <div className={styles.location}>
                      📍 {room.district}
                    </div>
                    <div className={styles.date}>
                      ⏱️ {room.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* NPC speech bubble */}
          <div className={styles.npcAdvice}>
            <div className={styles.npcAvatar}>🛵</div>
            <div className={styles.speechBubble}>
              <span className={styles.npcName}>[ NPC BÁC XE ÔM ĐÀ THÀNH 👴 ]</span>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', lineHeight: '1.4' }}>
                "Hỡi nhà lữ hành! Thuê trọ nơi Đà Thành lắm lúc gian truân, phòng nào đẹp lung linh mà giá quá bèo bọt bắt cọc trước qua mạng thì chớ dại dột tin lời kẻo tiền mất tật mang. Cứ cọc tận nơi có giấy tờ rõ ràng cho ta nhé!"
              </p>
            </div>
          </div>

          <button 
            className="btn btn-outline" 
            style={{ width: '100%', marginTop: '16px' }}
            onClick={() => navigate('/utilities')}
          >
            [ QUAY LẠI TIỆN ÍCH ]
          </button>
        </div>
      </main>

      {/* Room Detail Modal */}
      {selectedRoom && (
        <div className={styles.modalOverlay} onClick={() => setSelectedRoom(null)}>
          <div className={`${styles.modal} rpg-box`} onClick={e => e.stopPropagation()}>
            <div className="px-titlebar">
              <span>◄ CHI TIẾT PHÒNG TRỌ 🏠 ►</span>
              <span style={{ cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setSelectedRoom(null)}>[X]</span>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.modalImgWrapper}>
                <img src={selectedRoom.image} alt={selectedRoom.title} referrerPolicy="no-referrer" className={styles.modalImg} />
              </div>

              <div className={styles.modalMeta}>
                <h2 className={styles.modalTitle}>{selectedRoom.title}</h2>
                <div className={styles.modalRow}>
                  <span className={styles.modalPrice}>{selectedRoom.price}</span>
                  <span className={styles.modalArea}>📐 {selectedRoom.area} m²</span>
                </div>
                <div className={styles.modalAddress}>
                  📍 Địa chỉ: <strong>{selectedRoom.ward ? `${selectedRoom.ward}, ` : ''}{selectedRoom.district}</strong>
                </div>
                <div className={styles.modalDate}>
                  ⏱️ Đăng lúc: <strong>{selectedRoom.date}</strong>
                </div>
              </div>

              <div className={styles.descBox}>
                <div className={styles.descTitle}>📝 Chi tiết tin đăng:</div>
                <div className={styles.descText}>
                  {selectedRoom.body || 'Chủ trọ không cung cấp thông tin chi tiết.'}
                </div>
              </div>

              <button 
                className="btn btn-primary"
                style={{ width: '100%', backgroundColor: '#fbbf24', color: '#78350f', border: '3px solid #b45309' }}
                onClick={() => window.open(selectedRoom.url, '_blank')}
              >
                [ 🌐 XEM GỐC TRÊN NHÀ TỐT ]
              </button>

              <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setSelectedRoom(null)}>
                [ ĐÓNG ]
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
