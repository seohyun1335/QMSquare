"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DocumentList } from "@/components/documents/document-list"
import { NewDocumentDialog } from "@/components/documents/new-document-dialog"
import { AIDocumentReview } from "@/components/documents/ai-document-review"
import { getDocuments, initializeDemoData } from "@/lib/storage"
import type { Document } from "@/lib/types"

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    try {
      initializeDemoData()
      loadDocuments()
    } catch (error) {
      console.error("[v0] Failed to load documents:", error)
    }
  }, [mounted])

  const loadDocuments = () => {
    try {
      const allDocuments = getDocuments()
      setDocuments(allDocuments)
    } catch (error) {
      console.error("[v0] Failed to load documents:", error)
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
