import { toast } from '../utils/toast';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import PixelCanvas from '../components/PixelCanvas';
import {
  BackpackHotbar,
  DiscardItemPrompt,
  EnergyBar,
  MOVEMENT_DRAIN_SECONDS,
  SelectedItemActions,
  drawHeldItem,
  drawMovementDrainBar
} from '../components/GameHud';

import tree1Img from '../../assets/tree1.png';
import tree2Img from '../../assets/tree2.png';
import groundGreenImg from '../../assets/ground-green.png';
import stallImgAsset from '../../assets/cho-nong-san.png';
import animalShopImgAsset from '../../assets/cuahang_dongvat.png';
import motorCarShopImgAsset from '../../assets/motor_car_shop.png';

import motorcycleOrangeImg from '../../assets/vehicle/Motorcycle_orange.png';
import motorcycleRedImg from '../../assets/vehicle/Motorcycle_red.png';
import largeDisplacementMotorcyclesRedImg from '../../assets/vehicle/large_displacement_motorcycles_red.png';
import oldCarWhiteImg from '../../assets/vehicle/old_car_white.png';
import cheapCarWhiteImg from '../../assets/vehicle/cheap_car_white.png';
import cheapCarDarkBlueGreyImg from '../../assets/vehicle/cheap_car_Dark-Blue-Grey.png';
import vf3RedImg from '../../assets/vehicle/vf3_red.png';
import vf3BlueImg from '../../assets/vehicle/vf3_blue.png';
import vf3YellowImg from '../../assets/vehicle/vf3_yellow.png';

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

const VEHICLES_METADATA = [
  { id: 'Motorcycle_red', name: 'Xe máy đỏ', price: 500, img: motorcycleRedImg },
  { id: 'large_displacement_motorcycles_red', name: 'Mô tô PKL đỏ', price: 1000, img: largeDisplacementMotorcyclesRedImg },
  { id: 'old_car_white', name: 'Ô tô cổ trắng', price: 1200, img: oldCarWhiteImg },
  { id: 'cheap_car_white', name: 'Ô tô giá rẻ trắng', price: 1500, img: cheapCarWhiteImg },
  { id: 'cheap_car_Dark-Blue-Grey', name: 'Ô tô xanh xám', price: 1600, img: cheapCarDarkBlueGreyImg },
  { id: 'vf3_red', name: 'VinFast VF3 đỏ', price: 2500, img: vf3RedImg },
  { id: 'vf3_blue', name: 'VinFast VF3 xanh', price: 2600, img: vf3BlueImg },
  { id: 'vf3_yellow', name: 'VinFast VF3 vàng', price: 3000, img: vf3YellowImg }
];

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

export default function MarketPage() {
  const navigate = useNavigate();
  const { authFetch, user, refreshUser, updateBackpack, updateEnergy, addXu } = useAuth();
  
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
  const moveTimeAccumulator = useRef(0);
  const selectedBackpackSlotIdxRef = useRef(null);
  const userRef = useRef(user);

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
    motorCarShop: {
      x: 1650,
      width: 250,
      height: 180
    },
    cameraX: 0,
    bgImg: null,
    groundImg: null,
    tree1Img: null,
    tree2Img: null,
    stallImg: null,
    imgAnimalShop: null,
    imgMotorCarShop: null
  });

  const [canInteract, setCanInteract] = useState(false);
  const [canInteractAnimal, setCanInteractAnimal] = useState(false);
  const [canInteractMotorCar, setCanInteractMotorCar] = useState(false);
  const [showMotorCarMenu, setShowMotorCarMenu] = useState(false);
  const [closestPlayer, setClosestPlayer] = useState(null);
  const [showTradeMenu, setShowTradeMenu] = useState(null); // stores targetUsername
  const [pendingTradeRequest, setPendingTradeRequest] = useState(null);
  const [selectedBackpackSlotIdx, setSelectedBackpackSlotIdx] = useState(null);
  const [discardPrompt, setDiscardPrompt] = useState(null);
  const [discardQtyInput, setDiscardQtyInput] = useState('');
  const [eatCooldown, setEatCooldown] = useState(false);

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

  useEffect(() => {
    const state = gameState.current;

    const imgG = new Image(); imgG.src = groundGreenImg; imgG.onload = () => { state.groundImg = imgG; };
    const imgT1 = new Image(); imgT1.src = tree1Img; imgT1.onload = () => { state.tree1Img = imgT1; };
    const imgT2 = new Image(); imgT2.src = tree2Img; imgT2.onload = () => { state.tree2Img = imgT2; };
    const stallImage = new Image(); stallImage.src = stallImgAsset; stallImage.onload = () => { state.stallImg = stallImage; };
    const imgAnimal = new Image(); imgAnimal.src = animalShopImgAsset; imgAnimal.onload = () => { state.imgAnimalShop = imgAnimal; };
    const imgMotorCar = new Image(); imgMotorCar.src = motorCarShopImgAsset; imgMotorCar.onload = () => { state.imgMotorCarShop = imgMotorCar; };
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
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
      }
      const key = e.key.toLowerCase();
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.current.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.current.right = true;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') keys.current.jump = true;
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
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const state = gameState.current;
      canvas.width = gameWidth;
      canvas.height = gameHeight;

      const gravity = 2000;
      const jumpPower = -600;
      const menuOpen = showMarketMenu || showAnimalMenu || showMotorCarMenu || !!showTradeMenu || !!pendingTradeRequest;
      const canMove = !menuOpen && !loading;
      const currentEnergy = userRef.current?.energy !== undefined && userRef.current?.energy !== null ? userRef.current.energy : 6;
      const speed = currentEnergy <= 0 ? 125 : 250;

      let isMoving = false;
      const currentlyMoving = ((keys.current.left || keys.current.right) && canMove) || (!state.player.isGrounded && canMove);
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

      if (canMove) {
        if (keys.current.left) { state.player.x -= speed * dt; state.player.facing = -1; isMoving = true; }
        if (keys.current.right) { state.player.x += speed * dt; state.player.facing = 1; isMoving = true; }
        if (keys.current.jump && state.player.isGrounded && currentEnergy > 0) { state.player.vy = jumpPower; state.player.isGrounded = false; }
      }

      state.player.vy += gravity * dt;
      state.player.y += state.player.vy * dt;

      if (state.player.y > 0) { state.player.y = 0; state.player.vy = 0; state.player.isGrounded = true; }
      const worldWidth = 2200;
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
          characterType: user?.characterType || 'FrogNinja',
          heldItemId: selectedBackpackSlotIdx !== null && user?.backpack?.[selectedBackpackSlotIdx] ? user.backpack[selectedBackpackSlotIdx].item_id : null
        });
      }

      const centerPlayer = state.player.x + state.player.width / 2;
      const centerStall = state.stall.x + state.stall.width / 2;
      const inRange = Math.abs(centerPlayer - centerStall) < 150;
      
      const centerAnimal = state.animalShop.x + state.animalShop.width / 2;
      const inRangeAnimal = Math.abs(centerPlayer - centerAnimal) < 150;

      const centerMotorCar = state.motorCarShop.x + state.motorCarShop.width / 2;
      const inRangeMotorCar = Math.abs(centerPlayer - centerMotorCar) < 150;
      
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
      setCanInteractMotorCar((prev) => prev !== inRangeMotorCar ? inRangeMotorCar : prev);
      
      if (!inRange && showMarketMenu) setShowMarketMenu(false);
      if (!inRangeAnimal && showAnimalMenu) setShowAnimalMenu(false);
      if (!inRangeMotorCar && showMotorCarMenu) setShowMotorCarMenu(false);

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

      if (state.imgMotorCarShop && state.imgMotorCarShop.complete) {
        const h = 180;
        const w = state.imgMotorCarShop.width * (h / state.imgMotorCarShop.height);
        const mcx = state.motorCarShop.x + state.motorCarShop.width/2 - w/2;
        ctx.drawImage(state.imgMotorCarShop, mcx, groundY - h, w, h);
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
      } else if (inRangeMotorCar && !showMotorCarMenu) {
        const bounce = Math.sin(time / 150) * 5;
        ctx.fillStyle = '#facc15'; ctx.font = '24px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('▼', state.motorCarShop.x + state.motorCarShop.width/2, groundY - state.motorCarShop.height - 20 + bounce);
      } else if (false) {
        const bounce = Math.sin(time / 150) * 5;
        ctx.fillStyle = '#facc15'; ctx.font = '24px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('▼', state.animalShop.x + state.animalShop.width/2, groundY - state.animalShop.height - 20 + bounce);
      }

      const drawCharacter = (pState, isMe) => {
        const px = pState.x;
        const py = groundY - pState.height + pState.y;

        if (isMe) {
          drawMovementDrainBar(ctx, px, py, pState.height, moveTimeAccumulator.current);
        }
        
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

        if (pState.heldItemId) {
          drawHeldItem(ctx, pState.heldItemId, time);
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
        characterType: user?.characterType || 'FrogNinja',
        heldItemId: selectedBackpackSlotIdx !== null && user?.backpack?.[selectedBackpackSlotIdx] ? user.backpack[selectedBackpackSlotIdx].item_id : null
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
  }, [market, showMarketMenu, showAnimalMenu, showMotorCarMenu, showTradeMenu, pendingTradeRequest, selectedBackpackSlotIdx, user, loading, gameWidth, gameHeight]);

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

  const handleBuyVehicle = async (vehicleId) => {
    setActionLoading(true);
    try {
      const res = await authFetch('/api/vehicle/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId })
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Lỗi mua xe');
      } else {
        toast.success(data.message || 'Mua xe thành công!');
        refreshUser();
      }
    } catch (e) {
      toast.error('Lỗi kết nối');
    } finally {
      setActionLoading(false);
    }
  };

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
        // Cập nhật xu và storage ngay lập tức — không cần fetch lại
        addXu(data.earned);
        setStorageRiceQty(prev => Math.max(0, prev - parseInt(sellInput) || 0));
        toast.success(`Bán thành công! Nhận được ${data.earned} Xu.`);
        setShowMarketMenu(false);
        // Sync nền
        fetchMarket();
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
        // Cập nhật backpack ngay lập tức từ response
        if (data.backpack) updateBackpack(data.backpack);
        else if (data.xu !== undefined) addXu(data.xu - (user?.xu || 0));
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
        // Cập nhật backpack ngay lập tức từ response
        if (data.backpack) updateBackpack(data.backpack);
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

      <button onClick={() => setShowBackpackMenu(true)} className="pixel-btn" style={{ position: 'absolute', top: '20px', right: '150px', padding: '10px', background: '#eab308', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 10 }}>
        <img src={bagIcon} alt="Balo" style={{ width: '24px', height: '24px', imageRendering: 'pixelated' }} />
        <span>Balo</span>
      </button>

      {/* Coin Display */}
      <div style={{ position: 'absolute', top: '20px', right: '280px', padding: '6px 16px', background: 'white', border: '4px solid #f59e0b', borderRadius: '0', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 10, fontFamily: 'var(--font-pixel)', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
        <img src={coinIcon} alt="Xu" style={{ width: '28px', height: '28px', imageRendering: 'pixelated' }} />
        <span style={{ fontSize: '1.2rem', color: '#d97706', fontWeight: 'bold', textShadow: '1px 1px 0 #fff' }}>{user?.xu?.toLocaleString() || 0}</span>
      </div>

      <EnergyBar energy={user?.energy} style={{ top: '20px', right: '490px' }} />

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

      <div style={{ position: 'absolute', bottom: '20px', right: '20px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px', zIndex: 20 }}>
        <button 
          onPointerDown={(e) => { e.preventDefault(); keys.current.jump = true; }}
          onPointerUp={(e) => { e.preventDefault(); keys.current.jump = false; }}
          onPointerLeave={() => keys.current.jump = false}
          onContextMenu={(e) => e.preventDefault()}
          className="pixel-btn" 
          style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', background: 'rgba(0,0,0,0.5)', border: '4px solid var(--px-border)', color: 'white', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none', marginRight: '4px' }}>
          ▲
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {!showMarketMenu && !showAnimalMenu && !showMotorCarMenu && (
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
          {!showMarketMenu && !showAnimalMenu && !showMotorCarMenu && (
            <button 
              onClick={() => {
                if (canInteract) {
                  setShowMarketMenu(true);
                  setSellInput(riceQty.toString());
                } else if (canInteractAnimal) {
                  setShowAnimalMenu(true);
                } else if (canInteractMotorCar) {
                  setShowMotorCarMenu(true);
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
                animation: (canInteract || canInteractAnimal || canInteractMotorCar || closestPlayer) ? 'pulse 1s infinite' : 'none'
              }}>
              {canInteract ? (
                <img src={marketIcon} alt="Giao Dịch" style={{ width: '40px', height: '40px', imageRendering: 'pixelated', display: 'block' }} />
              ) : canInteractAnimal ? (
                <img src={marketIcon} alt="Động Vật" style={{ width: '40px', height: '40px', imageRendering: 'pixelated', display: 'block', filter: 'hue-rotate(180deg)' }} />
              ) : canInteractMotorCar ? (
                <span style={{ fontSize: '24px' }}>🏍️</span>
              ) : closestPlayer ? (
                <img src={transactionIcon} alt="Giao Dịch" style={{ width: '36px', height: '36px', imageRendering: 'pixelated' }} />
              ) : null}
            </button>
          )}
        </div>
      </div>

      {showAnimalMenu && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="rpg-box" style={{ background: '#fffbeb', width: '380px', padding: '12px 16px', color: '#000', position: 'relative', marginTop: '-50px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #ccc', paddingBottom: '6px', marginBottom: '15px' }}>
              <h2 style={{ fontSize: '16px', margin: 0, fontWeight: 'bold' }}>🛒 CỬA HÀNG ĐỘNG VẬT</h2>
              <button 
                onClick={() => setShowAnimalMenu(false)} 
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
          </div>
        </div>
      )}
      {showMotorCarMenu && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="rpg-box" style={{ background: '#fffbeb', width: '420px', maxHeight: '90%', overflowY: 'auto', padding: '12px 16px', color: '#000', position: 'relative', marginTop: '-50px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #ccc', paddingBottom: '6px', marginBottom: '15px' }}>
              <h2 style={{ fontSize: '16px', margin: 0, fontWeight: 'bold' }}>🛒 CỬA HÀNG XE</h2>
              <button 
                onClick={() => setShowMotorCarMenu(false)} 
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
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', background: 'rgba(0,0,0,0.05)', padding: '8px', borderRadius: '4px' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Tài sản của bạn:</span>
              <img src={coinIcon} alt="Xu" style={{ width: '20px', height: '20px' }} />
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#b45309' }}>{user?.xu ?? 0} xu</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {VEHICLES_METADATA.map(item => {
                const isOwned = user?.vehicleSkins?.includes(item.id);
                const canAfford = (user?.xu ?? 0) >= item.price;
                return (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', border: '2px solid #cbd5e1', padding: '10px', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '80px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <img src={item.img} alt={item.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{item.name}</div>
                        <div style={{ fontSize: '12px', color: '#b45309', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <img src={coinIcon} alt="Xu" style={{ width: '12px', height: '12px' }} />
                          {item.price} xu
                        </div>
                      </div>
                    </div>
                    <div>
                      {isOwned ? (
                        <button className="pixel-btn" disabled style={{ background: '#94a3b8', color: '#f8fafc', padding: '6px 10px', fontSize: '11px', cursor: 'not-allowed' }}>
                          ĐÃ SỞ HỮU
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleBuyVehicle(item.id)}
                          disabled={actionLoading || !canAfford}
                          className="pixel-btn"
                          style={{ 
                            background: canAfford ? '#22c55e' : '#ef4444', 
                            color: '#fff', 
                            padding: '6px 10px', 
                            fontSize: '11px',
                            opacity: (!canAfford || actionLoading) ? 0.6 : 1
                          }}
                        >
                          {actionLoading ? '...' : canAfford ? 'MUA' : 'KHÔNG ĐỦ XU'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {showMarketMenu && market && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="rpg-box fade-in" style={{ width: '90%', maxWidth: '400px', background: '#fffbeb', padding: '12px 16px', color: '#000', display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative', marginTop: '-50px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #ccc', paddingBottom: '6px' }}>
              <h2 style={{ fontSize: '16px', margin: 0, fontWeight: 'bold' }}>🌾 THƯƠNG NHÂN</h2>
              <button 
                onClick={() => setShowMarketMenu(false)} 
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
