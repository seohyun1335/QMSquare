import type {
  Document,
  QualityRecord,
  WorkTimeLog,
  QualityCheck,
  EfficiencySnapshot,
  FileAttachment,
  AnalysisResult,
} from "./types"

const KEYS = {
  DOCUMENTS: "qmsquare_documents",
  QUALITY_RECORDS: "qmsquare_quality_records",
  WORK_TIME_LOGS: "qmsquare_work_time_logs",
  QUALITY_CHECKS: "qmsquare_quality_checks",
  EFFICIENCY_SNAPSHOTS: "qmsquare_efficiency_snapshots",
  INITIALIZED: "qmsquare_initialized",
  ATTACHMENTS: "qmsquare_attachments",
  ANALYSIS: "qmsquare_analysis",
}

// Helper functions
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function getFromStorage<T>(key: string): T[] {
  if (typeof window === "undefined") return []

  try {
    const data = localStorage.getItem(key)
    if (!data) return []

    const parsed = JSON.parse(data)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error(`[v0] Failed to parse localStorage key "${key}":`, error)
    // 손상된 데이터 제거
    try {
      localStorage.removeItem(key)
    } catch (e) {
      console.error("[v0] Failed to remove corrupted data:", e)
    }
    return []
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`[v0] Failed to save to localStorage key "${key}":`, error)
    // Quota 초과 등의 경우 경고만 출력
  }
}

// Initialize demo data
export function initializeDemoData(): void {
  if (typeof window === "undefined") return

  try {
    const initialized = localStorage.getItem(KEYS.INITIALIZED)
    if (initialized) return

    // Demo documents
    const demoDocuments: Document[] = [
      {
        id: generateId(),
        title: "제조 공정 표준 작업절차서",
        document_type: "절차서(SOP)",
        status: "승인완료",
        content: "목적, 적용범위, 책임과 권한, 절차",
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: generateId(),
        title: "설계 검증 프로토콜",
        document_type: "기록서(Record)",
        status: "검토중",
        content: "시험 항목, 합격 기준, 결과 기록",
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]
    saveToStorage(KEYS.DOCUMENTS, demoDocuments)

    // Demo quality records
    const demoQualityRecords: QualityRecord[] = [
      {
        id: generateId(),
        title: "원자재 입고 부적합 보고서",
        record_type: "부적합",
        status: "완료",
        description: "공급업체 A사 입고 원자재 규격 미달",
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: generateId(),
        title: "ISO 13485 내부심사 결과",
        record_type: "내부심사",
        status: "진행중",
        description: "2024년 1분기 내부심사 실시",
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]
    saveToStorage(KEYS.QUALITY_RECORDS, demoQualityRecords)

    // Demo work time logs
    const demoWorkLogs: WorkTimeLog[] = [
      {
        id: generateId(),
        work_mode: "manual",
        task_type: "document_creation",
        task_title: "제조공정 SOP 작성",
        start_time: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 120 * 60 * 1000).toISOString(),
        status: "completed",
        event_log: [
          { timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), type: "start" },
          {
            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 120 * 60 * 1000).toISOString(),
            type: "stop",
            elapsed_seconds: 7200,
          },
        ],
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: generateId(),
        work_mode: "qmsquare",
        task_type: "document_creation",
        task_title: "제조공정 SOP 작성",
        start_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 35 * 60 * 1000).toISOString(),
        status: "completed",
        event_log: [
          { timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), type: "start" },
          {
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 35 * 60 * 1000).toISOString(),
            type: "stop",
            elapsed_seconds: 2100,
          },
        ],
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]
    saveToStorage(KEYS.WORK_TIME_LOGS, demoWorkLogs)

    // Demo quality checks
    const demoQualityChecks: QualityCheck[] = [
      {
        id: generateId(),
        check_mode: "manual",
        total_items: 20,
        passed_items: 11,
        failed_items: 9,
        quality_score: 55,
        audit_ready_score: 50,
        defects: [
          { item: "작성자/검토자/승인자 서명", severity: "high" },
          { item: "목적 및 범위 명시", severity: "medium" },
          { item: "절차 단계별 상세 기술", severity: "high" },
        ],
        checklist: [],
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: generateId(),
        check_mode: "qmsquare",
        total_items: 20,
        passed_items: 18,
        failed_items: 2,
        quality_score: 90,
        audit_ready_score: 88,
        defects: [{ item: "개정 이력 기록", severity: "low" }],
        checklist: [],
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]
    saveToStorage(KEYS.QUALITY_CHECKS, demoQualityChecks)

    localStorage.setItem(KEYS.INITIALIZED, "true")
  } catch (error) {
    console.error("[v0] Failed to initialize demo data:", error)
  }
}

// Documents CRUD
export function getDocuments(): Document[] {
  return getFromStorage<Document>(KEYS.DOCUMENTS)
}

export function addDocument(document: Omit<Document, "id" | "created_at" | "updated_at">): Document {
  console.log("[v0] addDocument 호출 - 문서 생성 시작")
  console.log("[v0] 입력 데이터:", document)

  const documents = getDocuments()
  console.log("[v0] 현재 저장된 문서 개수:", documents.length)

  const newDocument: Document = {
    ...document,
    id: generateId(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  console.log("[v0] 생성된 문서 ID:", newDocument.id)
  console.log("[v0] 생성된 문서 전체 데이터:", newDocument)

  documents.unshift(newDocument)
  saveToStorage(KEYS.DOCUMENTS, documents)

  const verification = getDocumentById(newDocument.id)
  if (verification) {
    console.log("[v0] ✓ 문서 저장 검증 성공 - ID:", newDocument.id)
  } else {
    console.error("[v0] ✗ 문서 저장 검증 실패 - 저장되지 않음")
  }

  return newDocument
}

export function deleteDocument(id: string): void {
  const documents = getDocuments().filter((doc) => doc.id !== id)
  saveToStorage(KEYS.DOCUMENTS, documents)
}

export function updateDocument(id: string, updates: Partial<Document>): void {
  const documents = getDocuments()
  const index = documents.findIndex((doc) => doc.id === id)
  if (index !== -1) {
    documents[index] = { ...documents[index], ...updates, updated_at: new Date().toISOString() }
    saveToStorage(KEYS.DOCUMENTS, documents)
  }
}

export function getDocumentById(id: string): Document | null {
  console.log("[v0] getDocumentById 호출, ID:", id)

  const documents = getDocuments()
  console.log("[v0] 저장된 문서 총 개수:", documents.length)

  if (documents.length > 0) {
    console.log("[v0] 저장된 문서 ID 목록:", documents.map((d) => d.id).join(", "))
  }

  const found = documents.find((doc) => doc.id === id)

  if (found) {
    console.log("[v0] 문서 발견:", found.title)
  } else {
    console.error("[v0] 문서를 찾을 수 없음 - 요청 ID:", id)
  }

  return found || null
}

// Quality Records CRUD
export function getQualityRecords(): QualityRecord[] {
  return getFromStorage<QualityRecord>(KEYS.QUALITY_RECORDS)
}

export function addQualityRecord(record: Omit<QualityRecord, "id" | "created_at" | "updated_at">): QualityRecord {
  const records = getQualityRecords()
  const newRecord: QualityRecord = {
    ...record,
    id: generateId(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  records.unshift(newRecord)
  saveToStorage(KEYS.QUALITY_RECORDS, records)
  return newRecord
}

export function deleteQualityRecord(id: string): void {
  const records = getQualityRecords().filter((rec) => rec.id !== id)
  saveToStorage(KEYS.QUALITY_RECORDS, records)
}

export function updateQualityRecord(id: string, updates: Partial<QualityRecord>): void {
  const records = getQualityRecords()
  const index = records.findIndex((rec) => rec.id === id)
  if (index !== -1) {
    records[index] = { ...records[index], ...updates, updated_at: new Date().toISOString() }
    saveToStorage(KEYS.QUALITY_RECORDS, records)
  }
}

// Work Time Logs
export function getWorkTimeLogs(): WorkTimeLog[] {
  return getFromStorage<WorkTimeLog>(KEYS.WORK_TIME_LOGS)
}

export function addWorkTimeLog(log: Omit<WorkTimeLog, "id" | "created_at">): WorkTimeLog {
  const logs = getWorkTimeLogs()
  const newLog: WorkTimeLog = {
    ...log,
    id: generateId(),
    created_at: new Date().toISOString(),
  }
  logs.unshift(newLog)
  saveToStorage(KEYS.WORK_TIME_LOGS, logs)
  return newLog
}

export function updateWorkTimeLog(id: string, updates: Partial<WorkTimeLog>): void {
  const logs = getWorkTimeLogs()
  const index = logs.findIndex((log) => log.id === id)
  if (index !== -1) {
    logs[index] = { ...logs[index], ...updates }
    saveToStorage(KEYS.WORK_TIME_LOGS, logs)
  }
}

// Quality Checks
export function getQualityChecks(): QualityCheck[] {
  return getFromStorage<QualityCheck>(KEYS.QUALITY_CHECKS)
}

export function addQualityCheck(check: Omit<QualityCheck, "id" | "created_at">): QualityCheck {
  const checks = getQualityChecks()
  const newCheck: QualityCheck = {
    ...check,
    id: generateId(),
    created_at: new Date().toISOString(),
  }
  checks.unshift(newCheck)
  saveToStorage(KEYS.QUALITY_CHECKS, checks)
  return newCheck
}

// Efficiency Snapshots
export function getEfficiencySnapshots(): EfficiencySnapshot[] {
  return getFromStorage<EfficiencySnapshot>(KEYS.EFFICIENCY_SNAPSHOTS)
}

export function addEfficiencySnapshot(snapshot: Omit<EfficiencySnapshot, "id" | "created_at">): EfficiencySnapshot {
  const snapshots = getEfficiencySnapshots()
  const newSnapshot: EfficiencySnapshot = {
    ...snapshot,
    id: generateId(),
    created_at: new Date().toISOString(),
  }
  snapshots.unshift(newSnapshot)
  saveToStorage(KEYS.EFFICIENCY_SNAPSHOTS, snapshots)
  return newSnapshot
}

export function getAttachments(): FileAttachment[] {
  return getFromStorage<FileAttachment>(KEYS.ATTACHMENTS)
}

export function getAttachmentsByRecordId(recordId: string): FileAttachment[] {
  return getAttachments().filter((att) => att.quality_record_id === recordId)
}

export function addAttachment(attachment: Omit<FileAttachment, "id" | "uploaded_at">): FileAttachment {
  const attachments = getAttachments()
  const newAttachment: FileAttachment = {
    ...attachment,
    id: generateId(),
    uploaded_at: new Date().toISOString(),
  }
  attachments.unshift(newAttachment)
  saveToStorage(KEYS.ATTACHMENTS, attachments)
  return newAttachment
}

export function deleteAttachment(id: string): void {
  const attachments = getAttachments().filter((att) => att.id !== id)
  saveToStorage(KEYS.ATTACHMENTS, attachments)
}

export function getAnalysisResults(): AnalysisResult[] {
  return getFromStorage<AnalysisResult>(KEYS.ANALYSIS)
}

export function getAnalysisResultsByRecordId(recordId: string): AnalysisResult[] {
  return getAnalysisResults().filter((result) => result.quality_record_id === recordId)
}

export function addAnalysisResult(result: AnalysisResult): AnalysisResult {
  const results = getAnalysisResults()
  results.unshift(result)
  saveToStorage(KEYS.ANALYSIS, results)
  return result
}

export function deleteAnalysisResult(id: string): void {
  const results = getAnalysisResults().filter((result) => result.id !== id)
  saveToStorage(KEYS.ANALYSIS, results)
}
