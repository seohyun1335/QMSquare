"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[v0] Error boundary caught:", error)

    if (error.message.includes("JSON") || error.message.includes("parse")) {
      try {
        const keys = [
          "qmsquare_documents",
          "qmsquare_quality_records",
          "qmsquare_work_time_logs",
          "qmsquare_quality_checks",
          "qmsquare_efficiency_snapshots",
          "qmsquare_initialized",
          "qmsquare_attachments",
          "qmsquare_analysis",
        ]
        keys.forEach((key) => {
          try {
            localStorage.removeItem(key)
          } catch (e) {
            console.error(`[v0] Failed to remove ${key}:`, e)
          }
        })
      } catch (e) {
        console.error("[v0] Failed to clean localStorage:", e)
      }
    }
  }, [error])

  const handleReset = () => {
    try {
      localStorage.clear()
      window.location.href = "/dashboard"
    } catch (e) {
      console.error("[v0] Failed to reset:", e)
      reset()
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle>오류가 발생했습니다</CardTitle>
          </div>
          <CardDescription>일시적인 문제가 발생했습니다. 다시 시도해주세요.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{error.message || "알 수 없는 오류"}</p>
          <div className="flex flex-col gap-2">
            <Button onClick={reset} className="w-full">
              다시 시도
            </Button>
            <Button variant="outline" onClick={() => (window.location.href = "/dashboard")} className="w-full">
              대시보드로 이동
            </Button>
            <Button variant="destructive" onClick={handleReset} className="w-full">
              데이터 초기화 후 재시작
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
