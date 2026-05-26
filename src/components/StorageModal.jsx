import { toast } from '../utils/toast';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ITEM_ASSETS } from './BackpackModal';

export default function StorageModal({ onClose }) {
  const { user, authFetch, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [slots, setSlots] = useState(5);
  const [promptData, setPromptData] = useState(null);
  const [promptInput, setPromptInput] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);

  const fetchInventory = async () => {
    try {
      const res = await authFetch('/api/farm');
      if (res.ok) {
        const data = await res.json();
        setInventory(data.inventory);
        setSlots(data.inventory_slots || 5);
      }
    } catch(e) {}
  };

  useEffect(() => {
    fetchInventory();
  }, [authFetch]);

  const handleTransferToBackpack = (itemId, maxAmount) => {
    setPromptData({
      title: `Lấy ${ITEM_ASSETS[itemId]?.name || itemId} vào balo (Tối đa ${maxAmount}):`,
      maxQty: maxAmount,
      onConfirm: async (qty) => {
        if (isNaN(qty) || qty <= 0) return;
        setLoading(true);
        try {
          const res = await authFetch('/api/profile/transfer', {
            method: 'POST',
            body: JSON.stringify({ itemId, amount: qty, direction: 'to_backpack' })
          });
          const data = await res.json();
          if (!res.ok) toast.error(data.error);
          else {
            await refreshUser();
            await fetchInventory();
            setSelectedSlot(null);
          }
        } catch(e) { toast.error('Lỗi'); }
        setLoading(false);
      }
    });
    setPromptInput(maxAmount.toString());
  };

  const handleTransferToStorage = (itemId, maxAmount) => {
    setPromptData({
      title: `Cất ${ITEM_ASSETS[itemId]?.name || itemId} vào kho (Tối đa ${maxAmount}):`,
      maxQty: maxAmount,
      onConfirm: async (qty) => {
        if (isNaN(qty) || qty <= 0) return;
        setLoading(true);
        try {
          const res = await authFetch('/api/profile/transfer', {
            method: 'POST',
            body: JSON.stringify({ itemId, amount: qty, direction: 'to_storage' })
          });
          const data = await res.json();
          if (!res.ok) toast.error(data.error);
          else {
            await refreshUser();
            await fetchInventory();
            setSelectedSlot(null);
          }
        } catch(e) { toast.error('Lỗi'); }
        setLoading(false);
      }
    });
    setPromptInput(maxAmount.toString());
  };

  const handleDiscardItem = (itemId, amount, source) => {
    setPromptData({
      title: `Nhập số lượng muốn vứt (Tối đa ${amount}):`,
      maxQty: amount,
      onConfirm: async (qty) => {
        if (isNaN(qty) || qty <= 0) return;
        setLoading(true);
        try {
          const res = await authFetch('/api/profile/discard', {
            method: 'POST',
            body: JSON.stringify({ itemId, amount: qty, source })
          });
          const data = await res.json();
          if (!res.ok) toast.error(data.error);
          else {
            await refreshUser();
            await fetchInventory();
            setSelectedSlot(null);
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
          <div className="rpg-box" style={{ background: '#fff', border: '2px solid #3b82f6', padding: '15px', width: '300px', textAlign: 'center', borderRadius: '8px', color: '#000', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '10px' }}>{promptData.title}</h3>
            <input 
              type="number" 
              min="1" 
              max={promptData.maxQty} 
              value={promptInput} 
              onChange={e => setPromptInput(e.target.value)}
              style={{ width: '100%', padding: '5px', marginBottom: '10px', textAlign: 'center', fontSize: '16px' }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="pixel-btn" 
                onClick={() => {
                  promptData.onConfirm(parseInt(promptInput));
                  setPromptData(null);
                }}
                style={{ flex: 1, background: '#22c55e', color: '#fff', padding: '8px' }}
              >Xác nhận</button>
              <button 
                className="pixel-btn" 
                onClick={() => setPromptData(null)}
                style={{ flex: 1, background: '#ef4444', color: '#fff', padding: '8px' }}
              >Hủy</button>
            </div>
          </div>
        </div>
      )}

      <div className="rpg-box fade-in" style={{ background: '#fffbeb', width: '500px', maxWidth: '95vw', padding: '20px', color: '#000', display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>
          <h2 style={{ fontSize: '18px', margin: 0 }}>Kho đồ & Balo</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✖</button>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          
          {/* Storage Section */}
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '14px', marginBottom: '10px', color: '#1e293b' }}>📦 KHO ĐỒ ({slots} ô)</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {inventory.map((item, i) => (
                <div 
                  key={i} 
                  onClick={() => setSelectedSlot({ source: 'storage', itemId: item.item_id, quantity: item.quantity })}
                  style={{ 
                    background: '#f8fafc', 
                    border: selectedSlot?.source === 'storage' && selectedSlot?.itemId === item.item_id ? '3px solid #3b82f6' : '2px solid #94a3b8', 
                    width: '64px', height: '64px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                    position: 'relative', cursor: 'pointer' 
                }}>
                  <img src={ITEM_ASSETS[item.item_id]?.icon} alt={item.item_id} style={{ height: '32px', objectFit: 'contain' }} />
                  <div style={{ fontSize: '10px', fontWeight: 'bold' }}>x{item.quantity}</div>
                </div>
              ))}
              {inventory.length === 0 && <div style={{ fontSize: '12px', color: '#94a3b8' }}>Kho trống</div>}
            </div>
          </div>

          {/* Middle Actions Column */}
          <div style={{ width: '80px', display: 'flex', flexDirection: 'column', gap: '15px', justifyContent: 'center', alignItems: 'center' }}>
            <button 
              className="pixel-btn"
              disabled={!selectedSlot || selectedSlot.source !== 'storage'}
              onClick={() => handleTransferToBackpack(selectedSlot.itemId, selectedSlot.quantity)}
              style={{ width: '100%', padding: '8px', background: '#3b82f6', color: 'white', opacity: (!selectedSlot || selectedSlot.source !== 'storage') ? 0.5 : 1 }}
            >
              ↓ Lấy
            </button>
            <button 
              className="pixel-btn"
              disabled={!selectedSlot || selectedSlot.source !== 'backpack'}
              onClick={() => handleTransferToStorage(selectedSlot.itemId, selectedSlot.quantity)}
              style={{ width: '100%', padding: '8px', background: 'var(--px-amber)', color: 'black', opacity: (!selectedSlot || selectedSlot.source !== 'backpack') ? 0.5 : 1 }}
            >
              ↑ Cất
            </button>
            <button 
              className="pixel-btn"
              disabled={!selectedSlot}
              onClick={() => handleDiscardItem(selectedSlot.itemId, selectedSlot.quantity, selectedSlot.source)}
              style={{ width: '100%', padding: '8px', background: '#ef4444', color: 'white', opacity: !selectedSlot ? 0.5 : 1 }}
            >
              ✖ Vứt
            </button>
          </div>

          {/* Backpack Section */}
          <div style={{ width: '120px' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '10px', color: '#1e293b' }}>🎒 BALO</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {backpack.map((slot, i) => (
                <div 
                  key={i} 
                  onClick={() => { if (slot && slot.quantity > 0) setSelectedSlot({ source: 'backpack', itemId: slot.item_id, quantity: slot.quantity }) }}
                  style={{ 
                    background: '#f8fafc', 
                    border: selectedSlot?.source === 'backpack' && selectedSlot?.itemId === slot?.item_id ? '3px solid #3b82f6' : '2px solid #94a3b8', 
                    height: '64px', 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                    position: 'relative', cursor: slot && slot.quantity > 0 ? 'pointer' : 'default' 
                }}>
                  {slot && slot.quantity > 0 ? (
                    <>
                      <img src={ITEM_ASSETS[slot.item_id]?.icon} alt={slot.item_id} style={{ height: '32px', objectFit: 'contain' }} />
                      <div style={{ fontSize: '10px', fontWeight: 'bold' }}>{slot.quantity} / 64</div>
                    </>
                  ) : (
                    <div style={{ color: '#cbd5e1', fontSize: '10px' }}>Trống</div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
