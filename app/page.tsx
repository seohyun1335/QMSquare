import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, ClipboardCheck, BarChart3, Lock, Cloud, CheckCircle } from "lucide-react"
import Image from "next/image"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-svh">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/qmsquare-logo.png"
              alt="QMSquare"
              width={400}
              height={120}
              className="h-20 w-auto"
              priority
            />
          </Link>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href="/auth/login">로그인</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">시작하기</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center py-12 md:py-24 lg:py-32 bg-gradient-to-b from-blue-50 to-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-6 text-center">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-balance">
                품질 관리 시스템
                <br />
                <span className="text-blue-600">이제 더 쉽게</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl text-balance">
                클라우드 기반 QMSquare로 품질 프로세스를 간소화하세요. 문서 관리, 품질 기록 추적, 규정 준수를 손쉽게
                수행할 수 있습니다.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild size="lg" className="gap-2">
                <Link href="/auth/sign-up">
                  무료 체험 시작
                  <Cloud className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/login">로그인</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-balance">
              품질 관리에 필요한 모든 기능
            </h2>
            <p className="max-w-[700px] text-muted-foreground md:text-lg text-balance">
              하나의 플랫폼에서 품질 프로세스, 문서, 규정 준수를 관리하는 종합 도구
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            <div className="flex flex-col items-center space-y-3 text-center p-6 bg-card border rounded-lg">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold">문서 관리</h3>
              <p className="text-sm text-muted-foreground text-balance">
                버전 관리 및 승인 워크플로를 통해 SOP, 작업 지침서, 품질 매뉴얼을 관리하세요.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-3 text-center p-6 bg-card border rounded-lg">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-100">
                <ClipboardCheck className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold">품질 기록</h3>
              <p className="text-sm text-muted-foreground text-balance">
                CAPA, 일탈, 변경 관리, 심사를 포괄적인 기록 관리로 추적하세요.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-3 text-center p-6 bg-card border rounded-lg">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-purple-100">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold">분석 및 리포트</h3>
              <p className="text-sm text-muted-foreground text-balance">
                실시간 대시보드와 포괄적인 품질 지표 추적으로 인사이트를 얻으세요.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-3 text-center p-6 bg-card border rounded-lg">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-orange-100">
                <Lock className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold">보안 및 규정 준수</h3>
              <p className="text-sm text-muted-foreground text-balance">
                감사 추적 및 역할 기반 접근 제어를 통한 기업급 보안
              </p>
            </div>

            <div className="flex flex-col items-center space-y-3 text-center p-6 bg-card border rounded-lg">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-cyan-100">
                <Cloud className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold">클라우드 기반</h3>
              <p className="text-sm text-muted-foreground text-balance">
                안전한 클라우드 인프라로 언제 어디서나 품질 시스템에 접근하세요.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-3 text-center p-6 bg-card border rounded-lg">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-pink-100">
                <CheckCircle className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold">사용하기 쉬운</h3>
              <p className="text-sm text-muted-foreground text-balance">
                품질 전문가를 위해 설계된 직관적인 인터페이스, 기술 전문 지식 불필요
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-24 lg:py-32 bg-blue-600 text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-balance">
              품질 관리를 혁신할 준비가 되셨나요?
            </h2>
            <p className="max-w-[600px] text-blue-100 md:text-lg text-balance">
              전 세계 조직들이 QMSquare로 품질 프로세스를 간소화하고 있습니다.
            </p>
            <Button asChild size="lg" variant="secondary" className="gap-2">
              <Link href="/auth/sign-up">
                무료로 시작하기
                <Cloud className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/qmsquare-logo.png" alt="QMSquare" width={320} height={96} className="h-16 w-auto" />
          </Link>
          <p className="text-sm text-muted-foreground">© 2025 QMSquare. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
