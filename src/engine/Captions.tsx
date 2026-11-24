// One-word captions (the measured style: one or two words at a time, heavy white type, dark outline, ~70% down).
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, delayRender, continueRender } from "remotion";

// Montserrat 800/900 — تحميل آمن بلا اعتماد على @remotion/google-fonts:
// يُحمَّل الخط من Google Fonts مع ضمان الاستمرار خلال 8 ثوانٍ حتى لو تعذّر الشبكة (يُستخدم خط احتياطي).
const FALLBACK = `"Montserrat", "Arial Black", "Helvetica Neue", sans-serif`;
let fontFamily = FALLBACK;
if (typeof document !== "undefined" && !(window as any).__montLoaded) {
  (window as any).__montLoaded = true;
  const handle = delayRender("montserrat-font", { timeoutInMilliseconds: 60000 });
  let settled = false;
  const done = () => { if (!settled) { settled = true; continueRender(handle); } };
  try {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@800;900&display=block";
    document.head.appendChild(link);
    const timer = setTimeout(done, 8000);
    Promise.all([
      (document as any).fonts.load('800 70px "Montserrat"'),
      (document as any).fonts.load('900 70px "Montserrat"'),
    ])
      .then(() => { clearTimeout(timer); fontFamily = `"Montserrat", ${FALLBACK}`; done(); })
      .catch(() => { clearTimeout(timer); done(); });
  } catch { done(); }
}

export type Word = { w: string; start: number; end: number };

// Short words ride along with the next word so nothing flashes for 2 frames
export function groupWords(words: Word[], minDur = 0.22): Word[] {
  const out: Word[] = [];
  for (const w of words) {
    const last = out[out.length - 1];
    if (last && last.end - last.start < minDur && (last.w + " " + w.w).length <= 14 && !/[.?!]$/.test(last.w)) { last.w += " " + w.w; last.end = w.end; }
    else out.push({ ...w });
  }
  return out;
}

export const Captions: React.FC<{ words: Word[]; y?: number; size?: number }> = ({ words, y = 0.8, size = 70 }) => {   // 2026-11-05 user: smaller and lower so the picture stays clear (was 0.75 / 86)
  const frame = useCurrentFrame();
  const { fps, height, width } = useVideoConfig();
  const t = frame / fps;
  const g = groupWords(words);
  const cur = g.find((w) => t >= w.start && t < w.end + 0.04);
  if (!cur) return null;
  const k = interpolate(t - cur.start, [0, 0.07, 0.13], [0.8, 1.08, 1], { extrapolateRight: "clamp" });
  const text = cur.w.replace(/[,]$/, "");
  const scale = Math.min(width, height) / 1080;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: height * y, left: 0, right: 0, textAlign: "center", transform: `translateY(-50%) scale(${k})` }}>
        <span style={{ fontFamily, fontWeight: 900, fontSize: size * scale, color: "#ffffff", letterSpacing: -0.5,
          WebkitTextStroke: `${11 * scale}px #111014`, paintOrder: "stroke fill", textShadow: `0 ${6 * scale}px ${10 * scale}px rgba(0,0,0,0.45)` }}>{text}</span>
      </div>
    </AbsoluteFill>
  );
};
