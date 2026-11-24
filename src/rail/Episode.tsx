// ============================================================
// Episode.tsx — الحلقة الكاملة 1955 إطارًا (65.167 ث @30fps)
// تسلسل اللقطات + التلاشيات المتقاطعة + الوميض + الويب + التسميات
// ============================================================
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";
import { Stage } from "../engine/Stage";
import { Captions } from "../engine/Captions";
import { ALL_SHOTS, TOTAL_FRAMES, type Shot } from "./shots";
import { CAPTION_WORDS } from "./captions";

export const totalFrames = () => TOTAL_FRAMES;

// التلاشيات المتقاطعة من التحليل: f405–407, f933–935, f1433–1441, f1778–1783
const FADE_IN: Record<number, number> = { 13: 3, 26: 3, 33: 9, 38: 6 }; // id → إطارات الذوبان عند بدايته
const FADE_START: Record<number, number> = { 13: 405, 26: 933, 33: 1433, 38: 1778 };

const span = (s: Shot) => {
  const st = FADE_START[s.id];
  return st !== undefined ? { from: st, dur: s.dur + (s.from - st) + 2 } : { from: s.from, dur: s.dur };
};

const Fade: React.FC<{ fadeIn?: number; children: React.ReactNode }> = ({ fadeIn = 0, children }) => {
  const f = useCurrentFrame();
  const op = fadeIn > 0 ? interpolate(f, [0, fadeIn - 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  return <AbsoluteFill style={{ opacity: op }}>{children}</AbsoluteFill>;
};

const ShotView: React.FC<{ shot: Shot }> = ({ shot }) => (
  <Fade fadeIn={FADE_IN[shot.id] ?? 0}>
    <Stage look={shot.look} cam={shot.cam} dur={span(shot).dur} focus={shot.focus}>
      <shot.Body dur={span(shot).dur} />
    </Stage>
  </Fade>
);

// وخطوط التشويش (الويب) — 9 مرّات من التحليل
const STREAKS: Array<[number, number]> = [
  [294, 301], [624, 647], [720, 722], [1005, 1015], [1088, 1103],
  [1321, 1335], [1512, 1535], [1688, 1735], [1927, 1935],
];
const Streaks: React.FC = () => {
  const f = useCurrentFrame();
  if (!STREAKS.some(([a, b]) => f >= a && f <= b)) return null;
  return (
    <AbsoluteFill style={{ opacity: 0.45, pointerEvents: "none" }}>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute", top: (i * 127) % 1280, left: 0, width: 720, height: 7 + (i % 3) * 5,
          background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0) 100%)",
        }} />
      ))}
    </AbsoluteFill>
  );
};

// وميض أبيض (من التحليل)
const FLASHES: Array<[number, number]> = [[221, 226], [300, 302], [685, 691], [808, 813], [1321, 1335], [1928, 1932]];
const Flashes: React.FC = () => {
  const f = useCurrentFrame();
  if (!FLASHES.some(([a, b]) => f >= a && f < b)) return null;
  return <AbsoluteFill style={{ backgroundColor: "#ffffff", opacity: 0.42, pointerEvents: "none" }} />;
};

export const Episode: React.FC<{ captions?: boolean }> = ({ captions = true }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {ALL_SHOTS.map((s) => {
      const sp = span(s);
      return (
        <Sequence key={s.id} from={sp.from} durationInFrames={sp.dur} name={`shot ${s.id}`}>
          <ShotView shot={s} />
        </Sequence>
      );
    })}
    <Streaks />
    <Flashes />
    {captions ? <Captions words={CAPTION_WORDS} y={0.72} size={72} /> : null}
  </AbsoluteFill>
);
