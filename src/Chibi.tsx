import React from 'react';
import {C} from './theme';

// ============================================================
// Chibi — شخصيات "الحبة" المستخرجة من الفيديو الأصلي:
// رأس دائري أبيض بحدّ أسود سميك، جذع بيضاوي ملوّن،
// أطراف عصوية سوداء، قبعات مميّزة لكل شخصية (كود بصري)
// ============================================================

export type Hat = 'cap' | 'bowler' | 'tophat' | 'flat' | 'conductor' | 'none';
export type Face = 'normal' | 'happy' | 'angry' | 'shocked' | 'worry' | 'grin';

export interface ChibiProps {
  x: number;
  y: number;
  scale?: number;
  jacket?: string;
  hat?: Hat;
  face?: Face;
  purple?: boolean;
  glasses?: boolean;
  steam?: boolean;
  walk?: number;   // طور المشي (0 = وقوف)
  saw?: boolean;   // يحمل منشاراً
  cup?: boolean;   // يحمل فنجاناً
  flip?: boolean;
  opacity?: number;
}

const INK = '#171717';

export const Chibi: React.FC<ChibiProps> = ({
  x, y, scale = 1, jacket = C.teal, hat = 'cap', face = 'normal',
  purple = false, glasses = false, steam = false, walk = 0,
  saw = false, cup = false, flip = false, opacity = 1,
}) => {
  const w = walk > 0 ? Math.sin(walk) : 0;         // تمايل المشي
  const legA = w * 14;                              // زاوية الساق الأمامية
  const legB = -w * 14;
  const armA = -w * 12;
  const bob = walk > 0 ? Math.abs(Math.sin(walk)) * -4 : 0;
  const skin = purple ? C.purpleFace : C.white;

  return (
    <g transform={`translate(${x} ${y + bob}) scale(${flip ? -scale : scale} ${scale})`} opacity={opacity}>
      {/* الأرجل */}
      <line x1={-8} y1={44} x2={-8 + legA} y2={82} stroke={INK} strokeWidth={6} strokeLinecap="round" />
      <line x1={8} y1={44} x2={8 + legB} y2={82} stroke={INK} strokeWidth={6} strokeLinecap="round" />
      {/* الحذاء */}
      <ellipse cx={-8 + legA} cy={84} rx={9} ry={5} fill={INK} />
      <ellipse cx={8 + legB} cy={84} rx={9} ry={5} fill={INK} />

      {/* الذراعان */}
      <line x1={-26} y1={0} x2={-34 + armA} y2={38} stroke={INK} strokeWidth={6} strokeLinecap="round" />
      <line x1={26} y1={0} x2={34 - armA} y2={38} stroke={INK} strokeWidth={6} strokeLinecap="round" />

      {/* الجذع (السترة) */}
      <rect x={-28} y={-18} width={56} height={66} rx={22} fill={jacket} stroke={INK} strokeWidth={5} />
      {/* ربطة/تفاصيل */}
      <polygon points="0,-12 -7,4 7,4" fill={C.red} />
      <line x1={0} y1={4} x2={0} y2={30} stroke={INK} strokeWidth={3} />

      {/* الرقبة */}
      <rect x={-9} y={-28} width={18} height={14} fill={INK} />

      {/* الرأس */}
      <ellipse cx={0} cy={-62} rx={36} ry={33} fill={skin} stroke={INK} strokeWidth={5} />

      {/* الوجه */}
      {face === 'normal' && (
        <>
          <ellipse cx={-11} cy={-64} rx={4} ry={5} fill={INK} />
          <ellipse cx={11} cy={-64} rx={4} ry={5} fill={INK} />
          <path d="M -8 -48 Q 0 -42 8 -48" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
        </>
      )}
      {face === 'happy' && (
        <>
          <path d="M -16 -66 Q -11 -72 -6 -66" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d="M 6 -66 Q 11 -72 16 -66" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d="M -10 -48 Q 0 -38 10 -48" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
        </>
      )}
      {face === 'grin' && (
        <>
          <ellipse cx={-11} cy={-64} rx={4} ry={5} fill={INK} />
          <ellipse cx={11} cy={-64} rx={4} ry={5} fill={INK} />
          <path d="M -12 -50 Q 0 -38 12 -50 L -12 -50 Z" fill={INK} />
        </>
      )}
      {face === 'angry' && (
        <>
          <line x1={-18} y1={-76} x2={-5} y2={-70} stroke={INK} strokeWidth={5} strokeLinecap="round" />
          <line x1={18} y1={-76} x2={5} y2={-70} stroke={INK} strokeWidth={5} strokeLinecap="round" />
          <ellipse cx={-11} cy={-62} rx={4} ry={5} fill={INK} />
          <ellipse cx={11} cy={-62} rx={4} ry={5} fill={INK} />
          {/* أسنان مطبّقة */}
          <rect x={-11} y={-52} width={22} height={11} fill={C.white} stroke={INK} strokeWidth={3} />
          <line x1={-4} y1={-52} x2={-4} y2={-41} stroke={INK} strokeWidth={2} />
          <line x1={3} y1={-52} x2={3} y2={-41} stroke={INK} strokeWidth={2} />
          <line x1={-11} y1={-46.5} x2={11} y2={-46.5} stroke={INK} strokeWidth={2} />
        </>
      )}
      {face === 'shocked' && (
        <>
          <ellipse cx={-11} cy={-64} rx={7} ry={9} fill={C.white} stroke={INK} strokeWidth={3} />
          <ellipse cx={11} cy={-64} rx={7} ry={9} fill={C.white} stroke={INK} strokeWidth={3} />
          <circle cx={-11} cy={-63} r={3} fill={INK} />
          <circle cx={11} cy={-63} r={3} fill={INK} />
          <ellipse cx={0} cy={-44} rx={7} ry={9} fill={INK} />
        </>
      )}
      {face === 'worry' && (
        <>
          <line x1={-18} y1={-74} x2={-5} y2={-77} stroke={INK} strokeWidth={4} strokeLinecap="round" />
          <line x1={18} y1={-74} x2={5} y2={-77} stroke={INK} strokeWidth={4} strokeLinecap="round" />
          <ellipse cx={-11} cy={-63} rx={4} ry={5} fill={INK} />
          <ellipse cx={11} cy={-63} rx={4} ry={5} fill={INK} />
          <path d="M -8 -44 Q 0 -50 8 -44" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
        </>
      )}

      {/* النظارات */}
      {glasses && (
        <>
          <circle cx={-11} cy={-64} r={10} fill="none" stroke="#c8762c" strokeWidth={4} />
          <circle cx={11} cy={-64} r={10} fill="none" stroke="#c8762c" strokeWidth={4} />
          <line x1={-1} y1={-64} x2={1} y2={-64} stroke="#c8762c" strokeWidth={3} />
        </>
      )}

      {/* سخاري بخار الغضب */}
      {steam && (
        <>
          <circle cx={-42} cy={-84} r={11} fill={C.white} opacity={0.95} />
          <circle cx={-30} cy={-98} r={8} fill={C.white} opacity={0.9} />
          <circle cx={42} cy={-84} r={11} fill={C.white} opacity={0.95} />
          <circle cx={30} cy={-98} r={8} fill={C.white} opacity={0.9} />
        </>
      )}

      {/* القبعات */}
      {hat === 'cap' && (
        <>
          <path d="M -34 -84 Q 0 -112 34 -84 L 34 -80 L -34 -80 Z" fill={C.skyBlue} stroke={INK} strokeWidth={4} />
          <path d="M -30 -92 L -18 -104 M -12 -96 L -2 -107 M 6 -97 L 14 -105 M 20 -92 L 28 -99" stroke={C.white} strokeWidth={5} strokeLinecap="round" />
          <ellipse cx={0} cy={-80} rx={38} ry={7} fill={C.skyBlue} stroke={INK} strokeWidth={4} />
        </>
      )}
      {hat === 'bowler' && (
        <>
          <path d="M -26 -86 Q -26 -114 0 -114 Q 26 -114 26 -86 Z" fill={INK} stroke={INK} strokeWidth={4} />
          <ellipse cx={0} cy={-84} rx={38} ry={8} fill={INK} />
        </>
      )}
      {hat === 'tophat' && (
        <>
          <rect x={-20} y={-122} width={40} height={34} rx={4} fill={INK} stroke={INK} strokeWidth={4} />
          <rect x={-14} y={-96} width={28} height={8} fill={C.gold} />
          <ellipse cx={0} cy={-86} rx={40} ry={8} fill={INK} />
        </>
      )}
      {hat === 'flat' && (
        <>
          <path d="M -32 -88 Q 0 -106 32 -88 L 36 -82 L -36 -82 Z" fill="#7a6a8a" stroke={INK} strokeWidth={4} />
          <ellipse cx={4} cy={-82} rx={38} ry={6} fill="#7a6a8a" stroke={INK} strokeWidth={3} />
        </>
      )}
      {hat === 'conductor' && (
        <>
          <path d="M -28 -88 Q -28 -108 0 -108 Q 28 -108 28 -88 Z" fill={C.navy} stroke={INK} strokeWidth={4} />
          <rect x={-30} y={-90} width={60} height={9} rx={3} fill={C.navy} stroke={INK} strokeWidth={3} />
          <rect x={-12} y={-101} width={24} height={7} rx={2} fill={C.gold} />
          <ellipse cx={0} cy={-84} rx={36} ry={6} fill={C.navy} stroke={INK} strokeWidth={3} />
        </>
      )}

      {/* المنشار */}
      {saw && (
        <g transform="translate(38 30) rotate(24)">
          <rect x={0} y={-3} width={34} height={7} fill="#b8b8c4" stroke={INK} strokeWidth={2.5} />
          <path d="M 34 -3 L 44 0 L 34 3 Z" fill="#b8b8c4" stroke={INK} strokeWidth={2} />
          <rect x={-10} y={-5} width={12} height={11} rx={3} fill="#8a5a3c" stroke={INK} strokeWidth={2.5} />
        </g>
      )}

      {/* الفنجان */}
      {cup && (
        <g transform="translate(-38 24)">
          <rect x={-7} y={-6} width={14} height={11} rx={2} fill={C.white} stroke={INK} strokeWidth={2.5} />
          <path d="M 7 -3 Q 13 -3 13 2 Q 13 5 7 5" fill="none" stroke={INK} strokeWidth={2.5} />
        </g>
      )}
    </g>
  );
};
