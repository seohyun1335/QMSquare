"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Upload } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { addDocument } from "@/lib/storage"
import { saveFileToIndexedDB, getFileFromIndexedDB } from "@/lib/indexeddb"

interface NewDocumentDialogProps {
  onSuccess?: () => void
}

export function NewDocumentDialog({ onSuccess }: NewDocumentDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [documentType, setDocumentType] = useState("")
  const [version, setVersion] = useState("1.0")
  const [status, setStatus] = useState("draft")
  const [file, setFile] = useState<File | null>(null)

  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let fileId: string | null = null

      if (file) {
        fileId = generateId()
        console.log("[v0] 파일 저장 시작 - ID:", fileId, "파일명:", file.name)

        try {
          await saveFileToIndexedDB(fileId, file)
          console.log("[v0] 파일 저장 성공")

          const retrievedBlob = await getFileFromIndexedDB(fileId)
          if (retrievedBlob) {
            console.log("[v0] 파일 검증 성공:", retrievedBlob.size, "bytes")
          } else {
            console.error("[v0] 파일 검증 실패")
          }
        } catch (fileError) {
          console.error("[v0] 파일 저장 실패:", fileError)
          toast({
            title: "파일 저장 실패",
            description: "파일을 저장할 수 없습니다. 문서만 생성됩니다.",
            variant: "destructive",
          })
          fileId = null
        }
      }

      console.log("[v0] 문서 생성 시작 - 제목:", title, "타입:", documentType)

      const newDoc = addDocument({
        title,
        description: description || null,
        document_type: documentType,
        version,
        status,
        file_url: file ? `file://${file.name}` : null,
        file_name: file?.name || null,
        file_size: file?.size || null,
        file_id: fileId,
      })

      console.log("[v0] ===== 문서 생성 완료 =====")
      console.log("[v0] 생성된 문서 ID:", newDoc.id)
      console.log("[v0] 문서 제목:", newDoc.title)
      console.log("[v0] 문서 타입:", newDoc.document_type)
      console.log("[v0] file_id:", newDoc.file_id)
      console.log("[v0] =============================")

      toast({
        title: "문서 생성됨",
        description: `"${newDoc.title}" 문서가 생성되었습니다.`,
      })

      setOpen(false)
      resetForm()

      if (onSuccess) {
        console.log("[v0] onSuccess 콜백 실행 - 목록 새로고침")
        onSuccess()
      } else {
        console.warn("[v0] onSuccess 콜백이 제공되지 않음")
      }
    } catch (error) {
      console.error("[v0] 문서 생성 오류:", error)
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : "문서 생성에 실패했습니다",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setDocumentType("")
    setVersion("1.0")
    setStatus("draft")
    setFile(null)
  }

  const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />새 문서
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>새 문서 생성</DialogTitle>
            <DialogDescription>품질 관리 시스템에 새 문서를 추가하세요.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">문서 제목 *</Label>
              <Input
                id="title"
                placeholder="문서 제목을 입력하세요"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                placeholder="문서에 대한 간단한 설명"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="document-type">문서 유형 *</Label>
                <Select value={documentType} onValueChange={setDocumentType} required>
                  <SelectTrigger id="document-type">
                    <SelectValue placeholder="유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SOP">SOP</SelectItem>
                    <SelectItem value="Work Instruction">작업 지침서</SelectItem>
                    <SelectItem value="Quality Manual">품질 매뉴얼</SelectItem>
                    <SelectItem value="Form">양식</SelectItem>
                    <SelectItem value="Policy">정책</SelectItem>
                    <SelectItem value="Procedure">절차</SelectItem>
                    <SelectItem value="Record">기록</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">상태 *</Label>
                <Select value={status} onValueChange={setStatus} required>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="상태 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">초안</SelectItem>
                    <SelectItem value="review">검토중</SelectItem>
                    <SelectItem value="approved">승인완료</SelectItem>
                    <SelectItem value="archived">보관됨</SelectItem>
                    <SelectItem value="obsolete">폐기됨</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="version">버전</Label>
              <Input id="version" placeholder="1.0" value={version} onChange={(e) => setVersion(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="file">파일 첨부 (선택사항)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="cursor-pointer"
                />
                <Upload className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">지원 형식: PDF, DOC, DOCX, XLS, XLSX</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              취소
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "생성 중..." : "문서 생성"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
