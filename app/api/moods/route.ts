import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// 광고/스팸/연락처 패턴
const BLOCKED_PATTERNS: RegExp[] = [
  /https?:\/\//i,
  /www\./i,
  /\.(com|net|org|kr|io|app|co|me|biz|info|xyz|shop)\b/i,
  /\b01[016789]-?\d{3,4}-?\d{4}\b/, // 휴대폰
  /카톡\s*[:：]?\s*\S+/i,
  /오픈\s*카톡/i,
  /텔레\s*그?램?\s*[:：]?\s*\S+/i,
  /라인\s*ID\s*[:：]?\s*\S+/i,
  /@\S+\.\S+/, // 이메일 패턴
];

// 욕설·혐오·광고 키워드 (필요시 추가/수정)
const BLOCKED_WORDS: string[] = [
  // 욕설
  "시발", "씨발", "ㅅㅂ", "ㅆㅂ", "시바", "씨바", "쉬발",
  "존나", "졸라", "ㅈㄴ", "좆", "ㅈ같",
  "병신", "ㅂㅅ", "븅신",
  "개새", "새끼", "ㅅㄲ", "ㄱㅅㄲ",
  "미친놈", "미친년", "ㅁㅊ",
  "꺼져", "닥쳐", "엿먹",
  "지랄", "ㅈㄹ",
  "fuck", "shit", "bitch", "asshole",
  // 혐오/조롱
  "한남", "한녀", "맘충", "급식충", "틀딱", "잼민이충",
  "김치녀", "된장녀",
  // 광고/스팸 키워드
  "대출", "도박", "카지노", "바카라", "토토사이트", "슬롯머신",
  "코인리딩", "리딩방", "주식리딩",
  "비아그라", "시알리스", "viagra", "cialis",
  "성인사이트", "야동",
];

function isBlocked(text: string): boolean {
  for (const p of BLOCKED_PATTERNS) if (p.test(text)) return true;
  const normalized = text.toLowerCase().replace(/\s+/g, "");
  for (const w of BLOCKED_WORDS) {
    if (normalized.includes(w.toLowerCase().replace(/\s+/g, ""))) return true;
  }
  return false;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const raw =
    typeof (body as { text?: unknown })?.text === "string"
      ? ((body as { text: string }).text as string)
      : "";
  const text = raw.trim();

  if (!text) {
    return NextResponse.json({ error: "empty" }, { status: 400 });
  }
  if (text.length > 140) {
    return NextResponse.json({ error: "too_long" }, { status: 400 });
  }
  if (isBlocked(text)) {
    return NextResponse.json({ error: "blocked" }, { status: 400 });
  }

  const { error } = await supabase.from("moods").insert({ text });
  if (error) {
    return NextResponse.json({ error: "db" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
