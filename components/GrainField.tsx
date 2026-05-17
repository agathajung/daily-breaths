"use client";

import { useEffect, useMemo, useState } from "react";
import type { Mood } from "@/lib/supabase";

type Props = {
  moods: Mood[];
  total: number;
};

// 24시간 시간 흐림 — 갓 적은 글은 흐름에 합류하지 않음.
// 모든 사용자에게 동일한 규칙이라 자기 글 식별 불가.
const FRESH_HIDE_MS = 24 * 60 * 60 * 1000;

// 같은 표현은 항상 같은 fade 톤 (결의 자연스러움 유지).
function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h * 31) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const FADES = ["fresh", "", "fade1", "fade2", "fade3"] as const;
function fadeClass(text: string): string {
  return FADES[hashCode(text) % FADES.length];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function GrainField({ moods, total }: Props) {
  const [shuffled, setShuffled] = useState<Mood[]>([]);

  // 24시간 이상 된 글만 흐름에 노출. 클라이언트에서 필터.
  const settled = useMemo(() => {
    const now = Date.now();
    return moods.filter(
      (m) => now - new Date(m.created_at).getTime() >= FRESH_HIDE_MS
    );
  }, [moods]);

  useEffect(() => {
    setShuffled(shuffle(settled));
  }, [settled]);

  const empty = shuffled.length === 0;
  const count = total.toLocaleString("ko-KR");

  return (
    <section className="grain">
      <div className="grain-head">
        <h2>마음의 흐름</h2>
        <span className="meta">flow · {count}</span>
      </div>
      <div className="sub">모든 호흡이 모여 만드는 흐름.</div>
      <div className="grain-field">
        {empty ? (
          <div className="grain-empty">
            <div className="mark" />
            <div>
              첫 호흡이 시작되면
              <br />
              이곳에 마음의 단어가 모입니다.
            </div>
          </div>
        ) : (
          <div className="grain-inner">
            {shuffled.map((m, i) => (
              <span key={m.id} className={fadeClass(m.text)}>
                {m.text}
                {i < shuffled.length - 1 ? "· " : ""}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
