// 규칙 기반 품질 검사 시스템
export const DOCUMENT_RULES: Record<string, string[]> = {
  "절차서(SOP)": ["목적", "적용범위", "책임과 권한", "절차", "기록관리", "참고문서", "개정이력"],
  "작업지침서(WI)": ["목적", "적용범위", "작업순서", "주의사항", "기록", "안전사항"],
  "기록서(Record)": ["제목", "날짜", "작성자", "검토자", "승인자", "시험항목", "합격기준", "결과"],
  "변경관리(Change)": ["변경요청", "변경사유", "영향평가", "승인", "실행", "검증", "문서화"],
}

export interface QualityCheckResult {
  score: number
  defects_count: number
  missing_keywords: string[]
  audit_readiness: number
  feedback: string[]
}

export function checkDocumentQuality(content: string, documentType: string): QualityCheckResult {
  const requiredKeywords = DOCUMENT_RULES[documentType] || []
  const missingKeywords: string[] = []

  // 각 필수 키워드가 문서에 포함되어 있는지 확인
  requiredKeywords.forEach((keyword) => {
    if (!content.includes(keyword)) {
      missingKeywords.push(keyword)
    }
  })

  const defectsCount = missingKeywords.length
  const totalKeywords = requiredKeywords.length
  const foundKeywords = totalKeywords - defectsCount

  // 점수 계산 (0-100)
  const score = totalKeywords > 0 ? Math.round((foundKeywords / totalKeywords) * 100) : 0

  // Audit 준비도 (점수와 동일)
  const auditReadiness = score

  // 피드백 생성
  const feedback: string[] = []
  if (defectsCount === 0) {
    feedback.push("✅ 모든 필수 항목이 포함되어 있습니다.")
    feedback.push("✅ 심사 준비가 완료되었습니다.")
  } else {
    feedback.push(`⚠️ ${defectsCount}개의 필수 항목이 누락되었습니다.`)
    feedback.push(`📋 누락 항목: ${missingKeywords.join(", ")}`)
    if (defectsCount > 5) {
      feedback.push("❌ 심각한 결함이 있어 심사 통과가 어렵습니다.")
    } else if (defectsCount > 2) {
      feedback.push("⚠️ 심사 전 보완이 필요합니다.")
    } else {
      feedback.push("✓ 일부 보완 후 심사 가능합니다.")
    }
  }

  return {
    score,
    defects_count: defectsCount,
    missing_keywords: missingKeywords,
    audit_readiness: auditReadiness,
    feedback,
  }
}
