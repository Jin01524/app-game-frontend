import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);
const API_BASE = `${import.meta.env.VITE_API_URL || ''}/api`;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verify token on app start
  useEffect(() => {
    const token = localStorage.getItem('tl42_token');
    if (!token) { setLoading(false); return; }

    fetch(`${API_BASE}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => { if (res.ok) return res.json(); throw new Error(); })
      .then((data) => setUser(data))
      .catch(() => localStorage.removeItem('tl42_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Đăng nhập thất bại');
    localStorage.setItem('tl42_token', data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    const token = localStorage.getItem('tl42_token');
    if (token) {
      try {
        await fetch(`${API_BASE}/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch { /* ignore */ }
    }
    localStorage.removeItem('tl42_token');
    setUser(null);
  }, []);

  // Update avatar in context after successful upload
  const updateAvatar = useCallback((avatar) => {
    setUser((prev) => prev ? { ...prev, avatar } : prev);
  }, []);

  // Refresh user info from server
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('tl42_token');
    if (!token) return;
    const res = await fetch(`${API_BASE}/me`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      setUser(data);
    }
  }, []);

  // Authenticated fetch helper
  const authFetch = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem('tl42_token');
    const fullUrl = url.startsWith('/') ? `${import.meta.env.VITE_API_URL || ''}${url}` : url;
    return fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
  }, []);

  // Update xu locally (for immediate feedback)
  const addXu = useCallback((amount) => {
    setUser((prev) => prev ? { ...prev, xu: (prev.xu || 0) + amount } : prev);
  }, []);

  const updateBackpack = useCallback((backpack) => {
    setUser((prev) => prev ? { ...prev, backpack } : prev);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateAvatar, addXu, refreshUser, authFetch, updateBackpack }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
