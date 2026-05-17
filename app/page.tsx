"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase, type Mood } from "@/lib/supabase";
import { extractWords } from "@/lib/words";
import BreathSurface from "@/components/BreathSurface";
import MoodForm from "@/components/MoodForm";
import GrainField from "@/components/GrainField";

export default function HomePage() {
  const [moods, setMoods] = useState<Mood[]>([]);
  const [total, setTotal] = useState(0);

  const fetchMoods = useCallback(async () => {
    const { data, count } = await supabase
      .from("moods")
      .select("id,text,created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(300);
    const list = (data ?? []) as Mood[];
    setMoods(list);
    setTotal(count ?? list.length);
  }, []);

  useEffect(() => {
    fetchMoods();
  }, [fetchMoods]);

  const words = useMemo(
    () => extractWords(moods.map((m) => m.text)),
    [moods]
  );

  return (
    <>
      <div className="pulseline" aria-hidden="true" />

      <header className="top">
        <span className="brand">
          호흡<span className="dot" />의 하루
        </span>
        <span className="counter">
          <b>{total.toLocaleString("ko-KR")}</b> 마음
        </span>
      </header>

      <main>
        <BreathSurface />

        <section className="turn">
          <div className="mark" />
          <p>
            <span className="nb">이제 차분히 내 마음을 발견하여</span>
            <br />
            <span className="nb">
              한 개의 단어 또는, 하나의 문장으로 기록합니다.
            </span>
          </p>
        </section>

        <MoodForm onSubmitted={fetchMoods} />

        <GrainField words={words} total={total} />
      </main>

      <footer className="bot">
        <div className="mark" />
        <div className="tagline">Daily Breaths, Mindful Thoughts</div>
        <div className="note">익명으로 기록됩니다</div>
      </footer>
    </>
  );
}
