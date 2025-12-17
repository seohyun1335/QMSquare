import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ClipboardCheck, Plus } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale/ko"

interface QualityRecord {
  id: string
  title: string
  record_type: string
  status: string
  priority: string
  created_at: string
}

interface RecentQualityRecordsProps {
  records: QualityRecord[]
}

export function RecentQualityRecords({ records }: RecentQualityRecordsProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "default"
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>최근 품질 기록</CardTitle>
        <Button asChild size="sm" className="gap-1">
          <Link href="/quality-records">
            <Plus className="h-4 w-4" />
            새로 만들기
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ClipboardCheck className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-sm text-muted-foreground">아직 품질 기록이 없습니다</p>
            <Button asChild variant="link" size="sm" className="mt-2">
              <Link href="/quality-records">첫 기록 생성하기</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <div key={record.id} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 shrink-0">
                  <ClipboardCheck className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none mb-1 truncate">{record.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">{record.record_type}</p>
                    <Badge variant={getPriorityColor(record.priority)} className="text-xs">
                      {record.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(record.created_at), { addSuffix: true, locale: ko })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
