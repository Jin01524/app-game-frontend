import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PixelCanvas from '../components/PixelCanvas';
import styles from './ProfilePage.module.css';

// ── Icons ────────────────────────────────────────────────────────────────────
const ArrowLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const CameraIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);
const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function compressImage(file, maxWidth = 400, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Toast component ──────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  React.useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`${styles.toast} ${styles[`toast_${type}`]}`}>
      {type === 'success' ? <CheckIcon /> : '⚠️'}
      <span>{message}</span>
    </div>
  );
}

// ── Avatar Section ───────────────────────────────────────────────────────────
function AvatarSection({ user, onSuccess, onError, authFetch, updateAvatar }) {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);

  const initials = (user?.username || 'U')[0].toUpperCase();
  const currentAvatar = preview || user?.avatar;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onError('Vui lòng chọn file ảnh (JPG, PNG, ...)');
      return;
    }
    try {
      const compressed = await compressImage(file);
      setPreview(compressed);
    } catch {
      onError('Không thể đọc file ảnh');
    }
    e.target.value = '';
  };

  const handleUpload = async () => {
    if (!preview) return;
    setUploading(true);
    try {
      const res = await authFetch('/api/profile/avatar', {
        method: 'PUT',
        body: JSON.stringify({ avatar: preview }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      updateAvatar(data.avatar);
      setPreview(null);
      onSuccess('Cập nhật ảnh đại diện thành công!');
    } catch (err) {
      onError(err.message || 'Lỗi khi tải ảnh lên');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (preview) { setPreview(null); return; }
    setRemoving(true);
    try {
      const res = await authFetch('/api/profile/avatar', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      updateAvatar(null);
      onSuccess('Đã xóa ảnh đại diện');
    } catch (err) {
      onError(err.message || 'Lỗi khi xóa ảnh');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className={`${styles.section} rpg-box`}>
      <div className="px-titlebar">◄ ẢNH ĐẠI DIỆN ►</div>
      <div className={styles.sectionBody}>
      <div className={styles.avatarArea}>
        <div className={styles.avatarWrap}>
          {currentAvatar ? (
            <img src={currentAvatar} alt="Avatar" className={styles.avatarImg} />
          ) : (
            <div className={styles.avatarInitials}>{initials}</div>
          )}
          <button
            className={styles.cameraBadge}
            onClick={() => fileRef.current?.click()}
            aria-label="Chọn ảnh"
          >
            <CameraIcon />
          </button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
          id="avatar-file-input"
        />

        <div className={styles.avatarActions}>
          <button
            className="btn btn-primary"
            style={{ width: 'auto', padding: '10px 20px', fontSize: '0.9rem' }}
            onClick={() => fileRef.current?.click()}
          >
            <CameraIcon /> Chọn ảnh
          </button>

          {(currentAvatar || preview) && (
            <button
              className="btn btn-danger"
              style={{ width: 'auto', padding: '10px 16px', fontSize: '0.9rem' }}
              onClick={handleRemove}
              disabled={removing}
            >
              {removing ? <div className="spinner" /> : <TrashIcon />}
              {preview ? 'Huỷ' : 'Xoá ảnh'}
            </button>
          )}
        </div>

        {preview && (
          <button
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={uploading}
            id="btn-save-avatar"
          >
            {uploading ? <><div className="spinner" /> Đang lưu...</> : <><CheckIcon /> Lưu ảnh này</>}
          </button>
        )}

        </div>
      </div>
    </div>
  );
}

// ── Password Section ─────────────────────────────────────────────────────────
function PasswordSection({ onSuccess, onError, authFetch }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);

  const toggleShow = (field) => setShow((s) => ({ ...s, [field]: !s[field] }));
  const setField = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      onError('Vui lòng nhập đầy đủ thông tin'); return;
    }
    if (form.newPassword !== form.confirmPassword) {
      onError('Mật khẩu xác nhận không khớp'); return;
    }
    if (form.newPassword.length < 6) {
      onError('Mật khẩu mới phải có ít nhất 6 ký tự'); return;
    }

    setLoading(true);
    try {
      const res = await authFetch('/api/profile/password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      onSuccess('Đổi mật khẩu thành công!');
    } catch (err) {
      onError(err.message || 'Lỗi khi đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'currentPassword', label: 'Mật khẩu hiện tại',  showKey: 'current' },
    { key: 'newPassword',     label: 'Mật khẩu mới',        showKey: 'new' },
    { key: 'confirmPassword', label: 'Xác nhận mật khẩu mới', showKey: 'confirm' },
  ];

  return (
    <div className={`${styles.section} rpg-box`}>
      <div className="px-titlebar">◄ ĐỔI MẬT KHẨU ►</div>
      <div className={styles.sectionBody}>
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {fields.map(({ key, label, showKey }) => (
          <div className="input-group" key={key}>
            <label className="input-label">{label}</label>
            <div className="input-wrapper">
              <span className="input-icon"><LockIcon /></span>
              <input
                className="input-field"
                type={show[showKey] ? 'text' : 'password'}
                placeholder={`Nhập ${label.toLowerCase()}`}
                value={form[key]}
                onChange={(e) => setField(key, e.target.value)}
                autoComplete="off"
                disabled={loading}
              />
              <button
                type="button"
                className="input-toggle"
                onClick={() => toggleShow(showKey)}
                tabIndex="-1"
                aria-label="Toggle"
              >
                {show[showKey] ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>
        ))}

        <button
          id="btn-change-password"
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? <><div className="spinner" /> Đang lưu...</> : <><CheckIcon /> Đổi mật khẩu</>}
        </button>
      </form>
      </div>
    </div>
  );
}

// ── Info Section (read-only) ─────────────────────────────────────────────────
function InfoSection({ user }) {
  const rows = [
    { icon: <UserIcon />,     label: 'Tên đăng nhập',  value: user?.username },
    { icon: <UserIcon />,     label: 'Tên hiển thị',   value: user?.displayName },
    { icon: <CalendarIcon />, label: 'Ngày tham gia',  value: formatDate(user?.createdAt) },
  ];

  return (
    <div className={`${styles.section} rpg-box`}>
      <div className="px-titlebar">◄ THÔNG TIN TÀI KHOẢN ►</div>
      <div className={styles.sectionBody}>
      <p className={styles.readOnlyNote}>&gt; Tử ĐỘC -- không thể chỉnh sửa</p>
      <div className={styles.infoList}>
        {rows.map(({ icon, label, value }) => (
          <div key={label} className={styles.infoRow}>
            <div className={styles.infoRowIcon}>{icon}</div>
            <div className={styles.infoRowContent}>
              <span className={styles.infoRowLabel}>{label}</span>
              <span className={styles.infoRowValue}>{value || '—'}</span>
            </div>
            <div className={styles.infoRowLock}>🔒</div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, authFetch, updateAvatar } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  return (
    <div className={styles.page}>
      <PixelCanvas />

      <div className={styles.container}>
        {/* Header */}
        <header className={`${styles.header} rpg-box fade-in`}>
          <button
            className={styles.backBtn}
            onClick={() => navigate('/')}
            aria-label="Quay lại"
          >
            <ArrowLeft />
          </button>
          <h1 className={styles.headerTitle}>[ HỔ SƠ CÁ NHÂN ]</h1>
          <div style={{ width: 36 }} />
        </header>

        {/* Sections */}
        <div className={styles.content}>
          <div className="fade-in fade-in-delay-1">
            <AvatarSection
              user={user}
              authFetch={authFetch}
              updateAvatar={updateAvatar}
              onSuccess={(msg) => showToast(msg, 'success')}
              onError={(msg) => showToast(msg, 'error')}
            />
          </div>

          <div className="fade-in fade-in-delay-2">
            <InfoSection user={user} />
          </div>

          <div className="fade-in fade-in-delay-3">
            <PasswordSection
              authFetch={authFetch}
              onSuccess={(msg) => showToast(msg, 'success')}
              onError={(msg) => showToast(msg, 'error')}
            />
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
