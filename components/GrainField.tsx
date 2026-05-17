"use client";

import { useEffect, useState } from "react";

type Props = {
  words: string[];
  total: number;
};

// 단어별 일관된 해시 (같은 단어 = 항상 같은 fade 톤). 결의 자연스러움.
function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h * 31) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const FADES = ["fresh", "", "fade1", "fade2", "fade3"] as const;
function fadeClass(word: string): string {
  return FADES[hashCode(word) % FADES.length];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function GrainField({ words, total }: Props) {
  const [shuffled, setShuffled] = useState<string[]>([]);

  useEffect(() => {
    setShuffled(shuffle(words));
  }, [words]);

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
            {shuffled.map((w, i) => (
              <span key={w} className={fadeClass(w)}>
                {w}
                {i < shuffled.length - 1 ? "· " : ""}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
