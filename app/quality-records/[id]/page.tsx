"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText } from "lucide-react"
import { getQualityRecords } from "@/lib/storage"
import { FileAttachmentSection } from "@/components/quality-records/file-attachment-section"
import { AnalysisResultsSection } from "@/components/quality-records/analysis-results-section"
import type { QualityRecord } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale/ko"

export default function QualityRecordDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [record, setRecord] = useState<QualityRecord | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const id = params.id as string
    const records = getQualityRecords()
    const found = records.find((r) => r.id === id)
    setRecord(found || null)
  }, [params.id, refreshKey])

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  if (!record) {
    return (
      <div className="flex min-h-svh flex-col">
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">품질 기록을 찾을 수 없습니다.</p>
              <Button onClick={() => router.push("/quality-records")} className="w-full mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                목록으로 돌아가기
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    return status === "완료" ? "secondary" : "default"
  }

  return (
    <div className="flex min-h-svh flex-col">
      <DashboardHeader user={null} profile={null} />
      <main className="flex-1 p-6 md:p-10">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.push("/quality-records")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              목록
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">{record.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                생성일: {formatDistanceToNow(new Date(record.created_at), { addSuffix: true, locale: ko })}
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                기본 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">기록 유형</p>
                  <Badge variant="outline" className="mt-1">
                    {record.record_type}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">상태</p>
                  <Badge variant={getStatusColor(record.status)} className="mt-1">
                    {record.status}
                  </Badge>
                </div>
              </div>
              {record.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">설명</p>
                  <p className="text-sm">{record.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <FileAttachmentSection recordId={record.id} onRefresh={handleRefresh} />

          <AnalysisResultsSection recordId={record.id} />
        </div>
      </main>
    </div>
  )
}
