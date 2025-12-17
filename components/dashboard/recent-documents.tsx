import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Plus } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale/ko"

interface Document {
  id: string
  title: string
  document_type: string
  status: string
  version: string
  created_at: string
}

interface RecentDocumentsProps {
  documents: Document[]
}

export function RecentDocuments({ documents }: RecentDocumentsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>최근 문서</CardTitle>
        <Button asChild size="sm" className="gap-1">
          <Link href="/documents">
            <Plus className="h-4 w-4" />
            새로 만들기
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-sm text-muted-foreground">아직 문서가 없습니다</p>
            <Button asChild variant="link" size="sm" className="mt-2">
              <Link href="/documents">첫 문서 생성하기</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 shrink-0">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none mb-1 truncate">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.document_type} • v{doc.version} • {doc.status}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true, locale: ko })}
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
