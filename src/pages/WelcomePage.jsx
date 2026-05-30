import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PixelCanvas from '../components/PixelCanvas';
import PenaltyGame from '../components/PenaltyGame';
import BottomNav from '../components/BottomNav';
import styles from './WelcomePage.module.css';
import coinImg from '../../assets/coin-tl4.2.png';
import { toast } from '../utils/toast';

// ── Icons (SVG) ───────────────────────────────────────────────────────────────
const LogoutIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const ProfileIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>;
const AdminIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z"/></svg>;
const MenuIcon    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const CloseMenuIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const Power = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>;

// ── Time helper ───────────────────────────────────────────────────────────────
function useTime() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

const DAYS_VI   = ['CN','T2','T3','T4','T5','T6','T7'];
const MONTHS_VI = ['01','02','03','04','05','06','07','08','09','10','11','12'];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6)  return 'NGỦ NGON';
  if (h < 12) return 'BUỔI SÁNG';
  if (h < 18) return 'BUỔI CHIỀU';
  return 'BUỔI TỐI';
}

const parseDateSafely = (dateString) => {
  if (!dateString) return null;
  if (typeof dateString !== 'string') return new Date(dateString);
  
  if (dateString.endsWith('Z') || dateString.includes('+') || (dateString.includes('-') && dateString.includes('T'))) {
    return new Date(dateString);
  }
  const formatted = dateString.replace(' ', 'T') + 'Z';
  return new Date(formatted);
};

// ── Dropdown ──────────────────────────────────────────────────────────────────
function Dropdown({ open, onClose, onProfile, onAdmin, onLogout, isAdmin }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('pointerdown', h);
    return () => document.removeEventListener('pointerdown', h);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div ref={ref} className={styles.dropdown}>
      <div className={styles.dropdownTitle}>[ MENU ]</div>
      <button className={styles.dropdownItem} onClick={onProfile}><ProfileIcon /><span>HỒ SƠ</span></button>
      {isAdmin && (
        <button className={`${styles.dropdownItem} ${styles.dropdownAdmin}`} onClick={onAdmin}><AdminIcon /><span>QUẢN TRỊ</span></button>
      )}
      <div className={styles.dropdownDivider} />
      <button className={`${styles.dropdownItem} ${styles.dropdownDanger}`} onClick={onLogout}><LogoutIcon /><span>ĐĂNG XUẤT</span></button>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function WelcomePage() {
  const { user, logout, authFetch, addXu } = useAuth();
  const navigate = useNavigate();
  const now = useTime();

  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [usersStatus, setUsersStatus] = useState([]);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [quests, setQuests] = useState([]);

  const refreshQuests = useCallback(async () => {
    try {
      const res = await authFetch('/api/quests');
      if (res.ok) setQuests(await res.json());
    } catch (e) {
      console.error('Error fetching quests:', e);
    }
  }, [authFetch]);

  useEffect(() => {
    if (user) {
      refreshQuests();
    }
  }, [user, refreshQuests]);

  const handleClaimReward = async (questKey, rewardAmount) => {
    try {
      const res = await authFetch('/api/quests/claim', {
        method: 'POST',
        body: JSON.stringify({ questKey }),
      });
      const data = await res.json();
      if (res.ok) {
        if (rewardAmount > 0) {
          toast.success(`Nhận thành công ${rewardAmount} xu!`);
          addXu(rewardAmount);
        } else {
          toast.success('Hoàn thành nhiệm vụ!');
        }
        refreshQuests();
      } else {
        toast.error(data.error || 'Nhận thưởng thất bại');
      }
    } catch (e) {
      toast.error('Lỗi hệ thống');
    }
  };

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      // Platform detection for user friendly instructions
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIOS) {
        toast.info("Trên iOS: Nhấp nút Chia sẻ (Share) 📤 trên thanh công cụ Safari và chọn 'Thêm vào MH chính' (Add to Home Screen) ➕");
      } else {
        toast.info("Để cài đặt: Nhấp vào biểu tượng dấu 3 chấm ⁝ ở góc trình duyệt và chọn 'Thêm vào màn hình chính' hoặc 'Cài đặt ứng dụng'!");
      }
    }
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await authFetch('/api/profile/users/status');
        if (res.ok) setUsersStatus(await res.json());
      } catch (e) {}
    };
    fetchStatus();
    const t = setInterval(fetchStatus, 30000);
    return () => clearInterval(t);
  }, [authFetch]);

  function getRelativeTime(dateString) {
    const d = parseDateSafely(dateString);
    if (!d || isNaN(d.getTime())) return 'Chưa từng online';
    const diff = (now - d) / 1000;
    if (diff < 300) return 'Đang online';
    if (diff < 3600) return `${Math.floor(diff/60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff/3600)} giờ trước`;
    if (diff < 86400 * 7) return `${Math.floor(diff/86400)} ngày trước`;
    if (diff < 86400 * 30) return `${Math.floor(diff/(86400*7))} tuần trước`;
    return 'Vài tháng trước';
  }

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await logout(); navigate('/login', { replace: true }); }
    catch { setLoggingOut(false); }
  };

  const handleGoal = async (amount = 2) => {
    addXu(amount);
    try {
      const goalsCount = Math.floor(amount / 2);
      await authFetch('/api/profile/game/score', {
        method: 'POST',
        body: JSON.stringify({ goals: goalsCount }),
      });
      refreshQuests();
    } catch (e) {
      console.error(e);
    }
  };

  const displayName = user?.displayName || user?.username || 'USER';
  const xu = user?.xu ?? 0;
  const initials = (user?.username || 'U')[0].toUpperCase();

  const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const dateStr = `${DAYS_VI[now.getDay()]} ${now.getDate().toString().padStart(2,'0')}/${MONTHS_VI[now.getMonth()]}/${now.getFullYear()}`;

  return (
    <div className={styles.page}>
      <PixelCanvas />

      <main className={styles.main}>

        {/* ── HUD Header ── */}
        <header className={`${styles.header} rpg-box fade-in`} style={{ position: 'relative', zIndex: 30 }}>
          <div className={styles.headerLeft}>
            <div className={styles.avatarBox}>
              {user?.avatar
                ? <img src={user.avatar} alt="av" className={styles.avatarImg} />
                : <span className={styles.avatarInitial}>{initials}</span>
              }
            </div>
            <div className={styles.headerInfo}>
              <div className={styles.headerUser}>@{user?.username}</div>
              <div className={styles.headerRole}>{user?.role === 'admin' ? '[ ADMIN ]' : '[ USER ]'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--px-bg)', padding: '4px 10px', border: '2px solid var(--px-border)', borderRadius: '12px' }}>
              <img src={coinImg} alt="coin" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
              <span style={{ fontFamily: 'var(--font-pixel)', color: 'var(--px-amber)', fontSize: '0.8rem', fontWeight: 'bold' }}>{xu.toLocaleString('vi-VN')}</span>
            </div>

            <div className={styles.menuWrap}>
              <button
                id="btn-menu"
                className={styles.menuBtn}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => setMenuOpen(o => !o)}
              >
                {menuOpen ? <CloseMenuIcon /> : <MenuIcon />}
              </button>
              <Dropdown
                open={menuOpen}
                onClose={() => setMenuOpen(false)}
                onProfile={() => { setMenuOpen(false); navigate('/profile'); }}
                onAdmin={() => { setMenuOpen(false); navigate('/admin'); }}
                onLogout={() => { setMenuOpen(false); setConfirmLogout(true); }}
                isAdmin={user?.role === 'admin'}
              />
            </div>
          </div>
        </header>

        {/* ── Clock ── */}
        <div className={`${styles.clockBox} rpg-box fade-in fade-in-delay-1`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className={styles.clockRow}>
              <span className={styles.clockLabel}>&gt; TIME:</span>
              <span className={styles.clockTime}>{timeStr}</span>
            </div>
            <div className={styles.clockRow}>
              <span className={styles.clockLabel}>&gt; DATE:</span>
              <span className={styles.clockDate}>{dateStr}</span>
            </div>
          </div>
        </div>

        {/* ── User List ── */}
        <div className={`${styles.userList} rpg-box fade-in fade-in-delay-1`} style={{ margin: '0', display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', flex: 1, overflowX: 'auto', gap: '0' }}>
            {usersStatus.map(u => {
              const d = parseDateSafely(u.last_online);
              const diff = d && !isNaN(d.getTime()) ? (now - d) / 1000 : Infinity;
              const isOnline = diff < 300;
              return (
                <div key={u.id} className={styles.userListItem} title={u.display_name || u.username} onClick={() => navigate(`/home2d/${u.username}`)} style={{ cursor: 'pointer' }}>
                  <div className={styles.userAvatarWrap}>
                    <img src={u.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${u.username}`} alt={u.username} className={styles.userAvatarImg} crossOrigin="anonymous" />
                    <div className={styles.userDot} style={{ background: isOnline ? 'var(--px-green)' : '#666' }} title={getRelativeTime(u.last_online)} />
                  </div>
                  <div className={styles.userName} style={{ color: isOnline ? 'var(--px-text)' : '#aaa' }}>{u.username}</div>
                </div>
              );
            })}
          </div>

          {/* Install button - always visible */}
          <button
            onClick={handleInstallClick}
            title={deferredPrompt ? 'Cài ứng dụng' : 'Thêm vào màn hình chính'}
            className="pixel-btn"
            style={{
              flexShrink: 0,
              width: '52px',
              height: '64px',
              marginLeft: '8px',
              backgroundColor: 'var(--px-bg)',
              border: `3px solid ${deferredPrompt ? '#10b981' : '#64748b'}`,
              color: deferredPrompt ? '#10b981' : '#64748b',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.55rem',
              lineHeight: '1.3',
              borderRadius: '4px',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '3px' }}>
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
              <line x1="12" y1="18" x2="12" y2="18"></line>
              <path d="M9 10l3 3 3-3"></path>
              <line x1="12" y1="7" x2="12" y2="13"></line>
            </svg>
            <span>CÀI APP</span>
          </button>
        </div>

        {/* ── Starter Quests ── */}
        {(() => {
          const activeQuest = quests?.find(q => !q.claimed);
          if (!activeQuest) return null;

          const renderQuestText = (quest) => {
            if (quest.key === 'mua_ruong') {
              return (
                <>
                  Mua ruộng ở <span className={styles.questLink} onClick={() => navigate('/home2d')}>nông trại</span> của bạn
                </>
              );
            }
            if (quest.key === 'ban_lua') {
              return (
                <>
                  Bán 8 lúa ở <span className={styles.questLink} onClick={() => navigate('/market')}>chợ</span>
                </>
              );
            }
            if (quest.key === 'mua_bo') {
              return (
                <>
                  Mua 1 con bò ở <span className={styles.questLink} onClick={() => navigate('/market')}>chợ</span>
                </>
              );
            }
            if (quest.key === 'cho_bo_an') {
              return (
                <>
                  Mua 4 bó rơm ở <span className={styles.questLink} onClick={() => navigate('/market')}>chợ</span> và mang về cho bò ăn
                </>
              );
            }
            return quest.title;
          };

          return (
            <div className={`${styles.questsCard} rpg-box fade-in fade-in-delay-1`}>
              <div className="px-titlebar">
                <span>◄ NHIỆM VỤ KHỞI ĐẦU ►</span>
                <span className={styles.blinkDot}>█</span>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.questsList}>
                  <div className={styles.questItem}>
                    <span className={`${styles.questCheckbox} ${activeQuest.completed ? styles.questCheckboxCompleted : ''}`}>
                      {activeQuest.completed ? '[x]' : '[ ]'}
                    </span>
                    <div className={styles.questBody}>
                      <span className={styles.questText}>
                        {renderQuestText(activeQuest)}
                      </span>
                      <div className={styles.questMeta}>
                        {activeQuest.reward > 0 ? `Thưởng: ${activeQuest.reward} xu` : 'Không có thưởng'}
                        {activeQuest.maxProgress > 1 && ` | Tiến độ: ${activeQuest.progress}/${activeQuest.maxProgress}`}
                      </div>
                    </div>

                    {activeQuest.completed && (
                      <button
                        className={styles.questClaimBtn}
                        onClick={() => handleClaimReward(activeQuest.key, activeQuest.reward)}
                      >
                        {activeQuest.reward > 0 ? '[ NHẬN ]' : '[ XONG ]'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── Penalty Game ── */}
        <div className={`${styles.welcomeCard} rpg-box fade-in fade-in-delay-2`}>
          <div className="px-titlebar">
            <span>◄ MINIGAME: SÚT PHẠT ►</span>
            <span className={styles.blinkDot}>█</span>
          </div>
          <div className={styles.cardBody} style={{ padding: '0' }}>
            <PenaltyGame onGoal={handleGoal} xu={xu} />
            <div style={{ padding: '14px', borderTop: '2px solid var(--px-border)', textAlign: 'center' }}>
               <button className={`${styles.profileBtn}`} onClick={() => navigate('/profile')}>
                 &gt; CHỈNH SỬA HỒ SƠ
               </button>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className={styles.footer}>
          <span className={styles.footerDot}>●</span>
          TỆ LẠN 4.2 © {now.getFullYear()} — PHIÊN BẢN NỘI BỘ
          <span className={styles.footerDot}>●</span>
        </div>

      </main>

      {/* ── Logout confirm ── */}
      {confirmLogout && (
        <div className={styles.overlay} onClick={() => setConfirmLogout(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className="px-titlebar">◄ XÁC NHẬN ĐĂNG XUẤT ►</div>
            <div className={styles.modalBody}>
              <div className={styles.modalMsg}>
                Bạn có chắc muốn đăng xuất khỏi hệ thống?
              </div>
              <div className={styles.modalActions}>
                <button className="btn btn-outline" onClick={() => setConfirmLogout(false)} disabled={loggingOut}>
                  [ HỦY ]
                </button>
                <button id="btn-confirm-logout" className="btn btn-danger" onClick={handleLogout} disabled={loggingOut}>
                  {loggingOut ? <><div className="spinner" /> ĐANG XUẤT...</> : '[ ĐĂNG XUẤT ]'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
