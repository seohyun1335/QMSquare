import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  // IMPORTANT: getUser()를 호출하여 세션을 갱신합니다
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 보호된 경로 접근 시 인증 확인 (선택사항 - 현재는 비활성화)
  // if (request.nextUrl.pathname.startsWith("/protected") && !user) {
  //   const url = request.nextUrl.clone()
  //   url.pathname = "/auth/login"
  //   return NextResponse.redirect(url)
  // }

  return supabaseResponse
}
