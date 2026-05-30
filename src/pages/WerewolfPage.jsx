import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import BottomNav from '../components/BottomNav';
import PixelCanvas from '../components/PixelCanvas';
import { toast } from '../utils/toast';
import styles from './WerewolfPage.module.css';

const SOCKET_SERVER_URL = import.meta.env.VITE_API_URL || '';

export default function WerewolfPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [socket, setSocket] = useState(null);
  const [inRoom, setInRoom] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [gameState, setGameState] = useState(null);
  const [showDeck, setShowDeck] = useState(false);


  useEffect(() => {
    if (!user) return;

    const newSocket = io(SOCKET_SERVER_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to WW socket:', newSocket.id);
    });

    newSocket.on('werewolf_state', (state) => {
      setGameState(state);
    });

    newSocket.on('ww_error', (msg) => {
      toast.error(msg);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const joinRoom = (e) => {
    e.preventDefault();
    if (!socket || !roomId.trim()) return;
    
    socket.emit('ww_join', {
      roomId: roomId.trim().toLowerCase(),
      username: user.username,
      displayName: user.displayName || user.username
    });
    setInRoom(true);
  };

  const handleReady = () => {
    if (socket) socket.emit('ww_ready');
  };

  const handleStart = () => {
    if (socket) socket.emit('ww_start');
  };

  const leaveRoom = () => {
    setInRoom(false);
    setGameState(null);
    if (socket) {
      socket.disconnect();
      const newSocket = io(SOCKET_SERVER_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling']
      });
      newSocket.on('werewolf_state', setGameState);
      newSocket.on('ww_error', msg => toast.error(msg));
      setSocket(newSocket);
    }
  };

  if (!user) return null;

  if (!inRoom || !gameState) {
    return (
      <div className={styles.page}>
        <PixelCanvas />
        <main className={styles.main}>
          <header className={`${styles.header} rpg-box fade-in`}>
            <div className="px-titlebar">
              <button className="px-btn-close" onClick={() => navigate('/utilities')}></button>
              <span>◄ MA SÓI ►</span>
            </div>
          </header>
          
          <div className={`${styles.joinBox} rpg-box fade-in fade-in-delay-1`}>
            <h2>Nhập Mã Phòng</h2>
            <form onSubmit={joinRoom} className={styles.joinForm}>
              <input
                type="text"
                placeholder="VD: phong123"
                value={roomId}
                onChange={e => setRoomId(e.target.value)}
                maxLength={20}
                required
              />
              <button type="submit" className="rpg-btn">Vào Phòng</button>
            </form>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  // --- LOBBY VIEW ---
  if (gameState.status === 'waiting') {
    const me = gameState.players[socket.id];
    const isHost = me?.host;
    const allReady = Object.values(gameState.players).every(p => p.ready);
    const playerCount = Object.keys(gameState.players).length;

    return (
      <div className={styles.page}>
        <PixelCanvas />
        <main className={styles.main}>
          <header className={`${styles.header} rpg-box`}>
            <div className="px-titlebar">
              <button className="px-btn-close" onClick={leaveRoom}></button>
              <span>Phòng: {gameState.id.toUpperCase()}</span>
            </div>
          </header>

          <div className={`${styles.lobbyBox} rpg-box`}>
            <h3>Người chơi ({playerCount}/8+)</h3>
            <ul className={styles.playerList}>
              {Object.values(gameState.players).map(p => (
                <li key={p.id} className={`${styles.playerItem} ${p.ready ? styles.ready : ''}`}>
                  <span>{p.host ? '👑' : ''} {p.displayName}</span>
                  <span className={styles.status}>{p.ready ? 'Sẵn sàng' : 'Đang chờ...'}</span>
                </li>
              ))}
            </ul>

            <div className={styles.utilityActions}>
              <button className="rpg-btn" onClick={() => setShowDeck(true)}>Xem Bộ Bài</button>
              <button className="rpg-btn" onClick={leaveRoom}>Thoát Phòng</button>
            </div>

            {showDeck && (
              <div className={styles.modalOverlay}>
                <div className={`${styles.modalContent} rpg-box`}>
                  <div className="px-titlebar">
                    <button className="px-btn-close" onClick={() => setShowDeck(false)}></button>
                    <span>CHI TIẾT BỘ BÀI</span>
                  </div>
                  <div className={styles.deckList}>
                    <p>Bộ bài sẽ được hiển thị chi tiết ở đây (đang cập nhật list chức năng)...</p>
                  </div>
                </div>
              </div>
            )}

            {isHost && (
              <div className={styles.hostSettings}>
                <h4>Cài Đặt Phòng</h4>
                <label>
                  <input type="checkbox" checked={gameState.settings.revealRoleOnDeath} 
                         onChange={e => socket.emit('ww_update_settings', { revealRoleOnDeath: e.target.checked })} />
                  Lật bài khi chết
                </label>
                <label>
                  <input type="checkbox" checked={gameState.settings.spectatorMode} 
                         onChange={e => socket.emit('ww_update_settings', { spectatorMode: e.target.checked })} />
                  Khán giả (người chết thấy hết)
                </label>
                
                <div className={styles.deckSelector}>
                  {/* Basic deck for test: 2 wolves, 1 seer, 1 witch, 4 villagers */}
                  <button className="rpg-btn" onClick={() => {
                     socket.emit('ww_update_settings', {
                       rolesList: ['MA_SOI', 'MA_SOI', 'TIEN_TRI', 'PHU_THUY', 'DAN_LANG', 'DAN_LANG', 'DAN_LANG', 'DAN_LANG']
                     });
                  }}>Chọn Bộ Bài Mặc Định (8)</button>
                  <p>Số lá bài hiện tại: {gameState.settings.rolesList?.length || 0}</p>
                </div>
              </div>
            )}

            <div className={styles.lobbyActions}>
               <button className="rpg-btn" onClick={handleReady}>
                 {me?.ready ? 'Hủy Sẵn Sàng' : 'Sẵn Sàng'}
               </button>
               {isHost && (
                 <button className="rpg-btn highlight" onClick={handleStart} disabled={!allReady || playerCount < 8}>
                   BẮT ĐẦU GAME
                 </button>
               )}
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  // --- IN GAME VIEW ---
  const me = gameState.players[socket.id];
  const isNight = gameState.status === 'night';
  const isEnded = gameState.status === 'ended';
  
  return (
    <div className={`${styles.page} ${isNight ? styles.nightMode : styles.dayMode}`}>
      <PixelCanvas />
      <main className={styles.main}>
        
        {/* Status Header */}
        <div className={`${styles.gameHeader} rpg-box`}>
          <div className="px-titlebar">
            <span>
              {isEnded ? 'KẾT THÚC' : (isNight ? `ĐÊM ${gameState.round}` : `NGÀY ${gameState.round}`)}
            </span>
          </div>
          <div className={styles.timer}>
            ⏱ {gameState.timer}s
          </div>
        </div>

        {/* My Info */}
        <div className={`${styles.myInfo} rpg-box`}>
          <h3>Bạn là: {me?.role || 'Khán Giả'}</h3>
          {!me?.isAlive && <p className={styles.deadText}>💀 Bạn đã chết.</p>}
          {me?.hasSheriffBadge && <p className={styles.sheriffText}>⭐ Bạn là Cảnh Sát Trưởng</p>}
        </div>

        {/* Active Action Panel */}
        {isNight && me?.isAlive && gameState.nightState?.isMyTurn && (
          <div className={`${styles.actionPanel} rpg-box highlight`}>
            <h3>Lượt của bạn!</h3>
            <p>Vui lòng chọn mục tiêu hoặc thực hiện thao tác (chưa có UI chi tiết cho role này).</p>
            {/* TODO: Add specific UI based on role */}
          </div>
        )}

        {/* Voting Panel */}
        {gameState.status === 'day_voting' && me?.isAlive && (
           <div className={`${styles.actionPanel} rpg-box`}>
              <h3>Bỏ Phiếu Treo Cổ!</h3>
              <p>Chọn 1 người để vote.</p>
           </div>
        )}

        {/* Players List */}
        <div className={`${styles.ingamePlayers} rpg-box`}>
          <h3>Người chơi</h3>
          <ul className={styles.playerList}>
            {Object.values(gameState.players).map(p => (
              <li key={p.id} className={`${styles.playerItem} ${!p.isAlive ? styles.dead : ''}`}
                  onClick={() => {
                    if (gameState.status === 'day_voting' && me?.isAlive && p.isAlive) {
                       socket.emit('ww_vote', p.id);
                    }
                  }}>
                <span className={styles.pName}>
                   {!p.isAlive && '💀 '}
                   {p.hasSheriffBadge && '⭐ '}
                   {p.displayName}
                </span>
                
                {/* Show visible roles */}
                {gameState.visibleRoles && gameState.visibleRoles[p.id] && (
                   <span className={styles.pRole}>[{gameState.visibleRoles[p.id]}]</span>
                )}
                
                {/* Show votes */}
                {gameState.status === 'day_voting' && p.voteCount > 0 && (
                   <span className={styles.voteBadge}>{p.voteCount} vote</span>
                )}
              </li>
            ))}
          </ul>
        </div>

      </main>
      <BottomNav />
    </div>
  );
}
