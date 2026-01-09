-- Codility SQL Solution: Znajdź użytkowników z najdłuższym ciągiem kolejnych dni używania aplikacji

-- Rozwiązanie 1: Znajdź użytkowników z maksymalną liczbą kolejnych dni dla każdej aplikacji
WITH daily_usage AS (
    -- Dodaj numer wiersza dla każdego użytkownika i aplikacji, posortowane po dacie
    SELECT 
        u.user_id,
        a.app_name,
        u.usage_date,
        ROW_NUMBER() OVER (PARTITION BY u.user_id, u.app_id ORDER BY u.usage_date) as rn
    FROM app_usage u
    JOIN app_info a ON u.app_id = a.app_id
),
date_groups AS (
    -- Oblicz różnicę między datą a numerem wiersza - to grupuje kolejne dni
    SELECT 
        user_id,
        app_name,
        usage_date,
        DATE(usage_date) - INTERVAL '1 day' * rn as date_group
    FROM daily_usage
),
streak_counts AS (
    -- Zlicz długość każdego ciągu dla użytkownika i aplikacji
    SELECT 
        user_id,
        app_name,
        date_group,
        COUNT(*) as streak_length,
        MIN(usage_date) as start_date,
        MAX(usage_date) as end_date
    FROM date_groups
    GROUP BY user_id, app_name, date_group
),
max_streaks AS (
    -- Znajdź maksymalny ciąg dla każdego użytkownika i aplikacji
    SELECT 
        user_id,
        app_name,
        MAX(streak_length) as max_consecutive_days
    FROM streak_counts
    GROUP BY user_id, app_name
)
-- Wynik końcowy
SELECT 
    user_id,
    app_name,
    max_consecutive_days as date_no
FROM max_streaks
ORDER BY user_id, app_name;


-- ====================================================================
-- ALTERNATYWNE ROZWIĄZANIE (dla PostgreSQL) - używa LAG do wykrywania przerw
-- ====================================================================

WITH usage_with_prev AS (
    SELECT 
        u.user_id,
        a.app_name,
        u.usage_date,
        LAG(u.usage_date) OVER (PARTITION BY u.user_id, u.app_id ORDER BY u.usage_date) as prev_date
    FROM app_usage u
    JOIN app_info a ON u.app_id = a.app_id
),
streak_markers AS (
    -- Oznacz początek nowego ciągu (gdy różnica > 1 dzień lub to pierwszy rekord)
    SELECT 
        user_id,
        app_name,
        usage_date,
        CASE 
            WHEN prev_date IS NULL THEN 1
            WHEN usage_date - prev_date > INTERVAL '1 day' THEN 1
            ELSE 0
        END as is_new_streak
    FROM usage_with_prev
),
streak_groups AS (
    -- Przypisz numer grupy do każdego ciągu
    SELECT 
        user_id,
        app_name,
        usage_date,
        SUM(is_new_streak) OVER (PARTITION BY user_id, app_name ORDER BY usage_date) as streak_id
    FROM streak_markers
),
streak_lengths AS (
    -- Oblicz długość każdego ciągu
    SELECT 
        user_id,
        app_name,
        streak_id,
        COUNT(*) as consecutive_days
    FROM streak_groups
    GROUP BY user_id, app_name, streak_id
)
-- Znajdź maksymalny ciąg dla każdego użytkownika i aplikacji
SELECT 
    user_id,
    app_name,
    MAX(consecutive_days) as date_no
FROM streak_lengths
GROUP BY user_id, app_name
ORDER BY user_id, app_name;


-- ====================================================================
-- PRZYKŁADOWE WYNIKI:
-- ====================================================================
-- user_id | app_name     | date_no
-- --------|--------------|--------
--    1    | Netflix      |   4     (2024-06-10 do 2024-06-13)
--    1    | PrimeVideos  |   1     (2024-06-13)
--    1    | Disney+      |   2     (2024-06-10 do 2024-06-11)
--    2    | PrimeVideos  |   1     (2024-06-11)
--    3    | Netflix      |   2     (2024-06-12 do 2024-06-13)
--    3    | PrimeVideos  |   1     (2024-06-13)
--    3    | Disney+      |   1     (2024-06-13)


-- ====================================================================
-- TESTY WERYFIKACYJNE
-- ====================================================================

-- Test 1: Pokaż wszystkie dane wejściowe
SELECT 
    u.user_id,
    a.app_name,
    u.usage_date
FROM app_usage u
JOIN app_info a ON u.app_id = a.app_id
ORDER BY u.user_id, a.app_name, u.usage_date;

-- Test 2: Sprawdź ciągi dla user_id = 1
WITH daily_usage AS (
    SELECT 
        u.user_id,
        a.app_name,
        u.usage_date,
        ROW_NUMBER() OVER (PARTITION BY u.user_id, u.app_id ORDER BY u.usage_date) as rn
    FROM app_usage u
    JOIN app_info a ON u.app_id = a.app_id
    WHERE u.user_id = 1
)
SELECT 
    user_id,
    app_name,
    usage_date,
    DATE(usage_date) - INTERVAL '1 day' * rn as date_group
FROM daily_usage
ORDER BY user_id, app_name, usage_date;
