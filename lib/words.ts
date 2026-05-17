// 부담스럽거나 의미가 약한 단어를 흐름에서 제외.
// 사용자가 부담스러운 단어를 발견하면 여기에 추가.
const STOPWORDS = new Set<string>([
  // 활용형 — 동사/형용사
  "되는", "되다", "된다", "되어", "되었다", "됐다", "되며", "될",
  "하다", "한다", "해요", "합니다", "하는", "했다", "했어", "했어요", "하면",
  "해서", "할", "해도", "한", "함",
  "있다", "있는", "있어", "있어요", "있었", "있고", "있으면",
  "없다", "없는", "없어", "없어요", "없었",
  "같다", "같은", "같이", "같아", "같아요", "같았",
  "이다", "이고", "이며", "이지", "입니다", "입니까", "인", "이라", "이라서",
  "아니다", "아닌", "아니야", "아니에", "아니라",
  "보다", "보는", "본", "봤다", "봐요", "봤어",
  "가다", "간다", "가는", "갔다", "가서", "가면",
  "오다", "온다", "오는", "왔다",
  "주다", "준다", "주는", "줬다", "주는",
  // 연결사/접속사
  "그리고", "그래서", "하지만", "그러나", "그런데", "그래도", "그러면",
  "그러므로", "또는", "또", "아니면", "그러니까", "그러다",
  // 부사
  "정말", "진짜", "너무", "아주", "매우", "좀", "조금", "약간", "많이",
  "잘", "못", "그냥", "바로", "오히려", "아마", "혹시", "굳이", "벌써",
  "아직", "더", "덜", "이미", "곧", "자꾸", "거의", "그저", "막상", "별로",
  // 의존명사/지시어
  "것", "수", "때", "곳", "듯", "편", "뿐", "만큼",
  "이것", "그것", "저것", "이거", "그거", "저거",
  "이런", "그런", "저런", "어떤", "무슨",
  "이렇게", "그렇게", "저렇게", "어떻게",
  "여기", "거기", "저기",
  // 사용자 직접 지적
  "덕분에", "덕분",
  // 너무 일반적인 명사
  "오늘", "어제", "내일", "지금", "나중", "아까",
  // 1인칭
  "나", "내", "너", "우리", "저",
]);

// 단어 끝에서 흔한 한국어 조사 떼기 (안전한 것만).
const PARTICLES = [
  "으로는", "에서는", "에서도", "에서의", "에서",
  "으로", "이라는", "이라고", "라는", "라고",
  "에게", "에서", "으로", "에는", "이라", "이고",
  "은", "는", "이", "가", "을", "를", "에", "의",
  "도", "만", "와", "과", "랑", "이나", "나",
];

function stripParticle(word: string): string {
  for (const p of PARTICLES) {
    if (word.endsWith(p) && word.length >= p.length + 2) {
      return word.slice(0, -p.length);
    }
  }
  return word;
}

// 정중체/평어체 종결어미로 끝나는 단어는 거의 동사/형용사.
function isVerbForm(word: string): boolean {
  if (
    /(에요|예요|이에요|이예요|입니다|입니까|합니다|해요|아요|어요|네요|군요|구나|할까|할게|할래|어라|아라|어서|아서)$/.test(
      word
    )
  )
    return true;
  // 평어체 종결 — 3자 이상이면서 '다'로 끝나는 단어는 거의 동사/형용사.
  if (word.length >= 3 && word.endsWith("다")) return true;
  return false;
}

export function extractWords(texts: string[]): string[] {
  const out = new Set<string>();
  for (const t of texts) {
    if (!t) continue;
    const tokens = t
      .split(/[\s,.!?·…"'"'()\[\]{}<>‘’“”、。\-—_]+/u)
      .filter(Boolean);
    for (let tok of tokens) {
      if (tok.length < 2) continue;
      const stripped = stripParticle(tok);
      const candidate = stripped.length >= 2 ? stripped : tok;
      if (candidate.length < 2) continue;
      // 한글(완성형/자모) / 영문 / 숫자만 허용 — mojibake (`�` 등) 자동 차단
      if (!/^[가-힯ㄱ-ㆎa-zA-Z0-9]+$/.test(candidate)) continue;
      if (STOPWORDS.has(candidate)) continue;
      if (STOPWORDS.has(tok)) continue;
      if (isVerbForm(candidate)) continue;
      out.add(candidate);
    }
  }
  return Array.from(out);
}
