import React from 'react';
import {C} from './theme';

// ============================================================
// لبنات البيئات — مبنية على تفاصيل التحليل البصري:
// نقوش الصخور الرأسية/الأفقية، الدُّبّار الملوّن، القضبان
// بالمنظور النقطي الواحد، المحطة الفيكتورية...
// ============================================================

export const Sky: React.FC<{top: string; bottom: string; height?: number}> = ({top, bottom, height = 1280}) => (
  <div style={{position: 'absolute', inset: 0, height, background: `linear-gradient(${top}, ${bottom})`}} />
);

export const Clouds: React.FC<{y: number; scale?: number; opacity?: number}> = ({y, scale = 1, opacity = 0.9}) => (
  <svg width={720} height={1280} style={{position: 'absolute', inset: 0, opacity}}>
    {[[80, y], [300, y - 40], [520, y + 20], [180, y + 90], [600, y + 110]].map(([cx, cy], i) => (
      <g key={i} transform={`translate(${cx} ${cy}) scale(${scale})`}>
        <ellipse cx={0} cy={0} rx={70} ry={22} fill={C.white} opacity={0.85} />
        <ellipse cx={-34} cy={6} rx={40} ry={16} fill={C.white} opacity={0.8} />
        <ellipse cx={36} cy={8} rx={44} ry={15} fill={C.white} opacity={0.8} />
      </g>
    ))}
  </svg>
);

// جدار الأخدود بنقوش مرسومة (striations) كما في الأصل
export const CanyonWall: React.FC<{
  side: 'left' | 'right'; fill: string; dark: string; width?: number; shift?: number;
}> = ({side, fill, dark, width = 240, shift = 0}) => (
  <svg width={720} height={1280} style={{position: 'absolute', inset: 0}}>
    <defs>
      <clipPath id={`wall-${side}`}>
        {side === 'left' ? (
          <path d={`M 0 ${-20 + shift} L ${width} ${60 + shift} L ${width - 40} 1300 L 0 1300 Z`} />
        ) : (
          <path d={`M 720 ${-20 + shift} L ${720 - width} ${60 + shift} L ${720 - width + 40} 1300 L 720 1300 Z`} />
        )}
      </clipPath>
    </defs>
    <g clipPath={`url(#wall-${side})`}>
      <rect x={0} y={-100} width={720} height={1500} fill={fill} />
      {Array.from({length: 14}).map((_, i) => {
        const x = side === 'left' ? i * (width / 12) : 720 - width + i * (width / 12);
        return (
          <path
            key={i}
            d={`M ${x} -60 Q ${x + 18} 300 ${x - 8} 640 T ${x + 12} 1340`}
            stroke={dark}
            strokeWidth={10 + (i % 3) * 7}
            fill="none"
            opacity={0.55}
          />
        );
      })}
    </g>
  </svg>
);

// أرضية الدُّبّار (الحصى الملوّن)
export const Ballast: React.FC<{y: number; height: number}> = ({y, height}) => (
  <svg width={720} height={1280} style={{position: 'absolute', inset: 0}}>
    <rect x={0} y={y} width={720} height={height} fill="#6b4a3c" />
    {Array.from({length: 160}).map((_, i) => {
      const px = (i * 137.5) % 720;
      const py = y + ((i * 89.7) % height);
      const r = 4 + (i % 5) * 2.5;
      const colors = ['#a2765c', '#c98d68', '#8a5a44', '#d9b08c', '#7a5340'];
      return <ellipse key={i} cx={px} cy={py} rx={r} ry={r * 0.7} fill={colors[i % 5]} />;
    })}
  </svg>
);

// قضبان بالمنظور النقطي الواحد (نفس تكوين f0 وf1440+)
export const PerspTrack: React.FC<{
  vanishX?: number; vanishY?: number; railColor?: string; tieColor?: string;
  glow?: number; // 0..1 توهّج
}> = ({vanishX = 360, vanishY = 520, railColor = '#b8b8c4', tieColor = '#5b3437', glow = 0}) => {
  const glowColor = glow > 0 ? (glow < 0.5 ? C.railMagenta : C.railGold) : railColor;
  return (
    <svg width={720} height={1280} style={{position: 'absolute', inset: 0}}>
      {/* المستطيلات (الدُّبّار) بالمنظور */}
      {Array.from({length: 22}).map((_, i) => {
        const t = Math.pow(i / 22, 1.7);
        const y = vanishY + t * (1280 - vanishY);
        const h = 3 + t * 26;
        const spread = 20 + t * 560;
        return <rect key={i} x={vanishX - spread} y={y} width={spread * 2} height={h} fill={tieColor} opacity={0.85} rx={2} />;
      })}
      {/* القضبان */}
      <polygon points={`${vanishX - 8},${vanishY} ${vanishX + 8},${vanishY} ${vanishX + 120},1280 ${vanishX - 120},1280`} fill={glowColor} opacity={0.95} />
      <polygon points={`${vanishX - 220},${1280} ${vanishX - 96},1280 ${vanishX - 6},${vanishY} ${vanishX - 18},${vanishY}`} fill={glowColor} />
      <polygon points={`${vanishX + 96},${1280} ${vanishX + 220},1280 ${vanishX + 18},${vanishY} ${vanishX + 6},${vanishY}`} fill={glowColor} />
      {glow > 0 && (
        <>
          <polygon points={`${vanishX - 230},${1280} ${vanishX - 86},1280 ${vanishX},${vanishY} ${vanishX},${vanishY}`} fill={C.railGold} opacity={0.35} />
          <ellipse cx={vanishX} cy={vanishY + 40} rx={240} ry={90} fill={C.railGold} opacity={0.25} />
        </>
      )}
    </svg>
  );
};

// سطح خشبي (منصات الجسر) بخطوط لوحات
export const WoodDeck: React.FC<{y: number; height: number; color?: string}> = ({y, height, color = C.woodBrown}) => (
  <svg width={720} height={1280} style={{position: 'absolute', inset: 0}}>
    <rect x={0} y={y} width={720} height={height} fill={color} />
    {Array.from({length: 16}).map((_, i) => (
      <line key={i} x1={0} y1={y + (i * height) / 15} x2={720} y2={y + (i * height) / 15} stroke={C.woodDark} strokeWidth={3} opacity={0.7} />
    ))}
    {Array.from({length: 10}).map((_, i) => (
      <line key={`v${i}`} x1={i * 80} y1={y} x2={i * 80} y2={y + height} stroke={C.woodDark} strokeWidth={2} opacity={0.4} />
    ))}
  </svg>
);

// عمود دخان/بخار
export const Smoke: React.FC<{x: number; y: number; t: number; dark?: boolean}> = ({x, y, t, dark = false}) => (
  <svg width={720} height={1280} style={{position: 'absolute', inset: 0}}>
    {Array.from({length: 7}).map((_, i) => {
      const tt = (t * 0.02 + i * 0.14) % 1;
      return (
        <circle
          key={i}
          cx={x + Math.sin((t + i * 30) * 0.03) * (10 + i * 8)}
          cy={y - tt * 220}
          r={14 + tt * 26 + i * 4}
          fill={dark ? '#4a3230' : C.smoke}
          opacity={(1 - tt) * 0.8}
        />
      );
    })}
  </svg>
);

// واجهة المحطة الفيكتورية (قبة زجاجية أقواسية + لافتات)
export const StationFacade: React.FC<{scale?: number}> = ({scale = 1}) => (
  <svg width={720} height={1280} style={{position: 'absolute', inset: 0}}>
    <g transform={`translate(360 640) scale(${scale}) translate(-360 -640)`}>
      {/* القبة الزجاجية */}
      <path d="M 120 560 Q 360 300 600 560 Z" fill={C.skyLight} stroke={C.ink} strokeWidth={5} opacity={0.9} />
      {Array.from({length: 9}).map((_, i) => (
        <path key={i} d={`M ${140 + i * 55} 560 Q ${160 + i * 52} 380 ${200 + i * 42} 330`} stroke={C.ink} strokeWidth={3} fill="none" opacity={0.5} />
      ))}
      {/* المبنى */}
      <rect x={90} y={560} width={540} height={330} fill={C.red} stroke={C.ink} strokeWidth={5} />
      <rect x={250} y={470} width={220} height={120} fill={C.red} stroke={C.ink} strokeWidth={5} />
      <circle cx={360} cy={520} r={34} fill={C.cream} stroke={C.ink} strokeWidth={5} />
      <line x1={360} y1={520} x2={360} y2={498} stroke={C.ink} strokeWidth={4} />
      <line x1={360} y1={520} x2={378} y2={528} stroke={C.ink} strokeWidth={4} />
      {/* الأقواس */}
      {Array.from({length: 5}).map((_, i) => (
        <g key={i}>
          <path d={`M ${130 + i * 100} 890 L ${130 + i * 100} 700 Q ${175 + i * 100} 650 ${220 + i * 100} 700 L ${220 + i * 100} 890 Z`} fill={C.deepRed} stroke={C.ink} strokeWidth={4} />
        </g>
      ))}
      {/* اللافتة */}
      <rect x={120} y={595} width={480} height={64} fill={C.white} stroke={C.ink} strokeWidth={4} />
      <text x={360} y={638} textAnchor="middle" fontSize={34} fontWeight={900} fill={C.red} fontFamily="Arial Black, sans-serif">
        FIRST LINE IN
      </text>
      <text x={360} y={720} textAnchor="middle" fontSize={30} fontWeight={900} fill={C.red} fontFamily="Arial Black, sans-serif">
        GETS IT ALL!
      </text>
    </g>
  </svg>
);

// لافتة علوية بحروف ذهبية
export const TopBanner: React.FC<{text: string; y?: number}> = ({text, y = 140}) => (
  <svg width={720} height={1280} style={{position: 'absolute', inset: 0}}>
    <rect x={20} y={y} width={680} height={90} fill={C.navy} stroke={C.gold} strokeWidth={6} />
    <text x={360} y={y + 60} textAnchor="middle" fontSize={48} fontWeight={900} fill={C.gold} fontFamily="Georgia, serif" letterSpacing={6}>
      {text}
    </text>
  </svg>
);

// عربة التقويم الخضراء + اللافتة (CALENDAR 1880 MAY)
export const CalendarCart: React.FC<{x: number; y: number; scale?: number}> = ({x, y, scale = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={-70} y={-60} width={140} height={110} rx={8} fill={C.trainGreen} stroke={C.ink} strokeWidth={5} />
    <rect x={-44} y={-52} width={88} height={70} rx={4} fill={C.white} stroke={C.ink} strokeWidth={4} />
    <rect x={-44} y={-52} width={88} height={22} fill={C.red} />
    <text x={0} y={-35} textAnchor="middle" fontSize={13} fontWeight={700} fill={C.white}>CALENDAR</text>
    <text x={0} y={-12} textAnchor="middle" fontSize={17} fontWeight={900} fill={C.ink}>MAY</text>
    <text x={0} y={6} textAnchor="middle" fontSize={11} fill={C.ink}>1880</text>
    <rect x={-70} y={50} width={22} height={12} fill={C.ink} />
    <rect x={48} y={50} width={22} height={12} fill={C.ink} />
  </g>
);

// علم أزرق على عمود
export const BlueFlag: React.FC<{x: number; y: number; wave?: number}> = ({x, y, wave = 0}) => (
  <g>
    <line x1={x} y1={y} x2={x} y2={y - 150} stroke="#6b4a3c" strokeWidth={7} />
    <path d={`M ${x} ${y - 150} q 40 ${10 + wave * 8} 80 0 l 0 55 q -40 ${10 + wave * 8} -80 0 Z`} fill={C.skyBlue} stroke={C.ink} strokeWidth={3} />
  </g>
);
