"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, Trash2, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getAttachmentsByRecordId, addAttachment, deleteAttachment, addAnalysisResult } from "@/lib/storage"
import { saveFileToIndexedDB, getFileFromIndexedDB, deleteFileFromIndexedDB } from "@/lib/indexeddb"
import { extractTextFromFile, formatFileSize } from "@/lib/file-extractor"
import type { FileAttachment } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale/ko"
import type { AnalysisResult } from "@/lib/types"

interface FileAttachmentSectionProps {
  recordId: string
  onRefresh: () => void
}

export function FileAttachmentSection({ recordId, onRefresh }: FileAttachmentSectionProps) {
  const [attachments, setAttachments] = useState<FileAttachment[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [analyzing, setAnalyzing] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadAttachments()
  }, [recordId])

  const loadAttachments = () => {
    const atts = getAttachmentsByRecordId(recordId)
    setAttachments(atts)
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const allowedTypes = [".txt", ".docx", ".pdf"]
    const fileExt = `.${file.name.split(".").pop()?.toLowerCase()}`
    if (!allowedTypes.includes(fileExt)) {
      toast({
        title: "지원하지 않는 파일 형식",
        description: "txt, docx, pdf 파일만 업로드 가능합니다.",
        variant: "destructive",
      })
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "파일 크기 초과",
        description: "10MB 이하의 파일만 업로드 가능합니다.",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      // 메타데이터 저장
      const newAttachment = addAttachment({
        quality_record_id: recordId,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type || fileExt,
      })

      setUploadProgress(50)

      // IndexedDB에 파일 저장
      await saveFileToIndexedDB(newAttachment.id, file)

      setUploadProgress(100)

      toast({
        title: "파일 업로드 완료",
        description: `${file.name}이(가) 성공적으로 업로드되었습니다.`,
      })

      loadAttachments()
      onRefresh()
    } catch (error) {
      console.error("[v0] 파일 업로드 오류:", error)
      toast({
        title: "업로드 실패",
        description: error instanceof Error ? error.message : "파일 업로드 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      setUploadProgress(0)
      event.target.value = ""
    }
  }

  const handleDelete = async (attachment: FileAttachment) => {
    try {
      await deleteFileFromIndexedDB(attachment.id)
      deleteAttachment(attachment.id)

      toast({
        title: "파일 삭제됨",
        description: `${attachment.file_name}이(가) 삭제되었습니다.`,
      })

      loadAttachments()
      onRefresh()
    } catch (error) {
      toast({
        title: "삭제 실패",
        description: "파일 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  const handleAnalyze = async (attachment: FileAttachment) => {
    setAnalyzing(attachment.id)

    try {
      // IndexedDB에서 파일 가져오기
      const blob = await getFileFromIndexedDB(attachment.id)
      if (!blob) {
        throw new Error("파일을 찾을 수 없습니다.")
      }

      // Blob을 File 객체로 변환
      const file = new File([blob], attachment.file_name, { type: attachment.file_type })

      // 텍스트 추출
      toast({
        title: "분석 시작",
        description: "파일에서 텍스트를 추출하고 있습니다...",
      })

      const extractedText = await extractTextFromFile(file)

      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error("파일에서 텍스트를 추출할 수 없습니다.")
      }

      toast({
        title: "AI 분석 중",
        description: "OpenAI로 문서를 분석하고 있습니다. 잠시만 기다려주세요...",
      })

      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recordType: "품질 기록",
          docType: "첨부 문서",
          text: extractedText,
          language: "ko",
          strictness: "audit",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "AI 분석 요청에 실패했습니다.")
      }

      const aiResult = await response.json()

      const analysisResult: AnalysisResult = {
        id: `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        quality_record_id: recordId,
        file_id: attachment.id,
        ...aiResult,
        created_at: new Date().toISOString(),
      }

      addAnalysisResult(analysisResult)

      toast({
        title: "AI 분석 완료",
        description: `품질 점수: ${aiResult.quality_score}점 | 심사 준비도: ${aiResult.audit_ready}`,
      })

      onRefresh()
    } catch (error) {
      console.error("[v0] 분석 오류:", error)
      toast({
        title: "분석 실패",
        description: error instanceof Error ? error.message : "문서 분석 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setAnalyzing(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          파일 첨부
        </CardTitle>
        <CardDescription>변경관리, CAPA 등의 문서를 첨부하고 AI로 분석하세요</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <input
            type="file"
            id={`file-upload-${recordId}`}
            className="hidden"
            accept=".txt,.docx,.pdf"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          <label htmlFor={`file-upload-${recordId}`} className="cursor-pointer">
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-medium">파일을 드래그하거나 클릭하여 업로드</p>
              <p className="text-xs text-muted-foreground">txt, docx, pdf (최대 10MB)</p>
            </div>
          </label>
        </div>

        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>업로드 중...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}

        {attachments.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">첨부된 파일 ({attachments.length})</h4>
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{attachment.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(attachment.file_size)} •{" "}
                      {formatDistanceToNow(new Date(attachment.uploaded_at), { addSuffix: true, locale: ko })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAnalyze(attachment)}
                    disabled={analyzing === attachment.id}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {analyzing === attachment.id ? "분석 중..." : "AI 분석"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(attachment)}
                    disabled={analyzing === attachment.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {attachments.length === 0 && !uploading && (
          <div className="text-center py-6 text-sm text-muted-foreground">아직 첨부된 파일이 없습니다</div>
        )}
      </CardContent>
    </Card>
  )
}
