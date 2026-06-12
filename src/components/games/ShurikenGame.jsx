import React, { useEffect, useRef, useState } from 'react';
import { useGameWindowSize } from '../../hooks/useGameWindowSize';
import LandscapeEnforcer from '../LandscapeEnforcer';
import { toast } from '../../utils/toast';

// --- ASSETS ---
import groundGreenImg from '../../../assets/ground-green.png';
import shurikenImg from '../../../assets/shuriken.png';

// Frog Ninja Animations
import frogIdle1 from '../../../assets/character/FrogNinja/idle (1).png';
import frogIdle2 from '../../../assets/character/FrogNinja/idle (2).png';
import frogIdle3 from '../../../assets/character/FrogNinja/idle (3).png';
import frogIdle4 from '../../../assets/character/FrogNinja/idle (4).png';
import frogIdle5 from '../../../assets/character/FrogNinja/idle (5).png';
import frogIdle6 from '../../../assets/character/FrogNinja/idle (6).png';
import frogIdle7 from '../../../assets/character/FrogNinja/idle (7).png';
import frogIdle8 from '../../../assets/character/FrogNinja/idle (8).png';
import frogIdle9 from '../../../assets/character/FrogNinja/idle (9).png';
import frogIdle10 from '../../../assets/character/FrogNinja/idle (10).png';
import frogIdle11 from '../../../assets/character/FrogNinja/idle (11).png';
import frogJumpImg from '../../../assets/character/FrogNinja/Jump (32x32).png';
import frogFallImg from '../../../assets/character/FrogNinja/Fall (32x32).png';

import frogRun1 from '../../../assets/character/FrogNinja/run (1).png';
import frogRun2 from '../../../assets/character/FrogNinja/run (2).png';
import frogRun3 from '../../../assets/character/FrogNinja/run (3).png';
import frogRun4 from '../../../assets/character/FrogNinja/run (4).png';
import frogRun5 from '../../../assets/character/FrogNinja/run (5).png';
import frogRun6 from '../../../assets/character/FrogNinja/run (6).png';
import frogRun7 from '../../../assets/character/FrogNinja/run (7).png';
import frogRun8 from '../../../assets/character/FrogNinja/run (8).png';
import frogRun9 from '../../../assets/character/FrogNinja/run (9).png';
import frogRun10 from '../../../assets/character/FrogNinja/run (10).png';
import frogRun11 from '../../../assets/character/FrogNinja/run (11).png';
import frogRun12 from '../../../assets/character/FrogNinja/run (12).png';

import frogHit1 from '../../../assets/character/FrogNinja/hit_01.png';
import frogHit2 from '../../../assets/character/FrogNinja/hit_02.png';
import frogHit3 from '../../../assets/character/FrogNinja/hit_03.png';
import frogHit4 from '../../../assets/character/FrogNinja/hit_04.png';
import frogHit5 from '../../../assets/character/FrogNinja/hit_05.png';
import frogHit6 from '../../../assets/character/FrogNinja/hit_06.png';
import frogHit7 from '../../../assets/character/FrogNinja/hit_07.png';

const idleSrcs = [frogIdle1, frogIdle2, frogIdle3, frogIdle4, frogIdle5, frogIdle6, frogIdle7, frogIdle8, frogIdle9, frogIdle10, frogIdle11];
const runSrcs = [frogRun1, frogRun2, frogRun3, frogRun4, frogRun5, frogRun6, frogRun7, frogRun8, frogRun9, frogRun10, frogRun11, frogRun12];
const hitSrcs = [frogHit7, frogHit1, frogHit2, frogHit3, frogHit4, frogHit5, frogHit6];

export default function ShurikenGame({ onClose, user, socket }) {
  const { width: gameWidth, height: gameHeight } = useGameWindowSize();
  
  const [view, setView] = useState('menu'); // menu, lobby, playing, ended
  const [roomsList, setRoomsList] = useState([]);
  const [roomState, setRoomState] = useState(null);
  
  // Audio/Canvas/Refs
  const canvasRef = useRef(null);
  const gameStateRef = useRef(null);
  
  const imagesRef = useRef({
    ground: null, shuriken: null, jump: null, fall: null,
    idles: [], runs: [], hits: []
  });

  // Preload images
  useEffect(() => {
    const loadImg = (src) => {
      const img = new Image();
      img.src = src;
      return img;
    };
    imagesRef.current.ground = loadImg(groundGreenImg);
    imagesRef.current.shuriken = loadImg(shurikenImg);
    imagesRef.current.jump = loadImg(frogJumpImg);
    imagesRef.current.fall = loadImg(frogFallImg);
    imagesRef.current.idles = idleSrcs.map(loadImg);
    imagesRef.current.runs = runSrcs.map(loadImg);
    imagesRef.current.hits = hitSrcs.map(loadImg);
  }, []);

  // Socket logic
  useEffect(() => {
    if (!socket || !user) return;

    const handleRoomsList = (list) => {
      setRoomsList(list);
    };

    const handleState = (state) => {
      console.log('Received shuriken_state:', state.status, 'current view:', view);
      setRoomState(state);
      gameStateRef.current = state;
      if (state.status === 'playing' && view !== 'playing') {
        console.log('Transitioning to playing...');
        setView('playing');
        startGameLoop();
      } else if (state.status === 'ended' && view !== 'ended') {
        console.log('Transitioning to ended...');
        setView('ended');
      } else if (state.status === 'waiting' && view !== 'lobby') {
        console.log('Transitioning to lobby...');
        setView('lobby');
      }
    };

    const handleEvent = (ev) => {
      if (ev.type === 'hit') {
        // Trigger hit animation visually for targetId
        if (gameStateRef.current && gameStateRef.current.players[ev.targetId]) {
          gameStateRef.current.players[ev.targetId].hitFrame = 0;
        }
      }
    };

    const handleClosed = () => {
      toast.error('Phòng đã bị đóng.');
      setView('menu');
      setRoomState(null);
      socket.emit('shuriken_get_rooms', { user });
    };

    const handleError = (msg) => {
      toast.error(msg);
      console.error('Shuriken error:', msg);
    };

    socket.on('shuriken_rooms_list', handleRoomsList);
    socket.on('shuriken_state', handleState);
    socket.on('shuriken_event', handleEvent);
    socket.on('shuriken_room_closed', handleClosed);
    socket.on('shuriken_error', handleError);

    if (view === 'menu') {
      socket.emit('shuriken_get_rooms', { user });
    }

    return () => {
      socket.off('shuriken_rooms_list', handleRoomsList);
      socket.off('shuriken_state', handleState);
      socket.off('shuriken_event', handleEvent);
      socket.off('shuriken_room_closed', handleClosed);
      socket.off('shuriken_error', handleError);
    };
  }, [socket, user, view]);

  // Actions
  const handleCreateRoom = () => {
    socket.emit('shuriken_create_room', { user });
  };
  const handleJoinRoom = (host) => {
    socket.emit('shuriken_join_room', { user, hostUsername: host });
  };
  const handleLeaveRoom = () => {
    if (roomState?.host) {
      socket.emit('shuriken_leave_room', { user, hostUsername: roomState.host });
    }
    setView('menu');
    setRoomState(null);
    socket.emit('shuriken_get_rooms', { user });
  };
  const handleAddBot = () => {
    socket.emit('shuriken_add_bot', { user, hostUsername: roomState.host });
  };
  const handleRemoveBot = (botId) => {
    socket.emit('shuriken_remove_bot', { user, hostUsername: roomState.host, botId });
  };
  const handleReady = () => {
    socket.emit('shuriken_ready', { user, hostUsername: roomState.host });
  };
  const handleStart = () => {
    socket.emit('shuriken_start_game', { user, hostUsername: roomState.host });
  };

  // Game Loop
  const requestRef = useRef();
  const keys = useRef({ left: false, right: false, jump: false, shoot: false });
  const localPlayerState = useRef({ x: 200, y: 100, vy: 0, isWalking: false, dirX: 1, lastShoot: 0 });

  useEffect(() => {
    if (view !== 'playing' && requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
  }, [view]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'w', ' ', 'Enter', 'e'].includes(e.key) && view === 'playing') {
        e.preventDefault();
      }
      if (e.key === 'ArrowLeft' || e.key === 'a') keys.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') keys.current.right = true;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') keys.current.jump = true;
      if (e.key === 'Enter' || e.key === 'e') keys.current.shoot = true;
    };
    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keys.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') keys.current.right = false;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') keys.current.jump = false;
      if (e.key === 'Enter' || e.key === 'e') keys.current.shoot = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Camera/Spectator logic
  const spectatorTargetRef = useRef(null); // Which player ID we are watching if dead

  const startGameLoop = () => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    let lastTime = performance.now();
    let frameCount = 0;
    
    const loop = (time) => {
      if (gameStateRef.current && gameStateRef.current.status !== 'playing') {
        // Stop rendering if game ended
        return;
      }
      if (!canvasRef.current) {
        requestRef.current = requestAnimationFrame(loop);
        return;
      }
      const canvas = canvasRef.current;
      if (!canvas) {
        requestRef.current = requestAnimationFrame(loop);
        return;
      }
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      frameCount++;
      
      const ctx = canvas.getContext('2d');
      const cw = canvas.width;
      const ch = canvas.height;
      const MAP_W = 1600; // Large scrolling map
      const MAP_H = 400;  // Fixed height
      
      const state = gameStateRef.current;
      
      // Determine Camera Target
      let camTarget = null;
      if (state && user) {
        const myPlayerServer = state.players[user.username];
        if (myPlayerServer && !myPlayerServer.isDead && !myPlayerServer.isAfk) {
          // Lock to self
          camTarget = { x: localPlayerState.current.x, y: localPlayerState.current.y };
          spectatorTargetRef.current = null;
        } else if (state.players) {
          // Dead -> Spectator mode
          const alivePlayers = Object.values(state.players).filter(p => !p.isDead);
          if (alivePlayers.length > 0) {
            // If we don't have a valid target, find the leader
            if (!spectatorTargetRef.current || !state.players[spectatorTargetRef.current] || state.players[spectatorTargetRef.current].isDead) {
              const leader = alivePlayers.reduce((prev, current) => (prev.kills > current.kills) ? prev : current);
              spectatorTargetRef.current = leader.id;
            }
            const targetP = state.players[spectatorTargetRef.current];
            if (targetP) {
              camTarget = { x: targetP.x, y: targetP.y };
            }
          }
        }
      }

      // Calculate camera transform
      // We scale height to fit screen, and center the X around the camera target
      const scale = ch / MAP_H;
      let camX = 0;
      
      if (camTarget) {
        // We want camTarget.x to be at cw / 2
        camX = (cw / 2) - (camTarget.x * scale);
        
        // Clamp camera to map bounds
        const minCamX = cw - (MAP_W * scale);
        if (camX > 0) camX = 0;
        if (camX < minCamX) camX = minCamX;
      }

      ctx.clearRect(0, 0, cw, ch);
      
      // Draw background sky (parallax could be added here)
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(0, 0, cw, ch);

      ctx.save();
      ctx.translate(camX, 0);
      ctx.scale(scale, scale);

      // --- RENDER GAME ---
      if (state) {
        // Draw Ground
        const groundY = 300;
        const groundImg = imagesRef.current.ground;
        if (groundImg) {
          for(let i=0; i<MAP_W; i+=32) {
            ctx.drawImage(groundImg, i, groundY, 32, 32);
            ctx.drawImage(groundImg, i, groundY+32, 32, 32);
          }
        }

        const myUsername = user.username;
        const myPlayerServer = state.players[myUsername];

        // Process Local Input if alive
        if (myPlayerServer && !myPlayerServer.isDead && !myPlayerServer.isAfk) {
          let lp = localPlayerState.current;
          
          // Movement
          let speed = 200;
          if (keys.current.left) { lp.x -= speed * dt; lp.dirX = -1; lp.isWalking = true; }
          else if (keys.current.right) { lp.x += speed * dt; lp.dirX = 1; lp.isWalking = true; }
          else { lp.isWalking = false; }

          // Boundaries
          if (lp.x < 16) lp.x = 16;
          if (lp.x > MAP_W - 16) lp.x = MAP_W - 16;

          // Gravity and Jump
          if (lp.y < groundY) {
            lp.vy += 1000 * dt;
          } else {
            lp.y = groundY;
            if (keys.current.jump) lp.vy = -400;
            else lp.vy = 0;
          }
          lp.y += lp.vy * dt;

          // Shoot
          if (keys.current.shoot && time - lp.lastShoot > 500 && myPlayerServer.ammo > 0) {
            // Calculate angle to nearest alive enemy
            let nearest = null;
            let minDist = Infinity;
            Object.values(state.players).forEach(p => {
              if (p.id !== myUsername && !p.isDead && !p.isInvulnerable) {
                const dist = Math.sqrt((p.x - lp.x)**2 + (p.y - lp.y)**2);
                if (dist < minDist) { minDist = dist; nearest = p; }
              }
            });
            let angle = lp.dirX === 1 ? 0 : Math.PI; // default forward
            if (nearest) {
              angle = Math.atan2(nearest.y - lp.y, nearest.x - lp.x);
            }
            socket.emit('shuriken_shoot', { user, hostUsername: state.host, angle });
            lp.lastShoot = time;
            keys.current.shoot = false; // require re-press
          }

          // Emit state 20 times per sec
          if (frameCount % 3 === 0) {
            socket.emit('shuriken_player_move', {
              user, hostUsername: state.host,
              x: lp.x, y: lp.y, vy: lp.vy, isWalking: lp.isWalking, dirX: lp.dirX
            });
          }
        }

        // Draw Projectiles
        const shurikenImg = imagesRef.current.shuriken;
        state.projectiles.forEach(proj => {
          if (shurikenImg) {
            ctx.save();
            ctx.translate(proj.x, proj.y);
            ctx.rotate(time * 0.02);
            ctx.drawImage(shurikenImg, -10, -10, 20, 20);
            ctx.restore();
          } else {
            ctx.fillStyle = 'black';
            ctx.fillRect(proj.x-5, proj.y-5, 10, 10);
          }
        });

        // Draw Players
        Object.values(state.players).forEach(p => {
          if (p.isDead) return;

          // Use local coords for self if possible for smoothness, otherwise server coords
          const drawX = (p.id === myUsername && !p.isDead && !p.isAfk) ? localPlayerState.current.x : p.x;
          const drawY = (p.id === myUsername && !p.isDead && !p.isAfk) ? localPlayerState.current.y : p.y;
          const drawDir = (p.id === myUsername) ? localPlayerState.current.dirX : (p.dirX || 1);
          const drawVy = (p.id === myUsername) ? localPlayerState.current.vy : (p.vy || 0);
          const drawWalk = (p.id === myUsername) ? localPlayerState.current.isWalking : p.isWalking;

          ctx.save();
          ctx.translate(drawX, drawY);

          // Invulnerable blink
          if (p.isInvulnerable && Math.floor(time/100)%2===0) {
            ctx.globalAlpha = 0.5;
          }

          ctx.scale(drawDir, 1);

          // Determine Image
          let img = imagesRef.current.idles[Math.floor(frameCount/10)%idleSrcs.length];
          
          if (p.hitFrame !== undefined && p.hitFrame < hitSrcs.length) {
            img = imagesRef.current.hits[p.hitFrame];
            if (frameCount % 4 === 0) p.hitFrame++;
          } else if (drawVy < -20) {
            img = imagesRef.current.jump;
          } else if (drawVy > 20) {
            img = imagesRef.current.fall;
          } else if (drawWalk) {
            img = imagesRef.current.runs[Math.floor(frameCount/5)%runSrcs.length];
          }

          if (img) {
            ctx.drawImage(img, -20, -32, 40, 40); // Offset anchor slightly to foot
          }

          ctx.restore();
          
          // Mini HP Bar
          ctx.fillStyle = 'red';
          ctx.fillRect(drawX - 15, drawY - 40, 30, 4);
          ctx.fillStyle = 'lime';
          ctx.fillRect(drawX - 15, drawY - 40, 30 * (p.hp / 5), 4);
          
          // Name Tag
          ctx.fillStyle = 'white';
          ctx.font = '10px var(--font-pixel)';
          ctx.textAlign = 'center';
          ctx.fillText(p.displayName, drawX, drawY - 45);
        });
      }

      ctx.restore();
      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Handle clicking to change spectator target
  const handleCanvasClick = () => {
    if (view === 'playing' && roomState) {
      const myPlayer = roomState.players[user.username];
      if (!myPlayer || myPlayer.isDead) {
        // Spectator mode -> Cycle to next alive player
        const alivePlayers = Object.values(roomState.players).filter(p => !p.isDead);
        if (alivePlayers.length > 1) {
          const currentIndex = alivePlayers.findIndex(p => p.id === spectatorTargetRef.current);
          const nextIndex = (currentIndex + 1) % alivePlayers.length;
          spectatorTargetRef.current = alivePlayers[nextIndex].id;
        }
      }
    }
  };

  // -- UI RENDERING --
  
  if (view === 'menu') {
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: '#0f172a', display: 'flex', flexDirection: 'column', color: 'white', fontFamily: 'var(--font-pixel)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10, alignItems: 'center' }}>
            <h1 style={{ margin: 0, color: '#facc15', fontSize: '24px' }}>Ném Phi Tiêu</h1>
            <button 
              onClick={onClose} 
              style={{ 
                background: 'transparent', 
                border: 'none', 
                fontSize: '18px', 
                cursor: 'pointer',
                fontFamily: 'var(--font-pixel)',
                fontWeight: 'bold',
                color: '#ef4444'
              }}
            >
              [x]
            </button>
          </div>
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Danh sách phòng</h2>
              <button className="pixel-btn" style={{ background: '#3b82f6', color: 'white', padding: '10px 20px', border: '4px solid #1e3a8a' }} onClick={handleCreateRoom}>Tạo Phòng Mới</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {roomsList.length === 0 ? <p style={{ color: 'rgba(255,255,255,0.5)' }}>Chưa có phòng nào. Hãy tạo phòng mới!</p> : roomsList.map(r => (
                <div key={r.host} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '8px', alignItems: 'center' }}>
                  <span>Phòng của: <strong style={{ color: '#facc15' }}>{r.host}</strong></span>
                  <span>{r.playerCount}/4 người</span>
                  <button className="pixel-btn" style={{ background: '#10b981', color: 'white', padding: '5px 15px', border: '4px solid #047857' }} onClick={() => handleJoinRoom(r.host)}>Tham gia</button>
                </div>
              ))}
            </div>
          </div>
        </div>
    );
  }

  if (view === 'lobby') {
    const isHost = roomState?.host === user.username;
    const players = roomState ? Object.values(roomState.players) : [];
    const allReady = players.every(p => p.isReady);

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: '#0f172a', display: 'flex', flexDirection: 'column', color: 'white', fontFamily: 'var(--font-pixel)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10 }}>
            <h1 style={{ margin: 0, color: '#facc15' }}>Phòng chờ: {roomState?.host}</h1>
            <button onClick={handleLeaveRoom} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Rời Phòng</button>
          </div>
          <div style={{ flex: 1, padding: '20px', display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '10px' }}>
              <h3>Người chơi ({players.length}/5)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                {players.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '5px', alignItems: 'center' }}>
                    <span>{p.displayName} {p.isBot && <span style={{ color: '#a855f7', fontSize: '0.8em' }}>[BOT - {p.difficulty}]</span>}</span>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{ color: p.isReady ? '#10b981' : '#ef4444' }}>{p.isReady ? 'Sẵn sàng' : 'Đang chờ...'}</span>
                      {isHost && p.isBot && (
                        <button onClick={() => handleRemoveBot(p.id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '3px 8px', borderRadius: '3px', cursor: 'pointer' }}>X</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {isHost && (
                <button className="pixel-btn" onClick={handleAddBot} disabled={players.length >= 5} style={{ background: '#8b5cf6', color: 'white', padding: '15px', border: '4px solid #5b21b6' }}>
                  Thêm Bot
                </button>
              )}
              {!isHost ? (
                <button className="pixel-btn" onClick={handleReady} style={{ background: '#3b82f6', color: 'white', padding: '15px', border: '4px solid #1e3a8a' }}>
                  Sẵn Sàng
                </button>
              ) : (
                <button className="pixel-btn" onClick={handleStart} disabled={!allReady} style={{ background: allReady ? '#10b981' : '#64748b', color: 'white', padding: '15px', border: allReady ? '4px solid #047857' : '4px solid #334155' }}>
                  Bắt Đầu
                </button>
              )}
            </div>
          </div>
        </div>
    );
  }

  // view === 'playing' || view === 'ended'
  const myPlayer = roomState?.players[user.username];
  return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: '#0f172a', display: 'flex', flexDirection: 'column', color: 'white', fontFamily: 'var(--font-pixel)', overflow: 'hidden' }}>
        
        {/* HUD */}
        {view === 'playing' && myPlayer && (
          <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 20, display: 'flex', gap: '20px', alignItems: 'center', background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '10px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#facc15' }}>MÁU (HP)</div>
              <div style={{ display: 'flex', gap: '2px', marginTop: '5px' }}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} style={{ width: '20px', height: '15px', backgroundColor: i < myPlayer.hp ? '#10b981' : '#334155', border: '1px solid #000' }} />
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#facc15' }}>PHI TIÊU</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{myPlayer.ammo} / {myPlayer.maxAmmo}</div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginLeft: '20vw' }}>
              00:{roomState.timer.toString().padStart(2, '0')}
            </div>
          </div>
        )}

        <canvas ref={canvasRef} onClick={handleCanvasClick} width={gameWidth} height={gameHeight} style={{ display: 'block', width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 1, imageRendering: 'pixelated' }} />

        {/* Spectator Indicator */}
        {view === 'playing' && myPlayer && myPlayer.isDead && (
           <div style={{ position: 'absolute', top: '100px', left: '50%', transform: 'translateX(-50%)', zIndex: 20, backgroundColor: 'rgba(0,0,0,0.6)', padding: '10px 20px', borderRadius: '20px', color: '#facc15' }}>
             Đang xem: {roomState.players[spectatorTargetRef.current]?.displayName || 'AI ĐÓ'} <br/>
             <span style={{ fontSize: '10px', color: 'white' }}>(Chạm vào màn hình để chuyển góc nhìn)</span>
           </div>
        )}

        {/* Controls Overlay */}
        {view === 'playing' && myPlayer && !myPlayer.isDead && (
          <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', zIndex: 20, display: 'flex', justifyContent: 'space-between', pointerEvents: 'none' }} onContextMenu={e => e.preventDefault()}>
            <div style={{ display: 'flex', gap: '15px', pointerEvents: 'auto' }}>
              <button className="pixel-btn" onTouchStart={() => keys.current.left=true} onTouchEnd={() => keys.current.left=false} onPointerDown={() => keys.current.left=true} onPointerUp={() => keys.current.left=false} onPointerLeave={() => keys.current.left=false} style={{ width: '60px', height: '60px', background: 'rgba(0,0,0,0.5)', border: '4px solid #fff', color: '#fff', fontSize: '24px', userSelect: 'none', touchAction: 'none' }}>◀</button>
              <button className="pixel-btn" onTouchStart={() => keys.current.right=true} onTouchEnd={() => keys.current.right=false} onPointerDown={() => keys.current.right=true} onPointerUp={() => keys.current.right=false} onPointerLeave={() => keys.current.right=false} style={{ width: '60px', height: '60px', background: 'rgba(0,0,0,0.5)', border: '4px solid #fff', color: '#fff', fontSize: '24px', userSelect: 'none', touchAction: 'none' }}>▶</button>
            </div>
            <div style={{ display: 'flex', gap: '15px', pointerEvents: 'auto' }}>
              <button className="pixel-btn" onTouchStart={() => keys.current.shoot=true} onTouchEnd={() => keys.current.shoot=false} onPointerDown={() => keys.current.shoot=true} onPointerUp={() => keys.current.shoot=false} onPointerLeave={() => keys.current.shoot=false} style={{ width: '60px', height: '60px', background: 'rgba(239,68,68,0.7)', border: '4px solid #991b1b', color: '#fff', borderRadius: '50%', fontSize: '24px', userSelect: 'none', touchAction: 'none' }}>🎯</button>
              <button className="pixel-btn" onTouchStart={() => keys.current.jump=true} onTouchEnd={() => keys.current.jump=false} onPointerDown={() => keys.current.jump=true} onPointerUp={() => keys.current.jump=false} onPointerLeave={() => keys.current.jump=false} style={{ width: '60px', height: '60px', background: 'rgba(59,130,246,0.7)', border: '4px solid #1e3a8a', color: '#fff', borderRadius: '50%', fontSize: '24px', userSelect: 'none', touchAction: 'none' }}>▲</button>
            </div>
          </div>
        )}

        {view === 'ended' && roomState && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ backgroundColor: '#1e293b', border: '4px solid #facc15', borderRadius: '20px', padding: '30px', minWidth: '500px', transform: 'scale(0.9)' }}>
              <h2 style={{ color: '#facc15', textAlign: 'center', fontSize: '2rem', margin: 0, marginBottom: '20px' }}>KẾT QUẢ</h2>
              <table style={{ width: '100%', textAlign: 'center', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #334155', color: '#cbd5e1' }}>
                    <th style={{ padding: '10px' }}>Người Chơi</th>
                    <th>Ném trúng</th>
                    <th>Bị trúng</th>
                    <th>Kills</th>
                    <th>Thưởng Xu</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(roomState.players).sort((a,b) => b.finalReward - a.finalReward).map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: '15px', fontWeight: 'bold', color: p.isDead ? '#94a3b8' : '#facc15' }}>{p.displayName} {p.isAfk ? '(AFK)' : ''}</td>
                      <td>{p.hits}</td>
                      <td>{p.taken}</td>
                      <td>{p.kills}</td>
                      <td style={{ color: '#10b981', fontWeight: 'bold' }}>+{p.finalReward}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <button className="pixel-btn" onClick={() => {
                  if (roomState.host === user.username) {
                    socket.emit('shuriken_return_lobby', { user, hostUsername: roomState.host });
                  } else {
                    toast.info('Đang chờ chủ phòng...');
                  }
                }} style={{ background: '#3b82f6', color: 'white', padding: '10px 30px', border: '4px solid #1e3a8a', fontSize: '1.2rem' }}>
                  {roomState.host === user.username ? 'Quay Lại Phòng' : 'Chờ Chủ Phòng...'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
  );
}
