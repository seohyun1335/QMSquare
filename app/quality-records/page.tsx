"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { QualityRecordList } from "@/components/quality-records/quality-record-list"
import { NewQualityRecordDialog } from "@/components/quality-records/new-quality-record-dialog"
import { getQualityRecords, initializeDemoData } from "@/lib/storage"
import type { QualityRecord } from "@/lib/types"

export default function QualityRecordsPage() {
  const [records, setRecords] = useState<QualityRecord[]>([])

  useEffect(() => {
    initializeDemoData()
    loadRecords()
  }, [])

  const loadRecords = () => {
    const allRecords = getQualityRecords()
    setRecords(allRecords)
  }

  return (
    <div className="flex min-h-svh flex-col">
      <DashboardHeader user={null} profile={null} />
      <main className="flex-1 p-6 md:p-10">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">품질 기록</h1>
              <p className="text-muted-foreground">CAPA, 일탈, 심사 등을 추적하세요</p>
            </div>
            <NewQualityRecordDialog onSuccess={loadRecords} />
          </div>

          <QualityRecordList records={records} onRefresh={loadRecords} />
        </div>
      </main>
    </div>
  )
}
