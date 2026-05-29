import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import PixelCanvas from '../components/PixelCanvas';
import BottomNav from '../components/BottomNav';
import styles from './SpyPage.module.css';


export default function SpyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const socketRef = useRef(null);

  // Connection states
  const [inRoom, setInRoom] = useState(false);
  const [roomName, setRoomName] = useState('phong_vip');
  const [errorMsg, setErrorMsg] = useState('');

  // Game states received from server
  const [gameState, setGameState] = useState(null);
  const [showSecret, setShowSecret] = useState(false);
  const [announcements, setAnnouncements] = useState([]);

  // Connect & Join Room
  const handleJoinRoom = () => {
    if (!roomName.trim()) {
      setErrorMsg('Vui lòng nhập mã phòng!');
      return;
    }
    setErrorMsg('');

    socketRef.current = io(import.meta.env.VITE_API_URL || window.location.origin.replace('5173', '3001'), {
      reconnection: true,
      transports: ['websocket', 'polling']
    });

    socketRef.current.on('connect', () => {
      socketRef.current.emit('spy_join', {
        roomId: roomName.trim(),
        username: user?.username,
        displayName: user?.displayName || user?.username
      });
      setInRoom(true);
      setAnnouncements([]);
    });

    socketRef.current.on('spy_error', (msg) => {
      setErrorMsg(msg);
      // If mid-game error or full, disconnect
      if (!gameState) {
        socketRef.current.disconnect();
        setInRoom(false);
      }
    });

    socketRef.current.on('spy_state', (state) => {
      setGameState(state);
    });

    socketRef.current.on('spy_announcement', (msg) => {
      setAnnouncements((prev) => [...prev, msg].slice(-5)); // keep last 5
    });

    socketRef.current.on('disconnect', () => {
      setInRoom(false);
      setGameState(null);
    });
  };

  const handleToggleReady = () => {
    if (socketRef.current) {
      socketRef.current.emit('spy_ready');
    }
  };

  const handleStartGame = () => {
    if (socketRef.current) {
      socketRef.current.emit('spy_start');
    }
  };

  const handleVote = (targetSocketId) => {
    if (socketRef.current) {
      socketRef.current.emit('spy_vote', { targetSocketId });
    }
  };

  const handleLeaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.emit('spy_leave');
      socketRef.current.disconnect();
    }
    setInRoom(false);
    setGameState(null);
    setShowSecret(false);
    setAnnouncements([]);
  };

  // Disconnect socket on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Return word style class
  const getRoleBadge = (playerSid, isSpy, playerRoles) => {
    const roleObj = playerRoles?.[playerSid];
    if (!roleObj) return '';
    return roleObj.isSpy ? styles.spyBadge : styles.civBadge;
  };

  return (
    <div className={styles.page}>
      <PixelCanvas />

      <main className={styles.main}>
        {/* Header */}
        <header className={`${styles.header} rpg-box fade-in`}>
          <div className="px-titlebar">
            <span>◄ TRÒ CHƠI GIÁN ĐIỆP ►</span>
          </div>
          <button className={styles.closeBtn} onClick={() => { handleLeaveRoom(); navigate('/utilities'); }}>
            ✕
          </button>
        </header>

        {errorMsg && <div className={`${styles.errorAlert} rpg-box`}>{errorMsg}</div>}

        {!inRoom ? (
          /* SECTION 1: Lobby Entry screen */
          <div className={`${styles.setupCard} rpg-box fade-in fade-in-delay-1`}>
            <h2 className={styles.title}>CHƠI MẶT-ĐỐI-MẶT (OFFLINE PARTY)</h2>
            <p className={styles.introText}>
              Trò chơi thích hợp khi nhóm bạn đang ngồi cạnh nhau trực tiếp. 
              Hãy cùng lập phòng, chia vai trò bí mật qua màn hình điện thoại và bắt đầu thảo luận, bỏ phiếu loại trừ gián điệp!
            </p>

            <div className={styles.inputGroup}>
              <label className={styles.label}>NHẬP MÃ PHÒNG ĐẤU</label>
              <input
                type="text"
                className={`${styles.input} rpg-input`}
                value={roomName}
                onChange={(e) => setRoomName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                maxLength={20}
                placeholder="Ví dụ: phong_vui_ve"
              />
            </div>

            <button className={`${styles.primaryBtn} rpg-button`} onClick={handleJoinRoom}>
              VÀO PHÒNG CHỜ 🚀
            </button>
          </div>
        ) : !gameState ? (
          /* Connecting Loading Screen */
          <div className={`${styles.setupCard} rpg-box fade-in`}>
            <div className={styles.loading}>ĐANG KẾT NỐI VÀO PHÒNG CHỜ...</div>
          </div>
        ) : (
          /* SECTION 2: Active Room Screen */
          <div className={styles.roomContent}>
            {/* Upper Info Row */}
            <div className={styles.infoRow}>
              <div className={`${styles.roomBadge} rpg-box`}>
                PHÒNG: <span className={styles.highlightText}>{gameState.id}</span>
              </div>

              {gameState.status === 'discussing' && (
                <div className={`${styles.timerBadge} rpg-box ${styles.timerDiscuss}`}>
                  💬 THẢO LUẬN: <span className={styles.countdown}>{gameState.timer}s</span>
                </div>
              )}

              {gameState.status === 'voting' && (
                <div className={`${styles.timerBadge} rpg-box ${styles.timerVote}`}>
                  🗳️ BỎ PHIẾU: <span className={styles.countdown}>{gameState.timer}s</span>
                </div>
              )}

              {gameState.status === 'ended' && (
                <div className={`${styles.timerBadge} rpg-box ${styles.timerEnded}`}>
                  🏆 KẾT THÚC
                </div>
              )}
            </div>

            {/* Main Panel grid */}
            <div className={styles.gridContainer}>
              
              {/* LEFT SIDE: Players List */}
              <div className={`${styles.playersPanel} rpg-box fade-in`}>
                <div className={styles.panelTitle}>DANH SÁCH NGƯỜI CHƠI ({Object.keys(gameState.players).length})</div>
                
                <div className={styles.playersList}>
                  {Object.entries(gameState.players).map(([sid, p]) => {
                    const isSelf = sid === socketRef.current?.id;
                    const voteForMe = Object.values(gameState.votes || {}).filter(target => target === sid).length;

                    return (
                      <div
                        key={sid}
                        className={`${styles.playerCard} rpg-box ${
                          p.isEliminated ? styles.eliminatedCard : ''
                        } ${isSelf ? styles.selfCard : ''}`}
                      >
                        <div className={styles.playerMeta}>
                          <span className={styles.playerName}>
                            {p.displayName} {isSelf && <span className={styles.selfLabel}>(Bạn)</span>}
                          </span>
                          <div className={styles.badgeRow}>
                            {p.host && <span className={styles.hostBadge}>👑 Chủ phòng</span>}
                            {p.ready && gameState.status === 'waiting' && <span className={styles.readyBadge}>Đã Sẵn Sàng</span>}
                            {!p.ready && gameState.status === 'waiting' && <span className={styles.notReadyBadge}>Chờ</span>}
                            {p.isEliminated && <span className={styles.eliminatedBadge}>💀 ĐÃ BỊ LOẠI</span>}
                          </div>
                        </div>

                        {/* Votes Indicator */}
                        {gameState.status === 'voting' && !p.isEliminated && (
                          <div className={styles.voteIndicator}>
                            🗳️ {p.voteCount || 0} phiếu bầu
                          </div>
                        )}

                        {/* Vote Button */}
                        {gameState.status === 'voting' && !gameState.myEliminated && !p.isEliminated && !isSelf && (
                          <button
                            className={`${styles.voteBtn} rpg-button ${gameState.votes[socketRef.current?.id] === sid ? styles.votedBtn : ''}`}
                            onClick={() => handleVote(sid)}
                            disabled={gameState.votes[socketRef.current?.id] === sid}
                          >
                            {gameState.votes[socketRef.current?.id] === sid ? 'ĐÃ VOTE ✔' : 'VOTE LOẠI 🗳️'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT SIDE: Game controls & Secret Panel */}
              <div className={`${styles.actionsPanel} rpg-box fade-in`}>
                
                {/* LOBBY / WAITING STATE */}
                {gameState.status === 'waiting' && (
                  <div className={styles.lobbyPanel}>
                    <div className={styles.panelTitle}>TRẠNG THÁI PHÒNG CHỜ</div>
                    <p className={styles.lobbyGuide}>
                      Yêu cầu tối thiểu **3 người chơi** và tất cả mọi người cùng nhấn **Sẵn sàng** để Chủ phòng có thể bắt đầu trận đấu!
                    </p>

                    <div className={styles.lobbyButtons}>
                      <button
                        className={`${styles.readyToggleBtn} rpg-button ${gameState.players[socketRef.current?.id]?.ready ? styles.readyActive : ''}`}
                        onClick={handleToggleReady}
                      >
                        {gameState.players[socketRef.current?.id]?.ready ? '❌ HỦY SẴN SÀNG' : '✔ SẴN SÀNG'}
                      </button>

                      {gameState.myHost && (
                        <button
                          className={`${styles.startBtn} rpg-button`}
                          onClick={handleStartGame}
                          disabled={
                            Object.keys(gameState.players).length < 3 ||
                            !Object.values(gameState.players).every(p => p.ready)
                          }
                        >
                          🔥 BẮT ĐẦU CHƠI
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* DISCUSSING / VOTING STATE */}
                {(gameState.status === 'discussing' || gameState.status === 'voting') && (
                  <div className={styles.activeGamePanel}>
                    <div className={styles.categoryBadge}>
                      Chủ đề: <span className={styles.categoryName}>{gameState.category}</span>
                    </div>

                    <div className={styles.roundTitle}>VÒNG THẢO LUẬN #{gameState.round}</div>

                    {/* SECRET PEERING BOX */}
                    <div className={`${styles.peeringCard} rpg-box`}>
                      <div className={styles.peeringGuide}>
                        TỪ KHÓA BÍ MẬT CỦA BẠN (HÃY BẢO MẬT):
                      </div>

                      <div className={styles.wordRevealBox}>
                        {showSecret ? (
                          <div className={styles.revealedWord}>{gameState.myWord}</div>
                        ) : (
                          <div className={styles.hiddenWord}>● ● ● ● ● ●</div>
                        )}
                      </div>

                      <button
                        className={`${styles.revealBtn} rpg-button ${showSecret ? styles.hideBtn : ''}`}
                        onClick={() => setShowSecret(!showSecret)}
                      >
                        {showSecret ? '🙈 ẨN TỪ KHÓA BÍ MẬT' : '👁️ XEM TỪ KHÓA BÍ MẬT'}
                      </button>
                    </div>

                    <div className={styles.actionGuide}>
                      {gameState.status === 'discussing' ? (
                        <div className={styles.guideAlertDiscuss}>
                          🗣️ Hãy trò chuyện mặt-đối-mặt! Giải thích từ của bạn mà không nói trực tiếp từ đó ra để gián điệp không đoán được!
                        </div>
                      ) : (
                        <div className={styles.guideAlertVote}>
                          🗳️ ĐÃ TỚI GIỜ BỎ PHIẾU! Bấm nút [VOTE LOẠI] trên danh sách bên trái để bầu chọn người bạn nghi ngờ là Gián Điệp!
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ENDED GAME STATE */}
                {gameState.status === 'ended' && gameState.result && (
                  <div className={styles.endedPanel}>
                    <h2 className={`${styles.winnerTitle} ${gameState.result.winner === 'civilians' ? styles.civWin : styles.spyWin}`}>
                      {gameState.result.winner === 'civilians' ? '🎉 DÂN THƯỜNG THẮNG!' : '😈 GIÁN ĐIỆP THẮNG!'}
                    </h2>
                    
                    <p className={styles.resultMsg}>{gameState.result.message}</p>

                    <div className={styles.wordsSummary}>
                      <div className={styles.wordItem}>
                        <span className={styles.wordLabel}>Từ của Dân thường:</span>
                        <span className={styles.wordValCiv}>{gameState.result.words?.civilian}</span>
                      </div>
                      <div className={styles.wordItem}>
                        <span className={styles.wordLabel}>Từ của Gián điệp:</span>
                        <span className={styles.wordValSpy}>{gameState.result.words?.spy}</span>
                      </div>
                    </div>

                    {/* Awards list */}
                    {Object.keys(gameState.result.awards || {}).length > 0 && (
                      <div className={styles.awardsBox}>
                        <div className={styles.awardsTitle}>💰 TIỀN THƯỞNG XU NHẬN ĐƯỢC:</div>
                        {Object.entries(gameState.result.awards).map(([uname, amount]) => (
                          <div key={uname} className={styles.awardRow}>
                            <span>{uname}</span>
                            <span className={styles.awardAmt}>+{amount} Xu 🪙</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Roles reveal table */}
                    <div className={styles.rolesRevealTable}>
                      <div className={styles.tableTitle}>VAI TRÒ THỰC TẾ:</div>
                      <div className={styles.revealGrid}>
                        {Object.entries(gameState.result.playerRoles || {}).map(([sid, r]) => (
                          <div key={sid} className={`${styles.revealRow} ${r.isSpy ? styles.revealSpyRow : ''}`}>
                            <span className={styles.revealName}>{r.displayName}</span>
                            <span className={`${styles.revealRoleBadge} ${r.isSpy ? styles.revealSpyBadge : styles.revealCivBadge}`}>
                              {r.isSpy ? 'GIÁN ĐIỆP 😈' : 'DÂN THƯỜNG 🧑'}
                            </span>
                            <span className={styles.revealWordVal}>"{r.word}"</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={styles.resetTimer}>
                      Tự động quay về phòng chờ sau vài giây nữa...
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Socket announcements scroll */}
            {announcements.length > 0 && (
              <div className={`${styles.scrollLog} rpg-box`}>
                {announcements.map((announce, idx) => (
                  <div key={idx} className={styles.logLine}>
                    📜 {announce}
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Actions Area */}
            <div className={styles.bottomBar}>
              <button className={`${styles.leaveRoomBtn} rpg-button`} onClick={handleLeaveRoom}>
                🚪 RỜI PHÒNG ĐẤU
              </button>
            </div>

          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
