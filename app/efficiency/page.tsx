"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { EfficiencyStats } from "@/components/efficiency/efficiency-stats"
import { TimeComparisonChart } from "@/components/efficiency/time-comparison-chart"
import { DefectComparisonChart } from "@/components/efficiency/defect-comparison-chart"
import { WeeklyTrendChart } from "@/components/efficiency/weekly-trend-chart"
import { ROICalculator } from "@/components/efficiency/roi-calculator"
import { WorkTimerWidget } from "@/components/efficiency/work-timer-widget"
import { QualityCheckCard } from "@/components/efficiency/quality-check-card"
import { ABComparisonReport } from "@/components/efficiency/ab-comparison-report"
import { getWorkTimeLogs, getQualityChecks, getEfficiencySnapshots, initializeDemoData } from "@/lib/storage"

export default function EfficiencyPage() {
  const [workLogs, setWorkLogs] = useState<any[]>([])
  const [qualityChecks, setQualityChecks] = useState<any[]>([])
  const [snapshots, setSnapshots] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    try {
      initializeDemoData()

      setWorkLogs(getWorkTimeLogs())
      setQualityChecks(getQualityChecks())
      setSnapshots(getEfficiencySnapshots())
    } catch (error) {
      console.error("[v0] Failed to load efficiency data:", error)
      setWorkLogs([])
      setQualityChecks([])
      setSnapshots([])
    } finally {
      setIsLoading(false)
    }
  }, [mounted])

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">효율성 분석 대시보드</h1>
          <p className="text-muted-foreground">수기 작성 대비 QMSquare 사용 시 효율성 증명 및 ROI 분석</p>
        </div>

        {/* 작업 측정 도구 */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <WorkTimerWidget />
          <QualityCheckCard />
        </div>

        {/* 주요 지표 카드 */}
        <EfficiencyStats workLogs={workLogs || []} qualityChecks={qualityChecks || []} />

        {/* A/B 비교 리포트 */}
        <div className="mb-8">
          <ABComparisonReport workLogs={workLogs || []} qualityChecks={qualityChecks || []} />
        </div>

        {/* ROI 계산기 */}
        <div className="mb-8">
          <ROICalculator snapshots={snapshots || []} />
        </div>

        {/* 차트 섹션 */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <TimeComparisonChart workLogs={workLogs || []} />
          <DefectComparisonChart qualityChecks={qualityChecks || []} />
        </div>

        <div className="mb-8">
          <WeeklyTrendChart workLogs={workLogs || []} />
        </div>
      </main>
    </div>
  )
}
