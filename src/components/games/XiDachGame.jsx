import React, { useEffect, useState } from 'react';
import styles from './XiDachGame.module.css';

export default function XiDachGame({ onClose, user, socket }) {
  const [gameState, setGameState] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Fixed room for now: Casino Xì Dách Lobby
  const roomId = 'casino_xidach_1';

  useEffect(() => {
    if (!socket) return;

    socket.emit('join_xidach', { 
      roomId, 
      username: user.username, 
      displayName: user.displayName || user.username 
    });

    const handleState = (state) => {
      setGameState(state);
      setErrorMsg('');
    };

    const handleError = (msg) => {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 3000);
    };

    socket.on('xidach_state', handleState);
    socket.on('xidach_error', handleError);

    return () => {
      socket.emit('leave_xidach');
      socket.off('xidach_state', handleState);
      socket.off('xidach_error', handleError);
    };
  }, [socket, user, roomId]);

  if (!gameState) {
    return (
      <div className={styles.overlay}>
        <div style={{ color: 'white' }}>Đang vào sòng Xì Dách...</div>
      </div>
    );
  }

  const myPlayer = gameState.players[socket.id];
  const isMyTurn = gameState.status === 'playing' && gameState.turnOrder[gameState.currentTurnIdx] === socket.id;

  const handleBet = (amount) => {
    socket.emit('xidach_bet', amount);
  };

  const handleHit = () => {
    socket.emit('xidach_hit');
  };

  const handleStand = () => {
    socket.emit('xidach_stand');
  };

  const renderCard = (card, idx) => {
    if (card.rank === '?') {
      return <div key={idx} className={`${styles.card} ${styles.cardBack}`}></div>;
    }
    const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
    const suitSymbol = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' }[card.suit];
    
    return (
      <div key={idx} className={`${styles.card} ${isRed ? styles.red : styles.black}`}>
        <div className={styles.cardTop}>{card.rank} {suitSymbol}</div>
        <div className={styles.cardCenter}>{suitSymbol}</div>
        <div className={styles.cardBottom}>{card.rank} {suitSymbol}</div>
      </div>
    );
  };

  // Convert players object to array for rendering
  const otherPlayers = Object.entries(gameState.players)
    .filter(([sid]) => sid !== socket.id)
    .map(([sid, p]) => ({ sid, ...p }));

  return (
    <div className={styles.overlay}>
      <div className={styles.table}>
        <button 
          onClick={onClose} 
          style={{ 
            position: 'absolute', 
            top: '20px', 
            right: '20px', 
            background: 'transparent', 
            border: 'none', 
            fontSize: '24px', 
            cursor: 'pointer',
            fontFamily: 'var(--font-pixel)',
            fontWeight: 'bold',
            color: '#ef4444',
            zIndex: 100
          }}
        >
          [x]
        </button>
        
        <div className={styles.tableInner}>
          
          {/* Status Banner */}
          {gameState.status === 'waiting' && <div className={styles.statusBanner}>ĐANG CHỜ NGƯỜI CHƠI...</div>}
          {gameState.status === 'betting' && <div className={styles.statusBanner}>XIN MỜI ĐẶT CƯỢC</div>}
          {gameState.status === 'finished' && <div className={styles.statusBanner}>KẾT THÚC VÁN</div>}
          {errorMsg && <div className={styles.statusBanner} style={{color:'#ef4444', borderColor:'#7f1d1d', zIndex: 100}}>{errorMsg}</div>}

          {/* Dealer Area */}
          <div className={styles.dealerArea}>
            <div className={styles.dealerLabel}>NHÀ CÁI</div>
            <div className={styles.cardsContainer}>
              {gameState.dealer.cards.map((c, i) => renderCard(c, i))}
            </div>
          </div>

          {/* Other Players */}
          <div style={{ position: 'absolute', top: '150px', left: 0, right: 0, display: 'flex', justifyContent: 'space-between', padding: '0 40px', pointerEvents: 'none' }}>
            {otherPlayers.map((p, i) => (
              <div key={p.sid} className={styles.playerSpot}>
                <div className={styles.playerInfo}>{p.displayName}</div>
                {p.bet > 0 && <div className={styles.betChip}>{p.bet}</div>}
                <div className={styles.cardsContainer} style={{ transform: 'scale(0.8)' }}>
                  {p.cards.map((c, idx) => renderCard(c, idx))}
                </div>
                {p.result && <div className={styles.handResult}>{p.result}</div>}
              </div>
            ))}
          </div>

          {/* My Player */}
          <div className={styles.playersArea}>
            {myPlayer && (
              <div className={styles.playerSpot} style={{ transform: 'scale(1.2)', transformOrigin: 'bottom center', marginBottom: '20px' }}>
                {myPlayer.result && (
                  <div className={`${styles.payoutAnim} ${myPlayer.payout > 0 ? styles.win : styles.lose}`}>
                    {myPlayer.payout > 0 ? `+${myPlayer.payout}` : (myPlayer.result==='TIE' ? 'HÒA' : `-${myPlayer.bet}`)}
                  </div>
                )}
                
                <div className={styles.cardsContainer}>
                  {myPlayer.cards.map((c, i) => renderCard(c, i))}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className={styles.playerInfo} style={{ background: isMyTurn ? '#047857' : 'rgba(0,0,0,0.6)', border: isMyTurn ? '2px solid #34d399' : '1px solid #333' }}>
                    TÔI ({myPlayer.bet > 0 ? `Cược: ${myPlayer.bet}` : 'Chưa cược'})
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Panel */}
          <div className={styles.actionPanel}>
            {gameState.status === 'betting' && myPlayer?.status === 'waiting' && (
              <div className={styles.betOptions}>
                <button className={`${styles.betBtn} ${styles.betBtn10}`} onClick={() => handleBet(10)}>10</button>
                <button className={`${styles.betBtn} ${styles.betBtn50}`} onClick={() => handleBet(50)}>50</button>
                <button className={`${styles.betBtn} ${styles.betBtn100}`} onClick={() => handleBet(100)}>100</button>
                <button className={`${styles.betBtn} ${styles.betBtn500}`} onClick={() => handleBet(500)}>500</button>
              </div>
            )}
            
            {gameState.status === 'betting' && myPlayer?.status === 'ready' && (
              <div style={{ color: '#fbbf24' }}>Đợi người khác cược...</div>
            )}

            {isMyTurn && (
              <>
                <button className={`${styles.btn} ${styles.btnHit}`} onClick={handleHit}>RÚT BÀI</button>
                <button className={`${styles.btn} ${styles.btnStand}`} onClick={handleStand}>DẰNG</button>
              </>
            )}

            {!isMyTurn && gameState.status === 'playing' && myPlayer?.status === 'stand' && (
              <div style={{ color: '#fbbf24' }}>Đang đợi người khác...</div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
