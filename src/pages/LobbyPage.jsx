import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import PixelCanvas from '../components/PixelCanvas';
import BackpackModal from '../components/BackpackModal';
import TradeModal from '../components/TradeModal';
import TienLenGame from '../components/games/TienLenGame';
import { useGameWindowSize } from '../hooks/useGameWindowSize';
import LandscapeEnforcer from '../components/LandscapeEnforcer';

import groundGreenImg from '../../assets/ground-green.png';
import casinoImgAsset from '../../assets/casino_building.png';
import coinIcon from '../../assets/coin-tl4.2.png';
import bagIcon from '../../assets/bag.png';
import transactionIcon from '../../assets/transaction.png';
import gamingIcon from '../../assets/gaming.png';

import frogIdle1 from '../../assets/character/FrogNinja/idle (1).png';
import frogIdle2 from '../../assets/character/FrogNinja/idle (2).png';
import frogIdle3 from '../../assets/character/FrogNinja/idle (3).png';
import frogIdle4 from '../../assets/character/FrogNinja/idle (4).png';
import frogIdle5 from '../../assets/character/FrogNinja/idle (5).png';
import frogIdle6 from '../../assets/character/FrogNinja/idle (6).png';
import frogIdle7 from '../../assets/character/FrogNinja/idle (7).png';
import frogIdle8 from '../../assets/character/FrogNinja/idle (8).png';
import frogIdle9 from '../../assets/character/FrogNinja/idle (9).png';
import frogIdle10 from '../../assets/character/FrogNinja/idle (10).png';
import frogIdle11 from '../../assets/character/FrogNinja/idle (11).png';

import frogJumpImg from '../../assets/character/FrogNinja/Jump (32x32).png';
import frogFallImg from '../../assets/character/FrogNinja/Fall (32x32).png';

import frogRun1 from '../../assets/character/FrogNinja/run (1).png';
import frogRun2 from '../../assets/character/FrogNinja/run (2).png';
import frogRun3 from '../../assets/character/FrogNinja/run (3).png';
import frogRun4 from '../../assets/character/FrogNinja/run (4).png';
import frogRun5 from '../../assets/character/FrogNinja/run (5).png';
import frogRun6 from '../../assets/character/FrogNinja/run (6).png';
import frogRun7 from '../../assets/character/FrogNinja/run (7).png';
import frogRun8 from '../../assets/character/FrogNinja/run (8).png';
import frogRun9 from '../../assets/character/FrogNinja/run (9).png';
import frogRun10 from '../../assets/character/FrogNinja/run (10).png';
import frogRun11 from '../../assets/character/FrogNinja/run (11).png';
import frogRun12 from '../../assets/character/FrogNinja/run (12).png';

const frogIdleSrcs = [
  frogIdle1, frogIdle2, frogIdle3, frogIdle4, frogIdle5, frogIdle6, frogIdle7, frogIdle8, frogIdle9, frogIdle10, frogIdle11
];

const frogRunSrcs = [
  frogRun1, frogRun2, frogRun3, frogRun4, frogRun5, frogRun6, frogRun7, frogRun8, frogRun9, frogRun10, frogRun11, frogRun12
];

export default function LobbyPage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { width: gameWidth, height: gameHeight } = useGameWindowSize();
  
  const [showBackpackMenu, setShowBackpackMenu] = useState(false);
  const [closestPlayer, setClosestPlayer] = useState(null);
  const [showTradeMenu, setShowTradeMenu] = useState(null);
  const [pendingTradeRequest, setPendingTradeRequest] = useState(null);
  const [canInteractCasino, setCanInteractCasino] = useState(false);
  const [showCasinoMenu, setShowCasinoMenu] = useState(false);
  const [showTienLen, setShowTienLen] = useState(false);

  const canvasRef = useRef(null);
  const keys = useRef({ left: false, right: false, jump: false });
  const socketRef = useRef(null);
  const otherPlayersRef = useRef({});
  const closestPlayerRef = useRef(null);
  const canInteractCasinoRef = useRef(false);

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
      displayName: user?.displayName || user?.username
    },
    cameraX: 0,
    groundImg: null,
    casinoImg: null,
    frogIdleImgs: [],
    frogRunImgs: [],
    imgJump: null,
    imgFall: null
  });

  // Load assets
  useEffect(() => {
    const state = gameState.current;

    const imgG = new Image(); imgG.src = groundGreenImg; imgG.onload = () => { state.groundImg = imgG; };
    const cImg = new Image(); cImg.src = casinoImgAsset; cImg.onload = () => { state.casinoImg = cImg; };

    const loadImages = (srcs, arr) => {
      srcs.forEach(src => {
        const img = new Image();
        img.src = src;
        img.onload = () => arr.push(img);
      });
    };
    loadImages(frogIdleSrcs, state.frogIdleImgs);
    loadImages(frogRunSrcs, state.frogRunImgs);

    const imgJ = new Image(); imgJ.src = frogJumpImg; imgJ.onload = () => state.imgJump = imgJ;
    const imgF = new Image(); imgF.src = frogFallImg; imgF.onload = () => state.imgFall = imgF;
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
        displayName: user.displayName || user.username 
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
      
      p.isMoving = false;
      if (keys.current.left) {
        p.x -= SPEED * dt;
        p.facing = -1;
        p.isMoving = true;
      }
      if (keys.current.right) {
        p.x += SPEED * dt;
        p.facing = 1;
        p.isMoving = true;
      }

      if (keys.current.jump && p.isGrounded) {
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
          isGrounded: state.player.isGrounded
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

        ctx.fillStyle = isMe ? '#4ade80' : 'white';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.strokeText(displayName || 'Player', x + 16, py - 10);
        ctx.fillText(displayName || 'Player', x + 16, py - 10);
        
        let imgToDraw = null;
        if (!isGrounded) {
           const playerVy = playerData.vy !== undefined ? playerData.vy : state.player.vy;
           imgToDraw = playerVy < 0 ? state.imgJump : state.imgFall;
        } else if (isMoving) {
           if (state.frogRunImgs.length > 0) {
             imgToDraw = state.frogRunImgs[currentFrame % state.frogRunImgs.length];
           }
        } else {
           if (state.frogIdleImgs.length > 0) {
             imgToDraw = state.frogIdleImgs[currentFrame % state.frogIdleImgs.length];
           }
        }

        if (imgToDraw && imgToDraw.complete && imgToDraw.width > 0) {
          ctx.save();
          ctx.imageSmoothingEnabled = false;
          ctx.translate(x + 16, py);
          ctx.scale(facing, 1);
          const w = imgToDraw.width * 1.5;
          const h = imgToDraw.height * 1.5;
          ctx.drawImage(imgToDraw, -w/2, 48 - h, w, h);
          ctx.restore();
        }
      };

      Object.values(otherPlayersRef.current).forEach(p => {
        if (!p.username || p.username === user?.username) return;
        drawPlayer(p, false);
      });
      drawPlayer(state.player, true);

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
  }, []);

  // Events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.current.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.current.right = true;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') keys.current.jump = true;
      if (e.code === 'KeyF') {
        if (canInteractCasinoRef.current) {
          setShowCasinoMenu(true);
        } else if (closestPlayerRef.current) {
          setShowTradeMenu({ username: closestPlayerRef.current, isAccepting: false });
        }
      }
    };
    const handleKeyUp = (e) => {
      if (e.key === 'a' || e.key === 'ArrowLeft') keys.current.left = false;
      if (e.key === 'd' || e.key === 'ArrowRight') keys.current.right = false;
      if (e.key === 'w' || e.key === 'ArrowUp' || e.key === ' ') keys.current.jump = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

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
            <h2 style={{ color: '#facc15', margin: 0 }}>CASINO</h2>
            <button onClick={() => setShowCasinoMenu(false)} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>✖</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button className="pixel-btn" style={{ width: '100%', padding: '16px', fontSize: '1.2rem', background: '#3b82f6', color: 'white', border: '4px solid #1e3a8a' }} onClick={() => setShowTienLen(true)}>Tiến Lên</button>
            <button className="pixel-btn" style={{ width: '100%', padding: '16px', fontSize: '1.2rem', background: '#10b981', color: 'white', border: '4px solid #065f46' }} onClick={() => alert('Xì Dách đang được phát triển!')}>Xì Dách</button>
            <button className="pixel-btn" style={{ width: '100%', padding: '16px', fontSize: '1.2rem', background: '#ef4444', color: 'white', border: '4px solid #991b1b' }} onClick={() => alert('Poker đang được phát triển!')}>Poker</button>
          </div>
        </div>
      )}

      {showTienLen && (
        <TienLenGame onClose={() => setShowTienLen(false)} user={user} socket={socketRef.current} />
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
