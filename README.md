# QMSquare eQMS - AI 기반 품질관리 시스템

의료기기 품질관리 문서를 AI로 자동 심사하는 시스템입니다.

## 🚀 주요 기능

- **AI 문서 심사**: SOP, DV Protocol, CAPA 등 품질 문서를 ISO 13485 / 21 CFR 820 기준으로 자동 분석
- **규제 준수 체크**: 문서 승인, 개정, 배포, 보관, 접근권한 등 6대 카테고리 검증
- **효율성 분석**: 수기 작성 vs QMSquare 사용 비교 및 ROI 계산
- **문서 관리**: 버전 관리, 상태 추적, 파일 첨부 지원

## 🛠️ 기술 스택

- **프레임워크**: Next.js 15 (App Router)
- **UI**: Tailwind CSS v4, shadcn/ui
- **데이터베이스**: Supabase (PostgreSQL + RLS)
- **AI**: OpenAI API (GPT-4o-mini)
- **배포**: Vercel

## 📦 설치 및 실행

### 1. 저장소 클론

```bash
git clone <repository-url>
cd qmsquare
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

Vercel Dashboard → Settings → Environment Variables에서 다음 변수들을 설정하세요:

**필수 (Supabase):**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key

**선택 (OpenAI):**
- `OPENAI_API_KEY` - OpenAI API 키 (없으면 데모 모드로 작동)

### 4. 로컬 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

## 🗄️ 데이터베이스 설정

Supabase를 사용하므로 모든 환경(로컬, 배포)에서 동일한 데이터를 공유합니다.

### RLS (Row Level Security) 정책

`scripts/` 폴더의 SQL 파일들이 이미 RLS 정책을 포함하고 있습니다:
- 사용자는 자신이 생성한 문서만 조회/수정/삭제 가능
- `created_by = auth.uid()` 조건으로 보안 강화

## 🌐 배포

### Vercel 배포

1. Vercel에 프로젝트 연결
2. Environment Variables 설정
3. 자동 배포 완료

### 배포 후 확인사항

- Supabase URL/Key가 올바르게 설정되었는지 확인
- 문서 생성 및 AI 심사가 정상 작동하는지 테스트
- 모든 페이지(/documents, /dashboard, /efficiency)가 로드되는지 확인

## 📝 사용 방법

1. **회원가입/로그인** (선택사항 - 현재는 RLS만 활성화)
2. **문서 생성**: /documents에서 "새 문서" 버튼 클릭
3. **파일 업로드**: TXT, DOCX 파일 첨부 (PDF는 현재 미지원)
4. **AI 심사**: 문서 상세 페이지에서 "AI 심사 시작" 클릭
5. **결과 확인**: 비교 요약, 규제 체크리스트, 지적사항 등 확인

## 🔧 문제 해결

### "문서를 찾을 수 없습니다" 오류

- Supabase 연결 상태 확인
- 환경 변수가 올바르게 설정되었는지 확인
- RLS 정책으로 인해 다른 사용자의 문서가 보이지 않을 수 있음

### AI 심사가 작동하지 않음

- `OPENAI_API_KEY`가 설정되어 있는지 확인
- API 키가 없으면 자동으로 데모 모드로 작동
- 파일이 TXT 또는 DOCX 형식인지 확인

## 📄 라이선스

MIT License

## 🤝 기여

이슈 및 PR은 언제나 환영합니다!
