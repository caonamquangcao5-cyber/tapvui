export const MOODS = [
  { key: 'chay', label: 'Hôm nay cháy', emoji: '🔥', message: 'Tới rồi thì cháy hết mình nào!' },
  { key: 'luoi', label: 'Hơi lười nhưng vẫn tới', emoji: '😴', message: 'Đã tới phòng gym là thắng 50% rồi. 50% còn lại để PT xử lý.' },
  { key: 'cuu', label: 'Cứu em PT ơi', emoji: '🆘', message: 'Chế độ sinh tồn đã bật. PT vui lòng không tiêu diệt học viên.' },
  { key: 'nhe', label: 'Tập nhẹ thôi nha', emoji: '🍃', message: 'Tập nhẹ hay tập nặng, quan trọng là không bỏ cuộc.' },
  { key: 'chien', label: 'Nay em muốn hóa chiến binh', emoji: '⚔️', message: 'Chiến binh đã sẵn sàng. PT hãy đưa ra thử thách!' },
  { key: 'sot', label: 'Nay chỉ muốn sống sót', emoji: '🛡️', message: 'Sống sót qua buổi tập hôm nay là thắng!' },
]

export const POST_FEELINGS = [
  { key: 'tu_hao', label: 'Tự hào', emoji: '🥰' },
  { key: 'met_vui', label: 'Mệt nhưng vui', emoji: '😊' },
  { key: 'xiu', label: 'Muốn xỉu nhẹ', emoji: '😵' },
  { key: 'ghet_pt', label: 'Ghét PT 5 phút', emoji: '😤' },
  { key: 'quay_lai', label: 'Mai vẫn quay lại', emoji: '💪' },
  { key: 'phan_doi', label: 'Cơ thể phản đối nhưng tinh thần đồng ý', emoji: '🤣' },
]

export const POST_WORKOUT_LABELS = [
  { key: 'de', label: 'Dễ hơn tưởng tượng', emoji: '😎' },
  { key: 'kho', label: 'Khó nhưng làm được', emoji: '😤' },
  { key: 'ac_tam', label: 'PT ác nhưng có tâm', emoji: '😈' },
  { key: 'tien_bo', label: 'Tôi đã tiến bộ', emoji: '📈' },
  { key: 'ngu', label: 'Tôi cần ngủ', emoji: '🛌' },
]

export const PT_REACTIONS = [
  { key: 'chay', label: 'Quá cháy', emoji: '🔥' },
  { key: 'tot', label: 'Tốt hơn hôm qua', emoji: '👍' },
  { key: 'luoi', label: 'Nay hơi lười nha', emoji: '😏' },
  { key: 'tu_hao', label: 'Tự hào đó', emoji: '🥹' },
  { key: 'dau', label: 'Mai đau chân là bình thường', emoji: '🦵' },
  { key: 'ngac_nhien', label: 'Không ngờ làm được luôn', emoji: '😲' },
  { key: 'thuong', label: 'Cần thưởng một ly nước', emoji: '🥤' },
  { key: 'chung_minh', label: 'PT đã chứng kiến sự cố gắng', emoji: '🙌' },
]

export const BADGES = [
  { key: 'first_workout', name: 'Bước đầu tiên', emoji: '🎯', desc: 'Hoàn thành buổi tập đầu tiên' },
  { key: 'survivor_leg', name: 'Người sống sót qua Leg Day', emoji: '🦵', desc: 'Sống sót qua ngày chân' },
  { key: 'streak_3', name: 'Mới khởi động', emoji: '🌱', desc: 'Tập 3 buổi liên tiếp' },
  { key: 'streak_7', name: 'Đã vào guồng', emoji: '⚙️', desc: 'Tập 7 buổi liên tiếp' },
  { key: 'streak_15', name: 'Không dễ bị dụ nghỉ', emoji: '🛡️', desc: 'Tập 15 buổi liên tiếp' },
  { key: 'streak_30', name: 'Huyền thoại phòng tập', emoji: '👑', desc: 'Tập 30 buổi liên tiếp' },
  { key: 'no_quit', name: 'Ông hoàng Không Bỏ Cuộc', emoji: '💪', desc: 'Hoàn thành 10 buổi không bỏ cuộc' },
  { key: 'energy', name: 'Cục pin năng lượng', emoji: '🔋', desc: 'Check-in với mood "cháy" 5 lần' },
  { key: 'punctual', name: 'Trùm đi tập đúng giờ', emoji: '⏰', desc: 'Đi tập đúng giờ 5 lần' },
  { key: 'plank', name: 'Plank tới khi cuộc đời nở hoa', emoji: '🌸', desc: 'Hoàn thành bài plank xuất sắc' },
  { key: 'cardio_queen', name: 'Nữ hoàng Cardio', emoji: '👸', desc: 'Hoàn thành 5 buổi cardio' },
  { key: 'squat_master', name: 'Chiến thần Squat', emoji: '⚡', desc: 'Hoàn thành xuất sắc bài squat' },
  { key: 'still_smiling', name: 'Tập xong vẫn còn cười', emoji: '😄', desc: 'Check-in với mood vui 10 lần' },
  { key: 'no_tears', name: 'Tạ không khóc, người khóc', emoji: '😂', desc: 'Hoàn thành buổi tập khó nhất' },
]

export const POINT_RULES = {
  checkin: 10,
  complete_task: 5,
  complete_all: 20,
  no_quit: 15,
  good_mood: 10,
  streak_bonus: 50,
}
