import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
} from 'remotion';
import {CAPTIONS, W, H} from './theme';
import {
  CanyonWalk,
  AerialBay,
  DesertRise,
  StationApproach,
  Ceremony,
  WorkersRidge,
  BossMeet,
  PlatformDeck,
  LuxuryTrain,
  ShortLine,
  Newspaper,
  SunsetWeird,
  GapsCoin,
  BossPleased,
  PerfectRR,
  DeckChairScene,
  HottestDay,
  SunsetBridge,
  Serpent,
  Explosion,
} from './scenes3d';

// ============================================================
// Video.tsx — الجدول الزمني الكامل (1955 إطارًا) + التسميات
// ============================================================

const Caption: React.FC<{x: number; y: number}> = ({x, y}) => {
  const f = useCurrentFrame();
  const item = CAPTIONS.find(([s, e]) => f >= s && f <= e);
  const text = item ? item[2] : '';
  if (!text) return null;
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <text
        x={x}
        y={y}
        textAnchor="middle"
        fontFamily="DejaVu Sans, Arial, sans-serif"
        fontWeight={900}
        fontSize={42}
        fill="#ffffff"
        stroke="#000000"
        strokeWidth={8}
        paintOrder="stroke"
      >
        {text}
      </text>
    </svg>
  );
};

const capPos = (f: number): {x: number; y: number} => {
  if (f >= 348 && f < 408) return {x: W / 2, y: 315};
  if (f >= 454 && f < 480) return {x: W / 2, y: 615};
  if (f >= 481 && f < 545) return {x: W / 2, y: 1058};
  return {x: W / 2, y: 318};
};

// رشقات الضوء البيضاء (وميض)
const Flashes: React.FC = () => {
  const f = useCurrentFrame();
  const flashes: Array<[number, number]> = [
    [221, 226], [300, 302], [685, 691], [808, 813], [1321, 1335], [1928, 1932],
  ];
  const active = flashes.find(([a, b]) => f >= a && f < b);
  if (!active) return null;
  return <AbsoluteFill style={{backgroundColor: '#ffffff', opacity: 0.45}} />;
};

// خطوط التشويش الحركي (الـويب) — من التحليل (9 مرّات ويب)
const STREAKS: Array<[number, number]> = [
  [294, 301], [624, 647], [720, 722], [1005, 1015], [1088, 1103],
  [1321, 1335], [1512, 1535], [1688, 1735], [1927, 1935],
];

const Streaks: React.FC = () => {
  const f = useCurrentFrame();
  const active = STREAKS.find(([a, b]) => f >= a && f < b);
  if (!active) return null;
  return (
    <AbsoluteFill style={{opacity: 0.5}}>
      {Array.from({length: 12}).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: (i * 113) % H,
            left: 0,
            width: W,
            height: 8 + (i % 3) * 6,
            background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%)',
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

// الحجاب: تعتيم/تغميق عند بدايات اللقطات (fading veils)
const Veils: React.FC = () => {
  const f = useCurrentFrame();
  const fades: Array<[number, number, number]> = [
    [0, 30, 0.35], [405, 407, 0.1], [627, 648, 0.3], [933, 936, 0.55],
    [1433, 1441, 0.55], [1778, 1783, 0.4], [1928, 1930, 0.5],
  ];
  const hit = fades.find(([a, b]) => f >= a && f < b);
  if (!hit) return null;
  const [a, b, max] = hit;
  const t = (f - a) / (b - a);
  return <AbsoluteFill style={{backgroundColor: '#2d1d36', opacity: (1 - t) * max}} />;
};

export const Video: React.FC = () => {
  const f = useCurrentFrame();
  const {x, y} = capPos(f);
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <Sequence from={0} durationInFrames={112}><CanyonWalk /></Sequence>
      <Sequence from={112} durationInFrames={142}><AerialBay /></Sequence>
      <Sequence from={254} durationInFrames={48}><DesertRise /></Sequence>
      <Sequence from={302} durationInFrames={12}><StationApproach /></Sequence>
      <Sequence from={314} durationInFrames={34}><Ceremony /></Sequence>
      <Sequence from={348} durationInFrames={60}><WorkersRidge /></Sequence>
      <Sequence from={408} durationInFrames={216}><BossMeet /></Sequence>
      <Sequence from={624} durationInFrames={165}><PlatformDeck /></Sequence>
      <Sequence from={789} durationInFrames={67}><LuxuryTrain /></Sequence>
      <Sequence from={856} durationInFrames={80}><ShortLine /></Sequence>
      <Sequence from={936} durationInFrames={152}><Newspaper /></Sequence>
      <Sequence from={1088} durationInFrames={64}><SunsetWeird /></Sequence>
      <Sequence from={1152} durationInFrames={192}><GapsCoin /></Sequence>
      <Sequence from={1344} durationInFrames={96}><BossPleased /></Sequence>
      <Sequence from={1440} durationInFrames={144}><PerfectRR /></Sequence>
      <Sequence from={1584} durationInFrames={48}><DeckChairScene /></Sequence>
      <Sequence from={1632} durationInFrames={152}><HottestDay /></Sequence>
      <Sequence from={1784} durationInFrames={64}><SunsetBridge /></Sequence>
      <Sequence from={1848} durationInFrames={80}><Serpent /></Sequence>
      <Sequence from={1928} durationInFrames={27}><Explosion /></Sequence>
      <Streaks />
      <Flashes />
      <Veils />
      <Caption x={x} y={y} />
    </AbsoluteFill>
  );
};
