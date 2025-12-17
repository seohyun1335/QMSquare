"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ClipboardCheck, MoreVertical, Edit, Trash2, Eye } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale/ko"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { deleteQualityRecord } from "@/lib/storage"

interface QualityRecord {
  id: string
  record_type: string
  title: string
  description: string | null
  status: string
  created_at: string
  updated_at: string
}

interface QualityRecordListProps {
  records: QualityRecord[]
  onRefresh?: () => void
}

export function QualityRecordList({ records, onRefresh }: QualityRecordListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleDelete = async (id: string) => {
    setDeletingId(id)

    try {
      deleteQualityRecord(id)

      toast({
        title: "기록 삭제됨",
        description: "품질 기록이 성공적으로 삭제되었습니다.",
      })

      if (onRefresh) onRefresh()
    } catch (error) {
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : "기록 삭제에 실패했습니다",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    return status === "완료" ? "secondary" : "default"
  }

  if (records.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <ClipboardCheck className="h-16 w-16 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold mb-2">아직 품질 기록이 없습니다</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm text-balance">
            첫 기록을 생성하여 품질 이벤트 추적을 시작하세요. CAPA, 일탈, 변경 관리 등을 추적할 수 있습니다.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {records.map((record) => (
        <Card
          key={record.id}
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => router.push(`/quality-records/${record.id}`)}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-100 shrink-0">
                <ClipboardCheck className="h-6 w-6 text-green-600" />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/quality-records/${record.id}`)
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    상세보기
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                    <Edit className="h-4 w-4 mr-2" />
                    수정
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(record.id)
                    }}
                    disabled={deletingId === record.id}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {deletingId === record.id ? "삭제 중..." : "삭제"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-base line-clamp-2 mb-1">{record.title}</h3>
                {record.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{record.description}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  {record.record_type}
                </Badge>
                <Badge variant={getStatusColor(record.status)} className="text-xs">
                  {record.status}
                </Badge>
              </div>

              <div className="text-xs text-muted-foreground pt-2 border-t">
                업데이트: {formatDistanceToNow(new Date(record.updated_at), { addSuffix: true, locale: ko })}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
