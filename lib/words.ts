// 흐름에서 제외할 단어. 부담스럽거나 의미가 약한 표현.
// 새 단어가 거슬리면 여기에 추가.
const STOPWORDS = new Set<string>([
  // 사용자 직접 지적
  "되는", "덕분에", "덕분", "되기",
  // 활용형 — 동사/형용사
  "되다", "된다", "되어", "되었다", "됐다", "되며", "될",
  "하다", "한다", "해요", "합니다", "하는", "했다", "했어", "했어요",
  "하면", "해서", "할", "해도", "한", "함",
  "있다", "있는", "있어", "있어요", "있었", "있고", "있으면",
  "없다", "없는", "없어", "없어요", "없었",
  "같다", "같은", "같이", "같아", "같아요", "같았",
  "이다", "이고", "이며", "이지", "입니다", "입니까", "인", "이라", "이라서",
  "아니다", "아닌", "아니야", "아니에", "아니라",
  "보다", "보는", "본", "봤다", "봐요", "봤어",
  "가다", "간다", "가는", "갔다", "가서", "가면",
  "오다", "온다", "오는", "왔다",
  "주다", "준다", "주는", "줬다",
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
  // 1자 노이즈 (지시·수·관형)
  "그", "이", "저", "한", "두", "세", "및",
  // 신체 상태 / 생리 욕구 — 마음 흐름에서 제외 (DB 저장은 그대로).
  // 활용형(배고파요/졸려요/피곤해요)은 isVerbForm 정규식으로 별도 차단.
  "배고파", "배고픈", "배고픔", "시장기", "허기",
  "졸려", "졸린", "졸림", "졸음",
  "피곤", "피로", "피곤한",
  "갈증", "목마름", "목말라",
  "추위", "더위", "추워", "더워",
  "통증", "아픔", "두통", "복통", "요통",
  // 너무 일반적인 명사
  "오늘", "어제", "내일", "지금", "나중", "아까",
  // 인칭 — '나'와 '내'는 사용자가 표시 원함(NORMALIZE로 '나'로 통합), '저', '너'만 제외
  "너", "저", "우리",
]);

// 단어 정규화. '내가' → '내' → '나'처럼 같은 의미를 한 단어로 모음.
const NORMALIZE: Record<string, string> = {
  "내": "나",
  "제": "저",
};

// 조사 — 긴 것 먼저 매칭.
const PARTICLES = [
  "에서는", "에게서", "으로서", "으로는", "에서도", "에서의",
  "이라는", "이라고", "라는", "라고",
  "에게", "에서", "으로", "에는", "이라", "이고",
  "은", "는", "이", "가", "을", "를", "에", "의",
  "도", "만", "와", "과", "랑", "이나", "나", "로",
];

// 동사화 접미사 — 'X하' 형태에서 X(명사)만 남기기. 긴 것 먼저.
// 떼고 나서 명사가 2자 이상 남는 경우에만 적용 (오해→오, 이해→이 같은 손실 방지).
const VERB_SUFFIXES = [
  "하는", "하기", "하다", "하면", "해서", "한다", "했다",
  "해요", "합니다", "한", "할", "해", "하",
];

function strip(word: string): string {
  let w = word;
  for (const p of PARTICLES) {
    if (w.endsWith(p) && w.length - p.length >= 1) {
      w = w.slice(0, -p.length);
      break;
    }
  }
  for (const s of VERB_SUFFIXES) {
    if (w.endsWith(s) && w.length - s.length >= 2) {
      w = w.slice(0, -s.length);
      break;
    }
  }
  return w;
}

function normalize(w: string): string {
  return NORMALIZE[w] ?? w;
}

// 한국어 동사/형용사 활용형 — 종결어미·연결어미·부사화 어미 차단.
function isVerbForm(word: string): boolean {
  // 명시적 종결어미 (정중체 + 평어체 + 명령형 + 청유)
  if (
    /(에요|예요|이에요|이예요|입니다|입니까|합니다|해요|아요|어요|네요|군요|구나|할까|할게|할래|어라|아라|어서|아서)$/.test(
      word
    )
  )
    return true;
  // 2자 이상 + '요' 종결 (와요/가요/해요 등 정중체)
  if (word.length >= 2 && word.endsWith("요")) return true;
  // 3자 이상 + '다' 종결 (평어체)
  if (word.length >= 3 && word.endsWith("다")) return true;
  // 3자 이상 + 연결어미 (더워서/더우면/더우니까/덥지만/그런데/그러며)
  if (word.length >= 3 && /(서|면|며|니까|지만|는데)$/.test(word)) return true;
  // 3자 이상 + 부사화 '히' (차분히/조용히/은근히)
  if (word.length >= 3 && word.endsWith("히")) return true;
  return false;
}

export function extractWords(texts: string[]): string[] {
  const out = new Set<string>();
  for (const t of texts) {
    if (!t) continue;
    const tokens = t
      .split(/[\s,.!?·…"'"'()\[\]{}<>‘’“”、。\-—_]+/u)
      .filter(Boolean);
    for (const tok of tokens) {
      if (tok.length < 1) continue;
      const stripped = strip(tok);
      const candidate = normalize(stripped || tok);
      if (!candidate) continue;
      // 한글(완성형/자모) / 영문 / 숫자만 허용 — mojibake 자동 차단.
      if (!/^[가-힯ㄱ-ㆎa-zA-Z0-9]+$/.test(candidate)) continue;
      if (STOPWORDS.has(candidate)) continue;
      if (STOPWORDS.has(tok)) continue;
      if (isVerbForm(candidate)) continue;
      out.add(candidate);
    }
  }
  return Array.from(out);
}
