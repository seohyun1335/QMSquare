"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle2,
  FileSearch,
  Loader2,
  BookOpen,
  AlertTriangle,
  Info,
  Clock,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface ApplicableRequirement {
  category: string
  explain: string
}

interface Issue {
  severity: "High" | "Medium" | "Low"
  requirement_category: string
  problem: string
  evidence_in_text: string
  why_it_fails_in_audit: string
  how_to_fix: string[]
  recommended_wording: string
}

interface PatchedSection {
  section: string
  before: string
  after: string
}

interface QMSAnalysisResult {
  regulatory_summary: {
    what_matters_in_audit: string[]
    applicable_requirements: ApplicableRequirement[]
  }
  issues: Issue[]
  rewrite_proposal: {
    patched_sections: PatchedSection[]
    final_checklist: string[]
  }
}

const documentTypes = [
  { value: "SOP", label: "표준 작업 절차서 (SOP)" },
  { value: "WI", label: "작업 지침서 (WI)" },
  { value: "QM", label: "품질 매뉴얼 (QM)" },
  { value: "DHF", label: "설계 이력 파일 (DHF)" },
  { value: "DMR", label: "장치 주 기록 (DMR)" },
  { value: "CAPA", label: "시정 및 예방 조치 (CAPA)" },
  { value: "Risk", label: "위험 관리 보고서" },
  { value: "Validation", label: "밸리데이션 보고서" },
]

export function AIDocumentReview() {
  const [docType, setDocType] = useState("SOP")
  const [documentText, setDocumentText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<QMSAnalysisResult | null>(null)
  const { toast } = useToast()

  const handleAnalyze = async () => {
    if (!documentText.trim()) {
      toast({
        title: "입력 필요",
        description: "분석할 문서 내용을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    setAnalysisResult(null)

    try {
      const response = await fetch("/api/documents/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          docType,
          text: documentText,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "분석 실패")
      }

      const result = await response.json()
      setAnalysisResult(result)

      toast({
        title: "분석 완료",
        description: `${result.issues.length}개의 지적사항을 발견했습니다.`,
      })
    } catch (error) {
      console.error("분석 오류:", error)
      toast({
        title: "분석 실패",
        description: error instanceof Error ? error.message : "문서 분석 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "High":
        return <Badge variant="destructive">High</Badge>
      case "Medium":
        return <Badge className="bg-orange-500">Medium</Badge>
      case "Low":
        return <Badge variant="secondary">Low</Badge>
      default:
        return <Badge variant="outline">{severity}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSearch className="h-5 w-5" />
          AI 문서 심사 준비 분석
        </CardTitle>
        <CardDescription>
          의료기기 QMS 전문 AI가 ISO 13485 및 21 CFR 820 기준으로 문서를 심사하고 개선안을 제공합니다
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 문서 유형 선택 */}
        <div className="space-y-2">
          <Label htmlFor="docType">문서 유형</Label>
          <Select value={docType} onValueChange={setDocType}>
            <SelectTrigger id="docType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {documentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 문서 내용 입력 */}
        <div className="space-y-2">
          <Label htmlFor="documentText">문서 내용</Label>
          <Textarea
            id="documentText"
            placeholder="분석할 문서 내용을 입력하거나 붙여넣기 하세요..."
            value={documentText}
            onChange={(e) => setDocumentText(e.target.value)}
            rows={12}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            {documentText.length} 글자{" "}
            {documentText.length > 0 && `· 약 ${Math.ceil(documentText.length / 500)}분 분석 예상`}
          </p>
        </div>

        {/* 분석 버튼 */}
        <Button onClick={handleAnalyze} disabled={isAnalyzing || !documentText.trim()} className="w-full" size="lg">
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              AI가 문서를 분석하는 중...
            </>
          ) : (
            <>
              <FileSearch className="w-4 h-4 mr-2" />
              AI 심사 시작
            </>
          )}
        </Button>

        {analysisResult && (
          <div className="space-y-6 pt-6 border-t">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">수기 작성 대비 QMSquare 사용 효과</h3>
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">AI 분석 기반 비교</Badge>
              </div>

              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* 좌측: 수기 작성 */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <h4 className="font-semibold text-gray-900">수기 작성</h4>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                          <Clock className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">평균 문서 작성 시간</p>
                            <p className="text-lg font-bold text-red-600">약 120분</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">필수 항목 누락</p>
                            <p className="text-sm font-semibold text-red-600">다수 누락 가능</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                          <TrendingUp className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">재작업 발생 가능성</p>
                            <p className="text-sm font-semibold text-red-600">높음</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                          <ShieldCheck className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">심사 준비도</p>
                            <p className="text-sm font-semibold text-red-600">낮음 / 불확실</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 우측: QMSquare 사용 */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <h4 className="font-semibold text-gray-900">QMSquare 사용</h4>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
                          <Clock className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">평균 문서 작성 시간</p>
                            <p className="text-lg font-bold text-green-600">약 35분</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
                          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">필수 항목 누락</p>
                            <p className="text-sm font-semibold text-green-600">템플릿 기반 자동 점검</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
                          <TrendingUp className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">재작업 발생 가능성</p>
                            <p className="text-sm font-semibold text-green-600">낮음</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
                          <ShieldCheck className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">심사 준비도</p>
                            <p className="text-sm font-semibold text-green-600">높음 / 즉시 대응 가능</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 하단 요약 문구 */}
                  <div className="mt-6 pt-6 border-t border-blue-200 space-y-2 text-center">
                    <p className="text-sm font-semibold text-blue-900">
                      QMSquare는 문서 작성 단계에서부터 심사 리스크를 줄여줍니다.
                    </p>
                    <p className="text-xs text-blue-700">
                      아래 규제 심사 핵심 포인트는 AI가 자동으로 점검한 항목입니다.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 규제 요약 */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                규제 심사 핵심 포인트
              </h3>
              <div className="grid gap-3">
                {analysisResult.regulatory_summary.what_matters_in_audit.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                    <span className="text-sm text-blue-900">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 적용 요구사항 */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">적용 규제 요구사항</h3>
              <Accordion type="single" collapsible className="w-full">
                {analysisResult.regulatory_summary.applicable_requirements.map((req, idx) => (
                  <AccordionItem key={idx} value={`req-${idx}`}>
                    <AccordionTrigger className="text-sm font-medium">{req.category}</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">{req.explain}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* 발견된 지적사항 */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                발견된 지적사항 ({analysisResult.issues.length}건)
              </h3>

              {analysisResult.issues.map((issue, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-2 ${
                    issue.severity === "High"
                      ? "bg-red-50 border-red-300"
                      : issue.severity === "Medium"
                        ? "bg-orange-50 border-orange-300"
                        : "bg-yellow-50 border-yellow-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getSeverityBadge(issue.severity)}
                        <Badge variant="outline" className="text-xs">
                          {issue.requirement_category}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-base">{issue.problem}</h4>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium text-gray-700 mb-1">문서 내 문제 구간:</p>
                      <p className="text-gray-600 italic bg-white p-2 rounded border">{issue.evidence_in_text}</p>
                    </div>

                    <div>
                      <p className="font-medium text-gray-700 mb-1">심사에서 지적되는 이유:</p>
                      <p className="text-gray-600">{issue.why_it_fails_in_audit}</p>
                    </div>

                    <div>
                      <p className="font-medium text-gray-700 mb-2">수정 방법:</p>
                      <ul className="space-y-1 ml-4">
                        {issue.how_to_fix.map((fix, fixIdx) => (
                          <li key={fixIdx} className="text-gray-600 flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                            <span>{fix}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white p-3 rounded border-2 border-green-300">
                      <p className="font-medium text-green-800 mb-1 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        권장 문구 (바로 적용 가능):
                      </p>
                      <p className="text-gray-700 whitespace-pre-line">{issue.recommended_wording}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 개선 제안 */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">섹션별 개선 제안</h3>
              {analysisResult.rewrite_proposal.patched_sections.map((section, idx) => (
                <div key={idx} className="p-4 rounded-lg border bg-gray-50">
                  <h4 className="font-semibold text-blue-900 mb-3">{section.section}</h4>
                  {section.before && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-600 mb-1">개선 전:</p>
                      <p className="text-sm text-gray-700 bg-red-50 p-2 rounded border border-red-200">
                        {section.before}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">개선 후:</p>
                    <p className="text-sm text-gray-900 bg-green-50 p-2 rounded border border-green-200 whitespace-pre-line">
                      {section.after}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* 최종 체크리스트 */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">심사 통과 필수 체크리스트</h3>
              <div className="space-y-2">
                {analysisResult.rewrite_proposal.final_checklist.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 rounded hover:bg-gray-50">
                    <input type="checkbox" className="mt-1" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
