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

  useEffect(() => { loadUsers(); loadSettings(); }, [loadUsers, loadSettings]);

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
          <button className={styles.refreshBtn} onClick={loadUsers} aria-label="Làm mới" disabled={loading}>
            <span className={loading ? styles.spinning : ''}><Refresh /></span>
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

        {/* Settings & Preview */}
        <div className={`${styles.statsBar} rpg-box fade-in fade-in-delay-1`} style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'stretch' }}>
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
        <div className={`${styles.statsBar} rpg-box fade-in fade-in-delay-1`} style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'stretch' }}>
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

        {/* Search + Add */}
        <div className={`${styles.toolbar} fade-in fade-in-delay-2`}>
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
        <div className={`${styles.listWrap} fade-in fade-in-delay-2`}>
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

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
