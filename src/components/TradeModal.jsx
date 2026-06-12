import React, { useState, useEffect } from 'react';
import { toast } from "../utils/toast";
import { useAuth } from "../context/AuthContext";
import bagIcon from "../../assets/bag.png";
import coinIcon from "../../assets/coin-tl4.2.png";
import luanonIcon from "../../assets/lua-non.png";
import luachinIcon from "../../assets/lua-chin.png";
import suaIcon from "../../assets/milk.png";
import cheeseImg from "../../assets/food/cheese.png";
import botMiImg from "../../assets/food/bot-mi.png";
import banhMiImg from "../../assets/food/banh-mi.png";
import sandwichImg from "../../assets/food/banh-mi-sandwich.png";

const ITEM_ICONS = {
  'lua_non': luanonIcon,
  'lua_chin': luachinIcon,
  'sua': suaIcon,
  'milk': suaIcon,
  'cheese': cheeseImg,
  'bot_mi': botMiImg,
  'banh_mi': banhMiImg,
  'sandwich': sandwichImg
};

function getItemIcon(itemId) {
  return ITEM_ICONS[itemId] || bagIcon;
}

const ITEM_NAMES = {
  'lua_non': 'Lúa Non',
  'lua_chin': 'Lúa Chín',
  'hat_giong': 'Hạt Giống',
  'sua': 'Sữa Bò',
  'milk': 'Sữa Bò',
  'cheese': 'Phô Mai',
  'bot_mi': 'Bột Mì',
  'banh_mi': 'Bánh Mì',
  'sandwich': 'Sandwich'
};

export default function TradeModal({ targetUsername, onClose, socket, isAccepting = false }) {
  const { user, refreshUser } = useAuth();
  
  // States from socket
  const [tradeData, setTradeData] = useState(null);
  // isAccepting=true means we are P2 who accepted - trade_started will come back with session
  // isAccepting=false means we are P1 who sent the request - show 'requesting' while waiting
  const [status, setStatus] = useState(isAccepting ? 'active' : 'requesting');
  
  // Local states
  const [selectedInventorySlot, setSelectedInventorySlot] = useState(null);
  const [amountInput, setAmountInput] = useState('');
  
  const rawInventory = user?.backpack || [];
  // Backpack slot count = actual length of backpack array (default 2), NOT inventory_slots (which is storage/warehouse size)
  const backpackSlots = rawInventory.length || 2;
  const paddedInventory = Array.from({ length: backpackSlots }).map((_, i) => rawInventory[i] || null);

  useEffect(() => {
    if (!socket) return;
    
    // Only emit trade_request if we are the one initiating (P1), not if we accepted (P2)
    if (!isAccepting) {
      socket.emit('trade_request', { targetUsername });
    }
    
    const handleTradeStarted = (data) => {
      setTradeData(data);
      setStatus('active');
    };
    
    const handleTradeUpdated = (data) => {
      setTradeData(prev => prev ? { ...prev, p1: data.p1, p2: data.p2 } : data);
    };
    
    const handleTradeSuccess = () => {
      toast.success('Giao dịch thành công!');
      refreshUser();
      onClose();
    };
    
    const handleTradeCancelled = (reason) => {
      if (typeof reason === 'string' && reason) toast.info(reason);
      onClose();
    };
    
    const handleTradeError = (err) => {
      toast.error(err);
      // Only close on error if we were still in requesting phase (couldn't connect)
      if (!tradeData) onClose();
    };

    socket.on('trade_started', handleTradeStarted);
    socket.on('trade_updated', handleTradeUpdated);
    socket.on('trade_success', handleTradeSuccess);
    socket.on('trade_cancelled', handleTradeCancelled);
    socket.on('trade_error', handleTradeError);

    return () => {
      socket.off('trade_started', handleTradeStarted);
      socket.off('trade_updated', handleTradeUpdated);
      socket.off('trade_success', handleTradeSuccess);
      socket.off('trade_cancelled', handleTradeCancelled);
      socket.off('trade_error', handleTradeError);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  const handleCancel = () => {
    if (socket && tradeData?.tradeId) {
      // Trade already started - cancel active trade session
      socket.emit('trade_cancel', { tradeId: tradeData.tradeId });
    } else if (socket && !isAccepting && status === 'requesting') {
      // Still waiting for P2 to accept - cancel the pending invitation
      socket.emit('trade_request_cancel', { targetUsername });
    }
    onClose();
  };

  const handleReady = () => {
    if (socket && tradeData?.tradeId) {
      const myData = tradeData.p1.username === user.username ? tradeData.p1 : tradeData.p2;
      socket.emit('trade_ready', { tradeId: tradeData.tradeId, ready: !myData.ready });
    }
  };

  const updateTradeOffer = (newItems, newXu) => {
    if (socket && tradeData?.tradeId) {
      socket.emit('trade_update', { tradeId: tradeData.tradeId, items: newItems, xu: newXu });
    }
  };

  // Move item from inventory to trade table
  const handleAddItemToTrade = (slotIdx) => {
    if (status !== 'active' || !tradeData) return;
    const item = paddedInventory[slotIdx];
    if (!item) return;

    const myData = tradeData.p1.username === user.username ? tradeData.p1 : tradeData.p2;
    if (myData.ready) return; // Cannot modify if ready

    let newItems = [...myData.items];
    const existingIdx = newItems.findIndex(x => x.itemId === item.item_id);
    
    let moveAmount = parseInt(amountInput) || 1;
    if (moveAmount > item.quantity) moveAmount = item.quantity;

    if (existingIdx !== -1) {
      // Ensure we don't exceed max stack if we implement max stack, for now just add
      // But wait! We need to make sure they actually have enough total in backpack.
      // We will validate on server. 
      newItems[existingIdx].quantity += moveAmount;
    } else {
      if (newItems.length >= 4) {
        toast.error('Chỉ được giao dịch tối đa 4 loại vật phẩm');
        return;
      }
      newItems.push({ itemId: item.item_id, quantity: moveAmount });
    }
    
    updateTradeOffer(newItems, myData.xu);
    setAmountInput('');
  };

  const handleRemoveItemFromTrade = (idx) => {
    if (status !== 'active' || !tradeData) return;
    const myData = tradeData.p1.username === user.username ? tradeData.p1 : tradeData.p2;
    if (myData.ready) return;
    
    let newItems = [...myData.items];
    newItems.splice(idx, 1);
    updateTradeOffer(newItems, myData.xu);
  };

  const handleXuChange = (val) => {
    if (status !== 'active' || !tradeData) return;
    const myData = tradeData.p1.username === user.username ? tradeData.p1 : tradeData.p2;
    if (myData.ready) return;
    
    let num = parseInt(val) || 0;
    if (num > user.xu) num = user.xu;
    updateTradeOffer(myData.items, num);
  };

  const myData = tradeData ? (tradeData.p1.username === user?.username ? tradeData.p1 : tradeData.p2) : null;
  const theirData = tradeData ? (tradeData.p1.username === user?.username ? tradeData.p2 : tradeData.p1) : null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }}>
      {/* 2 PANELS CONTAINER */}
      <div style={{ display: 'flex', gap: '20px', maxWidth: '100%', padding: '10px' }}>
        
        {/* LEFT PANEL: BACKPACK */}
        <div style={{
          background: '#1e293b', border: '4px solid var(--px-border)', borderRadius: '8px',
          width: '240px', display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
          <div style={{ background: '#2563eb', color: 'white', padding: '8px', textAlign: 'center', fontWeight: 'bold', borderBottom: '4px solid #1d4ed8' }}>
            BALO
          </div>
          
          <div style={{ padding: '12px', overflowY: 'auto', maxHeight: '400px' }}>
            {/* Grid inventory */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginBottom: '16px' }}>
              {paddedInventory.map((slot, i) => (
                <div 
                  key={i} 
                  onClick={() => {
                    if (slot && status === 'active' && !myData?.ready) {
                      setSelectedInventorySlot(i);
                      setAmountInput(slot.quantity.toString());
                    }
                  }}
                  style={{
                    width: '100%', aspectRatio: '1',
                    background: 'rgba(0,0,0,0.5)',
                    border: selectedInventorySlot === i ? '2px solid #eab308' : '2px solid #475569',
                    borderRadius: '4px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative',
                    cursor: (slot && status === 'active' && !myData?.ready) ? 'pointer' : 'default'
                  }}
                >
                  {slot && (
                    <>
                      <img src={getItemIcon(slot.item_id)} alt={slot.item_id} style={{ width: '28px', height: '28px', objectFit: 'contain', imageRendering: 'pixelated' }} />
                      <div style={{
                        position: 'absolute', bottom: '0px', right: '2px',
                        color: 'white', fontSize: '10px', textShadow: '1px 1px 0 #000'
                      }}>
                        {slot.quantity}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Selected item controls */}
            {selectedInventorySlot !== null && paddedInventory[selectedInventorySlot] && (
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '4px', marginBottom: '16px' }}>
                <div style={{ color: '#facc15', fontSize: '0.9rem', marginBottom: '8px', textAlign: 'center' }}>
                  {ITEM_NAMES[paddedInventory[selectedInventorySlot].item_id] || paddedInventory[selectedInventorySlot].item_id}
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <input 
                    type="number" min="1" max={paddedInventory[selectedInventorySlot].quantity}
                    value={amountInput} onChange={e => setAmountInput(e.target.value)}
                    className="px-input" style={{ width: '60px', padding: '4px', textAlign: 'center' }}
                  />
                  <button className="btn btn-outline" style={{ padding: '4px', flex: 1 }} onClick={() => setAmountInput(paddedInventory[selectedInventorySlot].quantity.toString())}>MAX</button>
                </div>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: '8px', padding: '6px' }}
                  onClick={() => handleAddItemToTrade(selectedInventorySlot)}
                >
                  ĐƯA LÊN BÀN
                </button>
              </div>
            )}

            {/* User Xu */}
            <div style={{ color: '#facc15', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #475569' }}>
              <img src={coinIcon} alt="Xu" style={{ width: '24px', imageRendering: 'pixelated' }} />
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{(user?.xu || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: TRADE WINDOW */}
        <div style={{
          background: '#fff', border: '4px solid #000', borderRadius: '4px',
          width: '500px', display: 'flex', flexDirection: 'column', position: 'relative'
        }}>
          <div style={{ background: '#2563eb', color: 'white', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.5rem', fontWeight: 'bold', borderBottom: '4px solid #000', position: 'relative' }}>
            <span style={{ flex: 1, textAlign: 'center' }}>🤝 TRAO ĐỔI</span>
            <button 
              onClick={handleCancel}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                fontSize: '18px', 
                cursor: 'pointer',
                fontFamily: 'var(--font-pixel)',
                fontWeight: 'bold',
                color: '#ef4444',
                position: 'absolute',
                right: '12px',
                top: '12px'
              }}
            >
              [x]
            </button>
          </div>
          
          {status === 'requesting' ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#333' }}>
              <h2>Đang chờ <strong>{targetUsername}</strong> đồng ý...</h2>
              <div className="loading-spinner" style={{ margin: '20px auto' }}></div>
            </div>
          ) : (
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
              
              {/* PLAYERS AREA */}
              <div style={{ display: 'flex', gap: '20px' }}>
                
                {/* P1 (ME) */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', fontSize: '1.2rem' }}>
                    <span style={{ fontWeight: 'bold' }}>{myData?.username}</span>
                    {myData?.ready ? (
                      <span style={{ color: '#22c55e', fontSize: '1.5rem' }}>✔</span>
                    ) : (
                      <span style={{ color: '#ef4444', fontSize: '1.5rem' }}>❌</span>
                    )}
                  </div>
                  
                  {/* 4 item slots */}
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    {[0, 1, 2, 3].map(i => {
                      const item = myData?.items[i];
                      return (
                        <div key={i} onClick={() => handleRemoveItemFromTrade(i)} style={{
                          width: '48px', height: '48px', background: '#9ca3af', border: '2px solid #4b5563', borderRadius: '4px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                          cursor: (item && !myData?.ready) ? 'pointer' : 'default'
                        }}>
                          {item && (
                            <>
                              <img src={getItemIcon(item.itemId)} alt={item.itemId} style={{ maxWidth: '38px', maxHeight: '38px', width: 'auto', height: 'auto', objectFit: 'contain', imageRendering: 'pixelated' }} />
                              <span style={{ position: 'absolute', bottom: 0, right: 2, color: 'white', fontSize: '12px', textShadow: '1px 1px 0 #000', fontWeight: 'bold' }}>{item.quantity}</span>
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Xu input */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginTop: '10px' }}>
                    <input 
                      type="number" min="0" max={user?.xu || 0}
                      value={myData?.xu || ''} 
                      onChange={e => handleXuChange(e.target.value)}
                      disabled={myData?.ready}
                      style={{ width: '80px', padding: '6px', border: '2px solid #000', outline: 'none' }}
                      placeholder="Số xu"
                    />
                    {!myData?.ready && (
                      <button 
                        onClick={() => handleXuChange((myData?.xu || 0) + 10)}
                        style={{ background: '#facc15', border: 'none', padding: '8px 12px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}
                      >
                        + 10
                      </button>
                    )}
                  </div>
                </div>
                
                {/* P2 (THEM) */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', fontSize: '1.2rem' }}>
                    {theirData?.ready ? (
                      <span style={{ color: '#22c55e', fontSize: '1.5rem' }}>✔</span>
                    ) : (
                      <span style={{ color: '#ef4444', fontSize: '1.5rem' }}>❌</span>
                    )}
                    <span style={{ fontWeight: 'bold' }}>{theirData?.username}</span>
                  </div>
                  
                  {/* 4 item slots */}
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    {[0, 1, 2, 3].map(i => {
                      const item = theirData?.items[i];
                      return (
                        <div key={i} style={{
                          width: '48px', height: '48px', background: '#9ca3af', border: '2px solid #4b5563', borderRadius: '4px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
                        }}>
                          {item && (
                            <>
                              <img src={getItemIcon(item.itemId)} alt={item.itemId} style={{ maxWidth: '38px', maxHeight: '38px', width: 'auto', height: 'auto', objectFit: 'contain', imageRendering: 'pixelated' }} />
                              <span style={{ position: 'absolute', bottom: 0, right: 2, color: 'white', fontSize: '12px', textShadow: '1px 1px 0 #000', fontWeight: 'bold' }}>{item.quantity}</span>
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Xu input (read only) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginTop: '10px' }}>
                    <input 
                      type="text" 
                      value={theirData?.xu || ''} 
                      readOnly
                      style={{ width: '80px', padding: '6px', border: '2px solid #000', outline: 'none', background: '#e5e7eb' }}
                      placeholder="Số xu"
                    />
                  </div>
                </div>
              </div>
              
              {/* ACTION BUTTON */}
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center' }}>
                <button 
                  onClick={handleReady}
                  style={{
                    background: myData?.ready ? '#f59e0b' : '#22c55e',
                    color: 'white', border: '4px solid #000', borderRadius: '8px',
                    padding: '12px 40px', fontSize: '1.5rem', fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 4px 0 #000'
                  }}
                >
                  {myData?.ready ? 'Hủy Sẵn Sàng' : 'Đồng ý'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
