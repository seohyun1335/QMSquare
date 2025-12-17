import type { AnalysisResult, AmbiguousPhrase } from "./types"

// 변경관리(Change Control) 필수 섹션
const REQUIRED_SECTIONS = ["변경 사유", "변경 내용", "영향 평가", "검증 및 확인", "승인", "변경 이력"]

// 모호 표현 목록
const AMBIGUOUS_TERMS = ["적절히", "충분히", "가능한", "필요시", "검토함", "적당히", "대략", "약간"]

export function analyzeDocument(qualityRecordId: string, fileId: string, extractedText: string): AnalysisResult {
  const text = extractedText.toLowerCase()
  const lines = extractedText.split("\n")

  // 1. 필수 섹션 체크
  const missingSections: string[] = []
  REQUIRED_SECTIONS.forEach((section) => {
    if (!text.includes(section.toLowerCase())) {
      missingSections.push(section)
    }
  })

  // 2. 모호 표현 찾기
  const ambiguousPhrases: AmbiguousPhrase[] = []
  AMBIGUOUS_TERMS.forEach((term) => {
    lines.forEach((line, index) => {
      if (line.includes(term)) {
        ambiguousPhrases.push({
          phrase: term,
          context: line.trim().substring(0, 100),
          line_number: index + 1,
        })
      }
    })
  })

  // 3. 점수 계산
  const sectionScore = ((REQUIRED_SECTIONS.length - missingSections.length) / REQUIRED_SECTIONS.length) * 70
  const ambiguityPenalty = Math.min(ambiguousPhrases.length * 3, 30)
  const finalScore = Math.max(0, Math.round(sectionScore - ambiguityPenalty))

  // 4. 요약 및 권고사항 생성
  const summary = generateSummary(missingSections, ambiguousPhrases, finalScore)
  const recommendations = generateRecommendations(missingSections, ambiguousPhrases)
  const efficiencyNote = generateEfficiencyNote(missingSections, ambiguousPhrases)

  return {
    id: `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    quality_record_id: qualityRecordId,
    file_id: fileId,
    score: finalScore,
    missing_sections: missingSections,
    ambiguous_phrases: ambiguousPhrases,
    summary,
    recommendations,
    efficiency_note: efficiencyNote,
    created_at: new Date().toISOString(),
  }
}

function generateSummary(missingSections: string[], ambiguousPhrases: AmbiguousPhrase[], score: number): string {
  if (score >= 80) {
    return `문서 품질이 우수합니다. 필수 섹션이 모두 포함되어 있으며, 명확한 표현을 사용하고 있습니다.`
  } else if (score >= 60) {
    return `문서 품질이 양호합니다. 일부 개선이 필요하지만 전반적으로 기준을 충족합니다.`
  } else {
    return `문서 품질이 미흡합니다. ${missingSections.length}개의 필수 섹션이 누락되었고, ${ambiguousPhrases.length}개의 모호한 표현이 발견되었습니다.`
  }
}

function generateRecommendations(missingSections: string[], ambiguousPhrases: AmbiguousPhrase[]): string[] {
  const recommendations: string[] = []

  if (missingSections.length > 0) {
    recommendations.push(
      `필수 섹션 추가: ${missingSections.slice(0, 3).join(", ")}${missingSections.length > 3 ? " 등" : ""}`,
    )
  }

  if (ambiguousPhrases.length > 0) {
    recommendations.push(`모호한 표현을 구체적인 수치나 기준으로 대체하세요 (예: "충분히" → "최소 95% 이상")`)
  }

  if (missingSections.length === 0 && ambiguousPhrases.length === 0) {
    recommendations.push("문서가 우수한 상태입니다. 정기적인 검토를 통해 최신 상태를 유지하세요.")
  }

  recommendations.push("변경 이력을 명확히 기록하여 추적성을 확보하세요.")
  recommendations.push("검토자와 승인자의 서명 및 날짜를 명시하세요.")

  return recommendations
}

function generateEfficiencyNote(missingSections: string[], ambiguousPhrases: AmbiguousPhrase[]): string {
  const manualDefectRate = missingSections.length + Math.floor(ambiguousPhrases.length / 2)
  const qmsquareDefectRate = Math.max(0, Math.floor(manualDefectRate * 0.25))
  const timeSaved = manualDefectRate * 15

  return `QMSquare를 사용하면 누락 섹션 ${missingSections.length}개와 모호 표현 ${ambiguousPhrases.length}개가 자동으로 방지되어, 재작업 시간을 약 ${timeSaved}분 절감할 수 있습니다. 수기 대비 결함률을 ${manualDefectRate}개 → ${qmsquareDefectRate}개로 75% 감소시킬 수 있습니다.`
}
