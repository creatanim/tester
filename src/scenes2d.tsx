import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {C, ease, easeOut} from './theme';
import {Chibi} from './Chibi';
import {Sky, Clouds, CanyonWall, Ballast, PerspTrack, WoodDeck, Smoke, StationFacade, TopBanner, CalendarCart, BlueFlag} from './BuildingBlocks';

// ============================================================
// المشهدات 2D — الكاميرا/التكوين/الألوان كلها من التحليل
// الإطار-بإطار (انظر تقرير التحليل، الوحدات L01–L40)
// ============================================================

const Svg: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <svg width={720} height={1280} viewBox="0 0 720 1280" style={{position: 'absolute', inset: 0, ...style}}>
    {children}
  </svg>
);

const Streaks: React.FC<{intensity: number; dir?: 'x' | 'y'}> = ({intensity, dir = 'x'}) => (
  <AbsoluteFill style={{opacity: Math.min(1, intensity)}}>
    {Array.from({length: 14}).map((_, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          ...(dir === 'x'
            ? {left: -200, top: i * 96 + (i % 3) * 17, width: 1120, height: 26 + (i % 4) * 14}
            : {top: -200, left: i * 56 + (i % 3) * 11, height: 1680, width: 22 + (i % 4) * 12}),
          background: i % 2 ? 'rgba(255,255,255,0.28)' : 'rgba(20,10,30,0.35)',
          filter: 'blur(10px)',
        }}
      />
    ))}
  </AbsoluteFill>
);

// ---------- L01–L04 : المشي في الممر المظلم (f0–111) ----------
export const CanyonWalk: React.FC = () => {
  const f = useCurrentFrame();
  const camX = -f * 1.6;                       // truck جانبي مع الشخصية
  const bright = interpolate(f, [53, 64], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const trainScale = interpolate(f, [80, 111], [0.45, 1.25], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const walkPhase = f * 0.22;
  const skyTop = f < 53 ? C.darkCrimson : `color-mix(in srgb, ${C.darkCrimson}, ${C.sunsetOrange} ${bright * 80}%)`;

  return (
    <AbsoluteFill style={{background: C.darkCrimson, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${camX * 0.25}px)`}}>
        <Sky top={skyTop} bottom={f < 53 ? '#421226' : C.canyonRed} />
      </div>
      {/* النفق والقاطرة رقم 7 */}
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${camX * 0.5}px)`}}>
        <Svg>
          <path d="M 420 640 Q 520 420 620 640 L 620 760 L 420 760 Z" fill="#1a0d16" stroke={C.ink} strokeWidth={8} />
          <g transform={`translate(520 690) scale(${trainScale})`}>
            <rect x={-55} y={-70} width={110} height={90} rx={10} fill="#241018" stroke={C.ink} strokeWidth={5} />
            <rect x={-16} y={-104} width={32} height={40} rx={6} fill="#241018" stroke={C.ink} strokeWidth={5} />
            <circle cx={0} cy={-30} r={13} fill={C.gold} />
            <circle cx={0} cy={-30} r={22} fill={C.gold} opacity={0.25} />
            <text x={0} y={8} textAnchor="middle" fontSize={22} fontWeight={900} fill={C.gold}>7</text>
            <rect x={-52} y={20} width={104} height={14} fill={C.red} />
          </g>
          <Smoke x={520} y={560} t={f} dark />
        </Svg>
      </div>
      {/* الجدران */}
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${camX * 0.8}px)`}}>
        <CanyonWall side="left" fill={f < 53 ? C.deepRed : C.canyonOrange} dark={f < 53 ? '#3a0f22' : C.canyonDark} width={300} shift={-f * 0.4} />
      </div>
      {/* الأرضية والقضبان */}
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${camX * 1.15}px)`}}>
        <Ballast y={640} height={640} />
        <PerspTrack vanishX={520 - camX * 0.35} vanishY={640} />
      </div>
      {/* المهندس يمشي ويشرّع */}
      <Svg>
        <Chibi
          x={225} y={620 + Math.sin(walkPhase * 2) * 3} scale={1.55} jacket={C.teal} hat="cap"
          face={f < 14 ? 'angry' : 'normal'} walk={f < 14 ? 0 : walkPhase} saw={f < 14}
        />
      </Svg>
      {/* شرر عند وصول القاطرة */}
      {f >= 93 && f <= 108 && (
        <Svg>
          {Array.from({length: 12}).map((_, i) => (
            <circle key={i} cx={120 + i * 40 + ((f * 11 + i * 37) % 90)} cy={700 - ((f * 13 + i * 29) % 160)} r={4 + (i % 3) * 2} fill={C.goldBright} opacity={0.85} />
          ))}
        </Svg>
      )}
    </AbsoluteFill>
  );
};

// ---------- L07–L08 : الصعود والكشف عن الصحراء (f254–293) ----------
export const DesertRise: React.FC = () => {
  const f = useCurrentFrame();
  const rise = easeOut(Math.min(1, f / 30));
  return (
    <AbsoluteFill style={{background: C.sunsetOrange, overflow: 'hidden'}}>
      <Sky top={C.skyBlue} bottom="#e8c49a" />
      <Clouds y={120 + rise * 60} opacity={0.8} />
      {/* السهل البرتقالي */}
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${(1 - rise) * 520}px)`}}>
        <Svg>
          <rect x={0} y={520} width={720} height={760} fill={C.canyonOrange} />
          <rect x={0} y={520} width={720} height={26} fill="#b1492c" />
          {/* مبانٍ بعيدة */}
          {[80, 190, 320, 470, 600].map((x, i) => (
            <rect key={i} x={x} y={488 - i * 4} width={44 + i * 8} height={34 + i * 4} fill={C.canyonDark} opacity={0.85} />
          ))}
          {/* قطار مصغّر على الأفق */}
          <g transform="translate(360 512)">
            {Array.from({length: 7}).map((_, i) => (
              <rect key={i} x={-120 + i * 34} y={-14} width={30} height={16} rx={3} fill="#2c1520" />
            ))}
          </g>
        </Svg>
      </div>
      {/* الحافة الداكنة (تخرج لأسفل) */}
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${(1 - rise) * 260 + rise * 300}px)`}}>
        <Svg>
          <path d="M 0 900 L 720 840 L 720 1280 L 0 1280 Z" fill={C.canyonDark} />
        </Svg>
      </div>
    </AbsoluteFill>
  );
};

// ---------- L09 : ويب-بان سريع (f294–301) ----------
export const WhipStation: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: C.canyonOrange, overflow: 'hidden'}}>
      <AbsoluteFill style={{filter: `blur(${18 - f}px)`, transform: `translateX(${(f - 4) * 90}px)`}}>
        <Sky top={C.skyBlue} bottom="#e8c49a" />
        <Svg>
          <rect x={0} y={600} width={720} height={680} fill="#8a6a52" />
          {Array.from({length: 8}).map((_, i) => (
            <polygon key={i} points={`${i * 100 - 60},1280 ${i * 100 + 40},1280 ${330 + i * 12},600 ${318 + i * 12},600`} fill="#4a3a34" />
          ))}
        </Svg>
      </AbsoluteFill>
      <Streaks intensity={1 - f / 8} />
    </AbsoluteFill>
  );
};

// ---------- L10–L11 : المحطة وحفل الشركات (f302–347) ----------
export const StationCeremony: React.FC = () => {
  const f = useCurrentFrame();
  const push = 1 + ease(Math.min(1, f / 40)) * 0.12;
  return (
    <AbsoluteFill style={{background: C.skyBlue, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${push})`}}>
        <Sky top={C.skyLight} bottom={C.skyPale} />
        <StationFacade scale={1.05} />
        <TopBanner text="UNION" y={92} />
        <Svg>
          {/* المسرح: سجادة حمراء + جبل الذهب + أكياس نقود */}
          <rect x={0} y={880} width={720} height={400} fill="#8a6a72" />
          <rect x={70} y={1010} width={580} height={200} rx={12} fill={C.red} stroke={C.ink} strokeWidth={5} />
          <path d="M 120 1010 L 250 900 L 380 1010 Z" fill={C.yellow} stroke={C.ink} strokeWidth={4} />
          <path d="M 300 1010 L 430 880 L 570 1010 Z" fill={C.gold} stroke={C.ink} strokeWidth={4} />
          {/* أكياس نقود */}
          {[[210, 990], [330, 975], [455, 985]].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <path d="M -34 40 Q -40 -20 0 -26 Q 40 -20 34 40 Z" fill="#c9a24a" stroke={C.ink} strokeWidth={4} />
              <text x={0} y={22} textAnchor="middle" fontSize={30} fontWeight={900} fill={C.ink}>$</text>
            </g>
          ))}
          {/* الشخصيتان */}
          <Chibi x={330} y={920} scale={1.5} jacket={C.ink} hat="tophat" face="grin" />
          <Chibi x={430} y={935} scale={1.15} jacket={C.yellow} hat="bowler" face="happy" />
        </Svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- L12 : العمال على حافة الهاوية (f348–407) ----------
export const WorkersRidge: React.FC = () => {
  const f = useCurrentFrame();
  const camX = -f * 1.2;
  return (
    <AbsoluteFill style={{background: C.skyBlue, overflow: 'hidden'}}>
      <Sky top={C.skyBlue} bottom={C.skyLight} />
      <Clouds y={160} opacity={0.75} />
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${camX * 0.4}px)`}}>
        <Svg>
          {/* الجدار الأحمر المائل تحت العارضة */}
          <path d="M 0 520 L 720 360 L 720 1280 L 0 1280 Z" fill={C.fireRed} />
          {Array.from({length: 12}).map((_, i) => (
            <path key={i} d={`M 0 ${600 + i * 55} Q 360 ${540 + i * 55} 720 ${430 + i * 52}`} stroke="#8e2418" strokeWidth={9} fill="none" opacity={0.5} />
          ))}
          <path d="M 0 980 L 720 860 L 720 1280 L 0 1280 Z" fill={C.waterBlue} opacity={0.85} />
        </Svg>
      </div>
      {/* العارضة الخشبية والعمال */}
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${camX * 0.9}px)`}}>
        <Svg>
          <polygon points="0,660 720,470 720,510 0,700" fill={C.woodBrown} stroke={C.ink} strokeWidth={5} />
          <line x1={0} y1={600} x2={720} y2={420} stroke={C.ink} strokeWidth={6} />
          <Chibi x={300} y={520} scale={1.35} jacket={C.green} hat="flat" face="normal" walk={f * 0.25} />
          <Chibi x={420} y={482} scale={1.3} jacket="#7a5a3c" hat="flat" face="normal" walk={f * 0.25 + 1.4} />
          <Chibi x={530} y={452} scale={1.35} jacket={C.teal} hat="cap" face="normal" walk={f * 0.25 + 2.8} />
        </Svg>
      </div>
    </AbsoluteFill>
  );
};

// ---------- L13–L16 : الزعيم — الغضب — التراجع (f408–627) ----------
export const BossFace: React.FC = () => {
  const f = useCurrentFrame();
  // المراحل (إطارات محلية): 0-23 push-in | 24-71 وجهان قريبان | 72-100 pull-back
  // 101-108 push عنيف | 109-215 وجه بنفسجي + تراجع يكشف المهندس
  const scale =
    f < 24 ? interpolate(f, [0, 23], [1, 1.35]) :
    f < 72 ? interpolate(f, [24, 71], [1.5, 1.62]) :
    f < 101 ? interpolate(f, [72, 100], [1.35, 0.95]) :
    f < 109 ? interpolate(f, [101, 108], [1.1, 1.85]) :
    interpolate(f, [109, 215], [1.55, 0.9], {extrapolateRight: 'clamp'});
  const purple = f >= 109 && f < 181;
  const steam = f >= 114 && f < 200;
  const face = f >= 109 ? 'angry' : f < 24 ? 'normal' : 'worry';

  return (
    <AbsoluteFill style={{background: C.skyBlue, overflow: 'hidden'}}>
      <Sky top={C.skyBlue} bottom="#e9b48a" />
      <div style={{position: 'absolute', inset: 0, transform: `scale(${scale})`, transformOrigin: '50% 42%'}}>
        <CanyonWall side="left" fill={C.canyonOrange} dark={C.fireRed} width={330} />
        <CanyonWall side="right" fill={C.canyonRed} dark={C.canyonDark} width={190} />
        <Svg>
          <Ballast y={700} height={580} />
          <PerspTrack vanishX={360} vanishY={660} />
          {/* الزعيم */}
          <Chibi x={360} y={620} scale={2.1} jacket={C.yellow} hat="bowler" face={face} purple={purple} steam={steam} />
          {/* المهندس يظهر في التراجع */}
          {f >= 140 && <Chibi x={190} y={650} scale={1.6} jacket={C.teal} hat="cap" face="normal" opacity={Math.min(1, (f - 140) / 30)} />}
          {/* وجه بنظارات يدخل من الأسفل (f428+) */}
          {f >= 20 && f < 72 && <Chibi x={250} y={1010} scale={1.5} jacket={C.green} hat="flat" face="normal" glasses />}
        </Svg>
      </div>
      {/* وهج الشمس */}
      {f >= 72 && f < 109 && (
        <div style={{position: 'absolute', left: 60, top: 120, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,240,180,0.95), rgba(255,240,180,0))'}} />
      )}
    </AbsoluteFill>
  );
};

// ---------- L17 : بان سريع يميناً (f624–647) ----------
export const WhipRight: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: C.canyonRed, overflow: 'hidden'}}>
      <AbsoluteFill style={{filter: `blur(${Math.max(4, 16 - f * 0.8)}px)`, transform: `translateX(${-f * 70}px)`}}>
        <Sky top={C.skyBlue} bottom={C.canyonOrange} />
        <Svg>
          <rect x={0} y={640} width={720} height={640} fill={C.woodBrown} />
          {Array.from({length: 6}).map((_, i) => (
            <rect key={i} x={i * 140 + 40} y={600 - i * 8} width={26} height={220} fill={C.woodDark} />
          ))}
        </Svg>
      </AbsoluteFill>
      <Streaks intensity={1 - f / 24} />
    </AbsoluteFill>
  );
};

// ---------- L18–L20 : منصة البناء (f648–788) ----------
export const PlatformDeck: React.FC = () => {
  const f = useCurrentFrame();
  // 0-19 بخار ورافعات | 20-71 tilt-down للعامل | 72-75 ويب | 76-115 انزلاق الأعمدة | 116-140 pull-back
  const tiltY = f < 72 ? interpolate(f, [20, 71], [-160, 90], {extrapolateLeft: 'clamp'}) : 0;
  const slideX = f >= 76 && f < 116 ? -(f - 76) * 16 : 0;
  const pull = f >= 116 ? interpolate(f, [116, 140], [1, 0.82]) : 1;
  const blurred = (f >= 72 && f < 80) || (f >= 84 && f < 100);

  return (
    <AbsoluteFill style={{background: C.skyBlue, overflow: 'hidden', filter: blurred ? 'blur(6px)' : 'none'}}>
      <AbsoluteFill style={{transform: `scale(${pull}) translateY(${tiltY}px) translateX(${slideX}px)`}}>
        <Sky top={C.skyBlue} bottom="#d8a582" />
        <Svg>
          {/* رافعات صفراء + بخار */}
          <rect x={90} y={210} width={16} height={330} fill={C.gold} stroke={C.ink} strokeWidth={3} />
          <rect x={60} y={210} width={80} height={16} fill={C.gold} stroke={C.ink} strokeWidth={3} />
          <rect x={520} y={180} width={16} height={360} fill={C.gold} stroke={C.ink} strokeWidth={3} />
          <rect x={490} y={180} width={80} height={16} fill={C.gold} stroke={C.ink} strokeWidth={3} />
          <Smoke x={128} y={230} t={f * 2} />
          <Smoke x={558} y={200} t={f * 2 + 40} />
          {/* عمود مصباح */}
          <rect x={330} y={260} width={12} height={280} fill={C.ink} />
          <circle cx={336} cy={252} r={18} fill={C.goldBright} stroke={C.ink} strokeWidth={4} />
        </Svg>
        <WoodDeck y={520} height={760} color="#9a5b4d" />
        <Svg>
          {/* صناديق برتقالية */}
          <rect x={540} y={640} width={70} height={60} fill="#d4762c" stroke={C.ink} strokeWidth={4} />
          <rect x={120} y={700} width={60} height={52} fill="#d4762c" stroke={C.ink} strokeWidth={4} />
          {/* العامل بالزي الموحّد */}
          <Chibi x={370} y={780} scale={1.7} jacket={C.navy} hat="conductor" face={f > 45 ? 'normal' : 'worry'} />
        </Svg>
        {/* أعمدة الانزلاق */}
        {f >= 76 && f < 116 && (
          <Svg>
            {Array.from({length: 7}).map((_, i) => (
              <rect key={i} x={i * 130 + ((f - 76) * 16) % 130} y={330} width={22} height={330} fill={C.ink} />
            ))}
          </Svg>
        )}
        {/* الرجل ذو القبعة العالية يمشي */}
        {f >= 104 && (
          <Svg>
            <Chibi x={230} y={760} scale={1.6} jacket={C.ink} hat="tophat" face="normal" walk={(f - 104) * 0.22} />
          </Svg>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- L21–L22 : القطار الفاخر وداخله (f789–855) ----------
export const LuxuryTrain: React.FC = () => {
  const f = useCurrentFrame();
  const slide = f < 19 ? -f * 12 : -19 * 12;
  const push = f >= 19 ? interpolate(f, [19, 67], [1, 1.22]) : 1;
  const worry = f >= 59;

  return (
    <AbsoluteFill style={{background: C.navy, overflow: 'hidden'}}>
      {f < 19 ? (
        <AbsoluteFill style={{transform: `translateX(${slide}px)`}}>
          <Svg>
            <rect x={0} y={300} width={1400} height={560} fill="#3a1420" stroke={C.ink} strokeWidth={6} />
            <rect x={0} y={330} width={1400} height={80} fill={C.navy} />
            <text x={300} y={388} textAnchor="middle" fontSize={52} fontWeight={900} fill={C.gold} fontFamily="Georgia, serif" letterSpacing={8}>VANDERGOLD</text>
            {[120, 320, 520, 720].map((x, i) => (
              <rect key={i} x={x} y={440} width={150} height={200} rx={12} fill="#7a2c2c" stroke={C.gold} strokeWidth={5} />
            ))}
            <Chibi x={520} y={560} scale={1.1} jacket={C.white} hat="conductor" face="normal" />
          </Svg>
          <Streaks intensity={0.35} />
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{transform: `scale(${push})`}}>
          {/* داخل عربة الطعام */}
          <Svg>
            <rect x={0} y={0} width={720} height={340} fill="#c4622c" />
            {Array.from({length: 7}).map((_, i) => (
              <rect key={i} x={i * 105} y={0} width={16} height={340} fill="#8a3c1c" />
            ))}
            <rect x={0} y={340} width={720} height={620} fill="#8e1c2c" />
            <rect x={0} y={340} width={720} height={26} fill={C.green} />
            {/* نوافذ الصحراء */}
            {[40, 260, 480].map((x, i) => (
              <g key={i}>
                <rect x={x} y={420} width={170} height={190} rx={10} fill="#d8956a" stroke={C.ink} strokeWidth={5} />
                <rect x={x} y={470} width={170} height={140} fill={C.sunsetOrange} opacity={0.7} />
              </g>
            ))}
            {/* مصابيح نحاسية */}
            {[140, 580].map((x, i) => (
              <g key={i}>
                <line x1={x} y1={340} x2={x} y2={392} stroke={C.gold} strokeWidth={5} />
                <circle cx={x} cy={410} r={17} fill={C.goldBright} stroke={C.ink} strokeWidth={4} />
              </g>
            ))}
            <rect x={0} y={960} width={720} height={320} fill="#1c2c66" />
            {/* الرجل يشرب الشاي */}
            <Chibi x={360} y={800} scale={1.9} jacket="#6a4a6a" hat="tophat" face={worry ? 'worry' : 'happy'} cup />
            {/* طاولات جانبية */}
            <rect x={60} y={820} width={120} height={18} fill={C.woodDark} />
            <rect x={110} y={838} width={18} height={90} fill={C.woodDark} />
            <rect x={540} y={820} width={120} height={18} fill={C.woodDark} />
            <rect x={590} y={838} width={18} height={90} fill={C.woodDark} />
          </Svg>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ---------- L23–L24 : القطار على الجسر + نافذة المهندس (f856–935) ----------
export const ShortLine: React.FC = () => {
  const f = useCurrentFrame();
  const panX = f < 24 ? -f * 9 : -24 * 9;
  const bob = Math.sin(f * 0.5) * 5;

  return (
    <AbsoluteFill style={{background: C.skyBlue, overflow: 'hidden'}}>
      <Sky top={C.skyBlue} bottom="#c88a92" />
      {f < 24 ? (
        <AbsoluteFill style={{transform: `translateX(${panX}px)`}}>
          <Svg>
            {/* الجسر المرتفع */}
            <rect x={0} y={520} width={1300} height={40} fill={C.woodDark} />
            {Array.from({length: 12}).map((_, i) => (
              <rect key={i} x={40 + i * 110} y={560} width={16} height={340} fill={C.woodDark} />
            ))}
            <path d="M 0 860 L 1300 800 L 1300 1280 L 0 1280 Z" fill="#b06a72" />
            {/* القطار */}
            <g transform="translate(120 420)">
              {[0, 1, 2, 3].map((i) => (
                <g key={i} transform={`translate(${i * 220} 0)`}>
                  <rect x={0} y={0} width={200} height={110} rx={10} fill="#7a2c2c" stroke={C.ink} strokeWidth={5} />
                  <rect x={10} y={-34} width={180} height={40} fill={C.trainGreen} stroke={C.ink} strokeWidth={4} />
                  <text x={100} y={-8} textAnchor="middle" fontSize={17} fontWeight={900} fill={C.gold}>RED CANYON LINE</text>
                  {[30, 85, 140].map((wx, j) => (
                    <g key={j}>
                      <rect x={wx} y={22} width={40} height={48} rx={8} fill={C.cream} stroke={C.ink} strokeWidth={4} />
                      <circle cx={wx + 20} cy={44} r={11} fill={C.white} stroke={C.ink} strokeWidth={3} />
                    </g>
                  ))}
                </g>
              ))}
            </g>
            <Smoke x={210} y={410} t={f * 3} dark />
          </Svg>
        </AbsoluteFill>
      ) : (
        // نافذة المهندس — تتبع موازٍ مع اهتزاز clickety-clack
        <AbsoluteFill style={{transform: `translateY(${bob}px)`}}>
          <Svg>
            <rect x={0} y={240} width={720} height={760} fill="#7a2c2c" />
            <rect x={0} y={270} width={720} height={64} fill={C.trainGreen} />
            <text x={360} y={316} textAnchor="middle" fontSize={30} fontWeight={900} fill={C.gold} fontFamily="Georgia, serif">RED CANYON SHORT LINE</text>
            {/* النافذة */}
            <rect x={130} y={380} width={300} height={360} rx={22} fill="#c8762c" stroke={C.ink} strokeWidth={7} />
            <rect x={155} y={405} width={250} height={310} rx={14} fill={C.skyLight} />
            <Chibi x={280} y={640} scale={1.55} jacket={C.gold} hat="flat" face="worry" glasses />
            {/* خلفية متحركة */}
            {Array.from({length: 6}).map((_, i) => (
              <rect key={i} x={-((f * 14) % 120) + i * 130} y={940} width={90} height={120} fill={C.woodDark} opacity={0.7} />
            ))}
          </Svg>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ---------- L25–L27 : الجريدة وقاعة المحطة (f936–1087) ----------
export const Newspaper: React.FC = () => {
  const f = useCurrentFrame();
  // 0-71 رجل الجريدة | 72-81 ويب | 82-111 القاعة الضبابية | 112-151 ALL ABOARD + تقويم
  const walk = f * 0.2;
  const push = f >= 144 ? interpolate(f, [144, 151], [1, 1.35]) : 1;

  return (
    <AbsoluteFill style={{background: '#6a4a3c', overflow: 'hidden', filter: f >= 72 && f < 82 ? 'blur(8px)' : 'none'}}>
      <AbsoluteFill style={{transform: `scale(${push})`}}>
        <Svg>
          {/* قاعة المحطة: أرضية خشبية + شبابيك تذاكر */}
          <rect x={0} y={0} width={720} height={1280} fill="#8a5a44" />
          <rect x={0} y={0} width={720} height={420} fill="#4a2c2c" />
          {Array.from({length: 5}).map((_, i) => (
            <g key={i}>
              <rect x={30 + i * 140} y={180} width={110} height={190} fill={C.trainGreen} stroke={C.ink} strokeWidth={5} />
              <rect x={44 + i * 140} y={210} width={82} height={120} fill={C.cream} stroke={C.ink} strokeWidth={4} />
            </g>
          ))}
          {/* ساعة الحائط */}
          {f >= 82 && (
            <g>
              <circle cx={360} cy={130} r={52} fill={C.cream} stroke={C.ink} strokeWidth={7} />
              <line x1={360} y1={130} x2={360} y2={96} stroke={C.ink} strokeWidth={6} />
              <line x1={360} y1={130} x2={388} y2={142} stroke={C.ink} strokeWidth={5} />
            </g>
          )}
          {/* أرضية */}
          <rect x={0} y={860} width={720} height={420} fill="#7a4a32" />
          {Array.from({length: 12}).map((_, i) => (
            <line key={i} x1={0} y1={880 + i * 36} x2={720} y2={880 + i * 36} stroke="#5b3424" strokeWidth={3} />
          ))}
          {/* الضباب الوردي (f1032+) */}
          {f >= 96 && <rect x={0} y={0} width={720} height={1280} fill="#d8a0b0" opacity={0.45} />}
          {/* صحف متناثرة */}
          {f >= 100 && [[120, 980], [420, 1040], [560, 940]].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width={90} height={60} fill={C.cream} stroke={C.ink} strokeWidth={3} transform={`rotate(${i * 13 - 12} ${x} ${y})`} />
          ))}
          {/* لافتة ALL ABOARD */}
          {f >= 112 && (
            <g transform="translate(360 300) rotate(-6)">
              <rect x={-170} y={-52} width={340} height={104} fill={C.cream} stroke={C.ink} strokeWidth={6} />
              <text x={0} y={18} textAnchor="middle" fontSize={44} fontWeight={900} fill={C.red} fontFamily="Georgia, serif">ALL ABOARD!</text>
            </g>
          )}
          {/* رجل الجريدة */}
          {f < 82 && (
            <g>
              <Chibi x={360} y={640 + (f < 72 ? 0 : -60)} scale={2 + Math.min(0.5, f * 0.006)} jacket="#9a8a7a" hat="flat" face="normal" walk={walk} />
              {/* الجريدة */}
              <g transform={`translate(360 ${700}) rotate(-4)`}>
                <rect x={-95} y={-120} width={190} height={240} fill={C.cream} stroke={C.ink} strokeWidth={5} />
                <rect x={-80} y={-105} width={160} height={44} fill={C.red} />
                <text x={0} y={-74} textAnchor="middle" fontSize={19} fontWeight={900} fill={C.white}>THE CLICKETY</text>
                <text x={0} y={-52} textAnchor="middle" fontSize={19} fontWeight={900} fill={C.white}>CLACK LINE!</text>
                {Array.from({length: 6}).map((_, i) => (
                  <line key={i} x1={-70} y1={-30 + i * 22} x2={70} y2={-30 + i * 22} stroke={C.ink} strokeWidth={3} opacity={0.5} />
                ))}
              </g>
            </g>
          )}
          {/* حشد ALL ABOARD */}
          {f >= 112 && (
            <g>
              <Chibi x={300} y={660} scale={1.7} jacket={C.yellow} hat="bowler" face="happy" />
              <Chibi x={430} y={675} scale={1.4} jacket="#6a4a8a" hat="tophat" face="normal" />
              <Chibi x={180} y={690} scale={1.2} jacket={C.green} hat="flat" face="normal" />
              <CalendarCart x={560} y={760} scale={1} />
            </g>
          )}
        </Svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- L28 : غروب — شيء غريب (f1088–1151) ----------
export const SunsetWeird: React.FC = () => {
  const f = useCurrentFrame();
  const fast = f < 26;
  const slideX = fast ? -f * 34 : -26 * 34;
  const shocked = f >= 46;
  return (
    <AbsoluteFill style={{background: C.sunsetOrange, overflow: 'hidden', filter: fast ? 'blur(9px)' : 'none'}}>
      <Sky top="#d8642c" bottom="#f0a86a" />
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${fast ? slideX : slideX + (f - 26) * 3}px)`}}>
        <Svg>
          <rect x={0} y={560} width={2400} height={720} fill="#b5592c" />
          {/* عربات خضراء */}
          {[200, 620, 1050].map((x, i) => (
            <g key={i}>
              <rect x={x} y={470} width={150} height={110} rx={8} fill={C.trainGreen} stroke={C.ink} strokeWidth={5} />
              <rect x={x + 30} y={440} width={90} height={40} fill={C.cream} stroke={C.ink} strokeWidth={4} />
            </g>
          ))}
          <rect x={0} y={700} width={2400} height={90} fill="#8a6a52" />
          <PerspTrack vanishX={1400} vanishY={640} />
        </Svg>
      </div>
      <Svg>
        <Chibi x={360} y={600} scale={2} jacket={C.teal} hat="cap" face={shocked ? 'shocked' : 'normal'} walk={f * 0.22} />
      </Svg>
    </AbsoluteFill>
  );
};

// ---------- L29–L31 : الفجوات والعملة والزعيم (f1152–1343) ----------
export const GapsCoin: React.FC = () => {
  const f = useCurrentFrame();
  // 0-70 الفجوة تتقلص | 71-122 العملة | 123-143 الرافعة | 144-191 tilt-up
  const gap = interpolate(f, [0, 62], [70, 10], {extrapolateRight: 'clamp'});
  const gold = f >= 52;
  const railColor = gold ? C.railGold : C.railMagenta;
  const coinVisible = f >= 84;
  const coinY = f < 88 ? interpolate(f, [84, 88], [300, 545]) : 545;
  const craneY = f >= 123 ? interpolate(f, [123, 143], [-400, -40]) : -400;
  const tiltUp = f >= 144 ? interpolate(f, [144, 191], [0, -700]) : 0;
  const blurTilt = f >= 144 && f < 168 ? 'blur(7px)' : 'none';

  return (
    <AbsoluteFill style={{background: C.sunsetOrange, overflow: 'hidden', filter: blurTilt}}>
      <AbsoluteFill style={{transform: `translateY(${tiltUp}px)`}}>
        <Sky top="#c8541c" bottom="#e8944c" />
        <Svg>
          {/* جدار الأخدود البرتقالي المخطط */}
          {Array.from({length: 8}).map((_, i) => (
            <rect key={i} x={0} y={120 + i * 62} width={720} height={44} fill={i % 2 ? '#b5592c' : '#d8742c'} />
          ))}
          <CalendarCart x={300} y={560} scale={1.15} />
          <BlueFlag x={620} y={620} wave={Math.sin(f * 0.15)} />
          {/* الرافعة */}
          <g transform={`translate(0 ${craneY})`}>
            <rect x={330} y={0} width={26} height={520} fill="#2c2c34" />
            <rect x={300} y={470} width={90} height={22} fill="#2c2c34" />
          </g>
          {/* سكة مزدوجة بفجوة */}
          <rect x={0} y={700} width={720} height={120} fill={railColor} stroke={C.ink} strokeWidth={5} />
          <rect x={0} y={840} width={720} height={120} fill={railColor} stroke={C.ink} strokeWidth={5} />
          {/* نهايتا القضبان والفجوة */}
          <rect x={0} y={680} width={330 - gap / 2} height={230} fill={railColor} stroke={C.ink} strokeWidth={6} />
          <rect x={330 + gap / 2} y={680} width={390 - gap / 2} height={230} fill={railColor} stroke={C.ink} strokeWidth={6} />
          {/* الفرجار/المسطرة */}
          <g transform="translate(330 560)">
            <rect x={-190} y={-16} width={380} height={26} fill="#c9a06a" stroke={C.ink} strokeWidth={4} />
            {Array.from({length: 12}).map((_, i) => (
              <line key={i} x1={-180 + i * 32} y1={-16} x2={-180 + i * 32} y2={-2} stroke={C.ink} strokeWidth={3} />
            ))}
            <path d="M -22 -90 L -40 -16 L -4 -16 Z" fill="#b8907c" stroke={C.ink} strokeWidth={4} />
            <path d="M 22 -90 L 40 -16 L 4 -16 Z" fill="#b8907c" stroke={C.ink} strokeWidth={4} />
          </g>
          {/* العملة */}
          {coinVisible && (
            <g transform={`translate(330 ${coinY})`}>
              <ellipse cx={0} cy={0} rx={13} ry={30} fill="#c8c8d4" stroke={C.ink} strokeWidth={4} />
              <ellipse cx={-3} cy={0} rx={5} ry={22} fill={C.white} opacity={0.6} />
            </g>
          )}
          {/* الزعيم يظهر عند قمة الصعود */}
          {f >= 185 && <Chibi x={360} y={160} scale={2} jacket={C.yellow} hat="bowler" face="normal" />}
          {f >= 185 && <Chibi x={180} y={190} scale={1.5} jacket={C.teal} hat="cap" face="normal" />}
        </Svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- L32 : حوار الرضا (f1344–1439) ----------
export const BossPleased: React.FC = () => {
  const f = useCurrentFrame();
  const talk = f >= 77 && f < 86;
  return (
    <AbsoluteFill style={{background: C.sunsetOrange, overflow: 'hidden'}}>
      <Sky top="#d8642c" bottom="#f0b070" />
      <CanyonWall side="right" fill={C.fireRed} dark={C.canyonDark} width={220} />
      <Svg>
        <Ballast y={820} height={460} />
        <rect x={0} y={900} width={720} height={60} fill={C.railMagenta} opacity={0.8} />
        <Chibi x={280} y={620} scale={2} jacket={C.teal} hat="cap" face="normal" />
        <Chibi x={460} y={600} scale={2.1} jacket={C.yellow} hat="bowler" face={talk ? 'grin' : 'happy'} />
      </Svg>
    </AbsoluteFill>
  );
};

// ---------- L34 : كرسي الشاطئ على السكة (f1584–1631) ----------
export const DeckChair: React.FC = () => {
  const f = useCurrentFrame();
  const push = 1 + Math.min(0.25, f * 0.004);
  const shocked = f >= 34;
  return (
    <AbsoluteFill style={{background: C.skyBlue, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${push})`}}>
        <Sky top={C.skyBlue} bottom="#c8a0b8" />
        <PerspTrack vanishX={360} vanishY={560} glow={0.8} />
        <Svg>
          {/* المظلة */}
          <g transform="translate(360 470)">
            <path d="M -120 0 Q 0 -110 120 0 Z" fill={C.red} stroke={C.ink} strokeWidth={5} />
            <path d="M -80 0 Q 0 -78 80 0 Z" fill={C.gold} stroke={C.ink} strokeWidth={4} />
            <rect x={-5} y={0} width={10} height={110} fill={C.ink} />
          </g>
          {/* كرسي مخطط */}
          <g transform="translate(360 600)">
            <rect x={-70} y={-20} width={140} height={22} fill={C.gold} stroke={C.ink} strokeWidth={4} transform="rotate(-12)" />
            <rect x={-66} y={6} width={132} height={20} fill={C.ink} transform="rotate(-12)" />
            <rect x={-60} y={30} width={120} height={18} fill={C.gold} stroke={C.ink} strokeWidth={3} transform="rotate(-12)" />
            <Chibi x={0} y={-60} scale={1.5} jacket={C.ink} hat="tophat" face={shocked ? 'shocked' : 'grin'} />
          </g>
        </Svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- L35–L37 : أحرّ يوم + الاندفاع + التعرّض (f1632–1783) ----------
export const HottestDay: React.FC = () => {
  const f = useCurrentFrame();
  // 0-55 وجه المهندس | 56-63 صدمة | 64-103 اندفاع سريع | 104-151 تعرّض واسع
  const runPhase = f >= 64 && f < 104;
  const slideX = runPhase ? -(f - 64) * 26 : 0;
  const wide = f >= 104;
  const scale = wide ? interpolate(f, [104, 151], [1, 0.86]) : 1;
  const shocked = f >= 56;

  return (
    <AbsoluteFill style={{background: C.sunsetOrange, overflow: 'hidden', filter: runPhase ? 'blur(6px)' : 'none'}}>
      <AbsoluteFill style={{transform: `scale(${scale}) translateX(${slideX}px)`}}>
        <Sky top="#d8642c" bottom="#f0a86a" />
        <CanyonWall side="right" fill={C.canyonOrange} dark={C.fireRed} width={240} />
        <Svg>
          <Ballast y={640} height={640} />
          {!wide && (
            <>
              {/* القضبان المتوهجة أسفل الكادر */}
              <rect x={-100} y={1030} width={920} height={90} fill={C.railMagenta} stroke={C.ink} strokeWidth={5} transform="rotate(-6 360 1075)" />
              <rect x={-100} y={1150} width={920} height={90} fill={C.railGold} stroke={C.ink} strokeWidth={5} transform="rotate(-6 360 1195)" />
              <Chibi x={360} y={560} scale={2.6} jacket={C.teal} hat="cap" face={shocked ? 'shocked' : 'happy'} />
              {/* بخار العرق */}
              {f < 30 && (
                <>
                  <circle cx={170} cy={330} r={22} fill={C.white} opacity={0.85} />
                  <circle cx={560} cy={300} r={18} fill={C.white} opacity={0.8} />
                </>
              )}
            </>
          )}
          {wide && (
            <>
              <PerspTrack vanishX={360} vanishY={620} glow={0.5} />
              <Chibi x={360} y={700} scale={1.1} jacket={C.teal} hat="cap" face="normal" walk={f * 0.2} />
            </>
          )}
          {/* خطوط الارتداد أثناء الاندفاع */}
          {runPhase && Array.from({length: 10}).map((_, i) => (
            <rect key={i} x={((f * 26 + i * 140) % 1000) - 140} y={680 + i * 55} width={120} height={12} fill={C.gold} opacity={0.7} />
          ))}
        </Svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- L39 : السكّة تنثني كالثعبان (f1848–1927) ----------
export const Serpent: React.FC = () => {
  const f = useCurrentFrame();
  const wave = (x: number) => Math.sin(x * 0.012 + f * 0.12) * (24 + f * 0.7);
  const tipAngle = f > 70 ? (f - 70) * 1.3 : 0;

  return (
    <AbsoluteFill style={{background: '#d8b8a8', overflow: 'hidden'}}>
      <Sky top="#e8c0a0" bottom="#c89a92" />
      <Svg>
        {/* جسر مائل منخفض */}
        <rect x={0} y={700} width={720} height={60} fill={C.woodDark} opacity={0.6} />
        {/* السكة المتموجة */}
        <path
          d={`M 0 ${860 + wave(0)} ${Array.from({length: 15}).map((_, i) => `L ${i * 52} ${860 + wave(i * 52)}`).join(' ')}`}
          stroke={C.railGold} strokeWidth={22} fill="none"
        />
        <path
          d={`M 0 ${960 + wave(80)} ${Array.from({length: 15}).map((_, i) => `L ${i * 52} ${960 + wave(i * 52 + 80)}`).join(' ')}`}
          stroke={C.railGold} strokeWidth={22} fill="none"
        />
        {/* القطار يميل */}
        <g transform={`translate(300 700) rotate(${tipAngle})`}>
          <rect x={-120} y={-70} width={260} height={80} rx={12} fill="#3a2c2c" stroke={C.ink} strokeWidth={6} />
          <rect x={70} y={-110} width={70} height={50} rx={10} fill="#3a2c2c" stroke={C.ink} strokeWidth={6} />
          <circle cx={128} cy={-92} r={12} fill={C.goldBright} />
        </g>
        <Smoke x={360} y={620} t={f * 3} dark />
        {/* شرر */}
        {f > 28 && Array.from({length: 10}).map((_, i) => (
          <circle key={i} cx={120 + i * 55 + ((f * 9) % 40)} cy={820 + wave(i * 55) - ((f * 7 + i * 17) % 60)} r={5} fill={C.goldBright} />
        ))}
      </Svg>
    </AbsoluteFill>
  );
};

// ---------- L40 : الانفجار والنهاية (f1928–1954) ----------
export const Explosion: React.FC = () => {
  const f = useCurrentFrame();
  const flash = f < 3;
  const grow = interpolate(f, [2, 12], [0.2, 1.25], {extrapolateRight: 'clamp'});
  const settle = f >= 15;

  return (
    <AbsoluteFill style={{background: flash ? C.white : '#d8a080', overflow: 'hidden'}}>
      {!flash && (
        <Svg>
          {/* كرة النار */}
          <g transform={`translate(360 520) scale(${grow})`}>
            <circle cx={0} cy={0} r={190} fill={C.goldBright} opacity={0.95} />
            <circle cx={-70} cy={-40} r={120} fill="#f0d060" opacity={0.9} />
            <circle cx={80} cy={20} r={130} fill={C.sunsetOrange} opacity={0.9} />
            <circle cx={0} cy={-110} r={100} fill={C.fireRed} opacity={0.8} />
            <circle cx={-120} cy={80} r={95} fill={C.fireRed} opacity={0.75} />
            <circle cx={130} cy={100} r={90} fill={C.canyonRed} opacity={0.8} />
          </g>
          {/* الفطر */}
          {settle && (
            <g opacity={0.9}>
              <rect x={320} y={640} width={80} height={220} fill="#5a3428" />
              <ellipse cx={360} cy={620} rx={200} ry={110} fill="#7a4430" />
            </g>
          )}
          {/* شرر */}
          {Array.from({length: 16}).map((_, i) => (
            <circle key={i} cx={120 + i * 34 + ((f * 13 + i * 23) % 60)} cy={820 - ((f * 17 + i * 31) % 190)} r={5} fill={C.goldBright} />
          ))}
          {/* الشخصيتان تشاهدان */}
          {f >= 12 && (
            <>
              <rect x={0} y={940} width={720} height={340} fill="#7a5448" />
              <rect x={0} y={920} width={720} height={26} fill={C.woodDark} />
              <Chibi x={250} y={800} scale={1.6} jacket={C.teal} hat="cap" face="shocked" />
              <Chibi x={420} y={790} scale={1.65} jacket={C.yellow} hat="bowler" face="shocked" />
            </>
          )}
        </Svg>
      )}
    </AbsoluteFill>
  );
};
