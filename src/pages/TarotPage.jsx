import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PixelCanvas from '../components/PixelCanvas';
import BottomNav from '../components/BottomNav';
import styles from './TarotPage.module.css';

const TAROT_CARDS = [
  { id: 0, name: 'The Fool (Kẻ Khờ)', emoji: '🎒', descPast: 'Quá khứ: Bạn đã bắt đầu một hành trình mới đầy vô tư, không hề lo lắng hay sợ hãi.', descPresent: 'Hiện tại: Bạn đang đứng trước một lựa chọn quan trọng, hãy can đảm bước tiếp đi!', descFuture: 'Tương lai: Một khởi đầu nông nghiệp rực rỡ sắp mở ra, bò sẽ khỏe mạnh và đất tốt tươi!' },
  { id: 1, name: 'The Magician (Ảo Thuật)', emoji: '🪄', descPast: 'Quá khứ: Bạn đã tận dụng tối đa tài nguyên sẵn có để tạo nên thành công bước đầu.', descPresent: 'Hiện tại: Bạn có đầy đủ công cụ và tài năng để đạt bất kỳ mục tiêu gieo hạt nào.', descFuture: 'Tương lai: Bàn tay vàng làm nông! Trồng gì cũng lớn nhanh gấp đôi và bán siêu đắt khách!' },
  { id: 2, name: 'High Priestess (Nữ Tư Tế)', emoji: '📖', descPast: 'Quá khứ: Bạn đã dựa vào trực giác điềm tĩnh của mình để vượt qua nhiều sóng gió.', descPresent: 'Hiện tại: Đừng vội vàng hành động. Hãy giữ bí mật và kiên nhẫn quan sát thị trường.', descFuture: 'Tương lai: Tìm ra những công thức nông nghiệp bí ẩn mang lại lượng xu khổng lồ!' },
  { id: 3, name: 'The Empress (Nữ Hoàng)', emoji: '👑', descPast: 'Quá khứ: Giai đoạn ấm no và tình cảm đong đầy đã nuôi dưỡng tâm hồn bạn.', descPresent: 'Hiện tại: Khí hậu cực kỳ thuận lợi, ruộng lúa nảy mầm khỏe mạnh và xanh mướt.', descFuture: 'Tương lai: Mùa màng đại bội thu! Chuồng trại của bạn sẽ sinh sôi thêm nhiều bò con sữa ngọt!' },
  { id: 4, name: 'The Emperor (Hoàng Đế)', emoji: '🛡️', descPast: 'Quá khứ: Bạn đã thiết lập được một kỷ luật vững chắc và cấu trúc tài chính tốt.', descPresent: 'Hiện tại: Hãy làm chủ nông trại của mình một cách quyết đoán, gia cố chuồng trại ngay.', descFuture: 'Tương lai: Trở thành đại gia bất động sản nông nghiệp với số lượng ruộng lúa vô địch!' },
  { id: 5, name: 'The Hierophant (Giáo Hoàng)', emoji: '🏛️', descPast: 'Quá khứ: Bạn đã tuân theo những giá trị truyền thống và nhận được lời khuyên bổ ích.', descPresent: 'Hiện tại: Hãy học hỏi kinh nghiệm nuôi bò và gieo cấy lúa từ những người đi trước.', descFuture: 'Tương lai: Nhận được sự chỉ dẫn tâm linh giúp tránh khỏi mọi rủi ro thời tiết bão bùng!' },
  { id: 6, name: 'The Lovers (Tình Nhân)', emoji: '💖', descPast: 'Quá khứ: Bạn đã trải qua một sự kết nối sâu sắc hoặc đưa ra quyết định từ con tim.', descPresent: 'Hiện tại: Hãy cân bằng giữa việc chơi game giải trí và chăm chỉ làm nông kiếm tiền.', descFuture: 'Tương lai: Giao thương hữu nghị cực tốt ở sảnh game, kết nghĩa bằng hữu lâu dài!' },
  { id: 7, name: 'The Chariot (Chiến Xa)', emoji: '🏎️', descPast: 'Quá khứ: Bạn đã nỗ lực hết mình vượt qua nghịch cảnh và chiến thắng đầy tự hào.', descPresent: 'Hiện tại: Đừng do dự, hãy dồn xu mua rơm cho bò ăn và thu hoạch lúa thật nhanh.', descFuture: 'Tương lai: Ý chí sắt đá giúp bạn dẫn đầu bảng xếp hạng đại gia xu trong cộng đồng!' },
  { id: 8, name: 'Strength (Sức Mạnh)', emoji: '🦁', descPast: 'Quá khứ: Bạn đã kiên nhẫn và dùng lòng can đảm dịu dàng để thu phục những thử thách lớn.', descPresent: 'Hiện tại: Hãy điềm tĩnh đối phó với bão táp thời tiết hoặc biến động giá lúa ở chợ.', descFuture: 'Tương lai: Sức khỏe dồi dào, vượt qua mọi minigame sút bóng với điểm số kỷ lục!' },
  { id: 9, name: 'The Hermit (Ẩn Sĩ)', emoji: '🏮', descPast: 'Quá khứ: Bạn đã dành nhiều thời gian để suy ngẫm và thấu hiểu bản thân.', descPresent: 'Hiện tại: Đây là lúc đi chậm lại, kiểm kê balo và kho hàng cẩn thận trước khi bán lúa.', descFuture: 'Tương lai: Sự thông thái vượt bậc giúp bạn quản lý tài sản nông trại thông minh nhất!' },
  { id: 10, name: 'Wheel of Fortune (Số Phận)', emoji: '🎡', descPast: 'Quá khứ: Một chu kỳ biến động lớn đã đưa bạn đến vị trí vững vàng như hôm nay.', descPresent: 'Hiện tại: Số phận đang mỉm cười! May mắn bất ngờ sẽ gõ cửa chuồng trại của bạn.', descFuture: 'Tương lai: Trúng lớn xu vàng từ game hoặc bán nông sản được giá cao kịch trần!' },
  { id: 17, name: 'The Star (Ngôi Sao)', emoji: '⭐', descPast: 'Quá khứ: Bạn đã giữ vững niềm tin hy vọng dù trong thời điểm tăm tối nhất.', descPresent: 'Hiện tại: Sự chữa lành tâm hồn đang đến, xua tan mọi mệt mỏi sau những giờ cày cuốc.', descFuture: 'Tương lai: Tương lai sáng lạn rực rỡ, may mắn ngập tràn trên mọi nẻo đường đi dạo!' },
  { id: 18, name: 'The Moon (Mặt Trăng)', emoji: '🌙', descPast: 'Quá khứ: Nỗi sợ mơ hồ hoặc những ảo ảnh đôi lúc khiến bạn đi sai hướng.', descPresent: 'Hiện tại: Tránh đưa ra các quyết định mua bán lớn ở chợ khi tâm trạng chưa ổn định.', descFuture: 'Tương lai: Giác quan thứ sáu cực nhạy giúp bạn đoán trước được xu hướng giá lúa!' },
  { id: 19, name: 'The Sun (Mặt Trời)', emoji: '☀️', descPast: 'Quá khứ: Những thành tựu chói lọi và niềm vui tràn trề đã ghi dấu ấn sâu đậm.', descPresent: 'Hiện tại: Sự sáng tỏ tuyệt đối! Mọi việc bạn làm lúc này đều nhận hào quang may mắn.', descFuture: 'Tương lai: Thành công vang dội, giàu nứt đố đổ vách, bò sữa cho sữa béo ngậy mỗi ngày!' },
  { id: 21, name: 'The World (Thế Giới)', emoji: '🌍', descPast: 'Quá khứ: Bạn đã hoàn thành một chặng đường dài đầy tự hào và nhận phần thưởng xứng đáng.', descPresent: 'Hiện tại: Bạn đang cảm thấy trọn vẹn, sẵn sàng chia sẻ niềm vui nông trại với mọi người.', descFuture: 'Tương lai: Đạt đến đỉnh cao viên mãn của danh vọng, danh tiếng vang xa khắp sảnh chơi game!' }
];

export default function TarotPage() {
  const navigate = useNavigate();
  
  // State holds drawn cards for [Past, Present, Future]
  const [drawn, setDrawn] = useState([null, null, null]);
  const [isDrawingAll, setIsDrawingAll] = useState(false);

  const drawCardForIndex = (idx, currentDrawn = drawn) => {
    if (currentDrawn[idx]) return currentDrawn; // Already drawn for this slot

    // Filter out already drawn cards to prevent duplicates
    const drawnIds = currentDrawn.filter(c => c !== null).map(c => c.id);
    const available = TAROT_CARDS.filter(c => !drawnIds.includes(c.id));

    if (available.length === 0) return currentDrawn;

    const randomIndex = Math.floor(Math.random() * available.length);
    const selectedCard = available[randomIndex];

    const nextDrawn = [...currentDrawn];
    nextDrawn[idx] = selectedCard;
    
    setDrawn(nextDrawn);
    return nextDrawn;
  };

  const handleDrawAll = async () => {
    if (isDrawingAll) return;
    setIsDrawingAll(true);
    
    // Reset first
    let current = [null, null, null];
    setDrawn(current);

    // Sequential draw with nice delay for premium feel
    for (let i = 0; i < 3; i++) {
      await new Promise(res => setTimeout(res, 600));
      current = drawCardForIndex(i, current);
    }
    
    setIsDrawingAll(false);
  };

  const handleReset = () => {
    setDrawn([null, null, null]);
    setIsDrawingAll(false);
  };

  const allDrawn = drawn.every(c => c !== null);
  const anyDrawn = drawn.some(c => c !== null);

  return (
    <div className={styles.page}>
      <PixelCanvas />

      <main className={styles.main}>
        {/* Header */}
        <header className={`${styles.header} rpg-box fade-in`}>
          <div className="px-titlebar">
            <span>◄ XEM BÀI TAROT 🔮 ►</span>
          </div>
        </header>

        {/* Tarot Main Card */}
        <div className={`${styles.tarotCardContainer} rpg-box fade-in fade-in-delay-1`}>
          <div className="px-titlebar">
            <span>◄ QUẺ BÀI SỐ MỆNH (3 LÁ) ►</span>
          </div>

          <div style={{ fontSize: '0.80rem', opacity: 0.85, textAlign: 'center', lineHeight: '1.4' }}>
            Bấm vào từng lá bài để lật mở quá khứ, hiện tại và tương lai của bạn, hoặc bấm "RÚT TẤT CẢ" để xem quẻ bài định mệnh!
          </div>

          {/* Spread Section */}
          <div className={styles.spread}>
            {/* Card 1: Past */}
            <div className={styles.cardSlot}>
              <span className={styles.slotLabel}>🕒 QUÁ KHỨ</span>
              <div 
                className={`${styles.tarotCard} ${drawn[0] ? styles.flipped : ''}`}
                onClick={() => !isDrawingAll && drawCardForIndex(0)}
              >
                <div className={`${styles.cardFace} ${styles.cardBack}`}>
                  <div className={styles.cardBackContent}>
                    <span className={styles.mysticSymbol}>✨</span>
                  </div>
                </div>
                {drawn[0] && (
                  <div className={`${styles.cardFace} ${styles.cardFront}`}>
                    <span className={styles.cardNumber}>#{drawn[0].id}</span>
                    <span className={styles.cardEmoji}>{drawn[0].emoji}</span>
                    <span className={styles.cardName}>{drawn[0].name.split(' (')[0]}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Card 2: Present */}
            <div className={styles.cardSlot}>
              <span className={styles.slotLabel}>👁️ HIỆN TẠI</span>
              <div 
                className={`${styles.tarotCard} ${drawn[1] ? styles.flipped : ''}`}
                onClick={() => !isDrawingAll && drawCardForIndex(1)}
              >
                <div className={`${styles.cardFace} ${styles.cardBack}`}>
                  <div className={styles.cardBackContent}>
                    <span className={styles.mysticSymbol}>🔮</span>
                  </div>
                </div>
                {drawn[1] && (
                  <div className={`${styles.cardFace} ${styles.cardFront}`}>
                    <span className={styles.cardNumber}>#{drawn[1].id}</span>
                    <span className={styles.cardEmoji}>{drawn[1].emoji}</span>
                    <span className={styles.cardName}>{drawn[1].name.split(' (')[0]}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Card 3: Future */}
            <div className={styles.cardSlot}>
              <span className={styles.slotLabel}>🚀 TƯƠNG LAI</span>
              <div 
                className={`${styles.tarotCard} ${drawn[2] ? styles.flipped : ''}`}
                onClick={() => !isDrawingAll && drawCardForIndex(2)}
              >
                <div className={`${styles.cardFace} ${styles.cardBack}`}>
                  <div className={styles.cardBackContent}>
                    <span className={styles.mysticSymbol}>✨</span>
                  </div>
                </div>
                {drawn[2] && (
                  <div className={`${styles.cardFace} ${styles.cardFront}`}>
                    <span className={styles.cardNumber}>#{drawn[2].id}</span>
                    <span className={styles.cardEmoji}>{drawn[2].emoji}</span>
                    <span className={styles.cardName}>{drawn[2].name.split(' (')[0]}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={handleDrawAll}
              disabled={isDrawingAll}
            >
              {isDrawingAll ? '[ 🔮 ĐANG RÚT... ]' : '[ 🔮 RÚT TẤT CẢ ]'}
            </button>
            {anyDrawn && (
              <button 
                className="btn btn-outline"
                style={{ flex: 1, color: '#fca5a5', borderColor: '#fca5a5' }}
                onClick={handleReset}
                disabled={isDrawingAll}
              >
                [ 🔄 XÓA LƯỢT ]
              </button>
            )}
          </div>
        </div>

        {/* Scroll Section - Displays interpretations if any cards are drawn */}
        {anyDrawn && (
          <div className={`${styles.scrollContainer} fade-in`}>
            <div className={styles.scrollTitle}>
              <span>📜</span> CHI TIẾT QUẺ BÀI TAROT:
            </div>
            
            {drawn[0] && (
              <div className={styles.scrollBlock}>
                <div className={styles.blockTitle}>🕒 QUÁ KHỨ — {drawn[0].name}</div>
                <div>{drawn[0].descPast}</div>
              </div>
            )}

            {drawn[1] && (
              <div className={styles.scrollBlock}>
                <div className={styles.blockTitle}>👁️ HIỆN TẠI — {drawn[1].name}</div>
                <div>{drawn[1].descPresent}</div>
              </div>
            )}

            {drawn[2] && (
              <div className={styles.scrollBlock}>
                <div className={styles.blockTitle}>🚀 TƯƠNG LAI — {drawn[2].name}</div>
                <div>{drawn[2].descFuture}</div>
              </div>
            )}
          </div>
        )}

        <button 
          className="btn btn-outline" 
          onClick={() => navigate('/utilities')}
        >
          [ QUAY LẠI TIỆN ÍCH ]
        </button>
      </main>

      <BottomNav />
    </div>
  );
}
