import { toast } from '../utils/toast';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import PixelCanvas from '../components/PixelCanvas';

import seenIcon from '../../assets/seen.png';
import sickleIcon from '../../assets/sickle.png';
import plantIcon from '../../assets/plant.png';
import khoIcon from '../../assets/kho.png';
import chuongGoImgSrc from '../../assets/chuong_go.png';

import luaNonImg from '../../assets/lua-non.png';
import luaChinImg from '../../assets/lua-chin.png';
import tree1Img from '../../assets/tree1.png';
import tree2Img from '../../assets/tree2.png';
import groundGreenImg from '../../assets/ground-green.png';
import houseImg from '../../assets/house.png';

import cowMove1 from '../../assets/animals/cow/cow_move_01.png';
import cowMove2 from '../../assets/animals/cow/cow_move_02.png';
import cowMove3 from '../../assets/animals/cow/cow_move_03.png';
import cowMove4 from '../../assets/animals/cow/cow_move_04.png';
import cowMove5 from '../../assets/animals/cow/cow_move_05.png';

import bagIcon from '../../assets/bag.png';
import whiskIcon from '../../assets/whisk.png';
import milkIconImg from '../../assets/milk.png';
import transactionIcon from '../../assets/transaction.png';
import coinIcon from '../../assets/coin-tl4.2.png';

import BackpackModal from '../components/BackpackModal';
import StorageModal from '../components/StorageModal';
import TradeModal from '../components/TradeModal';
import LandscapeEnforcer from '../components/LandscapeEnforcer';
import { useGameWindowSize } from '../hooks/useGameWindowSize';

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

const parsePlantedAt = (plantedAt) => {
  if (!plantedAt) return 0;
  if (plantedAt instanceof Date) return plantedAt.getTime();
  
  let dateStr = plantedAt.toString().trim();
  if (!dateStr.includes('T')) {
    dateStr = dateStr.replace(' ', 'T');
  }
  if (!dateStr.endsWith('Z') && !dateStr.includes('+') && !/-\d{2}:\d{2}$/.test(dateStr)) {
    dateStr += 'Z';
  }
  
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? new Date(plantedAt).getTime() : parsed.getTime();
};

export default function HousePage() {
  const navigate = useNavigate();
  const { width: gameWidth, height: gameHeight } = useGameWindowSize();
  const { username: visitUsername } = useParams();
  const { authFetch, user, refreshUser } = useAuth();
  
  const isVisiting = !!visitUsername && visitUsername !== user?.username;
  const targetUsername = isVisiting ? visitUsername : user?.username;
  
  const canvasRef = useRef(null);
  const socketRef = useRef(null);
  const otherPlayersRef = useRef({});
  const lastEmitTime = useRef(0);
  
  const [farm, setFarm] = useState(null);
  const [farmTimeLeft, setFarmTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedAnimalsToSell, setSelectedAnimalsToSell] = useState([]);
  const [canInteract, setCanInteract] = useState(false);
  const [showTradeMenu, setShowTradeMenu] = useState(null);
  const [pendingTradeRequest, setPendingTradeRequest] = useState(null);
  const [canInteractHouse, setCanInteractHouse] = useState(false);
  const [canInteractCage, setCanInteractCage] = useState(false);
  const [closestPlayer, setClosestPlayer] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [inventorySlots, setInventorySlots] = useState(5);
  const [userXu, setUserXu] = useState(0);

  const [showFarmMenu, setShowFarmMenu] = useState(false);
  const [showHouseMenu, setShowHouseMenu] = useState(false);
  const [showCageMenu, setShowCageMenu] = useState(false);
  const [cageTab, setCageTab] = useState('feed');
  const [feedPrompt, setFeedPrompt] = useState(null);
  const [feedQtyInput, setFeedQtyInput] = useState('');
  const [selectedFeedItem, setSelectedFeedItem] = useState(null);
  const [showBackpackMenu, setShowBackpackMenu] = useState(false);
  const [showStorageMenu, setShowStorageMenu] = useState(false);
  const [saving, setSaving] = useState(false);
  const [droppedItems, setDroppedItems] = useState([]);


  // Input states
  const keys = useRef({ left: false, right: false, jump: false, interact: false });
  const closestPlayerRef = useRef(null);

  // Game state
  const gameState = useRef({
    player: { x: 200, y: 0, vy: 0, isGrounded: true, width: 32, height: 48, facing: 1, walkCycle: 0, characterType: user?.characterType || 'FrogNinja' },
    farmPlot: { x: 650, width: 128 },
    house: { x: 80, width: 80, height: 80 },
    lastTime: performance.now(),
    cameraX: 0
  });

  const cowStatesRef = useRef([]);
  const droppedItemsRef = useRef([]);

  // Sync React state to game state
  useEffect(() => {
    droppedItemsRef.current = droppedItems;
  }, [droppedItems]);


  const loadFarm = async () => {
    try {
      const url = isVisiting ? `/api/farm/visit/${visitUsername}` : '/api/farm';
      const res = await authFetch(url);
      if (res.ok) {
        const data = await res.json();
        setFarm(data.farm);
        if (!isVisiting) {
          setInventory(data.inventory || []);
          setInventorySlots(data.inventory_slots || 5);
          setUserXu(data.xu || 0);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFarm(); refreshUser(); }, [authFetch, visitUsername]);

  // Auto-refresh when crop finishes growing
  useEffect(() => {
    if (farm && farm.state === 'growing' && farm.planted_at) {
      const diff = Date.now() - parsePlantedAt(farm.planted_at);
      const remainingMs = Math.max(0, 30000 - diff);
      
      const timeout = setTimeout(() => {
        loadFarm();
      }, remainingMs + 500); // +500ms buffer to ensure backend is ready
      
      const interval = setInterval(() => {
        const d = (Date.now() - parsePlantedAt(farm.planted_at)) / 1000;
        setFarmTimeLeft(Math.max(0, 30 - d));
      }, 100);

      // Initialize right away
      setFarmTimeLeft(Math.max(0, 30 - diff / 1000));

      return () => {
        clearTimeout(timeout);
        clearInterval(interval);
      };
    } else {
      setFarmTimeLeft(0);
    }
  }, [farm]);

  useEffect(() => {
    if (!targetUsername) return;
    
    socketRef.current = io(import.meta.env.VITE_API_URL || window.location.origin.replace('5173', '3001'), {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      timeout: 60000,
      transports: ['websocket', 'polling']
    });
    
    socketRef.current.on('connect', () => {
      socketRef.current.emit('join_house', {
        hostUsername: targetUsername,
        player: { 
          ...gameState.current.player, 
          username: user?.username, 
          displayName: user ? (user.displayName || user.username) : 'Player',
          characterType: user?.characterType || 'FrogNinja'
        }
      });
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

    socketRef.current.on('farm_updated', () => {
      loadFarm();
    });

    socketRef.current.on('item_dropped', (drops) => {
      setDroppedItems(drops);
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

    socketRef.current.on('item_picked_up', (dropId) => {
      setDroppedItems(prev => prev.filter(d => d.id !== dropId));
    });

    return () => socketRef.current.disconnect();
  }, [targetUsername, user]);

  // Load images
  useEffect(() => {
    const state = gameState.current;
    const img1 = new Image(); img1.src = luaNonImg; img1.onload = () => { state.imgLuaNon = img1; };
    const img2 = new Image(); img2.src = luaChinImg; img2.onload = () => { state.imgLuaChin = img2; };
    
    const imgG = new Image(); imgG.src = groundGreenImg; imgG.onload = () => { state.imgGroundGreen = imgG; };
    const imgH = new Image(); imgH.src = houseImg; imgH.onload = () => { state.imgHouse = imgH; };

    const imgChuong = new Image(); imgChuong.src = chuongGoImgSrc; imgChuong.onload = () => { state.imgChuong = imgChuong; };

    const imgT1 = new Image(); imgT1.src = tree1Img; imgT1.onload = () => { state.imgTree1 = imgT1; };
    const imgT2 = new Image(); imgT2.src = tree2Img; imgT2.onload = () => { state.imgTree2 = imgT2; };

    const cowSrcs = [cowMove1, cowMove2, cowMove3, cowMove4, cowMove5];
    state.cowImgs = [];
    cowSrcs.forEach((src, idx) => {
      const img = new Image(); img.src = src;
      img.onload = () => {
        if (!state.cowImgs.includes(img) && state.cowImgs.length < 5) {
           state.cowImgs.push(img);
        }
      };
    });

    const imgMilk = new Image(); imgMilk.src = milkIconImg; imgMilk.onload = () => { state.imgMilk = imgMilk; };
  }, []);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = gameWidth;
        canvasRef.current.height = gameHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [gameWidth, gameHeight]);

  // Keyboard
  useEffect(() => {
    const handleKd = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keys.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') keys.current.right = true;
      if (e.key === 'ArrowUp' || e.key === 'w') keys.current.jump = true;
      if (e.key === ' ' || e.key === 'e') keys.current.interact = true;
    };
    const handleKu = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keys.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') keys.current.right = false;
      if (e.key === 'ArrowUp' || e.key === 'w') keys.current.jump = false;
      if (e.key === ' ' || e.key === 'e') keys.current.interact = false;
    };
    window.addEventListener('keydown', handleKd);
    window.addEventListener('keyup', handleKu);
    return () => { window.removeEventListener('keydown', handleKd); window.removeEventListener('keyup', handleKu); };
  }, []);

  // Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rafId;

    const loop = (time) => {
      const state = gameState.current;
      const dt = (time - state.lastTime) / 1000;
      state.lastTime = time;

      // Fix canvas internal size if it mismatch window
      if (canvas.width !== gameWidth || canvas.height !== gameHeight) {
          canvas.width = gameWidth;
          canvas.height = gameHeight;
      }

      const dist = Math.abs(state.player.x + state.player.width/2 - (state.farmPlot.x + state.farmPlot.width/2));
      const inRange = dist < 120;
      
      const distHouse = Math.abs(state.player.x + state.player.width/2 - (state.house.x + state.house.width/2));
      const inRangeHouse = distHouse < 80;

      const distCage = Math.abs(state.player.x + state.player.width/2 - 495); // Adjusted center for width 270
      const inRangeCage = distCage < 150;

      // Handle item pickup
      if (!isVisiting && droppedItemsRef.current.length > 0) {
        const pRect = { x: state.player.x, y: canvas.height - 100 - state.player.height + state.player.y, w: state.player.width, h: state.player.height };
        droppedItemsRef.current.forEach(item => {
          if (Math.abs(pRect.x + pRect.w/2 - (item.x + 16)) < 40) {
            socketRef.current.emit('pickup_item', item.id);
            setDroppedItems(prev => prev.filter(d => d.id !== item.id));
            loadFarm(); // Reload farm/inventory after picking up
            refreshUser();
          }
        });
      }

      let closestPlayer = null;
      let minDist = 50;
      if (otherPlayersRef.current) {
        Object.values(otherPlayersRef.current).forEach(op => {
          if (!op.username || op.username === user?.username) return;
          const pDist = Math.abs((state.player.x + state.player.width/2) - (op.x + op.width/2));
          if (pDist < minDist) {
            minDist = pDist;
            closestPlayer = op.username;
          }
        });
      }
      closestPlayerRef.current = closestPlayer;
      setClosestPlayer(prev => prev !== closestPlayer ? closestPlayer : prev);

      if (!showFarmMenu && !showHouseMenu && !showCageMenu && !loading) {
        const speed = 250; // px/s
        let isMoving = false;
        
        if (keys.current.left) {
          state.player.x -= speed * dt;
          state.player.facing = -1;
          isMoving = true;
        }
        if (keys.current.right) {
          state.player.x += speed * dt;
          state.player.facing = 1;
          isMoving = true;
        }

        if (isMoving) {
          state.player.walkCycle += dt * 15; // Animation speed
        } else {
          state.player.walkCycle = 0; // Reset to standing
        }

        // Physics for jumping
        const gravity = 2000;
        state.player.vy += gravity * dt;
        state.player.y += state.player.vy * dt;

        if (state.player.y >= 0) {
          state.player.y = 0;
          state.player.vy = 0;
          state.player.isGrounded = true;
        } else {
          state.player.isGrounded = false;
        }

        if (keys.current.jump && state.player.isGrounded) {
          state.player.vy = -700;
          state.player.isGrounded = false;
        }

        if (state.player.x < 0) state.player.x = 0;
        if (state.player.x > 2000 - state.player.width) state.player.x = 2000 - state.player.width;

        // Update React state only if we need to show/hide the UI button
        setCanInteract((prev) => (prev !== inRange ? inRange : prev));
        setCanInteractHouse((prev) => (prev !== inRangeHouse ? inRangeHouse : prev));
        
        setCanInteractCage((prev) => (prev !== inRangeCage ? inRangeCage : prev));

        if (keys.current.interact && !isVisiting) {
          if (inRangeHouse && !showHouseMenu) {
            keys.current.interact = false;
            setShowHouseMenu(true);
          } else if (inRangeCage && !showCageMenu) {
            keys.current.interact = false;
            setShowCageMenu(true);
          } else if (inRange && !showFarmMenu) {
            keys.current.interact = false;
            setShowFarmMenu(true);
          } else if (closestPlayerRef.current) {
            keys.current.interact = false;
            setShowTradeMenu(closestPlayerRef.current);
          }
        }
      }

      state.cameraX = state.player.x - canvas.width / 2 + state.player.width / 2;
      if (state.cameraX < 0) state.cameraX = 0;
      if (state.cameraX > 2000 - canvas.width) state.cameraX = Math.max(0, 2000 - canvas.width);

      // Render
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.save();
      ctx.translate(-state.cameraX, 0);
      
      // Ground
      const groundY = canvas.height - 100;
      const worldWidth = 2000;
      
      if (state.imgGroundGreen && state.imgGroundGreen.complete && state.imgGroundGreen.height > 0) {
        const ih = state.imgGroundGreen.height;
        if (!state.groundPattern) state.groundPattern = ctx.createPattern(state.imgGroundGreen, 'repeat-x');
        
        ctx.fillStyle = state.groundPattern;
        ctx.save();
        ctx.translate(0, groundY);
        ctx.fillRect(0, 0, worldWidth, ih);
        ctx.restore();
        
        ctx.fillStyle = '#5c3a21';
        ctx.fillRect(0, groundY + ih, worldWidth, Math.max(100 - ih, 0));
      } else {
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(0, groundY, worldWidth, 20);
        ctx.fillStyle = '#5c3a21';
        ctx.fillRect(0, groundY + 20, worldWidth, 80);
      }

      // Draw House
      const hx = state.house.x;
      let houseRenderW = state.house.width;
      let houseRenderH = state.house.height;
      let houseRenderX = hx;
      let houseRenderY = groundY - state.house.height;

      if (state.imgHouse && state.imgHouse.complete && state.imgHouse.height > 0) {
        houseRenderH = 180;
        houseRenderW = state.imgHouse.width * (houseRenderH / state.imgHouse.height);
        houseRenderX = hx + state.house.width/2 - houseRenderW/2;
        houseRenderY = groundY - houseRenderH;
        ctx.drawImage(state.imgHouse, houseRenderX, houseRenderY, houseRenderW, houseRenderH);
      } else {
        const hy = groundY - state.house.height;
        ctx.fillStyle = '#e5e7eb';
        ctx.fillRect(hx, hy, state.house.width, state.house.height);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(hx - 10, hy);
        ctx.lineTo(hx + state.house.width / 2, hy - 40);
        ctx.lineTo(hx + state.house.width + 10, hy);
        ctx.fill();
        ctx.fillStyle = '#8b5cf6';
        ctx.fillRect(hx + 30, hy + 40, 20, 40);
      }

      // Trees
      if (state.imgTree1 && state.imgTree1.complete && state.imgTree1.height > 0) {
        const h1 = 180;
        const w1 = state.imgTree1.width * (h1 / state.imgTree1.height);
        // Move tree to x = 900
        ctx.drawImage(state.imgTree1, 900 - w1/2, groundY - h1, w1, h1);
      }
      if (state.imgTree2 && state.imgTree2.complete && state.imgTree2.height > 0) {
        const h2 = 220;
        const w2 = state.imgTree2.width * (h2 / state.imgTree2.height);
        ctx.drawImage(state.imgTree2, worldWidth - 100 - w2/2, groundY - h2, w2, h2);
      }
      
      // Update and Draw Cows (behind the cage)
      const currentCows = farm?.animals?.filter(a => a === 'cow') || [];
      if (cowStatesRef.current.length !== currentCows.length) {
         cowStatesRef.current = currentCows.map(() => ({
            x: 370 + Math.random() * 240, // Increased roaming range for wider cage
            facing: Math.random() > 0.5 ? 1 : -1,
            state: 'idle',
            stateTime: time + Math.random() * 2000
         }));
      }
      
      cowStatesRef.current.forEach(cow => {
         if (time > cow.stateTime) {
            if (cow.state === 'idle') {
               cow.state = 'moving';
               cow.facing = Math.random() > 0.5 ? 1 : -1;
               cow.stateTime = time + 1000 + Math.random() * 2000;
            } else {
               cow.state = 'idle';
               cow.stateTime = time + 2000 + Math.random() * 3000;
            }
         }
         if (cow.state === 'moving') {
            const speed = 20;
            cow.x += cow.facing * speed * dt;
            if (cow.x < 360) { cow.x = 360; cow.facing = 1; }
            if (cow.x > 600) { cow.x = 600; cow.facing = -1; }
         }
      });
      
      // Draw Back Fence - wider (270) and shorter (12.5)
      ctx.fillStyle = '#5c3a21'; // Darker wood for depth
      ctx.fillRect(360, groundY - 10, 270, 2); // Top back plank
      ctx.fillRect(360, groundY - 5, 270, 2); // Bottom back plank
      for (let i = 0; i <= 6; i++) {
         ctx.fillRect(360 + i * 45 - 2, groundY - 12.5, 4, 12.5); // Back posts
      }

      // Fallback if images are not loaded or missing
      if (!state.cowImgs || state.cowImgs.length < 5) {
         cowStatesRef.current.forEach(cow => {
            const ch = 60;
            const cw = 80;
            ctx.fillStyle = 'brown';
            ctx.fillRect(cow.x - cw/2, groundY - ch + 5, cw, ch);
            ctx.fillStyle = 'white';
            ctx.fillText('Bò', cow.x, groundY - ch/2);
         });
      } else {
         cowStatesRef.current.forEach((cow, idx) => {
            const frame = cow.state === 'moving' ? Math.floor(time / 150) % 5 : 0;
            const img = state.cowImgs[frame];
            let ch = 60; // Reduced size
            if (img && img.complete) {
               const cw = img.width * (ch / img.height);
               ctx.save();
               ctx.translate(cow.x, groundY - ch + 5);
               ctx.scale(cow.facing, 1);
               ctx.drawImage(img, -cw/2, 0, cw, ch);
               ctx.restore();
            }
            
            // Draw milk countdown
            const cowData = (farm?.animals_data || []).filter(a => a.type === 'cow')[idx];
            if (cowData) {
               const nowMs = Date.now();
               const elapsedSec = Math.max(0, (nowMs - (cowData.lastUpdateTime || nowMs)) / 1000);
               
               let displayProgress = cowData.milkProgress || 0;
               let displayStraw = cowData.strawTimeRemaining || 0;
               
               if (displayStraw > 0) {
                 const step = Math.min(elapsedSec, displayStraw, 1800 - displayProgress);
                 displayProgress += step;
                 displayStraw -= step;
               }
               
               let text = '';
               let textColor = 'white';
               if (displayStraw <= 0) {
                 text = "HẾT RƠM!";
                 textColor = '#ef4444'; // Red
               } else {
                 const remainingSec = Math.max(0, 1800 - displayProgress);
                 const m = Math.floor(remainingSec / 60);
                 const s = Math.floor(remainingSec % 60);
                 text = `${m}:${s < 10 ? '0' : ''}${s}`;
                 textColor = '#fcd34d'; // Amber
               }

               ctx.save();
               ctx.fillStyle = textColor;
               ctx.font = '10px "Press Start 2P", monospace';
               ctx.textAlign = 'center';
               ctx.strokeStyle = 'black';
               ctx.lineWidth = 2;
               ctx.strokeText(text, cow.x, groundY - ch - 10);
               ctx.fillText(text, cow.x, groundY - ch - 10);
               ctx.restore();
            }
         });
      }

      // Grass overlay to hide cow feet
      if (state.imgGroundGreen && state.imgGroundGreen.complete && state.imgGroundGreen.height > 0) {
        ctx.fillStyle = state.groundPattern;
        ctx.save();
        ctx.translate(0, groundY);
        ctx.fillRect(340, 0, 310, 5);
        ctx.restore();
      } else {
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(340, groundY, 310, 5);
      }

      // Draw Front Fence - wider (270) and shorter (12.5)
      ctx.fillStyle = '#8b5a2b';
      ctx.fillRect(350, groundY - 10, 290, 3);
      ctx.fillRect(350, groundY - 5, 290, 3);
      
      ctx.strokeStyle = '#3e2723';
      ctx.lineWidth = 1;
      ctx.strokeRect(350, groundY - 10, 290, 3);
      ctx.strokeRect(350, groundY - 5, 290, 3);
      
      for (let i = 0; i <= 6; i++) {
         const px = 350 + i * 48;
         ctx.fillStyle = '#8b5a2b';
         ctx.fillRect(px - 2, groundY - 14, 4, 14); 
         ctx.strokeRect(px - 2, groundY - 14, 4, 14);
         ctx.fillStyle = '#a06a38';
         ctx.fillRect(px - 1, groundY - 13, 2, 13);
      }
      
      // Signboard
      ctx.fillStyle = '#a06a38';
      ctx.fillRect(480, groundY - 25, 60, 20);
      ctx.strokeRect(480, groundY - 25, 60, 20);
      ctx.fillStyle = '#3e2723';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('CHUỒNG', 510, groundY - 11);


      // Farm
      ctx.fillStyle = '#5c3a21';
      ctx.fillRect(state.farmPlot.x, groundY - 5, state.farmPlot.width, 5);
      
      if (farm && farm.level > 0) {
        let img = null;
        if (farm.state === 'growing') img = state.imgLuaNon;
        if (farm.state === 'ready') img = state.imgLuaChin;
        
        if (img && img.complete) {
          ctx.imageSmoothingEnabled = false;
          for(let i=0; i<4; i++) {
             ctx.drawImage(img, state.farmPlot.x + i*32, groundY - 32, 32, 32);
          }
        }
        if (farm.state === 'growing' && farm.planted_at) {
          const diff = (Date.now() - parsePlantedAt(farm.planted_at)) / 1000;
          const remaining = Math.max(0, 30 - diff);
          
          if (remaining > 0) {
            const progress = Math.min(1, Math.max(0, diff / 30));
            const barWidth = 80;
            const barHeight = 8;
            const barX = state.farmPlot.x + state.farmPlot.width/2 - barWidth/2;
            const barY = groundY - 42;
            
            // Outer black border (pixel style)
            ctx.fillStyle = '#000000';
            ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
            
            // Inner dark background
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            // Green progress fill
            ctx.fillStyle = '#4ade80';
            ctx.fillRect(barX, barY, barWidth * progress, barHeight);

            // Subtle highlight line on the progress bar for depth
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(barX, barY, barWidth * progress, 2);
          } else {
            // Blink effect for harvest ready
            if (Math.floor(time / 500) % 2 === 0) {
              ctx.font = '8px "Press Start 2P", monospace';
              ctx.textAlign = 'center';
              ctx.fillStyle = '#fbbf24';
              ctx.fillText('THU HOẠCH!', state.farmPlot.x + state.farmPlot.width/2, groundY - 40);
            }
          }
        }
      }

      // Draw Drops
      droppedItemsRef.current.forEach(item => {
        if (state.imgMilk && state.imgMilk.complete && item.item_id === 'milk') {
          const bounce = Math.sin(time / 200 + item.id.charCodeAt(0)) * 5;
          ctx.drawImage(state.imgMilk, item.x, groundY - 32 + bounce, 32, 32);
        }
      });

      // Interaction Arrows
      const bounce = Math.sin(time / 150) * 5;
      ctx.fillStyle = '#facc15'; 
      ctx.font = '24px "Press Start 2P", monospace'; 
      ctx.textAlign = 'center';
      
      if (inRange && !showFarmMenu) {
        ctx.fillText('▼', state.farmPlot.x + state.farmPlot.width/2, groundY - 50 + bounce);
      } else if (inRangeCage && !showCageMenu) {
        ctx.fillText('▼', 495, groundY - 30 + bounce);
      } else if (inRangeHouse && !showHouseMenu) {
        ctx.fillText('▼', state.house.x + state.house.width/2, groundY - state.house.height - 20 + bounce);
      }

      // Player Drawing Logic
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
        } else if (preloads.idle && preloads.idle.length > 0) {
          const frameIndex = Math.floor(time / 66) % preloads.idle.length;
          currentImg = preloads.idle[frameIndex];
        }
        
        if (currentImg && currentImg.complete && currentImg.width > 0) {
          const w = currentImg.width * 1.5;
          const h = currentImg.height * 1.5;
          ctx.drawImage(currentImg, -w/2, pState.height - h, w, h);
        }
        ctx.restore();
        
        ctx.fillStyle = isMe ? '#4ade80' : 'white';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        const name = pState.displayName || 'Player';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.strokeText(name, px + pState.width/2, py - 10);
        ctx.fillText(name, px + pState.width/2, py - 10);
      };

      const isMoving = (keys.current.left || keys.current.right) && !showFarmMenu && !showHouseMenu && !loading;
      
      if (socketRef.current && (time - lastEmitTime.current > 50)) {
        lastEmitTime.current = time;
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

      if (otherPlayersRef.current) {
        Object.values(otherPlayersRef.current).forEach(op => {
          if (!op.username || op.username === user?.username) return;
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
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [farm, showFarmMenu, showHouseMenu, showCageMenu, user, loading, gameWidth, gameHeight]);


  const submitFeed = async (amount) => {
    setActionLoading(true);
    try {
      const res = await authFetch('/api/farm/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();
      if (!res.ok) toast.error(data.error || 'Lỗi');
      else {
        setSelectedFeedItem(null);
        await loadFarm();
        await refreshUser(); // Cập nhật lại Balo để đồng bộ UI
        if (socketRef.current) socketRef.current.emit('farm_action');
      }
    } catch (e) {
      toast.error('Lỗi kết nối');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClickSlot = () => {
    if (selectedFeedItem && selectedFeedItem.item_id === 'rom') {
      const qty = parseInt(selectedFeedItem.quantity || '0', 10);
      if (qty > 1) { // They asked if quantity > 1 (or 2). Let's use > 1 as it makes sense for multiple items.
        setFeedPrompt({ maxQty: qty });
        setFeedQtyInput(qty.toString());
      } else if (qty === 1) {
        submitFeed(qty);
      }
    }
  };

  const handleAction = async (endpoint) => {
    let bodyData = null;
    
    setActionLoading(true);
    try {
      const opts = { method: 'POST' };
      if (bodyData) {
        opts.headers = { 'Content-Type': 'application/json' };
        opts.body = JSON.stringify(bodyData);
      }
      const res = await authFetch(`/api/farm/${endpoint}`, opts);
      const data = await res.json();
      if (!res.ok) toast.error(data.error || 'Lỗi');
      else {
        await loadFarm();
        await refreshUser(); // Cập nhật lại Balo để đồng bộ UI
        if (socketRef.current) socketRef.current.emit('farm_action');
      }
    } catch (e) {
      toast.error('Lỗi kết nối');
    } finally {
      setActionLoading(false);
      if (endpoint !== 'plant') {
        setShowFarmMenu(false);
      }
      setShowHouseMenu(false);
    }
  };

  const handlePlaceAnimal = async (animalId) => {
    setActionLoading(true);
    try {
      const res = await authFetch('/api/farm/place-animal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animal: animalId })
      });
      const data = await res.json();
      if (!res.ok) toast.error(data.error || 'Lỗi');
      else {
        await loadFarm();
        await refreshUser();
        toast.success('Thả thú nuôi thành công!');
        setShowCageMenu(false);
      }
    } catch (e) {
      console.error(e);
      toast.error('Lỗi kết nối');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSellAnimals = async () => {
    if (selectedAnimalsToSell.length === 0) return;
    setActionLoading(true);
    try {
      const res = await authFetch('/api/farm/sell-animals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ indices: selectedAnimalsToSell })
      });
      const data = await res.json();
      if (!res.ok) toast.error(data.error || 'Lỗi');
      else {
        await loadFarm();
        await refreshUser();
        setSelectedAnimalsToSell([]);
        toast.success(data.message);
      }
    } catch (e) {
      console.error(e);
      toast.error('Lỗi kết nối');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCollectCageProducts = async () => {
    setActionLoading(true);
    try {
      const res = await authFetch('/api/farm/collect-cage-products', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) toast.error(data.error || 'Lỗi');
      else {
        await loadFarm();
        await refreshUser();
        if (data.message.includes('Balo đã đầy')) toast.error(data.message);
        else toast.success(data.message);
      }
    } catch (e) {
      console.error(e);
      toast.error('Lỗi kết nối');
    } finally {
      setActionLoading(false);
    }
  };

  const isLocked = !farm || farm.level === 0;

  const getGrowingProgress = () => {
    if (!farm || farm.state !== 'growing' || !farm.planted_at) {
      return { remaining: 0, percent: 0, isReady: farm?.state === 'ready' };
    }
    const diff = (Date.now() - parsePlantedAt(farm.planted_at)) / 1000;
    const remaining = Math.max(0, 30 - diff);
    const percent = Math.min(100, Math.max(0, (diff / 30) * 100));
    const isReady = remaining <= 0;
    return { remaining: Math.ceil(remaining), percent, isReady };
  };

  const progress = getGrowingProgress();

  // Aggregate cows from inventory and backpack
  const getAvailableCows = () => {
    let count = 0;
    inventory.forEach(i => { if (i.item_id === 'cow') count += i.quantity; });
    const bp = user?.backpack || [null, null];
    bp.forEach(slot => { if (slot && slot.item_id === 'cow') count += slot.quantity; });
    return count > 0 ? [{ item_id: 'cow', quantity: count }] : [];
  };
  const availableCows = getAvailableCows();

  return (
    <LandscapeEnforcer>
      <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
      <PixelCanvas />
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', position: 'relative', zIndex: 1 }} />

      <button onClick={() => navigate('/')} className="pixel-btn" style={{ position: 'absolute', top: '20px', right: '20px', padding: '10px 16px', background: '#dc2626', color: 'white', zIndex: 10 }}>[ THOÁT ]</button>
      {/* Coin Display */}
      <div style={{ position: 'absolute', top: '20px', right: '250px', padding: '6px 16px', background: 'white', border: '4px solid #f59e0b', borderRadius: '0', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 10, fontFamily: 'var(--font-pixel)', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
        <img src={coinIcon} alt="Xu" style={{ width: '28px', height: '28px', imageRendering: 'pixelated' }} />
        <span style={{ fontSize: '1.2rem', color: '#d97706', fontWeight: 'bold', textShadow: '1px 1px 0 #fff' }}>{user?.xu?.toLocaleString() || 0}</span>
      </div>

      <button onClick={() => setShowBackpackMenu(true)} className="pixel-btn" style={{ position: 'absolute', top: '20px', right: '140px', padding: '10px', background: '#eab308', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 10 }}>
          <img src={bagIcon} alt="Balo" style={{ width: '24px', height: '24px', imageRendering: 'pixelated' }} />
          <span>Balo</span>
        </button>

      {/* Top Info */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', fontFamily: 'var(--font-pixel)', color: 'white', textShadow: '2px 2px 0 #000', pointerEvents: 'none' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--px-amber)' }}>{isVisiting ? `Nông Trại ${targetUsername}` : 'Thế Giới Của Bạn'}</h2>
        <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem' }}>Dùng [◄] [►] để di chuyển</p>
      </div>

      {/* Touch Controls */}
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

        {!showFarmMenu && !showHouseMenu && !showCageMenu && (
          <button 
            onClick={() => {
              if (canInteract && !isVisiting) {
                setShowFarmMenu(true);
              } else if (canInteractCage && !isVisiting) {
                setShowCageMenu(true);
              } else if (canInteractHouse && !isVisiting) {
                setShowHouseMenu(true);
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
              animation: (((canInteract || canInteractHouse || canInteractCage) && !isVisiting) || closestPlayer) ? 'pulse 1s infinite' : 'none'
            }}>
            {canInteract && !isVisiting ? (
              <img src={plantIcon} alt="Ruộng" style={{width:'32px'}}/>
            ) : canInteractCage && !isVisiting ? (
              <img src={khoIcon} alt="Chuồng" style={{width:'32px', filter: 'hue-rotate(90deg)'}}/>
            ) : canInteractHouse && !isVisiting ? (
              <img src={khoIcon} alt="Kho" style={{width:'32px'}}/>
            ) : closestPlayer ? (
              <img src={transactionIcon} alt="Giao Dịch" style={{ width: '36px', height: '36px', imageRendering: 'pixelated' }} />
            ) : null}
          </button>
        )}
      </div>

      {/* Action Modal */ }
      {showFarmMenu && farm && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="rpg-box fade-in" style={{ width: '90%', maxWidth: '400px' }}>
            <div className="px-titlebar">◄ TƯƠNG TÁC RUỘNG ►</div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              <div style={{ textAlign: 'center', fontSize: '1rem', marginBottom: '8px', color: 'var(--px-amber)' }}>
                {isLocked && "Ruộng đang bỏ hoang."}
                {!isLocked && farm.state === 'idle' && `Sẵn sàng gieo hạt. (Sản lượng: ${farm.yield} Lúa)`}
                {!isLocked && farm.state === 'growing' && !progress.isReady && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                    <span>Đang chờ lúa lớn... <span style={{color: '#4ade80'}}>({progress.remaining}s)</span></span>
                    
                    {/* Beautiful Retro Pixel-Art Loading Bar */}
                    <div style={{
                      width: '100%',
                      height: '28px',
                      background: '#1e293b',
                      border: '4px solid #475569',
                      padding: '3px',
                      boxSizing: 'border-box',
                      position: 'relative',
                      imageRendering: 'pixelated',
                      boxShadow: 'inset 0 0 8px rgba(0,0,0,0.8)'
                    }}>
                      <div style={{
                        width: `${progress.percent}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #15803d, #22c55e, #4ade80)',
                        boxShadow: '0 2px 0 rgba(255,255,255,0.4) inset, 0 -2px 0 rgba(0,0,0,0.2) inset',
                        transition: 'width 0.1s linear'
                      }} />
                      <span style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '11px',
                        fontFamily: 'var(--font-pixel)',
                        fontWeight: 'bold',
                        textShadow: '2px 2px 0 #000',
                        letterSpacing: '1px'
                      }}>
                        {Math.round(progress.percent)}%
                      </span>
                    </div>
                  </div>
                )}
                {!isLocked && (farm.state === 'ready' || (farm.state === 'growing' && progress.isReady)) && <span style={{color: '#4ade80'}}>Lúa đã chín!</span>}
              </div>

              {isLocked && (
                <button className="btn btn-primary" onClick={() => handleAction('buy')} disabled={actionLoading}>
                  {actionLoading ? 'ĐANG MUA...' : '[ MUA RUỘNG - 100 XU ]'}
                </button>
              )}

              {!isLocked && farm.state === 'idle' && (
                <button className="btn btn-primary" onClick={() => handleAction('plant')} disabled={actionLoading}>
                  {actionLoading ? 'ĐANG GIEO...' : '[ GIEO HẠT - 10 XU ]'}
                </button>
              )}

              {!isLocked && (farm.state === 'ready' || (farm.state === 'growing' && progress.isReady)) && (
                <button className="btn btn-primary" onClick={() => handleAction('harvest')} disabled={actionLoading} style={{ background: '#e6c229', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {!actionLoading && <img src={sickleIcon} alt="Cái liềm" style={{ width: '20px', imageRendering: 'pixelated' }} />}
                  {actionLoading ? 'ĐANG THU HOẠCH...' : `[ THU HOẠCH +${farm.yield} LÚA ]`}
                </button>
              )}

              {!isLocked && farm.level < farm.maxLevel && (
                <button className="btn btn-outline" onClick={() => handleAction('upgrade')} disabled={actionLoading || farm.state !== 'idle'}>
                  {actionLoading ? 'ĐANG NÂNG CẤP...' : `[ NÂNG CẤP LV.${farm.level + 1} - ${farm.upgradeCost} XU ]`}
                </button>
              )}

              <button className="btn btn-outline" onClick={() => setShowFarmMenu(false)} style={{ marginTop: '16px' }}>
                [ ĐÓNG ]
              </button>
            </div>
          </div>
        </div>
      )}

      {showCageMenu && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px', gap: '20px' }}>
          
          <div className="rpg-box" style={{ background: '#fffbeb', width: '320px', padding: '20px', maxHeight: '100%', overflowY: 'auto', position: 'relative' }}>
            <h2 style={{ fontSize: '16px', marginBottom: '15px', color: '#1e293b', textAlign: 'center' }}>CHUỒNG THÚ</h2>
            
            {/* Feed Prompt Modal Overlay */}
            {feedPrompt && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(255, 251, 235, 0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: '20px' }}>
                <div style={{ background: '#fff', border: '2px solid #3b82f6', padding: '15px', width: '100%', textAlign: 'center', borderRadius: '8px' }}>
                  <h3 style={{ fontSize: '14px', marginBottom: '10px' }}>Nhập số lượng rơm muốn châm</h3>
                  <input 
                    type="number" 
                    min="1" 
                    max={feedPrompt.maxQty} 
                    value={feedQtyInput} 
                    onChange={e => setFeedQtyInput(e.target.value)}
                    style={{ width: '100%', padding: '5px', marginBottom: '10px', textAlign: 'center' }}
                  />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      className="pixel-btn" 
                      onClick={() => {
                        const qty = parseInt(feedQtyInput) || 1;
                        submitFeed(qty);
                        setFeedPrompt(null);
                      }}
                      style={{ flex: 1, background: '#22c55e', color: '#fff', padding: '5px' }}
                    >Xác nhận</button>
                    <button 
                      className="pixel-btn" 
                      onClick={() => setFeedPrompt(null)}
                      style={{ flex: 1, background: '#ef4444', color: '#fff', padding: '5px' }}
                    >Hủy</button>
                  </div>
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '5px', marginBottom: '15px', borderBottom: '2px solid #cbd5e1' }}>
              <button 
                onClick={() => setCageTab('feed')} 
                style={{ flex: 1, padding: '8px 0', fontSize: '12px', background: cageTab === 'feed' ? '#e2e8f0' : 'transparent', border: 'none', borderBottom: cageTab === 'feed' ? '2px solid #3b82f6' : 'none', cursor: 'pointer', fontWeight: cageTab === 'feed' ? 'bold' : 'normal' }}
              >
                Máng ăn
              </button>
              <button 
                onClick={() => setCageTab('animals')} 
                style={{ flex: 1, padding: '8px 0', fontSize: '12px', background: cageTab === 'animals' ? '#e2e8f0' : 'transparent', border: 'none', borderBottom: cageTab === 'animals' ? '2px solid #3b82f6' : 'none', cursor: 'pointer', fontWeight: cageTab === 'animals' ? 'bold' : 'normal' }}
              >
                Thú nuôi
              </button>
              <button 
                onClick={() => setCageTab('products')} 
                style={{ flex: 1, padding: '8px 0', fontSize: '12px', background: cageTab === 'products' ? '#e2e8f0' : 'transparent', border: 'none', borderBottom: cageTab === 'products' ? '2px solid #3b82f6' : 'none', cursor: 'pointer', fontWeight: cageTab === 'products' ? 'bold' : 'normal' }}
              >
                Sản phẩm
              </button>
            </div>

            {cageTab === 'feed' && (
              <div 
                style={{ 
                  border: '2px dashed #94a3b8', 
                  borderRadius: '8px', 
                  padding: '15px', 
                  minHeight: '150px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  background: 'rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ marginBottom: '15px', fontSize: '12px', color: '#334155', textAlign: 'center' }}>
                  Bấm chọn Rơm từ Balo, sau đó bấm vào máng ăn.
                </div>
                {/* Straw Storage Slots */}
                <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginBottom: '15px' }}>
                  {Array.from({ length: 4 }).map((_, idx) => {
                    const slot = (farm?.cage_inventory || [])[idx];
                    return (
                      <div 
                        key={idx} 
                        onClick={handleClickSlot}
                        style={{ width: '48px', height: '48px', background: '#e2e8f0', border: '2px solid #94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: selectedFeedItem ? 'pointer' : 'default' }}
                      >
                        {slot ? (
                          <>
                            <img src={whiskIcon} style={{ width: '24px' }} alt="Rơm" />
                            <span style={{ position: 'absolute', bottom: '2px', right: '4px', fontSize: '10px' }}>{slot.quantity}/20</span>
                          </>
                        ) : (
                          <span style={{ fontSize: '10px', color: '#94a3b8' }}>Trống</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {cageTab === 'animals' && (
              <>
                <div style={{ marginBottom: '10px', fontSize: '12px', fontWeight: 'bold', color: '#1e293b' }}>
                  Đang nuôi: {(farm?.animals_data || []).length}/8 con
                </div>
                
                <div style={{ maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '15px', padding: '5px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px' }}>
                  {(farm?.animals_data || []).map((animal, idx) => {
                    const isSelected = selectedAnimalsToSell.includes(idx);
                    const progressPct = Math.min(100, Math.floor(((animal.milkProgress || 0) / 1800) * 100));
                    return (
                      <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: isSelected ? '#bae6fd' : '#f1f5f9', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={isSelected} 
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAnimalsToSell([...selectedAnimalsToSell, idx]);
                            } else {
                              setSelectedAnimalsToSell(selectedAnimalsToSell.filter(i => i !== idx));
                            }
                          }}
                        />
                        <img src={cowMove1} style={{ width: '24px' }} alt="Bò" />
                        <span style={{ fontSize: '11px', flex: 1 }}>Bò (Sữa: {progressPct}%)</span>
                      </label>
                    );
                  })}
                  {!(farm?.animals_data || []).length && (
                    <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', padding: '10px' }}>Chuồng trống</div>
                  )}
                </div>

                {selectedAnimalsToSell.length > 0 && (
                  <button 
                    className="pixel-btn" 
                    disabled={actionLoading}
                    onClick={handleSellAnimals}
                    style={{ background: '#ef4444', color: 'white', border: '2px solid var(--px-border)', padding: '5px 10px', fontSize: '12px', width: '100%', marginBottom: '15px' }}
                  >
                    [ BÁN {selectedAnimalsToSell.length} CON - THU VỀ {selectedAnimalsToSell.length * 150} XU ]
                  </button>
                )}

                <div style={{ marginBottom: '10px', fontSize: '12px', fontWeight: 'bold', color: '#1e293b' }}>Kho/Balo:</div>
                <div style={{ maxHeight: '100px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
                  {availableCows.length > 0 ? (
                    availableCows.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#e2e8f0', padding: '10px', border: '2px solid #cbd5e1' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={cowMove1} style={{ width: '30px' }} alt="Bò" />
                          <span style={{ fontSize: '12px' }}>Bò (x{item.quantity})</span>
                        </div>
                        <button 
                          className="pixel-btn" 
                          disabled={actionLoading}
                          onClick={() => handlePlaceAnimal('cow')}
                          style={{ background: '#22c55e', color: 'white', padding: '5px 10px', fontSize: '10px' }}
                        >
                          Thả
                        </button>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', color: '#64748b', fontSize: '12px', padding: '10px 0' }}>
                      Không có vật nuôi nào trong kho/balo.
                    </div>
                  )}
                </div>
              </>
            )}

            {cageTab === 'products' && (
              <>
                <div style={{ marginBottom: '10px', fontSize: '12px', fontWeight: 'bold', color: '#1e293b', textAlign: 'center' }}>
                  Sản phẩm thu được:
                </div>
                
                <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '15px', padding: '10px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', justifyContent: 'center' }}>
                  {(farm?.cage_products || []).length > 0 ? (
                    (() => {
                      const counts = {};
                      farm.cage_products.forEach(p => counts[p] = (counts[p] || 0) + 1);
                      return Object.entries(counts).map(([type, qty], idx) => (
                        <div key={idx} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px' }}>
                           <span style={{ fontSize: '20px' }}>{type === 'milk' || type === 'sua' ? '🥛' : '📦'}</span>
                           <span style={{ fontSize: '12px', fontWeight: 'bold', marginTop: '5px' }}>x{qty}</span>
                        </div>
                      ));
                    })()
                  ) : (
                    <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', width: '100%' }}>Chưa có sản phẩm nào.</div>
                  )}
                </div>

                <button 
                  className="pixel-btn" 
                  disabled={actionLoading || !(farm?.cage_products || []).length}
                  onClick={handleCollectCageProducts}
                  style={{ background: '#3b82f6', color: 'white', border: '2px solid var(--px-border)', padding: '8px 10px', fontSize: '12px', width: '100%', marginBottom: '15px', opacity: (farm?.cage_products || []).length ? 1 : 0.5 }}
                >
                  [ THU HOẠCH TẤT CẢ ]
                </button>
              </>
            )}
            <button className="pixel-btn" onClick={() => setShowCageMenu(false)} style={{ background: '#64748b', color: 'white', padding: '10px', width: '100%' }}>
              Đóng
            </button>
          </div>

          {cageTab === 'feed' && (
            <div className="rpg-box" style={{ background: '#fffbeb', width: '200px', padding: '15px', maxHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                <img src={bagIcon} alt="Balo" style={{ width: '24px', height: '24px', imageRendering: 'pixelated' }} />
                <h3 style={{ fontSize: '14px', margin: 0, color: '#1e293b' }}>Balo</h3>
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                {(user?.backpack || [null, null]).map((item, i) => (
                  <div 
                    key={i} 
                    onClick={() => {
                      if (item) {
                        setSelectedFeedItem(selectedFeedItem === item ? null : item);
                      }
                    }}
                    style={{ 
                      width: '48px', height: '48px', background: '#e2e8f0', 
                      border: selectedFeedItem === item ? '2px solid #3b82f6' : '2px solid #cbd5e1', 
                      boxShadow: selectedFeedItem === item ? '0 0 8px rgba(59, 130, 246, 0.8)' : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                      cursor: item ? 'pointer' : 'default',
                      transition: 'all 0.1s'
                    }}
                  >
                    {item ? (
                      item.item_id === 'rom' ? (
                        <>
                          <img src={whiskIcon} style={{ width: '24px' }} alt="Rơm" />
                          <span style={{ position: 'absolute', bottom: '2px', right: '4px', fontSize: '10px' }}>{item.quantity}</span>
                        </>
                      ) : (
                        <span style={{ fontSize: '10px' }}>{item.item_id} x{item.quantity}</span>
                      )
                    ) : (
                      <span style={{ fontSize: '10px', color: '#94a3b8' }}>Trống</span>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '15px', textAlign: 'center' }}>
                Bấm chọn vật phẩm
              </div>
            </div>
          )}
        </div>
      )}

      {showHouseMenu && <StorageModal onClose={() => setShowHouseMenu(false)} />}
      
      {showBackpackMenu && <BackpackModal onClose={() => setShowBackpackMenu(false)} onOpenStorage={() => { setShowBackpackMenu(false); setShowHouseMenu(true); }} />}

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

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
      </div>
    </LandscapeEnforcer>
  );
}
