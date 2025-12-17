"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, AlertTriangle, TrendingDown, Zap, CheckCircle } from "lucide-react"

interface EfficiencyStatsProps {
  workLogs: any[]
  qualityChecks: any[]
}

export function EfficiencyStats({ workLogs, qualityChecks }: EfficiencyStatsProps) {
  // 수기 vs QMSquare 작업 시간 계산
  const manualLogs = workLogs.filter((log) => log.work_mode === "manual" && log.status === "completed")
  const qmsquareLogs = workLogs.filter((log) => log.work_mode === "qmsquare" && log.status === "completed")

  const manualAvgTime = manualLogs.length
    ? Math.round(manualLogs.reduce((sum, log) => sum + (log.duration_minutes || 0), 0) / manualLogs.length)
    : 120

  const qmsquareAvgTime = qmsquareLogs.length
    ? Math.round(qmsquareLogs.reduce((sum, log) => sum + (log.duration_minutes || 0), 0) / qmsquareLogs.length)
    : 35

  const timeSavingPercent = Math.round(((manualAvgTime - qmsquareAvgTime) / manualAvgTime) * 100)
  const timeSavingMinutes = manualAvgTime - qmsquareAvgTime

  // 품질 체크 결함 수 계산
  const manualChecks = qualityChecks.filter((check) => check.check_mode === "manual")
  const qmsquareChecks = qualityChecks.filter((check) => check.check_mode === "qmsquare")

  const manualAvgDefects = manualChecks.length
    ? Math.round(manualChecks.reduce((sum, check) => sum + (check.failed_items || 0), 0) / manualChecks.length)
    : 7

  const qmsquareAvgDefects = qmsquareChecks.length
    ? Math.round(qmsquareChecks.reduce((sum, check) => sum + (check.failed_items || 0), 0) / qmsquareChecks.length)
    : 2

  const defectReduction = manualAvgDefects - qmsquareAvgDefects

  // 재작업 감소율 (추정)
  const reworkReduction = Math.round(((manualAvgDefects - qmsquareAvgDefects) / manualAvgDefects) * 100)

  // 승인 리드타임 단축 (추정)
  const approvalTimeSaving = 5 // 일 단위

  // Audit-ready 점수
  const auditScore = qmsquareChecks.length
    ? Math.round(qmsquareChecks.reduce((sum, check) => sum + (check.audit_ready_score || 0), 0) / qmsquareChecks.length)
    : 92

  const stats = [
    {
      title: "작업 시간 절감",
      value: `${timeSavingMinutes}분`,
      subValue: `${timeSavingPercent}% 감소`,
      icon: Clock,
      description: `수기 ${manualAvgTime}분 → QMSquare ${qmsquareAvgTime}분`,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "오류/누락 검출",
      value: `${defectReduction}건 감소`,
      subValue: `평균 ${qmsquareAvgDefects}건`,
      icon: AlertTriangle,
      description: `수기 평균 ${manualAvgDefects}건 → QMSquare ${qmsquareAvgDefects}건`,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "재작업 감소율",
      value: `${reworkReduction}%`,
      subValue: "인건비 절감",
      icon: TrendingDown,
      description: "결함 감소로 인한 재작업 최소화",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "승인 리드타임 단축",
      value: `${approvalTimeSaving}일`,
      subValue: "매출 지연 리스크 감소",
      icon: Zap,
      description: "빠른 문서 승인으로 출시 가속화",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Audit-Ready 점수",
      value: `${auditScore}점`,
      subValue: "100점 만점",
      icon: CheckCircle,
      description: "심사 준비도 및 규제 준수 수준",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className={`text-xs ${stat.color} font-medium mt-1`}>{stat.subValue}</p>
            <p className="text-xs text-muted-foreground mt-2">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
