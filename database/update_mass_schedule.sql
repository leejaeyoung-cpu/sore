-- ========================================
-- 미사 시간표 업데이트
-- ========================================
-- 실행 방법:
-- Supabase Dashboard → SQL Editor → 복사 후 실행
--

-- 기존 미사 시간표 모두 삭제
DELETE FROM mass_schedules;

-- 새로운 미사 시간표 입력
-- 0=일요일, 1=월요일, 2=화요일, 3=수요일, 4=목요일, 5=금요일, 6=토요일

-- 월요일: 오전 10시
INSERT INTO mass_schedules (day_of_week, time, type, description) 
VALUES (1, '10:00', 'weekday', '평일 미사');

-- 화요일: 오후 7시
INSERT INTO mass_schedules (day_of_week, time, type, description) 
VALUES (2, '19:00', 'weekday', '평일 미사');

-- 수요일: 오전 10시
INSERT INTO mass_schedules (day_of_week, time, type, description) 
VALUES (3, '10:00', 'weekday', '평일 미사');

-- 목요일: 오후 7시
INSERT INTO mass_schedules (day_of_week, time, type, description) 
VALUES (4, '19:00', 'weekday', '평일 미사');

-- 금요일: 오전 10시
INSERT INTO mass_schedules (day_of_week, time, type, description) 
VALUES (5, '10:00', 'weekday', '평일 미사');

-- 토요일: 오후 4시 (어린이)
INSERT INTO mass_schedules (day_of_week, time, type, description) 
VALUES (6, '16:00', 'special', '어린이 미사');

-- 토요일: 오후 6시 (중고등부/특전미사)
INSERT INTO mass_schedules (day_of_week, time, type, description) 
VALUES (6, '18:00', 'special', '중고등부/특전미사');

-- 주일: 오전 9시
INSERT INTO mass_schedules (day_of_week, time, type, description) 
VALUES (0, '09:00', 'regular', '주일 미사');

-- 주일: 오전 11시 (교중)
INSERT INTO mass_schedules (day_of_week, time, type, description) 
VALUES (0, '11:00', 'regular', '교중 미사');

-- 주일: 오후 6시 (청년)
INSERT INTO mass_schedules (day_of_week, time, type, description) 
VALUES (0, '18:00', 'special', '청년 미사');

-- 완료!
-- 브라우저를 새로고침하면 업데이트된 미사 시간표를 볼 수 있습니다.
