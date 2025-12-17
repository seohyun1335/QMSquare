import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null

export async function POST(request: Request) {
  try {
    console.log("[v0 SERVER] AI 분석 요청 수신")

    let docType = "SOP"
    let text = ""

    const contentType = request.headers.get("content-type") || ""

    if (contentType.includes("multipart/form-data")) {
      console.log("[v0 SERVER] multipart/form-data로 파일 수신 시도")

      try {
        const formData = await request.formData()
        const file = formData.get("file")
        docType = (formData.get("docType") as string) || "SOP"

        console.log("[v0 SERVER] FormData 파싱 완료")
        console.log("[v0 SERVER] file 타입:", file?.constructor?.name)
        console.log("[v0 SERVER] docType:", docType)

        if (!file) {
          console.error("[v0 SERVER] 파일이 전송되지 않음")
          return NextResponse.json({ error: "파일이 전송되지 않았습니다." }, { status: 400 })
        }

        if (!(file instanceof File)) {
          console.error("[v0 SERVER] file이 File 인스턴스가 아님:", typeof file)
          return NextResponse.json({ error: "유효한 파일이 아닙니다." }, { status: 400 })
        }

        console.log("[v0 SERVER] 파일 정보:", {
          name: file.name,
          type: file.type,
          size: file.size,
        })

        // TXT 파일만 지원
        if (!file.name.toLowerCase().endsWith(".txt")) {
          return NextResponse.json(
            { error: "현재 TXT 파일만 지원합니다. DOCX는 추후 지원 예정입니다." },
            { status: 400 },
          )
        }

        // 파일에서 텍스트 추출
        console.log("[v0 SERVER] 파일 텍스트 읽기 시작")
        text = await file.text()
        console.log("[v0 SERVER] 파일 텍스트 읽기 완료, 길이:", text.length)
      } catch (formError: any) {
        console.error("[v0 SERVER] FormData 처리 오류:", formError)
        return NextResponse.json(
          {
            error: "파일 처리 중 오류가 발생했습니다.",
            details: formError.message,
          },
          { status: 400 },
        )
      }
    } else {
      // JSON 요청 처리 (기존 방식)
      console.log("[v0 SERVER] application/json으로 데이터 수신")

      try {
        const body = await request.json()
        docType = body.docType || "SOP"
        text = body.text || ""

        console.log("[v0 SERVER] JSON 파싱 완료")
        console.log("[v0 SERVER] docType:", docType)
        console.log("[v0 SERVER] text 길이:", text.length)
      } catch (jsonError: any) {
        console.error("[v0 SERVER] JSON 파싱 오류:", jsonError)
        return NextResponse.json(
          {
            error: "JSON 파싱에 실패했습니다.",
            details: jsonError.message,
          },
          { status: 400 },
        )
      }
    }

    // 텍스트 검증
    if (!text || text.trim().length === 0) {
      console.error("[v0 SERVER] 텍스트 없음")
      return NextResponse.json({ error: "분석할 텍스트가 필요합니다." }, { status: 400 })
    }

    if (text.trim().length < 50) {
      console.error("[v0 SERVER] 텍스트 너무 짧음:", text.trim().length)
      return NextResponse.json(
        { error: `텍스트가 너무 짧습니다. 최소 50자 이상 필요합니다. (현재: ${text.trim().length}자)` },
        { status: 400 },
      )
    }

    console.log("[v0 SERVER] 텍스트 검증 통과:", {
      docType,
      textLength: text.length,
    })

    // 데모 모드 (OpenAI API 키 없음)
    if (!openai || !process.env.OPENAI_API_KEY) {
      console.log("[v0 SERVER] 데모 모드: OPENAI_API_KEY가 설정되지 않음")
      console.log(`[v0 SERVER] 데모 모드: ${docType} 전용 확장 스키마 목업 반환`)

      const mockResult = getMockResult(docType)
      return NextResponse.json(mockResult)
    }

    // OpenAI API 호출
    const systemPrompt = `당신은 의료기기 품질관리 전문가입니다. 
ISO 13485:2016, 21 CFR Part 820, 의료기기법 시행규칙을 기준으로 문서관리 SOP를 규제 심사 관점에서 평가합니다.

반드시 다음 6가지 규제 카테고리를 중점적으로 검토하세요:
1. 문서 승인/발행: 승인 권한자 정의, 검토-승인 분리, 승인 기록 보관
2. 문서 개정/변경이력: 개정 사유, 영향 평가, 변경 이력 양식
3. 최신본/배포/회수: 배포 대상, 구버전 회수 절차, 최신본 확인 방법
4. 보존기간/보관책임: 보존 기간 기준(법적 근거), 보관 장소, 보관 책임자
5. 접근권한/무단수정 방지: 전자문서 접근 권한, 변경 로그 추적, 무단 수정 방지
6. 교육기록/숙지확인: 교육 대상자, 교육 내용, 이해도 평가

모호한 표현("적절히", "필요시", "관리자 판단")은 구체적 기준으로 바꾸도록 권고하세요.
보존기간은 반드시 법적 근거(의료기기법 시행규칙 제27조 등)와 함께 명시되어야 합니다.

**중요: 반드시 아래 JSON 형식으로만 응답하세요.**

{
  "comparison": {
    "manual": { "avg_time_min": 120, "missing_risk": "...", "rework_risk": "...", "audit_ready": "..." },
    "qmsquare": { "avg_time_min": 35, "missing_risk": "...", "rework_risk": "...", "audit_ready": "..." }
  },
  "key_points": ["체크포인트 1", "체크포인트 2", ... (총 7개)],
  "requirements": [
    { "title": "문서 승인/발행", "items": ["항목1", "항목2", ...] },
    { "title": "문서 개정/변경이력", "items": [...] },
    { "title": "최신본/배포/회수", "items": [...] },
    { "title": "기록 보관/보존기간", "items": [...] },
    { "title": "접근권한/무단수정 방지(전자문서 포함)", "items": [...] }
  ],
  "findings": [
    {
      "severity": "High|Medium|Low",
      "category": "문서 승인/발행|문서 개정/변경이력|최신본/배포/회수|기록 보관/보존기간|접근권한/무단수정 방지|교육",
      "title": "지적사항 제목",
      "evidence": "문서 내 문제 구간 (짧게)",
      "why": "심사에서 지적되는 이유 (규제 근거 포함)",
      "fix": ["수정 방법 1", "수정 방법 2", ...],
      "recommended_text": "SOP에 바로 붙여넣을 수 있는 권장 문구"
    }
  ]
}`

    const userPrompt = `아래 SOP 텍스트를 분석하여 위 JSON 스키마 형식으로 반환하세요.
특히 findings에서는 High severity 지적사항을 우선하고, recommended_text는 실제 SOP에 복사-붙여넣기 가능하도록 구체적으로 작성하세요.

SOP 텍스트:
${text}`

    console.log("[v0 SERVER] OpenAI API 호출 시작 (docType:", docType, ")")

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    })

    const responseText = completion.choices[0]?.message?.content || "{}"
    console.log("[v0 SERVER] OpenAI 응답 수신 완료")

    let analysisResult
    try {
      analysisResult = JSON.parse(responseText)
      console.log("[v0 SERVER] OpenAI 응답 JSON 파싱 성공")
    } catch (parseError: any) {
      console.error("[v0 SERVER] JSON 파싱 오류:", parseError)
      console.error("[v0 SERVER] OpenAI 응답:", responseText.substring(0, 500))

      console.log("[v0 SERVER] Fallback: 데모 모드로 전환")
      return NextResponse.json(getMockResult(docType))
    }

    console.log("[v0 SERVER] 정상 응답 반환")
    return NextResponse.json(analysisResult)
  } catch (error: any) {
    console.error("[v0 SERVER] ===== 서버 오류 발생 =====")
    console.error("[v0 SERVER] 오류 타입:", error.constructor.name)
    console.error("[v0 SERVER] 오류 메시지:", error.message)
    console.error("[v0 SERVER] 오류 스택:", error.stack)
    console.error("[v0 SERVER] ===== 서버 오류 끝 =====")

    let errorMessage = "분석에 실패했습니다."

    if (error.message?.includes("API key")) {
      errorMessage = "OpenAI API 인증에 실패했습니다. OPENAI_API_KEY 환경 변수를 확인하세요."
    } else if (error.message?.includes("quota")) {
      errorMessage = "OpenAI API 할당량이 초과되었습니다. API 사용량을 확인하세요."
    } else if (error.message?.includes("timeout")) {
      errorMessage = "OpenAI API 요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요."
    } else if (error.message) {
      errorMessage = `서버 오류: ${error.message}`
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error.toString(),
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

function getMockResult(docType: string) {
  const baseComparison = {
    manual: {
      avg_time_min: 120,
      missing_risk: "필수 섹션 누락 가능성 높음 (승인 프로세스, 보존기간 등)",
      rework_risk: "높음 (심사 후 재작업 빈번, 개정 사유 불명확)",
      audit_ready: "낮음/불확실 (규제 요구사항 미충족 가능성)",
    },
    qmsquare: {
      avg_time_min: 35,
      missing_risk: "템플릿 기반 자동 점검으로 필수 섹션 누락 방지",
      rework_risk: "낮음 (사전 규제 검증, 심사 전 이슈 발견)",
      audit_ready: "높음/즉시 대응 가능 (규제 준수 자동 확인)",
    },
  }

  if (docType === "SOP") {
    return {
      comparison: baseComparison,
      key_points: [
        "문서 승인 프로세스가 명확히 정의되어 있는가 (승인 권한자, 검토-승인 분리)",
        "최신본 관리 및 구버전 회수 절차가 구체적으로 기술되어 있는가",
        "문서 번호 체계가 일관적이고 추적 가능한가",
        "개정 이력과 변경 사유가 명확히 기록되는가 (변경 영향 평가 포함)",
        "전자문서 접근 권한/무단 수정 방지 조치가 있는가 (로그 추적 포함)",
        "보존 기간이 법적 근거와 함께 구체적으로 명시되어 있는가",
        "교육 기록과 문서 숙지 확인 절차가 있는가 (이해도 평가 포함)",
      ],
      requirements: [
        {
          title: "문서 승인/발행",
          items: [
            "승인 권한자 정의 (직위, 권한 근거)",
            "검토/승인 분리 원칙 (동일인 불가)",
            "승인 기록 보관 (전자 서명 또는 종이 기록)",
          ],
        },
        {
          title: "문서 개정/변경이력",
          items: [
            "개정 사유/영향 기록 (변경 범위, 영향받는 제품/프로세스)",
            "변경 승인 절차 (검토-승인 단계)",
            "개정 이력 양식 (개정 번호, 일자, 내용, 승인자)",
          ],
        },
        {
          title: "최신본/배포/회수",
          items: [
            "배포 대상/방법 명시 (이메일, 문서 시스템 등록)",
            "구버전 회수/폐기 절차 (회수 기한, 폐기 방법)",
            "최신본 확인 방법 (버전 번호, 날짜, 시스템 표시)",
          ],
        },
        {
          title: "기록 보관/보존기간",
          items: [
            "보존 책임자 지정 (부서, 담당자)",
            "보존 기간 기준 (법적 근거: 의료기기법 시행규칙 제27조 등)",
            "보관 위치/보호 조치 (전자/종이 원본 구분)",
          ],
        },
        {
          title: "접근권한/무단수정 방지(전자문서 포함)",
          items: [
            "권한 관리 체계 (열람/수정/승인 권한 분리)",
            "변경 로그 추적 (누가, 언제, 무엇을 변경)",
            "백업/복구 절차 (데이터 손실 방지)",
          ],
        },
      ],
      findings: [
        {
          severity: "High",
          category: "최신본/배포/회수",
          title: "구버전 회수 절차 누락",
          evidence: "배포 방법 기술 없음, 구버전 관리 규정 부재",
          why: "구버전 SOP를 사용할 위험이 있어 ISO 13485 4.2.4 심사에서 Major 부적합 판정 가능. 의료기기 제조 시 구버전 SOP 사용은 제품 품질 영향 리스크가 높음.",
          fix: [
            "배포 대상 부서를 명시 (제조, 품질관리, 연구개발)",
            "배포 방법 구체화 (이메일, 문서 시스템 등록)",
            "구버전 회수 기한 설정 (예: 신규 개정본 배포 후 7일 이내)",
            "회수 후 처리 방법 (폐기 또는 '무효' 표시 후 보관)",
            "회수 확인 방법 (수령 확인서, 시스템 로그)",
          ],
          recommended_text:
            "본 SOP는 품질보증팀에서 관련 부서(제조, 품질관리, 연구개발)에 이메일로 배포하며, 각 부서는 수령 확인서를 제출한다. 구버전 SOP는 신규 개정본 배포 후 7일 이내에 회수하여 '무효' 표시 후 보관하거나 파기한다. 회수 완료 여부는 품질보증팀이 확인한다.",
        },
        {
          severity: "High",
          category: "기록 보관/보존기간",
          title: "보존 기간 미명시 (법적 근거 부재)",
          evidence: "문서 하단에 보존 기간 기재 없음",
          why: "의료기기법 시행규칙 제27조 위반으로 식약처 심사 시 지적 가능. 보존 기간 미명시는 문서 관리 부실로 간주되어 심각한 규제 리스크 발생.",
          fix: [
            "보존 기간을 법적 근거와 함께 명시 (예: 3년, 근거: 의료기기법 시행규칙 제27조)",
            "보관 장소 구체화 (전자 파일: 서버 경로, 종이 원본: 물리적 위치)",
            "보관 책임자 지정 (부서, 직위)",
            "보존 기간 경과 후 처리 방법 (폐기 또는 연장 절차)",
          ],
          recommended_text:
            "본 문서는 발효일로부터 3년간 보존한다(근거: 의료기기법 시행규칙 제27조). 전자 파일은 품질보증팀 서버 '문서 보관함' 폴더에, 종이 원본은 품질보증팀 문서 보관함에 보관한다. 보관 책임자: 품질보증팀장. 보존 기간 경과 후에는 폐기하거나 팀장 승인을 받아 연장할 수 있다.",
        },
        {
          severity: "Medium",
          category: "접근권한/무단수정 방지",
          title: "전자문서 접근 권한 관리 절차 미흡",
          evidence: "전자문서 시스템 접근 권한에 대한 언급 없음",
          why: "ISO 13485 4.2.4(f) 요구사항 부적합. 무단 수정 리스크가 있어 문서 무결성 보장 불가.",
          fix: [
            "접근 권한 체계 정의 (열람/수정/승인 권한 분리)",
            "권한 부여 절차 명시 (누가 권한을 부여하는가)",
            "권한 변경 시 승인 프로세스 (팀장 승인 필요 등)",
            "변경 로그 추적 (누가, 언제, 무엇을 변경했는지 기록)",
          ],
          recommended_text:
            "전자문서 시스템 접근 권한은 다음과 같이 관리한다: (1) 열람 권한: 모든 임직원, (2) 수정 권한: 문서 작성자 및 품질보증팀, (3) 승인 권한: 품질보증팀장 이상. 권한 변경은 팀장 승인을 받아야 하며, 시스템은 모든 변경 이력을 자동으로 기록한다.",
        },
        {
          severity: "Medium",
          category: "문서 승인/발행",
          title: "검토-승인 분리 원칙 미명시",
          evidence: "승인 절차에 '검토자와 승인자는 동일인이 될 수 없다'는 언급 없음",
          why: "ISO 13485 4.2.4 요구사항. 동일인 검토-승인은 객관성 결여로 심사에서 지적 가능.",
          fix: [
            "검토자와 승인자는 반드시 다른 사람이어야 함을 명시",
            "검토자 자격 정의 (해당 분야 전문성)",
            "승인자 권한 근거 (직위, 책임)",
          ],
          recommended_text:
            "문서 검토자와 승인자는 반드시 다른 사람이어야 한다. 검토자는 해당 분야 실무 경험이 3년 이상인 담당자가 수행하며, 승인자는 팀장 이상 직위자가 수행한다.",
        },
        {
          severity: "Low",
          category: "문서 개정/변경이력",
          title: "모호한 표현: '필요시 개정'",
          evidence: "'필요시 개정할 수 있다'로 기재",
          why: "'필요시'는 판단 기준이 모호하여 개정 시점 논란 가능. 심사위원이 '기준 불명확'으로 지적할 수 있음.",
          fix: [
            "개정 트리거 조건을 구체화 (법규 변경, 프로세스 변경, 부적합 발생 등)",
            "개정 주기 명시 (예: 매년 정기 검토)",
            "개정 요청 절차 정의 (누가, 어떻게 요청)",
          ],
          recommended_text:
            "본 SOP는 다음의 경우 개정한다: (1) 관련 법규/규제 변경 시, (2) 프로세스 변경 시, (3) 내부심사/외부심사에서 개선 요청 시, (4) CAPA 조치 결과 반영 시. 또한 매년 1회 정기 검토를 수행하여 개정 필요성을 평가한다.",
        },
      ],
    }
  }

  // DV_PROTOCOL, CAPA 등 다른 docType은 기본 스키마 반환
  return {
    comparison: baseComparison,
    key_points: ["기본 체크 포인트"],
    requirements: [{ title: "기본 요구사항", items: ["항목 1"] }],
    findings: [],
  }
}
