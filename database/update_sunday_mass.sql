-- ========================================
-- 일요일 미사 시간 상세 정보 추가
-- ========================================
-- Supabase SQL Editor에서 실행하세요
--

-- 기존 일요일 미사 시간 삭제
DELETE FROM mass_schedules 
WHERE day_of_week = '일요일';

-- 새로운 일요일 미사 시간 추가 (설명 포함)
INSERT INTO mass_schedules (day_of_week, time, type) VALUES
('일요일', '09:00', '주일미사'),
('일요일', '11:00', '주일미사(교중)'),
('일요일', '18:00', '주일미사(청년)');

-- 확인
SELECT * FROM mass_schedules 
WHERE day_of_week = '일요일'
ORDER BY time;

-- 완료!
