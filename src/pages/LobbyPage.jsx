import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import UnifiedHUD from '../components/UnifiedHUD';
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

import motorcycleOrangeImg from '../../assets/vehicle/Motorcycle_orange.png';
import motorcycleRedImg from '../../assets/vehicle/Motorcycle_red.png';
import largeDisplacementMotorcyclesRedImg from '../../assets/vehicle/large_displacement_motorcycles_red.png';
import oldCarWhiteImg from '../../assets/vehicle/old_car_white.png';
import cheapCarWhiteImg from '../../assets/vehicle/cheap_car_white.png';
import cheapCarDarkBlueGreyImg from '../../assets/vehicle/cheap_car_Dark-Blue-Grey.png';
import vf3RedImg from '../../assets/vehicle/vf3_red.png';
import vf3BlueImg from '../../assets/vehicle/vf3_blue.png';
import vf3YellowImg from '../../assets/vehicle/vf3_yellow.png';

const VEHICLE_SKIN_IMAGES = {
  Motorcycle_orange: motorcycleOrangeImg,
  Motorcycle_red: motorcycleRedImg,
  large_displacement_motorcycles_red: largeDisplacementMotorcyclesRedImg,
  old_car_white: oldCarWhiteImg,
  cheap_car_white: cheapCarWhiteImg,
  cheap_car_Dark_Blue_Grey: cheapCarDarkBlueGreyImg,
  vf3_red: vf3RedImg,
  vf3_blue: vf3BlueImg,
  vf3_yellow: vf3YellowImg
};

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
  const location = useLocation();
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
  const [canInteractVehicle, setCanInteractVehicle] = useState(false);
  const [showVehicleMenu, setShowVehicleMenu] = useState(false);
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
  const canInteractVehicleRef = useRef(false);
  const moveTimeAccumulator = useRef(0);
  const selectedBackpackSlotIdxRef = useRef(null);
  const userRef = useRef(user);

  const startX = location.state?.startX ?? 100;

  const gameState = useRef({
    player: {
      x: startX,
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
    vehicle: {
      x: 150,
      width: 80,
      height: 60
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

    // Pre-load vehicle images
    state.vehicleImgs = {};
    Object.entries(VEHICLE_SKIN_IMAGES).forEach(([id, src]) => {
      const img = new Image();
      img.src = src;
      img.onload = () => { state.vehicleImgs[id] = img; };
    });
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
      const menuOpen = showCasinoMenu || showTienLen || showShuriken || !!showTradeMenu || !!pendingTradeRequest || showVehicleMenu;
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

      if (p.x <= 5) {
        sessionStorage.setItem('riding_vehicle', 'false');
        navigate('/market', { state: { startX: 2150 } });
        return;
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

      // Vehicle proximity
      const hasVehicle = sessionStorage.getItem('riding_vehicle') === 'true';
      const centerPlayer = state.player.x + state.player.width / 2;
      const centerVehicle = state.vehicle.x + state.vehicle.width / 2;
      const inRangeVehicle = hasVehicle && Math.abs(centerPlayer - centerVehicle) < 100;
      canInteractVehicleRef.current = inRangeVehicle;
      setCanInteractVehicle(prev => prev !== inRangeVehicle ? inRangeVehicle : prev);

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

      // Draw Vehicle if riding_vehicle is true
      if (sessionStorage.getItem('riding_vehicle') === 'true') {
        const vState = state.vehicle;
        const groundY = canvas.height - GROUND_HEIGHT;
        const equippedSkin = userRef.current?.equippedVehicleSkin || 'Motorcycle_orange';
        const vImg = state.vehicleImgs && state.vehicleImgs[equippedSkin];
        if (vImg && vImg.complete && vImg.width > 0) {
          const vH = 60;
          const vW = vImg.width * (vH / vImg.height);
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(vImg, vState.x, groundY - vH, vW, vH);
        } else {
          ctx.fillStyle = '#f97316';
          ctx.fillRect(vState.x, groundY - vState.height, vState.width, vState.height);
          ctx.fillStyle = '#fff';
          ctx.font = '8px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🏍', vState.x + vState.width/2, groundY - vState.height/2 + 4);
        }

        // Draw proximity bounce arrow
        const inRangeVehicle = canInteractVehicleRef.current;
        if (inRangeVehicle && !showVehicleMenu) {
          const bounce = Math.sin(time / 150) * 5;
          ctx.fillStyle = '#facc15';
          ctx.font = '24px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('▼', vState.x + vState.width/2, groundY - vState.height - 20 + bounce);
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
  }, [gameWidth, gameHeight, user, showCasinoMenu, showTienLen, showShuriken, showTradeMenu, pendingTradeRequest, selectedBackpackSlotIdx, showVehicleMenu]);

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
      if (e.key === '3') setSelectedBackpackSlotIdx(2);
      if (e.key === '4') setSelectedBackpackSlotIdx(3);
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
        } else if (canInteractVehicleRef.current) {
          setShowVehicleMenu(true);
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
        if (data.backpack) {
          updateBackpack(data.backpack);
          const currentItem = data.backpack[selectedBackpackSlotIdx];
          if (!currentItem || currentItem.quantity <= 0) {
            setSelectedBackpackSlotIdx(null);
          }
        }
        if (data.energy !== undefined) updateEnergy(data.energy);
      }
    } catch (e) {
      toast.error('Lỗi kết nối');
    }
  };

  const handleEquipVehicle = async (vehicleId) => {
    setActionLoading(true);
    try {
      const res = await authFetch('/api/vehicle/equip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId })
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Lỗi trang bị xe');
      } else {
        toast.success(data.message || 'Trang bị xe thành công!');
        refreshUser();
      }
    } catch (e) {
      toast.error('Lỗi kết nối');
    } finally {
      setActionLoading(false);
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
      
      <UnifiedHUD
        pageTitle="Sảnh Đa Người Chơi"
        pageSubtitle="Mini Game Server"
        onExit={() => navigate('/')}
        xu={user?.xu || 0}
        energy={user?.energy}
        backpack={user?.backpack}
        selectedSlotIdx={selectedBackpackSlotIdx}
        onSelectSlot={setSelectedBackpackSlotIdx}
        showMovement={true}
        keysRef={keys}
        selectedItem={selectedBackpackItem}
        canConsume={canConsume}
        isDrinkable={isDrinkable}
        onConsume={handleConsumeItem}
        onDiscard={() => {
          if (selectedBackpackItem) {
            setDiscardPrompt({ itemId: selectedBackpackItem.item_id, maxQty: selectedBackpackItem.quantity });
            setDiscardQtyInput(selectedBackpackItem.quantity.toString());
          }
        }}
        actionLoading={actionLoading}
        eatCooldown={eatCooldown}
        showInteraction={selectedBackpackSlotIdx === null && !showVehicleMenu && (canInteractCasino || canInteractVehicle || !!closestPlayer)}
        interactionActive={selectedBackpackSlotIdx === null && !!(canInteractCasino || canInteractVehicle || closestPlayer)}
        onInteract={() => {
          if (canInteractCasino) {
            setShowCasinoMenu(true);
          } else if (canInteractVehicle) {
            setShowVehicleMenu(true);
          } else if (closestPlayerRef.current) {
            setShowTradeMenu({ username: closestPlayerRef.current, isAccepting: false });
          }
        }}
        interactionIcon={
          canInteractCasino ? (
            <img src={gamingIcon} alt="Casino" style={{ width: '40px', height: '40px', imageRendering: 'pixelated' }} />
          ) : canInteractVehicle ? (
            <span style={{ fontSize: '24px' }}>🏍️</span>
          ) : closestPlayer ? (
            <img src={transactionIcon} alt="Giao Dịch" style={{ width: '36px', height: '36px', imageRendering: 'pixelated' }} />
          ) : null
        }
      />

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={gameWidth}
        height={gameHeight}
        style={{ display: 'block', width: '100%', height: '100%', imageRendering: 'pixelated', position: 'relative', zIndex: 1 }}
      />
      
      {showVehicleMenu && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="rpg-box fade-in" style={{ background: '#fffbeb', width: '380px', maxHeight: '90%', overflowY: 'auto', padding: '12px 16px', color: '#000', position: 'relative', marginTop: '-50px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #ccc', paddingBottom: '6px', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '15px', margin: 0, fontWeight: 'bold' }}>🏍️ XE CỦA BẠN</h2>
              <button onClick={() => setShowVehicleMenu(false)} style={{ background: 'transparent', border: 'none', fontSize: '14px', cursor: 'pointer', fontFamily: 'var(--font-pixel)', fontWeight: 'bold', color: '#ef4444' }}>[x]</button>
            </div>

            {/* Quick Travel */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '6px', color: '#64748b' }}>⚡ DI CHUYỂN NHANH</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="pixel-btn"
                  onClick={() => {
                    sessionStorage.setItem('riding_vehicle', 'true');
                    navigate('/home2d');
                  }}
                  style={{ flex: 1, background: '#3b82f6', color: 'white', padding: '8px 6px', fontSize: '10px' }}
                >🏡 NÔNG TRẠI</button>
                <button
                  className="pixel-btn"
                  onClick={() => {
                    sessionStorage.setItem('riding_vehicle', 'true');
                    navigate('/market');
                  }}
                  style={{ flex: 1, background: '#8b5cf6', color: 'white', padding: '8px 6px', fontSize: '10px' }}
                >🏪 CHỢ</button>
              </div>
            </div>

            {/* Skin Selection */}
            <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '8px', color: '#64748b' }}>🎨 CHỌN SKIN XE</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(['Motorcycle_orange', ...(user?.vehicleSkins || [])]).filter((v, i, arr) => arr.indexOf(v) === i).map(skinId => {
                const img = VEHICLE_SKIN_IMAGES[skinId];
                const isEquipped = (user?.equippedVehicleSkin || 'Motorcycle_orange') === skinId;
                const skinLabels = {
                  Motorcycle_orange: 'Xe máy cam (mặc định)',
                  Motorcycle_red: 'Xe máy đỏ',
                  large_displacement_motorcycles_red: 'Mô tô PKL đỏ',
                  old_car_white: 'Ô tô cổ trắng',
                  cheap_car_white: 'Ô tô giá rẻ trắng',
                  'cheap_car_Dark-Blue-Grey': 'Ô tô xanh xám',
                  vf3_red: 'VinFast VF3 đỏ',
                  vf3_blue: 'VinFast VF3 xanh',
                  vf3_yellow: 'VinFast VF3 vàng'
                };
                return (
                  <div key={skinId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: isEquipped ? '#fef3c7' : 'white', border: `2px solid ${isEquipped ? '#f59e0b' : '#cbd5e1'}`, padding: '8px 10px', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {img && <img src={img} alt={skinId} style={{ width: '64px', height: '40px', objectFit: 'contain', imageRendering: 'pixelated' }} />}
                      <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{skinLabels[skinId] || skinId}</span>
                    </div>
                    <button
                      className="pixel-btn"
                      disabled={isEquipped || actionLoading}
                      onClick={() => handleEquipVehicle(skinId)}
                      style={{ background: isEquipped ? '#94a3b8' : '#22c55e', color: '#fff', padding: '5px 8px', fontSize: '10px', cursor: isEquipped ? 'not-allowed' : 'pointer' }}
                    >
                      {isEquipped ? 'ĐANG DÙNG' : 'TRANG BỊ'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '12px', fontSize: '10px', color: '#94a3b8', textAlign: 'center' }}>Mua thêm skin xe tại Cửa hàng xe trong khu Chợ</div>
          </div>
        </div>
      )}
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
