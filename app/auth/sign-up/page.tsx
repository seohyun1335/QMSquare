"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [organization, setOrganization] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("비밀번호가 일치하지 않습니다")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다")
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            organization,
          },
        },
      })

      if (signUpError) {
        throw signUpError
      }

      if (data.user) {
        console.log("[v0] 회원가입 성공:", data.user.email)
        // Supabase sends confirmation email by default
        router.push("/auth/sign-up-success")
      }
    } catch (error: unknown) {
      console.error("[v0] 회원가입 실패:", error)
      setError(error instanceof Error ? error.message : "회원가입에 실패했습니다")
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
            <h1 className="text-2xl font-bold text-balance">Q-Cloud eQMS</h1>
            <p className="text-sm text-muted-foreground text-balance">쉽고 간편한 품질 관리 시스템</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">회원가입</CardTitle>
              <CardDescription>QMSquare 계정을 생성하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="full-name">이름</Label>
                    <Input
                      id="full-name"
                      type="text"
                      placeholder="홍길동"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="organization">회사명</Label>
                    <Input
                      id="organization"
                      type="text"
                      placeholder="회사명을 입력하세요"
                      required
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                    />
                  </div>
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
                  <div className="grid gap-2">
                    <Label htmlFor="repeat-password">비밀번호 확인</Label>
                    <Input
                      id="repeat-password"
                      type="password"
                      required
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                    />
                  </div>
                  {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "계정 생성 중..." : "회원가입"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  이미 계정이 있으신가요?{" "}
                  <Link href="/auth/login" className="underline underline-offset-4 font-medium">
                    로그인
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
