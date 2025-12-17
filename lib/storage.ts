import type {
  Document,
  QualityRecord,
  WorkTimeLog,
  QualityCheck,
  EfficiencySnapshot,
  FileAttachment,
  AnalysisResult,
} from "./types"
import { createClient } from "./supabase/client"

export function initializeDemoData(): void {
  // Supabase를 사용하므로 LocalStorage 초기화 불필요
  // 데모 데이터는 Supabase 데이터베이스에서 직접 관리
  console.log("[v0] Supabase mode - demo data initialization skipped")
}

// Documents CRUD
export async function getDocuments(): Promise<Document[]> {
  try {
    const supabase = createClient()

    const { data: user } = await supabase.auth.getUser()

    if (!user.user) {
      console.log("[v0] User not authenticated, returning empty documents")
      return []
    }

    const { data, error } = await supabase.from("documents").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Supabase getDocuments error:", error)
      return []
    }

    console.log("[v0] Fetched documents from Supabase:", data?.length || 0)
    return data || []
  } catch (error) {
    console.error("[v0] getDocuments failed:", error)
    return []
  }
}

export async function addDocument(document: Omit<Document, "id" | "created_at" | "updated_at">): Promise<Document> {
  console.log("[v0] addDocument 호출 - Supabase에 문서 생성")
  console.log("[v0] 입력 데이터:", document)

  try {
    const supabase = createClient()

    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      throw new Error("User not authenticated")
    }

    const newDocument = {
      ...document,
      user_id: userData.user.id,
      created_by: userData.user.id,
    }

    const { data, error } = await supabase.from("documents").insert([newDocument]).select().single()

    if (error) {
      console.error("[v0] Supabase addDocument error:", error)
      throw error
    }

    console.log("[v0] 생성된 문서 ID:", data.id)
    console.log("[v0] ✓ 문서 저장 성공")

    return data
  } catch (error) {
    console.error("[v0] addDocument failed:", error)
    throw error
  }
}

export async function deleteDocument(id: string): Promise<void> {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("documents").delete().eq("id", id)

    if (error) {
      console.error("[v0] Supabase deleteDocument error:", error)
      throw error
    }
  } catch (error) {
    console.error("[v0] deleteDocument failed:", error)
    throw error
  }
}

export async function updateDocument(id: string, updates: Partial<Document>): Promise<void> {
  try {
    const supabase = createClient()

    const { error } = await supabase
      .from("documents")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) {
      console.error("[v0] Supabase updateDocument error:", error)
      throw error
    }
  } catch (error) {
    console.error("[v0] updateDocument failed:", error)
    throw error
  }
}

export async function getDocumentById(id: string): Promise<Document | null> {
  console.log("[v0] getDocumentById 호출, ID:", id)

  try {
    const supabase = createClient()

    const { data, error } = await supabase.from("documents").select("*").eq("id", id).single()

    if (error) {
      console.error("[v0] Supabase getDocumentById error:", error)
      return null
    }

    if (data) {
      console.log("[v0] 문서 발견:", data.title)
    } else {
      console.error("[v0] 문서를 찾을 수 없음 - 요청 ID:", id)
    }

    return data
  } catch (error) {
    console.error("[v0] getDocumentById failed:", error)
    return null
  }
}

// Quality Records CRUD
export async function getQualityRecords(): Promise<QualityRecord[]> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.from("quality_records").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Supabase getQualityRecords error:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("[v0] getQualityRecords failed:", error)
    return []
  }
}

export async function addQualityRecord(
  record: Omit<QualityRecord, "id" | "created_at" | "updated_at">,
): Promise<QualityRecord> {
  try {
    const supabase = createClient()

    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      throw new Error("User not authenticated")
    }

    const { data, error } = await supabase
      .from("quality_records")
      .insert([{ ...record, created_by: userData.user.id }])
      .select()
      .single()

    if (error) {
      console.error("[v0] Supabase addQualityRecord error:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("[v0] addQualityRecord failed:", error)
    throw error
  }
}

export async function deleteQualityRecord(id: string): Promise<void> {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("quality_records").delete().eq("id", id)

    if (error) {
      console.error("[v0] Supabase deleteQualityRecord error:", error)
      throw error
    }
  } catch (error) {
    console.error("[v0] deleteQualityRecord failed:", error)
    throw error
  }
}

export async function updateQualityRecord(id: string, updates: Partial<QualityRecord>): Promise<void> {
  try {
    const supabase = createClient()

    const { error } = await supabase
      .from("quality_records")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) {
      console.error("[v0] Supabase updateQualityRecord error:", error)
      throw error
    }
  } catch (error) {
    console.error("[v0] updateQualityRecord failed:", error)
    throw error
  }
}

// Work Time Logs
export async function getWorkTimeLogs(): Promise<WorkTimeLog[]> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.from("work_time_logs").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Supabase getWorkTimeLogs error:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("[v0] getWorkTimeLogs failed:", error)
    return []
  }
}

export async function addWorkTimeLog(log: Omit<WorkTimeLog, "id" | "created_at">): Promise<WorkTimeLog> {
  try {
    const supabase = createClient()

    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      throw new Error("User not authenticated")
    }

    const { data, error } = await supabase
      .from("work_time_logs")
      .insert([{ ...log, user_id: userData.user.id }])
      .select()
      .single()

    if (error) {
      console.error("[v0] Supabase addWorkTimeLog error:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("[v0] addWorkTimeLog failed:", error)
    throw error
  }
}

export async function updateWorkTimeLog(id: string, updates: Partial<WorkTimeLog>): Promise<void> {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("work_time_logs").update(updates).eq("id", id)

    if (error) {
      console.error("[v0] Supabase updateWorkTimeLog error:", error)
      throw error
    }
  } catch (error) {
    console.error("[v0] updateWorkTimeLog failed:", error)
    throw error
  }
}

// Quality Checks
export async function getQualityChecks(): Promise<QualityCheck[]> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.from("quality_checks").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Supabase getQualityChecks error:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("[v0] getQualityChecks failed:", error)
    return []
  }
}

export async function addQualityCheck(check: Omit<QualityCheck, "id" | "created_at">): Promise<QualityCheck> {
  try {
    const supabase = createClient()

    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      throw new Error("User not authenticated")
    }

    const { data, error } = await supabase
      .from("quality_checks")
      .insert([{ ...check, user_id: userData.user.id }])
      .select()
      .single()

    if (error) {
      console.error("[v0] Supabase addQualityCheck error:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("[v0] addQualityCheck failed:", error)
    throw error
  }
}

// Efficiency Snapshots
export async function getEfficiencySnapshots(): Promise<EfficiencySnapshot[]> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("efficiency_snapshots")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Supabase getEfficiencySnapshots error:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("[v0] getEfficiencySnapshots failed:", error)
    return []
  }
}

export async function addEfficiencySnapshot(
  snapshot: Omit<EfficiencySnapshot, "id" | "created_at">,
): Promise<EfficiencySnapshot> {
  try {
    const supabase = createClient()

    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      throw new Error("User not authenticated")
    }

    const { data, error } = await supabase
      .from("efficiency_snapshots")
      .insert([{ ...snapshot, user_id: userData.user.id }])
      .select()
      .single()

    if (error) {
      console.error("[v0] Supabase addEfficiencySnapshot error:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("[v0] addEfficiencySnapshot failed:", error)
    throw error
  }
}

// File attachments and analysis results는 IndexedDB 유지 (Supabase Storage는 나중에 추가 가능)
export function getAttachments(): FileAttachment[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem("qmsquare_attachments")
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function getAttachmentsByRecordId(recordId: string): FileAttachment[] {
  return getAttachments().filter((att) => att.quality_record_id === recordId)
}

export function addAttachment(attachment: Omit<FileAttachment, "id" | "uploaded_at">): FileAttachment {
  const attachments = getAttachments()
  const newAttachment: FileAttachment = {
    ...attachment,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    uploaded_at: new Date().toISOString(),
  }
  attachments.unshift(newAttachment)
  if (typeof window !== "undefined") {
    localStorage.setItem("qmsquare_attachments", JSON.stringify(attachments))
  }
  return newAttachment
}

export function deleteAttachment(id: string): void {
  const attachments = getAttachments().filter((att) => att.id !== id)
  if (typeof window !== "undefined") {
    localStorage.setItem("qmsquare_attachments", JSON.stringify(attachments))
  }
}

export function getAnalysisResults(): AnalysisResult[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem("qmsquare_analysis")
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function getAnalysisResultsByRecordId(recordId: string): AnalysisResult[] {
  return getAnalysisResults().filter((result) => result.quality_record_id === recordId)
}

export function addAnalysisResult(result: AnalysisResult): AnalysisResult {
  const results = getAnalysisResults()
  results.unshift(result)
  if (typeof window !== "undefined") {
    localStorage.setItem("qmsquare_analysis", JSON.stringify(results))
  }
  return result
}

export function deleteAnalysisResult(id: string): void {
  const results = getAnalysisResults().filter((result) => result.id !== id)
  if (typeof window !== "undefined") {
    localStorage.setItem("qmsquare_analysis", JSON.stringify(results))
  }
}
