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
import { Plus } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { addQualityRecord } from "@/lib/storage"

interface NewQualityRecordDialogProps {
  onSuccess?: () => void
}

export function NewQualityRecordDialog({ onSuccess }: NewQualityRecordDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [recordType, setRecordType] = useState("")
  const [status, setStatus] = useState("open")
  const [priority, setPriority] = useState("medium")

  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      addQualityRecord({
        title,
        description: description || null,
        record_type: recordType,
        status,
        priority,
      })

      toast({
        title: "품질 기록 생성됨",
        description: "품질 기록이 성공적으로 생성되었습니다.",
      })

      setOpen(false)
      resetForm()
      onSuccess?.()
    } catch (error) {
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : "품질 기록 생성에 실패했습니다",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setRecordType("")
    setStatus("open")
    setPriority("medium")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />새 기록
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>품질 기록 생성</DialogTitle>
            <DialogDescription>이슈 및 개선 사항을 추적하기 위한 새 품질 기록을 추가하세요.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">제목 *</Label>
              <Input
                id="title"
                placeholder="기록 제목을 입력하세요"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                placeholder="품질 이벤트에 대한 상세 설명"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="record-type">기록 유형 *</Label>
                <Select value={recordType} onValueChange={setRecordType} required>
                  <SelectTrigger id="record-type">
                    <SelectValue placeholder="유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CAPA">CAPA</SelectItem>
                    <SelectItem value="Deviation">일탈</SelectItem>
                    <SelectItem value="Change Control">변경 관리</SelectItem>
                    <SelectItem value="Audit">심사</SelectItem>
                    <SelectItem value="Complaint">불만</SelectItem>
                    <SelectItem value="Risk Assessment">위험 평가</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priority">우선순위 *</Label>
                <Select value={priority} onValueChange={setPriority} required>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="우선순위 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">낮음</SelectItem>
                    <SelectItem value="medium">보통</SelectItem>
                    <SelectItem value="high">높음</SelectItem>
                    <SelectItem value="critical">긴급</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">상태 *</Label>
              <Select value={status} onValueChange={setStatus} required>
                <SelectTrigger id="status">
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">열림</SelectItem>
                  <SelectItem value="in_progress">진행중</SelectItem>
                  <SelectItem value="resolved">해결됨</SelectItem>
                  <SelectItem value="closed">닫힘</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              취소
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "생성 중..." : "기록 생성"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
