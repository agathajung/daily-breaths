"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  onSubmitted?: () => void;
};

const ERROR_MSG: Record<string, string> = {
  blocked: "광고·욕설 등은 기록할 수 없어요.",
  too_long: "140자 이내로 적어 주세요.",
  empty: "한 단어 또는 한 문장을 적어 주세요.",
};

export default function MoodForm({ onSubmitted }: Props) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<{ msg: string; err: boolean } | null>(
    null
  );
  const [dateLabel, setDateLabel] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    const d = new Date();
    setDateLabel(
      d.getFullYear() +
        "." +
        String(d.getMonth() + 1).padStart(2, "0") +
        "." +
        String(d.getDate()).padStart(2, "0")
    );
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  function autoSize() {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(120, ta.scrollHeight) + "px";
  }

  function showToast(msg: string, err = false) {
    setToast({ msg, err });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3500);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    let res: Response | null = null;
    try {
      res = await fetch("/api/moods", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: trimmed.slice(0, 140) }),
      });
    } catch {
      setSending(false);
      showToast("기록을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.", true);
      return;
    }
    setSending(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      const msg =
        (data?.error && ERROR_MSG[data.error]) ||
        "기록을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.";
      showToast(msg, true);
      return;
    }
    setText("");
    requestAnimationFrame(autoSize);
    showToast("마음이 모였어요. 오늘도 함께해 주셔서 감사합니다.");
    onSubmitted?.();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const form = (e.currentTarget as HTMLTextAreaElement).form;
      form?.requestSubmit();
    }
  }

  const n = text.length;
  const disabled = !text.trim() || sending;

  return (
    <section className="compose">
      <div className="eyebrow">
        <span>compose · 한 호흡, 한 줄</span>
        <span className="num">{dateLabel}</span>
      </div>
      <div className="prompt">지금 떠오른 마음을 적어 주세요.</div>
      <form className="form-row" onSubmit={submit}>
        <textarea
          ref={taRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            requestAnimationFrame(autoSize);
          }}
          onKeyDown={onKeyDown}
          maxLength={140}
          rows={1}
          placeholder="한 단어 또는 한 문장"
          autoComplete="off"
          aria-label="오늘의 마음 한 줄"
        />
        <button type="submit" disabled={disabled}>
          기록하기<span className="arrow">↵</span>
        </button>
      </form>
      <div className="form-meta">
        <span>익명 · 한 번의 호흡으로</span>
        <span className={"count" + (n > 120 ? " over" : "")}>{n} / 140</span>
      </div>
      <div
        className={
          "toast" + (toast ? " show" : "") + (toast?.err ? " err" : "")
        }
        role="status"
        aria-live="polite"
      >
        {toast?.msg ?? ""}
      </div>
    </section>
  );
}
