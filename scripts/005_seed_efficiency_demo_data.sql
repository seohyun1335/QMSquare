-- 데모용 작업 시간 로그 데이터 (최근 30일)
INSERT INTO work_time_logs (user_id, work_mode, task_type, task_title, start_time, end_time, duration_minutes, status, event_log)
SELECT 
  auth.uid(),
  CASE WHEN random() < 0.5 THEN 'manual' ELSE 'qmsquare' END,
  (ARRAY['document_creation', 'review', 'approval'])[floor(random() * 3 + 1)],
  'SOP-' || lpad((random() * 999)::int::text, 3, '0') || ' 문서 작성',
  NOW() - (random() * 30 || ' days')::interval,
  NOW() - (random() * 30 || ' days')::interval + 
    CASE WHEN random() < 0.5 
      THEN (60 + random() * 120)::int || ' minutes'  -- 수기: 60-180분
      ELSE (20 + random() * 40)::int || ' minutes'   -- QMSquare: 20-60분
    END::interval,
  NULL, -- 트리거가 자동 계산
  'completed',
  '[]'::jsonb
FROM generate_series(1, 50);

-- 데모용 품질 체크 데이터
INSERT INTO quality_checks (user_id, document_id, check_mode, total_items, passed_items, failed_items, quality_score, defects, checklist, audit_ready_score)
SELECT 
  auth.uid(),
  (SELECT id FROM documents ORDER BY random() LIMIT 1),
  CASE WHEN random() < 0.5 THEN 'manual' ELSE 'qmsquare' END,
  20,
  CASE WHEN random() < 0.5 
    THEN 12 + floor(random() * 4)::int  -- 수기: 12-15 통과
    ELSE 17 + floor(random() * 3)::int  -- QMSquare: 17-19 통과
  END,
  CASE WHEN random() < 0.5 
    THEN 5 + floor(random() * 4)::int   -- 수기: 5-8 실패
    ELSE 1 + floor(random() * 3)::int   -- QMSquare: 1-3 실패
  END,
  CASE WHEN random() < 0.5 
    THEN 60 + floor(random() * 20)::int  -- 수기: 60-79점
    ELSE 85 + floor(random() * 15)::int  -- QMSquare: 85-99점
  END,
  '[
    {"item": "필수 서명 누락", "severity": "high"},
    {"item": "날짜 형식 불일치", "severity": "medium"},
    {"item": "버전 번호 오류", "severity": "low"}
  ]'::jsonb,
  '[
    {"id": 1, "label": "제목 및 문서번호 기재", "passed": true},
    {"id": 2, "label": "작성자/검토자/승인자 서명", "passed": true},
    {"id": 3, "label": "개정 이력 기록", "passed": false}
  ]'::jsonb,
  CASE WHEN random() < 0.5 
    THEN 55 + floor(random() * 25)::int  -- 수기: 55-79
    ELSE 80 + floor(random() * 20)::int  -- QMSquare: 80-99
  END
FROM generate_series(1, 30);

-- 데모용 효율성 비교 스냅샷
INSERT INTO efficiency_snapshots (user_id, snapshot_name, document_type, manual_avg_time, qmsquare_avg_time, manual_defect_count, qmsquare_defect_count, manual_rework_rate, qmsquare_rework_rate, manual_approval_days, qmsquare_approval_days, roi_data)
VALUES 
  (auth.uid(), 'SOP 작성 효율성', 'SOP', 120, 35, 8, 2, 35, 8, 7, 2, '{"cost_saving_per_month": 3200000, "time_saving_hours": 140}'::jsonb),
  (auth.uid(), '품질 기록서 작성', 'Quality Record', 45, 15, 5, 1, 25, 5, 3, 1, '{"cost_saving_per_month": 1500000, "time_saving_hours": 60}'::jsonb),
  (auth.uid(), '절차서 작성', 'Procedure', 90, 28, 6, 2, 30, 10, 5, 2, '{"cost_saving_per_month": 2400000, "time_saving_hours": 100}'::jsonb),
  (auth.uid(), '시험성적서 작성', 'Test Report', 60, 20, 4, 1, 20, 7, 4, 1, '{"cost_saving_per_month": 1800000, "time_saving_hours": 75}'::jsonb);
