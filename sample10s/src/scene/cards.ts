// cards.ts — عينة 10 ثوانٍ: بطاقات الشخصيات (30fps on-ones)
// المهندس (قبعة مخططة + منشار) ينشر فجوات في السكة كل 39 قدماً
import {
  FrontOpts,
  Outfit,
  Pen,
  SKIN,
  bodyFront,
  fxBurst,
  fxSparkles,
  springBounce,
} from "../engine/toon";

export const createPen = (g: CanvasRenderingContext2D) => new Pen(g);

export type ExportCardSpec =
  | {
      id: string;
      kind?: "toon";
      width?: number;
      height?: number;
      designW?: number;
      designH?: number;
      draw: (p: Pen) => void;
    }
  | {
      id: string;
      kind: "canvas";
      width: number;
      height: number;
      draw2d: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
    };

export type CardPlacement = {
  id: string;
  card: string;
  pos: [number, number, number];
  heightM: number;
  a: number;
  b: number;
  emit?: number;
  shadow?: boolean;
  rotDeg?: number;
  pitchDeg?: number;
  yawDeg?: number;
  scaleX?: number;
  scaleY?: number;
  jitter?: number;
};

export const EXPORT_CARDS: ExportCardSpec[] = [];
export const CARD_PLACEMENTS: CardPlacement[] = [];

// ===== الأزياء (من الإطار المرجعي f0040) =====
const ENGINEER: Outfit = {
  jacket: "#2f7d8c", // قميص تركوازي عمل
  pants: "#3a3f4c",
  boots: "#1f1526",
  hat: "cap",
  cap: "#b5482e", // قبعة مخططة حمراء
  hair: "#4a2e1d",
  skin: SKIN,
};
const WORKER: Outfit = {
  jacket: "#7a5c3e",
  pants: "#33383f",
  boots: "#1f1526",
  hat: "hair",
  hair: "#2e2018",
  skin: SKIN,
};
const SURVEYOR: Outfit = {
  jacket: "#3c4a68",
  pants: "#2b3240",
  boots: "#1f1526",
  hat: "tophat",
  hair: "#5a4632",
  tie: "#e0b44c",
  skin: SKIN,
};

const seenCards = new Set<string>();
const BLINK_ENV = [0.55, 1.0, 1.0, 0.55];
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (t: number) => {
  const u = clamp01(t);
  return u * u * (3 - 2 * u);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const qInt = (v: number, steps = 20) => Math.round(v * steps);

function blinkValueAt(f: number, period: number, phaseShift: number, swaps: number[]): number {
  for (const ts of swaps) {
    const k = f - ts + 1;
    if (k >= 0 && k < 4) return BLINK_ENV[k];
  }
  const ph = (((f + phaseShift) % period) + period) % period;
  return ph >= 0 && ph < 4 ? BLINK_ENV[ph] : 0;
}

function actorCardKey(prefix: string, o: FrontOpts): string {
  const blinkQ = o.blink === true ? 4 : qInt(Number(o.blink) || 0, 4);
  const propK = Array.isArray(o.prop) ? `${o.prop[0]}_${qInt(o.prop[1], 16)}` : String(o.prop ?? "none");
  const hOff = o.headOff ? `${qInt(o.headOff[0], 6)}_${qInt(o.headOff[1], 6)}` : "0";
  const eLook = o.eyeLook ? `${qInt(o.eyeLook[0], 6)}_${qInt(o.eyeLook[1], 6)}` : qInt(o.look ?? 0, 8);
  return [
    prefix,
    o.mode ?? "stand",
    o.expr ?? "neutral",
    o.armL ?? "d",
    o.armR ?? "d",
    qInt(o.armK ?? 1, 14),
    qInt(o.phase ?? 0, 16),
    eLook,
    blinkQ,
    qInt(o.bend ?? 0, 2),
    qInt(o.tilt ?? 0, 2),
    qInt(o.headTilt ?? 0, 2),
    hOff,
    qInt(o.headSquash ?? 1, 12),
    qInt(o.squash ?? 1, 12),
    qInt(o.inflate ?? 1, 10),
    qInt(o.spineCurve ?? 0, 10),
    qInt(o.hop ?? 0, 12),
    qInt(o.knees ?? 0, 8),
    o.soleY ?? 975,
    qInt(o.browLift ?? 0, 4),
    o.faceTint ? o.faceTint.replace("#", "") : "s",
    o.facing ?? 0,
    propK,
  ].join("_");
}

function ensureActorCard(keyPrefix: string, outfit: Outfit, opts: FrontOpts): string {
  const cleanOpts: FrontOpts = { mouthOpen: "auto", soleY: 1080, ...opts };
  const id = actorCardKey(keyPrefix, cleanOpts).replace(/[^a-zA-Z0-9_-]/g, "_");
  if (!seenCards.has(id)) {
    seenCards.add(id);
    EXPORT_CARDS.push({ id, width: 900, height: 1680, designW: 600, designH: 1120, draw: (p) => bodyFront(p, outfit, cleanOpts) });
  }
  return id;
}

type ExtraTrans = Partial<Pick<CardPlacement, "rotDeg" | "pitchDeg" | "yawDeg" | "scaleX" | "scaleY" | "jitter">>;

function addLivingSeq(
  id: string,
  keyPrefix: string,
  outfit: Outfit,
  a: number,
  b: number,
  posAt: (u: number, f: number) => [number, number, number],
  optsAt: (u: number, f: number) => FrontOpts,
  cfg?: {
    blinkPeriod?: number;
    blinkShift?: number;
    swaps?: number[];
    heightAt?: (u: number, f: number) => number;
    emit?: number;
    extraAt?: (u: number, f: number) => ExtraTrans;
  }
) {
  const period = cfg?.blinkPeriod ?? 36;
  const shift = cfg?.blinkShift ?? 0;
  const swaps = cfg?.swaps ?? [];
  const span = Math.max(1, b - a - 1);
  let lastKey = "";

  for (let f = a; f < b; f++) {
    const u = (f - a) / span;
    const baseOpts = optsAt(u, f);
    const bl = baseOpts.blink ?? blinkValueAt(f, period, shift, swaps);
    const card = ensureActorCard(keyPrefix, outfit, { ...baseOpts, blink: bl });
    const pos = posAt(u, f);
    const heightM = cfg?.heightAt ? cfg.heightAt(u, f) : 2.15;
    const extra = cfg?.extraAt ? cfg.extraAt(u, f) : {};
    const placementKey = JSON.stringify([card, pos.map((v) => Math.round(v * 1000)), Math.round(heightM * 100), extra]);
    const prev = CARD_PLACEMENTS[CARD_PLACEMENTS.length - 1];
    if (prev && prev.id === id && prev.b === f && placementKey === lastKey) {
      prev.b = f + 1;
    } else {
      CARD_PLACEMENTS.push({ id, card, pos, heightM, a: f, b: f + 1, emit: cfg?.emit ?? 0.5, ...extra });
      lastKey = placementKey;
    }
  }
}

// ===== المهندس: ينشر الفجوات (f0–111) =====
addLivingSeq(
  "engineer",
  "engineer",
  ENGINEER,
  0,
  112,
  (u, f) => {
    // ارتداد خفيف عند وصول القاطرة (f96) — قفزة ارتداد صغيرة للخلف
    const j = f >= 96 && f < 110 ? Math.sin(clamp01((f - 96) / 14) * Math.PI) * 0.22 : 0;
    return [lerp(-0.55, -0.35, smooth(u)) - j * 1.6, j, 2.6];
  },
  (_u, f) => {
    const sawing = f < 92;
    const sawVal = sawing ? 0.5 + 0.5 * Math.sin(f * 0.92) : 0.2;
    const sp = f >= 96 ? springBounce(f - 96, 0.5, 0.18, 0.15) : 0;
    return {
      mode: sawing ? "crouch" : "stand",
      expr: f < 54 ? "stern" : f < 96 ? "tired" : "meme_shock",
      browLift: f >= 96 ? 0.8 : 0.1,
      armL: sawing ? "hip" : "raise",
      armR: sawing ? "point" : "raise",
      armK: 0.9,
      prop: ["saw", sawVal],
      phase: (f * 0.05) % 1,
      bend: sawing ? 10 : 4,
      spineCurve: sawing ? 0.16 : -0.06,
      squash: 1 - sp * 0.6,
      hop: f >= 96 && f < 110 ? Math.sin(clamp01((f - 96) / 14) * Math.PI) * 0.5 : 0,
      headOff: [0, sp * 8],
      eyeLook: f >= 96 ? [0.55, 0.25] : [0.1, -0.35],
      facing: 1,
      seed: 2,
    };
  },
  { blinkPeriod: 40, blinkShift: 12, swaps: [96] }
);

// ===== العامل بالمصباح (f0–80) =====
addLivingSeq(
  "worker",
  "worker",
  WORKER,
  0,
  80,
  () => [3.2, 0, 2.8],
  (_u, f) => ({
    mode: "stand",
    expr: f < 54 ? "neutral" : "smile",
    armL: "raise",
    armR: "hip",
    armK: 0.8,
    prop: ["hammer", 0.3 + 0.2 * Math.sin(f * 0.2)],
    eyeLook: [-0.25, -0.1],
    facing: -1,
    seed: 5,
  }),
  { blinkPeriod: 44, blinkShift: 6 }
);

// ===== المسّاح على الحافة (f269–300) =====
addLivingSeq(
  "surveyor",
  "surveyor",
  SURVEYOR,
  269,
  300,
  () => [-2.6, 0, 447.5],
  (_u, f) => ({
    mode: "stand",
    expr: "smug",
    armL: "hip",
    armR: "point",
    armK: 1,
    browLift: 0.4,
    eyeLook: [0.35, 0.1],
    facing: 1,
    seed: 7,
  }),
  { blinkPeriod: 38, blinkShift: 2 }
);

// ===== FX: نشارة المعدن عند النشر + غبار الكanyon =====
for (let k = 0; k < 6; k++) {
  EXPORT_CARDS.push({ id: `fx_sp_${k}`, width: 600, height: 432, designW: 500, designH: 360, draw: (p) => fxSparkles(p, k / 6) });
}
EXPORT_CARDS.push({ id: "fx_burst_lamp", width: 600, height: 600, designW: 500, designH: 500, draw: (p) => fxBurst(p, 0.45, "#ffd98a", 10, 40, 220) });

for (let f = 0; f < 92; f += 2) {
  const idx = (f >> 1) % 6;
  CARD_PLACEMENTS.push({
    id: "fx_sawdust",
    card: `fx_sp_${idx}`,
    pos: [-0.62, 0.28, 2.34],
    heightM: 0.55,
    a: f,
    b: f + 2,
    emit: 0.85,
    shadow: false,
    jitter: 0.04,
  });
}
CARD_PLACEMENTS.push({ id: "fx_lamp_glow", card: "fx_burst_lamp", pos: [3.35, 1.55, 2.86], heightM: 1.1, a: 0, b: 80, emit: 0.95, shadow: false, jitter: 0.02 });
