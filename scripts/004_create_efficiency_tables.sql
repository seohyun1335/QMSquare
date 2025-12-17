-- 작업 시간 측정 로그 테이블
CREATE TABLE IF NOT EXISTS work_time_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  work_mode TEXT NOT NULL CHECK (work_mode IN ('manual', 'qmsquare')), -- 수기 vs QMSquare
  task_type TEXT NOT NULL, -- 'document_creation', 'review', 'approval', etc.
  task_title TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER, -- 자동 계산
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'paused')),
  event_log JSONB DEFAULT '[]'::jsonb, -- 작업 중 이벤트 기록
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 문서 품질 체크 결과 테이블
CREATE TABLE IF NOT EXISTS quality_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  check_mode TEXT NOT NULL CHECK (check_mode IN ('manual', 'qmsquare')),
  total_items INTEGER NOT NULL DEFAULT 0,
  passed_items INTEGER NOT NULL DEFAULT 0,
  failed_items INTEGER NOT NULL DEFAULT 0,
  quality_score INTEGER NOT NULL DEFAULT 0, -- 0~100
  defects JSONB DEFAULT '[]'::jsonb, -- 결함 목록
  checklist JSONB NOT NULL, -- 체크리스트 항목
  audit_ready_score INTEGER DEFAULT 0, -- 0~100
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 효율성 비교 스냅샷 테이블 (A/B 비교용)
CREATE TABLE IF NOT EXISTS efficiency_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  manual_avg_time INTEGER, -- 수기 평균 시간(분)
  qmsquare_avg_time INTEGER, -- QMSquare 평균 시간(분)
  manual_defect_count INTEGER, -- 수기 결함 수
  qmsquare_defect_count INTEGER, -- QMSquare 결함 수
  manual_rework_rate INTEGER, -- 수기 재작업률(%)
  qmsquare_rework_rate INTEGER, -- QMSquare 재작업률(%)
  manual_approval_days INTEGER, -- 수기 승인 소요일
  qmsquare_approval_days INTEGER, -- QMSquare 승인 소요일
  roi_data JSONB, -- 추가 ROI 데이터
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security 설정
ALTER TABLE work_time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE efficiency_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS 정책: work_time_logs
CREATE POLICY "Users can view their own work logs"
  ON work_time_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own work logs"
  ON work_time_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own work logs"
  ON work_time_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own work logs"
  ON work_time_logs FOR DELETE
  USING (auth.uid() = user_id);

-- RLS 정책: quality_checks
CREATE POLICY "Users can view their own quality checks"
  ON quality_checks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quality checks"
  ON quality_checks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quality checks"
  ON quality_checks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quality checks"
  ON quality_checks FOR DELETE
  USING (auth.uid() = user_id);

-- RLS 정책: efficiency_snapshots
CREATE POLICY "Users can view their own efficiency snapshots"
  ON efficiency_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own efficiency snapshots"
  ON efficiency_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own efficiency snapshots"
  ON efficiency_snapshots FOR DELETE
  USING (auth.uid() = user_id);

-- 인덱스 생성
CREATE INDEX idx_work_time_logs_user_id ON work_time_logs(user_id);
CREATE INDEX idx_work_time_logs_document_id ON work_time_logs(document_id);
CREATE INDEX idx_quality_checks_user_id ON quality_checks(user_id);
CREATE INDEX idx_quality_checks_document_id ON quality_checks(document_id);
CREATE INDEX idx_efficiency_snapshots_user_id ON efficiency_snapshots(user_id);

-- 자동으로 duration_minutes 계산하는 트리거
CREATE OR REPLACE FUNCTION calculate_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
    NEW.duration_minutes := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER work_time_logs_calculate_duration
  BEFORE INSERT OR UPDATE ON work_time_logs
  FOR EACH ROW
  EXECUTE FUNCTION calculate_duration();
