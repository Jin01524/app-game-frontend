import React, { useEffect, useState } from 'react';
import { toast } from '../utils/toast';

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = toast.subscribe((message, type) => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 4000); // 4 seconds duration
    });
    return unsubscribe;
  }, []);

  const getStyleForType = (type) => {
    switch (type) {
      case 'error':
        return { bg: '#fef2f2', border: '#ef4444', text: '#b91c1c' };
      case 'success':
        return { bg: '#f0fdf4', border: '#22c55e', text: '#15803d' };
      default: // info
        return { bg: '#eff6ff', border: '#3b82f6', text: '#1d4ed8' };
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '20px', 
      left: '50%', 
      transform: 'translateX(-50%)', 
      zIndex: 9999, 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '10px',
      pointerEvents: 'none' // Don't block clicks underneath
    }}>
      {toasts.map(t => {
        const colors = getStyleForType(t.type);
        return (
          <div 
            key={t.id} 
            className="rpg-box" 
            style={{ 
              background: colors.bg, 
              border: `2px solid ${colors.border}`, 
              color: colors.text, 
              padding: '12px 24px', 
              minWidth: '300px', 
              textAlign: 'center', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              animation: 'slideDown 0.3s ease-out',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            {t.message}
          </div>
        );
      })}
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
