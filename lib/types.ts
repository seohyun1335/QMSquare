export interface Document {
  id: string
  title: string
  document_type: "절차서(SOP)" | "작업지침서(WI)" | "기록서(Record)" | "변경관리(Change)"
  status: "초안" | "검토중" | "승인완료"
  content?: string
  description?: string
  version?: string
  file_name?: string
  file_size?: number | null
  file_url?: string
  file_id?: string
  created_at: string
  updated_at: string
}

export interface QualityRecord {
  id: string
  title: string
  record_type: "CAPA" | "부적합" | "내부심사" | "교육기록" | "변경관리"
  status: "진행중" | "완료"
  description?: string
  created_at: string
  updated_at: string
}

export interface WorkTimeLog {
  id: string
  work_mode: "manual" | "qmsquare"
  task_type: string
  task_title: string
  start_time: string
  end_time?: string
  status?: "in_progress" | "completed"
  event_log: WorkEvent[]
  created_at: string
}

export interface WorkEvent {
  timestamp: string
  type: string
  description?: string
  elapsed_seconds?: number
}

export interface QualityCheck {
  id: string
  check_mode: "manual" | "qmsquare"
  total_items: number
  passed_items: number
  failed_items: number
  quality_score: number
  audit_ready_score: number
  defects: Array<{
    item: string
    severity: "high" | "medium" | "low"
  }>
  checklist: Array<{
    id: number
    label: string
    passed: boolean
    weight: number
  }>
  created_at: string
}

export interface EfficiencySnapshot {
  id: string
  manual_avg_time: number
  qmsquare_avg_time: number
  manual_defects: number
  qmsquare_defects: number
  time_saved_percent: number
  defect_reduction_percent: number
  created_at: string
}

export interface FileAttachment {
  id: string
  quality_record_id: string
  file_name: string
  file_size: number
  file_type: string
  uploaded_at: string
}

export interface AnalysisResult {
  id: string
  quality_record_id: string
  file_id: string
  quality_score: number
  audit_ready: "Ready" | "Needs Update" | "Missing Evidence"
  summary: string
  findings: {
    missing: Array<{ issue: string; suggestion: string }>
    ambiguous: Array<{ issue: string; suggestion: string }>
    inconsistent: Array<{ issue: string; suggestion: string }>
    inaccurate: Array<{ issue: string; suggestion: string }>
  }
  estimated_rework_minutes: number
  roi_metrics: {
    manual_time_estimate_minutes: number
    qmsquare_time_estimate_minutes: number
    time_saved_minutes: number
    risk_reduction_notes: string[]
  }
  created_at: string
}

// 기존 타입과의 호환성을 위한 유틸리티 타입
export interface AmbiguousPhrase {
  phrase: string
  context: string
  line_number?: number
}
