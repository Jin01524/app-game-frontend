import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../utils/toast';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import PixelCanvas from '../components/PixelCanvas';
import BackpackModal from '../components/BackpackModal';
import TradeModal from '../components/TradeModal';
import {
  BackpackHotbar,
  DiscardItemPrompt,
  EnergyBar,
  MOVEMENT_DRAIN_SECONDS,
  SelectedItemActions,
  drawHeldItem,
  drawMovementDrainBar
} from '../components/GameHud';
import TienLenGame from '../components/games/TienLenGame';
import ShurikenGame from '../components/games/ShurikenGame';
import { useGameWindowSize } from '../hooks/useGameWindowSize';
import LandscapeEnforcer from '../components/LandscapeEnforcer';

import groundGreenImg from '../../assets/ground-green.png';
import casinoImgAsset from '../../assets/game_center.png';
import coinIcon from '../../assets/coin-tl4.2.png';
import bagIcon from '../../assets/bag.png';
import transactionIcon from '../../assets/transaction.png';
import gamingIcon from '../../assets/gaming.png';

const characterImages = import.meta.glob('../../assets/character/**/*.png', { eager: true, import: 'default' });

const CHARACTER_PRELOADS = {
  FrogNinja: {
    idle: [],
    run: [],
    jump: null,
    fall: null,
  },
  PinkMan: {
    idle: [],
    run: [],
    jump: null,
    fall: null,
  },
  MaskDude: {
    idle: [],
    run: [],
    jump: null,
    fall: null,
  },
  VirtualGuy: {
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

// Pre-load PinkMan images
for (let i = 1; i <= 11; i++) {
  const img = new Image();
  img.src = characterImages[`../../assets/character/PinkMan/idle (${i}).png`] || '';
  CHARACTER_PRELOADS.PinkMan.idle.push(img);
}
for (let i = 1; i <= 12; i++) {
  const img = new Image();
  img.src = characterImages[`../../assets/character/PinkMan/run (${i}).png`] || '';
  CHARACTER_PRELOADS.PinkMan.run.push(img);
}
CHARACTER_PRELOADS.PinkMan.jump = new Image();
CHARACTER_PRELOADS.PinkMan.jump.src = characterImages[`../../assets/character/PinkMan/Jump.png`] || '';
CHARACTER_PRELOADS.PinkMan.fall = new Image();
CHARACTER_PRELOADS.PinkMan.fall.src = characterImages[`../../assets/character/PinkMan/Fall.png`] || '';

// Pre-load MaskDude images
for (let i = 1; i <= 11; i++) {
  const img = new Image();
  img.src = characterImages[`../../assets/character/MaskDude/idle (${i}).png`] || '';
  CHARACTER_PRELOADS.MaskDude.idle.push(img);
}
for (let i = 1; i <= 12; i++) {
  const img = new Image();
  img.src = characterImages[`../../assets/character/MaskDude/run (${i}).png`] || '';
  CHARACTER_PRELOADS.MaskDude.run.push(img);
}
CHARACTER_PRELOADS.MaskDude.jump = new Image();
CHARACTER_PRELOADS.MaskDude.jump.src = characterImages[`../../assets/character/MaskDude/Jump.png`] || '';
CHARACTER_PRELOADS.MaskDude.fall = new Image();
CHARACTER_PRELOADS.MaskDude.fall.src = characterImages[`../../assets/character/MaskDude/Fall.png`] || '';

// Pre-load VirtualGuy images
for (let i = 1; i <= 11; i++) {
  const img = new Image();
  img.src = characterImages[`../../assets/character/VituarlGuy/idle (${i}).png`] || '';
  CHARACTER_PRELOADS.VirtualGuy.idle.push(img);
}
for (let i = 1; i <= 12; i++) {
  const img = new Image();
  img.src = characterImages[`../../assets/character/VituarlGuy/run (${i}).png`] || '';
  CHARACTER_PRELOADS.VirtualGuy.run.push(img);
}
CHARACTER_PRELOADS.VirtualGuy.jump = new Image();
CHARACTER_PRELOADS.VirtualGuy.jump.src = characterImages[`../../assets/character/VituarlGuy/Jump.png`] || '';
CHARACTER_PRELOADS.VirtualGuy.fall = new Image();
CHARACTER_PRELOADS.VirtualGuy.fall.src = characterImages[`../../assets/character/VituarlGuy/Fall.png`] || '';

export default function LobbyPage() {
  const navigate = useNavigate();
  const { user, authFetch, refreshUser, updateBackpack, updateEnergy } = useAuth();
  const { width: gameWidth, height: gameHeight } = useGameWindowSize();
  
  const [showBackpackMenu, setShowBackpackMenu] = useState(false);
  const [showTienLen, setShowTienLen] = useState(false);
  const [showShuriken, setShowShuriken] = useState(false);
  const [closestPlayer, setClosestPlayer] = useState(null);
  const [showTradeMenu, setShowTradeMenu] = useState(null);
  const [pendingTradeRequest, setPendingTradeRequest] = useState(null);
  const [canInteractCasino, setCanInteractCasino] = useState(false);
  const [showCasinoMenu, setShowCasinoMenu] = useState(false);
  const [selectedBackpackSlotIdx, setSelectedBackpackSlotIdx] = useState(null);
  const [discardPrompt, setDiscardPrompt] = useState(null);
  const [discardQtyInput, setDiscardQtyInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [eatCooldown, setEatCooldown] = useState(false);

  const canvasRef = useRef(null);
  const keys = useRef({ left: false, right: false, jump: false });
  const socketRef = useRef(null);
  const otherPlayersRef = useRef({});
  const closestPlayerRef = useRef(null);
  const canInteractCasinoRef = useRef(false);
  const moveTimeAccumulator = useRef(0);
  const selectedBackpackSlotIdxRef = useRef(null);
  const userRef = useRef(user);

  const gameState = useRef({
    player: {
      x: 100,
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
    cameraX: 0,
    groundImg: null,
    casinoImg: null
  });

  const selectedBackpackItem = (
    selectedBackpackSlotIdx !== null &&
    user?.backpack &&
    user.backpack[selectedBackpackSlotIdx] &&
    user.backpack[selectedBackpackSlotIdx].quantity > 0
  ) ? user.backpack[selectedBackpackSlotIdx] : null;
  const isEdible = selectedBackpackItem && ['banh_mi', 'sandwich', 'cheese'].includes(selectedBackpackItem.item_id);
  const isDrinkable = selectedBackpackItem && selectedBackpackItem.item_id === 'milk';
  const canConsume = isEdible || isDrinkable;

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    selectedBackpackSlotIdxRef.current = selectedBackpackSlotIdx;
  }, [selectedBackpackSlotIdx]);

  // Load assets
  useEffect(() => {
    const state = gameState.current;

    const imgG = new Image(); imgG.src = groundGreenImg; imgG.onload = () => { state.groundImg = imgG; };
    const cImg = new Image(); cImg.src = casinoImgAsset; cImg.onload = () => { state.casinoImg = cImg; };
  }, []);

  // Socket
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
      hostUsername: 'lobby', 
      player: { 
        x: gameState.current.player.x, 
        y: gameState.current.player.y, 
        vy: gameState.current.player.vy,
        facing: gameState.current.player.facing, 
        isMoving: gameState.current.player.isMoving,
        isGrounded: gameState.current.player.isGrounded,
        username: user?.username,
        displayName: user.displayName || user.username,
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

    return () => socketRef.current.disconnect();
  }, [user]);

  // Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const state = gameState.current;
    
    let animationFrameId;
    let lastTime = performance.now();
    let frameTimer = 0;
    let currentFrame = 0;
    let lastEmitTime = 0;

    const GRAVITY = 1200;
    const JUMP_POWER = -500;
    const SPEED = 250;
    const GROUND_HEIGHT = 100;
    const BOUNDARY_LEFT = 0;
    const BOUNDARY_RIGHT = 1600;

    const update = (dt, time) => {
      const p = state.player;
      const menuOpen = showCasinoMenu || showTienLen || showShuriken || !!showTradeMenu || !!pendingTradeRequest;
      const canMove = !menuOpen;
      const currentEnergy = userRef.current?.energy !== undefined && userRef.current?.energy !== null ? userRef.current.energy : 6;
      const speed = currentEnergy <= 0 ? 125 : SPEED;
      
      p.isMoving = false;
      const currentlyMoving = ((keys.current.left || keys.current.right) && canMove) || (!p.isGrounded && canMove);
      if (currentlyMoving) {
        moveTimeAccumulator.current += dt;
        if (moveTimeAccumulator.current >= MOVEMENT_DRAIN_SECONDS) {
          moveTimeAccumulator.current = 0;
          if (currentEnergy > 0) {
            updateEnergy(currentEnergy - 1);
            handleDrainEnergy();
          }
        }
      } else {
        moveTimeAccumulator.current = Math.max(0, moveTimeAccumulator.current - dt * 1.5);
      }

      if (canMove && keys.current.left) {
        p.x -= speed * dt;
        p.facing = -1;
        p.isMoving = true;
      }
      if (canMove && keys.current.right) {
        p.x += speed * dt;
        p.facing = 1;
        p.isMoving = true;
      }

      if (canMove && keys.current.jump && p.isGrounded && currentEnergy > 0) {
        p.vy = JUMP_POWER;
        p.isGrounded = false;
      }

      p.vy += GRAVITY * dt;
      p.y += p.vy * dt;

      if (p.y > 0) {
        p.y = 0;
        p.vy = 0;
        p.isGrounded = true;
      }

      if (p.x < BOUNDARY_LEFT) p.x = BOUNDARY_LEFT;
      if (p.x + p.width > BOUNDARY_RIGHT) p.x = BOUNDARY_RIGHT - p.width;

      let targetCamX = p.x + p.width / 2 - canvas.width / 2;
      targetCamX = Math.max(0, Math.min(targetCamX, BOUNDARY_RIGHT - canvas.width));
      state.cameraX += (targetCamX - state.cameraX) * 5 * dt;

      // Casino interaction
      const inRangeCasino = Math.abs((state.player.x + state.player.width/2) - 800) < 150;
      canInteractCasinoRef.current = inRangeCasino;
      setCanInteractCasino(prev => prev !== inRangeCasino ? inRangeCasino : prev);

      let cPlayer = null;
      let minDist = 50;
      if (otherPlayersRef.current) {
        Object.values(otherPlayersRef.current).forEach(op => {
          if (!op.username || op.username === user?.username) return;
          const opWidth = op.width || 32;
          const pDist = Math.abs((state.player.x + state.player.width/2) - (op.x + opWidth/2));
          if (pDist < minDist) { minDist = pDist; cPlayer = op.username; }
        });
      }
      closestPlayerRef.current = cPlayer;
      setClosestPlayer(prev => prev !== cPlayer ? cPlayer : prev);

      frameTimer += dt;
      if (frameTimer > 0.05) {
        currentFrame++;
        frameTimer = 0;
      }

      // Emit movement
      if (socketRef.current && (time - lastEmitTime > 50)) {
        lastEmitTime = time;
        socketRef.current.emit('player_move', {
          x: state.player.x,
          y: state.player.y,
          vy: state.player.vy,
          facing: state.player.facing,
          isMoving: state.player.isMoving,
          isGrounded: state.player.isGrounded,
          width: state.player.width,
          height: state.player.height,
          username: user?.username,
          displayName: user ? (user.displayName || user.username) : 'Player',
          characterType: user?.characterType || 'FrogNinja',
          heldItemId: selectedBackpackSlotIdx !== null && user?.backpack?.[selectedBackpackSlotIdx] ? user.backpack[selectedBackpackSlotIdx].item_id : null
        });
      }
    };

    const draw = (time) => {
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(-Math.floor(state.cameraX), 0);

      // Draw Casino
      if (state.casinoImg) {
        // height: 200px
        const aspect = state.casinoImg.width / state.casinoImg.height;
        const w = 200 * aspect;
        ctx.drawImage(state.casinoImg, 800 - w / 2, canvas.height - GROUND_HEIGHT - 200 + 10, w, 200);

        if (canInteractCasinoRef.current) {
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          const arrowY = canvas.height - GROUND_HEIGHT - 200 - 30 + Math.sin(time / 150) * 10;
          ctx.moveTo(800, arrowY);
          ctx.lineTo(800 - 15, arrowY - 20);
          ctx.lineTo(800 + 15, arrowY - 20);
          ctx.fill();
        }
      }

      // Draw players
      const drawPlayer = (playerData, isMe) => {
        const { x, y, facing, isMoving, isGrounded, displayName } = playerData;
        
        const groundY = canvas.height - GROUND_HEIGHT;
        const py = groundY - 48 + y;

        if (isMe) {
          drawMovementDrainBar(ctx, x, py, 48, moveTimeAccumulator.current);
        }

        ctx.fillStyle = isMe ? '#4ade80' : 'white';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.strokeText(displayName || 'Player', x + 16, py - 10);
        ctx.fillText(displayName || 'Player', x + 16, py - 10);
        
        let imgToDraw = null;
        const charType = playerData.characterType || (isMe ? user?.characterType : null) || 'FrogNinja';
        const preloads = CHARACTER_PRELOADS[charType] || CHARACTER_PRELOADS.FrogNinja;

        if (!isGrounded) {
           const playerVy = playerData.vy !== undefined ? playerData.vy : state.player.vy;
           imgToDraw = playerVy < 0 ? preloads.jump : preloads.fall;
        } else if (isMoving && preloads.run && preloads.run.length > 0) {
           imgToDraw = preloads.run[currentFrame % preloads.run.length];
        } else if (preloads.idle && preloads.idle.length > 0) {
           imgToDraw = preloads.idle[currentFrame % preloads.idle.length];
        }

        if (imgToDraw && imgToDraw.complete && imgToDraw.width > 0) {
          ctx.save();
          ctx.imageSmoothingEnabled = false;
          ctx.translate(x + 16, py);
          ctx.scale(facing, 1);
          const w = imgToDraw.width * 1.5;
          const h = imgToDraw.height * 1.5;
          ctx.drawImage(imgToDraw, -w/2, 48 - h, w, h);
          if (playerData.heldItemId) {
            drawHeldItem(ctx, playerData.heldItemId, time);
          }
          ctx.restore();
        }
      };

      Object.values(otherPlayersRef.current).forEach(p => {
        if (!p.username || p.username === user?.username) return;
        drawPlayer(p, false);
      });
      drawPlayer({
        ...state.player,
        username: user?.username,
        displayName: user ? (user.displayName || user.username) : 'Player',
        characterType: user?.characterType || 'FrogNinja',
        heldItemId: selectedBackpackSlotIdx !== null && user?.backpack?.[selectedBackpackSlotIdx] ? user.backpack[selectedBackpackSlotIdx].item_id : null
      }, true);

      // Draw Ground
      if (state.groundImg) {
        for (let i = 0; i < BOUNDARY_RIGHT; i += state.groundImg.width || 64) {
          ctx.drawImage(state.groundImg, i, canvas.height - GROUND_HEIGHT);
        }
      }
      ctx.fillStyle = '#5c3a21';
      ctx.fillRect(0, canvas.height - GROUND_HEIGHT + (state.groundImg?.height || 32), BOUNDARY_RIGHT, GROUND_HEIGHT);

      ctx.restore();
    };

    const loop = (time) => {
      canvas.width = gameWidth;
      canvas.height = gameHeight;
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      update(dt, time);
      draw(time);

      animationFrameId = requestAnimationFrame(loop);
    };
    
    animationFrameId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationFrameId);
  }, [gameWidth, gameHeight, user, showCasinoMenu, showTienLen, showShuriken, showTradeMenu, pendingTradeRequest, selectedBackpackSlotIdx]);

  // Events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
      }
      const key = e.key.toLowerCase();
      if (e.key === 'ArrowLeft' || key === 'a') keys.current.left = true;
      if (e.key === 'ArrowRight' || key === 'd') keys.current.right = true;
      if (e.key === 'ArrowUp' || key === 'w' || e.key === ' ') keys.current.jump = true;
      if (e.key === '1') setSelectedBackpackSlotIdx(0);
      if (e.key === '2') setSelectedBackpackSlotIdx(1);
      if (key === 'q') {
        const currentSlotIdx = selectedBackpackSlotIdxRef.current;
        const backpack = userRef.current?.backpack;
        const item = currentSlotIdx !== null ? backpack?.[currentSlotIdx] : null;
        if (item && item.quantity > 0) {
          setDiscardPrompt({ itemId: item.item_id, maxQty: item.quantity });
          setDiscardQtyInput(item.quantity.toString());
        }
      }
      if (key === 'f') {
        if (canInteractCasinoRef.current) {
          setShowCasinoMenu(true);
        } else if (closestPlayerRef.current) {
          setShowTradeMenu({ username: closestPlayerRef.current, isAccepting: false });
        }
      }
    };
    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (e.key === 'ArrowLeft' || key === 'a') keys.current.left = false;
      if (e.key === 'ArrowRight' || key === 'd') keys.current.right = false;
      if (e.key === 'ArrowUp' || key === 'w' || e.key === ' ') keys.current.jump = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      refreshUser();
    }, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshUser, user]);

  const handleDrainEnergy = async () => {
    try {
      const res = await authFetch('/api/profile/drain-energy', {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.energy !== undefined) updateEnergy(data.energy);
      }
    } catch (e) {
      console.error('Lỗi trừ năng lượng di chuyển:', e);
    }
  };

  const handleConsumeItem = async () => {
    if (eatCooldown || actionLoading || selectedBackpackSlotIdx === null) return;
    if ((user?.energy ?? 6) >= 6) {
      toast.error('Năng lượng đã đầy (Tối đa 6)');
      return;
    }

    setEatCooldown(true);
    setTimeout(() => setEatCooldown(false), 200);

    try {
      const res = await authFetch('/api/profile/consume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotIdx: selectedBackpackSlotIdx })
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Lỗi');
      } else {
        if (data.backpack) updateBackpack(data.backpack);
        if (data.energy !== undefined) updateEnergy(data.energy);
        toast.success(data.message || 'Sử dụng vật phẩm thành công');
      }
    } catch (e) {
      toast.error('Lỗi kết nối');
    }
  };

  const confirmDiscardItem = async () => {
    if (!discardPrompt) return;
    const qty = parseInt(discardQtyInput, 10);
    if (Number.isNaN(qty) || qty <= 0 || qty > discardPrompt.maxQty) {
      toast.error('Số lượng không hợp lệ');
      return;
    }

    setActionLoading(true);
    try {
      const res = await authFetch('/api/profile/discard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: discardPrompt.itemId, amount: qty, source: 'backpack' })
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Lỗi');
      } else {
        if (data.backpack) updateBackpack(data.backpack);
        setSelectedBackpackSlotIdx(null);
        setDiscardPrompt(null);
        toast.success('Đã vứt vật phẩm');
      }
    } catch (e) {
      toast.error('Lỗi kết nối');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <LandscapeEnforcer>
      <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
      <PixelCanvas />
      
      {/* Title */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', fontFamily: 'var(--font-pixel)', color: 'white', textShadow: '2px 2px 0 #000', pointerEvents: 'none', zIndex: 10 }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--px-amber)' }}>Sảnh Đa Người Chơi</h2>
        <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem' }}>Mini Game Server</p>
      </div>

      <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '10px', zIndex: 10 }}>
        <button
          onClick={() => setShowBackpackMenu(true)}
          className="pixel-btn"
          style={{ padding: '8px 12px', fontSize: '1rem', background: '#3b82f6', color: 'white', border: '4px solid var(--px-border)', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <img src={bagIcon} alt="Balo" style={{ width: '20px', height: '20px', imageRendering: 'pixelated' }} />
          [ BALO ]
        </button>

        <div className="pixel-btn" style={{ padding: '8px 12px', fontSize: '1rem', background: '#f59e0b', color: 'white', border: '4px solid var(--px-border)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'default' }}>
          <img src={coinIcon} alt="Xu" style={{ width: '20px', height: '20px', imageRendering: 'pixelated' }} />
          {(user?.xu ?? 0).toLocaleString('vi-VN')} Xu
        </div>

        <button 
          onClick={() => navigate('/')}
          className="pixel-btn"
          style={{ padding: '10px 16px', fontSize: '1rem', background: '#dc2626', color: 'white', border: '4px solid var(--px-border)' }}
        >
          [ THOÁT ]
        </button>
      </div>

      <EnergyBar energy={user?.energy} style={{ top: '76px', right: '20px' }} />

      {/* Mobile Controls */}
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

      <BackpackHotbar
        backpack={user?.backpack}
        selectedSlotIdx={selectedBackpackSlotIdx}
        onSelectSlot={setSelectedBackpackSlotIdx}
      />

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
        {!showCasinoMenu && !showTienLen && !showShuriken && !showTradeMenu && !pendingTradeRequest && (
          <SelectedItemActions
            item={selectedBackpackItem}
            canConsume={canConsume}
            isDrinkable={isDrinkable}
            onConsume={handleConsumeItem}
            onDiscard={() => {
              if (selectedBackpackItem) {
                setDiscardPrompt({ itemId: selectedBackpackItem.item_id, maxQty: selectedBackpackItem.quantity });
                setDiscardQtyInput(selectedBackpackItem.quantity.toString());
              }
            }}
            disabled={actionLoading}
            cooldown={eatCooldown}
          />
        )}
        <button 
          onClick={() => {
            if (canInteractCasino) {
              setShowCasinoMenu(true);
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
            animation: (canInteractCasino || closestPlayer) ? 'pulse 1s infinite' : 'none',
            visibility: (canInteractCasino || closestPlayer) ? 'visible' : 'hidden'
          }}>
          {canInteractCasino ? (
            <img src={gamingIcon} alt="Casino" style={{ width: '40px', height: '40px', imageRendering: 'pixelated' }} />
          ) : closestPlayer ? (
            <img src={transactionIcon} alt="Giao Dịch" style={{ width: '36px', height: '36px', imageRendering: 'pixelated' }} />
          ) : null}
        </button>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={gameWidth}
        height={gameHeight}
        style={{ display: 'block', width: '100%', height: '100%', imageRendering: 'pixelated', position: 'relative', zIndex: 1 }}
      />
      
      {showBackpackMenu && (
        <BackpackModal onClose={() => setShowBackpackMenu(false)} onOpenStorage={() => {}} />
      )}
      
      <DiscardItemPrompt
        itemId={discardPrompt?.itemId}
        maxQty={discardPrompt?.maxQty}
        value={discardQtyInput}
        onChange={setDiscardQtyInput}
        onConfirm={confirmDiscardItem}
        onCancel={() => setDiscardPrompt(null)}
        loading={actionLoading}
      />
      
      {showTradeMenu && (
        <TradeModal 
          targetUsername={showTradeMenu.username} 
          onClose={() => setShowTradeMenu(null)} 
          socket={socketRef.current}
          isAccepting={showTradeMenu.isAccepting || false}
        />
      )}

      {showCasinoMenu && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: '#1e293b', border: '4px solid var(--px-border)', borderRadius: '8px',
          padding: '24px', zIndex: 1000, color: 'white', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
          width: '320px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: '#facc15', margin: 0 }}>GAME CENTER</h2>
            <button 
              onClick={() => setShowCasinoMenu(false)} 
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
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button className="pixel-btn" style={{ width: '100%', padding: '16px', fontSize: '1.2rem', background: '#3b82f6', color: 'white', border: '4px solid #1e3a8a' }} onClick={() => setShowTienLen(true)}>Tiến Lên</button>
            {user?.role === 'admin' && (
              <button className="pixel-btn" style={{ width: '100%', padding: '16px', fontSize: '1.2rem', background: '#ef4444', color: 'white', border: '4px solid #991b1b' }} onClick={() => setShowShuriken(true)}>Ném phi tiêu</button>
            )}
          </div>
        </div>
      )}

      {showTienLen && (
        <TienLenGame onClose={() => setShowTienLen(false)} user={user} socket={socketRef.current} />
      )}

      {showShuriken && (
        <ShurikenGame onClose={() => setShowShuriken(false)} user={user} socket={socketRef.current} />
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
