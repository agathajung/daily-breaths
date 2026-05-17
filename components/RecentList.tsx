"use client";

import { useEffect, useState } from "react";
import type { Mood } from "@/lib/supabase";

type Props = {
  moods: Mood[];
};

function fmtRel(iso: string): string {
  const t = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - t);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금";
  if (m < 60) return m + "분 전";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "시간 전";
  const d = Math.floor(h / 24);
  if (d < 7) return d + "일 전";
  const dt = new Date(iso);
  return dt.getMonth() + 1 + "월 " + dt.getDate() + "일";
}

export default function RecentList({ moods }: Props) {
  const top10 = moods.slice(0, 10);

  // hydration-safe: render times only after mount so server/client agree.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="recent">
      <h2>최근 기록</h2>
      <div className="sub">recent ten breaths</div>
      <ul className="recent-list">
        {top10.map((m, i) => (
          <li key={m.id} className={i === 0 ? "fresh" : ""}>
            <span className="idx">{String(i + 1).padStart(2, "0")}</span>
            <span className="text">{m.text}</span>
            <span className="when">{mounted ? fmtRel(m.created_at) : ""}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
