"use client"

import type React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Simple demo login - accept any email/password
      if (!email || !password) {
        throw new Error("이메일과 비밀번호를 입력해주세요")
      }

      // Store user in localStorage
      localStorage.setItem("qms_user", JSON.stringify({ email, isLoggedIn: true }))

      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "로그인에 실패했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <Image src="/images/qmsquare-logo.png" alt="QMSquare" width={480} height={144} className="h-32 w-auto" />
            <p className="text-sm text-muted-foreground text-balance">쉽고 간편한 품질 관리 시스템</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">로그인</CardTitle>
              <CardDescription>이메일과 비밀번호를 입력하여 로그인하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">이메일</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@company.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">비밀번호</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "로그인 중..." : "로그인"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  계정이 없으신가요?{" "}
                  <Link href="/auth/sign-up" className="underline underline-offset-4 font-medium">
                    회원가입
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
