import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import BottomNav from '../components/BottomNav';
import PixelCanvas from '../components/PixelCanvas';
import { toast } from '../utils/toast';
import styles from './WerewolfPage.module.css';

const SOCKET_SERVER_URL = import.meta.env.VITE_API_URL || '';

const DECK_ROLES = {
  VILLAGER: [
    { name: 'Dân Làng', desc: 'Người dân bình thường, không có chức năng đặc biệt ngoài việc thảo luận và bỏ phiếu treo cổ vào ban ngày.' },
    { name: 'Tiên Tri', desc: 'Mỗi đêm, Tiên Tri thức dậy và chọn 1 người chơi để soi xem người đó thuộc phe Dân Làng hay phe Sói.' },
    { name: 'Phù Thủy', desc: 'Sở hữu 2 bình thuốc đặc biệt: 1 bình cứu sống người vừa bị giết trong đêm và 1 bình độc để tiêu diệt 1 mục tiêu. Mỗi bình chỉ dùng 1 lần cả trận.' },
    { name: 'Thợ Săn', desc: 'Khi chết (do bị cắn hoặc bị vote treo cổ), Thợ Săn có quyền chọn bắn chết lập tức một người chơi khác.' },
    { name: 'Bảo Vệ', desc: 'Mỗi đêm chọn bảo vệ 1 người khỏi bị Ma Sói cắn. Không được bảo vệ 1 mục tiêu liên tiếp 2 đêm.' },
    { name: 'Già Làng', desc: 'Có 2 sinh mạng trước nanh vuốt Ma Sói. Nếu bị chết do biểu quyết treo cổ hoặc do lỗi năng lực của phe Dân Làng, mọi chức năng đặc biệt khác của phe Dân sẽ lập tức bị vô hiệu hóa.' },
    { name: 'Kẻ Ngốc', desc: 'Khi bị treo cổ, Kẻ Ngốc lật bài để thoát chết và tiếp tục trò chơi, nhưng sẽ bị mất quyền biểu quyết ban ngày.' },
    { name: 'Quan Tòa Nói Lắp', desc: 'Mỗi trận đấu có 1 lần chọn kích hoạt đợt bỏ phiếu thứ hai ngay sau đợt đầu tiên vào ban ngày.' },
    { name: 'Hiệp Sĩ Kiếm Rỉ', desc: 'Nếu bị Ma Sói cắn chết, con Sói trực tiếp cắn anh ta sẽ bị nhiễm trùng và chết vào đêm hôm sau.' },
    { name: 'Diễn Viên', desc: 'Xem 3 vai trò ẩn ở ngoài và chọn lấy 1 vai trò để sử dụng chức năng.' },
    { name: 'Người Hầu Trung Thành', desc: 'Chọn thế mạng cho vai trò của người chơi bị chết.' },
    { name: 'Người Thuần Gấu', desc: 'Nếu có Ma Sói đứng cạnh anh ta vào ban ngày, chú Gấu sẽ gầm lên báo hiệu cho dân làng.' },
    { name: 'Kẻ Thao Túng Thành Kiến', desc: 'Chọn 1 phe phái để giúp phiếu bầu của phe đó có trọng số cao hơn khi biểu quyết.' },
    { name: 'Đứa Trẻ Hoang Dã', desc: 'Đêm đầu tiên chọn 1 Thần Tượng. Nếu Thần Tượng chết, Đứa Trẻ sẽ mất nhân tính và biến thành Ma Sói.' },
    { name: 'Thầy Bói Gypsy', desc: 'Mỗi đêm thức dậy để gửi điềm báo tâm linh cho một người chơi khác.' },
    { name: 'Người Rao Tin', desc: 'Công bố một thông tin ngẫu nhiên được hệ thống cung cấp cho dân làng vào ban ngày.' },
    { name: 'Cặp Dân Làng', desc: 'Hai người chơi thuộc nhóm dân làng biết rõ danh tính và đồng hành cùng nhau.' }
  ],
  WOLF: [
    { name: 'Ma Sói', desc: 'Mỗi đêm họp bàn cùng đồng bọn để chọn cắn chết 1 người dân.' },
    { name: 'Sói Trắng', desc: 'Mỗi 2 đêm, Sói Trắng có thể thức dậy riêng để cắn chết 1 Ma Sói khác. Thắng khi là người sống sót duy nhất.' },
    { name: 'Đại Ma Sói', desc: 'Có quyền năng cắn chết thêm 1 mục tiêu nữa trong cả trận đấu.' },
    { name: 'Sói Cha Bị Nguyền', desc: 'Một lần cả trận, Sói Cha có thể nguyền rủa nạn nhân bị Sói cắn để biến họ thành Ma Sói mới thay vì chết.' },
    { name: 'Sói Lai', desc: 'Đêm đầu tiên thức dậy để tự chọn đi theo phe Dân Làng hoặc phe Sói.' }
  ],
  NEUTRAL: [
    { name: 'Thần Tình Yêu (Cupid)', desc: 'Đêm đầu tiên ghép đôi 2 người chơi thành Cặp Đôi. Họ phải bảo vệ nhau vì nếu 1 người chết, người kia chết theo. Thắng cùng phe Dân/Sói hoặc thắng riêng nếu khác phe.' },
    { name: 'Kẻ Trộm', desc: 'Đêm đầu tiên chọn đổi lấy 1 trong 2 vai trò dư ngoài bộ bài. Nếu cả 2 lá đều là Sói, bắt buộc phải lấy Sói.' },
    { name: 'Kẻ Thổi Sáo', desc: 'Mỗi đêm thức dậy thôi miên 2 người. Thắng khi tất cả người còn sống đều bị thôi miên.' },
    { name: 'Vật Tế Thần', desc: 'Khi biểu quyết treo cổ ban ngày bị hòa phiếu, Vật Tế Thần sẽ tự động bị treo cổ thế mạng cho những người kia.' },
    { name: 'Chó Sói', desc: 'Đêm đầu chọn 1 chủ nhân. Nếu chủ nhân chết, Chó Sói biến thành Ma Sói.' },
    { name: 'Con Quạ', desc: 'Mỗi đêm chọn ám chỉ 1 người khiến phiếu vote treo cổ của người đó tự động tăng thêm 2 vào ngày hôm sau.' },
    { name: 'Kẻ Phóng Hỏa', desc: 'Mỗi đêm tưới dầu lên 1 người. Đêm tiếp theo có thể chọn kích hoạt phóng hỏa thiêu chết tất cả người bị tưới dầu.' }
  ]
};

const ALL_ROLES = [
  { id: 'DAN_LANG', name: 'Dân Làng', faction: 'VILLAGER', desc: 'Dân thường không có chức năng.' },
  { id: 'TIEN_TRI', name: 'Tiên Tri', faction: 'VILLAGER', desc: 'Soi vai trò của người chơi.' },
  { id: 'PHU_THUY', name: 'Phù Thủy', faction: 'VILLAGER', desc: 'Có 1 bình cứu mạng và 1 bình thuốc độc.' },
  { id: 'THO_SAN', name: 'Thợ Săn', faction: 'VILLAGER', desc: 'Khi chết được kéo theo 1 người.' },
  { id: 'BAO_VE', name: 'Bảo Vệ', faction: 'VILLAGER', desc: 'Bảo vệ người khác khỏi bị cắn đêm đó.' },
  { id: 'GIA_LANG', name: 'Già Làng', faction: 'VILLAGER', desc: 'Có 2 mạng trước Sói.' },
  { id: 'KE_NGOC', name: 'Kẻ Ngốc', faction: 'VILLAGER', desc: 'Khi bị vote chết sẽ được tha và lật bài.' },
  { id: 'THIEN_THAN', name: 'Thiên Thần', faction: 'VILLAGER', desc: 'Thắng nếu bị treo cổ ngày 1.' },
  { id: 'QUAN_TOA', name: 'Quan Tòa Nói Lắp', faction: 'VILLAGER', desc: 'Cho phép vote đợt 2.' },
  { id: 'HIEP_SI', name: 'Hiệp Sĩ Kiếm Rỉ', faction: 'VILLAGER', desc: 'Nếu bị cắn chết, Sói cắn sẽ nhiễm bệnh và chết hôm sau.' },
  { id: 'DIEN_VIEN', name: 'Diễn Viên', faction: 'VILLAGER', desc: 'Chọn 1 trong 3 vai trò ẩn ở ngoài.' },
  { id: 'NGUOI_HAU', name: 'Người Hầu Trung Thành', faction: 'VILLAGER', desc: 'Thế mạng cho người chơi bị chết.' },
  { id: 'NGUOI_THUAN_GAU', name: 'Người Thuần Gấu', faction: 'VILLAGER', desc: 'Gấu gầm lên nếu đứng cạnh Sói.' },
  { id: 'KE_THAO_TUNG', name: 'Kẻ Thao Túng Thành Kiến', faction: 'VILLAGER', desc: 'Giúp phiếu bầu phe đã chọn nặng hơn.' },
  { id: 'DUA_TRE_HOANG_DA', name: 'Đứa Trẻ Hoang Dã', faction: 'VILLAGER', desc: 'Chọn Thần Tượng. Thần Tượng chết hóa Sói.' },
  { id: 'THAY_BOI_GYPSY', name: 'Thầy Bói Gypsy', faction: 'VILLAGER', desc: 'Gửi điềm báo cho người khác.' },
  { id: 'NGUOI_RAO_TIN', name: 'Người Rao Tin', faction: 'VILLAGER', desc: 'Công bố thông tin ngẫu nhiên.' },
  { id: 'CAP_DAN_LANG', name: 'Cặp Dân Làng', faction: 'VILLAGER', desc: 'Hai người biết mặt nhau.' },
  
  { id: 'MA_SOI', name: 'Ma Sói', faction: 'WOLF', desc: 'Cắn chết 1 người mỗi đêm.' },
  { id: 'SOI_TRANG', name: 'Sói Trắng', faction: 'WOLF', desc: 'Mỗi 2 đêm cắn chết 1 Sói khác. Thắng 1 mình.' },
  { id: 'DAI_MA_SOI', name: 'Đại Ma Sói', faction: 'WOLF', desc: 'Cắn thêm 1 nạn nhân nữa (1 lần cả trận).' },
  { id: 'SOI_CHA', name: 'Sói Cha Bị Nguyền', faction: 'WOLF', desc: 'Biến nạn nhân thành Sói mới (1 lần cả trận).' },
  { id: 'SOI_LAI', name: 'Sói Lai', faction: 'WOLF', desc: 'Đêm đầu tự chọn phe Dân hoặc Sói.' },
  
  { id: 'CUPID', name: 'Cupid', faction: 'NEUTRAL', desc: 'Ghép đôi 2 người.' },
  { id: 'KE_TROM', name: 'Kẻ Trộm', faction: 'NEUTRAL', desc: 'Chọn vai trò từ 2 lá dư.' },
  { id: 'KE_THOI_SAO', name: 'Kẻ Thổi Sáo', faction: 'NEUTRAL', desc: 'Thôi miên tất cả người chơi để thắng.' },
  { id: 'VAT_TE_THAN', name: 'Vật Tế Thần', faction: 'NEUTRAL', desc: 'Treo cổ thay thế nếu hòa phiếu.' },
  { id: 'CHO_SOI', name: 'Chó Sói', faction: 'NEUTRAL', desc: 'Chọn chủ nhân. Chủ nhân chết hóa Sói.' },
  { id: 'CON_QUA', name: 'Con Quạ', faction: 'NEUTRAL', desc: 'Tăng 2 vote treo cổ hôm sau cho mục tiêu.' },
  { id: 'KE_PHONG_HOA', name: 'Kẻ Phóng Hỏa', faction: 'NEUTRAL', desc: 'Đổ dầu và thiêu chết các nạn nhân.' },
];

export default function WerewolfPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [socket, setSocket] = useState(null);
  const [inRoom, setInRoom] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [gameState, setGameState] = useState(null);
  const [showDeck, setShowDeck] = useState(false);
  const [showDeckEditor, setShowDeckEditor] = useState(false);
  const [tempRoles, setTempRoles] = useState([]);

  const openDeckEditor = () => {
    setTempRoles(gameState?.settings?.rolesList || []);
    setShowDeckEditor(true);
  };

  const adjustRoleCount = (roleId, delta) => {
    setTempRoles(prev => {
      const currentCount = prev.filter(r => r === roleId).length;
      const newCount = Math.max(0, currentCount + delta);
      const filtered = prev.filter(r => r !== roleId);
      const added = Array(newCount).fill(roleId);
      return [...filtered, ...added];
    });
  };

  const saveDeck = () => {
    const wolfCount = tempRoles.filter(r => {
      const rDef = ALL_ROLES.find(x => x.id === r);
      return rDef && rDef.faction === 'WOLF';
    }).length;

    if (wolfCount < 2) {
      toast.error('Bộ bài bắt buộc phải có ít nhất 2 vai trò thuộc phe Sói!');
      return;
    }

    if (socket) {
      socket.emit('ww_update_settings', { rolesList: tempRoles });
      toast.success('Đã lưu cấu hình bộ bài thành công!');
    }
    setShowDeckEditor(false);
  };


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

  const handleCreateRoom = () => {
    if (!socket) return;
    
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let randomId = '';
    for (let i = 0; i < 5; i++) {
      randomId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newRoomId = `ww-${randomId}`;
    setRoomId(newRoomId);
    
    socket.emit('ww_join', {
      roomId: newRoomId,
      username: user.username,
      displayName: user.displayName || user.username
    });
    setInRoom(true);
  };

  const handleCopyRoomCode = () => {
    if (!gameState || !gameState.id) return;
    navigator.clipboard.writeText(gameState.id)
      .then(() => {
        toast.success('Đã sao chép mã phòng vào bộ nhớ tạm!');
      })
      .catch(() => {
        toast.error('Không thể sao chép mã phòng.');
      });
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
              <span>◄ MA SÓI ►</span>
            </div>
            <button className={styles.closeBtn} onClick={() => navigate('/utilities')}>✕</button>
          </header>
          
          <div className={`${styles.joinBox} rpg-box fade-in fade-in-delay-1`} style={{ maxWidth: '400px', margin: '2rem auto' }}>
            <h2>Tham Gia Game Ma Sói</h2>
            
            {/* Tạo phòng */}
            <div style={{ marginBottom: '1.5rem', borderBottom: '2px dashed #4b5563', paddingBottom: '1.5rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '12px' }}>
                Bắt đầu một phòng chơi mới với tư cách Chủ phòng (Host)
              </p>
              <button onClick={handleCreateRoom} className="btn btn-primary" style={{ background: '#10b981', borderColor: '#059669', width: '100%' }}>
                👑 Tạo Phòng Mới
              </button>
            </div>

            {/* Vào phòng */}
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '12px' }}>
                Hoặc nhập mã phòng hiện có để tham gia cùng bạn bè
              </p>
              <form onSubmit={joinRoom} className={styles.joinForm}>
                <input
                  type="text"
                  placeholder="Nhập mã phòng (VD: phong123)"
                  value={roomId}
                  onChange={e => setRoomId(e.target.value)}
                  maxLength={20}
                  required
                />
                <button type="submit" className="btn btn-outline" style={{ width: '100%' }}>
                  🚪 Vào Phòng
                </button>
              </form>
            </div>
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
            <div className="px-titlebar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '8px' }}>
              <span>Phòng: <strong style={{ color: '#fbbf24' }}>{gameState.id.toUpperCase()}</strong></span>
              <button 
                onClick={handleCopyRoomCode} 
                style={{ 
                  background: '#3b82f6', 
                  border: '1px solid #2563eb', 
                  color: '#fff', 
                  fontSize: '0.7rem', 
                  padding: '2px 8px', 
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textTransform: 'uppercase',
                  fontWeight: 'bold',
                  boxShadow: '1px 1px 0px #1d4ed8'
                }}
              >
                📋 Sao chép
              </button>
            </div>
            <button className={styles.closeBtn} onClick={leaveRoom}>✕</button>
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
              <button className="btn btn-outline" onClick={() => setShowDeck(true)}>Xem Bộ Bài</button>
              <button className="btn btn-danger" onClick={leaveRoom}>Thoát Phòng</button>
            </div>

            {showDeck && (
              <div className={styles.modalOverlay}>
                <div className={`${styles.modalContent} rpg-box`} style={{ textAlign: 'center' }}>
                  <div className="px-titlebar" style={{ position: 'relative' }}>
                    <span>CHI TIẾT BỘ BÀI</span>
                    <button className={styles.closeBtn} onClick={() => setShowDeck(false)}>✕</button>
                  </div>
                  <div className={styles.deckList}>
                    
                    <div className={styles.factionSection}>
                      <div className={`${styles.factionTitle} ${styles.factionVillager}`}>🛡️ PHE DÂN LÀNG ({DECK_ROLES.VILLAGER.length})</div>
                      <div className={styles.deckGrid}>
                        {DECK_ROLES.VILLAGER.map((r, idx) => (
                          <div key={idx} className={`${styles.roleCard} ${styles.factionVillager}`}>
                            <div className={styles.roleName}>{r.name}</div>
                            <div className={styles.roleDesc}>{r.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={styles.factionSection}>
                      <div className={`${styles.factionTitle} ${styles.factionWolf}`}>😈 PHE MA SÓI ({DECK_ROLES.WOLF.length})</div>
                      <div className={styles.deckGrid}>
                        {DECK_ROLES.WOLF.map((r, idx) => (
                          <div key={idx} className={`${styles.roleCard} ${styles.factionWolf}`}>
                            <div className={styles.roleName}>{r.name}</div>
                            <div className={styles.roleDesc}>{r.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={styles.factionSection}>
                      <div className={`${styles.factionTitle} ${styles.factionNeutral}`}>✨ PHE THỨ BA & VAI TRÒ KHÁC ({DECK_ROLES.NEUTRAL.length})</div>
                      <div className={styles.deckGrid}>
                        {DECK_ROLES.NEUTRAL.map((r, idx) => (
                          <div key={idx} className={`${styles.roleCard} ${styles.factionNeutral}`}>
                            <div className={styles.roleName}>{r.name}</div>
                            <div className={styles.roleDesc}>{r.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                  <button className="btn btn-outline" onClick={() => setShowDeck(false)} style={{ marginTop: '12px' }}>
                    [ ĐÓNG BẢNG TRA CỨU ]
                  </button>
                </div>
              </div>
            )}

            {showDeckEditor && (
              <div className={styles.modalOverlay}>
                <div className={`${styles.modalContent} rpg-box`} style={{ textAlign: 'center', maxWidth: '500px' }}>
                  <div className="px-titlebar" style={{ position: 'relative' }}>
                    <span>CẤU HÌNH BỘ BÀI</span>
                    <button className={styles.closeBtn} onClick={() => setShowDeckEditor(false)}>✕</button>
                  </div>

                  <div className={styles.deckList}>
                    <div className={styles.deckStats}>
                      🔹 Tổng số lá bài đã chọn: <span className={styles.deckStatsHighlight}>{tempRoles.length} lá</span>
                      <br />
                      🔹 Số lá bài phe Sói: <span className={styles.deckStatsHighlight}>
                        {tempRoles.filter(r => {
                          const def = ALL_ROLES.find(x => x.id === r);
                          return def && def.faction === 'WOLF';
                        }).length} lá (yêu cầu &ge; 2)
                      </span>
                    </div>

                    <div style={{ maxHeight: '45vh', overflowY: 'auto', paddingRight: '4px' }}>
                      {ALL_ROLES.map(role => {
                        const count = tempRoles.filter(r => r === role.id).length;
                        let factionColor = '#2563eb'; // villager
                        if (role.faction === 'WOLF') factionColor = '#dc2626';
                        if (role.faction === 'NEUTRAL') factionColor = '#d97706';

                        return (
                          <div key={role.id} className={styles.editorRow}>
                            <div className={styles.editorRoleInfo}>
                              <div className={styles.editorRoleName} style={{ color: factionColor }}>{role.name}</div>
                              <div className={styles.editorRoleFaction}>{role.desc}</div>
                            </div>
                            <div className={styles.editorControls}>
                              <button className={styles.btnAdjust} onClick={() => adjustRoleCount(role.id, -1)}>-</button>
                              <span className={styles.roleQty}>{count}</span>
                              <button className={styles.btnAdjust} onClick={() => adjustRoleCount(role.id, 1)}>+</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '12px' }}>
                    <button className="btn btn-primary" onClick={saveDeck} style={{ flex: 1 }}>
                      LƯU BỘ BÀI
                    </button>
                    <button className={`btn btn-outline ${styles.btnCancel}`} onClick={() => setShowDeckEditor(false)} style={{ flex: 1 }}>
                      HỦY BỎ
                    </button>
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
                
                <div className={styles.deckSelector} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button className="btn btn-outline" onClick={openDeckEditor} style={{ background: '#3b82f6', borderColor: '#2563eb', color: '#fff' }}>
                    ⚙️ Cấu Hình Bộ Bài Custom
                  </button>
                  <button className={`btn btn-outline ${styles.btnDefaultDeck}`} onClick={() => {
                     socket.emit('ww_update_settings', {
                       rolesList: ['MA_SOI', 'MA_SOI', 'TIEN_TRI', 'PHU_THUY', 'DAN_LANG', 'DAN_LANG', 'DAN_LANG', 'DAN_LANG']
                     });
                     toast.success('Đã chọn bộ bài mặc định 8 lá!');
                  }}>Chọn Bộ Bài Mặc Định (8)</button>
                  <p style={{ marginTop: '8px', fontSize: '0.9rem', color: '#9ca3af' }}>
                    Số lá bài hiện tại: <strong style={{ color: '#fbbf24' }}>{gameState.settings.rolesList?.length || 0}</strong>
                  </p>
                </div>
              </div>
            )}

            <div className={styles.lobbyActions}>
               <button className={`btn ${me?.ready ? 'btn-danger' : 'btn-primary'}`} onClick={handleReady}>
                 {me?.ready ? '❌ Hủy Sẵn Sàng' : '✔ Sẵn Sàng'}
               </button>
               {isHost && (
                 <button className="btn btn-primary" onClick={handleStart} disabled={!allReady || playerCount < 8} style={{ background: '#fbbf24', borderColor: '#d97706', color: '#000' }}>
                   🔥 BẮT ĐẦU GAME
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
          <button className={styles.closeBtn} onClick={leaveRoom}>✕</button>
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

        {/* Exit Actions */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
          {isEnded ? (
            <button className="btn btn-primary" onClick={leaveRoom} style={{ width: 'auto', padding: '12px 24px' }}>
              🚪 QUAY LẠI PHÒNG CHỜ
            </button>
          ) : (
            <button className="btn btn-danger" onClick={leaveRoom} style={{ width: 'auto', padding: '12px 24px' }}>
              🚪 RỜI TRẬN ĐẤU
            </button>
          )}
        </div>

      </main>
      <BottomNav />
    </div>
  );
}
