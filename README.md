# 호흡의 하루와 마음의 기록

**Daily Breaths, Mindful Thoughts**

오늘의 마음을 호흡과 함께 한 줄로 기록하고, 함께 쌓이는 마음의 흐름을 봅니다.

---

## 기술 스택

- Next.js 14 (App Router, TypeScript)
- Supabase (Postgres + RLS)
- Vercel (호스팅)
- Pretendard 폰트

## Phase 1 기능

- 익명 입력 (한 단어 또는 한 문장, 최대 140자)
- 자동 시간 기록
- 워드클라우드 (자체 구현, 외부 라이브러리 X)
- 최근 마음 10개 흐름
- 오늘/전체 카운터
- 모바일 반응형

---

## 셋업 (사용자 액션 필요)

### 1) Supabase 프로젝트 생성

1. https://supabase.com 가입·로그인
2. New Project 생성 (리전: **Northeast Asia (Seoul)** 권장)
3. Settings → API → **Project URL** + **anon public key** 복사

### 2) DB 스키마 적용

Supabase 대시보드 → **SQL Editor** → `supabase/schema.sql` 내용 전체 복사 → Run.

### 3) 환경 변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local`을 열어 1)에서 받은 키 입력:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx...
```

### 4) 로컬 실행

```bash
npm install
npm run dev
```

http://localhost:3000 접속.

### 5) GitHub Push

```bash
git init
git add .
git commit -m "Phase 1: 호흡의 하루와 마음의 기록 MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/daily-breaths.git
git push -u origin main
```

### 6) Vercel 배포

1. https://vercel.com → New Project
2. GitHub repo 선택
3. **Environment Variables**에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 동일하게 추가
4. Deploy 클릭 → 약 1-2분 후 `xxx.vercel.app` URL 발급

---

## 폴더 구조

```
daily-breaths/
├── app/
│   ├── layout.tsx       # Pretendard 폰트, 메타
│   ├── page.tsx         # 메인 페이지 (호흡 인트로 + 폼 + 워드클라우드 + 최근)
│   └── globals.css      # 디자인 시스템
├── components/
│   ├── MoodForm.tsx     # 입력 폼 + Supabase insert
│   ├── WordCloud.tsx    # 자체 구현 워드클라우드
│   └── RecentMoods.tsx  # 최근 10개 흐름
├── lib/
│   ├── supabase.ts      # Supabase 클라이언트
│   └── words.ts         # 단어 추출 + 시간 포맷 + isToday
├── supabase/
│   └── schema.sql       # Phase 1 DB 스키마 + RLS
├── .env.local.example
├── .gitignore
├── next.config.js
├── package.json
├── tsconfig.json
└── README.md
```

---

## 점진 확장 로드맵 (참고)

자세한 내용은 `~/.claude/plans/tapas-precious-beacon.md` 참고.

| Phase | 추가 기능 |
|---|---|
| 1 (현재) | 익명 입력 + 워드클라우드 + 최근 흐름 |
| 2 | Claude API 감정 분류, 시간대별 차트, 감정 분포 도넛 |
| 3 | 가입 + 본인 마음 흐름 페이지 + 이메일 알림 (사용자가 시간 설정) |
| 4 | 웹 푸시 알림, 감각적 시각화 (애니메이션·동적 컬러·BGM) |
| 5 | 카카오 알림톡, 마인드 체력장 검사 결과 결합 |

---

## 라이센스

(추후 결정)
