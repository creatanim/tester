// ============================================================
// shots.tsx — 40 لقطة (L01–L40) بنفس توقيتات التحليل الإطار-بإطار
// كل لقطة: إضاءة (Look)، انزلاق كاميرا (CamKeys)، بؤرة، محتوى.
// الإجمالي 1955 إطارًا @30fps = 65.167 ثانية.
// ============================================================
import React from "react";
import * as THREE from "three";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { CamKeys, Look, V3 } from "../engine/Stage";
import { Toon } from "../engine/Toon";
import { Box, Cyl, Sign, Snow, Fire, Lamp } from "../engine/kit";
import { painted } from "../engine/tex";
import {
  makeSky, Canyon, Bay, Desert, StationExt, Hall, Ridge, DeckPlatform,
  LuxuryCar, CarWindowWall, ShortLineCar, Trestle, Rails, Locomotive7,
  Telegraph, Cactus, Caliper, CraneArm, PerfectDeck, DeckChair, SunsetBridge,
  Train, CalendarCart, BlueFlag, Smoke, Sparks, AngerSteam, Fireball,
} from "./sets";
import { C } from "./cast";

export type Shot = { id: number; from: number; dur: number; look: Look; cam: CamKeys; focus: number; Body: React.FC<{ dur: number }> };

const useT = () => { const f = useCurrentFrame(); const { fps } = useVideoConfig(); return f / fps; };
const B = (fn: (t: number, dur: number) => React.ReactNode): React.FC<{ dur: number }> => ({ dur }) => { const t = useT(); return <>{fn(t, dur)}</>; };
const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

// ---------- الإضاءات (من لوحة ألوان التحليل) ----------
const darkLook: Look = {
  sky: makeSky("#150a14", "#2d1d36", "#421226", true), fog: "#2c1426", fogNear: 18, fogFar: 110,
  sun: { pos: [-8, 14, 6], color: "#c46a8a", intensity: 1.1, shadow: 16 },
  hemi: { sky: "#6a3a5c", ground: "#3a1426", intensity: 0.75 }, exposure: 1.12, aperture: 0.35,
  cool: "#4a2a5c", warm: "#c46a3a", vignette: 0.55, saturation: 1.15,
};
const orangeLook: Look = {
  sky: makeSky("#4b73c5", "#86aae0", "#e8944c"), fog: "#d8845c", fogNear: 26, fogFar: 160,
  sun: { pos: [12, 18, 10], color: "#ffe6c4", intensity: 2.5, shadow: 22 },
  hemi: { sky: "#a9c4ff", ground: "#8a4a3c", intensity: 1.0 }, exposure: 1.05, aperture: 0.35,
  cool: "#4a55a8", warm: "#ffb347", vignette: 0.32, saturation: 1.12,
};
const blueLook: Look = {
  sky: makeSky("#3d6fd4", "#6ea3e8", "#bcd4f2"), fog: "#a8c4e8", fogNear: 30, fogFar: 220,
  sun: { pos: [14, 22, 10], color: "#fff1dc", intensity: 2.4, shadow: 26 },
  hemi: { sky: "#bfd4ff", ground: "#7a6a8a", intensity: 1.05 }, exposure: 1.02, aperture: 0.3,
  cool: "#4a55a8", warm: "#ffb347", vignette: 0.28, saturation: 1.1,
};
const sunsetLook: Look = {
  sky: makeSky("#d8642c", "#e8944c", "#f0b070"), fog: "#e0945c", fogNear: 22, fogFar: 150,
  sun: { pos: [10, 6, 12], color: "#ffb46c", intensity: 2.7, shadow: 20 },
  hemi: { sky: "#e8a088", ground: "#8a4a3c", intensity: 0.95 }, exposure: 1.06, aperture: 0.38,
  cool: "#5a4a8c", warm: "#ffc27e", vignette: 0.36, saturation: 1.14,
};
const pinkLook: Look = {
  sky: makeSky("#d8a0b0", "#e0b0bc", "#e8c0c8"), fog: "#e0b4c0", fogNear: 12, fogFar: 70,
  sun: { pos: [8, 16, 10], color: "#ffd2c4", intensity: 1.9, shadow: 18 },
  hemi: { sky: "#f0c8d0", ground: "#b08494", intensity: 1.1 }, exposure: 1.1, aperture: 0.5,
  cool: "#8a6a9c", warm: "#ffc2a8", vignette: 0.3, saturation: 0.95,
};
const stationLook: Look = {
  sky: makeSky("#2d203d", "#68537e", "#aaa0a8"), fog: "#8a7a9a", fogNear: 16, fogFar: 90,
  sun: { pos: [6, 18, 12], color: "#e8d2f0", intensity: 1.9, shadow: 18 },
  hemi: { sky: "#c8b8e0", ground: "#6a5a6a", intensity: 1.0 }, exposure: 1.08, aperture: 0.42,
  cool: "#5a4a8c", warm: "#e8b48a", vignette: 0.34, saturation: 1.08,
};
const nightLook: Look = {
  sky: makeSky("#252447", "#3d3866", "#7a6a8a", true), fog: "#2a2848", fogNear: 10, fogFar: 60,
  sun: { pos: [6, 12, 10], color: "#8a86c0", intensity: 1.1, shadow: 14 },
  hemi: { sky: "#5a5a9c", ground: "#2a2438", intensity: 0.8 }, exposure: 1.15, aperture: 0.5,
  cool: "#4a55a8", warm: "#e8a050", vignette: 0.5, saturation: 1.1,
};
const luxuryLook: Look = {
  fog: "#c4622c", fogNear: 8, fogFar: 40,
  sun: { pos: [4, 10, 8], color: "#ffd9a8", intensity: 1.6, shadow: 10 },
  hemi: { sky: "#ffc773", ground: "#6a2c2c", intensity: 0.9 }, exposure: 1.1, aperture: 0.5,
  cool: "#6a3a5c", warm: "#ffb347", vignette: 0.45, saturation: 1.12,
};
const bridgeLook: Look = {
  sky: makeSky("#c86a8c", "#e8946c", "#8a4a8c"), fog: "#c8849c", fogNear: 26, fogFar: 180,
  sun: { pos: [-12, 10, 14], color: "#ffb48a", intensity: 2.3, shadow: 22 },
  hemi: { sky: "#e8a0c0", ground: "#7a4a6c", intensity: 1.0 }, exposure: 1.05, aperture: 0.32,
  cool: "#6a4a9c", warm: "#ffc27e", vignette: 0.34, saturation: 1.12,
};

// ============================================================
// الجدول: [id, from, dur] — من التحليل
// ============================================================
const SPANS: [number, number, number][] = [
  [1, 0, 54], [2, 54, 26], [3, 80, 13], [4, 93, 19], [5, 112, 76], [6, 188, 66],
  [7, 254, 25], [8, 279, 15], [9, 294, 8], [10, 302, 12], [11, 314, 34], [12, 348, 60],
  [13, 408, 24], [14, 432, 48], [15, 480, 38], [16, 518, 106], [17, 624, 24], [18, 648, 20],
  [19, 668, 52], [20, 720, 36], [21, 756, 33], [22, 789, 19], [23, 808, 48], [24, 856, 24],
  [25, 880, 56], [26, 936, 72], [27, 1008, 80], [28, 1088, 64], [29, 1152, 84], [30, 1236, 60],
  [31, 1296, 48], [32, 1344, 96], [33, 1440, 144], [34, 1584, 48], [35, 1632, 56], [36, 1688, 48],
  [37, 1736, 48], [38, 1784, 64], [39, 1848, 80], [40, 1928, 27],
];

// ============================================================
// L01: الممر المظلم (f0–53) — المهندس ينشر الفجوات
// ============================================================
const S1: Shot = { id: 1, from: 0, dur: 54, look: darkLook, focus: 7,
  cam: { from: [6.2, 3.4, 7], to: [6.2, 3.4, 11.5], lookFrom: [-0.6, 1.5, 1.5], lookTo: [-0.6, 1.5, 6], fov: 58 },
  Body: B((t) => (
    <Canyon dark>
      <Locomotive7 pos={[0, 0, -34]} scale={1.05} />
      <Toon spec={C.engineer} pose={{ armR: "down", prop: "saw", eyes: t < 1.2 ? "angry" : "half", mouth: "flat", armL: "hold", walk: t > 1.2 ? 1 : 0 }} pos={[-0.6, 0, 1.5 + t * 2.5]} seed={2} />
      <Telegraph pos={[-6.5, 0, -8]} />
      <Cactus pos={[-7.2, 0, -4]} />
    </Canyon>
  )) };

// L02: الأخدود البرتقالي (f54–79) — مشي + منشار
const S2: Shot = { id: 2, from: 54, dur: 26, look: orangeLook, focus: 6.5,
  cam: { from: [5.6, 3, 3], to: [5.6, 3, 5.5], lookFrom: [-0.4, 1.5, -1], lookTo: [-0.4, 1.5, 1.5], fov: 57 },
  Body: B((t) => (
    <Canyon>
      <Locomotive7 pos={[0, 0, -38]} scale={1.05} />
      <Toon spec={C.engineer} pose={{ armR: "down", prop: "saw", eyes: "half", mouth: "smile", armL: "hold", walk: 1 }} pos={[-0.4, 0, -1 + t * 1.7]} seed={2} />
      <Telegraph pos={[-6.5, 0, -10]} />
      <Cactus pos={[-7.2, 0, -2]} />
      <Cactus pos={[-7.8, 0, -16]} />
    </Canyon>
  )) };

// L03: مصباح القاطرة رقم 7 (f80–92)
const S3: Shot = { id: 3, from: 80, dur: 13, look: orangeLook, focus: 16,
  cam: { from: [1.6, 2.2, 6], to: [1.2, 2, 4.5], lookFrom: [0, 2.4, -16], lookTo: [0, 2.4, -14], fov: 50 },
  Body: B(() => (
    <Canyon>
      <Locomotive7 pos={[0, 0, -17]} scale={1.15} />
      <Smoke pos={[0, 4.6, -17]} count={12} dark rise={7} />
      <Toon spec={C.engineer} pose={{ armR: "down", prop: "saw", eyes: "wide", mouth: "o" }} pos={[2.2, 0, 2]} seed={2} />
    </Canyon>
  )) };

// L04: الشرر (f93–111)
const S4: Shot = { id: 4, from: 93, dur: 19, look: orangeLook, focus: 5.5,
  cam: { from: [4.2, 2.6, 5], to: [3.4, 2.4, 3.6], lookFrom: [-0.4, 1.6, -2], fov: 54 },
  Body: B(() => (
    <Canyon>
      <Locomotive7 pos={[0, 0, -20]} scale={1.1} />
      <Smoke pos={[0, 4.6, -20]} count={12} dark rise={7} />
      <Sparks pos={[-1.2, 0.8, -1]} />
      <Toon spec={C.engineer} pose={{ armR: "down", prop: "saw", eyes: "angry", mouth: "flat", armL: "hold" }} pos={[-0.4, 0, -2]} seed={2} />
    </Canyon>
  )) };

// L05: منظر جوي للجسر فوق الماء (f112–187)
const S5: Shot = { id: 5, from: 112, dur: 76, look: blueLook, focus: 30,
  cam: { from: [10, 22, 34], to: [15, 20, 28], lookFrom: [-2, 2, -12], lookTo: [2, 2, -14], fov: 56, sway: 2 },
  Body: B(() => (
    <Bay>
      <Toon spec={C.workerA} pose={{ armR: "wave", eyes: "dot", mouth: "smile" }} pos={[-6, 6.2, 14]} h={1.2} seed={4} />
      <Toon spec={C.workerB} pose={{ armL: "hips", armR: "point", eyes: "half", mouth: "flat" }} pos={[-2, 6.2, 12]} h={1.2} seed={5} />
    </Bay>
  )) };

// L06: النزول إلى القاع + اللوح الساقط (f188–253)
const S6: Shot = { id: 6, from: 188, dur: 66, look: blueLook, focus: 14,
  cam: { from: [8, 16, 26], to: [4, 2, 22], lookFrom: [-2, 4, -6], lookTo: [-2, -4, -2], fov: 58 },
  Body: B((t) => (
    <Bay>
      <group position={[1.5, 6 - t * t * 3.2, 16]} rotation={[0.4 + t * 1.6, 0.2, 0.7 + t * 1.1]}>
        <Box size={[0.45, 0.15, 2.8]} color="#8a5a3c" />
      </group>
    </Bay>
  )) };

// L07: الصعود من الحافة (f254–278)
const S7: Shot = { id: 7, from: 254, dur: 25, look: blueLook, focus: 26,
  cam: { from: [-2, 1.2, 18], to: [-1, 12, 12], lookFrom: [-2, 0.5, -20], lookTo: [-1, 3, -24], fov: 58 },
  Body: B(() => (
    <Desert>
      <Box size={[46, 7, 12]} pos={[0, -1.5, 10]} map={painted("#4a1f31", [3, 1], 400)} />
    </Desert>
  )) };

// L08: الصحراء الشاسعة + القطار البعيد (f279–293)
const S8: Shot = { id: 8, from: 279, dur: 15, look: { ...blueLook, aperture: 0.22 }, focus: 60,
  cam: { from: [-1, 13, 12], to: [-1, 14, 10], lookFrom: [-1, 3, -26], fov: 56 },
  Body: B(() => <Desert />) };

// L09: ويب (f294–301)
const S9: Shot = { id: 9, from: 294, dur: 8, look: { ...blueLook, aperture: 0.6 }, focus: 8,
  cam: { from: [-2, 12, 10], to: [10, 14, -22], lookFrom: [4, 6, -30], lookTo: [12, 8, -50], fov: 62, ease: "linear", sway: 0 },
  Body: B(() => <Desert />) };

// L10: التقدّم نحو المحطة (f302–313)
const S10: Shot = { id: 10, from: 302, dur: 12, look: blueLook, focus: 34,
  cam: { from: [0, 6, 18], to: [0, 5.6, 8], lookFrom: [0, 7, -26], fov: 54 },
  Body: B(() => (
    <group>
      <StationExt />
      {[-7, -3.5, 0, 3.5, 7].map((x) => <Rails key={x} len={90} gauge={1.1} x={x} z={-12} />)}
    </group>
  )) };

// L11: حفل الشركات (f314–347)
const S11: Shot = { id: 11, from: 314, dur: 34, look: stationLook, focus: 7,
  cam: { from: [0, 4.6, 7], to: [0, 4.2, 3.6], lookFrom: [0, 3.6, -6], fov: 52 },
  Body: B((t) => (
    <Hall phase="ceremony">
      <Toon spec={C.suitMan} pose={{ armR: t > 1 ? "point" : "hold", prop: t > 1 ? "none" : "cane", eyes: "happy", mouth: "grin" }} pos={[1.6, 0, -2]} seed={3} />
      <Toon spec={C.yellowMan} pose={{ armL: "hips", armR: "wave", eyes: "happy", mouth: "smile" }} pos={[-2.6, 0, -3]} seed={7} />
    </Hall>
  )) };

// L12: العمال على الحافة (f348–407)
const S12: Shot = { id: 12, from: 348, dur: 60, look: blueLook, focus: 9,
  cam: { from: [6, 5.5, 9], to: [-6, 5.5, 9], lookFrom: [2, 3, -2], lookTo: [-10, 3, -2], fov: 55, ease: "linear", sway: 0.5 },
  Body: B((t) => (
    <Ridge>
      <Toon spec={C.workerC} pose={{ walk: 1, eyes: "half", mouth: "flat" }} pos={[1 + t * 1.1, 3.5, 0.4]} seed={4} />
      <Toon spec={C.workerA} pose={{ walk: 1, eyes: "dot", mouth: "smile" }} pos={[3.6 + t * 1.1, 3.5, -0.4]} seed={5} />
      <Toon spec={C.engineer} pose={{ walk: 1, eyes: "angry", mouth: "flat" }} pos={[-1.6 + t * 1.1, 3.5, 0.1]} seed={2} />
    </Ridge>
  )) };

// L13: مقابلة الزعيم — دفع (f408–431)
const S13: Shot = { id: 13, from: 408, dur: 24, look: orangeLook, focus: 8,
  cam: { from: [1, 3.4, 10], to: [0.6, 3, 6.2], lookFrom: [0, 2.4, -2], fov: 52 },
  Body: B(() => (
    <Canyon>
      <Toon spec={C.boss} pose={{ armL: "hips", armR: "hips", eyes: "angry", mouth: "frown" }} pos={[0.6, 0, -2]} seed={3} />
      <Toon spec={C.engineer} pose={{ armR: "shrug", eyes: "sad", mouth: "wavy" }} pos={[-2.8, 0, -3]} seed={2} />
      <Toon spec={C.goggle} pose={{ eyes: "dot", mouth: "flat" }} pos={[-1.4, 0, 1.4]} h={1.3} seed={6} />
    </Canyon>
  )) };

// L14: وجهان مقربان (f432–479)
const S14: Shot = { id: 14, from: 432, dur: 48, look: orangeLook, focus: 3.4, 
  cam: { from: [0.3, 3.1, 3.4], to: [0.3, 3.05, 3.0], lookFrom: [0, 2.7, -2], fov: 46 },
  Body: B((t) => (
    <Canyon>
      <Toon spec={C.boss} pose={{ armL: "hips", armR: t > 1.6 ? "point" : "hips", eyes: t > 1.2 ? "angry" : "half", mouth: t > 1.2 ? "frown" : "flat" }} pos={[0.5, 0, -1.6]} h={2.2} seed={3} />
      <Toon spec={C.goggle} pose={{ eyes: t > 1.6 ? "wide" : "dot", mouth: t > 1.6 ? "o" : "flat", armR: "hold", prop: "saw" }} pos={[-1, 0, 1.2]} h={1.55} seed={6} />
    </Canyon>
  )) };

// L15: الغضب البنفسجي (f480–517)
const S15: Shot = { id: 15, from: 480, dur: 38, look: { ...orangeLook, saturation: 1.25 }, focus: 3.8,
  cam: { from: [0.4, 3.2, 4.2], to: [0.4, 3.3, 3.4], lookFrom: [0, 3, -1.6], fov: 48 },
  Body: B(() => (
    <Canyon>
      <Toon spec={C.bossPurple} pose={{ armL: "up", armR: "up", eyes: "angry", mouth: "open" }} pos={[0.5, 0, -1.6]} h={2.2} seed={3} />
      <AngerSteam pos={[0.5, 4.4, -1.5]} />
    </Canyon>
  )) };

// L16: خطبة الغضب + الانكشاف (f518–623) — بنفسجي حتى f589
const S16: Shot = { id: 16, from: 518, dur: 106, look: orangeLook, focus: 6.5,
  cam: { from: [0.6, 3.2, 3.8], to: [1.6, 3.6, 10.5], lookFrom: [0, 3, -1.6], lookTo: [-0.6, 2.6, -2], fov: 50 },
  Body: B((t) => (
    <Canyon>
      <Toon spec={t < 2.37 ? C.bossPurple : C.boss} pose={{ armL: "point", armR: t < 2.37 ? "up" : "hips", eyes: "angry", mouth: t < 2.37 ? "open" : "frown", talk: t < 2.37 }} pos={[0.5, 0, -1.6]} h={2.1} seed={3} />
      {t < 2.37 && <AngerSteam pos={[0.5, 4.3, -1.5]} />}
      <Toon spec={C.engineer} pose={{ armR: "shrug", eyes: "sad", mouth: "wavy" }} pos={[-3.2, 0, -3]} seed={2} />
    </Canyon>
  )) };

// L17: ويب أيمن (f624–647)
const S17: Shot = { id: 17, from: 624, dur: 24, look: { ...blueLook, aperture: 0.6 }, focus: 7,
  cam: { from: [-8, 5, 8], to: [10, 4, 2], lookFrom: [2, 3, -8], lookTo: [8, 3, -10], fov: 60, ease: "linear", sway: 0 },
  Body: B(() => (
    <DeckPlatform>
      <Toon spec={C.workerA} pose={{ walk: 1, eyes: "dot", mouth: "flat" }} pos={[-4, 0.7, -6]} seed={4} />
      <Toon spec={C.workerB} pose={{ walk: 1, eyes: "half", mouth: "flat" }} pos={[3, 0.7, -10]} seed={5} />
    </DeckPlatform>
  )) };

// L18: الدخان فوق المنصة (f648–667)
const S18: Shot = { id: 18, from: 648, dur: 20, look: blueLook, focus: 12,
  cam: { from: [3, 8, 10], to: [2, 7, 8], lookFrom: [-2, 6, -12], fov: 55 },
  Body: B(() => (
    <DeckPlatform>
      <Smoke pos={[-5, 6, -14]} dark rise={10} />
      <Smoke pos={[6, 6.5, -16]} dark rise={11} />
    </DeckPlatform>
  )) };

// L19: قائد القطار المنحني (f668–719) — ميلان لأسفل
const S19: Shot = { id: 19, from: 668, dur: 52, look: blueLook, focus: 6,
  cam: { from: [2, 11, 8], to: [1, 3.2, 5], lookFrom: [-2, 5, -8], lookTo: [0, 1.8, -2], fov: 54 },
  Body: B(() => (
    <DeckPlatform>
      <Toon spec={C.conductor} pose={{ eyes: "sad", mouth: "wavy", armL: "down", armR: "down", shiver: true }} pos={[1, 0.7, -2]} seed={8} />
      <Smoke pos={[-5, 6, -14]} dark rise={10} />
    </DeckPlatform>
  )) };

// L20: انزلاق بجانب المصابيح (f720–755)
const S20: Shot = { id: 20, from: 720, dur: 36, look: blueLook, focus: 5,
  cam: { from: [-8, 3, 3], to: [8, 3, 3], lookFrom: [-8, 2.6, -4], lookTo: [8, 2.6, -4], fov: 52, ease: "linear", sway: 0 },
  Body: B((t) => (
    <DeckPlatform>
      <Toon spec={C.conductor} pose={{ eyes: "half", mouth: "flat", armR: "point" }} pos={[2, 0.7, -2]} seed={8} />
      {t > 1.05 && <Toon spec={C.teaMan} pose={{ walk: 1, eyes: "dot", mouth: "smile", armR: "hold", prop: "teacup" }} pos={[-2 + (t - 1.05) * 1.3, 0.7, 1.5]} seed={9} />}
    </DeckPlatform>
  )) };

// L21: المنصة الشاسعة (f756–788)
const S21: Shot = { id: 21, from: 756, dur: 33, look: blueLook, focus: 16,
  cam: { from: [4, 6, 16], to: [3, 5.2, 20], lookFrom: [-2, 2.5, -10], lookTo: [-2, 2.5, -12], fov: 57 },
  Body: B(() => (
    <DeckPlatform>
      <Toon spec={C.teaMan} pose={{ walk: 1, eyes: "dot", mouth: "smile", armR: "hold", prop: "teacup" }} pos={[-2, 0.7, 1.5]} seed={9} />
      <Toon spec={C.workerA} pose={{ walk: 1, eyes: "half", mouth: "flat" }} pos={[-6, 0.7, -8]} seed={4} />
      <Toon spec={C.workerC} pose={{ walk: 1, eyes: "dot", mouth: "smile" }} pos={[2, 0.7, -14]} seed={5} />
      <Smoke pos={[-5, 6, -14]} dark rise={10} />
      <Smoke pos={[6, 6.5, -16]} dark rise={11} />
    </DeckPlatform>
  )) };

// L22: عربة VANDERGOLD (f789–807)
const S22: Shot = { id: 22, from: 789, dur: 19, look: nightLook, focus: 8,
  cam: { from: [7, 3.6, 7], to: [6, 3.4, -2], lookFrom: [0, 2.6, -2], lookTo: [0, 2.6, -4], fov: 52, ease: "linear" },
  Body: B(() => (
    <group>
      <LuxuryCar />
      <Rails len={60} gauge={1.6} />
    </group>
  )) };

// L23: رجل الشاي (f808–855)
const S23: Shot = { id: 23, from: 808, dur: 48, look: luxuryLook, focus: 5.5,
  cam: { from: [0, 3.4, 8.5], to: [0, 3.2, 5.2], lookFrom: [0, 2.6, -3], fov: 52 },
  Body: B((t) => (
    <LuxuryCar inside>
      <Toon spec={C.teaMan} pose={{ sit: true, armR: "drink", prop: "teacup", eyes: t > 1.5 ? "sad" : "happy", mouth: t > 1.5 ? "wavy" : "smile" }} pos={[0, 0, -3]} seed={9} />
    </LuxuryCar>
  )) };

// L24: قطارات RED CANYON LINE (f856–879)
const S24: Shot = { id: 24, from: 856, dur: 24, look: { ...blueLook, saturation: 1.05 }, focus: 22,
  cam: { from: [10, 8, 14], to: [4, 7.5, 10], lookFrom: [0, 6, -12], lookTo: [0, 6, -14], fov: 55 },
  Body: B(() => (
    <group>
      <Trestle pos={[0, 11, -14]} len={110} h={22} />
      <ShortLineCar pos={[0, 11, -22]} />
      <ShortLineCar pos={[0, 11, -13]} />
      <ShortLineCar pos={[0, 11, -4]} />
      <Smoke pos={[0, 15, -26]} dark rise={8} />
    </group>
  )) };

// L25: نافذة العربة (f880–935)
const S25: Shot = { id: 25, from: 880, dur: 56, look: nightLook, focus: 4,
  cam: { from: [4.4, 2.9, 1], to: [4.4, 2.9, 0.4], lookFrom: [0, 2.6, -2.6], fov: 50 },
  Body: B((t) => (
    <group>
      <CarWindowWall>
        <Toon spec={C.goggle} pose={{ eyes: t > 1.2 ? "wide" : "half", mouth: t > 1.2 ? "o" : "wavy", armR: "hold", prop: "saw", shiver: true }} pos={[-0.2, 0, -1.6]} seed={6} />
      </CarWindowWall>
      {/* خلفية تمر */}
      {[0, 1, 2, 3, 4].map((i) => (
        <Box key={i} size={[1.4, 2, 1.4]} pos={[-7 + ((t * 7 + i * 3.4) % 16), 1, -7]} map={painted("#5b3437", [1, 1], 250)} />
      ))}
    </group>
  )) };

// L26: مروّج الجرائد (f936–1007)
const S26: Shot = { id: 26, from: 936, dur: 72, look: { ...stationLook, fog: "#4a2c2c", fogNear: 10, fogFar: 60 }, focus: 5,
  cam: { from: [0.5, 3, 9], to: [0.5, 2.8, 6.5], lookFrom: [0, 2.4, -2], fov: 52 },
  Body: B((t) => (
    <Hall phase="news">
      <Toon spec={C.newsman} pose={{ walk: 1, armR: "hold", prop: "newspaper", propHand: "R", eyes: t > 1.6 ? "happy" : "dot", mouth: t > 1.6 ? "grin" : "flat" }} pos={[0, 0, 2 - Math.min(2.6, t * 0.55)]} seed={11} />
    </Hall>
  )) };

// L27: الضباب الوردي + ALL ABOARD (f1008–1087)
const S27: Shot = { id: 27, from: 1008, dur: 80, look: pinkLook, focus: 6,
  cam: { from: [-2, 3.4, 10], to: [0, 3, 7.5], lookFrom: [0, 3, -4], lookTo: [0, 3.4, -6], fov: 53 },
  Body: B((t) => (
    <Hall phase="news">
      {[[-3.4, -1], [2.6, -0.4], [4.2, -4], [-1.6, -5]].map(([x, z], i) => (
        <Box key={i} size={[1.15, 0.05, 1.5]} pos={[x, 0.06, z]} rot={[0, i * 0.7, 0]} color="#efe8d6" shadow={false} />
      ))}
      {t > 1.3 && <>
        <Toon spec={C.boss} pose={{ armR: "wave", eyes: "happy", mouth: "grin" }} pos={[-2.4, 0, -3]} seed={3} />
        <Toon spec={C.teaMan} pose={{ armL: "hips", eyes: "dot", mouth: "smile" }} pos={[1.8, 0, -3.6]} seed={9} />
        <Toon spec={C.workerA} pose={{ armR: "point", eyes: "happy", mouth: "grin" }} pos={[0.2, 0, -4.2]} h={1.45} seed={4} />
      </>}
    </Hall>
  )) };

// L28: غروب — شيء غريب (f1088–1151)
const S28: Shot = { id: 28, from: 1088, dur: 64, look: sunsetLook, focus: 6,
  cam: { from: [-14, 3.6, 8], to: [8, 3.2, 6], lookFrom: [-8, 2.4, -6], lookTo: [2, 2.4, -6], fov: 56, ease: "linear" },
  Body: B((t) => (
    <group>
      <Rails len={100} gauge={1.7} glow="mix" />
      {[-10, -2, 6].map((x, i) => <CalendarCart key={i} pos={[x, 0, -5 - i * 1.6]} />)}
      <BlueFlag pos={[8, 0, -8]} />
      <Toon spec={C.engineer} pose={{ walk: t > 0.9 ? 1 : 0, eyes: t > 1.45 ? "wide" : "half", mouth: t > 1.45 ? "o" : "flat" }} pos={[2 + t * 1.4, 0, 1]} seed={2} />
    </group>
  )) };

// L29: الفجوات تضيق (f1152–1235)
const S29: Shot = { id: 29, from: 1152, dur: 84, look: sunsetLook, focus: 4.5,
  cam: { from: [0, 1.6, 5.2], to: [0, 1.4, 3.4], lookFrom: [0, 0.9, -1.4], fov: 50 },
  Body: B((t) => {
    const gap = Math.max(0.35, 1.9 - t * 0.13);
    return (
      <group>
        <Box size={[46, 0.5, 60]} pos={[0, -0.25, -12]} map={painted("#d8742c", [4, 4], 500)} />
        {[-1, 1].map((s) => (
          <Box key={s} size={[3.6, 0.55, 1.5]} pos={[s * (gap / 2 + 1.9), 0.42, -1.2]} color={t > 1.4 ? "#e9c25c" : "#b71fa0"} emissive={t > 1.4 ? "#8a6a1c" : "#5c1050"} emissiveIntensity={0.85} />
        ))}
        {t > 1.5 && <Caliper pos={[0, 1.15, 0.2]} open={Math.max(0.25, gap * 0.5)} />}
        <CalendarCart pos={[-3.6, 0, -4]} />
        <BlueFlag pos={[4, 0, -5]} />
      </group>
    );
  }) };

// L30: العملة (f1236–1295)
const S30: Shot = { id: 30, from: 1236, dur: 60, look: sunsetLook, focus: 2.8,
  cam: { from: [0.8, 1.7, 3.4], to: [0.4, 1.55, 2.7], lookFrom: [0, 1.1, -1], fov: 46 },
  Body: B((t) => (
    <group>
      <Box size={[46, 0.5, 60]} pos={[0, -0.25, -12]} map={painted("#d8742c", [4, 4], 500)} />
      <Box size={[3.6, 0.55, 1.5]} pos={[-1.15, 0.42, -1.2]} color="#e9c25c" emissive="#8a6a1c" emissiveIntensity={0.85} />
      <Box size={[3.6, 0.55, 1.5]} pos={[1.15, 0.42, -1.2]} color="#e9c25c" emissive="#8a6a1c" emissiveIntensity={0.85} />
      <Caliper pos={[0, 1.15, 0.2]} open={0.5} />
      {/* العملة تسقط f1236–1243 ثم تقف */}
      <group position={[0, t < 0.27 ? 2.6 - t * 6.4 : 1.32, 0.2]} rotation={[0, t * 2, t < 0.27 ? t * 6 : Math.PI / 2]}>
        <Cyl r={0.3} h={0.07} seg={20} color="#c8c8d4" />
      </group>
      <Toon spec={C.engineer} pose={{ eyes: "wide", mouth: "o", armR: "point" }} pos={[2.6, 0, 1.2]} h={1.3} seed={2} />
    </group>
  )) };

// L31: ذراع الرافعة + الميلان للأعلى (f1296–1343)
const S31: Shot = { id: 31, from: 1296, dur: 48, look: sunsetLook, focus: 9,
  cam: { from: [0, 2, 6], to: [0, 10, 8], lookFrom: [0, 1.5, -1], lookTo: [0, 11, -2], fov: 52 },
  Body: B((t) => (
    <group>
      <Box size={[46, 0.5, 60]} pos={[0, -0.25, -12]} map={painted("#d8742c", [4, 4], 500)} />
      <Box size={[3.6, 0.55, 1.5]} pos={[-0.75, 0.42, -1.2]} color="#e9c25c" emissive="#8a6a1c" emissiveIntensity={0.85} />
      <Box size={[3.6, 0.55, 1.5]} pos={[0.75, 0.42, -1.2]} color="#e9c25c" emissive="#8a6a1c" emissiveIntensity={0.85} />
      <CraneArm pos={[1, 0, -2.4]} tilt={-0.28 + Math.min(0, -t * 0.02)} />
      {/* الزعيم والمهندس على الحافة العلوية */}
      {t > 1.3 && <>
        <Toon spec={C.boss} pose={{ armL: "hips", armR: "point", eyes: "half", mouth: "smile" }} pos={[1, 12, -1.5]} seed={3} />
        <Toon spec={C.engineer} pose={{ armR: "wave", eyes: "happy", mouth: "grin" }} pos={[-1.7, 12, -1.5]} seed={2} />
      </>}
    </group>
  )) };

// L32: حوار الرضا (f1344–1439)
const S32: Shot = { id: 32, from: 1344, dur: 96, look: sunsetLook, focus: 6.5,
  cam: { from: [0, 3.4, 7.5], to: [0, 3.2, 5.8], lookFrom: [0, 2.6, -1.5], fov: 50 },
  Body: B((t) => (
    <group>
      <Rails len={60} gauge={1.7} glow="mix" />
      <Box size={[10, 0.5, 60]} pos={[0, -0.25, -12]} map={painted("#b5301c", [3, 4], 500)} />
      <Toon spec={C.engineer} pose={{ armR: t > 1.8 && t < 2.1 ? "point" : "hips", eyes: "half", mouth: t > 1.8 && t < 2.1 ? "open" : "smile", talk: t > 1.8 && t < 2.1 }} pos={[-1.8, 0, -1]} seed={2} />
      <Toon spec={C.boss} pose={{ armL: "hips", armR: t > 2.5 ? "wave" : "hold", prop: t > 2.5 ? "none" : "cane", eyes: "happy", mouth: t > 1.8 && t < 2.4 ? "open" : "grin", talk: t > 1.8 && t < 2.4 }} pos={[1.6, 0, -1.4]} seed={3} />
    </group>
  )) };

// L33: السكّة المثالية (f1440–1583) — التوهج ثم الحرارة
const S33: Shot = { id: 33, from: 1440, dur: 144, look: { ...blueLook, saturation: 1.06 }, focus: 13,
  cam: { from: [0, 3, 12], to: [0, 3.2, -2], lookFrom: [0, 1.8, -30], fov: 56 },
  Body: B((t) => (
    <PerfectDeck>
      <DeckChair pos={[0, 0, -22]} />
      {t > 2.9 && <mesh position={[0, 0.28, -12]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[6.4, 70]} /><meshBasicMaterial color={t > 3.85 ? "#e9c25c" : "#b71fa0"} transparent opacity={0.22} /></mesh>}
    </PerfectDeck>
  )) };

// L34: كرسي الشاطئ (f1584–1631)
const S34: Shot = { id: 34, from: 1584, dur: 48, look: { ...blueLook, saturation: 1.08 }, focus: 4.2,
  cam: { from: [0, 2.8, 4.6], to: [0, 2.6, 3], lookFrom: [0, 1.9, -1.6], fov: 50 },
  Body: B((t) => (
    <PerfectDeck>
      <DeckChair pos={[0, 0, -1.2]} rotY={t > 1.4 ? (t - 1.4) * 0.22 : 0} />
      <Toon spec={C.lounger} pose={{ sit: true, eyes: t > 1.15 ? "wide" : "happy", mouth: t > 1.15 ? "o" : "grin", armL: "warm", armR: "warm" }} pos={[0, 0.7, -0.8]} seed={12} />
    </PerfectDeck>
  )) };

// L35: أحرّ يوم — لقطة قريبة (f1632–1687)
const S35: Shot = { id: 35, from: 1632, dur: 56, look: sunsetLook, focus: 3.2,
  cam: { from: [0.4, 3, 3.6], to: [0.4, 3, 2.9], lookFrom: [0, 2.7, -1], fov: 46 },
  Body: B((t) => (
    <group>
      <Rails len={80} gauge={1.8} glow="mix" />
      <Toon spec={C.engineer} pose={{ eyes: t > 1.2 ? "sad" : "happy", mouth: t > 1.2 ? "wavy" : "grin", armL: "hips", armR: "up" }} pos={[0, 0, -0.8]} h={2} seed={2} />
    </group>
  )) };

// L36: الاندفاع بين القضبان (f1688–1735) — ويب
const S36: Shot = { id: 36, from: 1688, dur: 48, look: { ...sunsetLook, aperture: 0.55 }, focus: 4,
  cam: { from: [0, 1.2, 12], to: [0, 1.2, -8], lookFrom: [0, 1, -24], fov: 60, ease: "linear", sway: 0 },
  Body: B(() => (
    <group>
      <Rails len={90} gauge={1.8} glow="mix" />
      <Toon spec={C.engineer} pose={{ walk: 1, eyes: "wide", mouth: "o", armL: "up", armR: "up" }} pos={[0, 0, -4]} h={1.5} seed={2} />
    </group>
  )) };

// L37: التعرّض الشامل (f1736–1783) — ريلان يلتمسان
const S37: Shot = { id: 37, from: 1736, dur: 48, look: sunsetLook, focus: 12,
  cam: { from: [0, 2.2, 10], to: [0, 2.6, 13], lookFrom: [0, 1, -16], fov: 56 },
  Body: B((t) => (
    <group>
      <Rails len={90} gauge={Math.max(0.4, 1.8 - t * 0.16)} glow="mix" />
      <Toon spec={C.engineer} pose={{ walk: 1, eyes: "wide", mouth: "o", armL: "shrug", armR: "shrug" }} pos={[0, 0, -3]} h={1.4} seed={2} />
    </group>
  )) };

// L38: جسر الغروب (f1784–1847)
const S38: Shot = { id: 38, from: 1784, dur: 64, look: bridgeLook, focus: 18,
  cam: { from: [14, 13, 22], to: [2.6, 7.6, 12], lookFrom: [-4, 5, -12], lookTo: [0, 6, -30], fov: 56 },
  Body: B((t) => (
    <SunsetBridge>
      <Train pos={[0, 6.3, -26 + t * 6]} />
      <Smoke pos={[0, 10.5, -28 + t * 6]} dark rise={6} />
    </SunsetBridge>
  )) };

// L39: السكّة تنثني كالثعبان (f1848–1927)
const S39: Shot = { id: 39, from: 1848, dur: 80, look: { ...bridgeLook, fog: "#d8a08c" }, focus: 12,
  cam: { from: [0.4, 6.6, 16], to: [0.4, 6.2, 13], lookFrom: [0, 5, -14], fov: 55 },
  Body: B((t) => {
    const amp = 0.25 + t * 0.75;
    return (
      <group>
        <Box size={[60, 0.4, 120]} pos={[0, -3, -30]} map={painted("#b08494", [6, 8], 500)} />
        {Array.from({ length: 22 }).map((_, i) => (
          <group key={i} position={[Math.sin(i * 0.55 + t * 2.4) * amp, 6.3 + Math.abs(Math.sin(i * 0.55 + t * 2.4)) * amp * 0.45, 10 - i * 2.3]}>
            <Box size={[5, 0.22, 1]} color="#5b3437" />
            {[-1.5, 1.5].map((x) => (
              <Box key={x} size={[0.26, 0.22, 2.1]} pos={[x, 0.22, 0]} color="#e9c25c" emissive="#8a6a1c" emissiveIntensity={0.6} />
            ))}
          </group>
        ))}
        <group position={[Math.sin(2.2 + t * 2.4) * amp, 7.6, -6]} rotation={[0, 0, t > 1.75 ? -(t - 1.75) * 0.4 : 0]}>
          <Train pos={[0, 0, 0]} />
        </group>
        <Smoke pos={[0, 11, -8]} dark rise={6} />
        <Sparks pos={[0, 7, -4]} count={12} />
      </group>
    );
  }) };

// L40: الانفجار (f1928–1954)
const S40: Shot = { id: 40, from: 1928, dur: 27, look: { ...sunsetLook, exposure: 1.15 }, focus: 16,
  cam: { from: [0, 5, 14], to: [0, 5.6, 12.5], lookFrom: [0, 6, -10], fov: 56 },
  Body: B((t) => (
    <group>
      <Box size={[40, 0.6, 22]} pos={[0, 0.3, 2]} map={painted("#9a5b4d", [6, 3], 400)} />
      {t < 0.1 && <mesh layers={2} position={[0, 6, -8]}><planeGeometry args={[200, 200]} /><meshBasicMaterial color="#ffffff" fog={false} /></mesh>}
      <Fireball pos={[0, 4, -9]} grow={t * 6} />
      {t > 0.65 && <>
        <Toon spec={C.engineer} pose={{ eyes: "wide", mouth: "o", armL: "up", armR: "up" }} pos={[-1.8, 0.6, 4]} seed={2} />
        <Toon spec={C.boss} pose={{ eyes: "wide", mouth: "o", armL: "up", armR: "up" }} pos={[1.8, 0.6, 4]} seed={3} />
      </>}
    </group>
  )) };

export const ALL_SHOTS: Shot[] = [S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20, S21, S22, S23, S24, S25, S26, S27, S28, S29, S30, S31, S32, S33, S34, S35, S36, S37, S38, S39, S40];
export const TOTAL_FRAMES = 1955;
