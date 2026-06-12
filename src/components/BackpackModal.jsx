import { toast } from '../utils/toast';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import luaChinImg from '../../assets/lua-chin.png';
import cowImg from '../../assets/animals/cow/cow_move_01.png';
import milkImg from '../../assets/milk.png';
import romImg from '../../assets/whisk.png';
import cheeseImg from '../../assets/food/cheese.png';
import botMiImg from '../../assets/food/bot-mi.png';
import banhMiImg from '../../assets/food/banh-mi.png';
import sandwichImg from '../../assets/food/banh-mi-sandwich.png';

export const ITEM_ASSETS = {
  lua: { name: 'Lúa', icon: luaChinImg },
  cow: { name: 'Bò', icon: cowImg },
  milk: { name: 'Sữa bò', icon: milkImg },
  rom: { name: 'Rơm', icon: romImg },
  cheese: { name: 'Phô mai', icon: cheeseImg },
  bot_mi: { name: 'Bột mì', icon: botMiImg },
  banh_mi: { name: 'Bánh mì', icon: banhMiImg },
  sandwich: { name: 'Sandwich', icon: sandwichImg },
};

export default function BackpackModal({ onClose, onOpenStorage }) {
  const { user, authFetch, refreshUser, updateBackpack } = useAuth();
  const [loading, setLoading] = useState(false);
  const [promptData, setPromptData] = useState(null);
  const [promptInput, setPromptInput] = useState('');

  const handleDiscard = (itemId, amount) => {
    setPromptData({
      title: `Nhập số lượng muốn vứt (Tối đa ${amount})`,
      maxQty: amount,
      onConfirm: async (qty) => {
        if (isNaN(qty) || qty <= 0) return;
        setLoading(true);
        try {
          const res = await authFetch('/api/profile/discard', {
            method: 'POST',
            body: JSON.stringify({ itemId, amount: qty, source: 'backpack' })
          });
          const data = await res.json();
          if (!res.ok) toast.error(data.error);
          else {
            if (data.backpack) updateBackpack(data.backpack);
            else await refreshUser();
          }
        } catch(e) {
          toast.error('Lỗi');
        }
        setLoading(false);
      }
    });
    setPromptInput(amount.toString());
  };

  if (!user) return null;
  const backpack = user.backpack || [null, null];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      {promptData && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="rpg-box" style={{ background: '#fff', border: '2px solid #3b82f6', padding: '15px', width: '100%', textAlign: 'center', borderRadius: '8px', color: '#000' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '10px' }}>{promptData.title}</h3>
            <input 
              type="number" 
              min="1" 
              max={promptData.maxQty} 
              value={promptInput} 
              onChange={e => setPromptInput(e.target.value)}
              style={{ width: '100%', padding: '5px', marginBottom: '10px', textAlign: 'center' }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="pixel-btn" 
                onClick={() => {
                  promptData.onConfirm(parseInt(promptInput));
                  setPromptData(null);
                }}
                style={{ flex: 1, background: '#22c55e', color: '#fff', padding: '5px' }}
              >Xác nhận</button>
              <button 
                className="pixel-btn" 
                onClick={() => setPromptData(null)}
                style={{ flex: 1, background: '#ef4444', color: '#fff', padding: '5px' }}
              >Hủy</button>
            </div>
          </div>
        </div>
      )}

      <div className="rpg-box fade-in" style={{ background: '#fffbeb', width: '320px', padding: '20px', color: '#000', position: 'relative' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '10px', borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>🎒 Balo của bạn</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          {backpack.map((slot, i) => (
            <div key={i} style={{ 
              background: '#f8fafc', border: '2px solid #94a3b8', height: '100px', 
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' 
            }}>
              {slot && slot.quantity > 0 ? (
                <>
                  <img src={ITEM_ASSETS[slot.item_id]?.icon} alt={slot.item_id} style={{ height: '50px', objectFit: 'contain' }} />
                  <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{slot.quantity} / 64</div>
                  <div style={{ position: 'absolute', top: 2, right: 2, display: 'flex', gap: '2px' }}>
                    <button onClick={() => handleDiscard(slot.item_id, slot.quantity)} style={{ background: 'red', color: 'white', border: 'none', padding: '2px 4px', fontSize: '10px', cursor: 'pointer' }}>X</button>
                  </div>
                </>
              ) : (
                <div style={{ color: '#cbd5e1', fontSize: '12px' }}>Trống</div>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button className="pixel-btn" onClick={onClose} style={{ padding: '8px', width: '100%', background: '#e5e7eb', border: '2px solid var(--px-border)' }}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
