"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface TimeComparisonChartProps {
  workLogs: any[]
}

export function TimeComparisonChart({ workLogs }: TimeComparisonChartProps) {
  // 작업 유형별 시간 비교 데이터 생성
  const taskTypes = ["document_creation", "review", "approval"]
  const taskTypeLabels: Record<string, string> = {
    document_creation: "문서 작성",
    review: "검토",
    approval: "승인",
  }

  const chartData = taskTypes.map((taskType) => {
    const manualLogs = workLogs.filter(
      (log) => log.work_mode === "manual" && log.task_type === taskType && log.status === "completed",
    )
    const qmsquareLogs = workLogs.filter(
      (log) => log.work_mode === "qmsquare" && log.task_type === taskType && log.status === "completed",
    )

    const manualAvg = manualLogs.length
      ? Math.round(manualLogs.reduce((sum, log) => sum + (log.duration_minutes || 0), 0) / manualLogs.length)
      : taskType === "document_creation"
        ? 120
        : taskType === "review"
          ? 45
          : 30

    const qmsquareAvg = qmsquareLogs.length
      ? Math.round(qmsquareLogs.reduce((sum, log) => sum + (log.duration_minutes || 0), 0) / qmsquareLogs.length)
      : taskType === "document_creation"
        ? 35
        : taskType === "review"
          ? 15
          : 10

    return {
      name: taskTypeLabels[taskType],
      수기: manualAvg,
      QMSquare: qmsquareAvg,
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>작업 시간 비교</CardTitle>
        <CardDescription>작업 유형별 수기 vs QMSquare 소요 시간 (분)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="수기" fill="#ef4444" />
            <Bar dataKey="QMSquare" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
