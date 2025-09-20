-- 기본 코트 생성 및 설정

-- 1. 기본 코트가 이미 존재하는지 확인하고 삽입
INSERT INTO courts (id, name, location, surface, "is_indoor", "is_active")
VALUES (
    '00000000-0000-0000-0000-000000000001',
    '기본 코트',
    '기본 위치',
    'hard',
    false,
    true
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    location = EXCLUDED.location,
    surface = EXCLUDED.surface,
    "is_indoor" = EXCLUDED."is_indoor",
    "is_active" = EXCLUDED."is_active";

-- 2. 완료 메시지
SELECT '기본 코트가 성공적으로 생성/업데이트되었습니다!' as message;
