-- AI 문서 검토 결과를 위한 컬럼 추가
ALTER TABLE quality_checks
ADD COLUMN IF NOT EXISTS document_type TEXT,
ADD COLUMN IF NOT EXISTS estimated_rework_minutes INTEGER,
ADD COLUMN IF NOT EXISTS audit_status TEXT,
ADD COLUMN IF NOT EXISTS roi_metrics JSONB;

-- 코멘트 추가
COMMENT ON COLUMN quality_checks.document_type IS '문서 유형 (SOP, WI, QM 등)';
COMMENT ON COLUMN quality_checks.estimated_rework_minutes IS '결함 수정 예상 소요 시간(분)';
COMMENT ON COLUMN quality_checks.audit_status IS '심사 준비 상태 (Ready, Needs Update, Missing Evidence)';
COMMENT ON COLUMN quality_checks.roi_metrics IS 'ROI 측정 지표 (수기/QMSquare 비교 시간, 리스크 감소 포인트)';
