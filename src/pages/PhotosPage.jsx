import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PixelCanvas from '../components/PixelCanvas';
import BottomNav from '../components/BottomNav';
import { ALL_PHOTOS } from '../utils/photosData';
import styles from './PhotosPage.module.css';

export default function PhotosPage() {
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(20);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [slideshowActive, setSlideshowActive] = useState(false);

  // Sync visibleCount if the user navigates beyond visible range in lightbox
  useEffect(() => {
    if (selectedIdx !== null && selectedIdx >= visibleCount) {
      setVisibleCount(selectedIdx + 1);
    }
  }, [selectedIdx, visibleCount]);

  // Slideshow Auto-play logic operating on ALL_PHOTOS
  useEffect(() => {
    if (!slideshowActive || selectedIdx === null) return;
    const interval = setInterval(() => {
      setSelectedIdx(prev => (prev + 1) % ALL_PHOTOS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [slideshowActive, selectedIdx]);

  const handlePrev = () => {
    setSelectedIdx(prev => (prev === 0 ? ALL_PHOTOS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIdx(prev => (prev === ALL_PHOTOS.length - 1 ? 0 : prev + 1));
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Load more when scrolled near the bottom (within 120px)
    if (scrollHeight - scrollTop - clientHeight < 120) {
      setVisibleCount(prev => Math.min(prev + 20, ALL_PHOTOS.length));
    }
  };

  const displayedPhotos = ALL_PHOTOS.slice(0, visibleCount);

  return (
    <div className={styles.page}>
      <PixelCanvas />

      <main className={styles.main}>
        {/* Header */}
        <header className={`${styles.header} rpg-box fade-in`}>
          <div className="px-titlebar">
            <span>◄ ALBUM KỶ NIỆM TỆ LẠN 4.2 ({ALL_PHOTOS.length}) ►</span>
          </div>
        </header>

        {/* Photos Grid Card */}
        <div className={`${styles.photosCard} rpg-box fade-in fade-in-delay-1`}>
          <div className={styles.grid} onScroll={handleScroll}>
            {displayedPhotos.map((p, idx) => (
              <div 
                key={idx}
                className={styles.polaroid}
                onClick={() => {
                  setSelectedIdx(idx);
                  setSlideshowActive(false);
                }}
              >
                <div className={styles.imgWrapper}>
                  {/* Append =w300 dynamic width modifier for fast thumbnail loading */}
                  <img src={`${p.url}=w300`} alt={p.location ? `Ảnh chụp tại ${p.location}` : "Ảnh kỷ niệm"} className={styles.thumbnail} loading="lazy" />
                  {p.isVideo && (
                    <div className={styles.videoOverlay}>
                      <span>▶️</span>
                    </div>
                  )}
                </div>
                <div className={styles.caption}>
                  <div>📍 {p.location || 'Không rõ'}</div>
                  <div style={{ marginTop: '2px', opacity: 0.8 }}>📅 {p.date || 'Không rõ'}</div>
                </div>
              </div>
            ))}

            {visibleCount < ALL_PHOTOS.length && (
              <div className={styles.loadingTrigger}>
                [ ĐANG TẢI THÊM ẢNH... ]
              </div>
            )}
          </div>

          <button 
            className="btn btn-outline" 
            style={{ marginTop: '12px' }}
            onClick={() => navigate('/utilities')}
          >
            [ QUAY LẠI TIỆN ÍCH ]
          </button>
        </div>
      </main>

      {/* Lightbox / Slideshow Modal */}
      {selectedIdx !== null && (
        <div className={styles.overlay} onClick={() => setSelectedIdx(null)}>
          <div className={`${styles.modal} rpg-box`} onClick={e => e.stopPropagation()}>
            <div className="px-titlebar">
              <span>◄ CHI TIẾT {ALL_PHOTOS[selectedIdx].isVideo ? "VIDEO" : "ẢNH"} ({(selectedIdx + 1)}/{ALL_PHOTOS.length}) ►</span>
              <span style={{ cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setSelectedIdx(null)}>[X]</span>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.largeImgWrapper}>
                {ALL_PHOTOS[selectedIdx].isVideo ? (
                  <video 
                    key={selectedIdx} // Force recreate DOM element on index change to play new video stream
                    controls 
                    autoPlay 
                    playsInline 
                    className={styles.largeVideo}
                  >
                    <source src={`${ALL_PHOTOS[selectedIdx].url}=m22`} type="video/mp4" />
                    <source src={`${ALL_PHOTOS[selectedIdx].url}=m18`} type="video/mp4" />
                    Trình duyệt không hỗ trợ xem video này.
                  </video>
                ) : (
                  <img 
                    src={`${ALL_PHOTOS[selectedIdx].url}=w800`} 
                    alt={ALL_PHOTOS[selectedIdx].location ? `Ảnh chụp tại ${ALL_PHOTOS[selectedIdx].location}` : "Ảnh kỷ niệm"} 
                    className={styles.largeImg} 
                  />
                )}
              </div>

              {/* Location & Date Details Box */}
              <div className={styles.metadataBox}>
                <div>📍 Địa điểm: <strong>{ALL_PHOTOS[selectedIdx].location || 'Không rõ'}</strong></div>
                <div style={{ marginTop: '4px' }}>📅 Ngày chụp: <strong>{ALL_PHOTOS[selectedIdx].date || 'Không rõ'}</strong></div>
              </div>

              {/* Navigation & Slideshow Controls */}
              <div className={styles.navControls}>
                <button 
                  className="btn btn-outline" 
                  onClick={handlePrev}
                  style={{ width: '48px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                >
                  ◀️
                </button>
                <button 
                  className={`btn ${slideshowActive ? 'btn-danger' : 'btn-primary'}`} 
                  onClick={() => setSlideshowActive(prev => !prev)}
                  style={{ flex: 1 }}
                >
                  {slideshowActive ? '[ TẠM DỪNG ]' : '[ TỰ ĐỘNG CHẠY ]'}
                </button>
                <button 
                  className="btn btn-outline" 
                  onClick={handleNext}
                  style={{ width: '48px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                >
                  ▶️
                </button>
              </div>

              <button className="btn btn-outline" onClick={() => setSelectedIdx(null)} style={{ width: '100%' }}>
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
