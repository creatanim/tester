// ============================================================
// sets.tsx — بيئات "Why Perfect Railroads Don't Work" (من التحليل):
// أخدود مخطط، نفق + قاطرة #7، جسر عوارض فوق الماء، صحراء، محطة،
// بهو، حافة العمال، منصة البناء، العربة الفاخرة، الخط القصير،
// الفجوات المتوهجة، السكّة المثالية، جسر الغروب، الانفجار.
// ============================================================
import React, { useMemo } from "react";
import * as THREE from "three";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Box, Cyl, Ground, Roof, Window, Lamp, Sign, Fire, Snow } from "../engine/kit";
import { planks, painted, bricks, signTex, rng, shade, sky as skyTex, water as waterTex, cobbles } from "../engine/tex";
import { LAYER_FX, V3 } from "../engine/Stage";

// ---------- نسيج مخصص: صخر مخطط بالأمواج (جدار الأخدود) ----------
export const strata = (base = "#ce5f3e", dark = "#b5301c", light = "#e78543", rep: [number, number] = [3, 3]) => {
  const c = document.createElement("canvas"); c.width = c.height = 512;
  const g = c.getContext("2d")!;
  g.fillStyle = base; g.fillRect(0, 0, 512, 512);
  const r = rng(11);
  for (let i = 0; i < 26; i++) {
    const y = (i / 26) * 512;
    g.fillStyle = i % 3 === 0 ? dark : i % 3 === 1 ? light : base;
    g.globalAlpha = 0.55;
    g.beginPath(); g.moveTo(0, y);
    for (let x = 0; x <= 512; x += 32) g.lineTo(x, y + Math.sin(x * 0.02 + i * 1.7) * 12 + (r() - 0.5) * 8);
    g.lineTo(512, y + 22 + (r() - 0.5) * 10); g.lineTo(0, y + 22 + (r() - 0.5) * 10); g.closePath(); g.fill();
    // خطوط رفيعة فاتحة
    g.globalAlpha = 0.35; g.strokeStyle = light; g.lineWidth = 3;
    g.beginPath(); g.moveTo(0, y + 6);
    for (let x = 0; x <= 512; x += 32) g.lineTo(x, y + 6 + Math.sin(x * 0.02 + i * 1.7) * 12);
    g.stroke();
  }
  g.globalAlpha = 1;
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep);
  return t;
};

// ---------- نسيج حصى (بلاطات السكة) ----------
export const gravel = (base = "#8a5a4c", rep: [number, number] = [12, 40]) => {
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = base; g.fillRect(0, 0, 256, 256);
  const r = rng(23);
  const cols = ["#a2705c", "#c98d68", "#6b4a3c", "#d9a08c", "#7a4a3c", "#b2766c"];
  for (let i = 0; i < 260; i++) {
    g.fillStyle = cols[i % cols.length];
    g.beginPath(); g.ellipse(r() * 256, r() * 256, 4 + r() * 9, 3 + r() * 6, r() * 3, 0, 7); g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep);
  return t;
};

// ---------- سماء جاهزة ----------
export const makeSky = (top: string, mid: string, bottom: string, night = false) => skyTex(top, mid, bottom, "#ffffff", night);

// ============================================================
// السكك: قضبان + مستطيلات خشبية على طول Z
// ============================================================
export const Rails: React.FC<{ len?: number; gauge?: number; y?: number; glow?: "none" | "magenta" | "gold" | "mix"; z?: number; x?: number }> = ({ len = 120, gauge = 1.5, y = 0.09, glow = "none", z = 0, x = 0 }) => {
  const ties = Math.floor(len / 0.62);
  const tieMap = useMemo(() => planks("#6b4a3c", [1, 1]), []);
  return (
    <group position={[x, 0, z]}>
      <Box size={[gauge + 1.1, 0.12, len]} pos={[0, y - 0.05, 0]} color="#7a4a3c" shadow={false} />
      {Array.from({ length: ties }).map((_, i) => (
        <Box key={i} size={[gauge + 0.75, 0.1, 0.32]} pos={[0, y + 0.03, -len / 2 + i * 0.62]} map={tieMap} shadow={false} />
      ))}
      {[-1, 1].map((s) => {
        const g = glow === "mix" ? (s < 0 ? "#b71fa0" : "#e9c25c") : glow === "magenta" ? "#b71fa0" : glow === "gold" ? "#e9c25c" : "#c9a227";
        const em = glow === "none" ? undefined : glow === "mix" ? (s < 0 ? "#5c1050" : "#8a6a1c") : glow === "magenta" ? "#5c1050" : "#8a6a1c";
        return (
          <Box key={s} size={[0.14, 0.16, len]} pos={[(s * gauge) / 2, y + 0.12, 0]} color={glow === "none" ? "#c9cfd6" : g} emissive={em} emissiveIntensity={glow === "none" ? 0 : 0.85} />
        );
      })}
    </group>
  );
};

// ============================================================
// القاطرة البخارية رقم 7
// ============================================================
export const Locomotive7: React.FC<{ pos?: V3; rotY?: number; scale?: number }> = ({ pos = [0, 0, 0], rotY = 0, scale = 1 }) => (
  <group position={pos} rotation={[0, rotY, 0]} scale={scale}>
    <Cyl r={1.05} h={3.4} pos={[0, 1.75, 0.2]} rot={[Math.PI / 2, 0, 0]} color="#241018" />
    <Box size={[2.1, 2.1, 1.7]} pos={[0, 2.1, -2.1]} color="#241018" />
    <Cyl r={0.34} h={1.15} pos={[0, 3.35, 1.35]} color="#241018" />
    <Cyl r={1.07} h={0.3} pos={[0, 1.75, 1.95]} rot={[Math.PI / 2, 0, 0]} color="#3a2028" />
    {/* مصباح أمامي متوهج */}
    <mesh position={[0, 2.35, 2.14]}><sphereGeometry args={[0.38, 16, 12]} /><meshStandardMaterial color="#ffd977" emissive="#ffb347" emissiveIntensity={3} /></mesh>
    <mesh position={[0, 2.35, 2.2]} layers={LAYER_FX}><sphereGeometry args={[1.05, 16, 12]} /><meshBasicMaterial color="#ffd977" transparent opacity={0.18} depthWrite={false} fog={false} /></mesh>
    {/* لوحة الرقم 7 */}
    <mesh position={[0, 1.55, 2.14]}><circleGeometry args={[0.42, 20]} /><meshStandardMaterial map={signTex(["7"], "#e8b23a", "#3a2018")} /></mesh>
    {/* معكاز أحمر */}
    <Box size={[2.2, 0.9, 0.5]} pos={[0, 0.6, 2.5]} rot={[0.5, 0, 0]} color="#c4422e" />
    <Box size={[2.2, 0.55, 0.28]} pos={[0, 1.15, 2.05]} color="#b5301c" />
    {/* عجلات */}
    {[-1.05, 1.05].map((x) => [-1.5, 0, 1.5].map((z) => (
      <Cyl key={x + "" + z} r={0.62} h={0.24} pos={[x, 0.62, z]} rot={[0, 0, Math.PI / 2]} color="#171717" />
    )))}
    {/* شريط أحمر */}
    <Box size={[2.16, 0.28, 3.6]} pos={[0, 2.85, 0.1]} color="#c4422e" />
  </group>
);

// ============================================================
// أعمدة التلغراف + الصبار
// ============================================================
export const Telegraph: React.FC<{ pos: V3 }> = ({ pos }) => (
  <group position={pos}>
    <Cyl r={0.1} h={5.2} pos={[0, 2.6, 0]} color="#4a2c24" />
    <Box size={[1.9, 0.12, 0.12]} pos={[0, 4.9, 0]} color="#4a2c24" />
    {[-1, 0, 1].map((i) => <mesh key={i} position={[i * 0.8, 5.08, 0]}><sphereGeometry args={[0.1, 8, 6]} /><meshStandardMaterial color="#2c1c1c" /></mesh>)}
  </group>
);

export const Cactus: React.FC<{ pos: V3; s?: number }> = ({ pos, s = 1 }) => (
  <group position={pos} scale={s}>
    <Cyl r={0.34} r2={0.3} h={2.1} pos={[0, 1.05, 0]} color="#3f6b6c" />
    <Cyl r={0.2} h={0.9} pos={[-0.55, 1.5, 0]} rot={[0, 0, 0.75]} color="#3f6b6c" />
    <Cyl r={0.2} h={0.75} pos={[-0.78, 2.05, 0]} color="#3f6b6c" />
    <Cyl r={0.2} h={0.9} pos={[0.55, 1.8, 0]} rot={[0, 0, -0.75]} color="#3f6b6c" />
    <Cyl r={0.2} h={0.7} pos={[0.78, 2.35, 0]} color="#3f6b6c" />
  </group>
);

// ============================================================
// L01–L04: ممر الأخدود (جدران مخططة + حصى + سكة + نفق)
// ============================================================
export const Canyon: React.FC<{ dark?: boolean; children?: React.ReactNode }> = ({ dark = false, children }) => {
  const wallMap = useMemo(() => strata(dark ? "#62162c" : "#ce5f3e", dark ? "#3a0f22" : "#b5301c", dark ? "#8e3c3c" : "#e78543", [2, 2]), [dark]);
  const wallMap2 = useMemo(() => strata(dark ? "#4a1226" : "#d85b2c", dark ? "#2c1420" : "#8e2418", dark ? "#62162c" : "#e0a08c", [2, 2]), [dark]);
  const grav = useMemo(() => gravel(dark ? "#4a2c3c" : "#8a5a4c"), [dark]);
  return (
    <group>
      <Ground map={grav} size={90} y={0} />
      <Rails len={130} gauge={1.55} z={-16} />
      {/* الجدران */}
      <Box size={[12, 26, 120]} pos={[-11.5, 11, -18]} map={wallMap} />
      <Box size={[11, 22, 120]} pos={[13, 9, -18]} map={wallMap2} />
      {/* النفق */}
      <Box size={[13, 8, 4]} pos={[0, 9.5, -62]} map={wallMap2} />
      <Box size={[4.6, 7.5, 4.2]} pos={[-4.2, 3.75, -61.8]} map={wallMap} />
      <Box size={[4.6, 7.5, 4.2]} pos={[4.2, 3.75, -61.8]} map={wallMap} />
      <mesh position={[0, 4.6, -61.7]}><planeGeometry args={[6.2, 9]} /><meshStandardMaterial color="#120810" /></mesh>
      {children}
    </group>
  );
};

// ============================================================
// L05–L06: الخليج + الجسور الخشبية + الرافعات
// ============================================================
export const Bay: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const w = useMemo(() => waterTex("#1d3198", [24, 24]), []);
  const rockA = useMemo(() => strata("#b2494c", "#7a2c4c", "#d88494", [2, 2]), []);
  const rockB = useMemo(() => strata("#c2524c", "#8e2418", "#e0a08c", [2, 2]), []);
  return (
    <group>
      <Ground map={w} size={420} y={-12} />
      <Box size={[34, 44, 130]} pos={[-38, 8, -26]} map={rockA} />
      <Box size={[30, 38, 120]} pos={[40, 4, -20]} map={rockB} />
      <Trestle pos={[-12, 8, -6]} len={72} h={17} />
      <Trestle pos={[18, 8, -2]} len={54} h={17} />
      <Trestle pos={[0, 5, 20]} len={22} h={13} />
      <Crane pos={[2, 5, 20]} />
      {children}
    </group>
  );
};

// جسر عوارض
export const Trestle: React.FC<{ pos: V3; len?: number; h?: number; rotY?: number }> = ({ pos, len = 60, h = 16, rotY = 0 }) => {
  const wood = useMemo(() => planks("#7a4a3c", [1, 3]), []);
  const n = Math.floor(len / 4.2);
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      <Box size={[5.4, 0.5, len]} pos={[0, 0, 0]} map={wood} />
      {Array.from({ length: n + 1 }).map((_, i) => (
        <group key={i} position={[0, 0, -len / 2 + i * 4.2]}>
          {[-2.1, 2.1].map((x) => <Box key={x} size={[0.42, h, 0.42]} pos={[x, -h / 2 - 0.2, 0]} color="#4a2c24" />)}
          <Box size={[4.6, 0.3, 0.3]} pos={[0, -h * 0.52, 0]} color="#4a2c24" />
          <Box size={[4.6, 0.3, 0.3]} pos={[0, -h * 0.22, 0]} color="#4a2c24" />
        </group>
      ))}
    </group>
  );
};

// رافعة
export const Crane: React.FC<{ pos: V3; s?: number }> = ({ pos, s = 1 }) => (
  <group position={pos} scale={s}>
    <Box size={[0.4, 9, 0.4]} pos={[0, 4.5, 0]} color="#e8b23a" />
    <Box size={[0.32, 5, 0.32]} pos={[1.5, 7.6, 0]} rot={[0, 0, -0.85]} color="#e8b23a" />
    <Cyl r={0.035} h={3.4} pos={[3.2, 5.6, 0]} color="#171717" />
  </group>
);

// ============================================================
// L07–L09: الصحراء + الهضاب + القطار البعيد
// ============================================================
export const Desert: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const grav = useMemo(() => gravel("#b08494", [40, 40]), []);
  return (
    <group>
      <Ground map={grav} size={320} y={-0.1} />
      {[[-30, -60], [30, -75], [-8, -95], [16, -85]].map(([x, z], i) => (
        <Box key={i} size={[22 + i * 6, 7 + i * 2.4, 16]} pos={[x, 3 + i, z]} map={painted(i % 2 ? "#b06858" : "#c2725c", [2, 1], 400)} />
      ))}
      {/* قطار مصغّر على الأفق */}
      {Array.from({ length: 7 }).map((_, i) => (
        <Box key={i} size={[2.6, 1.9, 1.7]} pos={[i * 3 - 9, 1, -58]} color="#2c1520" />
      ))}
      {children}
    </group>
  );
};

// ============================================================
// L10 + L11 + L26–L27: المحطة (واجهة + بهو + حفل + الجريدة)
// ============================================================
export const StationExt: React.FC = () => {
  const brickMap = useMemo(() => bricks("#a8442e", [6, 3]), []);
  return (
    <group>
      <Box size={[40, 13, 7]} pos={[0, 6.5, -30]} map={brickMap} />
      {/* القبة */}
      <mesh position={[0, 13, -30]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[13, 13, 6.5, 24, 1, true, 0, Math.PI]} />
        <meshStandardMaterial color="#86aae0" transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>
      {Array.from({ length: 7 }).map((_, i) => (
        <Box key={i} size={[0.22, 6.5, 0.22]} pos={[(i - 3) * 3.6, 16, -30]} rot={[0, 0, (i - 3) * 0.1]} color="#171717" />
      ))}
      {/* برج الساعة */}
      <Box size={[7, 9, 5]} pos={[0, 18.5, -30]} map={brickMap} />
      <mesh position={[0, 19.5, -27.4]}><circleGeometry args={[2.1, 24]} /><meshStandardMaterial color="#f3e3d1" /></mesh>
      <Box size={[0.16, 1.5, 0.08]} pos={[0, 20, -27.3]} color="#171717" />
      <Box size={[1.1, 0.16, 0.08]} pos={[0.45, 19.5, -27.3]} color="#171717" />
      {/* لافتة */}
      <Sign lines={["FIRST LINE IN", "GETS IT ALL!"]} pos={[0, 10, -26.3]} w={22} h={5} bg="#f7f2ea" fg="#c4422e" />
      {[0, 1, 2, 3, 4].map((i) => (
        <group key={i} position={[(i - 2) * 7.2, 0, -26.2]}>
          <Box size={[5, 5.4, 0.3]} pos={[0, 2.7, 0]} color="#3a1420" />
          <mesh position={[0, 5.5, 0.2]}><torusGeometry args={[2.6, 0.5, 8, 18, Math.PI]} /><meshStandardMaterial color="#7a2c2c" /></mesh>
        </group>
      ))}
    </group>
  );
};

export const Hall: React.FC<{ phase?: "ceremony" | "news"; children?: React.ReactNode }> = ({ phase = "news", children }) => {
  const floorMap = useMemo(() => planks("#7a4a32", [6, 6]), []);
  const brickMap = useMemo(() => bricks("#a8442e", [8, 3]), []);
  return (
    <group>
      <Ground map={floorMap} size={80} y={0} />
      <Box size={[60, 18, 2]} pos={[0, 9, -16]} map={brickMap} />
      {[-2, -1, 0, 1, 2].map((i) => (
        <group key={i} position={[i * 9, 0, -14.9]}>
          <Window w={5.4} h={6} pos={[0, 8, 0]} lit={phase === "ceremony"} frame="#e3d8c2" />
        </group>
      ))}
      <mesh position={[0, 15.5, -14.8]}><circleGeometry args={[2.4, 24]} /><meshStandardMaterial color="#f3e3d1" /></mesh>
      {phase === "ceremony" ? (
        <group>
          <Sign lines={["FIRST LINE IN", "GETS IT ALL!"]} pos={[0, 11.5, -13.5]} w={26} h={6} bg="#f7f2ea" fg="#c4422e" />
          <Sign lines={["UNION"]} pos={[0, 16.8, -13.6]} w={22} h={3.6} bg="#252447" fg="#e8b23a" />
          <Box size={[14, 0.25, 9]} pos={[0, 0.14, -3]} color="#c4422e" />
          {/* جبل الذهب */}
          <mesh position={[-2.2, 1.4, -5.6]}><coneGeometry args={[3, 2.8, 7]} /><meshStandardMaterial color="#e8a72c" /></mesh>
          <mesh position={[2, 1.2, -6.4]}><coneGeometry args={[2.5, 2.3, 7]} /><meshStandardMaterial color="#e8b23a" /></mesh>
          {/* أكياس النقود */}
          {[[3, -3.6], [4.4, -5], [-0.2, -3.2]].map(([x, z], i) => (
            <group key={i} position={[x, 0, z]}>
              <mesh position={[0, 0.9, 0]}><sphereGeometry args={[0.85, 12, 10]} /><meshStandardMaterial color="#c9a24a" /></mesh>
              <Cyl r={0.24} r2={0.45} h={0.6} pos={[0, 1.9, 0]} color="#c9a24a" />
            </group>
          ))}
        </group>
      ) : (
        <group>
          <Sign lines={["ALL ABOARD!"]} pos={[0, 9.5, -12.5]} w={11} h={2.6} bg="#f3e3d1" fg="#c4422e" />
          <CalendarCart pos={[6.5, 0, -2.5]} />
        </group>
      )}
      {children}
    </group>
  );
};

// عربة التقويم
export const CalendarCart: React.FC<{ pos: V3 }> = ({ pos }) => (
  <group position={pos}>
    <Box size={[2.6, 2.1, 1.8]} pos={[0, 1.05, 0]} color="#2f7d4f" />
    <mesh position={[0, 1.35, 0.93]}><planeGeometry args={[1.5, 1.8]} /><meshStandardMaterial map={signTex(["JUNE", "1887"], "#f3ead8", "#2c1c22")} /></mesh>
    <Box size={[2.6, 0.14, 1.2]} pos={[0, 2.3, -1.2]} rot={[-1.05, 0, 0]} color="#2f7d4f" />
    {[-0.95, 0.95].map((x) => <Cyl key={x} r={0.38} h={0.2} pos={[x, 0.38, 0.65]} rot={[0, 0, Math.PI / 2]} color="#171717" />)}
  </group>
);

// علم أزرق
export const BlueFlag: React.FC<{ pos: V3 }> = ({ pos }) => (
  <group position={pos}>
    <Cyl r={0.06} h={4.4} pos={[0, 2.2, 0]} color="#6b4a3c" />
    <Box size={[1.7, 1, 0.05]} pos={[0.9, 3.9, 0]} color="#3d6fd4" />
  </group>
);

// ============================================================
// L12: حافة العمال (جدار + ماء + عارضة)
// ============================================================
export const Ridge: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const wallMap = useMemo(() => strata("#b5301c", "#8e2418", "#d87464", [4, 2]), []);
  const w = useMemo(() => waterTex("#1d3198", [24, 24]), []);
  return (
    <group>
      <Box size={[120, 40, 90]} pos={[0, -16, -32]} map={wallMap} />
      <Ground map={w} size={220} y={-11} pos={[0, 0, -10]} />
      <Box size={[44, 0.5, 2.6]} pos={[0, 3, 0]} rot={[0, 0, -0.1]} map={planks("#8a5a3c", [8, 1])} />
      <Box size={[44, 0.12, 0.12]} pos={[0, 4.2, -1.4]} rot={[0, 0, -0.1]} color="#4a2c24" />
      {children}
    </group>
  );
};

// ============================================================
// L18–L21: منصة البناء (سطح + رافعات + مصابيح + صناديق + دخان)
// ============================================================
export const DeckPlatform: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const wood = useMemo(() => planks("#9a5b4d", [10, 14]), []);
  return (
    <group>
      <Box size={[42, 0.7, 64]} pos={[0, 0.35, -8]} map={wood} />
      <Crane pos={[-6, 0.7, -16]} s={1.15} />
      <Crane pos={[7, 0.7, -18]} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Lamp key={i} pos={[-9 + i * 3.6, 0.7, -4]} light={22} dist={9} />
      ))}
      {[[3.4, -7], [-4.6, -6], [8.2, -9.5]].map(([x, z], i) => (
        <Box key={i} size={[1.5, 1.5, 1.5]} pos={[x, 1.45, z]} map={painted("#d4762c", [1, 1], 300)} />
      ))}
      {children}
    </group>
  );
};

// ============================================================
// L22–L23: العربة الفاخرة (خارج + داخل)
// ============================================================
export const LuxuryCar: React.FC<{ inside?: boolean; children?: React.ReactNode }> = ({ inside = false, children }) => {
  const wood = useMemo(() => planks("#c4622c", [4, 4]), []);
  const velvet = useMemo(() => painted("#8e1c2c", [3, 1], 1400), []);
  return inside ? (
    <group>
      <Box size={[11, 0.2, 26]} pos={[0, 0, 0]} color="#1c2c66" />
      <Box size={[11, 0.2, 26]} pos={[0, 6.4, 0]} map={wood} />
      {[-5.4, 5.4].map((x) => (
        <Box key={x} size={[0.2, 6.4, 26]} pos={[x, 3.2, 0]} map={velvet} />
      ))}
      <Box size={[11, 6.4, 0.2]} pos={[0, 3.2, -13]} map={velvet} />
      {[-3, 0, 3].map((z) => [-5.25, 5.25].map((x) => (
        <Window key={x + "" + z} w={2.4} h={1.9} pos={[x, 3.9, z]} rotY={x > 0 ? -Math.PI / 2 : Math.PI / 2} lit frame="#c4622c" panes={[1, 1]} />
      )))}
      {[-4, 4].map((z) => [-3, 3].map((x) => (
        <group key={x + "" + z}>
          <mesh position={[x, 5.2, z]}><sphereGeometry args={[0.34, 10, 8]} /><meshStandardMaterial color="#ffd977" emissive="#ffb347" emissiveIntensity={2.4} /></mesh>
          <pointLight position={[x, 5, z]} intensity={16} distance={8} decay={2} color="#ffb35c" />
        </group>
      )))}
      {[-7, 0, 7].map((z) => [-3.6, 3.6].map((x) => (
        <group key={"t" + x + z}>
          <Cyl r={0.85} h={0.12} pos={[x, 1.55, z]} color="#5b3437" />
          <Cyl r={0.1} h={1.5} pos={[x, 0.78, z]} color="#5b3437" />
        </group>
      )))}
      {children}
    </group>
  ) : (
    <group>
      <Box size={[3.6, 3.2, 20]} pos={[0, 2.2, 0]} color="#3a1420" />
      <Box size={[3.7, 0.9, 19]} pos={[0, 3.6, 0]} color="#252447" />
      <Sign lines={["VANDERGOLD"]} pos={[1.92, 4.1, 0]} w={14} h={1.1} rotY={Math.PI / 2} bg="#252447" fg="#e8b23a" />
      {[-3, -1.5, 0, 1.5, 3].map((z) => (
        <group key={z}>
          <Window w={1.7} h={1.5} pos={[1.88, 2.4, z]} rotY={-Math.PI / 2} lit={false} frame="#e8b23a" panes={[1, 1]} />
        </group>
      ))}
      {[-6.5, -2.2, 2.2, 6.5].map((z) => [-1.35, 1.35].map((x) => (
        <Cyl key={x + "" + z} r={0.5} h={0.18} pos={[x, 0.5, z]} rot={[0, 0, Math.PI / 2]} color="#171717" />
      )))}
    </group>
  );
};

// ============================================================
// L24–L25: الخط القصير (عربات + جدار النافذة)
// ============================================================
export const ShortLineCar: React.FC<{ pos: V3 }> = ({ pos }) => (
  <group position={pos}>
    <Box size={[3.2, 2.6, 8]} pos={[0, 2, 0]} color="#7a2c2c" />
    <Box size={[3.3, 0.9, 7.6]} pos={[0, 3.3, 0]} color="#2f7d4f" />
    <Sign lines={["RED CANYON LINE"]} pos={[1.68, 3.3, 0]} w={7} h={0.8} rotY={-Math.PI / 2} bg="#2f7d4f" fg="#e8b23a" />
    {[-2, 0, 2].map((z) => (
      <Window key={z} w={1.3} h={1.2} pos={[1.66, 2.15, z]} rotY={-Math.PI / 2} lit frame="#e8b23a" panes={[1, 1]} />
    ))}
    {[-1.2, 1.2].map((x) => [-2.4, 2.4].map((z) => (
      <Cyl key={x + "" + z} r={0.5} h={0.22} pos={[x, 0.5, z]} rot={[0, 0, Math.PI / 2]} color="#171717" />
    )))}
  </group>
);

export const CarWindowWall: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <group>
    <Box size={[9, 5.8, 0.4]} pos={[0, 2.9, -3]} color="#7a2c2c" />
    <Sign lines={["RED CANYON LINE"]} pos={[0, 4.9, -2.72]} w={7.4} h={1.1} bg="#2f7d4f" fg="#e8b23a" />
    <Box size={[3.4, 2.8, 0.12]} pos={[0, 2.6, -2.74]} color="#e8b23a" />
    <mesh position={[0, 2.6, -2.66]}><planeGeometry args={[2.9, 2.3]} /><meshStandardMaterial color="#86aae0" emissive="#4b73c5" emissiveIntensity={0.4} /></mesh>
    {children}
  </group>
);

// ============================================================
// L29–L31: الفجوات المتوهجة + الفرجار + الرافعة + العملة
// ============================================================
export const Caliper: React.FC<{ pos: V3; open?: number }> = ({ pos, open = 1 }) => (
  <group position={pos}>
    <Box size={[5.6, 0.3, 0.42]} pos={[0, 0, 0]} color="#c9a06a" />
    {Array.from({ length: 11 }).map((_, i) => (
      <Box key={i} size={[0.06, 0.14, 0.42]} pos={[-2.5 + i * 0.5, 0.2, 0]} color="#171717" shadow={false} />
    ))}
    <Box size={[0.26, 1.8, 0.3]} pos={[-0.55 * open, 0.95, 0]} rot={[0, 0, 0.2 * open]} color="#b8907c" />
    <Box size={[0.26, 1.8, 0.3]} pos={[0.55 * open, 0.95, 0]} rot={[0, 0, -0.2 * open]} color="#b8907c" />
  </group>
);

export const CraneArm: React.FC<{ pos: V3; tilt?: number }> = ({ pos, tilt = -0.28 }) => (
  <group position={pos}>
    <Box size={[0.55, 17, 0.55]} pos={[0, 8.5, 0]} rot={[0, 0, tilt]} color="#2c2c34" />
  </group>
);

// ============================================================
// L33–L34: السكّة المثالية + كرسي الشاطئ
// ============================================================
export const DeckChair: React.FC<{ pos: V3; rotY?: number }> = ({ pos, rotY = 0 }) => (
  <group position={pos} rotation={[0, rotY, 0]}>
    <Box size={[2.1, 0.12, 1.7]} pos={[0, 0.85, 0]} rot={[-0.12, 0, 0]} color="#e8b23a" />
    <Box size={[2.1, 1.8, 0.12]} pos={[0, 1.7, -0.82]} rot={[-0.5, 0, 0]} color="#e8b23a" />
    {[-0.92, 0.92].map((x) => [-0.7, 0.7].map((z) => (
      <Box key={x + "" + z} size={[0.1, 0.85, 0.1]} pos={[x, 0.42, z]} color="#171717" />
    )))}
    <Cyl r={0.06} h={4.6} pos={[0, 2.3, -1.3]} color="#171717" />
    <mesh position={[0, 4.8, -1.3]}><coneGeometry args={[2.5, 1.1, 10]} /><meshStandardMaterial color="#c4422e" /></mesh>
    <mesh position={[0, 4.55, -1.3]}><coneGeometry args={[1.7, 0.9, 10]} /><meshStandardMaterial color="#e8b23a" /></mesh>
  </group>
);

export const PerfectDeck: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const wood = useMemo(() => planks("#8a4a5c", [8, 30]), []);
  return (
    <group>
      <Box size={[36, 0.35, 150]} pos={[0, -0.16, -30]} map={wood} />
      <Ground map={gravel("#6b4a5c", [24, 60])} size={160} y={-0.32} />
      <Rails len={140} gauge={3.4} z={-30} y={0.12} />
      {[-1, 1].map((s) => [0, 1, 2, 3, 4].map((i) => (
        <Lamp key={s + "" + i} pos={[s * 6, 0, 4 - i * 13]} light={26} dist={11} />
      )))}
      {[[-20, -55], [20, -60], [-11, -70], [13, -72]].map(([x, z], i) => (
        <Box key={i} size={[16 + i * 3, 5 + (i % 2) * 2, 11]} pos={[x, 2, z]} map={painted("#b06858", [2, 1], 400)} />
      ))}
      {children}
    </group>
  );
};

// ============================================================
// L38–L39: جسر الغروب (أقواس فولاذية + قطار)
// ============================================================
export const SunsetBridge: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const rock = useMemo(() => strata("#a25464", "#7a2c4c", "#c88494", [6, 6]), []);
  return (
    <group>
      <Ground map={rock} size={260} y={-9} />
      <Box size={[6, 0.55, 120]} pos={[0, 6, -20]} color="#4a2c34" />
      {Array.from({ length: 21 }).map((_, i) => (
        <Box key={i} size={[5.6, 0.14, 0.9]} pos={[0, 6.36, 18 - i * 5.6]} color="#6a3c44" shadow={false} />
      ))}
      {[-1, 1].map((s) => [0, 1, 2].map((k) => (
        <group key={s + "" + k}>
          <mesh position={[s * 2.85, 6, 8 - k * 22]}><torusGeometry args={[5.8, 0.26, 8, 18, Math.PI]} /><meshStandardMaterial color="#3a2430" /></mesh>
          {Array.from({ length: 6 }).map((_, j) => (
            <Box key={j} size={[0.3, 5.6, 0.3]} pos={[s * 2.85, 3, 13 - k * 22 - j * 4]} color="#3a2430" />
          ))}
        </group>
      )))}
      {children}
    </group>
  );
};

export const Train: React.FC<{ pos: V3; rotY?: number }> = ({ pos, rotY = 0 }) => (
  <group position={pos} rotation={[0, rotY, 0]}>
    <Box size={[2.2, 1.7, 7.6]} pos={[0, 1, 0]} color="#2c1c22" />
    <Cyl r={0.8} h={1.5} pos={[0, 2.25, -2]} rot={[Math.PI / 2, 0, 0]} color="#2c1c22" />
    <Cyl r={0.17} h={0.8} pos={[0, 3.2, -2]} color="#2c1c22" />
    <mesh position={[0, 2.2, 2.4]}><sphereGeometry args={[0.3, 12, 10]} /><meshStandardMaterial color="#ffd977" emissive="#ffb347" emissiveIntensity={2.6} /></mesh>
  </group>
);

// ============================================================
// مؤثرات: دخان، شرر، بخار الغضب، كرة نار
// ============================================================
const puffTex = (col: string) => {
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, col); gr.addColorStop(0.55, col + "cc"); gr.addColorStop(1, col + "00");
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
};

export const Smoke: React.FC<{ pos: V3; count?: number; dark?: boolean; rise?: number; spread?: number; scale?: number }> = ({ pos, count = 10, dark = true, rise = 9, spread = 1.1, scale = 1 }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const t = frame / fps;
  const { geo, base, tex } = useMemo(() => {
    const r = rng(51);
    const base = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) { base[i * 4] = r(); base[i * 4 + 1] = r(); base[i * 4 + 2] = r(); base[i * 4 + 3] = 0.5 + r(); }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    return { geo, base, tex: puffTex(dark ? "#4a3230" : "#d9d2cf") };
  }, [count, dark]);
  const p = geo.getAttribute("position") as THREE.BufferAttribute;
  for (let i = 0; i < count; i++) {
    const s = base[i * 4 + 3];
    const k = (((base[i * 4 + 1] + (t * s * 0.55)) % 1) + 1) % 1;
    p.setXYZ(i,
      pos[0] + Math.sin(t * 1.2 + i * 2.1) * spread * (0.3 + k * 1.2),
      pos[1] + k * rise,
      pos[2] + Math.cos(t * 0.9 + i * 1.7) * spread * 0.4
    );
  }
  p.needsUpdate = true;
  return (
    <points geometry={geo} layers={LAYER_FX}>
      <pointsMaterial map={tex} size={(1.6 + k0(t)) * scale} sizeAttenuation transparent depthWrite={false} opacity={0.8} color="#ffffff" />
    </points>
  );
};
const k0 = (t: number) => 0.4 * Math.abs(Math.sin(t * 1.7));

export const Sparks: React.FC<{ pos: V3; count?: number }> = ({ pos, count = 16 }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const t = frame / fps;
  const { geo, base } = useMemo(() => {
    const r = rng(71);
    const base = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) { base[i * 3] = r(); base[i * 3 + 1] = r(); base[i * 3 + 2] = r(); }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    return { geo, base };
  }, [count]);
  const p = geo.getAttribute("position") as THREE.BufferAttribute;
  for (let i = 0; i < count; i++) {
    const k = ((t * 1.9 * (0.6 + base[i * 3 + 1]) + base[i * 3]) % 1);
    p.setXYZ(i,
      pos[0] + (base[i * 3] - 0.5) * 2.6 + Math.sin(t * 9 + i) * 0.3,
      pos[1] + k * 3.4,
      pos[2] + (base[i * 3 + 2] - 0.5) * 1.8
    );
  }
  p.needsUpdate = true;
  return (
    <points geometry={geo} layers={LAYER_FX}>
      <pointsMaterial map={useMemo(() => puffTex("#ffb347"), [])} size={0.22} sizeAttenuation transparent depthWrite={false} color="#ffd977" />
    </points>
  );
};

// بخار الغضب (جانبي الرأس)
export const AngerSteam: React.FC<{ pos: V3 }> = ({ pos }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const t = frame / fps;
  const { geo, base } = useMemo(() => {
    const r = rng(91);
    const base = new Float32Array(8 * 3);
    for (let i = 0; i < 8; i++) { base[i * 3] = r(); base[i * 3 + 1] = r(); base[i * 3 + 2] = r(); }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(8 * 3), 3));
    return { geo, base };
  }, []);
  const p = geo.getAttribute("position") as THREE.BufferAttribute;
  for (let i = 0; i < 8; i++) {
    const side = i < 4 ? -1 : 1;
    const k = ((t * 1.6 + base[i * 3]) % 1);
    p.setXYZ(i, pos[0] + side * (0.55 + k * 0.5), pos[1] + k * 1.1 - 0.15, pos[2] + 0.15);
  }
  p.needsUpdate = true;
  return (
    <points geometry={geo} layers={LAYER_FX}>
      <pointsMaterial map={useMemo(() => puffTex("#ffffff"), [])} size={0.85} sizeAttenuation transparent depthWrite={false} opacity={0.85} />
    </points>
  );
};

// كرة نار + سحابة فطر
export const Fireball: React.FC<{ pos: V3; grow: number }> = ({ pos, grow }) => {
  const g = Math.max(0, grow);
  return (
    <group position={pos}>
      <mesh position={[0, g * 1.6, 0]} layers={LAYER_FX}><sphereGeometry args={[2.2 * g + 0.3, 16, 12]} /><meshBasicMaterial color="#f7b94d" transparent opacity={0.95} fog={false} /></mesh>
      <mesh position={[0, g * 1.8, 0]} layers={LAYER_FX}><sphereGeometry args={[3.4 * g + 0.4, 16, 12]} /><meshBasicMaterial color="#e78932" transparent opacity={0.5} fog={false} /></mesh>
      <mesh position={[0, 1 + g * 2.2, 0]} layers={LAYER_FX}><sphereGeometry args={[1.4 * g + 0.2, 12, 10]} /><meshBasicMaterial color="#fff3c8" transparent opacity={0.9} fog={false} /></mesh>
      {grow > 1.2 && <mesh position={[0, 5.5, 0]} layers={LAYER_FX}><sphereGeometry args={[3.2 * Math.min(1.6, grow - 1), 12, 10]} /><meshBasicMaterial color="#5a3428" transparent opacity={0.85} fog={false} /></mesh>}
    </group>
  );
};
