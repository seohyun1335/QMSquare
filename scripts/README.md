# 데이터베이스 스키마 (참고용)

현재 애플리케이션은 **LocalStorage 기반**으로 작동하며, Supabase를 사용하지 않습니다.

만약 향후 Supabase로 마이그레이션하려면 아래 RLS 정책을 참고하세요:

## Documents 테이블 RLS 정책

```sql
-- documents 테이블에 대한 SELECT 정책
CREATE POLICY "Users can view their own documents"
ON documents
FOR SELECT
USING (auth.uid() = created_by);

-- documents 테이블에 대한 INSERT 정책
CREATE POLICY "Users can create documents"
ON documents
FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- documents 테이블에 대한 UPDATE 정책
CREATE POLICY "Users can update their own documents"
ON documents
FOR UPDATE
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- documents 테이블에 대한 DELETE 정책
CREATE POLICY "Users can delete their own documents"
ON documents
FOR DELETE
USING (auth.uid() = created_by);
```

## 환경 변수 설정 (Supabase 사용 시)

Vercel Dashboard → Project Settings → Environment Variables:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon public key
- `OPENAI_API_KEY`: OpenAI API 키 (AI 심사 기능)

## 현재 상태

- ✅ LocalStorage 기반으로 완전히 작동
- ✅ AI 심사 기능 (OpenAI API)
- ✅ 문서 생성/조회/수정/삭제
- ⚠️ 데이터는 브라우저에만 저장 (다른 기기에서 접근 불가)
