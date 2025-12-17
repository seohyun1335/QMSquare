import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, ClipboardCheck, TrendingUp, AlertCircle } from "lucide-react"

interface DashboardStatsProps {
  documentsCount: number
  qualityRecordsCount: number
}

export function DashboardStats({ documentsCount, qualityRecordsCount }: DashboardStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">전체 문서</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{documentsCount}</div>
          <p className="text-xs text-muted-foreground">시스템 내 문서</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">품질 기록</CardTitle>
          <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{qualityRecordsCount}</div>
          <p className="text-xs text-muted-foreground">추적 중인 기록</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">규정 준수율</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">98%</div>
          <p className="text-xs text-muted-foreground">지난달 대비 +2%</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">대기 중인 작업</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">3</div>
          <p className="text-xs text-muted-foreground">조치 필요</p>
        </CardContent>
      </Card>
    </div>
  )
}
