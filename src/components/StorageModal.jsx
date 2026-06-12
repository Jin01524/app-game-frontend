import { toast } from '../utils/toast';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ITEM_ASSETS } from './BackpackModal';

export default function StorageModal({ onClose, selectedBackpackSlotIdx = null, setSelectedBackpackSlotIdx = () => {} }) {
  const { user, authFetch, refreshUser, updateBackpack, addXu } = useAuth();
  const [loading, setLoading] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [slots, setSlots] = useState(5);
  const [promptData, setPromptData] = useState(null);
  const [promptInput, setPromptInput] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    if (selectedBackpackSlotIdx !== null) {
      setSelectedSlot(null);
    }
  }, [selectedBackpackSlotIdx]);

  const handleBuySlot = async () => {
    if (!user) return;
    if ((user.xu || 0) < 250) {
      toast.error('Không đủ xu! Cần 250 xu để mở rộng kho đồ.');
      return;
    }
    setLoading(true);
    try {
      const res = await authFetch('/api/farm/buy-slot', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) toast.error(data.error || 'Lỗi');
      else {
        setSlots(prev => prev + 1);
        addXu(-250);
        toast.success('Mở rộng kho đồ thành công!');
      }
    } catch(e) {
      toast.error('Lỗi kết nối');
    }
    setLoading(false);
  };

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
            // Cập nhật backpack ngay lập tức từ response
            if (data.backpack) updateBackpack(data.backpack);
            // Cập nhật inventory local
            if (data.inventory) setInventory(data.inventory);
            else {
              setInventory(prev => {
                const updated = prev.map(i => i.item_id === itemId ? { ...i, quantity: i.quantity - qty } : i);
                return updated.filter(i => i.quantity > 0);
              });
            }
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
            // Cập nhật backpack ngay lập tức từ response
            if (data.backpack) updateBackpack(data.backpack);
            // Cập nhật inventory local
            if (data.inventory) setInventory(data.inventory);
            else {
              setInventory(prev => {
                const existing = prev.find(i => i.item_id === itemId);
                if (existing) return prev.map(i => i.item_id === itemId ? { ...i, quantity: i.quantity + qty } : i);
                return [...prev, { item_id: itemId, quantity: qty }];
              });
            }
            setSelectedSlot(null);
          }
        } catch(e) { toast.error('Lỗi'); }
        setLoading(false);
      }
    });
    setPromptInput(maxAmount.toString());
  };

  const handleTransferAllToStorage = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/profile/transfer-all-backpack', {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) toast.error(data.error || 'Lỗi khi cất nhanh');
      else {
        toast.success(data.message || 'Đã cất nhanh tất cả vật phẩm vào kho');
        if (data.backpack) updateBackpack(data.backpack);
        if (data.inventory) setInventory(data.inventory);
        setSelectedBackpackSlotIdx(null);
        setSelectedSlot(null);
      }
    } catch(e) { toast.error('Lỗi kết nối'); }
    setLoading(false);
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
            // Cập nhật trực tiếp từ response
            if (data.backpack) updateBackpack(data.backpack);
            if (data.inventory) setInventory(data.inventory);
            else if (source === 'storage') {
              setInventory(prev => {
                const updated = prev.map(i => i.item_id === itemId ? { ...i, quantity: i.quantity - qty } : i);
                return updated.filter(i => i.quantity > 0);
              });
            }
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
  const selectedBackpackItem = (selectedBackpackSlotIdx !== null && backpack[selectedBackpackSlotIdx] && backpack[selectedBackpackSlotIdx].quantity > 0)
    ? backpack[selectedBackpackSlotIdx]
    : null;

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

      <div className="rpg-box fade-in" style={{ background: '#fffbeb', width: '420px', maxWidth: '95vw', maxHeight: '92%', overflowY: 'auto', padding: '12px 16px', color: '#000', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', marginTop: '-50px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #ccc', paddingBottom: '6px' }}>
          <h2 style={{ fontSize: '16px', margin: 0, fontWeight: 'bold' }}>📦 Kho đồ</h2>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              fontSize: '14px', 
              cursor: 'pointer',
              fontFamily: 'var(--font-pixel)',
              fontWeight: 'bold',
              color: '#ef4444'
            }}
          >
            [x]
          </button>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          
          {/* Storage Section */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '13px', margin: 0, color: '#1e293b' }}>📦 KHO ĐỒ ({slots} ô)</h3>
              <button 
                className="pixel-btn"
                onClick={handleBuySlot}
                disabled={loading}
                style={{ fontSize: '10px', padding: '3px 6px', background: '#22c55e', color: 'white', cursor: 'pointer' }}
              >
                + Mở ô (250 Xu)
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', maxHeight: '150px', overflowY: 'auto', padding: '2px' }}>
              {inventory.map((item, i) => (
                <div 
                  key={i} 
                  onClick={() => {
                    setSelectedSlot({ source: 'storage', itemId: item.item_id, quantity: item.quantity });
                    setSelectedBackpackSlotIdx(null);
                  }}
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
              disabled={!selectedSlot}
              onClick={() => handleTransferToBackpack(selectedSlot.itemId, selectedSlot.quantity)}
              style={{ width: '100%', padding: '8px', background: '#3b82f6', color: 'white', opacity: !selectedSlot ? 0.5 : 1 }}
            >
              ↓ Lấy
            </button>
            <button 
              className="pixel-btn"
              disabled={!selectedBackpackItem}
              onClick={() => handleTransferToStorage(selectedBackpackItem.item_id, selectedBackpackItem.quantity)}
              style={{ width: '100%', padding: '8px', background: 'var(--px-amber)', color: 'black', opacity: !selectedBackpackItem ? 0.5 : 1 }}
            >
              ↑ Cất
            </button>
            <button 
              className="pixel-btn"
              disabled={!backpack.some(item => item && item.quantity > 0)}
              onClick={handleTransferAllToStorage}
              style={{ width: '100%', padding: '8px', background: '#eab308', color: 'black', opacity: !backpack.some(item => item && item.quantity > 0) ? 0.5 : 1 }}
            >
              ⚡ Cất Nhanh
            </button>
            <button 
              className="pixel-btn"
              disabled={!selectedSlot && !selectedBackpackItem}
              onClick={() => {
                if (selectedSlot) {
                  handleDiscardItem(selectedSlot.itemId, selectedSlot.quantity, 'storage');
                } else if (selectedBackpackItem) {
                  handleDiscardItem(selectedBackpackItem.item_id, selectedBackpackItem.quantity, 'backpack');
                }
              }}
              style={{ width: '100%', padding: '8px', background: '#ef4444', color: 'white', opacity: (!selectedSlot && !selectedBackpackItem) ? 0.5 : 1 }}
            >
              ✖ Vứt
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
