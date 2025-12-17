"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle2, XCircle, Play, FileCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { addQualityCheck } from "@/lib/storage"

// 품질 체크리스트 항목
const qualityChecklistItems = [
  { id: 1, label: "제목 및 문서번호 기재", category: "basic", weight: 5 },
  { id: 2, label: "작성자/검토자/승인자 서명", category: "basic", weight: 10 },
  { id: 3, label: "작성일자 및 유효일자 기재", category: "basic", weight: 5 },
  { id: 4, label: "개정 이력 기록", category: "basic", weight: 5 },
  { id: 5, label: "버전 번호 표기", category: "basic", weight: 5 },
  { id: 6, label: "목적 및 범위 명시", category: "content", weight: 5 },
  { id: 7, label: "관련 규정 참조", category: "content", weight: 5 },
  { id: 8, label: "절차 단계별 상세 기술", category: "content", weight: 10 },
  { id: 9, label: "책임과 권한 명시", category: "content", weight: 5 },
  { id: 10, label: "기록 및 보관 방법", category: "content", weight: 5 },
  { id: 11, label: "용어 정의 및 약어 설명", category: "format", weight: 5 },
  { id: 12, label: "표, 그림 번호 및 캡션", category: "format", weight: 5 },
  { id: 13, label: "페이지 번호 및 총 페이지 수", category: "format", weight: 5 },
  { id: 14, label: "참고문헌 및 첨부 문서", category: "format", weight: 5 },
  { id: 15, label: "문서 분류 및 보안 등급", category: "format", weight: 5 },
  { id: 16, label: "문법 및 맞춤법 오류 없음", category: "quality", weight: 5 },
  { id: 17, label: "일관된 용어 사용", category: "quality", weight: 5 },
  { id: 18, label: "명확하고 간결한 문장", category: "quality", weight: 5 },
  { id: 19, label: "ISO/FDA 규정 준수", category: "compliance", weight: 10 },
  { id: 20, label: "변경 사항 추적 가능", category: "compliance", weight: 5 },
]

export function QualityCheckCard() {
  const [checkMode, setCheckMode] = useState<"manual" | "qmsquare">("qmsquare")
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({})
  const [isChecking, setIsChecking] = useState(false)
  const [checkResult, setCheckResult] = useState<any>(null)

  const { toast } = useToast()
  const router = useRouter()

  const handleCheckItem = (itemId: number, checked: boolean) => {
    setCheckedItems({ ...checkedItems, [itemId]: checked })
  }

  const runQualityCheck = async () => {
    setIsChecking(true)

    // QMSquare 모드는 자동으로 대부분 통과
    if (checkMode === "qmsquare") {
      setTimeout(() => {
        const autoCheckedItems: Record<number, boolean> = {}
        qualityChecklistItems.forEach((item) => {
          // QMSquare는 85~95% 통과율
          autoCheckedItems[item.id] = Math.random() > 0.1
        })
        setCheckedItems(autoCheckedItems)
        calculateResult(autoCheckedItems)
        setIsChecking(false)
      }, 2000)
    } else {
      // 수기 모드는 사용자가 직접 체크하거나 자동으로 랜덤하게
      setTimeout(() => {
        const autoCheckedItems: Record<number, boolean> = {}
        qualityChecklistItems.forEach((item) => {
          // 수기는 60~75% 통과율
          autoCheckedItems[item.id] = Math.random() > 0.35
        })
        setCheckedItems(autoCheckedItems)
        calculateResult(autoCheckedItems)
        setIsChecking(false)
      }, 2000)
    }
  }

  const calculateResult = async (items: Record<number, boolean>) => {
    const totalItems = qualityChecklistItems.length
    const passedItems = Object.values(items).filter((v) => v).length
    const failedItems = totalItems - passedItems

    // 가중치 기반 점수 계산
    let totalWeight = 0
    let passedWeight = 0
    qualityChecklistItems.forEach((item) => {
      totalWeight += item.weight
      if (items[item.id]) {
        passedWeight += item.weight
      }
    })

    const qualityScore = Math.round((passedWeight / totalWeight) * 100)
    const auditReadyScore = Math.max(0, qualityScore - Math.floor(Math.random() * 10))

    // 실패한 항목들
    const defects = qualityChecklistItems
      .filter((item) => !items[item.id])
      .map((item) => ({
        item: item.label,
        severity: item.weight >= 10 ? "high" : item.weight >= 5 ? "medium" : "low",
      }))

    const result = {
      totalItems,
      passedItems,
      failedItems,
      qualityScore,
      auditReadyScore,
      defects,
    }

    setCheckResult(result)

    // 데이터베이스에 저장
    try {
      const checklist = qualityChecklistItems.map((item) => ({
        id: item.id,
        label: item.label,
        passed: items[item.id] || false,
        weight: item.weight,
      }))

      addQualityCheck({
        check_mode: checkMode,
        total_items: totalItems,
        passed_items: passedItems,
        failed_items: failedItems,
        quality_score: qualityScore,
        defects: defects,
        checklist: checklist,
        audit_ready_score: auditReadyScore,
      })

      toast({
        title: "품질 체크 완료",
        description: `품질 점수: ${qualityScore}점, Audit 준비도: ${auditReadyScore}점`,
      })

      router.refresh()
    } catch (error) {
      console.error("품질 체크 저장 실패:", error)
      toast({
        title: "오류",
        description: "품질 체크 결과 저장에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  const passedCount = Object.values(checkedItems).filter((v) => v).length
  const totalCount = qualityChecklistItems.length
  const progressPercent = totalCount > 0 ? (passedCount / totalCount) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              문서 품질 체크
            </CardTitle>
            <CardDescription>체크리스트 기반 문서 품질 평가 및 결함 검출</CardDescription>
          </div>
          <Select value={checkMode} onValueChange={(value: "manual" | "qmsquare") => setCheckMode(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">수기 문서</SelectItem>
              <SelectItem value="qmsquare">QMSquare 문서</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={runQualityCheck} disabled={isChecking} className="flex-1">
            <Play className="w-4 h-4 mr-2" />
            {isChecking ? "품질 체크 중..." : "품질 체크 시작"}
          </Button>
        </div>

        {/* 진행률 */}
        {Object.keys(checkedItems).length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>진행률</span>
              <span className="font-medium">
                {passedCount} / {totalCount} 항목 통과
              </span>
            </div>
            <Progress value={progressPercent} />
          </div>
        )}

        {/* 체크리스트 */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {qualityChecklistItems.map((item) => (
            <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5">
              <Checkbox
                id={`item-${item.id}`}
                checked={checkedItems[item.id] || false}
                onCheckedChange={(checked) => handleCheckItem(item.id, checked as boolean)}
                disabled={isChecking}
              />
              <div className="flex-1">
                <Label htmlFor={`item-${item.id}`} className="cursor-pointer font-normal">
                  {item.label}
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">가중치: {item.weight}</span>
                </div>
              </div>
              {checkedItems[item.id] !== undefined && (
                <div>
                  {checkedItems[item.id] ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 결과 표시 */}
        {checkResult && (
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-lg">품질 체크 결과</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm text-blue-600 font-medium mb-1">품질 점수</div>
                <div className="text-3xl font-bold text-blue-900">{checkResult.qualityScore}점</div>
                <div className="text-xs text-blue-600 mt-1">100점 만점</div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-sm text-green-600 font-medium mb-1">Audit 준비도</div>
                <div className="text-3xl font-bold text-green-900">{checkResult.auditReadyScore}점</div>
                <div className="text-xs text-green-600 mt-1">심사 준비 수준</div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="text-sm text-orange-600 font-medium mb-1">검출된 결함</div>
                <div className="text-3xl font-bold text-orange-900">{checkResult.failedItems}건</div>
                <div className="text-xs text-orange-600 mt-1">{checkResult.passedItems}건 통과</div>
              </div>
            </div>

            {/* 결함 목록 */}
            {checkResult.defects.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  검출된 결함 항목
                </h4>
                <div className="space-y-2">
                  {checkResult.defects.map((defect: any, index: number) => (
                    <div key={index} className="flex items-start gap-2 p-2 rounded border bg-orange-50/50">
                      <Badge
                        variant={defect.severity === "high" ? "destructive" : "secondary"}
                        className="text-xs mt-0.5"
                      >
                        {defect.severity === "high" ? "높음" : defect.severity === "medium" ? "보통" : "낮음"}
                      </Badge>
                      <span className="text-sm">{defect.item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
