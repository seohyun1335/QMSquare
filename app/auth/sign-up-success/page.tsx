import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail } from "lucide-react"
import Image from "next/image"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <Image src="/images/qmsquare-logo.png" alt="QMSquare" width={480} height={144} className="h-32 w-auto" />
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl">이메일을 확인하세요</CardTitle>
              <CardDescription className="text-base">인증 링크를 전송했습니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                이메일을 확인하고 인증 링크를 클릭하여 계정을 활성화하세요. 인증이 완료되면 QMSquare 대시보드에
                로그인하실 수 있습니다.
              </p>
              <Button asChild className="w-full">
                <Link href="/auth/login">로그인으로 돌아가기</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
