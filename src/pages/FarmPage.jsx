import { toast } from '../utils/toast';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PixelCanvas from '../components/PixelCanvas';
import BottomNav from '../components/BottomNav';
import styles from './FarmPage.module.css';
import luaNonImg from '../../assets/lua-non.png';
import luaChinImg from '../../assets/lua-chin.png';
import farmBg from '../../assets/farm-bg.png';
import bagIcon from '../../assets/bag.png';

import StorageModal from '../components/StorageModal';
import BackpackModal from '../components/BackpackModal';
import LandscapeEnforcer from '../components/LandscapeEnforcer';

export default function FarmPage() {
  const { authFetch, updateXu } = useAuth();
  
  const [farm, setFarm] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [xu, setXu] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [now, setNow] = useState(new Date());
  const [showInv, setShowInv] = useState(false);
  const [showBackpackMenu, setShowBackpackMenu] = useState(false);
  const [invSlots, setInvSlots] = useState(5);

  // Timer for growing
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const loadFarm = async () => {
    try {
      const res = await authFetch('/api/farm');
      if (res.ok) {
        const data = await res.json();
        setFarm(data.farm);
        setInventory(data.inventory);
        setXu(data.xu);
        setInvSlots(data.inventory_slots || 5);
        if (updateXu) updateXu(data.xu); // sync global context if exists
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarm();
  }, [authFetch]);

  // Auto-refresh when growing finishes
  useEffect(() => {
    if (farm && farm.state === 'growing' && farm.planted_at) {
      const planted = new Date(farm.planted_at + 'Z');
      const diff = (now - planted) / 1000;
      if (diff >= 30) {
        loadFarm();
      }
    }
  }, [now, farm]);

  const handleAction = async (endpoint) => {
    setActionLoading(true);
    try {
      const res = await authFetch(`/api/farm/${endpoint}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Có lỗi xảy ra');
      } else {
        await loadFarm();
      }
    } catch (e) {
      toast.error('Lỗi kết nối');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className={styles.page}><PixelCanvas /><div style={{ color: 'white', padding: '20px' }}>ĐANG TẢI...</div></div>;

  let timeLeft = 0;
  if (farm && farm.state === 'growing' && farm.planted_at) {
    const planted = new Date(farm.planted_at + 'Z');
    timeLeft = Math.max(0, 30 - Math.floor((now - planted) / 1000));
  }

  const isLocked = !farm || farm.level === 0;
  
  // Render grid
  const cells = [];
  for (let i = 0; i < 16; i++) {
    let cellClass = styles.farmCellLocked;
    let icon = '';
    
    if (!isLocked) {
      if (farm.state === 'ready') {
        cellClass = styles.plantReady;
        icon = <img src={luaChinImg} alt="Chín" style={{ width: '80%', height: '80%', objectFit: 'contain', imageRendering: 'pixelated' }} />;
      }
      else if (farm.state === 'growing') {
        cellClass = styles.plantGrowing;
        icon = <img src={luaNonImg} alt="Mầm" style={{ width: '80%', height: '80%', objectFit: 'contain', imageRendering: 'pixelated' }} />;
      }
      else {
        cellClass = styles.plantIdle;
        // no icon for empty soil
      }
    } else {
      icon = <span style={{ fontSize: '1.5rem' }}>✖️</span>;
    }
    
    cells.push(
      <div key={i} className={`${styles.farmCell} ${cellClass}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
    );
  }

  const totalLua = inventory.find(i => i.item_id === 'lua')?.quantity || 0;

  return (
    <LandscapeEnforcer>
      <div className={styles.page} style={{ backgroundImage: `url(${farmBg})`, backgroundSize: 'cover', backgroundPosition: 'center top', width: '100%', height: '100%', overflowY: 'auto' }}>
      <main className={styles.main}>
        <header className={`${styles.header} rpg-box fade-in`}>
          <div>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.2rem' }}>🌾 NÔNG TRẠI</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--px-amber)', marginTop: '4px' }}>XU: {xu.toLocaleString()}</div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-outline" onClick={() => setShowBackpackMenu(true)} style={{ padding: '8px 16px', background: '#eab308', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src={bagIcon} alt="Balo" style={{ width: '16px', height: '16px', imageRendering: 'pixelated' }} />
              <span>BALO</span>
            </button>
            <button className="btn btn-outline" onClick={() => setShowInv(true)} style={{ padding: '8px 16px' }}>
              KHO ({inventory.reduce((sum, item) => sum + item.quantity, 0)}/{invSlots * 64})
            </button>
          </div>
        </header>

        <div style={{ flexGrow: 1, position: 'relative' }}>
          {/* Right aligned farm patch */}
          <div style={{ position: 'absolute', top: '20px', right: '0' }}>
            <div className={styles.farmGrid}>
              {cells}
            </div>
          </div>
        </div>

        <div className={`${styles.actionBox} rpg-box fade-in fade-in-delay-1`}>
          <div className="px-titlebar">
            <span>◄ KHU VỰC TRỒNG TRỌT ►</span>
            {!isLocked && <span>LV. {farm.level}</span>}
          </div>

          <div className={styles.statusBar}>
            {isLocked && "Ruộng đang bỏ hoang. Cần mua để trồng trọt."}
            {!isLocked && farm.state === 'idle' && `Sẵn sàng gieo hạt. (Sản lượng: ${farm.yield} Lúa)`}
            {!isLocked && farm.state === 'growing' && (
              <span>Đang chờ lúa lớn... <span className={styles.timer}>{timeLeft}s</span></span>
            )}
            {!isLocked && farm.state === 'ready' && "Lúa đã chín! Mau thu hoạch nào!"}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {isLocked && (
              <button className={`btn btn-primary ${styles.actionBtn}`} onClick={() => handleAction('buy')} disabled={actionLoading}>
                {actionLoading ? 'ĐANG MUA...' : '[ MUA RUỘNG - 100 XU ]'}
              </button>
            )}

            {!isLocked && farm.state === 'idle' && (
              <button className={`btn btn-primary ${styles.actionBtn}`} onClick={() => handleAction('plant')} disabled={actionLoading}>
                {actionLoading ? 'ĐANG GIEO...' : '[ GIEO HẠT - 10 XU ]'}
              </button>
            )}

            {!isLocked && farm.state === 'growing' && (
              <button className={`btn btn-outline ${styles.actionBtn}`} disabled>
                [ ĐANG TRỒNG... ]
              </button>
            )}

            {!isLocked && farm.state === 'ready' && (
              <button className={`btn btn-primary ${styles.actionBtn}`} onClick={() => handleAction('harvest')} disabled={actionLoading} style={{ background: '#e6c229', color: '#000' }}>
                {actionLoading ? 'ĐANG THU HOẠCH...' : `[ THU HOẠCH +${farm.yield} LÚA ]`}
              </button>
            )}

            {!isLocked && farm.level < farm.maxLevel && (
              <button className={`btn btn-outline ${styles.actionBtn}`} onClick={() => handleAction('upgrade')} disabled={actionLoading || farm.state !== 'idle'}>
                {actionLoading ? 'ĐANG NÂNG CẤP...' : `[ NÂNG CẤP LV.${farm.level + 1} - ${farm.upgradeCost} XU ]`}
              </button>
            )}
            {!isLocked && farm.level >= farm.maxLevel && (
              <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--px-amber)' }}>Ruộng đã đạt cấp tối đa!</div>
            )}
          </div>
        </div>
      </main>

      {/* Storage and Backpack Modals */}
      {showInv && <StorageModal onClose={() => setShowInv(false)} />}
      {showBackpackMenu && <BackpackModal onClose={() => setShowBackpackMenu(false)} onOpenStorage={() => { setShowBackpackMenu(false); setShowInv(true); }} />}

        <BottomNav />
      </div>
    </LandscapeEnforcer>
  );
}
