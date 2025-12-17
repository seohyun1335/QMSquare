"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentDocuments } from "@/components/dashboard/recent-documents"
import { RecentQualityRecords } from "@/components/dashboard/recent-quality-records"
import { getDocuments, getQualityRecords } from "@/lib/storage"

export default function DashboardPage() {
  const [documentsCount, setDocumentsCount] = useState(0)
  const [qualityRecordsCount, setQualityRecordsCount] = useState(0)
  const [recentDocuments, setRecentDocuments] = useState<any[]>([])
  const [recentQualityRecords, setRecentQualityRecords] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    loadDashboardData()
  }, [mounted])

  const loadDashboardData = async () => {
    try {
      const documents = await getDocuments()
      const qualityRecords = await getQualityRecords()

      setDocumentsCount(documents.length)
      setQualityRecordsCount(qualityRecords.length)
      setRecentDocuments(documents.slice(0, 5))
      setRecentQualityRecords(qualityRecords.slice(0, 5))
    } catch (error) {
      console.error("[v0] Failed to load dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted || loading) {
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
        <div className="mx-auto max-w-7xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">대시보드</h1>
            <p className="text-muted-foreground">환영합니다, QMSquare</p>
          </div>

          <DashboardStats documentsCount={documentsCount} qualityRecordsCount={qualityRecordsCount} />

          <div className="grid gap-6 md:grid-cols-2">
            <RecentDocuments documents={recentDocuments} />
            <RecentQualityRecords records={recentQualityRecords} />
          </div>
        </div>
      </main>
    </div>
  )
}
