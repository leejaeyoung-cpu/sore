-- ========================================
-- 일요일 미사 시간 변경
-- ========================================
-- Supabase SQL Editor에서 실행하세요
--

-- 기존 일요일 미사 시간 삭제
DELETE FROM mass_schedules 
WHERE day_of_week = '일요일';

-- 새로운 일요일 미사 시간 추가
INSERT INTO mass_schedules (day_of_week, time, type) VALUES
('일요일', '09:00', '주일미사'),
('일요일', '11:00', '주일미사'),
('일요일', '18:00', '주일미사');

-- 확인
SELECT * FROM mass_schedules 
WHERE day_of_week = '일요일'
ORDER BY time;

-- 완료!
-- 일요일: 오전 9:00, 11:00, 오후 6:00
