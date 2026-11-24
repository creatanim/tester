import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {C, W, H} from './theme';

// ============================================================
// مشهدات three.js — نفس التكوينات من التحليل:
// L05–L06 (الجسر الجوي f112–253)، L33 (السكّة المثالية f1440–1583)،
// L38 (جسر الغروب f1784–1847)
// المواد MeshBasicMaterial مسطّحة (toon) لتطابق الأسلوب الأصلي
// ============================================================

const CameraRig: React.FC<{pos: [number, number, number]; look: [number, number, number]; fov?: number}> = ({pos, look, fov = 55}) => {
  const {camera} = useThree();
  camera.position.set(...pos);
  camera.lookAt(new THREE.Vector3(...look));
  (camera as THREE.PerspectiveCamera).fov = fov;
  (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  return null;
};

const Mat: React.FC<{color: string; opacity?: number}> = ({color, opacity = 1}) => (
  <meshBasicMaterial color={color} transparent={opacity < 1} opacity={opacity} />
);

// ---------- L05–L06 : الجسر فوق الماء (f112–253، 142 إطاراً) ----------
export const AerialBridge3D: React.FC = () => {
  const f = useCurrentFrame();
  // 0–95: انجراف جوي بطيء لليمين | 96–141: ميلان لأسفل على الدعامة
  const driftX = f < 96 ? f * 0.09 : 8.6;
  const camY = f < 96 ? 14 : interpolate(f, [96, 141], [14, -1.5]);
  const lookY = f < 96 ? 2 : interpolate(f, [96, 141], [2, -7]);

  return (
    <AbsoluteFill style={{background: C.waterBlue}}>
      <ThreeCanvas width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <CameraRig pos={[driftX, camY, 22]} look={[driftX * 0.6, lookY, 0]} fov={60} />
        {/* الماء */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -6, 0]}>
          <planeGeometry args={[200, 200]} />
          <Mat color={C.waterBlue} />
        </mesh>
        {/* ظلال موجية */}
        {Array.from({length: 10}).map((_, i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-20 + i * 5, -5.9, -10 + (i % 4) * 6]}>
            <planeGeometry args={[14, 1.4]} />
            <Mat color={C.waterLight} opacity={0.5} />
          </mesh>
        ))}
        {/* جدارا الأخدود */}
        {[-1, 1].map((s) => (
          <group key={s}>
            <mesh position={[s * 20, 2, -4]}>
              <boxGeometry args={[14, 22, 60]} />
              <Mat color={s < 0 ? '#7a2c4c' : '#c2524c'} />
            </mesh>
            <mesh position={[s * 17.5, 6, -2]}>
              <boxGeometry args={[3, 16, 56]} />
              <Mat color={s < 0 ? '#a2425c' : '#d87464'} />
            </mesh>
            <mesh position={[s * 15.8, 8.5, 0]}>
              <boxGeometry args={[1.4, 12, 50]} />
              <Mat color="#d88494" opacity={0.8} />
            </mesh>
          </group>
        ))}
        {/* مقطعا الجسر غير المكتملين */}
        {[-1, 1].map((s) => (
          <group key={s}>
            <mesh position={[s * 7, 3.4, -2]}>
              <boxGeometry args={[12, 0.8, 46]} />
              <Mat color={C.woodBrown} />
            </mesh>
            {Array.from({length: 7}).map((_, i) => (
              <mesh key={i} position={[s * 7, -1.2, -20 + i * 6.5]}>
                <boxGeometry args={[0.7, 8.4, 0.7]} />
                <Mat color={C.woodDark} />
              </mesh>
            ))}
          </group>
        ))}
        {/* منصة البناء الأمامية + رافعة */}
        <mesh position={[0, 2.6, 8]}>
          <boxGeometry args={[7, 0.7, 9]} />
          <Mat color="#b8906c" />
        </mesh>
        <mesh position={[0, 6, 8]}>
          <boxGeometry args={[0.4, 7, 0.4]} />
          <Mat color={C.ink} />
        </mesh>
        <mesh position={[1.4, 9, 8]} rotation={[0, 0, -0.7]}>
          <boxGeometry args={[0.35, 5, 0.35]} />
          <Mat color={C.ink} />
        </mesh>
        {/* رافعات بعيدة */}
        {[[-9, 3.8, -14], [9, 3.8, -10]].map((p, i) => (
          <group key={i} position={p as [number, number, number]}>
            <mesh position={[0, 2, 0]}>
              <boxGeometry args={[0.35, 4.5, 0.35]} />
              <Mat color={C.ink} />
            </mesh>
            <mesh position={[0.9, 4.1, 0]} rotation={[0, 0, -0.8]}>
              <boxGeometry args={[0.3, 2.6, 0.3]} />
              <Mat color={C.ink} />
            </mesh>
          </group>
        ))}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

// ---------- L33 : السكّة المثالية (f1440–1583، 144 إطاراً) ----------
export const PerfectRR3D: React.FC = () => {
  const f = useCurrentFrame();
  // 0–71 dolly-in بطيء جداً | 72–87 وميض | 88–143 التوهج + pull-back
  const z = f < 88 ? interpolate(f, [0, 87], [30, 16]) : interpolate(f, [88, 143], [16, 26]);
  const glow = f >= 88 ? Math.min(1, (f - 88) / 12) : 0;
  const railColor = glow > 0 ? (f < 116 ? C.railMagenta : C.railGold) : '#b8bcc8';

  return (
    <AbsoluteFill style={{background: C.skyBlue}}>
      <ThreeCanvas width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <CameraRig pos={[0, 3.2, z]} look={[0, 1.6, -40]} fov={58} />
        {/* السماء */}
        <mesh position={[0, 12, -70]}>
          <planeGeometry args={[260, 90]} />
          <Mat color={C.skyBlue} />
        </mesh>
        {[[-30, 16, -68], [12, 20, -68], [38, 14, -68]].map((p, i) => (
          <mesh key={i} position={p as [number, number, number]}>
            <planeGeometry args={[26, 6]} />
            <Mat color={C.white} opacity={0.85} />
          </mesh>
        ))}
        {/* الأرض */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -20]}>
          <planeGeometry args={[120, 160]} />
          <Mat color="#8a4a5c" />
        </mesh>
        {/* الهضبات */}
        {[[-26, 2.5, -50], [26, 2, -46], [-14, 1.6, -58], [16, 2.8, -60]].map((p, i) => (
          <mesh key={i} position={p as [number, number, number]}>
            <boxGeometry args={[14, 3 + (i % 2), 8]} />
            <Mat color="#b06858" />
          </mesh>
        ))}
        {/* الدُّبّار (النومات) */}
        {Array.from({length: 26}).map((_, i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 10 - i * 2.6]}>
            <planeGeometry args={[5.2, 0.7]} />
            <Mat color="#4a2c34" />
          </mesh>
        ))}
        {/* القضبان */}
        {[-1.7, 1.7].map((x) => (
          <mesh key={x} position={[x, 0.16, -22]}>
            <boxGeometry args={[0.34, 0.28, 90]} />
            <meshBasicMaterial color={railColor} />
          </mesh>
        ))}
        {/* التوهج */}
        {glow > 0 && (
          <>
            <mesh position={[0, 0.3, -18]}>
              <planeGeometry args={[7, 84]} />
              <Mat color={f < 116 ? C.railMagenta : C.railGold} opacity={0.35} />
            </mesh>
          </>
        )}
        {/* مظلة صغيرة + كرسي على السكة (المركّز البصري) */}
        <mesh position={[0, 1.5, -30]}>
          <boxGeometry args={[0.12, 2.6, 0.12]} />
          <Mat color={C.ink} />
        </mesh>
        <mesh position={[0, 2.9, -30]} rotation={[0, 0, 0]}>
          <coneGeometry args={[1.5, 0.8, 4]} />
          <Mat color={C.red} />
        </mesh>
        <mesh position={[0, 0.55, -30]}>
          <boxGeometry args={[1.3, 0.18, 1.1]} />
          <Mat color={C.gold} />
        </mesh>
        {/* عمود إنارة مصغّر على الحافة */}
        {[-6, 6].map((x) => (
          <mesh key={x} position={[x, 1.5, -26]}>
            <boxGeometry args={[0.12, 3, 0.12]} />
            <Mat color={C.ink} />
          </mesh>
        ))}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

// ---------- L38 : جسر الغروب (f1784–1847، 64 إطاراً) ----------
export const SunsetBridge3D: React.FC = () => {
  const f = useCurrentFrame();
  // 0–35 انجراف جوي | 36–63 ميلان إلى منظور طولي + اقتراب القطار
  const aerial = f < 36;
  const camPos: [number, number, number] = aerial
    ? [interpolate(f, [0, 35], [10, 4]), interpolate(f, [0, 35], [9, 7]), interpolate(f, [0, 35], [20, 16])]
    : [interpolate(f, [36, 63], [3.6, 2.2]), interpolate(f, [36, 63], [6.4, 5.2]), interpolate(f, [36, 63], [14, 8])];
  const lookPos: [number, number, number] = aerial ? [-2, 3.4, -6] : [0, 4.6, -30];
  const trainZ = interpolate(f, [0, 63], [-26, aerial ? -22 : -6]);

  return (
    <AbsoluteFill style={{background: '#e8a06a'}}>
      <ThreeCanvas width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <CameraRig pos={camPos} look={lookPos} fov={58} />
        {/* السماء المتدرجة (طبقات) */}
        <mesh position={[0, 16, -80]}>
          <planeGeometry args={[300, 70]} />
          <Mat color="#c86a8c" />
        </mesh>
        <mesh position={[0, 2.5, -78]}>
          <planeGeometry args={[300, 34]} />
          <Mat color="#e8946c" />
        </mesh>
        <mesh position={[0, -12, -76]}>
          <planeGeometry args={[300, 30]} />
          <Mat color="#8a4a8c" />
        </mesh>
        {/* الهضبات البعيدة */}
        {[[-30, 4, -60], [28, 5, -62], [0, 3, -66]].map((p, i) => (
          <mesh key={i} position={p as [number, number, number]}>
            <boxGeometry args={[18, 5 + i, 10]} />
            <Mat color="#a25464" />
          </mesh>
        ))}
        {/* الجسر: سطح + أقواس + دعامات */}
        <mesh position={[0, 3.6, -14]}>
          <boxGeometry args={[6.4, 0.5, 70]} />
          <Mat color="#4a2c34" />
        </mesh>
        {Array.from({length: 14}).map((_, i) => (
          <mesh key={i} position={[0, 3.95, 8 - i * 5]}>
            <boxGeometry args={[6, 0.16, 0.9]} />
            <Mat color="#6a3c44" />
          </mesh>
        ))}
        {/* الأقواس (بأقواس مرتّبة) */}
        {[[-3, 1.2, -2], [3, 1.2, -2]].map((p, i) => (
          <group key={i}>
            <mesh position={p as [number, number, number]} rotation={[0, 0, 0]}>
              <torusGeometry args={[4.2, 0.28, 8, 24, Math.PI]} />
              <Mat color="#3a2430" />
            </mesh>
          </group>
        ))}
        {Array.from({length: 10}).map((_, i) => (
          <mesh key={i} position={[-3, 0.2, 4 - i * 5]}>
            <boxGeometry args={[0.35, 6.6, 0.35]} />
            <Mat color="#3a2430" />
          </mesh>
        ))}
        {Array.from({length: 10}).map((_, i) => (
          <mesh key={i} position={[3, 0.2, 4 - i * 5]}>
            <boxGeometry args={[0.35, 6.6, 0.35]} />
            <Mat color="#3a2430" />
          </mesh>
        ))}
        {/* القطار البخاري */}
        <group position={[0, 4.6, trainZ]}>
          <mesh>
            <boxGeometry args={[2.2, 1.5, 6]} />
            <Mat color="#2c1c22" />
          </mesh>
          <mesh position={[0, 0.9, -1.8]}>
            <cylinderGeometry args={[0.75, 0.75, 1.4, 12]} />
            <Mat color="#2c1c22" />
          </mesh>
          <mesh position={[0, 0.9, -1.8]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.7, 8]} />
            <Mat color="#2c1c22" />
          </mesh>
          {/* الدخان */}
          {Array.from({length: 6}).map((_, i) => {
            const tt = ((f * 0.035 + i * 0.16) % 1);
            return (
              <mesh key={i} position={[Math.sin(i * 2 + f * 0.05) * 0.8, 2.2 + tt * 5, -1.8 + tt * 3]}>
                <sphereGeometry args={[0.5 + tt * 0.9, 10, 10]} />
                <Mat color="#4a3230" opacity={(1 - tt) * 0.85} />
              </mesh>
            );
          })}
        </group>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
