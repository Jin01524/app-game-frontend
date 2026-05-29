// tarotData.js - Contains Vietnamese interpretations for all 78 Tarot cards

export const TAROT_CARDS = [
  // MAJOR ARCANA (0 - 21)
  {
    id: 0,
    name: 'The Fool (Kẻ Khờ)',
    filename: 'thefool.webp',
    descPast: 'Quá khứ: Bạn đã dũng cảm bước ra khỏi vùng an toàn để bắt đầu một hành trình mới đầy khát vọng.',
    descPresent: 'Hiện tại: Đừng sợ hãi trước những điều chưa biết. Hãy tin tưởng vào bước đi tiếp theo của mình.',
    descFuture: 'Tương lai: Một cơ hội bất ngờ và những trải nghiệm mới mẻ đang chờ đón bạn phía trước.'
  },
  {
    id: 1,
    name: 'The Magician (Ảo Thuật Sĩ)',
    filename: 'themagician.webp',
    descPast: 'Quá khứ: Bạn từng chứng minh được thực lực và óc sáng tạo vượt trội khi vượt qua thử thách.',
    descPresent: 'Hiện tại: Bạn đã tích lũy đủ tri thức và tài nguyên, hãy chủ động hiện thực hóa kế hoạch của mình.',
    descFuture: 'Tương lai: Bạn sẽ làm chủ được số phận và tạo ra những kết quả đột phá bằng năng lực cá nhân.'
  },
  {
    id: 2,
    name: 'High Priestess (Nữ Tư Tế)',
    filename: 'thehighpriestess.webp',
    descPast: 'Quá khứ: Bạn đã chọn cách điềm tĩnh nhìn nhận mọi việc thay vì phản ứng vội vã.',
    descPresent: 'Hiện tại: Hãy lắng nghe trực giác và tiếng nói sâu thẳm bên trong bạn trước khi quyết định.',
    descFuture: 'Tương lai: Sự thông thái và những tri thức ẩn giấu sẽ giúp bạn thấu suốt bản chất của vấn đề.'
  },
  {
    id: 3,
    name: 'The Empress (Nữ Hoàng)',
    filename: 'theempress.webp',
    descPast: 'Quá khứ: Sự nuôi dưỡng, tình yêu thương và những giá trị tốt đẹp đã nâng đỡ bạn trưởng thành.',
    descPresent: 'Hiện tại: Khí hậu cuộc sống đang trù phú và ôn hòa. Hãy trân trọng bản thân và những người xung quanh.',
    descFuture: 'Tương lai: Sự sung túc, phát triển thịnh vượng và hạnh phúc viên mãn đang đơm hoa kết trái.'
  },
  {
    id: 4,
    name: 'The Emperor (Hoàng Đế)',
    filename: 'theemperor.webp',
    descPast: 'Quá khứ: Sự kỷ luật, quyết đoán và việc thiết lập giới hạn rõ ràng đã giúp bảo vệ bạn vững vàng.',
    descPresent: 'Hiện tại: Hãy chịu trách nhiệm tối đa với cuộc sống của mình và thiết lập một cấu trúc ổn định.',
    descFuture: 'Tương lai: Bạn sẽ đạt được vị thế vững chãi, dẫn dắt đội ngũ hoặc kiểm soát tốt tương lai của mình.'
  },
  {
    id: 5,
    name: 'The Hierophant (Giáo Hoàng)',
    filename: 'thehierophant.webp',
    descPast: 'Quá khứ: Bạn luôn tôn trọng những giá trị cốt lõi, đạo đức và những lời khuyên truyền thống quý giá.',
    descPresent: 'Hiện tại: Đây là thời điểm tốt để học hỏi sâu sắc từ những người thầy hoặc tìm kiếm điểm tựa tinh thần.',
    descFuture: 'Tương lai: Sự giác ngộ và triết lý sống đúng đắn sẽ dẫn lối bạn đi đúng con đường chính nghĩa.'
  },
  {
    id: 6,
    name: 'The Lovers (Tình Nhân)',
    filename: 'thelovers.webp',
    descPast: 'Quá khứ: Bạn đã đưa ra sự lựa chọn lớn dựa trên tình cảm chân thành hoặc có mối quan hệ sâu sắc.',
    descPresent: 'Hiện tại: Hãy chọn con đường hòa hợp, trung thực với cảm xúc của mình và biết thấu hiểu.',
    descFuture: 'Tương lai: Mối quan hệ bền chặt và những quyết định đồng điệu từ trái tim đang tiến tới gần bạn.'
  },
  {
    id: 7,
    name: 'The Chariot (Chiến Xa)',
    filename: 'thechariot.webp',
    descPast: 'Quá khứ: Ý chí sắt đá và sự kiên định không ngừng nghỉ đã giúp bạn vượt qua những rào cản lớn.',
    descPresent: 'Hiện tại: Hãy tập trung năng lượng, kiểm soát cảm xúc trái chiều và kiên quyết tiến về phía trước.',
    descFuture: 'Tương lai: Sự chiến thắng vang dội trước nghịch cảnh nhờ vào nỗ lực cá nhân bền bỉ của chính bạn.'
  },
  {
    id: 8,
    name: 'Strength (Sức Mạnh)',
    filename: 'strength.webp',
    descPast: 'Quá khứ: Bạn đã dùng sự kiên nhẫn và lòng trắc ẩn dịu dàng để đối diện với nghịch cảnh khắc nghiệt.',
    descPresent: 'Hiện tại: Sức mạnh tinh thần và lòng kiên định là chìa khóa của bạn lúc này, chứ không phải vũ lực.',
    descFuture: 'Tương lai: Bạn sẽ làm chủ được những cảm xúc tiêu cực bên trong và thuần hóa được mọi khó khăn ngoại cảnh.'
  },
  {
    id: 9,
    name: 'The Hermit (Ẩn Sĩ)',
    filename: 'thehermit.webp',
    descPast: 'Quá khứ: Khoảng thời gian cô độc suy ngẫm giúp bạn tích lũy tri thức nội tâm sâu sắc.',
    descPresent: 'Hiện tại: Hãy tạm tách mình khỏi những ồn ào xung quanh để nhìn nhận thấu đáo mục tiêu cuộc đời.',
    descFuture: 'Tương lai: Bạn sẽ tìm ra chân lý và ngọn đèn dẫn lối vượt qua những giai đoạn sương mù mù mịt.'
  },
  {
    id: 10,
    name: 'Wheel of Fortune (Số Phận)',
    filename: 'wheeloffortune.webp',
    descPast: 'Quá khứ: Những biến cố bất ngờ xảy ra đã giúp bạn học được cách chấp nhận sự vô thường.',
    descPresent: 'Hiện tại: Một chương mới sắp mở ra. Mọi sự thay đổi lúc này đều là sự sắp đặt tốt đẹp của số phận.',
    descFuture: 'Tương lai: Sự xoay vần của vận mệnh mang lại cho bạn những vận may lớn và bước ngoặt tích cực.'
  },
  {
    id: 11,
    name: 'Justice (Công Lý)',
    filename: 'justice.webp',
    descPast: 'Quá khứ: Mọi quyết định và gieo nhân gặt quả trong quá khứ nay bắt đầu trả lại kết quả xứng đáng.',
    descPresent: 'Hiện tại: Hãy công bằng, khách quan và trung thực. Sự thật sẽ bảo vệ bạn tốt nhất lúc này.',
    descFuture: 'Tương lai: Một phán quyết công bằng sẽ được đưa ra, mang lại sự cân bằng vốn có cho cuộc sống của bạn.'
  },
  {
    id: 12,
    name: 'The Hanged Man (Kẻ Treo Cổ)',
    filename: 'thehangedman.webp',
    descPast: 'Quá khứ: Bạn đã chịu hy sinh lợi ích ngắn hạn hoặc học cách chấp nhận sự đình trệ để chiêm nghiệm.',
    descPresent: 'Hiện tại: Hãy học cách nhìn nhận vấn đề dưới một góc nhìn hoàn toàn mới, đổi ngược tư duy thông thường.',
    descFuture: 'Tương lai: Sự giải phóng tinh thần và những thấu suốt sâu sắc xuất hiện sau khi bạn chịu buông bỏ sự kiểm soát.'
  },
  {
    id: 13,
    name: 'Death (Tử Thần)',
    filename: 'death.webp',
    descPast: 'Quá khứ: Một giai đoạn lớn, mối quan hệ hoặc thói quen cũ đã chính thức khép lại hoàn toàn.',
    descPresent: 'Hiện tại: Hãy chấp nhận sự kết thúc này như một sự đào thải tất yếu để chuẩn bị cho sự tái sinh.',
    descFuture: 'Tương lai: Sự lột xác toàn diện, mở ra một chương mới tràn đầy năng lượng tươi sáng và tích cực hơn.'
  },
  {
    id: 14,
    name: 'Temperance (Tiết Độ)',
    filename: 'temperance.webp',
    descPast: 'Quá khứ: Bạn đã học được cách dung hòa các yếu tố mâu thuẫn để tạo ra sự bình ổn.',
    descPresent: 'Hiện tại: Sự cân bằng, kiềm chế và kiên nhẫn là chìa khóa. Tránh những phản ứng cực đoan.',
    descFuture: 'Tương lai: Mối quan hệ và công việc của bạn sẽ đạt tới trạng thái hòa hợp sâu sắc, chảy trôi tự nhiên.'
  },
  {
    id: 15,
    name: 'The Devil (Ác Quỷ)',
    filename: 'thedevil.webp',
    descPast: 'Quá khứ: Bạn từng bị cuốn vào những thói quen tiêu cực, cám dỗ vật chất hoặc sự phụ thuộc quá mức.',
    descPresent: 'Hiện tại: Hãy nhận diện những xiềng xích vô hình do chính bạn tạo ra để can đảm tháo gỡ chúng.',
    descFuture: 'Tương lai: Bạn sẽ giành lại quyền làm chủ cuộc đời mình sau khi vượt qua nỗi sợ hãi hoặc thói xấu cũ.'
  },
  {
    id: 16,
    name: 'The Tower (Tòa Tháp)',
    filename: 'thetower.webp',
    descPast: 'Quá khứ: Một sự sụp đổ bất ngờ hoặc một cú sốc đã phá vỡ những nền tảng giả tạo mà bạn cố bám víu.',
    descPresent: 'Hiện tại: Đừng cố níu giữ những gì đang đổ vỡ. Hãy đón nhận nó để xây dựng lại một tương lai vững chãi hơn.',
    descFuture: 'Tương lai: Sự giải thoát triệt để khỏi ảo vọng, mang lại cơ hội tái thiết lại cuộc sống trên nền đất thật.'
  },
  {
    id: 17,
    name: 'The Star (Ngôi Sao)',
    filename: 'thestar.webp',
    descPast: 'Quá khứ: Niềm hy vọng và ước mơ trong sáng luôn là ngọn hải đăng cứu rỗi tâm hồn bạn.',
    descPresent: 'Hiện tại: Hãy tin tưởng vào quá trình chữa lành. Sự bình yên và niềm cảm hứng đang quay trở lại.',
    descFuture: 'Tương lai: Một tương lai tươi sáng, ngập tràn hy vọng và mọi ước nguyện tốt lành sẽ dần hiện thực.'
  },
  {
    id: 18,
    name: 'The Moon (Mặt Trăng)',
    filename: 'themoon.webp',
    descPast: 'Quá khứ: Nỗi sợ mơ hồ, ảo giác hay những hoang mang đôi lúc đã khiến bạn lạc lối.',
    descPresent: 'Hiện tại: Hãy thận trọng trước những lời hứa hẹn không rõ ràng và đối mặt trực diện với nỗi sợ hãi.',
    descFuture: 'Tương lai: Trực giác và giác quan thứ sáu nhạy bén sẽ giúp bạn vén bức màn sương để nhìn rõ sự thật.'
  },
  {
    id: 19,
    name: 'The Sun (Mặt Trời)',
    filename: 'thesun.webp',
    descPast: 'Quá khứ: Những ngày tháng hạnh phúc, ấm áp và thành tựu rực rỡ đã khắc sâu trong ký ức.',
    descPresent: 'Hiện tại: Sự rõ ràng, tràn đầy năng lượng tích cực và may mắn đang bao trùm lấy cuộc sống của bạn.',
    descFuture: 'Tương lai: Thành công vang dội, hào quang chiến thắng và niềm vui sống ngập tràn muôn nơi.'
  },
  {
    id: 20,
    name: 'Judgement (Phán Xét)',
    filename: 'judgement.webp',
    descPast: 'Quá khứ: Bạn đã lắng nghe tiếng gọi thức tỉnh bên trong và dũng cảm đối mặt với sự thật cuộc đời.',
    descPresent: 'Hiện tại: Thời điểm đưa ra quyết định quan trọng mang tính bước ngoặt đổi thay vận mệnh toàn diện.',
    descFuture: 'Tương lai: Sự cứu rỗi tâm hồn, rũ bỏ hoàn toàn gánh nặng quá khứ để bước tiếp với tâm thế thanh thản.'
  },
  {
    id: 21,
    name: 'The World (Thế Giới)',
    filename: 'theworld.webp',
    descPast: 'Quá khứ: Bạn đã hoàn thành xuất sắc một giai đoạn quan trọng của cuộc đời và nhận quả ngọt xứng đáng.',
    descPresent: 'Hiện tại: Bạn đang cảm thấy trọn vẹn, tự do và sẵn sàng bước sang một chương lớn hơn.',
    descFuture: 'Tương lai: Đạt tới đỉnh cao viên mãn, sự kết thúc trọn vẹn của hành trình cũ và khai mở chân trời mới.'
  },

  // MINOR ARCANA - WANDS (Gậy) (22 - 35)
  {
    id: 22,
    name: 'Ace of Wands (Át Gậy)',
    filename: 'Ace-of-wands.webp',
    descPast: 'Quá khứ: Nguồn cảm hứng dồi dào ban đầu đã thôi thúc bạn khai mở ý tưởng sáng tạo tuyệt vời.',
    descPresent: 'Hiện tại: Một cơ hội hành động thực tế cực lớn đang xuất hiện. Hãy bắt lấy nó ngay không ngần ngại.',
    descFuture: 'Tương lai: Bắt đầu một sự nghiệp hoặc dự án mới ngập tràn đam mê và mang lại thành tựu rực rỡ.'
  },
  {
    id: 23,
    name: 'Two of Wands (Hai Gậy)',
    filename: 'Two-of-wands.webp',
    descPast: 'Quá khứ: Bạn đã tích lũy đủ các yếu tố bước đầu và bắt đầu đứng lên hoạch định chiến lược dài hạn.',
    descPresent: 'Hiện tại: Hãy mở rộng tầm nhìn toàn cầu, cân nhắc những lựa chọn lớn để tiến xa hơn.',
    descFuture: 'Tương lai: Bạn sẽ bước ra biển lớn, đưa ra những quyết định mang tính vĩ mô vượt tầm hiện tại.'
  },
  {
    id: 24,
    name: 'Three of Wands (Ba Gậy)',
    filename: 'Three-of-wands.webp',
    descPast: 'Quá khứ: Quyết định mở rộng của bạn trong quá khứ đã được thực thi và đang bắt đầu sinh hoa trái.',
    descPresent: 'Hiện tại: Những con tàu buôn đang cập bến mang theo cơ hội hợp tác và tài nguyên dồi dào.',
    descFuture: 'Tương lai: Tầm nhìn của bạn sẽ được khẳng định, mở rộng quy mô hoạt động và tiếp cận những thành tựu lớn.'
  },
  {
    id: 25,
    name: 'Four of Wands (Bốn Gậy)',
    filename: 'Four-of-wands.webp',
    descPast: 'Quá khứ: Sự đồng lòng, nền móng vững chãi đã giúp gia đình/tổ chức của bạn luôn yên vui.',
    descPresent: 'Hiện tại: Không khí ăn mừng, sự an cư lạc nghiệp và kết nối bền vững đang bao bọc lấy cuộc sống.',
    descFuture: 'Tương lai: Một sự kiện hỷ sự, thành công lớn mang tính cột mốc bền vững mang lại sự yên bình lâu dài.'
  },
  {
    id: 26,
    name: 'Five of Wands (Năm Gậy)',
    filename: 'Five-of-wands.webp',
    descPast: 'Quá khứ: Bạn đã trải qua những cuộc tranh luận náo nhiệt hoặc xung đột lợi ích nội bộ đầy căng thẳng.',
    descPresent: 'Hiện tại: Hãy nhìn nhận sự cạnh tranh lúc này như động lực phát triển, tránh làm tổn thương hòa khí.',
    descFuture: 'Tương lai: Vượt qua sự hỗn loạn, bạn sẽ tìm ra được hướng đi độc bản sau khi cọ xát thực tế.'
  },
  {
    id: 27,
    name: 'Six of Wands (Sáu Gậy)',
    filename: 'Six-of-wands.webp',
    descPast: 'Quá khứ: Sự cống hiến vượt bậc của bạn đã mang lại chiến công vẻ vang bước đầu được ghi nhận.',
    descPresent: 'Hiện tại: Hào quang chiến thắng, sự tự tin và công nhận từ số đông đang giúp bạn tỏa sáng.',
    descFuture: 'Tương lai: Bạn sẽ dẫn dắt mọi người đạt tới đỉnh cao vẻ vang, gặt hái danh vọng xứng đáng với công lao.'
  },
  {
    id: 28,
    name: 'Seven of Wands (Bảy Gậy)',
    filename: 'Seven-ofwands.webp',
    descPast: 'Quá khứ: Bạn từng kiên cường bảo vệ thành quả của mình trước nhiều sự cạnh tranh và dèm pha.',
    descPresent: 'Hiện tại: Hãy đứng vững ở vị trí cao, bảo vệ lập trường độc lập và vượt qua mọi áp lực dồn dập.',
    descFuture: 'Tương lai: Sự chiến thắng kiêu hãnh trước sóng gió nhờ vào tinh thần dũng mãnh quả cảm của bạn.'
  },
  {
    id: 29,
    name: 'Eight of Wands (Tám Gậy)',
    filename: 'Eight-of-wands.webp',
    descPast: 'Quá khứ: Những chuyển động nhanh chóng và sự biến thiên mau lẹ đã đưa bạn đi một chặng đường dài.',
    descPresent: 'Hiện tại: Mọi tin tức tốt lành và tiến triển công việc đang lao nhanh như những mũi tên bắn đi.',
    descFuture: 'Tương lai: Sự bứt tốc ngoạn mục, mọi nút thắt sẽ được tháo gỡ chớp nhoáng mang lại kết quả bất ngờ.'
  },
  {
    id: 30,
    name: 'Nine of Wands (Chín Gậy)',
    filename: 'Nine-of-wands.webp',
    descPast: 'Quá khứ: Trải qua nhiều trận chiến cam go, tâm hồn bạn đôi chút mệt mỏi nhưng đầy kinh nghiệm.',
    descPresent: 'Hiện tại: Hãy kiên trì bền bỉ bảo vệ thành lũy ở chặng cuối thử thách. Bình minh đang rất cận kề.',
    descFuture: 'Tương lai: Sự kiên cường vô song sẽ giúp bạn vượt qua rào cản cuối cùng để đạt đến thắng lợi vẹn toàn.'
  },
  {
    id: 31,
    name: 'Ten of Wands (Mười Gậy)',
    filename: 'Ten-of-wands.webp',
    descPast: 'Quá khứ: Bạn đã gánh vác quá nhiều trọng trách, tạo áp lực khổng lồ đè nặng lên vai.',
    descPresent: 'Hiện tại: Hãy học cách ủy quyền, buông bớt những gánh nặng không thuộc về mình để hồi phục.',
    descFuture: 'Tương lai: Tìm lại tự do tinh thần và sự cân bằng sau khi sắp xếp lại phân bổ công việc khoa học hơn.'
  },
  {
    id: 32,
    name: 'Page of Wands (Tiểu Thư Gậy)',
    filename: 'Page-of-wands.webp',
    descPast: 'Quá khứ: Sự tò mò trong sáng và khao khát học hỏi ban đầu đã thắp lên ngọn lửa đam mê của bạn.',
    descPresent: 'Hiện tại: Đón nhận tin nhắn tích cực thôi thúc bạn bắt tay khám phá một lĩnh vực mới đầy hăng say.',
    descFuture: 'Tương lai: Bản lĩnh trẻ trung, sự linh hoạt giúp bạn thích nghi tốt và đạt những bước tiến vững chắc.'
  },
  {
    id: 33,
    name: 'Knight of Wands (Hiệp Sĩ Gậy)',
    filename: 'Knight-of-wands.webp',
    descPast: 'Quá khứ: Bạn từng lao đi chinh phục mục tiêu như một chiến binh quả cảm, đôi khi hơi bốc đồng.',
    descPresent: 'Hiện tại: Hãy hành động dứt khoát, giữ vững ngọn lửa đam mê nhưng cần kiểm soát tốt lý trí.',
    descFuture: 'Tương lai: Hành trình phiêu lưu khám phá những miền đất mới hứa hẹn những bứt phá danh vọng vẻ vang.'
  },
  {
    id: 34,
    name: 'Queen of Wands (Nữ Hoàng Gậy)',
    filename: 'Queen-of-wands.webp',
    descPast: 'Quá khứ: Sự tự tin, ấm áp và khả năng truyền cảm hứng của bạn luôn thu hút được quý nhân.',
    descPresent: 'Hiện tại: Hãy làm chủ nguồn năng lượng ấm áp bên trong, dẫn dắt cộng đồng bằng trái tim nhân hậu.',
    descFuture: 'Tương lai: Trở thành điểm tựa vững chãi, lan tỏa ánh sáng rực rỡ và gặt hái sự kính trọng sâu sắc.'
  },
  {
    id: 35,
    name: 'King of Wands (Vua Gậy)',
    filename: 'King-of-wands.webp',
    descPast: 'Quá khứ: Tầm nhìn vĩ mô và uy tín dẫn đầu của bạn đã định hình nên sự nghiệp vững vàng.',
    descPresent: 'Hiện tại: Hãy quyết định dựa trên đại cuộc, sử dụng quyền uy một cách thông thái và nhân văn.',
    descFuture: 'Tương lai: Đạt tới đỉnh cao quyền lực hành động, thiết lập những đế chế sáng tạo bền vững dài lâu.'
  },

  // MINOR ARCANA - CUPS (Cốc) (36 - 49)
  {
    id: 36,
    name: 'Ace of Cups (Át Cốc)',
    filename: 'Ace-of-cups.webp',
    descPast: 'Quá khứ: Sự khơi nguồn cảm xúc chân thành đã tưới mát tâm hồn bạn sau những khô cằn.',
    descPresent: 'Hiện tại: Tình yêu, sự chữa lành và niềm vui trào dâng đang tràn ngập trong trái tim bạn.',
    descFuture: 'Tương lai: Bắt đầu một mối quan hệ tri kỷ, sự bình yên và suối nguồn nghệ thuật tuôn chảy dạt dào.'
  },
  {
    id: 37,
    name: 'Two of Cups (Hai Cốc)',
    filename: '2-of-cups.webp',
    descPast: 'Quá khứ: Sự kết nối hài hòa và thấu hiểu sâu sắc giữa hai tâm hồn đã thiết lập nền tảng bền chặt.',
    descPresent: 'Hiện tại: Hãy trân trọng người bạn đời, đồng nghiệp hoặc mối quan hệ song phương tốt đẹp lúc này.',
    descFuture: 'Tương lai: Sự cam kết vững chắc, hôn nhân viên mãn hoặc hợp đồng hợp tác vô cùng thuận lợi.'
  },
  {
    id: 38,
    name: 'Three of Cups (Ba Cốc)',
    filename: '3-of-cups.webp',
    descPast: 'Quá khứ: Sự tụ họp vui vẻ và hỗ trợ đắc lực từ hội nhóm thân thiết mang lại niềm vui lớn.',
    descPresent: 'Hiện tại: Không khí hội hè, sum vầy bên những người bạn trân quý để cùng ăn mừng thành quả.',
    descFuture: 'Tương lai: Sự chia sẻ ngọt ngào, nhận được sự cổ vũ nhiệt thành và niềm hạnh phúc thăng hoa.'
  },
  {
    id: 39,
    name: 'Four of Cups (Bốn Cốc)',
    filename: '4-of-cups.webp',
    descPast: 'Quá khứ: Cảm giác thờ ơ, buồn chán hay sự thất vọng nhẹ đã làm bạn khép chặt cánh cửa lòng.',
    descPresent: 'Hiện tại: Hãy ngẩng đầu lên để nhìn thấy chiếc cốc vàng cơ hội đang được dâng trao ngay trước mắt.',
    descFuture: 'Tương lai: Sự thức tỉnh cảm xúc, vượt qua giai đoạn đình trệ tâm lý để tái hòa nhập thế giới.'
  },
  {
    id: 40,
    name: 'Five of Cups (Năm Cốc)',
    filename: '5-of-cups.webp',
    descPast: 'Quá khứ: Sự tiếc nuối và buồn đau từ những cốc nước đổ đã che mờ mắt bạn trong một thời gian dài.',
    descPresent: 'Hiện tại: Hãy quay lưng lại với quá khứ mất mát để nhìn thấy hai chiếc cốc nguyên vẹn phía sau lưng.',
    descFuture: 'Tương lai: Quá trình hồi sinh mạnh mẽ từ những vết thương, tìm thấy hy vọng mới sáng ngời.'
  },
  {
    id: 41,
    name: 'Six of Cups (Sáu Cốc)',
    filename: '6-of-cups.webp',
    descPast: 'Quá khứ: Những ký ức tuổi thơ tươi đẹp, sự sẻ chia hồn nhiên luôn nâng đỡ bạn những khi yếu lòng.',
    descPresent: 'Hiện tại: Một người bạn cũ hoặc một món quà chân thành từ quá khứ đang quay trở lại mang theo sự ấm áp.',
    descFuture: 'Tương lai: Sự hòa giải tốt đẹp, quay về với những giá trị nguyên bản mộc mạc và chân thành nhất.'
  },
  {
    id: 42,
    name: 'Seven of Cups (Bảy Cốc)',
    filename: '7-of-cups.webp',
    descPast: 'Quá khứ: Bạn từng đắm chìm trong vô vàn ảo ảnh, dự tính xa vời thiếu đi tính thực tế.',
    descPresent: 'Hiện tại: Hãy tỉnh táo chọn lọc mục tiêu cốt lõi, tránh bị phân tâm bởi những bánh vẽ rực rỡ.',
    descFuture: 'Tương lai: Sự thấu suốt thực tế giúp bạn đưa ra lựa chọn sáng suốt và gặt hái kết quả thực.'
  },
  {
    id: 43,
    name: 'Eight of Cups (Tám Cốc)',
    filename: '8-of-cups.webp',
    descPast: 'Quá khứ: Quyết định dũng cảm rời bỏ những gì không còn phù hợp để đi tìm chân lý tinh thần cao hơn.',
    descPresent: 'Hiện tại: Hãy tiếp tục bước đi trên con đường của riêng mình, hướng tới những giá trị đích thực.',
    descFuture: 'Tương lai: Sự giác ngộ tâm linh sâu sắc, đạt tới trạng thái an nhiên tự tại mà tiền bạc không mua được.'
  },
  {
    id: 44,
    name: 'Nine of Cups (Chín Cốc)',
    filename: '9-of-cups.webp',
    descPast: 'Quá khứ: Bạn đã tự tạo ra hạnh phúc độc lập, tự chủ hoàn toàn trong thế giới nội tâm tinh tế.',
    descPresent: 'Hiện tại: Mọi ước nguyện đang dần thành hiện thực. Hãy tận hưởng niềm vui sống trọn vẹn này.',
    descFuture: 'Tương lai: Đạt tới sự sung túc viên mãn về cả vật chất lẫn cảm xúc cá nhân rất đáng tự hào.'
  },
  {
    id: 45,
    name: 'Ten of Cups (Mười Cốc)',
    filename: '10-of-cups.webp',
    descPast: 'Quá khứ: Mái ấm bình yên, sự hòa thuận trong mối quan hệ luôn là bến đỗ an lành nuôi dưỡng bạn.',
    descPresent: 'Hiện tại: Cầu vồng hạnh phúc đang tỏa sáng rực rỡ, gia đình sum vầy đồng lòng thấu hiểu.',
    descFuture: 'Tương lai: Hạnh phúc trọn đời, sự thăng hoa của tình yêu bền vững và kết nối gia đạo hưng thịnh.'
  },
  {
    id: 46,
    name: 'Page of Cups (Tiểu Thư Cốc)',
    filename: 'Page-of-cups.webp',
    descPast: 'Quá khứ: Sự nhạy cảm nghệ thuật và tâm hồn bay bổng đã định hình nên tính cách dịu dàng của bạn.',
    descPresent: 'Hiện tại: Một thông điệp tình cảm ngọt ngào hoặc một ý tưởng nghệ thuật độc đáo đang nảy mầm.',
    descFuture: 'Tương lai: Trực giác rộng mở, bạn sẽ học được cách thấu cảm sâu sắc và đón nhận yêu thương dạt dào.'
  },
  {
    id: 47,
    name: 'Knight of Cups (Hiệp Sĩ Cốc)',
    filename: 'Knight-of-cups.webp',
    descPast: 'Quá khứ: Bạn từng theo đuổi lý tưởng lãng mạn như một giấc mơ đầy chất thơ, đôi lúc hơi mơ mộng.',
    descPresent: 'Hiện tại: Hãy đón nhận lời mời gọi từ trái tim, tiếp tục cống hiến sự lãng mạn nhân văn cho đời.',
    descFuture: 'Tương lai: Sứ giả mang tin vui và kết nối yêu thương sẽ mở ra những cánh cửa cơ hội thăng hoa.'
  },
  {
    id: 48,
    name: 'Queen of Cups (Nữ Hoàng Cốc)',
    filename: 'Queen-of-cups.webp',
    descPast: 'Quá khứ: Tấm lòng trắc ẩn, bao dung của bạn luôn là nguồn nước chữa lành cho những người xung quanh.',
    descPresent: 'Hiện tại: Hãy tin cậy vào trực giác siêu phàm của bản thân lúc này, thấu cảm sâu sắc đại cuộc.',
    descFuture: 'Tương lai: Trở thành biểu tượng của sự thông thái cảm xúc, lan tỏa lòng yêu thương xoa dịu nghịch cảnh.'
  },
  {
    id: 49,
    name: 'King of Cups (Vua Cốc)',
    filename: 'King-of-cups.webp',
    descPast: 'Quá khứ: Khả năng làm chủ cảm xúc, điềm tĩnh trước giông bão đã giúp bạn gầy dựng uy thế lớn.',
    descPresent: 'Hiện tại: Hãy giải quyết mọi xung đột bằng sự ôn hòa, điềm tĩnh lắng nghe đa chiều.',
    descFuture: 'Tương lai: Bạn sẽ đứng vững như ngọn núi giữa biển khơi, điều phối mọi cảm xúc đem lại sự bình an.'
  },

  // MINOR ARCANA - SWORDS (Kiếm) (50 - 63)
  {
    id: 50,
    name: 'Ace of Swords (Át Kiếm)',
    filename: 'Ace-of-swords.webp',
    descPast: 'Quá khứ: Sự thấu suốt đột phá đã phá tan màn sương mù mờ mịt cản lối bạn từ trước.',
    descPresent: 'Hiện tại: Sức mạnh của lý trí và sự thật khách quan đang ở đỉnh cao. Quyết đoán hành động ngay.',
    descFuture: 'Tương lai: Đạt tới thắng lợi vang dội nhờ tư duy logic sắc sảo và ý chí cắt đứt mọi vướng bận.'
  },
  {
    id: 51,
    name: 'Two of Swords (Hai Kiếm)',
    filename: '2-of-swords.webp',
    descPast: 'Quá khứ: Bạn từng rơi vào trạng thái tiến thoái lưỡng nan, nhắm mắt trốn tránh quyết định thực tế.',
    descPresent: 'Hiện tại: Hãy tháo băng bịt mắt, bình tâm nhìn thẳng vào sự thật để đưa ra lựa chọn dứt khoát.',
    descFuture: 'Tương lai: Sự cân bằng tinh thần tái lập sau khi bạn giải quyết dứt điểm các xung đột nội tâm.'
  },
  {
    id: 52,
    name: 'Three of Swords (Ba Kiếm)',
    filename: '3-of-swords.webp',
    descPast: 'Quá khứ: Cơn đau lòng, sự chia ly hay phản bội trong quá khứ đã để lại vết thương sâu sắc.',
    descPresent: 'Hiện tại: Hãy khóc để giải tỏa, chấp nhận thực tế đau thương để bắt đầu quá trình chữa lành.',
    descFuture: 'Tương lai: Bầu trời sau cơn mưa sẽ tạnh, bạn sẽ mạnh mẽ vượt bậc và thấu hiểu lẽ đời sâu sắc hơn.'
  },
  {
    id: 53,
    name: 'Four of Swords (Bốn Kiếm)',
    filename: '4-of-swords.webp',
    descPast: 'Quá khứ: Sự rút lui, nghỉ dưỡng sức kịp thời đã cứu rỗi tinh thần bạn khỏi sự kiệt quệ hoàn toàn.',
    descPresent: 'Present: Đây là thời khắc vàng để thiền định, ngủ đủ giấc và nạp lại năng lượng dự trữ.',
    descFuture: 'Tương lai: Bạn sẽ trở lại đấu trường cuộc sống với tinh thần minh mẫn nhất, sẵn sàng chinh phục thử thách.'
  },
  {
    id: 54,
    name: 'Five of Swords (Năm Kiếm)',
    filename: '5-of-swords.webp',
    descPast: 'Quá khứ: Bạn đã trải qua một trận cãi vã khốc liệt, thắng lợi về mặt lý lẽ nhưng rạn nứt tình cảm.',
    descPresent: 'Hiện tại: Hãy cân nhắc xem chiến thắng bằng mọi giá có thực sự đáng giá hơn sự bình yên đôi bên.',
    descFuture: 'Tương lai: Học được cách buông bỏ cái tôi ích kỷ, xây dựng những kết nối hài hòa, thiện chí hơn.'
  },
  {
    id: 55,
    name: 'Six of Swords (Sáu Kiếm)',
    filename: '6-of-swords.webp',
    descPast: 'Quá khứ: Quyết định dịch chuyển, rời xa vùng đất giông bão để tìm kiếm sự bình yên đã bắt đầu.',
    descPresent: 'Hiện tại: Bạn đang đi qua vùng nước lặng trôi, dù còn chút u buồn nhưng sóng gió đã ở lại phía sau.',
    descFuture: 'Tương lai: Cập bến bờ hạnh phúc mới, cuộc sống chuyển mình sang chương bình yên dịu mát.'
  },
  {
    id: 56,
    name: 'Seven of Swords (Bảy Kiếm)',
    filename: '7-of-swords.webp',
    descPast: 'Quá khứ: Sự hành động đơn độc, giữ bí mật hoặc mưu trí lách luật đã giúp bạn đạt mục tiêu ngắn hạn.',
    descPresent: 'Hiện tại: Hãy cảnh giác trước các hành vi mờ ám xung quanh và trung thực tuyệt đối với chính mình.',
    descFuture: 'Tương lai: Mưu trí và sự thận trọng tối đa sẽ giúp bạn tự bảo vệ thành quả trước những cạm bẫy ẩn giấu.'
  },
  {
    id: 57,
    name: 'Eight of Swords (Tám Kiếm)',
    filename: '8-of-swords.webp',
    descPast: 'Quá khứ: Cảm giác bị cô lập, bế tắc và trói buộc bởi dư luận đã đè nặng tâm trí bạn.',
    descPresent: 'Hiện tại: Hãy nhận ra rằng dây trói rất lỏng và rào kiếm luôn có lối thoát. Chỉ cần bạn mở mắt bước đi.',
    descFuture: 'Tương lai: Sự tự do tinh thần đích thực sau khi bạn tự đập tan những giới hạn do chính mình áp đặt.'
  },
  {
    id: 58,
    name: 'Nine of Swords (Chín Kiếm)',
    filename: '9-of-swords.webp',
    descPast: 'Quá khứ: Cơn lo âu, mất ngủ kinh niên hoặc nỗi sợ vô hình đã giày vò bạn trong đêm tối.',
    descPresent: 'Hiện tại: Nỗi sợ chỉ là sản phẩm tự tạo của trí tưởng tượng. Hãy bước ra ánh sáng để xua tan bóng tối.',
    descFuture: 'Tương lai: Đập tan mọi lo âu, tìm lại sự an nhiên tĩnh lặng sâu sắc trong tâm hồn.'
  },
  {
    id: 59,
    name: 'Ten of Swords (Mười Kiếm)',
    filename: '10-of-swords.webp',
    descPast: 'Quá khứ: Bạn từng chạm đáy của sự thất vọng, mệt mỏi cùng cực tưởng như không thể gượng dậy.',
    descPresent: 'Hiện tại: Hãy nằm yên hồi sức. Khi đã ở đáy vực, con đường duy nhất phía trước là đi lên.',
    descFuture: 'Tương lai: Bình minh rực rỡ của ngày mới sẽ lên, quét sạch mọi đau buồn mở ra sự tái sinh huy hoàng.'
  },
  {
    id: 60,
    name: 'Page of Swords (Tiểu Thư Kiếm)',
    filename: 'Page-of-swords.webp',
    descPast: 'Quá khứ: Óc quan sát nhạy bén và thói quen tích lũy thông tin đã chuẩn bị cho bạn nền tảng vững.',
    descPresent: 'Hiện tại: Hãy luôn tò mò, tiếp thu kiến thức mới và cẩn trọng phát ngôn trước đám đông.',
    descFuture: 'Tương lai: Bản lĩnh phân tích logic sắc sảo giúp bạn đi trước thời đại một bước vững vàng.'
  },
  {
    id: 61,
    name: 'Knight of Swords (Hiệp Sĩ Kiếm)',
    filename: 'Knight-of-swords.webp',
    descPast: 'Quá khứ: Bạn từng lao đi giải quyết vấn đề với tốc độ chớp nhoáng đầy quyết liệt và sắc bén.',
    descPresent: 'Hiện tại: Hãy tập trung năng lượng lý trí cao độ để tháo gỡ khó khăn, nhưng tránh vội vã cực đoan.',
    descFuture: 'Tương lai: Sự đột phá thành công rực rỡ nhờ tinh thần quyết chiến dũng cảm bằng trí tuệ sắc sảo.'
  },
  {
    id: 62,
    name: 'Queen of Swords (Nữ Hoàng Kiếm)',
    filename: 'Queen-of-swords.webp',
    descPast: 'Quá khứ: Trải qua nhiều thăng trầm sóng gió, bạn đã gầy dựng được bản lĩnh độc lập kiên cường.',
    descPresent: 'Hiện tại: Hãy dùng lý trí sắc bén loại bỏ các yếu tố độc hại xung quanh, thẳng thắn thiết lập giới hạn.',
    descFuture: 'Tương lai: Vị thế uy nghiêm của một người làm chủ số phận bằng sự thông tuệ và công bằng tuyệt đối.'
  },
  {
    id: 63,
    name: 'King of Swords (Vua Kiếm)',
    filename: 'King-of-swords.webp',
    descPast: 'Quá khứ: Việc tuân thủ luật lệ nghiêm ngặt và tư duy khách quan đã thiết lập nên uy tín vững chắc.',
    descPresent: 'Hiện tại: Hãy quyết định dựa trên luật pháp, công lý và sự thật tối thượng, gạt bỏ tình cảm cá nhân nhiễu loạn.',
    descFuture: 'Tương lai: Trở thành cố vấn tối cao, làm chủ các hệ thống lớn nhờ tư duy chiến lược đỉnh cao.'
  },

  // MINOR ARCANA - PENTACLES (Tiền/Xu) (64 - 77)
  {
    id: 64,
    name: 'Ace of Pentacles (Át Tiền)',
    filename: 'Ace-of-pentacles.webp',
    descPast: 'Quá khứ: Một hạt giống cơ hội tài chính quý giá đã được gieo trồng từ những nỗ lực thầm lặng.',
    descPresent: 'Hiện tại: Cơ hội nhận được tiền tài, công việc mới ổn định hoặc đầu tư vô cùng thuận lợi.',
    descFuture: 'Tương lai: Sự phát triển thịnh vượng bền vững, mang lại nền tảng vật chất vô cùng sung túc.'
  },
  {
    id: 65,
    name: 'Two of Pentacles (Hai Tiền)',
    filename: '2-of-pentacles.webp',
    descPast: 'Quá khứ: Bạn đã xoay xở khéo léo để cân bằng giữa dòng tiền, thời gian và sức khỏe cá nhân.',
    descPresent: 'Hiện tại: Hãy linh hoạt thích ứng với biến động cuộc sống, giữ vững nhịp điệu thăng bằng khôn ngoan.',
    descFuture: 'Tương lai: Đạt tới khả năng làm chủ cuộc chơi, kiểm soát tốt các dòng tiền đa mục tiêu.'
  },
  {
    id: 66,
    name: 'Three of Pentacles (Ba Tiền)',
    filename: '3-of-pentacles.webp',
    descPast: 'Quá khứ: Sự học hỏi cần mẫn và bước đầu xây dựng sự uy tín chuyên môn được đồng nghiệp đánh giá cao.',
    descPresent: 'Hiện tại: Thời điểm vàng để làm việc nhóm, kết hợp các tài năng xuất chúng để kiến tạo công trình lớn.',
    descFuture: 'Tương lai: Tay nghề của bạn sẽ đạt tới tầm chuyên gia thượng thừa, nhận được hợp đồng lớn xứng tầm.'
  },
  {
    id: 67,
    name: 'Four of Pentacles (Bốn Tiền)',
    filename: '4-of-pentacles.webp',
    descPast: 'Quá khứ: Nỗi sợ thiếu hụt hoặc tính tích lũy đã khiến bạn giữ tiền và các mối quan hệ rất chặt.',
    descPresent: 'Hiện tại: Hãy cởi mở chia sẻ bớt tài nguyên, dòng chảy vật chất cần lưu thông mới sinh sôi nảy nở.',
    descFuture: 'Tương lai: Đạt được sự an toàn tài chính vững chãi nhưng cần tránh để bản thân trở nên cô độc bảo thủ.'
  },
  {
    id: 68,
    name: 'Five of Pentacles (Năm Tiền)',
    filename: '5-of-pentacles.webp',
    descPast: 'Quá khứ: Giai đoạn khó khăn vật chất hoặc cảm giác bị bỏ rơi ngoài giông bão đã thử thách ý chí bạn.',
    descPresent: 'Hiện tại: Hãy gõ cửa những nơi có ánh sáng ấm áp để tìm sự giúp đỡ. Bạn không hề đơn độc lúc này.',
    descFuture: 'Tương lai: Vượt qua nghịch cảnh nghèo khó, bạn sẽ xây dựng được ý chí sắt đá kiên cường trân quý vật chất.'
  },
  {
    id: 69,
    name: 'Six of Pentacles (Sáu Tiền)',
    filename: '6-of-pentacles.webp',
    descPast: 'Quá khứ: Bạn từng nhận được sự tương trợ kịp thời hoặc hào phóng giúp đỡ kẻ yếu thế hơn mình.',
    descPresent: 'Hiện tại: Hãy cho đi rộng lượng và đón nhận công bằng. Dòng chảy tài lộc đang luân chuyển rất đẹp.',
    descFuture: 'Tương lai: Nhận được những nguồn tài trợ quý giá, sự giúp đỡ đắc lực từ quý nhân giúp bạn thăng tiến.'
  },
  {
    id: 70,
    name: 'Seven of Pentacles (Bảy Tiền)',
    filename: '7-of-pentacles.webp',
    descPast: 'Quá khứ: Bạn đã bỏ nhiều công sức vun trồng khu vườn sự nghiệp và kiên nhẫn chờ đợi kết quả.',
    descPresent: 'Hiện tại: Hãy đứng lại đánh giá tiến trình phát triển, kiên nhẫn tích lũy kinh nghiệm chuẩn bị gặt hái.',
    descFuture: 'Tương lai: Vụ mùa bội thu xứng đáng tuyệt đối với công sức cày cuốc thầm lặng bấy lâu của bạn.'
  },
  {
    id: 71,
    name: 'Eight of Pentacles (Tám Tiền)',
    filename: '8-of-pentacles.webp',
    descPast: 'Quá khứ: Sự cần mẫn tỉ mỉ mài giũa từng đồng xu kỹ năng đã tạo nên tay nghề vững chắc cho bạn.',
    descPresent: 'Hiện tại: Hãy tập trung tối đa vào chuyên môn, hoàn thiện từng chi tiết nhỏ với lòng đam mê cao nhất.',
    descFuture: 'Tương lai: Trở thành bậc thầy trong lĩnh vực của mình, gặt hái sự hưng thịnh vững chắc từ thực lực.'
  },
  {
    id: 72,
    name: 'Nine of Pentacles (Chín Tiền)',
    filename: '9-of-pentacles.webp',
    descPast: 'Quá khứ: Bạn đã nỗ lực gầy dựng cuộc sống tự do, độc lập tài chính vô cùng đáng ngưỡng mộ.',
    descPresent: 'Hiện tại: Hãy thư giãn nghỉ ngơi trong khu vườn trù phú của mình, tận hưởng thành quả thịnh vượng.',
    descFuture: 'Tương lai: Đạt tới đỉnh cao tự chủ, cuộc sống ngập tràn sự thanh lịch, quý phái và sung túc trọn vẹn.'
  },
  {
    id: 73,
    name: 'Ten of Pentacles (Mười Tiền)',
    filename: '10-of-pentacles.webp',
    descPast: 'Quá khứ: Gia sản lâu dài và nền tảng giáo dục gia đình vững chãi đã tạo bệ phóng tốt đẹp cho bạn.',
    descPresent: 'Hiện tại: Sự hưng thịnh gia đạo, thừa kế hoặc đạt được tài sản lâu dài vững chắc.',
    descFuture: 'Tương lai: Sự thịnh vượng truyền đời bền bỉ, để lại những di sản vật chất và tinh thần đồ sộ.'
  },
  {
    id: 74,
    name: 'Page of Pentacles (Tiểu Thư Tiền)',
    filename: 'Page-of-pentacles.webp',
    descPast: 'Quá khứ: Sự kiên trì và ham học hỏi kỹ năng thực tế đã hình thành thói quen cẩn trọng của bạn.',
    descPresent: 'Hiện tại: Một cơ hội học tập thực tiễn hoặc công việc bán thời gian ổn định đang xuất hiện rộng mở.',
    descFuture: 'Tương lai: Từng bước xây dựng sự nghiệp thành công từ những viên gạch vững chãi đầu tiên.'
  },
  {
    id: 75,
    name: 'Knight of Pentacles (Hiệp Sĩ Tiền)',
    filename: 'Knight-of-pentacles.webp',
    descPast: 'Quá khứ: Sự lầm lũi tiến về phía trước đầy uy tín và đáng tin cậy đã giúp bạn tích lũy tài lộc đều đặn.',
    descPresent: 'Hiện tại: Hãy kiên nhẫn tiến hành kế hoạch từng bước một, chậm nhưng chắc chắn tuyệt đối.',
    descFuture: 'Tương lai: Đạt được thắng lợi bền bỉ dài lâu nhờ sự cần mẫn trung thành vô song của bạn.'
  },
  {
    id: 76,
    name: 'Queen of Pentacles (Nữ Hoàng Tiền)',
    filename: 'Queen-of-pentacles.webp',
    descPast: 'Quá khứ: Khả năng thu xếp cuộc sống thực tế, chăm sóc chu đáo gia đình đã tạo nên bến đỗ bình yên.',
    descPresent: 'Hiện tại: Hãy quản trị nguồn lực khôn ngoan, tạo ra môi trường sống trù phú ấm áp đầy yêu thương.',
    descFuture: 'Tương lai: Sự sung túc viên mãn, có cuộc sống gia đình bình yên vững chãi ngập tràn của cải.'
  },
  {
    id: 77,
    name: 'King of Pentacles (Vua Tiền)',
    filename: 'King-of-pentacles.webp',
    descPast: 'Quá khứ: Bản lĩnh thương trường và đầu óc nhạy bén đã xây dựng nên cơ đồ tài chính vững mạnh nhất.',
    descPresent: 'Hiện tại: Hãy bảo vệ dòng tiền đầu tư, làm chủ vật chất và ban phát tài lộc công bằng cho cấp dưới.',
    descFuture: 'Tương lai: Trở thành ông chủ thịnh vượng tối cao, thống trị các hệ thống tài chính bền vững vững như bàn thạch.'
  }
];
