import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertCircle } from "lucide-react"

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-2xl">인증 오류</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {params?.error ? (
              <p className="text-sm text-muted-foreground text-center">오류 코드: {params.error}</p>
            ) : (
              <p className="text-sm text-muted-foreground text-center">
                인증 중 오류가 발생했습니다. 다시 시도해주세요.
              </p>
            )}
            <Button asChild className="w-full">
              <Link href="/auth/login">로그인으로 돌아가기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
