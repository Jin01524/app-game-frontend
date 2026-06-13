import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PixelCanvas from '../components/PixelCanvas';
import PenaltyGame from '../components/PenaltyGame';
import styles from './AdminPage.module.css';

// ── Icons ────────────────────────────────────────────────────────────────────
const Back    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const Plus    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const Edit    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const Trash   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const Eye     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOff  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const Close   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const Search  = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const Shield  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z"/></svg>;
const UserIc  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>;
const Refresh = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
const CoinIc  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v2m0 8v2M9.5 9.5C9.5 8.1 10.6 7 12 7s2.5 1.1 2.5 2.5c0 2.5-5 2.5-5 5C9.5 15.9 10.6 17 12 17s2.5-1.1 2.5-2.5"/></svg>;

// ── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`${styles.toast} ${styles['toast_' + type]}`}>
      {type === 'success' ? '✅' : '⚠️'} {msg}
    </div>
  );
}

// ── Modal: Add / Edit User ───────────────────────────────────────────────────
function UserModal({ user, onClose, onSave }) {
  const isEdit = !!user;
  const [form, setForm] = useState({
    username:    user?.username    || '',
    displayName: user?.displayName || '',
    password:    '',
    role:        user?.role        || 'user',
    xu:          user?.xu ?? 0,
  });
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErr(''); };

  const handleSave = async () => {
    if (!isEdit && !form.username.trim()) { setErr('Vui lòng nhập tên đăng nhập'); return; }
    if (!isEdit && !form.password)        { setErr('Vui lòng nhập mật khẩu'); return; }
    setSaving(true);
    try { await onSave(form); onClose(); }
    catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className="px-titlebar">
          <span>{isEdit ? '◄ SỬA TÀI KHOẢN ►' : '◄ THÊM TÀI KHOẢN ►'}</span>
          <button className={styles.closeBtn} onClick={onClose}><Close /></button>
        </div>

        <div className={styles.modalBody}>
          {err && <div className={styles.modalErr}>⚠️ {err}</div>}

          {/* Username — readonly when editing */}
          <div className="input-group">
            <label className="input-label">Tên đăng nhập{isEdit && ' (không đổi được)'}</label>
            <input
              className="input-field"
              style={{ paddingLeft: 14 }}
              value={isEdit ? user.username : form.username}
              onChange={e => !isEdit && set('username', e.target.value)}
              readOnly={isEdit}
              placeholder="vd: nguyenvana"
              autoCapitalize="none"
            />
          </div>

          {/* Display name */}
          <div className="input-group">
            <label className="input-label">Tên hiển thị</label>
            <input
              className="input-field"
              style={{ paddingLeft: 14 }}
              value={form.displayName}
              onChange={e => set('displayName', e.target.value)}
              placeholder="Nguyễn Văn A"
            />
          </div>

          {/* Password */}
          <div className="input-group">
            <label className="input-label">
              {isEdit ? 'Mật khẩu mới (bỏ trống = giữ nguyên)' : 'Mật khẩu *'}
            </label>
            <div className="input-wrapper">
              <input
                className="input-field"
                style={{ paddingLeft: 14 }}
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={e => set('password', e.target.value)}
                placeholder={isEdit ? 'Bỏ trống nếu không đổi' : 'Tối thiểu 4 ký tự'}
              />
              <button type="button" className="input-toggle" onClick={() => setShowPw(p => !p)} tabIndex="-1">
                {showPw ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {/* Xu */}
          <div className="input-group">
            <label className="input-label">Số xu 🪙</label>
            <input
              className="input-field"
              style={{ paddingLeft: 14 }}
              type="number"
              min="0"
              value={form.xu}
              onChange={e => set('xu', Math.max(0, parseInt(e.target.value) || 0))}
              placeholder="0"
            />
          </div>

          {/* Role */}
          <div className="input-group">
            <label className="input-label">Vai trò</label>
            <div className={styles.roleToggle}>
              {['user', 'admin'].map(r => (
                <button
                  key={r}
                  type="button"
                  className={`${styles.roleBtn} ${form.role === r ? styles.roleBtnActive : ''} ${r === 'admin' ? styles.roleBtnAdmin : ''}`}
                  onClick={() => set('role', r)}
                >
                  {r === 'admin' ? <><Shield /> Quản trị viên</> : <><UserIc /> Người dùng</>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className="btn btn-outline" onClick={onClose} disabled={saving} style={{ flex: 1 }}>[ HỦY ]</button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
            style={{ flex: 2 }}
            id={isEdit ? 'btn-save-user' : 'btn-create-user'}
          >
            {saving ? <><div className="spinner" /> ĐANG LƯU...</> : isEdit ? '[ LƯU THAY ĐỔI ]' : '[ TẠO TÀI KHOẢN ]'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Confirm Delete Modal ─────────────────────────────────────────────────────
function ConfirmDelete({ user, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.modal} ${styles.modalSm}`} onClick={e => e.stopPropagation()}>
        <div className="px-titlebar">
          <span>◄ CẢNH BÁO ►</span>
          <button className={styles.closeBtn} onClick={onClose}><Close /></button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.modalDesc}>
            XÓA TÀI KHOẢN: <strong style={{color:'var(--px-green)'}}>@{user.username}</strong><br/>
            Dữ liệu sẽ bị hủy hoàn toàn. Tiếp tục?
          </div>
          <div className={styles.modalFooter} style={{padding:0, borderTop:'none'}}>
            <button className="btn btn-outline" onClick={onClose} disabled={deleting} style={{ flex: 1 }}>[ HỦY ]</button>
            <button
              className="btn btn-danger"
              id="btn-confirm-delete"
              onClick={async () => { setDeleting(true); try { await onConfirm(); onClose(); } catch { setDeleting(false); } }}
              disabled={deleting}
              style={{ flex: 1 }}
            >
              {deleting ? <div className="spinner" /> : '[ XÓA ]'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { authFetch, user: me } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'config' | 'logs' | 'movies'
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [toast, setToast]       = useState(null);
  const [modal, setModal]       = useState(null); // null | 'add' | { edit: user }
  const [delTarget, setDelTarget] = useState(null);
  
  const [settings, setSettings] = useState({ gkBaseSpeed: 1.2, goalWidth: 80, aimSpeed: 2.0 });
  const [savingSettings, setSavingSettings] = useState(false);

  const [gameSettings, setGameSettings] = useState({
    farm_crop_growth_time: 30, farm_crop_yield_base: 8, farm_crop_yield_step: 4,
    farm_cow_straw_time: 900, farm_cow_milk_time: 1800, farm_cage_max_animals: 8,
    market_cow_price: 200, market_rom_price: 5
  });
  const [savingGameSettings, setSavingGameSettings] = useState(false);

  // Activity logs states
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsSearch, setLogsSearch] = useState('');
  const [logsFilter, setLogsFilter] = useState('all');

  // Movie states
  const [movies, setMovies] = useState([]);
  const [moviesLoading, setMoviesLoading] = useState(false);
  const [movieModal, setMovieModal] = useState(null); // null | 'add' | { edit: movie }
  const [movieWatchersModal, setMovieWatchersModal] = useState(null); // null | { movie: movie }
  const [movieSearch, setMovieSearch] = useState('');
  const [delMovieTarget, setDelMovieTarget] = useState(null);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/admin/users');
      if (!res.ok) throw new Error();
      setUsers(await res.json());
    } catch { showToast('Không tải được danh sách', 'error'); }
    finally { setLoading(false); }
  }, [authFetch]);

  const loadSettings = useCallback(async () => {
    try {
      const res = await authFetch('/api/profile/game/settings');
      if (res.ok) setSettings(await res.json());

      const res2 = await authFetch('/api/admin/settings');
      if (res2.ok) setGameSettings(await res2.json());
    } catch {}
  }, [authFetch]);

  const loadLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const res = await authFetch('/api/admin/logs');
      if (res.ok) setLogs(await res.json());
    } catch { showToast('Không tải được nhật ký', 'error'); }
    finally { setLogsLoading(false); }
  }, [authFetch]);

  const loadMovies = useCallback(async () => {
    setMoviesLoading(true);
    try {
      const res = await authFetch('/api/movies');
      if (res.ok) {
        setMovies(await res.json());
      } else {
        showToast('Không tải được danh sách phim', 'error');
      }
    } catch {
      showToast('Không tải được danh sách phim', 'error');
    } finally {
      setMoviesLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'config') {
      loadSettings();
    } else if (activeTab === 'logs') {
      loadLogs();
    } else if (activeTab === 'movies') {
      loadMovies();
    }
  }, [activeTab, loadUsers, loadSettings, loadLogs, loadMovies]);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await authFetch('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
      showToast('Đã lưu cấu hình Game');
    } catch {
      showToast('Lỗi lưu cấu hình', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSaveGameSettings = async () => {
    setSavingGameSettings(true);
    try {
      await authFetch('/api/admin/settings', {
        method: 'POST',
        body: JSON.stringify(gameSettings)
      });
      showToast('Đã lưu cấu hình Game (Nông trại/Chợ)');
    } catch {
      showToast('Lỗi lưu cấu hình', 'error');
    } finally {
      setSavingGameSettings(false);
    }
  };

  const filtered = users.filter(u =>
    u.username.includes(search.toLowerCase()) ||
    (u.displayName || '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredMovies = movies.filter(m =>
    m.title.toLowerCase().includes(movieSearch.toLowerCase()) ||
    (m.tags || '').toLowerCase().includes(movieSearch.toLowerCase()) ||
    (m.genre || '').toLowerCase().includes(movieSearch.toLowerCase())
  );

  const FILTER_OPTIONS = [
    { key: 'all', label: 'Tất cả' },
    { key: 'login', label: '🔐 Đăng nhập' },
    { key: 'farming', label: '🌾 Nông trại' },
    { key: 'market', label: '🛒 Chợ' },
    { key: 'game', label: '⚽ Trò chơi' },
    { key: 'utility', label: '⚙️ Tiện ích' },
    { key: 'coin', label: '🪙 Biến động xu' }
  ];

  const filteredLogs = logs.filter(log => {
    // 1. Category Filter
    if (logsFilter === 'login' && log.action_type !== 'login') return false;
    if (logsFilter === 'farming' && !log.action_type.startsWith('farming_')) return false;
    if (logsFilter === 'market' && !log.action_type.startsWith('market_')) return false;
    if (logsFilter === 'game' && log.action_type !== 'game_play') return false;
    if (logsFilter === 'utility' && log.action_type !== 'utility_access') return false;
    if (logsFilter === 'coin' && !log.action_type.startsWith('coin_transfer_') && log.xu_change === 0) return false;
    
    // 2. Search Text
    const q = logsSearch.toLowerCase();
    if (q) {
      const matchUser = log.username.toLowerCase().includes(q);
      const matchDetails = (log.details || '').toLowerCase().includes(q);
      const matchAction = log.action_type.toLowerCase().includes(q);
      return matchUser || matchDetails || matchAction;
    }
    
    return true;
  });

  const handleCreate = async (form) => {
    const res = await authFetch('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({ username: form.username, displayName: form.displayName, password: form.password, role: form.role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    showToast(`Đã tạo @${data.user.username}`);
    loadUsers();
  };

  const handleEdit = async (user, form) => {
    const body = { displayName: form.displayName, role: form.role, xu: form.xu };
    if (form.password) body.password = form.password;
    const res = await authFetch(`/api/admin/users/${user.id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    showToast(`Đã cập nhật @${user.username}`);
    loadUsers();
  };

  const handleDelete = async (user) => {
    const res = await authFetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    showToast(data.message);
    loadUsers();
  };

  const handleCreateMovie = async (movieForm) => {
    const res = await authFetch('/api/admin/movies', {
      method: 'POST',
      body: JSON.stringify(movieForm),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi khi tạo phim mới');
    showToast(`Đã thêm phim: ${movieForm.title}`);
    loadMovies();
  };

  const handleEditMovie = async (movie, movieForm) => {
    const res = await authFetch(`/api/admin/movies/${movie.id}`, {
      method: 'PUT',
      body: JSON.stringify(movieForm),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi khi cập nhật phim');
    showToast(`Đã cập nhật phim: ${movieForm.title}`);
    loadMovies();
  };

  const handleDeleteMovie = async (movie) => {
    const res = await authFetch(`/api/admin/movies/${movie.id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi khi xóa phim');
    showToast(data.message);
    loadMovies();
  };

  const adminCount = users.filter(u => u.role === 'admin').length;

  return (
    <div className={styles.page}>
      <PixelCanvas />

      <div className={styles.container}>
        {/* Header */}
        <header className={`${styles.header} rpg-box fade-in`}>
          <button className={styles.backBtn} onClick={() => navigate('/')} aria-label="Quay lại"><Back /></button>
          <div>
            <h1 className={styles.headerTitle}>[ QUẢN TRỊ VIÊN ]</h1>
            <p className={styles.headerSub}>TỆ LẠN 4.2 OS</p>
          </div>
          <button
            className={styles.refreshBtn}
            onClick={() => {
              if (activeTab === 'users') loadUsers();
              else if (activeTab === 'config') loadSettings();
              else if (activeTab === 'logs') loadLogs();
              else if (activeTab === 'movies') loadMovies();
            }}
            aria-label="Làm mới"
            disabled={loading || logsLoading || moviesLoading}
          >
            <span className={(loading || logsLoading || moviesLoading) ? styles.spinning : ''}><Refresh /></span>
          </button>
        </header>

        {/* Stats bar */}
        <div className={`${styles.statsBar} rpg-box fade-in fade-in-delay-1`}>
          <div className={styles.stat}>
            <span className={styles.statNum}>{users.length}</span>
            <span className={styles.statLabel}>Tổng user</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={`${styles.statNum} ${styles.statAdmin}`}>{adminCount}</span>
            <span className={styles.statLabel}>Admin</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>{users.length - adminCount}</span>
            <span className={styles.statLabel}>Người dùng</span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className={`${styles.tabs} fade-in fade-in-delay-1`}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'users' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 TÀI KHOẢN
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'config' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('config')}
          >
            ⚙️ CẤU HÌNH
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'logs' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            📜 NHẬT KÝ
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'movies' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('movies')}
          >
            🎬 PHIM
          </button>
        </div>

        {/* --- CONFIG TAB --- */}
        {activeTab === 'config' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Settings & Preview */}
            <div className={`${styles.statsBar} rpg-box`} style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'stretch' }}>
              <div className="px-titlebar">◄ CẤU HÌNH MINI-GAME ►</div>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="input-group">
                    <label className="input-label">Tốc độ chạy GK (Level 1): {settings.gkBaseSpeed}</label>
                    <input type="range" min="0.5" max="5" step="0.1" value={settings.gkBaseSpeed} onChange={e => setSettings({...settings, gkBaseSpeed: Number(e.target.value)})} style={{width: '100%'}} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Độ rộng Khung thành (%): {settings.goalWidth}%</label>
                    <input type="range" min="30" max="100" step="5" value={settings.goalWidth} onChange={e => setSettings({...settings, goalWidth: Number(e.target.value)})} style={{width: '100%'}} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Tốc độ nhắm sút (Aim): {settings.aimSpeed}</label>
                    <input type="range" min="0.5" max="5" step="0.1" value={settings.aimSpeed} onChange={e => setSettings({...settings, aimSpeed: Number(e.target.value)})} style={{width: '100%'}} />
                  </div>
                  <button className="btn btn-primary" onClick={handleSaveSettings} disabled={savingSettings}>
                    {savingSettings ? 'ĐANG LƯU...' : '[ LƯU CẤU HÌNH ]'}
                  </button>
                </div>
                <div style={{ flex: 1, minWidth: '300px' }}>
                  <div style={{ padding: '4px', background: '#222', borderRadius: '4px' }}>
                    <PenaltyGame previewSettings={settings} onGoal={() => {}} onMiss={() => {}} xu={9999} />
                  </div>
                </div>
              </div>
            </div>

            {/* Game Settings (Farm & Market) */}
            <div className={`${styles.statsBar} rpg-box`} style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'stretch' }}>
              <div className="px-titlebar">◄ CẤU HÌNH NÔNG TRẠI & CHỢ ►</div>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h3 style={{ fontSize: '14px', color: '#1e3a8a', borderBottom: '2px solid #1e3a8a', paddingBottom: '4px' }}>Cấu hình Nông Trại</h3>
                  <div className="input-group">
                    <label className="input-label">Thời gian lúa chín (giây): {gameSettings.farm_crop_growth_time}s</label>
                    <input type="range" min="5" max="300" step="5" value={gameSettings.farm_crop_growth_time} onChange={e => setGameSettings({...gameSettings, farm_crop_growth_time: Number(e.target.value)})} style={{width: '100%'}} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Sản lượng lúa cơ bản (Level 1): {gameSettings.farm_crop_yield_base}</label>
                    <input type="range" min="1" max="50" step="1" value={gameSettings.farm_crop_yield_base} onChange={e => setGameSettings({...gameSettings, farm_crop_yield_base: Number(e.target.value)})} style={{width: '100%'}} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Sản lượng lúa tăng mỗi cấp: {gameSettings.farm_crop_yield_step}</label>
                    <input type="range" min="1" max="20" step="1" value={gameSettings.farm_crop_yield_step} onChange={e => setGameSettings({...gameSettings, farm_crop_yield_step: Number(e.target.value)})} style={{width: '100%'}} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Thời gian bò tiêu thụ 1 rơm (giây): {gameSettings.farm_cow_straw_time}s</label>
                    <input type="range" min="10" max="1800" step="10" value={gameSettings.farm_cow_straw_time} onChange={e => setGameSettings({...gameSettings, farm_cow_straw_time: Number(e.target.value)})} style={{width: '100%'}} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Thời gian bò tạo sữa (giây): {gameSettings.farm_cow_milk_time}s</label>
                    <input type="range" min="10" max="3600" step="10" value={gameSettings.farm_cow_milk_time} onChange={e => setGameSettings({...gameSettings, farm_cow_milk_time: Number(e.target.value)})} style={{width: '100%'}} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Sức chứa tối đa của chuồng: {gameSettings.farm_cage_max_animals} con</label>
                    <input type="range" min="1" max="20" step="1" value={gameSettings.farm_cage_max_animals} onChange={e => setGameSettings({...gameSettings, farm_cage_max_animals: Number(e.target.value)})} style={{width: '100%'}} />
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h3 style={{ fontSize: '14px', color: '#1e3a8a', borderBottom: '2px solid #1e3a8a', paddingBottom: '4px' }}>Cấu hình Chợ</h3>
                  <div className="input-group">
                    <label className="input-label">Giá mua bò (Xu): {gameSettings.market_cow_price}</label>
                    <input type="number" className="input-field" style={{ paddingLeft: '8px' }} value={gameSettings.market_cow_price} onChange={e => setGameSettings({...gameSettings, market_cow_price: Number(e.target.value)})} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Giá mua rơm (Xu/Cái): {gameSettings.market_rom_price}</label>
                    <input type="number" className="input-field" style={{ paddingLeft: '8px' }} value={gameSettings.market_rom_price} onChange={e => setGameSettings({...gameSettings, market_rom_price: Number(e.target.value)})} />
                  </div>
                  <button className="btn btn-primary" style={{ marginTop: 'auto' }} onClick={handleSaveGameSettings} disabled={savingGameSettings}>
                    {savingGameSettings ? 'ĐANG LƯU...' : '[ LƯU CẤU HÌNH NÔNG TRẠI & CHỢ ]'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- USERS TAB --- */}
        {activeTab === 'users' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Search + Add */}
            <div className={styles.toolbar}>
              <div className={styles.searchWrap}>
                <span className={styles.searchIcon}>&gt;</span>
                <input
                  className={styles.searchInput}
                  placeholder="nhập từ khóa tìm kiếm..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <button
                id="btn-add-user"
                className={`btn btn-primary ${styles.addBtn}`}
                onClick={() => setModal('add')}
              >
                [ + ] THÊM MỚI
              </button>
            </div>

            {/* User list */}
            <div className={styles.listWrap}>
              {loading ? (
                <div className={styles.loadingWrap}>
                  <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
                </div>
              ) : filtered.length === 0 ? (
                <div className={styles.empty}>Không tìm thấy tài khoản nào</div>
              ) : (
                filtered.map((u, i) => {
                  const isMe = u.id === me?.id;
                  const initials = (u.username || 'U')[0].toUpperCase();
                  return (
                    <div
                      key={u.id}
                      className={`${styles.userRow} rpg-box`}
                      style={{ animationDelay: `${i * 0.04}s` }}
                    >
                      <div className={`${styles.userAvatar} ${u.role === 'admin' ? styles.userAvatarAdmin : ''}`}>
                        {initials}
                      </div>
                      <div className={styles.userInfo}>
                        <div className={styles.userNameRow}>
                          <span className={styles.userName}>{u.displayName || u.username}</span>
                          {isMe && <span className={styles.meBadge}>Tôi</span>}
                        </div>
                        <div className={styles.userMeta}>
                          <span className={styles.userUsername}>@{u.username}</span>
                          <span className={`${styles.roleBadge} ${u.role === 'admin' ? styles.roleBadgeAdmin : styles.roleBadgeUser}`}>
                            {u.role === 'admin' ? <><Shield /> Admin</> : <><UserIc /> User</>}
                          </span>
                          <span className={styles.xuBadge}>
                            <CoinIc /> {(u.xu ?? 0).toLocaleString('vi-VN')} xu
                          </span>
                        </div>
                      </div>
                      <div className={styles.userActions}>
                        <button
                          className={styles.actionBtn}
                          title="Sửa"
                          onClick={() => setModal({ edit: u })}
                        >
                          <Edit />
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                          title="Xóa"
                          onClick={() => setDelTarget(u)}
                          disabled={isMe}
                        >
                          <Trash />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* --- LOGS TAB --- */}
        {activeTab === 'logs' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Search filter for logs */}
            <div className={styles.toolbar}>
              <div className={styles.searchWrap}>
                <span className={styles.searchIcon}>&gt;</span>
                <input
                  className={styles.searchInput}
                  placeholder="tìm tên user hoặc nội dung hoạt động..."
                  value={logsSearch}
                  onChange={e => setLogsSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Quick Filter Category Tags */}
            <div className={styles.filterBar}>
              {FILTER_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  className={`${styles.filterBtn} ${logsFilter === opt.key ? styles.filterBtnActive : ''}`}
                  onClick={() => setLogsFilter(opt.key)}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Logs List Container */}
            <div className={styles.logsWrap}>
              {logsLoading ? (
                <div className={styles.loadingWrap}>
                  <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className={styles.empty}>Không tìm thấy bản ghi nhật ký nào</div>
              ) : (
                <div className={styles.logsScroll}>
                  {filteredLogs.map((log) => {
                    const isPositive = log.xu_change > 0;
                    const isNegative = log.xu_change < 0;
                    
                    let timeStr = '';
                    try {
                      timeStr = new Date(log.created_at).toLocaleString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      });
                    } catch (e) {
                      timeStr = String(log.created_at);
                    }
                    
                    let icon = '📝';
                    let catClass = styles.catGeneral;
                    if (log.action_type === 'login') { icon = '🔐'; catClass = styles.catLogin; }
                    else if (log.action_type.startsWith('farming_')) { icon = '🌾'; catClass = styles.catFarming; }
                    else if (log.action_type.startsWith('market_')) { icon = '🛒'; catClass = styles.catMarket; }
                    else if (log.action_type === 'game_play') { icon = '⚽'; catClass = styles.catGame; }
                    else if (log.action_type === 'utility_access') { icon = '⚙️'; catClass = styles.catUtility; }
                    else if (log.action_type.startsWith('coin_transfer_')) { icon = '🪙'; catClass = styles.catCoin; }

                    return (
                      <div key={log.id} className={`${styles.logRow} rpg-box`}>
                        <div className={styles.logHeader}>
                          <span className={styles.logUser}>
                            <span className={`${styles.catTag} ${catClass}`}>{icon}</span>
                            @{log.username}
                          </span>
                          <span className={styles.logTime}>{timeStr}</span>
                        </div>
                        <div className={styles.logBody}>
                          <span className={styles.logDetails}>{log.details || log.action_type}</span>
                          {log.xu_change !== 0 && (
                            <span className={`${styles.logXu} ${isPositive ? styles.xuPositive : styles.xuNegative}`}>
                              {isPositive ? `+${log.xu_change}` : log.xu_change} xu
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- MOVIES TAB --- */}
        {activeTab === 'movies' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Search + Add */}
            <div className={styles.toolbar}>
              <div className={styles.searchWrap}>
                <span className={styles.searchIcon}>&gt;</span>
                <input
                  className={styles.searchInput}
                  placeholder="tìm tên phim hoặc nhãn..."
                  value={movieSearch}
                  onChange={e => setMovieSearch(e.target.value)}
                />
              </div>
              <button
                className={`btn btn-primary ${styles.addBtn}`}
                onClick={() => setMovieModal('add')}
              >
                [ + ] THÊM PHIM
              </button>
            </div>

            {/* Movie list */}
            <div className={styles.listWrap}>
              {moviesLoading ? (
                <div className={styles.loadingWrap}>
                  <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
                </div>
              ) : filteredMovies.length === 0 ? (
                <div className={styles.empty}>Không tìm thấy phim nào</div>
              ) : (
                filteredMovies.map((m, i) => {
                  return (
                    <div
                      key={m.id}
                      className={`${styles.userRow} rpg-box`}
                      style={{ animationDelay: `${i * 0.04}s`, alignItems: 'flex-start' }}
                    >
                      {/* Movie cover preview */}
                      <div 
                        style={{ 
                          width: '60px', 
                          height: '80px', 
                          border: '2px solid var(--px-border)', 
                          backgroundColor: '#f1f5f9',
                          flexShrink: 0,
                          backgroundImage: m.coverUrl ? (m.coverUrl.startsWith('data:') ? `url(${m.coverUrl})` : `url(${import.meta.env.VITE_API_URL || ''}${m.coverUrl})`) : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {!m.coverUrl && <span style={{ fontSize: '20px' }}>🎬</span>}
                      </div>

                      <div className={styles.userInfo} style={{ alignSelf: 'stretch', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div className={styles.userNameRow}>
                            <span className={styles.userName}>{m.title}</span>
                          </div>
                          <div className={styles.userMeta} style={{ gap: '4px' }}>
                            {m.genre && <span style={{ fontSize: '0.75rem', padding: '1px 4px', border: '1px solid var(--px-border)', borderRadius: '2px' }}>{m.genre}</span>}
                            {m.country && <span style={{ fontSize: '0.75rem', padding: '1px 4px', border: '1px solid var(--px-border)', borderRadius: '2px' }}>{m.country}</span>}
                            <span style={{ fontSize: '0.75rem', color: 'var(--px-text-dim)' }}>
                              ({m.partsCount} Phần, {m.episodesCount} Tập)
                            </span>
                          </div>
                          {m.tags && (
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                              {m.tags.split(',').map(t => t.trim()).filter(Boolean).map((t, idx) => (
                                <span key={idx} style={{ fontSize: '0.7rem', color: 'var(--px-cyan)', border: '1px solid var(--px-cyan)', padding: '0px 4px', borderRadius: '2px' }}>
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className={styles.userActions} style={{ alignSelf: 'center' }}>
                        <button
                          className={styles.actionBtn}
                          title="Thống kê người xem"
                          onClick={() => setMovieWatchersModal({ movie: m })}
                        >
                          <Eye />
                        </button>
                        <button
                          className={styles.actionBtn}
                          title="Sửa"
                          onClick={() => setMovieModal({ edit: m })}
                        >
                          <Edit />
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                          title="Xóa"
                          onClick={() => setDelMovieTarget(m)}
                        >
                          <Trash />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

      </div>

      {/* Modals */}
      {modal === 'add' && (
        <UserModal onClose={() => setModal(null)} onSave={handleCreate} />
      )}
      {modal?.edit && (
        <UserModal
          user={modal.edit}
          onClose={() => setModal(null)}
          onSave={(form) => handleEdit(modal.edit, form)}
        />
      )}
      {delTarget && (
        <ConfirmDelete
          user={delTarget}
          onClose={() => setDelTarget(null)}
          onConfirm={() => handleDelete(delTarget)}
        />
      )}

      {movieModal === 'add' && (
        <MovieModal onClose={() => setMovieModal(null)} onSave={handleCreateMovie} authFetch={authFetch} />
      )}
      {movieModal?.edit && (
        <MovieModal
          movie={movieModal.edit}
          onClose={() => setMovieModal(null)}
          onSave={(form) => handleEditMovie(movieModal.edit, form)}
          authFetch={authFetch}
        />
      )}
      {delMovieTarget && (
        <ConfirmDeleteMovie
          movie={delMovieTarget}
          onClose={() => setDelMovieTarget(null)}
          onConfirm={() => handleDeleteMovie(delMovieTarget)}
        />
      )}
      {movieWatchersModal?.movie && (
        <MovieWatchersModal
          movie={movieWatchersModal.movie}
          onClose={() => setMovieWatchersModal(null)}
          authFetch={authFetch}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

// ── Modal: Add / Edit Movie ──────────────────────────────────────────────────
function MovieModal({ movie, onClose, onSave, authFetch }) {
  const isEdit = !!movie;
  const [form, setForm] = useState({
    title:       movie?.title       || '',
    description: movie?.description || '',
    coverUrl:    movie?.coverUrl    || '',
    tags:        movie?.tags        || '',
    country:     movie?.country     || '',
    genre:       movie?.genre       || '',
    parts:       movie?.parts       || [],
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErr(''); };

  const handleUploadCover = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setErr('');
    try {
      const formData = new FormData();
      formData.append('cover', file);

      const token = localStorage.getItem('tl42_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/movies/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi tải ảnh lên');
      set('coverUrl', data.path);
    } catch (err) {
      setErr(err.message);
    } finally {
      setUploading(false);
    }
  };

  const validateYoutubeUrl = (url) => {
    const reg = /^(https?:\/\/)?(www\.|m\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|v\/|shorts\/)?([a-zA-Z0-9_-]{11})/;
    return reg.test(url.trim());
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setErr('Vui lòng nhập tên phim'); return; }

    // Validate parts and episodes
    for (let pIdx = 0; pIdx < form.parts.length; pIdx++) {
      const part = form.parts[pIdx];
      if (!part.title.trim()) { setErr(`Vui lòng nhập tiêu đề cho Phần ${pIdx + 1}`); return; }
      if (!part.episodes || part.episodes.length === 0) {
        setErr(`Phần "${part.title}" cần có ít nhất 1 tập phim`);
        return;
      }
      for (let epIdx = 0; epIdx < part.episodes.length; epIdx++) {
        const ep = part.episodes[epIdx];
        if (!ep.title.trim()) { setErr(`Vui lòng nhập tiêu đề tập ${epIdx + 1} thuộc "${part.title}"`); return; }
        if (!ep.url.trim()) { setErr(`Vui lòng nhập link YouTube tập ${epIdx + 1} thuộc "${part.title}"`); return; }
        if (!validateYoutubeUrl(ep.url)) {
          setErr(`Link YouTube không hợp lệ ở tập ${epIdx + 1} thuộc "${part.title}"`);
          return;
        }
      }
    }

    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const addPart = () => {
    set('parts', [...form.parts, { title: `Phần ${form.parts.length + 1}`, episodes: [] }]);
  };

  const removePart = (pIdx) => {
    set('parts', form.parts.filter((_, idx) => idx !== pIdx));
  };

  const updatePartTitle = (pIdx, title) => {
    const newParts = [...form.parts];
    newParts[pIdx].title = title;
    set('parts', newParts);
  };

  const addEpisode = (pIdx) => {
    const newParts = [...form.parts];
    newParts[pIdx].episodes = [...newParts[pIdx].episodes, { title: `Tập ${newParts[pIdx].episodes.length + 1}`, url: '' }];
    set('parts', newParts);
  };

  const removeEpisode = (pIdx, epIdx) => {
    const newParts = [...form.parts];
    newParts[pIdx].episodes = newParts[pIdx].episodes.filter((_, idx) => idx !== epIdx);
    set('parts', newParts);
  };

  const updateEpisode = (pIdx, epIdx, field, val) => {
    const newParts = [...form.parts];
    newParts[pIdx].episodes[epIdx] = { ...newParts[pIdx].episodes[epIdx], [field]: val };
    set('parts', newParts);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
        <div className="px-titlebar">
          <span>{isEdit ? '◄ SỬA PHIM CỦA TÔI ►' : '◄ THÊM PHIM MỚI ►'}</span>
          <button className={styles.closeBtn} onClick={onClose}><Close /></button>
        </div>

        <div className={styles.modalBody} style={{ maxHeight: '70vh' }}>
          {err && <div className={styles.modalErr}>⚠️ {err}</div>}

          {/* Title */}
          <div className="input-group">
            <label className="input-label">Tên phim *</label>
            <input
              className="input-field"
              style={{ paddingLeft: 14 }}
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Nhập tên phim..."
            />
          </div>

          {/* Cover Image Upload */}
          <div className="input-group">
            <label className="input-label">Ảnh bìa phim (Tải lên tệp ảnh trực tiếp)</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div
                style={{
                  width: '60px',
                  height: '80px',
                  border: '2px solid var(--px-border)',
                  backgroundColor: '#f1f5f9',
                  backgroundImage: form.coverUrl ? (form.coverUrl.startsWith('data:') ? `url(${form.coverUrl})` : `url(${import.meta.env.VITE_API_URL || ''}${form.coverUrl})`) : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {!form.coverUrl && <span style={{ fontSize: '20px' }}>🎬</span>}
              </div>
              <div style={{ flex: 1 }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadCover}
                  disabled={uploading}
                  style={{ display: 'none' }}
                  id="cover-file-input"
                />
                <label
                  htmlFor="cover-file-input"
                  className="btn btn-outline"
                  style={{ display: 'inline-block', cursor: 'crosshair', fontSize: '0.8rem', padding: '6px 12px' }}
                >
                  {uploading ? 'Đang tải lên...' : '[ Chọn ảnh bìa ]'}
                </label>
                {form.coverUrl && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--px-green)', marginTop: '4px', wordBreak: 'break-all' }}>
                    Đường dẫn: {form.coverUrl}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Genre & Country */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label">Thể loại</label>
              <input
                className="input-field"
                style={{ paddingLeft: 14 }}
                value={form.genre}
                onChange={e => set('genre', e.target.value)}
                placeholder="Ví dụ: Vlog, Hài hước..."
              />
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label">Quốc gia</label>
              <input
                className="input-field"
                style={{ paddingLeft: 14 }}
                value={form.country}
                onChange={e => set('country', e.target.value)}
                placeholder="Ví dụ: Việt Nam, Nhật..."
              />
            </div>
          </div>

          {/* Description */}
          <div className="input-group">
            <label className="input-label">Mô tả phim</label>
            <textarea
              className="input-field"
              style={{ padding: '8px 14px', height: '80px', resize: 'vertical' }}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Nhập mô tả chi tiết phim..."
            />
          </div>

          {/* Tags */}
          <div className="input-group">
            <label className="input-label">Nhãn (ngăn cách bởi dấu phẩy)</label>
            <input
              className="input-field"
              style={{ paddingLeft: 14 }}
              value={form.tags}
              onChange={e => set('tags', e.target.value)}
              placeholder="Ví dụ: vlog, phimngan, dangoai"
            />
          </div>

          {/* Parts & Episodes builder */}
          <div style={{ borderTop: '2px solid var(--px-border)', paddingTop: '12px', marginTop: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="input-label" style={{ margin: 0, fontWeight: 'bold' }}>DANH SÁCH PHẦN & TẬP PHIM ({form.parts.length} Phần)</span>
              <button type="button" className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.75rem', width: 'auto' }} onClick={addPart}>
                + Thêm Phần
              </button>
            </div>

            {form.parts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px', background: '#f8fafc', border: '1px dashed var(--px-border)', fontSize: '0.8rem', color: 'var(--px-text-dim)' }}>
                Chưa có phần phim nào. Bấm "Thêm Phần" để bắt đầu.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {form.parts.map((part, pIdx) => (
                  <div key={pIdx} style={{ border: '2px solid var(--px-border)', padding: '12px', borderRadius: '4px', position: 'relative' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                      <input
                        className="input-field"
                        style={{ paddingLeft: 10, fontSize: '0.85rem', flex: 1 }}
                        value={part.title}
                        onChange={e => updatePartTitle(pIdx, e.target.value)}
                        placeholder={`Tiêu đề phần (vd: Phần ${pIdx + 1})`}
                      />
                      <button
                        type="button"
                        className="btn btn-danger"
                        style={{ padding: '6px 10px', fontSize: '0.75rem', width: 'auto' }}
                        onClick={() => removePart(pIdx)}
                      >
                        Xóa Phần
                      </button>
                    </div>

                    {/* Episodes list */}
                    <div style={{ paddingLeft: '12px', borderLeft: '2px dashed var(--px-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {part.episodes && part.episodes.map((ep, epIdx) => {
                        const isUrlValid = ep.url ? validateYoutubeUrl(ep.url) : true;
                        return (
                          <div key={epIdx} style={{ background: '#f8fafc', padding: '8px', border: '1.5px solid var(--px-border)', borderRadius: '2px' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', width: '45px' }}>Tập {epIdx + 1}:</span>
                              <input
                                className="input-field"
                                style={{ paddingLeft: 8, fontSize: '0.8rem', flex: 1 }}
                                value={ep.title}
                                onChange={e => updateEpisode(pIdx, epIdx, 'title', e.target.value)}
                                placeholder="Tiêu đề tập (vd: Tập 1: Đi cắm trại)"
                              />
                              <button
                                type="button"
                                className="btn btn-danger"
                                style={{ padding: '4px 8px', fontSize: '0.7rem', width: 'auto' }}
                                onClick={() => removeEpisode(pIdx, epIdx)}
                              >
                                Xóa
                              </button>
                            </div>
                            <div>
                              <input
                                className="input-field"
                                style={{ paddingLeft: 8, fontSize: '0.8rem', borderColor: !isUrlValid ? 'var(--px-red)' : 'var(--px-border)' }}
                                value={ep.url}
                                onChange={e => updateEpisode(pIdx, epIdx, 'url', e.target.value)}
                                placeholder="Link YouTube (vd: https://www.youtube.com/watch?v=...)"
                              />
                              {!isUrlValid && (
                                <div style={{ fontSize: '0.7rem', color: 'var(--px-red)', marginTop: '2px' }}>
                                  ⚠️ Link YouTube không đúng định dạng
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ padding: '4px 8px', fontSize: '0.75rem', alignSelf: 'flex-start', marginTop: '4px', width: 'auto' }}
                        onClick={() => addEpisode(pIdx)}
                      >
                        + Thêm Tập
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className="btn btn-outline" onClick={onClose} disabled={saving} style={{ flex: 1 }}>[ HỦY ]</button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving || uploading}
            style={{ flex: 2 }}
          >
            {saving ? <><div className="spinner" /> ĐANG LƯU...</> : isEdit ? '[ LƯU THAY ĐỔI ]' : '[ ĐĂNG PHIM ]'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Confirm Delete Movie Modal ────────────────────────────────────────────────
function ConfirmDeleteMovie({ movie, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.modal} ${styles.modalSm}`} onClick={e => e.stopPropagation()}>
        <div className="px-titlebar">
          <span>◄ CẢNH BÁO ►</span>
          <button className={styles.closeBtn} onClick={onClose}><Close /></button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.modalDesc}>
            XÓA PHIM: <strong style={{color:'var(--px-red)'}}>{movie.title}</strong><br/>
            Dữ liệu phim và lịch sử xem của người dùng sẽ bị xóa hoàn toàn. Tiếp tục?
          </div>
          <div className={styles.modalFooter} style={{padding:0, borderTop:'none'}}>
            <button className="btn btn-outline" onClick={onClose} disabled={deleting} style={{ flex: 1 }}>[ HỦY ]</button>
            <button
              className="btn btn-danger"
              onClick={async () => { setDeleting(true); try { await onConfirm(); onClose(); } catch { setDeleting(false); } }}
              disabled={deleting}
              style={{ flex: 1 }}
            >
              {deleting ? <div className="spinner" /> : '[ XÓA PHIM ]'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Modal: Movie Watchers Statistics ─────────────────────────────────────────
function MovieWatchersModal({ movie, onClose, authFetch }) {
  const [watchers, setWatchers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadWatchers = async () => {
      try {
        const res = await authFetch(`/api/admin/movies/${movie.id}/watchers`);
        if (res.ok && active) {
          setWatchers(await res.json());
        }
      } catch (e) {
        console.error('Failed to load watchers:', e);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadWatchers();
    return () => { active = false; };
  }, [movie.id, authFetch]);

  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '0 giây';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    
    const parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 || parts.length === 0) parts.push(`${s}s`);
    
    return parts.join(' ');
  };

  // Group by user
  const groupedWatchers = {};
  watchers.forEach(w => {
    const key = w.username;
    if (!groupedWatchers[key]) {
      groupedWatchers[key] = {
        username: w.username,
        displayName: w.displayName,
        parts: {},
        totalSeconds: 0,
        lastWatchedAt: w.lastWatchedAt
      };
    }
    groupedWatchers[key].parts[w.partIndex] = (groupedWatchers[key].parts[w.partIndex] || 0) + w.watchedSeconds;
    groupedWatchers[key].totalSeconds += w.watchedSeconds;
    if (new Date(w.lastWatchedAt) > new Date(groupedWatchers[key].lastWatchedAt)) {
      groupedWatchers[key].lastWatchedAt = w.lastWatchedAt;
    }
  });

  const watchersList = Object.values(groupedWatchers).sort((a, b) => b.totalSeconds - a.totalSeconds);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
        <div className="px-titlebar">
          <span>◄ THỐNG KÊ NGƯỜI XEM ►</span>
          <button className={styles.closeBtn} onClick={onClose}><Close /></button>
        </div>

        <div className={styles.modalBody} style={{ maxHeight: '65vh' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '8px' }}>
            Phim: <span style={{ color: 'var(--px-green)' }}>{movie.title}</span>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
              <div className="spinner" />
            </div>
          ) : watchersList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--px-text-dim)', fontSize: '0.85rem' }}>
              Chưa có người dùng nào xem phim này.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {watchersList.map((watcher, idx) => (
                <div key={idx} style={{ border: '2.5px solid var(--px-border)', padding: '10px', borderRadius: '4px', background: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                      {watcher.displayName || watcher.username} (@{watcher.username})
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--px-amber)', fontWeight: 'bold' }}>
                      Tổng: {formatTime(watcher.totalSeconds)}
                    </span>
                  </div>

                  {/* Parts break down */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '8px', borderLeft: '2px solid var(--px-border)', fontSize: '0.75rem', color: 'var(--px-text-mid)' }}>
                    {Object.keys(watcher.parts).map((pIdxStr) => {
                      const pIdx = parseInt(pIdxStr, 10);
                      const partTitle = movie.parts && movie.parts[pIdx]?.title ? movie.parts[pIdx].title : `Phần ${pIdx + 1}`;
                      return (
                        <div key={pIdx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>{partTitle}:</span>
                          <span style={{ fontWeight: '600' }}>{formatTime(watcher.parts[pIdx])}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ fontSize: '0.7rem', color: 'var(--px-text-dim)', textAlign: 'right', marginTop: '6px' }}>
                    Xem lần cuối: {new Date(watcher.lastWatchedAt).toLocaleString('vi-VN')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className="btn btn-outline" onClick={onClose} style={{ flex: 1 }}>[ ĐÓNG ]</button>
        </div>
      </div>
    </div>
  );
}
