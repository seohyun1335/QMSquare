import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const systemPrompt = `참고 기준은 ISO 13485의 문서관리 요구사항과 21 CFR 820의 문서/기록 관리 개념 수준으로 일반화해서 설명하되, 조항번호를 남발하지 말 것.

역할: 너는 중소 의료기기 기업의 QA/RA를 돕는 'eQMS 문서 심사 준비' 전문 컨설턴트다.
목표: 아래 SOP(문서관리 절차서)를 규제/심사 관점에서 평가하고, 부족/오류를 찾아 '바로 적용 가능한 수정안'까지 제시한다.

[중요 톤/규칙]
- 결과는 한국어 100%
- 심사위원(비전공자)도 이해할 수 있게 쉬운 말로 설명
- 규정/표준은 "근거로만" 사용하고, 조항번호를 과도하게 나열하지 말 것
- 단, 각 지적사항마다 "어떤 규제 요구사항 유형(문서관리/승인/개정/배포/기록보관/접근통제/전자기록 신뢰성)"에 해당하는지 명확히 표시
- 의료기기 QMS 일반 요구사항(문서 승인, 최신본 관리, 변경이력, 배포/회수, 접근권한, 기록 보존, 교육 기록 등)을 기준으로 평가
- 외부 사실을 단정하지 말고, 문서에 쓰인 내용만 근거로 판단

[출력 형식: 반드시 아래 JSON으로만]
{
  "regulatory_summary": {
    "what_matters_in_audit": [
      "심사에서 문서관리 절차에서 보려는 핵심 포인트 6~10개를 짧게"
    ],
    "applicable_requirements": [
      {
        "category": "문서 승인/발행",
        "explain": "왜 필요한지 1~2문장"
      },
      {
        "category": "문서 개정/변경이력",
        "explain": "왜 필요한지 1~2문장"
      },
      {
        "category": "최신본/배포/회수",
        "explain": "왜 필요한지 1~2문장"
      },
      {
        "category": "기록 보관/보존기간",
        "explain": "왜 필요한지 1~2문장"
      },
      {
        "category": "접근권한/무단수정 방지(전자문서 포함)",
        "explain": "왜 필요한지 1~2문장"
      },
      {
        "category": "교육/훈련 기록",
        "explain": "왜 필요한지 1~2문장"
      }
    ]
  },
  "issues": [
    {
      "severity": "High | Medium | Low",
      "requirement_category": "문서 승인/발행 | 문서 개정/변경이력 | 최신본/배포/회수 | 기록 보관 | 접근통제 | 교육",
      "problem": "SOP에서 무엇이 부족/모호/누락인지 한 문장",
      "evidence_in_text": "문서의 어떤 문구가 문제를 만들었는지(짧게 인용/요약)",
      "why_it_fails_in_audit": "심사에서 왜 부적합/지적이 되는지 2~4문장",
      "how_to_fix": [
        "수정 방법을 단계별로 3~6개"
      ],
      "recommended_wording": "SOP에 바로 붙여넣을 수 있는 개선 문구(한국어, 실제 절차 문장)"
    }
  ],
  "rewrite_proposal": {
    "patched_sections": [
      {
        "section": "3. 책임 및 권한",
        "before": "원문 요약(짧게)",
        "after": "개선된 문단(실제 SOP처럼 구체적으로)"
      },
      {
        "section": "5. 문서 검토 및 승인",
        "before": "원문 요약(짧게)",
        "after": "개선된 문단(실제 SOP처럼 구체적으로)"
      },
      {
        "section": "6. 문서 보관",
        "before": "원문 요약(짧게)",
        "after": "개선된 문단(실제 SOP처럼 구체적으로)"
      },
      {
        "section": "신규 추가 섹션",
        "before": "",
        "after": "문서 개정/배포/회수/접근권한/보존기간/변경이력 등 필수 섹션을 SOP에 추가"
      }
    ],
    "final_checklist": [
      "이 SOP가 심사에 통과하기 위해 반드시 포함해야 하는 체크리스트 10~15개"
    ]
  }
}

추가 요구:
- '적절히/필요시/검토 후' 같은 모호 표현을 찾아서 구체화하라(누가/언제/어떻게/기록이 무엇인지).
- 보존기간은 "회사 규정에 따른다"가 아니라 '기준을 정해야 한다'고 지적하고 예시 기준을 제시하라.
- 배포/회수(폐기) 절차, 최신본 확인 방법, 문서 번호 체계, 승인권자 정의(직위), 전자문서 접근통제/로그(변경기록) 필요성을 반드시 다뤄라.`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { docType, text } = body

    if (!docType || !text) {
      return NextResponse.json({ error: "docType and text are required" }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      console.warn("OPENAI_API_KEY가 설정되지 않아 데모 모드로 작동합니다")
      await new Promise((resolve) => setTimeout(resolve, 2000))

      return NextResponse.json({
        regulatory_summary: {
          what_matters_in_audit: [
            "문서 승인 프로세스가 명확히 정의되어 있는가",
            "최신본 관리 및 구버전 회수 절차가 있는가",
            "문서 번호 체계가 일관적이고 추적 가능한가",
            "개정 이력과 변경 사유가 기록되는가",
            "전자문서의 접근 권한과 무단 수정 방지 조치가 있는가",
            "보존 기간이 구체적으로 명시되어 있는가",
            "교육 기록과 문서 숙지 확인 절차가 있는가",
          ],
          applicable_requirements: [
            {
              category: "문서 승인/발행",
              explain:
                "의료기기 규제에서는 모든 QMS 문서가 적격한 인원에 의해 승인되어야 합니다. 승인 없이 사용된 문서는 부적합 사항입니다.",
            },
            {
              category: "문서 개정/변경이력",
              explain: "변경 이력이 없으면 언제 무엇이 왜 바뀌었는지 추적할 수 없어 심사에서 큰 문제가 됩니다.",
            },
            {
              category: "최신본/배포/회수",
              explain: "구버전 문서가 사용되면 제품 결함이나 규제 위반으로 이어질 수 있습니다.",
            },
            {
              category: "기록 보관/보존기간",
              explain: "규제 기관은 최소 보존 기간을 요구하며, 이를 충족하지 못하면 심각한 지적 사항이 됩니다.",
            },
            {
              category: "접근권한/무단수정 방지(전자문서 포함)",
              explain: "전자문서는 무단 변경이 쉬워 접근 통제와 변경 로그가 필수적입니다.",
            },
            {
              category: "교육/훈련 기록",
              explain: "직원이 최신 절차를 숙지했는지 증명하는 교육 기록이 없으면 부적합 처리됩니다.",
            },
          ],
        },
        issues: [
          {
            severity: "High",
            requirement_category: "문서 승인/발행",
            problem: "승인 권한자와 승인 절차가 명확하지 않음",
            evidence_in_text: "작성된 문서는 검토 후 승인하여 사용한다",
            why_it_fails_in_audit:
              "누가 승인 권한을 가지는지 정의되지 않아 심사위원이 적격성을 확인할 수 없습니다. 또한 검토와 승인의 차이도 불분명하여 프로세스가 모호합니다.",
            how_to_fix: [
              "승인권자를 직위로 명시 (예: 품질관리 책임자, 사업장 책임자)",
              "검토자와 승인자의 역할 분리 및 정의",
              "승인 시 확인해야 할 기준 명시",
              "승인 기록 양식 및 보관 방법 정의",
            ],
            recommended_wording:
              "작성된 문서는 해당 부서장의 검토를 거친 후, 품질관리 책임자가 최종 승인한다. 승인 시 문서의 완전성, 정확성, 적용 가능성을 확인하며, 승인 기록은 문서 이력 관리 대장에 기록한다.",
          },
          {
            severity: "High",
            requirement_category: "최신본/배포/회수",
            problem: "구버전 문서 회수 및 최신본 배포 절차가 없음",
            evidence_in_text: "승인된 문서는 적절한 장소에 보관하며, 필요 시 열람할 수 있도록 한다",
            why_it_fails_in_audit:
              "구버전이 현장에 남아있으면 잘못된 절차로 작업이 이루어질 수 있습니다. 심사에서는 최신본 확인 방법과 구버전 회수 증거를 요구합니다.",
            how_to_fix: [
              "문서 배포 대장 작성 및 배포처 기록",
              "개정 시 구버전 회수 절차 명시",
              "최신본 표시 방법 정의 (예: 워터마크, 색상 구분)",
              "전자문서의 경우 접근 권한 자동 업데이트",
            ],
            recommended_wording:
              "문서 개정 시 품질관리 담당자는 문서 배포 대장을 확인하여 모든 배포처에 최신본을 전달하고, 구버전은 즉시 회수하여 '폐기' 도장을 찍은 후 별도 보관한다. 전자문서의 경우 구버전은 읽기 전용으로 전환하고 최신본에 자동 링크한다.",
          },
          {
            severity: "Medium",
            requirement_category: "문서 개정/변경이력",
            problem: "문서 개정 이력 및 변경 사유 기록 절차 누락",
            evidence_in_text: "필요 시 수정 후 다시 검토할 수 있다",
            why_it_fails_in_audit:
              "개정 이력이 없으면 변경 추적이 불가능하고, 심사위원이 문서의 신뢰성을 판단할 수 없습니다. 규제에서는 변경 관리가 핵심 요구사항입니다.",
            how_to_fix: [
              "문서 개정 이력표 양식 정의 (개정번호, 날짜, 변경 내용, 승인자)",
              "개정 사유 필수 기록",
              "주요 변경과 경미한 변경 구분 기준",
            ],
            recommended_wording:
              "문서 개정 시 개정 이력표에 개정 번호, 개정 날짜, 변경 내용 요약, 변경 사유, 승인자를 기록한다. 주요 변경(절차 변경, 책임자 변경 등)은 버전 번호를 올리고, 경미한 변경(오타 수정 등)은 소수점 번호를 사용한다.",
          },
        ],
        rewrite_proposal: {
          patched_sections: [
            {
              section: "3. 책임 및 권한",
              before: "품질관리 담당자는 문서 관리 전반을 담당하며, 각 부서는 문서 작성에 협조한다",
              after:
                "3. 책임 및 권한\n\n3.1 품질관리 책임자\n- 문서 관리 시스템의 총괄 책임\n- 문서 승인 최종 권한\n- 문서 개정 및 폐기 승인\n- 외부 문서 검토 및 승인\n\n3.2 품질관리 담당자\n- 문서 번호 부여 및 등록\n- 문서 배포 및 회수 관리\n- 문서 보관 및 보존 기간 관리\n- 문서 이력 관리 대장 유지\n\n3.3 각 부서장\n- 해당 부서 문서 작성 주관\n- 작성된 문서의 기술적 검토\n- 부서원에 대한 문서 교육 실시\n\n3.4 문서 작성자\n- 명확하고 정확한 문서 작성\n- 참고 문헌 및 관련 문서 확인\n- 개정 요청 시 변경 사유 작성",
            },
            {
              section: "5. 문서 검토 및 승인",
              before: "작성된 문서는 검토 후 승인하여 사용한다",
              after:
                "5. 문서 검토 및 승인\n\n5.1 검토\n- 문서 작성 완료 후 해당 부서장이 내용의 적절성, 완전성, 실행 가능성을 검토\n- 검토 시 확인 사항: 목적 명확성, 절차 구체성, 책임 분명성, 참고 문헌 적절성\n- 검토 의견은 문서 검토 기록지에 작성\n\n5.2 승인\n- 검토 완료 후 품질관리 책임자가 최종 승인\n- 승인 시 확인 사항: 규제 요구사항 충족, 기존 문서와의 일관성, 교육 필요성\n- 승인 기록은 문서 이력 관리 대장에 등록\n- 승인 후 문서 번호 부여 및 발행일 기록\n\n5.3 승인 거부\n- 승인 거부 시 사유를 명확히 기록하고 작성자에게 통보\n- 수정 후 재검토/재승인 실시",
            },
            {
              section: "7. 문서 배포 및 회수",
              before: "승인된 문서는 적절한 장소에 보관하며, 필요 시 열람할 수 있도록 한다",
              after:
                "7. 문서 배포 및 회수\n\n7.1 배포\n- 품질관리 담당자가 문서 배포 대장을 작성하여 모든 배포처에 최신본을 배포\n- 배포 시 접근 권한 설정 및 변경 로그 기록\n\n7.2 회수\n- 문서 개정 시 구버전을 즉시 회수하여 '폐기' 도장을 찍은 후 별도 보관\n- 전자문서의 경우 구버전을 읽기 전용으로 전환하고 최신본에 자동 링크\n\n7.3 최신본 확인\n- 최신본을 표시하는 방법 정의 (예: 워터마크, 색상 구분)\n- 비상 시 문서 접근 방법 명시",
            },
          ],
          final_checklist: [
            "문서 번호 체계가 정의되어 있는가",
            "승인 권한자가 직위로 명시되어 있는가",
            "검토와 승인의 역할이 구분되어 있는가",
            "문서 개정 이력 기록 양식이 있는가",
            "개정 시 변경 사유 필수 기록이 명시되어 있는가",
            "구버전 회수 절차가 구체적으로 기술되어 있는가",
            "최신본 확인 방법이 정의되어 있는가",
            "문서 배포 대장 양식이 있는가",
            "보존 기간이 문서 유형별로 명시되어 있는가",
            "전자문서 접근 권한 및 변경 로그 관리가 포함되어 있는가",
            "문서 교육 실시 및 기록 절차가 있는가",
            "외부 문서 관리 절차가 포함되어 있는가",
            "문서 폐기 절차 및 승인 권한이 명시되어 있는가",
            "비상 시 문서 접근 방법이 정의되어 있는가",
            "문서 관리 관련 기록 보관 장소 및 책임자가 명시되어 있는가",
          ],
        },
      })
    }

    const openai = new OpenAI({ apiKey })

    const userPrompt = `문서 유형: ${docType}\n\n문서 본문:\n<<<\n${text}\n>>>`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    })

    const result = completion.choices[0]?.message?.content
    if (!result) {
      throw new Error("AI 응답이 비어있습니다")
    }

    const analysis = JSON.parse(result)
    return NextResponse.json(analysis)
  } catch (error) {
    console.error("문서 분석 오류:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "분석 실패",
      },
      { status: 500 },
    )
  }
}
