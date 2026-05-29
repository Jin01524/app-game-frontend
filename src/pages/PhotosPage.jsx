import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PixelCanvas from '../components/PixelCanvas';
import BottomNav from '../components/BottomNav';
import styles from './PhotosPage.module.css';

const PHOTOS = [
  { url: "https://lh3.googleusercontent.com/pw/AP1GczMQQmc6xDgfT-a2mMaNEKncnNtxPXatvK1ciZAfkkuGDPHfyeFEjYk1fpC7A54WebS31PKLE05oayiNQG9dJ_0kJS4xrk-1-C9Pc_GvqGbLQOAxu-PG", location: "Hải Dương", date: "15/05/2026" },
  { url: "https://lh3.googleusercontent.com/pw/AP1GczN6OygYX359UyGiVyucIbvn9wEkLOZ6Vnl6flKy5KlZweFuVV6JFVe_4izaVv_4_VrVDl4Q98LEd5K5_9vD5BSyF3EA759fFKb5KrOIoV-RhlyL11qx", location: null, date: "18/05/2026" },
  { url: "https://lh3.googleusercontent.com/pw/AP1GczNzygCsyZ2a85yrvo6teph9eM-WWpcg5ADWdEsEgdbm7QRsMbh2IC_0m6sLmlUa85AzjTzs_z2zdLJ0onY0W-fAeIIAMGUhNPscC0HdfHtGYl965efC", location: "Hà Nội", date: "20/05/2026" },
  { url: "https://lh3.googleusercontent.com/pw/AP1GczNOUerM9hkU1ILBpEP5PiIT7z97NK1ai1WYialFnL4apvXn4XEqtkNytjDZbbXrV-Y2dp1useOp7INxDHrt_wXLXsKC39RuOXHPgBDfAgS1dVKBuLHc", location: "Đà Lạt", date: "21/05/2026" },
  { url: "https://lh3.googleusercontent.com/pw/AP1GczOZuK_1S6E0-SVff_nwuCmFcvccbJRiDIvzESXFvCaNd8hjTXgjz17HNuK7N4H1AY-w1JTohfKfX4m8QdZ7G82URshi6oaL6xH3Y7z-trpyK7x6il3t", location: "Sapa", date: "22/05/2026" },
  { url: "https://lh3.googleusercontent.com/pw/AP1GczN1EoWqcpYCmHfaXHQjPehyA4jD_PfTx-b_41v70YXqmRH4Y6hMLJXc78tu4_pISrwESKEkRv-EduGMA4gaVSvwwsfY5In-7W3pPj67qZBnrZmWyw2v", location: null, date: "23/05/2026" },
  { url: "https://lh3.googleusercontent.com/pw/AP1GczNTqqV134wNdaQBImGSnyhYZQfVtjVASVJOdwHgBTQM8mPgDySvG3KOiN_I7QATyr6GKerozPVcs5XZDmd1T1KFcDqphJVvqKMcQ91yhaiqYguLBe4", location: "Hà Giang", date: "24/05/2026" },
  { url: "https://lh3.googleusercontent.com/pw/AP1GczPsM8-1JhDm1oo6xeDps2DB441_dpZV-QRqFzvAzzgWzeItl7mnByQWiQ1ONeVPsbGMq4FV8P2UqvPKEhooYBrwM6i8wG3WV39gOESc5N2oIBxehaL1", location: "Hội An", date: "25/05/2026" },
  { url: "https://lh3.googleusercontent.com/pw/AP1GczPlto6WHj7nX7DFRgvS0Dyl6dOC03oJ-CFgH8IKL0100fAZJuc_yhOhE2jcTnsyTM7Cmf41hjy-E55Y8ZBcFIRp7zWAuQsYdDM09yPPimHKQEhkimcR", location: "Mù Căng Chải", date: "26/05/2026" },
  { url: "https://lh3.googleusercontent.com/pw/AP1GczMerF1ojewC76S8Ks8M54N1yKGD-Wwg3sLv-FGPxxXczig7pv64ppjUKxrVxc113NET5_yxJOea4fkjZbq3k4c7QYjOIpXl8UapYeLwFfVsHolLlhUr", location: null, date: "27/05/2026" },
  { url: "https://lh3.googleusercontent.com/pw/AP1GczO6jvetKa6cMHSxt7hnV_SbDHGNT5NQPNS7N8D2kXVebfBXSUDVI4msFmKaBTOSJjZhskZKA3-fUKILrmcKaRrAgd_47U0_RaUZKGMPXaQT6y1tDALq", location: "Đà Lạt", date: "28/05/2026" },
  { url: "https://lh3.googleusercontent.com/pw/AP1GczO1TTihYv3rIyJAqqzkYKYvoTCJGEc83yXWQSh4EMgc6Yjr3IS_V9P4SyDi6DxP4ZwpLOVmpRtcN8tz7tcDBw0sffXReWaHA8LdPx6aDLJ047NYYNVe", location: "Nha Trang", date: "29/05/2026" },
  { url: "https://lh3.googleusercontent.com/pw/AP1GczOV2sG35UzJb_hj5o1DYw33xJe-oVLqdS484Vx2sODiVFbskWLkyccmdK4sF08WbCMHbENPql-EsZSpV6Lw0y5n1EtkqsWC-h_iw_Mt12VI3g69qI0F", location: "Mộc Châu", date: "30/05/2026" },
  { url: "https://lh3.googleusercontent.com/pw/AP1GczMMaZ3ygWysPGufaS3eOWUGa21ijHYNn83OjHQiAKydZsP5VcA_dLjCZVpvHvpNSs4yUl6nMagP8Muc30Cgj-u7CL_il2IVmZcOp7jXlMViNVwuFxuX", location: null, date: "01/06/2026" },
  { url: "https://lh3.googleusercontent.com/pw/AP1GczNPV1qB62KTBOcTrW52oLHgHrlyopyDt7qE9rme6qsQe5KVxvhNiL1rbVkF91SHL4VX5fFwBq84Qe59XTuadEnJwidtB1b8wJsU3mXVbgmyLqr7NLFq", location: "Cao Bằng", date: "02/06/2026" },
  { url: "https://lh3.googleusercontent.com/pw/AP1GczOi5kI8SWoguPDrBpEClmhqJbpkStg-IqxD5CWC_mIkvY1d5M_xzIDsnpA7318ALTpvc1WSfzc4vBqeN3TEsNVaPSrLvgXCesk-XNkyWtZAd7KIHTc", location: null, date: "03/06/2026" },
  { url: "https://lh3.googleusercontent.com/pw/AP1GczNYzg2b-n_69ckwwONnpa05p6Dm5oK48gPY_mmUgWiIe__nw9e6bhWFyPd2_3eXPxAyv_12cFzXryOzr2OLnpfWVdEjpuKgtU0Z96GNSansqGoeDg29", location: "Ninh Bình", date: "04/06/2026" },
  { url: "https://lh3.googleusercontent.com/pw/AP1GczOWxjpnTiNcyNyZZWIYy2ugMh9pC1qtXv5H1Q8aWfcW7r6og76lzmToU7gPNWlxIxvMAHg7PtDfZUYDsZDn0sotrLzZjCuZd3-EDAq1NclzrwoWTV7a", location: "Huế", date: "05/06/2026" },
  { url: "https://lh3.googleusercontent.com/pw/AP1GczPAEmfrCcKlQmOdP51aEXfmRnNI7jQojKF3AO6q8UEobDG3EOlHa2uvwc8ZPFU-qpNMJKpnSa-w1fBungJkWCwOx-xRRIQsnb-1r2W8gxYH-RBfQX5W", location: null, date: "06/06/2026" },
  { url: "https://lh3.googleusercontent.com/pw/AP1GczNmukRE8fFRLX_kaS5sZ43lK-vn7vEbnjGm2ZXSlAkZnim7eQ3MxKWSqUOBLAV0juc9WWTPglGgzb7laI3Q01o3Uz98oFUbWLKGVK2OFpzkFkGUX9Fe", location: "Sài Gòn", date: "07/06/2026" }
];

export default function PhotosPage() {
  const navigate = useNavigate();
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [slideshowActive, setSlideshowActive] = useState(false);

  // Slideshow Auto-play logic
  useEffect(() => {
    if (!slideshowActive || selectedIdx === null) return;
    const interval = setInterval(() => {
      setSelectedIdx(prev => (prev + 1) % PHOTOS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [slideshowActive, selectedIdx]);

  const handlePrev = () => {
    setSelectedIdx(prev => (prev === 0 ? PHOTOS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIdx(prev => (prev === PHOTOS.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className={styles.page}>
      <PixelCanvas />

      <main className={styles.main}>
        {/* Header */}
        <header className={`${styles.header} rpg-box fade-in`}>
          <div className="px-titlebar">
            <span>◄ ALBUM KỶ NIỆM TỆ LẠN 4.2 ►</span>
          </div>
        </header>

        {/* Photos Grid Card */}
        <div className={`${styles.photosCard} rpg-box fade-in fade-in-delay-1`}>
          <div className={styles.grid}>
            {PHOTOS.map((p, idx) => (
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
                </div>
                <div className={styles.caption}>
                  <div>📍 {p.location || 'Không rõ'}</div>
                  <div style={{ marginTop: '2px', opacity: 0.8 }}>📅 {p.date || 'Không rõ'}</div>
                </div>
              </div>
            ))}
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
              <span>◄ CHI TIẾT ẢNH ({(selectedIdx + 1)}/{PHOTOS.length}) ►</span>
              <span style={{ cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setSelectedIdx(null)}>[X]</span>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.largeImgWrapper}>
                {/* Append =w800 dynamic width modifier for full size high quality image */}
                <img 
                  src={`${PHOTOS[selectedIdx].url}=w800`} 
                  alt={PHOTOS[selectedIdx].location ? `Ảnh chụp tại ${PHOTOS[selectedIdx].location}` : "Ảnh kỷ niệm"} 
                  className={styles.largeImg} 
                />
              </div>

              {/* Location & Date Details Box */}
              <div className={styles.metadataBox}>
                <div>📍 Địa điểm: <strong>{PHOTOS[selectedIdx].location || 'Không rõ'}</strong></div>
                <div style={{ marginTop: '4px' }}>📅 Ngày chụp: <strong>{PHOTOS[selectedIdx].date || 'Không rõ'}</strong></div>
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
