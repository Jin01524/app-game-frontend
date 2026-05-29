import React, { useState, useEffect } from 'react';
import PlayingCard from './PlayingCard';
import { evaluateCombo, canBeat } from '../../utils/tienLenLogic';
import { toast } from '../../utils/toast';

export default function TienLenGame({ onClose, user, socket }) {
  const [gameState, setGameState] = useState(null);
  const [myHand, setMyHand] = useState([]);
  const [mySlot, setMySlot] = useState(-1);
  const [selectedCards, setSelectedCards] = useState([]);
  const [betAmount, setBetAmount] = useState(0);

  useEffect(() => {
    if (!socket || !user) return;
    
    socket.emit('tl_join', { hostUsername: 'lobby', username: user.username, displayName: user.displayName || user.username });
    
    socket.on('tl_state', (state) => {
      setGameState(state);
    });
    
    socket.on('tl_hand', (hand) => {
      setMyHand(hand);
    });
    
    socket.on('tl_slot', (slot) => {
      setMySlot(slot);
    });

    socket.on('tl_error', (msg) => {
      alert(msg);
    });

    socket.on('tl_announcement', (msg) => {
      toast.success(msg);
    });

    return () => {
      socket.off('tl_state');
      socket.off('tl_hand');
      socket.off('tl_slot');
      socket.off('tl_error');
      socket.off('tl_announcement');
    };
  }, [socket, user]);

  const handleClose = () => {
    if (gameState && gameState.status === 'playing' && mySlot !== -1) {
      const confirm = window.confirm("Cảnh báo: Thoát khi đang chơi sẽ bị xử thua chót và mất toàn bộ Xu cược. Bạn có chắc chắn muốn thoát?");
      if (!confirm) return;
    }
    if (socket) {
      socket.emit('tl_leave');
    }
    onClose();
  };

  const handleReady = () => {
    if (betAmount <= 0) {
      alert("Vui lòng đặt cược Xu hợp lệ!");
      return;
    }
    socket.emit('tl_bet', { hostUsername: 'lobby', bet: parseInt(betAmount) });
    socket.emit('tl_ready', { hostUsername: 'lobby' });
  };

  const handleJoinSpectator = () => {
    socket.emit('tl_spectator_join', { hostUsername: 'lobby' });
  };

  const handleJoinImmediately = () => {
    socket.emit('tl_join', { hostUsername: 'lobby', username: user.username, displayName: user.displayName || user.username });
  };

  const handleLeaveSeat = () => {
    socket.emit('tl_leave_seat', { hostUsername: 'lobby' });
  };

  const handleCardClick = (card) => {
    if (gameState?.status !== 'playing' || gameState.turn !== mySlot) return;
    if (selectedCards.includes(card)) {
      setSelectedCards(selectedCards.filter(c => c !== card));
    } else {
      setSelectedCards([...selectedCards, card]);
    }
  };

  const handlePlayClick = () => {
    if (gameState?.status !== 'playing' || gameState.turn !== mySlot || selectedCards.length === 0) return;
    
    const combo = evaluateCombo(selectedCards);
    if (!combo) {
      alert("Bài chọn không hợp lệ!");
      return;
    }
    const comboToBeat = (gameState.lastPlayerIdx === mySlot || gameState.lastCombo === null) ? null : gameState.lastCombo;
    if (!canBeat(combo, comboToBeat)) {
      alert("Không thể chặt được bài trên bàn!");
      return;
    }
    
    if (gameState.lastCombo === null && myHand.length === 13 && myHand.includes('3S') && !selectedCards.includes('3S')) {
      alert("Lượt đầu tiên phải đánh con 3 Bích!");
      return;
    }

    socket.emit('tl_play', { hostUsername: 'lobby', cards: selectedCards });
    setSelectedCards([]);
  };

  const handlePassClick = () => {
    if (gameState?.status !== 'playing' || gameState.turn !== mySlot) return;
    if (gameState.lastCombo === null || gameState.lastPlayerIdx === mySlot) {
      alert("Bạn đang giữ vòng, không thể bỏ qua!");
      return;
    }
    socket.emit('tl_pass', { hostUsername: 'lobby' });
    setSelectedCards([]);
  };

  if (!gameState) {
    return <div style={{ position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', backgroundColor:'#064e3b', zIndex: 9999, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'2rem' }}>Đang kết nối...</div>;
  }

  const getPlayerAtPos = (offset) => {
    if (mySlot === -1) {
      return gameState.players[offset];
    }
    return gameState.players[(mySlot + offset) % 4];
  };

  const bottomPlayer = getPlayerAtPos(0);
  const rightPlayer = getPlayerAtPos(1);
  const topPlayer = getPlayerAtPos(2);
  const leftPlayer = getPlayerAtPos(3);

  const spectatorState = gameState.spectators.find(s => socket && s.socketId === socket.id);
  const isSpectator = mySlot === -1;
  const isWaitingToJoin = spectatorState?.wantsToJoin;
  const hasHumanPlayer = gameState.players.some(p => p && !p.isBot);

  const getPlayerTurn = (p) => {
    if (!p) return false;
    const pIdx = gameState.players.findIndex(x => x && x.username === p.username);
    return gameState.turn === pIdx;
  };

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: '#064e3b',
      backgroundImage: 'radial-gradient(circle, #065f46 0%, #022c22 100%)',
      zIndex: 9999, boxSizing: 'border-box',
      overflow: 'hidden', fontFamily: 'sans-serif'
    }}>
      {/* Header */}
      <div style={{ position: 'absolute', top: '10px', left: '20px', display: 'flex', gap: '1vw', alignItems: 'center', zIndex: 100 }}>
        <div style={{ color: 'white', fontWeight: 'bold', fontSize: 'clamp(12px, 1.5vh, 20px)', textShadow: '1px 1px 2px black' }}>Khán giả: {gameState.spectators.length}</div>
      </div>
      <div style={{ position: 'absolute', top: '10px', right: '20px', zIndex: 100 }}>
        <button onClick={handleClose} style={{ backgroundColor: '#ef4444', color: 'white', border: '2px solid #7f1d1d', borderRadius: '8px', padding: '1vh 2vw', fontSize: 'clamp(14px, 2vh, 24px)', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>Thoát</button>
      </div>

      {gameState.status === 'waiting' && (
        <div style={{ position: 'absolute', top:0, left:0, width:'100%', height:'100%', backgroundColor:'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {isSpectator ? (
            <div style={{ textAlign: 'center' }}>
              {!hasHumanPlayer ? (
                <>
                  <p style={{ color: 'white', fontSize: '1.5rem', marginBottom: '20px' }}>Không có ai đang chơi.</p>
                  <button onClick={handleJoinImmediately} style={{ padding: '15px 30px', fontSize: '1.5rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>Tham gia ngay</button>
                </>
              ) : (
                <>
                  <p style={{ color: 'white', fontSize: '1.5rem', marginBottom: '20px' }}>Bàn chơi hiện đang đầy hoặc chờ bắt đầu.</p>
                  {!isWaitingToJoin ? (
                    <button onClick={handleJoinSpectator} style={{ padding: '15px 30px', fontSize: '1.5rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>Tham gia ván sau</button>
                  ) : (
                    <p style={{ color: '#10b981', fontSize: '1.5rem' }}>Đã đăng ký tham gia ván sau...</p>
                  )}
                </>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', backgroundColor: '#1e293b', padding: '30px', borderRadius: '15px', border: '4px solid #334155' }}>
              <p style={{ color: 'white', fontSize: '1.2rem', marginBottom: '15px' }}>Nhập số Xu cược cho ván này:</p>
              <input type="number" value={betAmount} onChange={(e) => setBetAmount(e.target.value)} style={{ padding: '10px', fontSize: '1.5rem', width: '200px', textAlign: 'center', borderRadius: '8px', border: 'none', marginBottom: '20px' }} />
              <br />
              {bottomPlayer?.ready ? (
                <p style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: 'bold' }}>Đang chờ người chơi khác...</p>
              ) : (
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button onClick={handleReady} style={{ padding: '15px 40px', fontSize: '1.5rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>Sẵn sàng</button>
                  <button onClick={handleLeaveSeat} style={{ padding: '15px 20px', fontSize: '1.2rem', backgroundColor: '#64748b', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>Làm khán giả</button>
                  <button onClick={handleClose} style={{ padding: '15px 20px', fontSize: '1.2rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>Thoát</button>
                </div>
              )}
            </div>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
            {gameState.players.map((p, idx) => (
              <div key={idx} style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '10px', minWidth: '150px', textAlign: 'center' }}>
                <p style={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem', margin: 0 }}>{p ? p.displayName : `Trống`}</p>
                <p style={{ color: p?.ready ? '#10b981' : '#f59e0b', margin: '5px 0' }}>{p ? (p.ready ? 'Sẵn sàng' : 'Đang chờ...') : ''}</p>
                {p && <p style={{ color: '#facc15', margin: 0 }}>Cược: {p.isBot ? '?' : p.bet} xu</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Game Area */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        
        {/* Top Player */}
        <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
          {topPlayer && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1vw', marginBottom: '1vh' }}>
                <div style={{ width: '6vh', height: '6vh', borderRadius: '50%', backgroundColor: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 'clamp(14px, 2vh, 24px)', border: getPlayerTurn(topPlayer) ? '3px solid #facc15' : '3px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>{topPlayer.displayName.charAt(0)}</div>
                <div style={{ color: 'white', textShadow: '1px 1px 2px black' }}>{topPlayer.displayName}</div>
                {topPlayer.passed && <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 'clamp(12px, 1.5vh, 20px)', backgroundColor: 'rgba(0,0,0,0.5)', padding: '0.5vh 1vw', borderRadius: '4px' }}>Bỏ lượt</div>}
              </div>
              <div style={{ display: 'flex' }}>
                {Array.from({ length: topPlayer.cardsCount }).map((_, i) => (
                  <div key={i} style={{ marginLeft: i === 0 ? 0 : 'clamp(-60px, -4vw, -20px)' }}>
                    <PlayingCard hidden={true} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Left Player */}
        <div style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
          {leftPlayer && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1vw', marginBottom: '1vh' }}>
                <div style={{ width: '6vh', height: '6vh', borderRadius: '50%', backgroundColor: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 'clamp(14px, 2vh, 24px)', border: getPlayerTurn(leftPlayer) ? '3px solid #facc15' : '3px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>{leftPlayer.displayName.charAt(0)}</div>
                {leftPlayer.passed && <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 'clamp(12px, 1.5vh, 20px)', backgroundColor: 'rgba(0,0,0,0.5)', padding: '0.5vh 1vw', borderRadius: '4px' }}>Bỏ lượt</div>}
              </div>
              <div style={{ color: 'white', marginBottom: '5px', textAlign: 'center', textShadow: '1px 1px 2px black' }}>{leftPlayer.displayName}</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {Array.from({ length: leftPlayer.cardsCount }).map((_, i) => (
                   <div key={i} style={{ marginTop: i === 0 ? 0 : 'clamp(-60px, -8vw, -20px)', zIndex: i }}>
                     <PlayingCard hidden={true} />
                   </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right Player */}
        <div style={{ position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
          {rightPlayer && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1vw', marginBottom: '1vh' }}>
                {rightPlayer.passed && <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 'clamp(12px, 1.5vh, 20px)', backgroundColor: 'rgba(0,0,0,0.5)', padding: '0.5vh 1vw', borderRadius: '4px' }}>Bỏ lượt</div>}
                <div style={{ width: '6vh', height: '6vh', borderRadius: '50%', backgroundColor: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 'clamp(14px, 2vh, 24px)', border: getPlayerTurn(rightPlayer) ? '3px solid #facc15' : '3px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>{rightPlayer.displayName.charAt(0)}</div>
              </div>
              <div style={{ color: 'white', marginBottom: '5px', textAlign: 'center', textShadow: '1px 1px 2px black' }}>{rightPlayer.displayName}</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {Array.from({ length: rightPlayer.cardsCount }).map((_, i) => (
                   <div key={i} style={{ marginTop: i === 0 ? 0 : 'clamp(-60px, -8vw, -20px)', zIndex: i }}>
                     <PlayingCard hidden={true} />
                   </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Center Table */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '45vw', minHeight: '30vh', border: '4px solid rgba(255,255,255,0.1)', borderRadius: '2vw', backgroundColor: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
          {gameState.tableCards.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 'bold', fontSize: 'clamp(20px, 4vh, 40px)', textTransform: 'uppercase', letterSpacing: '2px' }}>Ra bài</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', padding: '10px' }}>
              {gameState.tableCards.map((card, i) => (
                <div key={i} style={{ marginLeft: i === 0 ? 0 : 'clamp(-60px, -4vw, -20px)', marginBottom: '5px' }}>
                  <PlayingCard card={card} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Player */}
        <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 20 }}>
          {bottomPlayer && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1vw', marginBottom: '1vh' }}>
                 <div style={{ width: '6vh', height: '6vh', borderRadius: '50%', backgroundColor: '#facc15', color: '#854d0e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 'clamp(16px, 2.5vh, 32px)', border: getPlayerTurn(bottomPlayer) ? '4px solid white' : '3px solid #ca8a04', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', zIndex: 10 }}>{bottomPlayer.displayName.charAt(0)}</div>
                 <div style={{ color: 'white', fontWeight: 'bold', fontSize: 'clamp(14px, 2vh, 24px)', textShadow: '1px 1px 2px black' }}>{bottomPlayer.displayName}</div>
                 {bottomPlayer.passed && <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 'clamp(12px, 1.5vh, 20px)', backgroundColor: 'rgba(0,0,0,0.5)', padding: '0.5vh 1vw', borderRadius: '4px' }}>Bỏ lượt</div>}
              </div>

              <div style={{ display: 'flex' }}>
                {isSpectator ? (
                  Array.from({ length: bottomPlayer.cardsCount }).map((_, i) => (
                    <div key={i} style={{ marginLeft: i === 0 ? 0 : 'clamp(-60px, -4vw, -20px)' }}>
                      <PlayingCard hidden={true} />
                    </div>
                  ))
                ) : (
                  myHand.map((card, i) => (
                    <div key={i} style={{ marginLeft: i === 0 ? 0 : 'clamp(-60px, -4vw, -20px)' }}>
                      <PlayingCard 
                        card={card} 
                        selected={selectedCards.includes(card)} 
                        onClick={() => handleCardClick(card)} 
                        disabled={!getPlayerTurn(bottomPlayer)}
                      />
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        {!isSpectator && (
          <div style={{ position: 'absolute', bottom: '130px', right: '20px', display: 'flex', gap: '1vw', zIndex: 30 }}>
            {getPlayerTurn(bottomPlayer) && (gameState.lastCombo !== null && gameState.lastPlayerIdx !== mySlot) && (
              <button onClick={handlePassClick} style={{ backgroundColor: '#64748b', color: 'white', border: '2px solid #334155', borderRadius: '8px', padding: '1.5vh 3vw', fontSize: 'clamp(14px, 2vh, 24px)', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
                Bỏ qua
              </button>
            )}
            <button onClick={handlePlayClick} disabled={!getPlayerTurn(bottomPlayer)} style={{ backgroundColor: getPlayerTurn(bottomPlayer) ? '#10b981' : '#059669', color: getPlayerTurn(bottomPlayer) ? 'white' : '#a7f3d0', border: getPlayerTurn(bottomPlayer) ? '2px solid #047857' : '2px solid #064e3b', borderRadius: '8px', padding: '1.5vh 3vw', fontSize: 'clamp(14px, 2vh, 24px)', fontWeight: 'bold', cursor: getPlayerTurn(bottomPlayer) ? 'pointer' : 'default', opacity: getPlayerTurn(bottomPlayer) ? 1 : 0.6, boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
                Đánh
            </button>
          </div>
        )}

      </div>

      {/* End Game Leaderboard Overlay */}
      {gameState.status === 'ended' && gameState.winners && gameState.winners.length > 0 && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: '#1e293b', border: '4px solid #facc15', borderRadius: '20px',
            padding: '30px 50px', minWidth: '400px', boxShadow: '0 0 50px rgba(250, 204, 21, 0.4)',
            transform: 'scale(0.85)'
          }}>
            <h2 style={{ color: '#facc15', textAlign: 'center', fontSize: '2rem', margin: 0, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '2px', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>Bảng Xếp Hạng</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {gameState.winners.map((w, idx) => {
                let payoutText = '';
                if (gameState.winners.length === 4) {
                  if (idx === 0) payoutText = `+${gameState.winners[3].bet}`;
                  else if (idx === 1) payoutText = `+${gameState.winners[2].bet}`;
                  else if (idx === 2) payoutText = `-${gameState.winners[2].bet}`;
                  else if (idx === 3) payoutText = `-${gameState.winners[3].bet}`;
                }
                
                let color = 'white';
                let fontSize = '1.5rem';
                let fontWeight = 'bold';
                let badge = '';
                
                if (idx === 0) { color = '#facc15'; fontSize = '1.8rem'; badge = '🏆 Tới Nhất'; }
                else if (idx === 1) { color = '#cbd5e1'; badge = '🥈 Tới Nhì'; }
                else if (idx === 2) { color = '#d97706'; badge = '🥉 Tới Ba'; }
                else if (idx === 3) { color = '#ef4444'; badge = '💀 Chót'; }

                return (
                  <div key={idx} style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.05)', padding: '10px 20px', borderRadius: '10px',
                    borderLeft: `5px solid ${color}`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <span style={{ color, fontSize, fontWeight, width: '30px' }}>#{idx + 1}</span>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }}>{w.displayName}</span>
                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>{badge}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: (idx === 0 || idx === 1) ? '#10b981' : '#ef4444' }}>
                      {payoutText}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

