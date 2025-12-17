"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Square, Clock, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { addWorkTimeLog, updateWorkTimeLog } from "@/lib/storage"

export function WorkTimerWidget() {
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [workMode, setWorkMode] = useState<"manual" | "qmsquare">("qmsquare")
  const [taskType, setTaskType] = useState("document_creation")
  const [taskTitle, setTaskTitle] = useState("")
  const [eventLog, setEventLog] = useState<any[]>([])
  const [currentLogId, setCurrentLogId] = useState<string | null>(null)

  const { toast } = useToast()

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && !isPaused && startTime) {
      interval = setInterval(() => {
        const now = new Date()
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000)
        setElapsedTime(elapsed)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, isPaused, startTime])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleStart = async () => {
    if (!taskTitle.trim()) {
      toast({
        title: "오류",
        description: "작업 제목을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    const now = new Date()
    setIsRunning(true)
    setIsPaused(false)
    setStartTime(now)
    setElapsedTime(0)
    setEventLog([{ type: "start", timestamp: now.toISOString() }])

    try {
      const log = addWorkTimeLog({
        work_mode: workMode,
        task_type: taskType,
        task_title: taskTitle,
        start_time: now.toISOString(),
        status: "in_progress",
        event_log: [{ type: "start", timestamp: now.toISOString() }],
      })

      setCurrentLogId(log.id)

      toast({
        title: "작업 시작",
        description: "작업 시간 측정이 시작되었습니다.",
      })
    } catch (error) {
      console.error("작업 로그 생성 실패:", error)
      toast({
        title: "오류",
        description: "작업 로그 생성에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  const handlePause = async () => {
    setIsPaused(!isPaused)
    const event = {
      type: isPaused ? "resume" : "pause",
      timestamp: new Date().toISOString(),
      elapsed_seconds: elapsedTime,
    }
    const newEventLog = [...eventLog, event]
    setEventLog(newEventLog)

    if (currentLogId) {
      updateWorkTimeLog(currentLogId, { event_log: newEventLog })
    }

    toast({
      title: isPaused ? "작업 재개" : "작업 일시정지",
      description: isPaused ? "작업이 재개되었습니다." : "작업이 일시정지되었습니다.",
    })
  }

  const handleStop = async () => {
    const endTime = new Date()
    const event = { type: "stop", timestamp: endTime.toISOString(), elapsed_seconds: elapsedTime }
    const finalEventLog = [...eventLog, event]

    if (currentLogId) {
      try {
        updateWorkTimeLog(currentLogId, {
          end_time: endTime.toISOString(),
          status: "completed",
          event_log: finalEventLog,
        })

        toast({
          title: "작업 완료",
          description: `총 작업 시간: ${formatTime(elapsedTime)}`,
        })
      } catch (error) {
        console.error("작업 로그 업데이트 실패:", error)
      }
    }

    setIsRunning(false)
    setIsPaused(false)
    setElapsedTime(0)
    setStartTime(null)
    setTaskTitle("")
    setEventLog([])
    setCurrentLogId(null)
  }

  const logEvent = async (eventType: string, description: string) => {
    const event = {
      type: eventType,
      description,
      timestamp: new Date().toISOString(),
      elapsed_seconds: elapsedTime,
    }
    const newEventLog = [...eventLog, event]
    setEventLog(newEventLog)

    if (currentLogId) {
      updateWorkTimeLog(currentLogId, { event_log: newEventLog })
    }

    toast({
      title: "이벤트 기록",
      description: `${description}이(가) 기록되었습니다.`,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          작업 시간 측정
        </CardTitle>
        <CardDescription>문서 작업 시간을 측정하고 효율성을 기록합니다</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="work-mode">작업 모드</Label>
            <Select
              value={workMode}
              onValueChange={(value: "manual" | "qmsquare") => setWorkMode(value)}
              disabled={isRunning}
            >
              <SelectTrigger id="work-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">수기 작성</SelectItem>
                <SelectItem value="qmsquare">QMSquare 사용</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="task-type">작업 유형</Label>
            <Select value={taskType} onValueChange={setTaskType} disabled={isRunning}>
              <SelectTrigger id="task-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="document_creation">문서 작성</SelectItem>
                <SelectItem value="review">검토</SelectItem>
                <SelectItem value="approval">승인</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="task-title">작업 제목</Label>
          <Input
            id="task-title"
            placeholder="예: SOP-001 문서 작성"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            disabled={isRunning}
          />
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 text-center">
          <div className="text-5xl font-bold text-blue-900 font-mono">{formatTime(elapsedTime)}</div>
          <div className="text-sm text-blue-600 mt-2">
            {isRunning ? (isPaused ? "일시정지됨" : "작업 중") : "대기 중"}
          </div>
        </div>

        <div className="flex gap-2">
          {!isRunning ? (
            <Button onClick={handleStart} className="flex-1" size="lg">
              <Play className="w-4 h-4 mr-2" />
              시작
            </Button>
          ) : (
            <>
              <Button onClick={handlePause} variant="outline" className="flex-1 bg-transparent" size="lg">
                <Pause className="w-4 h-4 mr-2" />
                {isPaused ? "재개" : "일시정지"}
              </Button>
              <Button onClick={handleStop} variant="destructive" className="flex-1" size="lg">
                <Square className="w-4 h-4 mr-2" />
                종료
              </Button>
            </>
          )}
        </div>

        {isRunning && !isPaused && (
          <div className="space-y-2">
            <Label>작업 이벤트 기록</Label>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => logEvent("save", "문서 저장")}>
                <Save className="w-3 h-3 mr-1" />
                저장
              </Button>
              <Button size="sm" variant="outline" onClick={() => logEvent("version", "버전 업데이트")}>
                버전업
              </Button>
              <Button size="sm" variant="outline" onClick={() => logEvent("approval_request", "승인 요청")}>
                승인요청
              </Button>
              <Button size="sm" variant="outline" onClick={() => logEvent("review", "검토 완료")}>
                검토완료
              </Button>
            </div>
          </div>
        )}

        {eventLog.length > 0 && (
          <div className="space-y-2">
            <Label>이벤트 기록</Label>
            <div className="bg-muted rounded-lg p-3 max-h-40 overflow-y-auto space-y-1">
              {eventLog.map((event, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <Badge variant="secondary" className="text-xs">
                    {event.type}
                  </Badge>
                  <span className="text-muted-foreground">
                    {event.description || event.type} - {formatTime(event.elapsed_seconds || 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
