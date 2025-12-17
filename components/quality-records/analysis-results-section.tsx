"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Sparkles,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  XCircle,
  AlertCircle,
  Clock,
} from "lucide-react"
import { getAnalysisResultsByRecordId } from "@/lib/storage"
import type { AnalysisResult } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale/ko"

interface AnalysisResultsSectionProps {
  recordId: string
}

export function AnalysisResultsSection({ recordId }: AnalysisResultsSectionProps) {
  const [results, setResults] = useState<AnalysisResult[]>([])

  useEffect(() => {
    loadResults()
  }, [recordId])

  const loadResults = () => {
    const analysisResults = getAnalysisResultsByRecordId(recordId)
    setResults(analysisResults)
  }

  if (results.length === 0) {
    return null
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getAuditReadyBadge = (status: string) => {
    if (status === "Ready") return { variant: "secondary" as const, label: "심사 준비 완료" }
    if (status === "Needs Update") return { variant: "default" as const, label: "업데이트 필요" }
    return { variant: "destructive" as const, label: "증적 누락" }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI 분석 결과
        </CardTitle>
        <CardDescription>OpenAI 기반 문서 품질 분석 및 개선 권고사항</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {results.map((result) => {
          const auditBadge = getAuditReadyBadge(result.audit_ready)
          const totalFindings =
            result.findings.missing.length +
            result.findings.ambiguous.length +
            result.findings.inconsistent.length +
            result.findings.inaccurate.length

          return (
            <div key={result.id} className="space-y-4 pb-6 border-b last:border-0 last:pb-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={auditBadge.variant}>{auditBadge.label}</Badge>
                    <p className="text-sm text-muted-foreground">
                      분석일: {formatDistanceToNow(new Date(result.created_at), { addSuffix: true, locale: ko })}
                    </p>
                  </div>
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>{result.summary}</AlertDescription>
                  </Alert>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm text-muted-foreground mb-1">품질 점수</p>
                  <p className={`text-4xl font-bold ${getScoreColor(result.quality_score)}`}>{result.quality_score}</p>
                  <p className="text-xs text-muted-foreground mt-1">발견된 이슈: {totalFindings}개</p>
                </div>
              </div>

              {result.findings.missing.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-destructive" />
                    누락된 항목 ({result.findings.missing.length}개)
                  </h4>
                  <div className="space-y-2">
                    {result.findings.missing.map((item, idx) => (
                      <div key={idx} className="p-3 bg-red-50 dark:bg-red-950 rounded border border-red-200">
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">{item.issue}</p>
                        <p className="text-xs text-muted-foreground mt-1">💡 {item.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.findings.ambiguous.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    모호한 표현 ({result.findings.ambiguous.length}개)
                  </h4>
                  <div className="space-y-2">
                    {result.findings.ambiguous.map((item, idx) => (
                      <div key={idx} className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded border border-yellow-200">
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">{item.issue}</p>
                        <p className="text-xs text-muted-foreground mt-1">💡 {item.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.findings.inconsistent.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    불일치 사항 ({result.findings.inconsistent.length}개)
                  </h4>
                  <div className="space-y-2">
                    {result.findings.inconsistent.map((item, idx) => (
                      <div key={idx} className="p-3 bg-orange-50 dark:bg-orange-950 rounded border border-orange-200">
                        <p className="text-sm font-medium text-orange-800 dark:text-orange-200">{item.issue}</p>
                        <p className="text-xs text-muted-foreground mt-1">💡 {item.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.findings.inaccurate.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    부정확한 내용 ({result.findings.inaccurate.length}개)
                  </h4>
                  <div className="space-y-2">
                    {result.findings.inaccurate.map((item, idx) => (
                      <div key={idx} className="p-3 bg-red-50 dark:bg-red-950 rounded border border-red-200">
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">{item.issue}</p>
                        <p className="text-xs text-muted-foreground mt-1">💡 {item.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-sm">
                    <strong className="text-blue-800 dark:text-blue-200">예상 재작업 시간</strong>
                    <br />
                    <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {result.estimated_rework_minutes}분
                    </span>
                  </AlertDescription>
                </Alert>

                <Alert className="bg-green-50 dark:bg-green-950 border-green-200">
                  <TrendingDown className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-sm">
                    <strong className="text-green-800 dark:text-green-200">QMSquare 사용 시 절감</strong>
                    <br />
                    <span className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {result.roi_metrics.time_saved_minutes}분
                    </span>
                  </AlertDescription>
                </Alert>
              </div>

              {result.roi_metrics.risk_reduction_notes.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-blue-600" />
                    리스크 감소 효과
                  </h4>
                  <ul className="space-y-1">
                    {result.roi_metrics.risk_reduction_notes.map((note, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
