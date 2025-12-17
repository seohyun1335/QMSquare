"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Calculator, Download } from "lucide-react"

interface ROICalculatorProps {
  snapshots: any[]
}

export function ROICalculator({ snapshots }: ROICalculatorProps) {
  const [monthlyDocs, setMonthlyDocs] = useState(20)
  const [hourlyRate, setHourlyRate] = useState(30000)
  const [manualTime, setManualTime] = useState(120)
  const [qmsquareTime, setQmsquareTime] = useState(35)

  // ROI 계산
  const timeSavingPerDoc = manualTime - qmsquareTime // 분
  const monthlySavingMinutes = timeSavingPerDoc * monthlyDocs
  const monthlySavingHours = Math.round(monthlySavingMinutes / 60)
  const monthlyCostSaving = Math.round((monthlySavingHours * hourlyRate) / 1000) * 1000 // 천원 단위
  const yearlyCostSaving = monthlyCostSaving * 12

  const handleExportPDF = () => {
    // PDF 내보내기 기능 (추후 구현)
    alert("PDF 내보내기 기능은 곧 제공될 예정입니다.")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              ROI 계산기
            </CardTitle>
            <CardDescription>비용 절감 효과 및 투자 대비 효율성 산출</CardDescription>
          </div>
          <Button onClick={handleExportPDF} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            PDF 내보내기
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* 입력 섹션 */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="monthly-docs">월간 작성 문서 수</Label>
              <div className="flex items-center gap-4 mt-2">
                <Slider
                  id="monthly-docs"
                  min={5}
                  max={100}
                  step={5}
                  value={[monthlyDocs]}
                  onValueChange={(value) => setMonthlyDocs(value[0])}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={monthlyDocs}
                  onChange={(e) => setMonthlyDocs(Number(e.target.value))}
                  className="w-20"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="hourly-rate">시간당 인건비 (원)</Label>
              <Input
                id="hourly-rate"
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="manual-time">수기 작성 시간 (분)</Label>
              <div className="flex items-center gap-4 mt-2">
                <Slider
                  id="manual-time"
                  min={30}
                  max={240}
                  step={5}
                  value={[manualTime]}
                  onValueChange={(value) => setManualTime(value[0])}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={manualTime}
                  onChange={(e) => setManualTime(Number(e.target.value))}
                  className="w-20"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="qmsquare-time">QMSquare 작성 시간 (분)</Label>
              <div className="flex items-center gap-4 mt-2">
                <Slider
                  id="qmsquare-time"
                  min={10}
                  max={120}
                  step={5}
                  value={[qmsquareTime]}
                  onValueChange={(value) => setQmsquareTime(value[0])}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={qmsquareTime}
                  onChange={(e) => setQmsquareTime(Number(e.target.value))}
                  className="w-20"
                />
              </div>
            </div>
          </div>

          {/* 결과 섹션 */}
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-600 font-medium mb-1">문서당 시간 절감</div>
              <div className="text-3xl font-bold text-blue-900">{timeSavingPerDoc}분</div>
              <div className="text-xs text-blue-600 mt-1">
                {Math.round((timeSavingPerDoc / manualTime) * 100)}% 효율 향상
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm text-green-600 font-medium mb-1">월간 시간 절감</div>
              <div className="text-3xl font-bold text-green-900">{monthlySavingHours}시간</div>
              <div className="text-xs text-green-600 mt-1">{monthlySavingMinutes}분</div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="text-sm text-purple-600 font-medium mb-1">월간 비용 절감</div>
              <div className="text-3xl font-bold text-purple-900">{monthlyCostSaving.toLocaleString()}원</div>
              <div className="text-xs text-purple-600 mt-1">인건비 절감 효과</div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="text-sm text-orange-600 font-medium mb-1">연간 비용 절감</div>
              <div className="text-3xl font-bold text-orange-900">{yearlyCostSaving.toLocaleString()}원</div>
              <div className="text-xs text-orange-600 mt-1">매출 지연 리스크 감소 포함</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
