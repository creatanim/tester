import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {C, captionAt} from './theme';
import {
  CanyonWalk, DesertRise, WhipStation, StationCeremony, WorkersRidge,
  BossFace, WhipRight, PlatformDeck, LuxuryTrain, ShortLine, Newspaper,
  SunsetWeird, GapsCoin, BossPleased, DeckChair, HottestDay, Serpent, Explosion,
} from './scenes2d';
import {AerialBridge3D, PerfectRR3D, SunsetBridge3D} from './scenes3d';

// ============================================================
// التايملاين — مطابق 1:1 لتحليل الفيديو الأصلي:
// كل Sequence يبدأ وينتهي عند نفس الإطار في التحليل (L01–L40)
// ============================================================

const Caption: React.FC = () => {
  const f = useCurrentFrame();
  const text = captionAt(f);
  if (!text) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 318,
        textAlign: 'center',
        fontFamily: "'Nunito', 'Arial Black', 'DejaVu Sans', sans-serif",
        fontWeight: 900,
        fontSize: 52,
        color: C.white,
        WebkitTextStroke: '3px #000',
        paintOrder: 'stroke fill',
        textShadow: '0 3px 10px rgba(0,0,0,0.6)',
        letterSpacing: 0.5,
      }}
    >
      {text}
    </div>
  );
};

// أغشية التلاشٍ (Dissolves) في مواضعها من التحليل
const Veils: React.FC = () => {
  const f = useCurrentFrame();
  const veil = (a: number, b: number) => (f >= a && f <= b ? Math.abs((f - a) / (b - a) - 0.5) * 1.4 : 0);
  const op = Math.max(
    veil(404, 409),       // L12 → L13
    veil(932, 938),       // L24 → L25
    veil(1432, 1443),     // L32 → L33 (تلاشٍ طويل)
    veil(1628, 1637),     // شبحي قصير
    veil(1776, 1785)      // L37 → L38
  );
  if (op <= 0) return null;
  return <AbsoluteFill style={{background: '#e8c0b0', opacity: Math.min(0.85, op)}} />;
};

export const Video: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: C.black}}>
    {/* L01–L04 */}
    <Sequence from={0} durationInFrames={112}><CanyonWalk /></Sequence>
    {/* L05–L06 (three.js) */}
    <Sequence from={112} durationInFrames={142}><AerialBridge3D /></Sequence>
    {/* L07–L08 */}
    <Sequence from={254} durationInFrames={40}><DesertRise /></Sequence>
    {/* L09 */}
    <Sequence from={294} durationInFrames={8}><WhipStation /></Sequence>
    {/* L10–L11 */}
    <Sequence from={302} durationInFrames={46}><StationCeremony /></Sequence>
    {/* L12 */}
    <Sequence from={348} durationInFrames={60}><WorkersRidge /></Sequence>
    {/* L13–L16 */}
    <Sequence from={408} durationInFrames={216}><BossFace /></Sequence>
    {/* L17 */}
    <Sequence from={624} durationInFrames={24}><WhipRight /></Sequence>
    {/* L18–L20 */}
    <Sequence from={648} durationInFrames={141}><PlatformDeck /></Sequence>
    {/* L21–L22 */}
    <Sequence from={789} durationInFrames={67}><LuxuryTrain /></Sequence>
    {/* L23–L24 */}
    <Sequence from={856} durationInFrames={80}><ShortLine /></Sequence>
    {/* L25–L27 */}
    <Sequence from={936} durationInFrames={152}><Newspaper /></Sequence>
    {/* L28 */}
    <Sequence from={1088} durationInFrames={64}><SunsetWeird /></Sequence>
    {/* L29–L31 */}
    <Sequence from={1152} durationInFrames={192}><GapsCoin /></Sequence>
    {/* L32 */}
    <Sequence from={1344} durationInFrames={96}><BossPleased /></Sequence>
    {/* L33 (three.js) */}
    <Sequence from={1440} durationInFrames={144}><PerfectRR3D /></Sequence>
    {/* L34 */}
    <Sequence from={1584} durationInFrames={48}><DeckChair /></Sequence>
    {/* L35–L37 */}
    <Sequence from={1632} durationInFrames={152}><HottestDay /></Sequence>
    {/* L38 (three.js) */}
    <Sequence from={1784} durationInFrames={64}><SunsetBridge3D /></Sequence>
    {/* L39 */}
    <Sequence from={1848} durationInFrames={80}><Serpent /></Sequence>
    {/* L40 */}
    <Sequence from={1928} durationInFrames={27}><Explosion /></Sequence>

    {/* الانتقالات والتلاشيات */}
    <Veils />
    {/* الترجمة كلمة-كلمة (نفس التوقيتات) */}
    <Caption />
  </AbsoluteFill>
);
