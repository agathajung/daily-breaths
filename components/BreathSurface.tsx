"use client";

import { useEffect, useRef } from "react";

const IN_S = 4;
const OUT_S = 6;
const CYCLE = IN_S + OUT_S;
const STEPS = 3;
const TOTAL = CYCLE * STEPS;

export default function BreathSurface() {
  const ticksRef = useRef<HTMLDivElement>(null);
  const phaseInRef = useRef<HTMLDivElement>(null);
  const phaseOutRef = useRef<HTMLDivElement>(null);
  const lblInRef = useRef<HTMLSpanElement>(null);
  const lblOutRef = useRef<HTMLSpanElement>(null);
  const stepsRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const ticksEl = ticksRef.current;
    const phaseIn = phaseInRef.current;
    const phaseOut = phaseOutRef.current;
    const lblIn = lblInRef.current;
    const lblOut = lblOutRef.current;
    const stepsEl = stepsRef.current;
    if (!ticksEl || !phaseIn || !phaseOut || !lblIn || !lblOut || !stepsEl)
      return;

    // build 10 ticks (4 in + 6 out)
    ticksEl.innerHTML = "";
    for (let i = 0; i < IN_S; i++) {
      const t = document.createElement("div");
      t.className = "tick in";
      t.dataset.k = "in" + i;
      t.innerHTML = '<div class="fill"></div>';
      ticksEl.appendChild(t);
    }
    for (let i = 0; i < OUT_S; i++) {
      const t = document.createElement("div");
      t.className = "tick out";
      t.dataset.k = "out" + i;
      t.innerHTML = '<div class="fill"></div>';
      ticksEl.appendChild(t);
    }
    const tickEls = Array.from(ticksEl.children) as HTMLElement[];
    const stepEls = Array.from(
      stepsEl.querySelectorAll(".step")
    ) as HTMLElement[];

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduced) {
      phaseIn.classList.add("active");
      lblIn.classList.add("cur");
      tickEls.forEach((el) => el.classList.add("lit"));
      stepEls[0]?.classList.add("active");
      return;
    }

    let lastPhase: "in" | "out" | null = null;
    let lastStep = -1;
    let raf = 0;

    function setPhase(p: "in" | "out") {
      if (p === lastPhase) return;
      lastPhase = p;
      if (!phaseIn || !phaseOut || !lblIn || !lblOut) return;
      if (p === "in") {
        phaseOut.classList.remove("active", "breathing");
        phaseIn.classList.add("active");
        requestAnimationFrame(() => phaseIn.classList.add("breathing"));
        lblIn.classList.add("cur");
        lblOut.classList.remove("cur");
      } else {
        phaseIn.classList.remove("active", "breathing");
        phaseOut.classList.add("active");
        phaseOut.style.transition = "none";
        phaseOut.style.letterSpacing = "0.55em";
        requestAnimationFrame(() => {
          phaseOut.style.transition = "";
          phaseOut.style.letterSpacing = "";
          phaseOut.classList.add("breathing");
        });
        lblOut.classList.add("cur");
        lblIn.classList.remove("cur");
      }
    }

    function setStep(s: number) {
      if (s === lastStep) return;
      lastStep = s;
      stepEls.forEach((el, i) => {
        el.classList.toggle("active", i === s);
        el.classList.toggle("done", i < s);
      });
    }

    function loop(now: number) {
      const t = (now / 1000) % TOTAL;
      const step = Math.floor(t / CYCLE);
      const inCycle = t - step * CYCLE;
      const phase: "in" | "out" = inCycle < IN_S ? "in" : "out";

      setStep(step);
      setPhase(phase);

      let activeIdx: number;
      if (phase === "in") {
        activeIdx = Math.floor(inCycle);
      } else {
        activeIdx = IN_S + Math.floor(inCycle - IN_S);
      }

      tickEls.forEach((el, i) => {
        el.classList.remove("cur");
        if (i < activeIdx) {
          el.classList.add("lit");
        } else if (i === activeIdx) {
          el.classList.add("lit", "cur");
        } else {
          el.classList.remove("lit");
        }
      });

      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="session" aria-label="호흡 가이드">
      <h1 className="opener">
        <span className="nb">오늘 당신은</span>
        <br />
        <span className="nb">어떠한 마음인가요.</span>
        <span className="small">
          <span className="nb">우선, 잠시 멈추어</span>
          <br />
          <span className="nb-nowrap">호흡을 크게 3번 이어갑니다.</span>
        </span>
      </h1>

      <div className="breath-surface">
        <div className="breath-meta">
          <span>breath · 호흡</span>
          <span className="right">
            숨을 4카운트로 <b>IN</b>, 6카운트로 <b>OUT</b>
          </span>
        </div>

        <div className="phase-stage" aria-hidden="true">
          <div className="phase" ref={phaseInRef} data-mode="in">
            들&nbsp;숨
          </div>
          <div className="phase" ref={phaseOutRef} data-mode="out">
            날&nbsp;숨
          </div>
        </div>

        <div className="ticks" ref={ticksRef} aria-hidden="true" />
        <div className="ticks-labels">
          <span className="l-in" ref={lblInRef}>
            IN<b>4</b>
          </span>
          <span className="l-out" ref={lblOutRef}>
            OUT<b>6</b>
          </span>
        </div>

        <ol className="steps" ref={stepsRef}>
          <li className="step" data-step="0">
            <span className="num">하나</span>
            <span className="body">마시고 내쉬고,</span>
          </li>
          <li className="step" data-step="1">
            <span className="num">둘</span>
            <span className="body">
              마시며 복부가 올라가고 내쉬며 복부가 내려가고,
            </span>
          </li>
          <li className="step" data-step="2">
            <span className="num">마지막</span>
            <span className="body">
              코로 깊게 마시며 코로 길게 내쉬어 줍니다.
            </span>
          </li>
        </ol>
      </div>
    </section>
  );
}
