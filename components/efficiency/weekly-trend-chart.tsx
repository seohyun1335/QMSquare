"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface WeeklyTrendChartProps {
  workLogs: any[]
}

export function WeeklyTrendChart({ workLogs }: WeeklyTrendChartProps) {
  // 최근 8주간의 주간 평균 작업 시간 추이
  const weeks = []
  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - i * 7)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)

    const weekLogs = workLogs.filter((log) => {
      const logDate = new Date(log.created_at)
      return logDate >= weekStart && logDate < weekEnd && log.status === "completed"
    })

    const manualLogs = weekLogs.filter((log) => log.work_mode === "manual")
    const qmsquareLogs = weekLogs.filter((log) => log.work_mode === "qmsquare")

    weeks.push({
      week: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
      수기: manualLogs.length
        ? Math.round(manualLogs.reduce((sum, log) => sum + (log.duration_minutes || 0), 0) / manualLogs.length)
        : 120 - i * 5, // 데모: 점진적 감소
      QMSquare: qmsquareLogs.length
        ? Math.round(qmsquareLogs.reduce((sum, log) => sum + (log.duration_minutes || 0), 0) / qmsquareLogs.length)
        : 35 - i * 2, // 데모: 점진적 감소
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>주간 작업 시간 추이</CardTitle>
        <CardDescription>최근 8주간 평균 작업 시간 변화 (분)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weeks}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="수기" stroke="#ef4444" strokeWidth={2} />
            <Line type="monotone" dataKey="QMSquare" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
