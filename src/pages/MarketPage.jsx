import { toast } from '../utils/toast';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import PixelCanvas from '../components/PixelCanvas';

import tree1Img from '../../assets/tree1.png';
import tree2Img from '../../assets/tree2.png';
import groundGreenImg from '../../assets/ground-green.png';
import stallImgAsset from '../../assets/cho-nong-san.png';
import animalShopImgAsset from '../../assets/cuahang_dongvat.png';
import marketIcon from '../../assets/market.png';
import transactionIcon from '../../assets/transaction.png';
import coinIcon from '../../assets/coin-tl4.2.png';
import bagIcon from '../../assets/bag.png';
import cowMove1 from '../../assets/animals/cow/cow_move_01.png';
import whiskIcon from '../../assets/whisk.png';

import BackpackModal from '../components/BackpackModal';
import TradeModal from '../components/TradeModal';
import { useGameWindowSize } from '../hooks/useGameWindowSize';
import LandscapeEnforcer from '../components/LandscapeEnforcer';

const characterImages = import.meta.glob('../../assets/character/**/*.png', { eager: true, import: 'default' });

const CHARACTER_PRELOADS = {
  FrogNinja: {
    idle: [],
    run: [],
    jump: null,
    fall: null,
  }
};

// Pre-load FrogNinja images
for (let i = 1; i <= 11; i++) {
  const img = new Image();
  img.src = characterImages[`../../assets/character/FrogNinja/idle (${i}).png`] || '';
  CHARACTER_PRELOADS.FrogNinja.idle.push(img);
}
for (let i = 1; i <= 12; i++) {
  const img = new Image();
  img.src = characterImages[`../../assets/character/FrogNinja/run (${i}).png`] || '';
  CHARACTER_PRELOADS.FrogNinja.run.push(img);
}
CHARACTER_PRELOADS.FrogNinja.jump = new Image();
CHARACTER_PRELOADS.FrogNinja.jump.src = characterImages[`../../assets/character/FrogNinja/Jump (32x32).png`] || '';
CHARACTER_PRELOADS.FrogNinja.fall = new Image();
CHARACTER_PRELOADS.FrogNinja.fall.src = characterImages[`../../assets/character/FrogNinja/Fall (32x32).png`] || '';

export default function MarketPage() {
  const navigate = useNavigate();
  const { authFetch, user, refreshUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [market, setMarket] = useState(null);
  const [storageRiceQty, setStorageRiceQty] = useState(0);
  const backpackRiceQty = user?.backpack?.reduce((sum, slot) => sum + (slot && slot.item_id === 'lua' ? slot.quantity : 0), 0) || 0;
  const riceQty = storageRiceQty + backpackRiceQty;
  const [showMarketMenu, setShowMarketMenu] = useState(false);
  const [showAnimalMenu, setShowAnimalMenu] = useState(false);
  const [sellInput, setSellInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showBackpackMenu, setShowBackpackMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('animals');
  const [buyStrawQty, setBuyStrawQty] = useState(1);
  const [marketMessage, setMarketMessage] = useState('');
  const { width: gameWidth, height: gameHeight } = useGameWindowSize();

  const canvasRef = useRef(null);
  const keys = useRef({ left: false, right: false, jump: false });
  const socketRef = useRef(null);
  const otherPlayersRef = useRef({});
  const closestPlayerRef = useRef(null);

  const gameState = useRef({
    player: {
      x: 50,
      y: 0,
      vy: 0,
      isGrounded: true,
      width: 32,
      height: 48,
      facing: 1,
      isMoving: false,
      displayName: user?.displayName || user?.username,
      characterType: user?.characterType || 'FrogNinja'
    },
    stall: {
      x: 350,
      width: 200,
      height: 150
    },
    animalShop: {
      x: 1000,
      width: 200,
      height: 150
    },
    cameraX: 0,
    bgImg: null,
    groundImg: null,
    tree1Img: null,
    tree2Img: null,
    stallImg: null,
    imgAnimalShop: null
  });

  const [canInteract, setCanInteract] = useState(false);
  const [canInteractAnimal, setCanInteractAnimal] = useState(false);
  const [closestPlayer, setClosestPlayer] = useState(null);
  const [showTradeMenu, setShowTradeMenu] = useState(null); // stores targetUsername
  const [pendingTradeRequest, setPendingTradeRequest] = useState(null);

  useEffect(() => {
    const state = gameState.current;

    const imgG = new Image(); imgG.src = groundGreenImg; imgG.onload = () => { state.groundImg = imgG; };
    const imgT1 = new Image(); imgT1.src = tree1Img; imgT1.onload = () => { state.tree1Img = imgT1; };
    const imgT2 = new Image(); imgT2.src = tree2Img; imgT2.onload = () => { state.tree2Img = imgT2; };
    const stallImage = new Image(); stallImage.src = stallImgAsset; stallImage.onload = () => { state.stallImg = stallImage; };
    const imgAnimal = new Image(); imgAnimal.src = animalShopImgAsset; imgAnimal.onload = () => { state.imgAnimalShop = imgAnimal; };
  }, []);

  const fetchMarket = async () => {
    try {
      const res = await authFetch('/api/market');
      if (res.ok) {
        const data = await res.json();
        setMarket(data.market);
        setTimeRemaining(data.market.timeRemainingMs);
      }
      const pRes = await authFetch('/api/farm');
      if (pRes.ok) {
        const pData = await pRes.json();
        const lua = pData.inventory?.find(i => i.item_id === 'lua');
        setStorageRiceQty(lua ? lua.quantity : 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMarket(); }, [authFetch]);

  useEffect(() => {
    if (timeRemaining > 0) {
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1000) {
            fetchMarket();
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timeRemaining]);

  useEffect(() => {
    if (!user) return;
    
    socketRef.current = io(import.meta.env.VITE_API_URL || window.location.origin.replace('5173', '3001'), {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      timeout: 60000,
      transports: ['websocket', 'polling']
    });
    
    socketRef.current.emit('join_house', { 
      hostUsername: 'market', 
      player: { 
        ...gameState.current.player, 
        username: user?.username, 
        displayName: user ? (user.displayName || user.username) : 'Player',
        characterType: user?.characterType || 'FrogNinja'
      }
    });
    socketRef.current.on('current_players', (players) => {
      otherPlayersRef.current = players;
    });

    socketRef.current.on('player_joined', ({ id, player }) => {
      otherPlayersRef.current[id] = player;
    });

    socketRef.current.on('player_moved', ({ id, state }) => {
      if (otherPlayersRef.current[id]) {
        otherPlayersRef.current[id] = { ...otherPlayersRef.current[id], ...state };
      }
    });

    socketRef.current.on('player_left', (id) => {
      delete otherPlayersRef.current[id];
    });

    socketRef.current.on('trade_requested', ({ from }) => {
      setPendingTradeRequest(from);
    });

    socketRef.current.on('trade_request_cancelled', ({ from }) => {
      setPendingTradeRequest(prev => prev === from ? null : prev);
    });

    socketRef.current.on('trade_error', (err) => {
      toast.error(err);
    });

    return () => socketRef.current.disconnect();
  }, [user]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.current.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.current.right = true;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') keys.current.jump = true;
      if (e.code === 'KeyF') {
        if (canInteract && !showMarketMenu) {
          setShowMarketMenu(true);
          setSellInput(riceQty.toString());
        } else if (canInteractAnimal && !showAnimalMenu) {
          setShowAnimalMenu(true);
        } else if (closestPlayerRef.current) {
          setShowTradeMenu({ username: closestPlayerRef.current, isAccepting: false });
        }
      }
    };
    const handleKeyUp = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.current.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.current.right = false;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') keys.current.jump = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [canInteract, canInteractAnimal, showMarketMenu, showAnimalMenu, riceQty, user?.username]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rafId;
    let lastTime = performance.now();
    let lastEmitTime = 0;

    const loop = (time) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      const state = gameState.current;
      canvas.width = gameWidth;
      canvas.height = gameHeight;

      const speed = 250;
      const gravity = 2000;
      const jumpPower = -600;

      let isMoving = false;
      if (!showMarketMenu && !showAnimalMenu) {
        if (keys.current.left) { state.player.x -= speed * dt; state.player.facing = -1; isMoving = true; }
        if (keys.current.right) { state.player.x += speed * dt; state.player.facing = 1; isMoving = true; }
        if (keys.current.jump && state.player.isGrounded) { state.player.vy = jumpPower; state.player.isGrounded = false; }
      }

      state.player.vy += gravity * dt;
      state.player.y += state.player.vy * dt;

      if (state.player.y > 0) { state.player.y = 0; state.player.vy = 0; state.player.isGrounded = true; }
      const worldWidth = 1500;
      state.player.x = Math.max(0, Math.min(worldWidth - state.player.width, state.player.x));
      
      state.cameraX = state.player.x - canvas.width / 2 + state.player.width / 2;
      if (state.cameraX < 0) state.cameraX = 0;
      if (state.cameraX > worldWidth - canvas.width) state.cameraX = Math.max(0, worldWidth - canvas.width);

      if (socketRef.current && (time - lastEmitTime > 50)) {
        lastEmitTime = time;
        socketRef.current.emit('player_move', {
          x: state.player.x,
          y: state.player.y,
          vy: state.player.vy,
          isGrounded: state.player.isGrounded,
          facing: state.player.facing,
          width: state.player.width,
          height: state.player.height,
          isMoving,
          username: user?.username,
          displayName: user ? (user.displayName || user.username) : 'Player',
          characterType: user?.characterType || 'FrogNinja'
        });
      }

      const centerPlayer = state.player.x + state.player.width / 2;
      const centerStall = state.stall.x + state.stall.width / 2;
      const inRange = Math.abs(centerPlayer - centerStall) < 150;
      
      const centerAnimal = state.animalShop.x + state.animalShop.width / 2;
      const inRangeAnimal = Math.abs(centerPlayer - centerAnimal) < 150;
      
      let closestPlayer = null;
      let minDist = 50;
      if (otherPlayersRef.current) {
        Object.values(otherPlayersRef.current).forEach(op => {
          if (!op.username || op.username === user?.username) return;
          const pDist = Math.abs((state.player.x + state.player.width/2) - (op.x + op.width/2));
          if (pDist < minDist) { minDist = pDist; closestPlayer = op.username; }
        });
      }
      closestPlayerRef.current = closestPlayer;
      setClosestPlayer(prev => prev !== closestPlayer ? closestPlayer : prev);

      setCanInteract((prev) => prev !== inRange ? inRange : prev);
      setCanInteractAnimal((prev) => prev !== inRangeAnimal ? inRangeAnimal : prev);
      
      if (!inRange && showMarketMenu) setShowMarketMenu(false);
      if (!inRangeAnimal && showAnimalMenu) setShowAnimalMenu(false);

      ctx.save();
      ctx.translate(-state.cameraX, 0);

      const groundY = canvas.height - 100;
      if (state.tree1Img && state.tree1Img.complete) {
        const h1 = 180;
        const w1 = state.tree1Img.width * (h1 / state.tree1Img.height);
        ctx.drawImage(state.tree1Img, 125 - w1/2, groundY - h1, w1, h1);
      }
      if (state.tree2Img && state.tree2Img.complete) {
        const h2 = 220;
        const w2 = state.tree2Img.width * (h2 / state.tree2Img.height);
        ctx.drawImage(state.tree2Img, worldWidth - 200 - w2/2, groundY - h2, w2, h2);
      }

      if (state.stallImg && state.stallImg.complete) {
        const stallHeight = 150;
        const stallWidth = state.stallImg.width * (stallHeight / state.stallImg.height);
        const stallX = state.stall.x + state.stall.width/2 - stallWidth/2;
        ctx.drawImage(state.stallImg, stallX, groundY - stallHeight, stallWidth, stallHeight);
      }
      
      if (state.imgAnimalShop && state.imgAnimalShop.complete) {
        const h = 150;
        const w = state.imgAnimalShop.width * (h / state.imgAnimalShop.height);
        const ax = state.animalShop.x + state.animalShop.width/2 - w/2;
        ctx.drawImage(state.imgAnimalShop, ax, groundY - h, w, h);
      }

      if (state.groundImg && state.groundImg.complete) {
        const ih = state.groundImg.height;
        const pattern = ctx.createPattern(state.groundImg, 'repeat-x');
        ctx.fillStyle = pattern;
        ctx.save();
        ctx.translate(0, groundY);
        ctx.fillRect(0, 0, worldWidth, ih);
        ctx.restore();
        ctx.fillStyle = '#5c3a21';
        ctx.fillRect(0, groundY + ih, worldWidth, 1000);
      } else {
        ctx.fillStyle = '#65a30d'; ctx.fillRect(0, groundY, worldWidth, 20);
        ctx.fillStyle = '#5c3a21'; ctx.fillRect(0, groundY + 20, worldWidth, 1000);
      }

      if (inRange && !showMarketMenu) {
        const bounce = Math.sin(time / 150) * 5;
        ctx.fillStyle = '#facc15'; ctx.font = '24px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('▼', state.stall.x + state.stall.width/2, groundY - state.stall.height - 20 + bounce);
      } else if (inRangeAnimal && !showAnimalMenu) {
        const bounce = Math.sin(time / 150) * 5;
        ctx.fillStyle = '#facc15'; ctx.font = '24px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('▼', state.animalShop.x + state.animalShop.width/2, groundY - state.animalShop.height - 20 + bounce);
      }

      const drawCharacter = (pState, isMe) => {
        const px = pState.x;
        const py = groundY - pState.height + pState.y;
        
        ctx.save();
        ctx.translate(px + pState.width/2, py);
        ctx.scale(pState.facing, 1);
        
        let currentImg = null;
        const charType = pState.characterType || (isMe ? user?.characterType : null) || 'FrogNinja';
        const preloads = CHARACTER_PRELOADS[charType] || CHARACTER_PRELOADS.FrogNinja;

        if (!pState.isGrounded) {
          if (pState.vy < 0) {
            currentImg = preloads.jump;
          } else {
            currentImg = preloads.fall;
          }
        } else if (pState.isMoving && preloads.run && preloads.run.length > 0) {
          const frameIndex = Math.floor(time / 66) % preloads.run.length;
          currentImg = preloads.run[frameIndex];
        } else if (!pState.isMoving && preloads.idle && preloads.idle.length > 0) {
          const frameIndex = Math.floor(time / 66) % preloads.idle.length;
          currentImg = preloads.idle[frameIndex];
        }
        
        if (currentImg && currentImg.complete && currentImg.width > 0) {
          const w = currentImg.width * 1.5;
          const h = currentImg.height * 1.5;
          ctx.drawImage(currentImg, -w/2, pState.height - h, w, h);
        } else {
          ctx.fillStyle = 'red';
          ctx.fillRect(-16, pState.height - 32, 32, 32);
        }
        ctx.restore();

        const dName = pState.displayName || 'Player';
        ctx.fillStyle = isMe ? '#4ade80' : 'white';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.strokeText(dName, px + pState.width/2, py - 40);
        ctx.fillText(dName, px + pState.width/2, py - 40);
      };

      if (otherPlayersRef.current) {
        const drawnUsernames = new Set();
        Object.values(otherPlayersRef.current).forEach(op => {
          if (!op.username || op.username === user?.username) return;
          if (drawnUsernames.has(op.username)) return;
          drawnUsernames.add(op.username);
          drawCharacter(op, false);
        });
      }

      drawCharacter({
        ...state.player,
        isMoving,
        displayName: user ? (user.displayName || user.username) : 'Player',
        username: user?.username,
        characterType: user?.characterType || 'FrogNinja'
      }, true);
      
      ctx.restore();

      if (loading) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '16px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ĐANG TẢI CHỢ...', canvas.width/2, canvas.height/2);
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [market, showMarketMenu, showAnimalMenu, user, loading]);

  const handleSell = async () => {
    setActionLoading(true);
    try {
      const res = await authFetch(`/api/market/sell`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: sellInput })
      });
      const data = await res.json();
      if (!res.ok) toast.error(data.error || 'Lỗi');
      else {
        await refreshUser();
        await fetchMarket();
        toast.success(`Bán thành công! Nhận được ${data.earned} Xu.`);
        setShowMarketMenu(false);
      }
    } catch (e) {
      toast.error('Lỗi kết nối');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBuyCow = async () => {
    setActionLoading(true);
    try {
      const res = await authFetch('/api/market/buy-animal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animal: 'cow' })
      });
      const data = await res.json();
      if (!res.ok) setMarketMessage(data.error || 'Lỗi');
      else {
        await refreshUser();
        setMarketMessage('Mua thành công! Vật nuôi đã được thêm vào Balo.');
      }
    } catch (e) {
      console.error(e);
      setMarketMessage('Lỗi kết nối');
    } finally {
      setActionLoading(false);
      setTimeout(() => setMarketMessage(''), 3000);
    }
  };

  const handleBuyStraw = async () => {
    setActionLoading(true);
    const qty = parseInt(buyStrawQty) || 1;
    try {
      const res = await authFetch('/api/market/buy-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: 'rom', quantity: qty })
      });
      const data = await res.json();
      if (!res.ok) setMarketMessage(data.error || 'Lỗi');
      else {
        await refreshUser();
        setMarketMessage(`Mua thành công ${qty} Rơm!`);
      }
    } catch (e) {
      console.error(e);
      setMarketMessage('Lỗi kết nối');
    } finally {
      setActionLoading(false);
      setTimeout(() => setMarketMessage(''), 3000);
    }
  };

  const formatTime = (ms) => {
    const totalSecs = Math.floor(ms / 1000);
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <LandscapeEnforcer>
      <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
      <PixelCanvas />
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', position: 'relative', zIndex: 1 }} />

      <div style={{ position: 'absolute', top: '20px', left: '20px', fontFamily: 'var(--font-pixel)', color: 'white', textShadow: '2px 2px 0 #000', pointerEvents: 'none' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--px-amber)' }}>Chợ Nông Sản</h2>
        <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem' }}>Dùng [◄] [►] để di chuyển</p>
      </div>

      <button 
        onClick={() => navigate('/')}
        className="pixel-btn"
        style={{ position: 'absolute', top: '20px', right: '20px', padding: '10px 16px', fontSize: '1rem', background: '#dc2626', color: 'white', border: '4px solid var(--px-border)', zIndex: 10 }}>
        [ THOÁT ]
      </button>

      {/* Coin Display */}
      <div style={{ position: 'absolute', top: '20px', right: '250px', padding: '6px 16px', background: 'white', border: '4px solid #f59e0b', borderRadius: '0', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 10, fontFamily: 'var(--font-pixel)', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
        <img src={coinIcon} alt="Xu" style={{ width: '28px', height: '28px', imageRendering: 'pixelated' }} />
        <span style={{ fontSize: '1.2rem', color: '#d97706', fontWeight: 'bold', textShadow: '1px 1px 0 #fff' }}>{user?.xu?.toLocaleString() || 0}</span>
      </div>

      <button onClick={() => setShowBackpackMenu(true)} className="pixel-btn" style={{ position: 'absolute', top: '20px', right: '140px', padding: '10px', background: '#eab308', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 10 }}>
        <img src={bagIcon} alt="Balo" style={{ width: '24px', height: '24px', imageRendering: 'pixelated' }} />
        <span>Balo</span>
      </button>

      <div style={{ position: 'absolute', bottom: '20px', left: '20px', display: 'flex', gap: '16px', zIndex: 10 }}>
        <button 
          onPointerDown={(e) => { e.preventDefault(); keys.current.left = true; }}
          onPointerUp={(e) => { e.preventDefault(); keys.current.left = false; }}
          onPointerLeave={() => keys.current.left = false}
          onContextMenu={(e) => e.preventDefault()}
          className="pixel-btn" 
          style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', background: 'rgba(0,0,0,0.5)', border: '4px solid var(--px-border)', color: 'white', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}>
          ◄
        </button>
        <button 
          onPointerDown={(e) => { e.preventDefault(); keys.current.right = true; }}
          onPointerUp={(e) => { e.preventDefault(); keys.current.right = false; }}
          onPointerLeave={() => keys.current.right = false}
          onContextMenu={(e) => e.preventDefault()}
          className="pixel-btn" 
          style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', background: 'rgba(0,0,0,0.5)', border: '4px solid var(--px-border)', color: 'white', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}>
          ►
        </button>
      </div>

      <div style={{ position: 'absolute', bottom: '20px', right: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', zIndex: 20 }}>
        <button 
          onPointerDown={(e) => { e.preventDefault(); keys.current.jump = true; }}
          onPointerUp={(e) => { e.preventDefault(); keys.current.jump = false; }}
          onPointerLeave={() => keys.current.jump = false}
          onContextMenu={(e) => e.preventDefault()}
          className="pixel-btn" 
          style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', background: 'rgba(0,0,0,0.5)', border: '4px solid var(--px-border)', color: 'white', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}>
          ▲
        </button>
        {!showMarketMenu && !showAnimalMenu && (
          <button 
            onClick={() => {
              if (canInteract) {
                setShowMarketMenu(true);
                setSellInput(riceQty.toString());
              } else if (canInteractAnimal) {
                setShowAnimalMenu(true);
              } else if (closestPlayerRef.current) {
                setShowTradeMenu({ username: closestPlayerRef.current, isAccepting: false });
              }
            }}
            className="pixel-btn"
            style={{ 
              width: '68px', height: '68px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgb(59, 130, 246)', 
              border: '4px solid #1e3a8a', padding: '0',
              boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
              touchAction: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              WebkitTouchCallout: 'none',
              animation: (canInteract || canInteractAnimal || closestPlayer) ? 'pulse 1s infinite' : 'none'
            }}>
            {canInteract ? (
              <img src={marketIcon} alt="Giao Dịch" style={{ width: '40px', height: '40px', imageRendering: 'pixelated', display: 'block' }} />
            ) : canInteractAnimal ? (
              <img src={marketIcon} alt="Động Vật" style={{ width: '40px', height: '40px', imageRendering: 'pixelated', display: 'block', filter: 'hue-rotate(180deg)' }} />
            ) : closestPlayer ? (
              <img src={transactionIcon} alt="Giao Dịch" style={{ width: '36px', height: '36px', imageRendering: 'pixelated' }} />
            ) : null}
          </button>
        )}
      </div>

      {showAnimalMenu && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="rpg-box" style={{ background: '#fffbeb', width: '380px', padding: '20px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>Cửa Hàng Động Vật</h2>
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <button onClick={() => setActiveTab('animals')} style={{flex: 1, background: activeTab === 'animals' ? '#3b82f6' : '#94a3b8', color: 'white', padding: '10px'}} className="pixel-btn">ĐỘNG VẬT</button>
              <button onClick={() => setActiveTab('food')} style={{flex: 1, background: activeTab === 'food' ? '#3b82f6' : '#94a3b8', color: 'white', padding: '10px'}} className="pixel-btn">THỨC ĂN</button>
            </div>
            
            {marketMessage && (
              <div style={{ padding: '10px', marginBottom: '15px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', borderRadius: '4px', fontSize: '14px' }}>
                {marketMessage}
              </div>
            )}
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' }}>
              {activeTab === 'animals' && (
                <div style={{ background: '#e2e8f0', padding: '10px', border: '2px solid #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img src={cowMove1} alt="Cow" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                  <strong style={{ fontSize: '14px', marginTop: '10px' }}>Bò - 200 Xu</strong>
                  <button className="pixel-btn" onClick={handleBuyCow} disabled={actionLoading} style={{ background: '#22c55e', color: 'white', padding: '8px', width: '100%', marginTop: '10px' }}>
                    {actionLoading ? '...' : 'Mua'}
                  </button>
                </div>
              )}
              {activeTab === 'food' && (
                <div style={{ background: '#e2e8f0', padding: '10px', border: '2px solid #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img src={whiskIcon} alt="Rom" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                  <strong style={{ fontSize: '14px', marginTop: '10px' }}>Rơm - 10 Xu/bó</strong>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px', gap: '5px', width: '100%' }}>
                    <input 
                      type="number" 
                      value={buyStrawQty} 
                      onChange={e => setBuyStrawQty(e.target.value)} 
                      min="1" 
                      style={{ width: '100%', padding: '5px', textAlign: 'center', border: '1px solid #94a3b8' }} 
                    />
                  </div>
                  <button className="pixel-btn" onClick={handleBuyStraw} disabled={actionLoading} style={{ background: '#eab308', color: 'white', padding: '8px', width: '100%', marginTop: '10px' }}>
                    {actionLoading ? '...' : `Mua (${(parseInt(buyStrawQty) || 1) * 10} Xu)`}
                  </button>
                </div>
              )}
            </div>

            <button className="pixel-btn" onClick={() => setShowAnimalMenu(false)} style={{ background: '#64748b', color: 'white', padding: '10px', width: '100%' }}>
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {showMarketMenu && market && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="rpg-box fade-in" style={{ width: '90%', maxWidth: '400px', background: 'white' }}>
            <div className="px-titlebar" style={{ background: 'var(--px-green)' }}>◄ THƯƠNG NHÂN ►</div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--px-text)', fontFamily: 'var(--font-pixel)' }}>
                Giá lúa hiện tại: <span style={{ color: 'var(--px-amber)', fontSize: '1.2rem' }}>{market.price} Xu</span> / 1 Lúa
              </div>
              <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--px-text-mid)' }}>
                Đổi giá sau: {formatTime(timeRemaining)}
              </div>

              <div style={{ background: 'var(--px-bg2)', padding: '12px', border: '2px solid var(--px-border)' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem' }}>Kho của bạn: <strong>{riceQty} Lúa</strong></p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type="number" 
                    value={sellInput} 
                    onChange={e => setSellInput(e.target.value)}
                    style={{ flex: 1, padding: '8px', fontSize: '1rem', fontFamily: 'var(--font-pixel)', border: '2px solid var(--px-border)' }}
                    min="1" max={riceQty}
                  />
                  <button 
                    onClick={() => setSellInput(riceQty.toString())}
                    className="pixel-btn" 
                    style={{ background: 'var(--px-amber)', border: '2px solid var(--px-border)', padding: '0 12px' }}>
                    TẤT CẢ
                  </button>
                </div>
                <div style={{ marginTop: '12px', textAlign: 'right', fontSize: '0.9rem', color: 'var(--px-green-dark)' }}>
                  Thu về: <strong>{parseInt(sellInput || 0) * market.price} Xu</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => setShowMarketMenu(false)}
                  className="pixel-btn" style={{ flex: 1, padding: '12px', background: '#e5e7eb', border: '2px solid var(--px-border)' }}>
                  [ HUỶ ]
                </button>
                <button 
                  disabled={actionLoading || riceQty === 0 || parseInt(sellInput) <= 0 || parseInt(sellInput) > riceQty}
                  onClick={handleSell}
                  className="pixel-btn" style={{ flex: 1, padding: '12px', background: 'var(--px-green)', border: '2px solid var(--px-border)', opacity: (riceQty === 0 || parseInt(sellInput) <= 0) ? 0.5 : 1 }}>
                  {actionLoading ? '...' : '[ BÁN LÚA ]'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {showBackpackMenu && <BackpackModal onClose={() => setShowBackpackMenu(false)} onOpenStorage={() => toast.error('Về nông trại để mở Kho!')} />}
      {showTradeMenu && (
        <TradeModal 
          targetUsername={showTradeMenu.username} 
          onClose={() => setShowTradeMenu(null)} 
          socket={socketRef.current}
          isAccepting={showTradeMenu.isAccepting || false}
        />
      )}

      {pendingTradeRequest && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: '#1e293b', border: '4px solid var(--px-border)', borderRadius: '8px',
          padding: '20px', zIndex: 1000, color: 'white', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.8)'
        }}>
          <h2 style={{ color: '#facc15', marginBottom: '16px' }}>YÊU CẦU GIAO DỊCH</h2>
          <p style={{ marginBottom: '20px' }}><strong>{pendingTradeRequest}</strong> muốn giao dịch với bạn.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => {
              if (socketRef.current) socketRef.current.emit('trade_accept', { fromUsername: pendingTradeRequest });
              setShowTradeMenu({ username: pendingTradeRequest, isAccepting: true });
              setPendingTradeRequest(null);
            }}>Đồng ý</button>
            <button className="btn btn-outline" onClick={() => {
              if (socketRef.current) socketRef.current.emit('trade_decline', { fromUsername: pendingTradeRequest });
              setPendingTradeRequest(null);
            }}>Từ chối</button>
          </div>
        </div>
      )}
      </div>
    </LandscapeEnforcer>
  );
}
