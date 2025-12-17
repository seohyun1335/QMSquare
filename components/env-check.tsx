"use client"

import { useEffect, useState } from "react"
import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function EnvCheck() {
  const [missingVars, setMissingVars] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const missing: string[] = []

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      missing.push("NEXT_PUBLIC_SUPABASE_URL")
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    }

    if (missing.length > 0) {
      console.warn("[v0] Missing environment variables:", missing)
      setMissingVars(missing)
    }
  }, [mounted])

  if (!mounted || missingVars.length === 0) {
    return null
  }

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>환경 변수 누락</AlertTitle>
      <AlertDescription>
        <div className="space-y-2">
          <p>다음 환경 변수가 설정되지 않았습니다:</p>
          <ul className="list-disc pl-5 space-y-1">
            {missingVars.map((varName) => (
              <li key={varName}>
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm">{varName}</code>
              </li>
            ))}
          </ul>
          <p className="text-sm mt-2">Vercel Dashboard → Project Settings → Environment Variables에서 설정하세요.</p>
        </div>
      </AlertDescription>
    </Alert>
  )
}
