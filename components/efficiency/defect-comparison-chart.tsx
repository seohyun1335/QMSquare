"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface DefectComparisonChartProps {
  qualityChecks: any[]
}

export function DefectComparisonChart({ qualityChecks }: DefectComparisonChartProps) {
  const manualChecks = qualityChecks.filter((check) => check.check_mode === "manual")
  const qmsquareChecks = qualityChecks.filter((check) => check.check_mode === "qmsquare")

  const chartData = [
    {
      name: "평균 결함 수",
      수기: manualChecks.length
        ? Math.round(manualChecks.reduce((sum, check) => sum + (check.failed_items || 0), 0) / manualChecks.length)
        : 7,
      QMSquare: qmsquareChecks.length
        ? Math.round(qmsquareChecks.reduce((sum, check) => sum + (check.failed_items || 0), 0) / qmsquareChecks.length)
        : 2,
    },
    {
      name: "품질 점수",
      수기: manualChecks.length
        ? Math.round(manualChecks.reduce((sum, check) => sum + (check.quality_score || 0), 0) / manualChecks.length)
        : 68,
      QMSquare: qmsquareChecks.length
        ? Math.round(qmsquareChecks.reduce((sum, check) => sum + (check.quality_score || 0), 0) / qmsquareChecks.length)
        : 92,
    },
    {
      name: "Audit 준비도",
      수기: manualChecks.length
        ? Math.round(manualChecks.reduce((sum, check) => sum + (check.audit_ready_score || 0), 0) / manualChecks.length)
        : 65,
      QMSquare: qmsquareChecks.length
        ? Math.round(
            qmsquareChecks.reduce((sum, check) => sum + (check.audit_ready_score || 0), 0) / qmsquareChecks.length,
          )
        : 90,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>문서 품질 비교</CardTitle>
        <CardDescription>결함 수 및 품질 점수 비교 (수기 vs QMSquare)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="수기" fill="#f97316" />
            <Bar dataKey="QMSquare" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
