import type { ToonSpec } from "../engine/draw";

// ============================================================
// cast.ts — طاقم "Why Perfect Railroads Don't Work" (من التحليل)
// المهندس (قبعة مخططة + سترة تركوازية + وشاح أحمر)، الزعيم
// (بدلة صفراء + بولر)، قائد القطار، رجل الشاي، العمال، مروّج
// الجرائد، صاحب الكرسي. الغضب = بدلة بنفسجية.
// ============================================================
export const C: Record<string, ToonSpec> = {
  // المهندس — القبطان الشاب
  engineer: { hat: "stripecap", hatColor: "#3a4f7a", band: "#e8e4dc", coat: "#20b0a0", vest: "#7a2c2c", scarf: "#a8322c", hair: "#5a3a26" },
  // الزعيم — بدلة صفراء، بولر، عصا وساعة جيب
  boss: { hat: "bowler", hatColor: "#2c2622", coat: "#e8a72c", vest: "#c9a227", buttons: "#e8b23a", hair: "#1c1c22" },
  // الزعيم الغاضب (بنفسجي + بخار)
  bossPurple: { hat: "bowler", hatColor: "#2c2622", coat: "#8b2fd6", vest: "#6a1fa0", buttons: "#e8b23a", hair: "#1c1c22" },
  // قائد القطار
  conductor: { hat: "cabbie", hatColor: "#252447", band: "#e8b23a", coat: "#252447", buttons: "#e8b23a", hair: "#3a2a1e", moustache: true },
  // رجل الشاي
  teaMan: { hat: "top", hatColor: "#24242c", band: "#6b2a2a", coat: "#6a4a6a", vest: "#d9c26a", hair: "#3b2a20", moustache: true },
  // عمال المنصة
  workerA: { hat: "flatcap", hatColor: "#5a4a3a", coat: "#2e9e6b", vest: "#c88a3a", hair: "#3a2a1e" },
  workerB: { hat: "flatcap", hatColor: "#8a5d3b", coat: "#7a5a3c", vest: "#d8c9a6", hair: "#2b211c", moustache: true },
  workerC: { hat: "flatcap", hatColor: "#3f6a6f", coat: "#20b0a0", vest: "#5b4a8a", hair: "#1e1714" },
  // عامل بالنظارات (يجلس أسفل في لقطة الوجهين)
  goggle: { hat: "flatcap", hatColor: "#4f7fb8", coat: "#2e9e6b", vest: "#c88a3a", hair: "#5a3b2a", glasses: true },
  // مروّج الجرائد
  newsman: { hat: "flatcap", hatColor: "#6a5a4a", coat: "#9a8a7a", vest: "#4f7fb8", hair: "#3a2a1e", moustache: true },
  // صاحب كرسي الشاطئ
  lounger: { hat: "bowler", hatColor: "#171717", coat: "#171717", vest: "#e8b23a", hair: "#1c1c22", wide: 1.1 },
  // رجل حفل الشركات الأسود
  suitMan: { hat: "top", hatColor: "#171717", coat: "#171717", vest: "#c9a227", scarf: "#a8322c", hair: "#2a1e16" },
  // شريك أصفر بالحفل
  yellowMan: { hat: "bowler", hatColor: "#3a2a22", coat: "#e8a72c", vest: "#8a2a2a", hair: "#2a1e16" },
};
