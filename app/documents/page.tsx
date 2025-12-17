"use client"

import { useEffect, useState } from "react"
import { Database } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DocumentList } from "@/components/documents/document-list"
import { NewDocumentDialog } from "@/components/documents/new-document-dialog"
import { AIDocumentReview } from "@/components/documents/ai-document-review"
import { getDocuments, initializeDemoData } from "@/lib/storage"
import type { Document } from "@/lib/types"

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [mounted, setMounted] = useState(false)
  const [showLocalStorageWarning, setShowLocalStorageWarning] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const isProduction = typeof window !== "undefined" && window.location.hostname !== "localhost"
    if (isProduction) {
      setShowLocalStorageWarning(true)
      console.log("[v0] 배포 환경 감지 - LocalStorage 모드로 작동 중")
    }

    try {
      initializeDemoData()
      loadDocuments()
    } catch (error) {
      console.error("[v0] Failed to load documents:", error)
    }
  }, [mounted])

  const loadDocuments = () => {
    console.log("[v0] loadDocuments 호출")
    try {
      const allDocuments = getDocuments()
      console.log("[v0] 로드된 문서 개수:", allDocuments.length)

      if (allDocuments.length > 0) {
        console.log(
          "[v0] 문서 목록:",
          allDocuments.map((d) => ({
            id: d.id,
            title: d.title,
            type: d.document_type,
          })),
        )
      }

      setDocuments(allDocuments)
    } catch (error) {
      console.error("[v0] 문서 로드 실패:", error)
      setDocuments([])
    }
  }

  if (!mounted) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col">
      <DashboardHeader user={null} profile={null} />
      <main className="flex-1 p-6 md:p-10">
        <div className="mx-auto max-w-7xl space-y-6">
          {showLocalStorageWarning && (
            <Alert>
              <Database className="h-4 w-4" />
              <AlertTitle>데모 모드로 작동 중</AlertTitle>
              <AlertDescription>
                현재 브라우저 LocalStorage를 사용하고 있습니다. 생성한 문서는 이 브라우저에만 저장되며, 다른 기기나
                브라우저에서는 보이지 않습니다. 데이터를 영구적으로 저장하려면 Supabase 연동이 필요합니다.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">문서 관리</h1>
              <p className="text-muted-foreground">품질 문서 및 절차를 관리하세요</p>
            </div>
            <NewDocumentDialog onSuccess={loadDocuments} />
          </div>

          <AIDocumentReview />

          <DocumentList documents={documents} onRefresh={loadDocuments} />
        </div>
      </main>
    </div>
  )
}
