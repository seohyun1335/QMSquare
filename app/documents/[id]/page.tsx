"use client"

import type React from "react"
import { notFound } from "next/navigation"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Sparkles, Loader2, Upload, X, AlertCircle, Database } from "lucide-react"
import { getDocumentById } from "@/lib/storage"
import type { Document } from "@/lib/types"
import { extractTextFromFile } from "@/lib/file-extractor"
import { format } from "date-fns"
import { ko } from "date-fns/locale/ko"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

interface DocumentAnalysisResult {
  comparison?: {
    manual: {
      avg_time_min: number
      missing_risk: string
      rework_risk: string
      audit_ready: string
    }
    qmsquare: {
      avg_time_min: number
      missing_risk: string
      rework_risk: string
      audit_ready: string
    }
  }
  key_points?: string[]
  requirements?: Array<{
    title: string
    items: string[]
  }>
  findings?: Array<{
    severity: string
    category: string
    title: string
    evidence: string
    why: string
    fix: string[]
    recommended_text: string
  }>
}

type AnalysisStage = "idle" | "file_check" | "extracting" | "analyzing" | "rendering" | "complete" | "error"

export default function DocumentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<DocumentAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  const [showFileModal, setShowFileModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [modalAnalyzing, setModalAnalyzing] = useState(false) // 모달 내 로딩 상태 추가

  const [stage, setStage] = useState<string | null>(null)

  const [isProduction, setIsProduction] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const isProd = typeof window !== "undefined" && window.location.hostname !== "localhost"
    setIsProduction(isProd)
    if (isProd) {
      console.log("[v0] 배포 환경 감지 - LocalStorage 기반으로 작동")
    }
  }, [mounted])

  useEffect(() => {
    if (!mounted) return

    console.log("[v0] ===== 문서 로드 시작 =====")
    console.log("[v0] 요청된 문서 ID:", params.id)
    console.log("[v0] 현재 환경:", isProduction ? "배포(Production)" : "로컬(Development)")

    try {
      const doc = getDocumentById(params.id)
      console.log("[v0] getDocumentById 결과:", doc ? "문서 발견" : "문서 없음")

      if (doc) {
        console.log("[v0] 문서 정보:", {
          id: doc.id,
          title: doc.title,
          document_type: doc.document_type,
          status: doc.status,
        })
        setDocument(doc)
      } else {
        console.error("[v0] 문서를 찾을 수 없음 - ID:", params.id)
        console.log("[v0] localStorage 데이터 확인 필요")

        if (isProduction) {
          console.error("[v0] 배포 환경: 브라우저 localStorage에 문서가 없습니다")
          console.error("[v0] 문서 목록 페이지에서 새 문서를 생성하세요")
        }

        notFound()
      }
    } catch (error) {
      console.error("[v0] 문서 로드 중 오류 발생:", error)
      console.error("[v0] 오류 상세:", error instanceof Error ? error.message : String(error))
    } finally {
      setLoading(false)
      console.log("[v0] ===== 문서 로드 완료 =====")
    }
  }, [params.id, mounted, isProduction])

  const handleAnalyzeClick = () => {
    console.log("[v0] AI 심사 시작 버튼 클릭됨")
    setShowFileModal(true)
    setSelectedFile(null)
    setFileError(null)
    setError(null)
    setStage(null) // 모달 열 때 스테이지 초기화
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("[v0] 파일 input 변경 이벤트 발생")
    const file = e.target.files?.[0]

    if (!file) {
      console.log("[v0] 파일이 선택되지 않음")
      setSelectedFile(null)
      return
    }

    console.log("[v0] 선택된 파일:", file.name, file.type, file.size, "bytes")

    const ext = file.name.toLowerCase()
    if (!ext.endsWith(".txt") && !ext.endsWith(".docx")) {
      setFileError("TXT, DOCX 파일만 지원합니다 (PDF는 현재 지원하지 않습니다)")
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
    setFileError(null)
    console.log("[v0] 파일 선택 완료:", file.name)
  }

  const handleStartAnalysis = async () => {
    if (!selectedFile) {
      setFileError("파일을 선택해주세요.")
      return
    }

    console.log("[v0] ===== handleStartAnalysis 호출됨 =====")
    console.log("[v0] selectedFile:", selectedFile)

    setAnalyzing(true)
    setFileError(null)
    setStage("파일 확인 중...")

    try {
      setStage("텍스트 추출 중...")
      console.log("[v0] 텍스트 추출 시작:", selectedFile.name)
      const extractedText = await extractTextFromFile(selectedFile)
      console.log("[v0] 텍스트 추출 완료, 길이:", extractedText.length)

      if (extractedText.length < 50) {
        throw new Error(`텍스트가 너무 짧습니다. (${extractedText.length}자)`)
      }

      setStage("AI 분석 중...")
      console.log("[v0] API 호출 시작: /api/ai/analyze")

      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docType: document?.document_type === "절차서(SOP)" ? "SOP" : "SOP", // 문서 타입에 따라 매핑
          text: extractedText,
          language: "ko",
          strictness: "audit",
        }),
      })

      console.log("[v0] API 응답 상태:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: `HTTP ${response.status}: ${errorText}` }
        }
        throw new Error(errorData.error || errorData.details || errorText)
      }

      const result = await response.json()
      console.log("[v0] AI 분석 결과 수신 완료")

      console.log("[v0] ===== API 응답 검증 =====")
      console.log("[v0] comparison 존재:", !!result.comparison)
      console.log("[v0] key_points 존재:", !!result.key_points)
      console.log("[v0] requirements 존재:", !!result.requirements)
      console.log("[v0] findings 존재:", !!result.findings)
      console.log("[v0] findings 개수:", result.findings?.length || 0)
      console.log("[v0] ===== API 응답 검증 끝 =====")

      setAnalysisResult(result)

      localStorage.setItem(`doc_analysis_${params.id}`, JSON.stringify(result))
      console.log("[v0] 분석 결과 localStorage에 저장 완료")

      setStage("렌더링 중...")
      setShowFileModal(false)
      setSelectedFile(null)

      toast({
        title: "분석 완료",
        description: "AI 심사 결과를 확인하세요.",
      })
    } catch (err: any) {
      console.error("[v0] AI 분석 오류:", err)
      setFileError(err.message || "분석 중 오류가 발생했습니다.")
      setStage(null)
    } finally {
      setAnalyzing(false)
      console.log("[v0] ===== handleStartAnalysis 완료 =====")
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  if (loading || !mounted) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-4">
          <h2 className="text-2xl font-bold">문서를 찾을 수 없습니다</h2>
          <p className="text-muted-foreground">
            {isProduction
              ? "브라우저 LocalStorage에 문서가 없습니다. 문서 목록 페이지에서 새 문서를 생성하세요."
              : "요청하신 문서 ID가 존재하지 않습니다."}
          </p>
          <Button onClick={() => router.push("/documents")}>문서 목록으로 돌아가기</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col">
      <DashboardHeader user={null} profile={null} />
      <main className="flex-1 p-6 md:p-10">
        <div className="mx-auto max-w-5xl space-y-6">
          {isProduction && (
            <Alert>
              <Database className="h-4 w-4" />
              <AlertTitle>데모 모드로 작동 중</AlertTitle>
              <AlertDescription>
                현재 브라우저 LocalStorage를 사용하고 있습니다. AI 심사 결과는 이 브라우저에만 저장됩니다.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl">{document.title}</CardTitle>
                  </div>
                  {document.description && <CardDescription>{document.description}</CardDescription>}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{document.document_type}</Badge>
                <Badge variant="default">{document.status}</Badge>
                {document.version && <Badge variant="secondary">v{document.version}</Badge>}
              </div>

              {document.file_name && (
                <div className="rounded-lg border p-4 bg-muted/50">
                  <h4 className="text-sm font-medium mb-2">첨부 파일</h4>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{document.file_name}</span>
                    {document.file_size && (
                      <span className="text-xs text-muted-foreground">
                        ({(document.file_size / 1024).toFixed(1)} KB)
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                마지막 업데이트: {format(new Date(document.updated_at), "yyyy-MM-dd HH:mm:ss", { locale: ko })}
              </div>

              <div className="pt-4">
                <Button onClick={handleAnalyzeClick} disabled={analyzing} className="w-full" size="lg">
                  <Sparkles className="h-5 w-5 mr-2" />
                  {analyzing ? "AI 심사 진행 중..." : "AI 심사 시작"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Dialog open={showFileModal} onOpenChange={setShowFileModal}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>AI 심사를 위해 파일을 다시 선택해주세요</DialogTitle>
                <DialogDescription>보안 및 안정성을 위해 AI 심사 시점에 파일을 다시 선택합니다.</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {stage && (
                  <div className="space-y-2 p-3 rounded-lg border bg-muted/50">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {stage === "error" ? (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      ) : (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      )}
                      <span>{stage}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="file">문서 파일 선택</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".txt,.docx"
                    onChange={handleFileSelect}
                    className="cursor-pointer"
                    disabled={analyzing}
                  />
                  <p className="text-xs text-muted-foreground">지원 형식: TXT, DOCX (PDF는 현재 지원하지 않습니다)</p>
                </div>

                {selectedFile && (
                  <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/50">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-sm flex-1">{selectedFile.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        console.log("[v0] 파일 선택 취소")
                        setSelectedFile(null)
                        setFileError(null)
                      }}
                      disabled={analyzing}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {fileError && (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                    <div className="font-semibold mb-1 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      오류 상세 정보
                    </div>
                    <pre className="whitespace-pre-wrap text-xs font-mono">{fileError}</pre>
                  </div>
                )}

                {analyzing && (
                  <div className="flex items-center gap-2 p-3 rounded-lg border bg-primary/5">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">파일 처리 중...</span>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    console.log("[v0] 모달 취소 버튼 클릭")
                    setShowFileModal(false)
                    setStage(null)
                  }}
                  disabled={analyzing}
                >
                  취소
                </Button>
                <Button type="button" onClick={handleStartAnalysis} disabled={!selectedFile || analyzing}>
                  {analyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      처리 중...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      선택한 파일로 심사 시작
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {error && (
            <Card className="border-destructive mb-6">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-destructive mb-2">분석 오류 발생</h4>
                    <div className="text-sm space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="font-medium">실패 단계:</span>
                        <span className="font-medium text-muted-foreground">{stage}</span>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">에러 메시지:</span>
                        <pre className="mt-1 p-3 bg-muted rounded-md text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                          {error}
                        </pre>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setError(null)
                          setStage(null)
                        }}
                        className="mt-2"
                      >
                        오류 닫기
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {analysisResult && (
            <div className="space-y-6">
              {/* 수기 vs QMSquare 비교 요약 */}
              {analysisResult.comparison && (
                <Card>
                  <CardHeader>
                    <CardTitle>수기 작성 대비 QMSquare 사용 효과</CardTitle>
                    <CardDescription>동일한 SOP 작성 시 예상되는 효과 비교</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3 rounded-lg border border-red-200 bg-red-50/50 p-4">
                        <h4 className="font-semibold text-red-900 flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white text-xs">
                            A
                          </span>
                          수기 작성
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">⏱️ 작성시간:</span>
                            <span className="font-medium text-red-700">
                              {analysisResult.comparison.manual.avg_time_min}분
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-muted-foreground">📋 필수항목:</span>
                            <span className="font-medium text-red-700">
                              {analysisResult.comparison.manual.missing_risk}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-muted-foreground">🔄 재작업률:</span>
                            <span className="font-medium text-red-700">
                              {analysisResult.comparison.manual.rework_risk}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-muted-foreground">✅ 심사준비도:</span>
                            <span className="font-medium text-red-700">
                              {analysisResult.comparison.manual.audit_ready}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 rounded-lg border border-green-200 bg-green-50/50 p-4">
                        <h4 className="font-semibold text-green-900 flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white text-xs">
                            B
                          </span>
                          QMSquare 사용
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">⏱️ 작성시간:</span>
                            <span className="font-medium text-green-700">
                              {analysisResult.comparison.qmsquare.avg_time_min}분
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-muted-foreground">📋 필수항목:</span>
                            <span className="font-medium text-green-700">
                              {analysisResult.comparison.qmsquare.missing_risk}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-muted-foreground">🔄 재작업률:</span>
                            <span className="font-medium text-green-700">
                              {analysisResult.comparison.qmsquare.rework_risk}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-muted-foreground">✅ 심사준비도:</span>
                            <span className="font-medium text-green-700">
                              {analysisResult.comparison.qmsquare.audit_ready}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-sm text-center font-medium">
                        💡 QMSquare는 심사 전에 규제 이슈를 발견하여 재작업 리스크를 최소화합니다
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 규제 심사 핵심 포인트 체크리스트 */}
              {analysisResult.key_points && analysisResult.key_points.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>규제 심사 핵심 포인트</CardTitle>
                    <CardDescription>ISO 13485 / 21 CFR 820 기준 필수 확인 사항</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysisResult.key_points.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary mt-1">✓</span>
                          <span className="text-sm">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* 적용 규제 요구사항 (아코디언) */}
              {analysisResult.requirements && analysisResult.requirements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>적용 규제 요구사항</CardTitle>
                    <CardDescription>문서관리 SOP에 필수적으로 포함되어야 하는 규제 항목</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analysisResult.requirements.map((req, idx) => (
                      <div key={idx} className="rounded-lg border p-4 space-y-2">
                        <h4 className="font-semibold text-sm">{req.title}</h4>
                        <ul className="space-y-1 ml-4">
                          {req.items.map((item, itemIdx) => (
                            <li key={itemIdx} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-primary">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* 발견된 지적사항 상세 카드 */}
              {analysisResult.findings && analysisResult.findings.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>발견된 지적사항</CardTitle>
                    <CardDescription>규제 심사에서 지적될 가능성이 높은 항목</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analysisResult.findings.map((finding, idx) => (
                      <div key={idx} className="rounded-lg border p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <Badge
                            variant={
                              finding.severity === "High"
                                ? "destructive"
                                : finding.severity === "Medium"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {finding.severity}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {finding.category}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <h5 className="font-semibold text-sm mb-1">{finding.title}</h5>
                          </div>
                          <div>
                            <h6 className="text-xs font-semibold text-muted-foreground mb-1">📄 문서 내 문제 구간</h6>
                            <p className="text-sm text-muted-foreground bg-muted p-2 rounded">{finding.evidence}</p>
                          </div>
                          <div>
                            <h6 className="text-xs font-semibold text-muted-foreground mb-1">
                              ⚠️ 심사에서 지적되는 이유
                            </h6>
                            <p className="text-sm text-muted-foreground">{finding.why}</p>
                          </div>
                          <div>
                            <h6 className="text-xs font-semibold text-muted-foreground mb-1">🔧 수정 방법</h6>
                            <ul className="space-y-1 ml-4">
                              {finding.fix.map((fixItem, fixIdx) => (
                                <li key={fixIdx} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-primary">•</span>
                                  <span>{fixItem}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          {finding.recommended_text && (
                            <div className="rounded bg-green-50 border border-green-200 p-3">
                              <h6 className="text-xs font-semibold text-green-900 mb-1">
                                ✅ SOP에 바로 붙여넣을 수 있는 권장 문구
                              </h6>
                              <p className="text-sm font-mono whitespace-pre-wrap">{finding.recommended_text}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
