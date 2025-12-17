"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileText, MoreVertical, Download, Edit, Trash2, Sparkles } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale/ko"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { deleteDocument } from "@/lib/storage"
import type { Document } from "@/lib/types"
import Link from "next/link"

interface DocumentListProps {
  documents: Document[]
  onRefresh?: () => void
}

export function DocumentList({ documents, onRefresh }: DocumentListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToast()

  const handleDelete = async (id: string) => {
    setDeletingId(id)

    try {
      deleteDocument(id)

      toast({
        title: "문서 삭제됨",
        description: "문서가 성공적으로 삭제되었습니다.",
      })

      onRefresh?.()
    } catch (error) {
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : "문서 삭제에 실패했습니다",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "default"
      case "review":
        return "secondary"
      case "draft":
        return "outline"
      case "archived":
        return "secondary"
      default:
        return "outline"
    }
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "N/A"
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(1)} KB`
    return `${(kb / 1024).toFixed(1)} MB`
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FileText className="h-16 w-16 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold mb-2">아직 문서가 없습니다</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm text-balance">
            첫 문서를 생성해보세요. SOP, 작업 지침서, 품질 매뉴얼 등을 업로드할 수 있습니다.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {documents.map((doc) => (
        <Card key={doc.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 shrink-0">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {doc.file_url && (
                    <DropdownMenuItem asChild>
                      <a href={doc.file_url} download target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" />
                        다운로드
                      </a>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    수정
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDelete(doc.id)}
                    disabled={deletingId === doc.id}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {deletingId === doc.id ? "삭제 중..." : "삭제"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Link href={`/documents/${doc.id}`} className="block space-y-3">
              <div>
                <h3 className="font-semibold text-base line-clamp-2 mb-1 hover:text-primary transition-colors">
                  {doc.title}
                </h3>
                {doc.description && <p className="text-sm text-muted-foreground line-clamp-2">{doc.description}</p>}
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  {doc.document_type}
                </Badge>
                <Badge variant={getStatusColor(doc.status)} className="text-xs">
                  {doc.status}
                </Badge>
                {doc.version && (
                  <Badge variant="secondary" className="text-xs">
                    v{doc.version}
                  </Badge>
                )}
              </div>

              {doc.file_name && (
                <div className="text-xs text-muted-foreground">
                  <p className="truncate">{doc.file_name}</p>
                  <p>{formatFileSize(doc.file_size)}</p>
                </div>
              )}

              <div className="text-xs text-muted-foreground pt-2 border-t">
                업데이트: {formatDistanceToNow(new Date(doc.updated_at), { addSuffix: true, locale: ko })}
              </div>
            </Link>

            <div className="mt-4 pt-4 border-t">
              <Link href={`/documents/${doc.id}`}>
                <Button className="w-full bg-transparent" size="sm" variant="outline">
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI 심사 시작
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
