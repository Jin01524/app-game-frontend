import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PixelCanvas from '../components/PixelCanvas';
import BottomNav from '../components/BottomNav';
import styles from './TarotPage.module.css';

const TAROT_CARDS = [
  { id: 0, name: 'The Fool (Kẻ Khờ)', emoji: '🎒', descPast: 'Quá khứ: Bạn đã dũng cảm bước ra khỏi vùng an toàn để bắt đầu một hành trình mới đầy khát vọng.', descPresent: 'Hiện tại: Đừng sợ hãi trước những điều chưa biết. Hãy tin tưởng vào bước đi tiếp theo của mình.', descFuture: 'Tương lai: Một cơ hội bất ngờ và những trải nghiệm mới mẻ đang chờ đón bạn phía trước.' },
  { id: 1, name: 'The Magician (Ảo Thuật Sĩ)', emoji: '🪄', descPast: 'Quá khứ: Bạn từng chứng minh được thực lực và óc sáng tạo vượt trội khi vượt qua thử thách.', descPresent: 'Hiện tại: Bạn đã tích lũy đủ tri thức và tài nguyên, hãy chủ động hiện thực hóa kế hoạch của mình.', descFuture: 'Tương lai: Bạn sẽ làm chủ được số phận và tạo ra những kết quả đột phá bằng năng lực cá nhân.' },
  { id: 2, name: 'High Priestess (Nữ Tư Tế)', emoji: '📖', descPast: 'Quá khứ: Bạn đã chọn cách điềm tĩnh nhìn nhận mọi việc thay vì phản ứng vội vã.', descPresent: 'Hiện tại: Hãy lắng nghe trực giác và tiếng nói sâu thẳm bên trong bạn trước khi quyết định.', descFuture: 'Tương lai: Sự thông thái và những tri thức ẩn giấu sẽ giúp bạn thấu suốt bản chất của vấn đề.' },
  { id: 3, name: 'The Empress (Nữ Hoàng)', emoji: '👑', descPast: 'Quá khứ: Sự nuôi dưỡng, tình yêu thương và những giá trị tốt đẹp đã nâng đỡ bạn trưởng thành.', descPresent: 'Hiện tại: Khí hậu cuộc sống đang trù phú và ôn hòa. Hãy trân trọng bản thân và những người xung quanh.', descFuture: 'Tương lai: Sự sung túc, phát triển thịnh vượng và hạnh phúc viên mãn đang đơm hoa kết trái.' },
  { id: 4, name: 'The Emperor (Hoàng Đế)', emoji: '🛡️', descPast: 'Quá khứ: Sự kỷ luật, quyết đoán và việc thiết lập giới hạn rõ ràng đã giúp bảo vệ bạn vững vàng.', descPresent: 'Hiện tại: Hãy chịu trách nhiệm tối đa với cuộc sống của mình và thiết lập một cấu trúc ổn định.', descFuture: 'Tương lai: Bạn sẽ đạt được vị thế vững chãi, dẫn dắt đội ngũ hoặc kiểm soát tốt tương lai của mình.' },
  { id: 5, name: 'The Hierophant (Giáo Hoàng)', emoji: '🏛️', descPast: 'Quá khứ: Bạn luôn tôn trọng những giá trị cốt lõi, đạo đức và những lời khuyên truyền thống quý giá.', descPresent: 'Hiện tại: Đây là thời điểm tốt để học hỏi sâu sắc từ những người thầy hoặc tìm kiếm điểm tựa tinh thần.', descFuture: 'Tương lai: Sự giác ngộ và triết lý sống đúng đắn sẽ dẫn lối bạn đi đúng con đường chính nghĩa.' },
  { id: 6, name: 'The Lovers (Tình Nhân)', emoji: '💖', descPast: 'Quá khứ: Bạn đã đưa ra sự lựa chọn lớn dựa trên tình cảm chân thành hoặc có mối quan hệ sâu sắc.', descPresent: 'Hiện tại: Hãy chọn con đường hòa hợp, trung thực với cảm xúc của mình và biết thấu hiểu.', descFuture: 'Tương lai: Mối quan hệ bền chặt và những quyết định đồng điệu từ trái tim đang tiến tới gần bạn.' },
  { id: 7, name: 'The Chariot (Chiến Xa)', emoji: '🏎️', descPast: 'Quá khứ: Ý chí sắt đá và sự kiên định không ngừng nghỉ đã giúp bạn vượt qua những rào cản lớn.', descPresent: 'Hiện tại: Hãy tập trung năng lượng, kiểm soát cảm xúc trái chiều và kiên quyết tiến về phía trước.', descFuture: 'Tương lai: Sự chiến thắng vang dội trước nghịch cảnh nhờ vào nỗ lực cá nhân bền bỉ của chính bạn.' },
  { id: 8, name: 'Strength (Sức Mạnh)', emoji: '🦁', descPast: 'Quá khứ: Bạn đã dùng sự kiên nhẫn và lòng trắc ẩn dịu dàng để đối diện với nghịch cảnh khắc nghiệt.', descPresent: 'Hiện tại: Sức mạnh tinh thần và lòng kiên định là chìa khóa của bạn lúc này, chứ không phải vũ lực.', descFuture: 'Tương lai: Bạn sẽ làm chủ được những cảm xúc tiêu cực bên trong và thuần hóa được mọi khó khăn ngoại cảnh.' },
  { id: 9, name: 'The Hermit (Ẩn Sĩ)', emoji: '🏮', descPast: 'Quá khứ: Khoảng thời gian cô độc suy ngẫm giúp bạn tích lũy tri thức nội tâm sâu sắc.', descPresent: 'Hiện tại: Hãy tạm tách mình khỏi những ồn ào xung quanh để nhìn nhận thấu đáo mục tiêu cuộc đời.', descFuture: 'Tương lai: Bạn sẽ tìm ra chân lý và ngọn đèn dẫn lối vượt qua những giai đoạn sương mù mù mịt.' },
  { id: 10, name: 'Wheel of Fortune (Số Phận)', emoji: '🎡', descPast: 'Quá khứ: Những biến cố bất ngờ xảy ra đã giúp bạn học được cách chấp nhận sự vô thường.', descPresent: 'Hiện tại: Một chương mới sắp mở ra. Mọi sự thay đổi lúc này đều là sự sắp đặt tốt đẹp của số phận.', descFuture: 'Tương lai: Sự xoay vần của vận mệnh mang lại cho bạn những vận may lớn và bước ngoặt tích cực.' },
  { id: 17, name: 'The Star (Ngôi Sao)', emoji: '⭐', descPast: 'Quá khứ: Niềm hy vọng và ước mơ trong sáng luôn là ngọn hải đăng cứu rỗi tâm hồn bạn.', descPresent: 'Hiện tại: Hãy tin tưởng vào quá trình chữa lành. Sự bình yên và niềm cảm hứng đang quay trở lại.', descFuture: 'Tương lai: Một tương lai tươi sáng, ngập tràn hy vọng và mọi ước nguyện tốt lành sẽ dần hiện thực.' },
  { id: 18, name: 'The Moon (Mặt Trăng)', emoji: '🌙', descPast: 'Quá khứ: Nỗi sợ mơ hồ, ảo giác hay những hoang mang đôi lúc đã khiến bạn lạc lối.', descPresent: 'Hiện tại: Hãy thận trọng trước những lời hứa hẹn không rõ ràng và đối mặt trực diện với nỗi sợ hãi.', descFuture: 'Tương lai: Trực giác và giác quan thứ sáu nhạy bén sẽ giúp bạn vén bức màn sương để nhìn rõ sự thật.' },
  { id: 19, name: 'The Sun (Mặt Trời)', emoji: '☀️', descPast: 'Quá khứ: Những ngày tháng hạnh phúc, ấm áp và thành tựu rực rỡ đã khắc sâu trong ký ức.', descPresent: 'Hiện tại: Sự rõ ràng, tràn đầy năng lượng tích cực và may mắn đang bao trùm lấy cuộc sống của bạn.', descFuture: 'Tương lai: Thành công vang dội, hào quang chiến thắng và niềm vui sống ngập tràn muôn nơi.' },
  { id: 21, name: 'The World (Thế Giới)', emoji: '🌍', descPast: 'Quá khứ: Bạn đã hoàn thành xuất sắc một giai đoạn quan trọng của cuộc đời và nhận quả ngọt xứng đáng.', descPresent: 'Hiện tại: Bạn đang cảm thấy trọn vẹn, tự do và sẵn sàng bước sang một chương lớn hơn.', descFuture: 'Tương lai: Đạt tới đỉnh cao viên mãn, sự kết thúc trọn vẹn của hành trình cũ và khai mở chân trời mới.' }
];

export default function TarotPage() {
  const navigate = useNavigate();
  
  // State holds drawn cards for [Past, Present, Future]
  const [drawn, setDrawn] = useState([null, null, null]);

  const drawCardForIndex = (idx) => {
    if (drawn[idx]) return; // Already drawn for this slot

    // Filter out already drawn cards to prevent duplicates
    const drawnIds = drawn.filter(c => c !== null).map(c => c.id);
    const available = TAROT_CARDS.filter(c => !drawnIds.includes(c.id));

    if (available.length === 0) return;

    const randomIndex = Math.floor(Math.random() * available.length);
    const selectedCard = available[randomIndex];

    const nextDrawn = [...drawn];
    nextDrawn[idx] = selectedCard;
    
    setDrawn(nextDrawn);
  };

  const handleReset = () => {
    setDrawn([null, null, null]);
  };

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
            Bấm vào từng lá bài để lật mở quá khứ, hiện tại và tương lai của bạn!
          </div>

          {/* Spread Section */}
          <div className={styles.spread}>
            {/* Card 1: Past */}
            <div className={styles.cardSlot}>
              <span className={styles.slotLabel}>🕒 QUÁ KHỨ</span>
              <div 
                className={`${styles.tarotCard} ${drawn[0] ? styles.flipped : ''}`}
                onClick={() => drawCardForIndex(0)}
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
                onClick={() => drawCardForIndex(1)}
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
                onClick={() => drawCardForIndex(2)}
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
          {anyDrawn && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="btn btn-outline"
                style={{ flex: 1, color: '#fca5a5', borderColor: '#fca5a5' }}
                onClick={handleReset}
              >
                [ 🔄 RÚT LƯỢT MỚI / XÓA HẾT ]
              </button>
            </div>
          )}
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
