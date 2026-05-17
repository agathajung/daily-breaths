import type { Mood } from "@/lib/supabase";

type Props = {
  moods: Mood[];
  total: number;
};

function fadeClass(i: number, n: number): string {
  const ratio = i / Math.max(n, 1);
  if (ratio < 0.04) return "fresh";
  if (ratio < 0.18) return "";
  if (ratio < 0.45) return "fade1";
  if (ratio < 0.75) return "fade2";
  return "fade3";
}

export default function GrainField({ moods, total }: Props) {
  const empty = moods.length === 0;
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
            {moods.map((m, i) => (
              <span key={m.id} className={fadeClass(i, moods.length)}>
                {m.text}
                {i < moods.length - 1 ? "· " : ""}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
