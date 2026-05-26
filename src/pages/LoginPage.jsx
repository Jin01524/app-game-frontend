import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PixelCanvas from '../components/PixelCanvas';
import styles from './LoginPage.module.css';

// ── Typewriter ────────────────────────────────────────────────────────────────
function Typewriter({ text, speed = 35, onDone }) {
  const [out, setOut] = useState('');
  useEffect(() => {
    let i = 0;
    setOut('');
    const t = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) { clearInterval(t); onDone?.(); }
    }, speed);
    return () => clearInterval(t);
  }, [text]);
  return <span>{out}<span className={styles.cursor}>█</span></span>;
}

function StartScreen({ onStart }) {
  return (
    <div className={styles.boot} style={{ alignItems: 'center', justifyContent: 'center', minHeight: '160px' }}>
      <button 
        className="btn btn-primary" 
        onClick={onStart}
        style={{ fontSize: '0.8rem', padding: '16px 32px' }}
      >
        ► BẤM ĐỂ BẮT ĐẦU
      </button>
    </div>
  );
}

// ── Eye icon ──────────────────────────────────────────────────────────────────
const EyeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

// ── Main ──────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [booted, setBooted]       = useState(false);
  const [username, setUsername]   = useState('');
  const [password, setPassword]   = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [shake, setShake]         = useState(false);

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!username.trim() || !password) { setError('[ERR] Vui lòng điền đầy đủ thông tin'); return; }
    setLoading(true);
    setError('');
    try {
      await login(username.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(`[ERR] ${err.message || 'Xác thực thất bại'}`);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <PixelCanvas />

      <div className={styles.container}>
        {/* ASCII art title */}
        <div className={styles.banner}>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '2.5rem', color: 'var(--px-text)', textShadow: '2px 2px 0 var(--px-border)', letterSpacing: '4px', marginBottom: '8px' }}>
            TỆ LẠN 4.2
          </div>
          <div className={styles.bannerSub}>
            <span className={styles.bannerVersion}>v4.2</span>
            <span className={styles.bannerDot}>■</span>
            <span>HỆ THỐNG NỘI BỘ</span>
          </div>
        </div>

        {/* Start sequence */}
        {!booted ? (
          <div className={`${styles.loginBox} rpg-box`}>
            <div className="px-titlebar">
              <span>◄ MÀN HÌNH CHÍNH ►</span>
            </div>
            <StartScreen onStart={() => setBooted(true)} />
          </div>
        ) : (
          <div className={`${styles.loginBox} ${shake ? styles.shake : ''} rpg-box fade-in`}>
            {/* Titlebar */}
            <div className="px-titlebar">
              <span>◄ ĐĂNG NHẬP ►</span>
              <span className={styles.titleBlink}>▼</span>
            </div>

            <form onSubmit={handleLogin} className={styles.form}>
              {/* Username */}
              <div className={styles.fieldWrap}>
                <div className={styles.fieldPrompt}>&gt;&gt; TÊN ĐĂNG NHẬP:</div>
                <input
                  id="input-username"
                  className={`input-field ${styles.termInput}`}
                  type="text"
                  value={username}
                  onChange={e => { setUsername(e.target.value); setError(''); }}
                  placeholder="nhập username..."
                  autoComplete="username"
                  autoCapitalize="none"
                  autoFocus
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div className={styles.fieldWrap}>
                <div className={styles.fieldPrompt}>&gt;&gt; MẬT KHẨU:</div>
                <div className="input-wrapper">
                  <input
                    id="input-password"
                    className={`input-field ${styles.termInput}`}
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder="nhập mật khẩu..."
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="input-toggle"
                    onClick={() => setShowPw(p => !p)}
                    tabIndex="-1"
                  >
                    {showPw ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && <div className={styles.errMsg}>{error}</div>}

              {/* Status line */}
              <div className={styles.statusLine}>
                <span className={styles.statusDot}>●</span>
                {loading ? 'ĐANG XÁC THỰC...' : 'SẴN SÀNG'}
              </div>

              {/* Submit */}
              <button
                id="btn-login"
                type="submit"
                className={`btn btn-primary ${styles.loginBtn}`}
                disabled={loading}
              >
                {loading
                  ? <><div className="spinner" /> XỬ LÝ...</>
                  : '[ ĐĂNG NHẬP ]'
                }
              </button>
            </form>

            <div className={styles.footer}>
              INSERT COIN TO CONTINUE ● TL4.2 © 2026
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
