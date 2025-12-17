"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ClipboardCheck, LogOut, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface DashboardHeaderProps {
  user?: { email?: string } | null
  profile?: { full_name?: string; organization?: string } | null
}

export function DashboardHeader({ user, profile }: DashboardHeaderProps) {
  const router = useRouter()

  const handleSignOut = () => {
    // For demo mode, just redirect to home
    router.push("/")
  }

  const email = user?.email || "demo@qmsquare.com"
  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : email[0]?.toUpperCase() || "D"

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/images/qmsquare-logo.png" alt="QMSquare" width={400} height={120} className="h-20 w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">
                <ClipboardCheck className="w-4 h-4 mr-2" />
                대시보드
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/documents">
                <ClipboardCheck className="w-4 h-4 mr-2" />
                문서 관리
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/quality-records">
                <ClipboardCheck className="w-4 h-4 mr-2" />
                품질 기록
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/efficiency">
                <TrendingUp className="w-4 h-4 mr-2" />
                효율성 분석
              </Link>
            </Button>
          </nav>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-blue-600 text-white">{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{profile?.full_name || "데모 사용자"}</p>
                <p className="text-xs leading-none text-muted-foreground">{email}</p>
                {profile?.organization && (
                  <p className="text-xs leading-none text-muted-foreground">{profile.organization}</p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              홈으로
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
