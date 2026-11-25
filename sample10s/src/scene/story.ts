// story.ts — عينة 10 ثوانٍ: "Why Perfect Railroads Don't Work"
// حركات الكاميرا مأخوذة حرفياً من تحليل الإطار-بإطار (تقرير L01–L09)
export const FPS = 30;
export const TOTAL = 300;
export const FLASH_AT = -1;
export const ENABLE_AUDIO = false; // قانون: بدون صوت
export const SHOW_CAPTIONS = true;

export type ShotDef = {
  id: number;
  a: number;
  b: number;
  light: "day" | "golden" | "interior" | "night";
};

// اللقطات التسع حسب التحليل (القطع الحقيقية)
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 54, light: "interior" },   // L01 الممر المظلم — truck جانبي
  { id: 2, a: 54, b: 80, light: "golden" },    // L02 الضوء البرتقالي
  { id: 3, a: 80, b: 96, light: "day" },       // L03 ظهور السماء
  { id: 4, a: 96, b: 112, light: "day" },      // L04 وصول القاطرة
  { id: 5, a: 112, b: 208, light: "day" },     // L05 جوي فوق الجسر — pan يمين
  { id: 6, a: 208, b: 254, light: "day" },     // L06 النزول للقاع — tilt-down
  { id: 7, a: 254, b: 269, light: "night" },   // L07 الحافة المظلمة — tilt-up
  { id: 8, a: 269, b: 294, light: "golden" },  // L08 الكشف عن الصحراء — crane up
  { id: 9, a: 294, b: 300, light: "golden" },  // L09 ويب-بان
];

export const XFADE: { from: number; to: number; a: number; b: number }[] = [];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (t: number) => {
  const u = clamp01(t);
  return u * u * (3 - 2 * u);
};
export const smoother = (t: number) => {
  const u = clamp01(t);
  return u * u * u * (u * (u * 6 - 15) + 10);
};
export const easeOut = (t: number) => 1 - (1 - clamp01(t)) ** 3;

export type V3 = [number, number, number];
export type CamSpec = { pos: V3; look: V3; fov: number; roll: number };

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mixCam = (a: CamSpec, b: CamSpec, t: number): CamSpec => ({
  pos: [mix(a.pos[0], b.pos[0], t), mix(a.pos[1], b.pos[1], t), mix(a.pos[2], b.pos[2], t)],
  look: [mix(a.look[0], b.look[0], t), mix(a.look[1], b.look[1], t), mix(a.look[2], b.look[2], t)],
  fov: mix(a.fov, b.fov, t),
  roll: mix(a.roll, b.roll, t),
});

/** تزلّق مستمر داخل اللقطة حتى لا تجمد الكاميرا أبداً */
const creep = (pos: V3, look: V3, f: number, f0: number, rate = 0.003): V3 => {
  const k = Math.min(0.22, Math.max(0, f - f0) * rate);
  return [pos[0] + (look[0] - pos[0]) * k, pos[1] + (look[1] - pos[1]) * k, pos[2] + (look[2] - pos[2]) * k];
};

type CamKey = { f: number; dur?: number; cut?: boolean; s: (f: number) => CamSpec };

// ======== ممر المظلم (Zone A, z≈3) ========
const L1 = (f: number): CamSpec => {
  // L01+L02: truck جانبي متوسط السرعة يمر بالمهندس وهو ينشر الفجوات
  const u = smoother(clamp01((f - 0) / 79));
  const pos: V3 = [mix(-3.4, 3.0, u), 1.7 + 0.06 * Math.sin(f * 0.09), 4.25];
  const look: V3 = [mix(-0.6, 1.4, u), 1.12, 2.7];
  return { pos: creep(pos, look, f, 0), look, fov: 46, roll: 0.02 * Math.sin(f * 0.05) };
};
const L3 = (f: number): CamSpec => {
  // L03: تتبع + ميلان طفيف للأعلى — السماء تظهر
  const u = smoother(clamp01((f - 80) / 15));
  const pos: V3 = [mix(3.0, 3.9, u), mix(1.76, 2.25, u), 4.1];
  const look: V3 = [mix(1.4, 2.6, u), mix(1.12, 1.85, u), 2.6];
  return { pos, look, fov: 43, roll: 0 };
};
const L4 = (f: number): CamSpec => {
  // L04: لقطة شبه ثابتة — القاطرة هي المتحركة
  const pos: V3 = [4.6, 1.85, 3.6];
  const look: V3 = [mix(2.6, 5.6, clamp01((f - 96) / 12)), 1.35, 1.2];
  return { pos: creep(pos, look, f, 96, 0.0012), look, fov: 40, roll: 0 };
};

// ======== الكanyon (Zone C, z≈300) ========
const L5 = (f: number): CamSpec => {
  // L05: بان جوي بطيء لليمين فوق الجسر والماء
  const u = smoother(clamp01((f - 112) / 95));
  const pos: V3 = [mix(-8.5, 7.0, u), mix(9.8, 9.1, u), mix(310.5, 311.5, u)];
  const look: V3 = [mix(-1.2, 1.2, u), 2.4, 300.0];
  return { pos, look, fov: 50, roll: -0.012 };
};
const L6 = (f: number): CamSpec => {
  // L06: tilt-down طويل — النزول إلى القاع
  const u = smoother(clamp01((f - 208) / 45));
  const pos: V3 = [2.0, mix(10.8, 3.2, u), mix(308.5, 307.2, u)];
  const look: V3 = [1.0, mix(2.2, -0.6, u), 300.0];
  return { pos, look, fov: 48, roll: 0 };
};

// ======== الحافة والصحراء (Zone D, z≈448) ========
const L7 = (f: number): CamSpec => {
  // L07: tilt-up/ارتفاع عند الحافة المظلمة
  const u = smoother(clamp01((f - 254) / 14));
  const pos: V3 = [-2.1, mix(1.55, 3.3, u), 458.0];
  const look: V3 = [-2.1, mix(1.9, 3.0, u), 451.0];
  return { pos, look, fov: 44, roll: 0.03 };
};
const L8 = (f: number): CamSpec => {
  // L08: crane up مستمر — الكشف عن الصحراء
  const u = smoother(clamp01((f - 269) / 24));
  const pos: V3 = [-2.0, mix(2.4, 6.4, u), mix(458.2, 460.5, u)];
  const look: V3 = [-2.0, mix(1.6, 1.2, u), mix(451, 446, u)];
  return { pos, look, fov: 50, roll: -0.015 };
};
const L9 = (f: number): CamSpec => {
  // L09: ويب-بان سريع
  const u = easeOut(clamp01((f - 294) / 6));
  const pos: V3 = [mix(-2.0, 6.5, u), 3.6, 457.0];
  const look: V3 = [mix(-2.0, 3.5, u), 2.1, 449.0];
  return { pos, look, fov: 56, roll: mix(-0.18, 0, u) };
};

const KEYS: CamKey[] = [
  { f: 0, s: L1 },
  { f: 80, cut: true, s: L3 },
  { f: 96, cut: true, s: L4 },
  { f: 112, cut: true, s: L5 },
  { f: 208, cut: true, s: L6 },
  { f: 254, cut: true, s: L7 },
  { f: 269, cut: true, s: L8 },
  { f: 294, cut: true, s: L9 },
];

export const camAt = (_id: number, f: number): CamSpec => {
  let cur = KEYS[0].s(f);
  for (let i = 1; i < KEYS.length; i++) {
    const k = KEYS[i];
    if (f < k.f) break;
    const prev = KEYS[i - 1];
    const span = (k.dur ?? 0) as number;
    if (!k.cut && span > 0 && f < k.f + span) {
      const t = smooth((f - k.f) / span);
      cur = mixCam(prev.s(Math.min(f, k.f - 1)), k.s(f), t);
    } else {
      cur = k.s(f);
    }
  }
  return cur;
};

/** إضاءة كل إطار: ممر مظلم ← برتقالي ← نهار ← ليل ← ذهبي */
export const lightAt = (f: number): ShotDef["light"] => {
  if (f < 54) return "interior";
  if (f < 80) return "golden";
  if (f < 254) return "day";
  if (f < 269) return "night";
  return "golden";
};

export const flashLevelAt = (_f: number): number => 0;

// ======== واجهات إضافية يعتمدها ShortComposition ========
export type LayerInfo = { id: number; alpha: number };
export const layersAt = (f: number): LayerInfo[] => {
  const s = SHOTS.find((x) => f >= x.a && f < x.b) ?? SHOTS[SHOTS.length - 1];
  return [{ id: s.id, alpha: 1 }];
};
export const dofAt = (f: number): { cInf: number } => ({
  cInf: lightAt(f) === "interior" ? 0.9 : 0.5,
});
export const focusAt = (shotId: number, f: number): V3 => camAt(shotId, f).look;
