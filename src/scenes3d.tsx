import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {W, H} from './theme';
import {skyTex, signTex, woodTex, newspaperTex, rockTex, calendarTex} from './lib/textures';
import {buildCharacter} from './lib/character';
import {
  makeSky, makeCanyonWall, makeBallastGround, makeTrack,
  makeTunnelLocomotive, makeTelegraphPole, makeCactus, makeWater,
  makeTrestle, makeCrane, makeStationExterior, makeStationHall, makeDeck,
  makeLuxuryCarExterior, makeLuxuryInterior, makeShortLineCar, makeCalendarCart,
  makeBlueFlag, makeDeckChair, makeMesa,
} from './lib/env';
import {
  makeSmoke, makeAngerSteam, makeSparks, makeRailGlint, makeFireball, makeMushroom, FxSystem,
} from './lib/fx';

// ============================================================
// scenes3d.tsx — كل المشهدات 3D بجودة إنتاج (الهياكل الثابتة
// مُخزَّنة في useMemo — نفس التكوينات والتوقيتات من التحليل)
// ============================================================

const CameraRig: React.FC<{
  pos: [number, number, number];
  look: [number, number, number];
  fov?: number;
}> = ({pos, look, fov = 55}) => {
  const {camera} = useThree();
  camera.position.set(...pos);
  camera.lookAt(new THREE.Vector3(...look));
  (camera as THREE.PerspectiveCamera).fov = fov;
  (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  return null;
};

const Lights: React.FC = () => (
  <>
    <hemisphereLight args={['#bfd4ff', '#8a5a4c', 0.95]} />
    <directionalLight position={[14, 26, 12]} intensity={1.05} color="#ffe6c4" />
    <directionalLight position={[-10, 12, -8]} intensity={0.35} color="#a4b8e8" />
  </>
);

const Stage: React.FC<{
  cam: [number, number, number];
  look: [number, number, number];
  fov?: number;
  sky: [string, string, string];
  fog?: [string, number, number];
  world: THREE.Group;
  children?: React.ReactNode;
}> = ({cam, look, fov = 55, sky, fog, world, children}) => {
  const skyObj = useMemo(() => makeSky(sky[0], sky[1], sky[2]), [sky[0], sky[1], sky[2]]);
  return (
    <AbsoluteFill>
      <ThreeCanvas width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <CameraRig pos={cam} look={look} fov={fov} />
        <Lights />
        <primitive object={skyObj} />
        {fog && <fog attach="fog" args={[fog[0], fog[1], fog[2]]} />}
        <primitive object={world} />
        {children}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

const Fx: React.FC<{systems: FxSystem[]}> = ({systems}) => {
  const f = useCurrentFrame();
  systems.forEach((s) => s.update(f));
  return <>{systems.map((s, i) => <primitive key={i} object={s.group} />)}</>;
};

// ---------- L01–L04 : الممر المظلم + القاطرة رقم 7 (f0–111) ----------
export const CanyonWalk: React.FC = () => {
  const f = useCurrentFrame();
  const zChar = f * 0.13;
  const dark = f < 54;

  const world = useMemo(() => {
    const g = new THREE.Group();
    g.add(makeBallastGround(60, 260, 0));
    g.add(makeTrack(260, 3.1, 0));
    g.add(makeCanyonWall(14, 42, 200, '#62162c', '#3a0f22', '#c98d68'));
    g.children[g.children.length - 1].position.set(-13, 18, 40);
    g.add(makeCanyonWall(12, 36, 200, '#4a1226', '#2c1420', '#a2765c'));
    g.children[g.children.length - 1].position.set(16, 15, 30);
    g.add(makeTelegraphPole()); g.children[g.children.length - 1].position.set(-7.4, 0, -24);
    g.add(makeTelegraphPole()); g.children[g.children.length - 1].position.set(-7.4, 0, -52);
    g.add(makeCactus()); g.children[g.children.length - 1].position.set(-8.6, 0, -8);
    g.add(makeCactus()); g.children[g.children.length - 1].position.set(-9.2, 0, -36);
    return g;
  }, []);

  const tunnel = useMemo(() => makeTunnelLocomotive(), []);
  tunnel.position.set(0, 0, -34 + Math.min(30, f * 0.32));

  const engineer = useMemo(() => buildCharacter({jacket: '#20b0a0', hat: 'cap', face: 'normal', scale: 1.35}), []);
  engineer.walk(f > 14 ? f * 0.24 : 0);
  engineer.group.position.set(1.6, 4.6, zChar);
  if (f < 14) engineer.setFace('angry');

  const sparks = useMemo(() => makeSparks(-1.5, 1.2, -3, 14), []);

  return (
    <Stage
      cam={[8.4, 5.2, zChar + 2]}
      look={[1.4, 4.4, zChar - 4.5]}
      fov={58}
      sky={dark ? ['#150a14', '#2d1d36', '#421226'] : f < 80 ? ['#4a2438', '#8e3c3c', '#c8541c'] : ['#4b73c5', '#86aae0', '#e8944c']}
      world={world}
    >
      <primitive object={tunnel} />
      <primitive object={engineer.group} />
      {f >= 93 && f <= 108 && <Fx systems={[sparks]} />}
    </Stage>
  );
};

// ---------- L05–L06 : الجسر فوق الماء + النزول إلى القاع (f112–253) ----------
export const AerialBay: React.FC = () => {
  const f = useCurrentFrame();
  const driftX = Math.min(f, 96) * 0.16;
  const camY = f < 96 ? 26 : 26 - ((f - 96) / 46) * 32;
  const lookY = f < 96 ? 2 : 2 - ((f - 96) / 46) * 16;

  const world = useMemo(() => {
    const g = new THREE.Group();
    g.add(makeWater(400));
    g.add(makeCanyonWall(30, 60, 120, '#b2494c', '#7a2c4c', '#d88494', true));
    g.children[g.children.length - 1].position.set(-36, 16, -20);
    g.add(makeCanyonWall(26, 52, 110, '#c2524c', '#8e2418', '#e0a08c', true));
    g.children[g.children.length - 1].position.set(38, 12, -14);
    g.add(makeTrestle(70, 16, 0)); g.children[g.children.length - 1].position.set(-10, 9, -8);
    g.add(makeTrestle(52, 16, 0)); g.children[g.children.length - 1].position.set(16, 9, -4);
    g.add(makeTrestle(20, 13, 0)); g.children[g.children.length - 1].position.set(0, 7, 18);
    g.add(makeCrane(11)); g.children[g.children.length - 1].position.set(2, 7, 18);
    const fig = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.8, 4, 8), new THREE.MeshToonMaterial({color: '#20b0a0'}));
    fig.position.set(-6.5, 8.6, 16);
    g.add(fig);
    [[-30, 20], [20, 2], [44, -16]].forEach(([x, z], i) => {
      const buoy = new THREE.Mesh(new THREE.SphereGeometry(1.1, 10, 8), new THREE.MeshToonMaterial({color: '#c4422e'}));
      buoy.position.set(x, -9.6, z);
      g.add(buoy);
    });
    return g;
  }, []);

  const plankY = f > 100 ? -((f - 100) * 1.4) : 0;

  return (
    <Stage
      cam={[driftX, camY, 42]}
      look={[driftX * 0.55, lookY, -6]}
      fov={62}
      sky={['#3d6fd4', '#6ea3e8', '#bcd4f2']}
      world={world}
    >
      {f > 100 && (
        <mesh position={[1.5, 7 + plankY, 17]} rotation={[0.4 + f * 0.05, 0.2, 0.7]}>
          <boxGeometry args={[0.5, 0.16, 3.2]} />
          <meshToonMaterial color="#8a5a3c" />
        </mesh>
      )}
    </Stage>
  );
};

// ---------- L07–L09 : الصحراء + الـويب (f254–301) ----------
export const DesertRise: React.FC = () => {
  const f = useCurrentFrame();
  const rise = Math.min(1, f / 30);
  const whip = f >= 40;
  const camY = 2 + rise * 16 + (whip ? (f - 40) * 1.2 : 0);
  const camZ = whip ? 40 - (f - 40) * 14 : 44;

  const world = useMemo(() => {
    const g = new THREE.Group();
    g.add(makeBallastGround(260, 260, -0.2));
    const mesas: [number, number, number][] = [[-40, 4, -80], [36, 6, -90], [-12, 3, -110], [18, 5, -100]];
    mesas.forEach((p, i) => {
      g.add(makeMesa(22 + i * 6, 6 + i * 2, 14));
      g.children[g.children.length - 1].position.set(...p);
    });
    const train = new THREE.Group();
    for (let i = 0; i < 7; i++) {
      const car = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.9, 1.8), new THREE.MeshToonMaterial({color: '#2c1520'}));
      car.position.set(i * 3.2 - 10, 1, 0);
      train.add(car);
    }
    train.position.set(0, 0.4, -70);
    g.add(train);
    return g;
  }, []);

  return (
    <Stage
      cam={[whip ? (f - 40) * 3 : 0, camY, camZ]}
      look={[0, 3 + rise * 2, -30]}
      fov={60}
      sky={['#4b73c5', '#86aae0', '#e8b48a']}
      world={world}
    >
      <mesh position={[0, -rise * 4, 30 - rise * 8]}>
        <boxGeometry args={[90, 10, 16]} />
        <meshToonMaterial color="#4a1f31" />
      </mesh>
    </Stage>
  );
};

// ---------- L10 : التقدّم نحو المحطة (f302–313) ----------
export const StationApproach: React.FC = () => {
  const f = useCurrentFrame();
  const world = useMemo(() => {
    const g = new THREE.Group();
    g.add(makeBallastGround(160, 180, 0));
    [-9, -4.5, 0, 4.5, 9].forEach((x) => {
      g.add(makeTrack(160, 2.2, 0));
      g.children[g.children.length - 1].position.set(x, 0, 20);
    });
    g.add(makeStationExterior());
    g.children[g.children.length - 1].position.set(0, 0, -34);
    return g;
  }, []);

  return (
    <Stage
      cam={[0, 7, 64 - f * 2.6]}
      look={[0, 9, -18]}
      fov={56}
      sky={['#4b73c5', '#86aae0', '#c8cfe8']}
      world={world}
    />
  );
};

// ---------- L11 : حفل الشركات (f314–347) ----------
export const Ceremony: React.FC = () => {
  const f = useCurrentFrame();
  const push = 11 - f * 0.06;

  const world = useMemo(() => {
    const g = new THREE.Group();
    g.add(makeBallastGround(80, 80, 0));
    const banner = new THREE.Mesh(new THREE.PlaneGeometry(38, 8), new THREE.MeshBasicMaterial({map: signTex(['FIRST LINE IN', 'GETS IT ALL!'], '#f7f2ea', '#c4422e', 74)}));
    banner.position.set(0, 13, -14);
    const union = new THREE.Mesh(new THREE.PlaneGeometry(30, 5), new THREE.MeshBasicMaterial({map: signTex(['UNION'], '#252447', '#e8b23a', 96)}));
    union.position.set(0, 20, -14.2);
    g.add(banner, union);
    const carpet = new THREE.Mesh(new THREE.PlaneGeometry(16, 11), new THREE.MeshToonMaterial({color: '#c4422e'}));
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.y = 0.45;
    g.add(carpet);
    const pile1 = new THREE.Mesh(new THREE.ConeGeometry(3.4, 2.6, 7), new THREE.MeshToonMaterial({color: '#e8a72c'}));
    pile1.position.set(-2.4, 1.2, -3.4);
    const pile2 = new THREE.Mesh(new THREE.ConeGeometry(2.8, 2.2, 7), new THREE.MeshToonMaterial({color: '#e8b23a'}));
    pile2.position.set(1.8, 1.1, -4.2);
    g.add(pile1, pile2);
    [[2.8, 1.15, -1.6], [4.1, 1.15, -3], [-0.2, 1.15, -1.2]].forEach(([x, y, z]) => {
      const bag = new THREE.Mesh(new THREE.SphereGeometry(0.95, 12, 10), new THREE.MeshToonMaterial({color: '#c9a24a'}));
      bag.position.set(x, y, z);
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.5, 0.7, 8), new THREE.MeshToonMaterial({color: '#c9a24a'}));
      neck.position.set(x, y + 1.15, z);
      g.add(bag, neck);
    });
    return g;
  }, []);

  const boss = useMemo(() => buildCharacter({jacket: '#171717', hat: 'tophat', face: 'grin', scale: 1.5}), []);
  boss.group.position.set(2.2, 3.6, 2);
  const yellow = useMemo(() => buildCharacter({jacket: '#e8a72c', hat: 'bowler', face: 'happy', scale: 1.2}), []);
  yellow.group.position.set(-3.4, 3.2, -1);

  return (
    <Stage
      cam={[0, 5.2, push]}
      look={[0, 4.6, -6]}
      fov={54}
      sky={['#2d203d', '#68537e', '#aaa0a8']}
      world={world}
    >
      <primitive object={boss.group} />
      <primitive object={yellow.group} />
    </Stage>
  );
};

// ---------- L12 : العمال على الحافة (f348–407) ----------
export const WorkersRidge: React.FC = () => {
  const f = useCurrentFrame();
  const camX = f * 0.22;

  const world = useMemo(() => {
    const g = new THREE.Group();
    const wall = makeCanyonWall(120, 40, 90, '#b5301c', '#8e2418', '#d87464', true);
    wall.position.set(0, -14, -30);
    g.add(wall);
    const water = makeWater(200);
    water.position.set(0, -12, -10);
    g.add(water);
    const beam = new THREE.Mesh(new THREE.BoxGeometry(46, 0.6, 3), new THREE.MeshToonMaterial({color: '#8a5a3c', map: woodTex('#8a5a3c', '#4a2c24')}));
    beam.position.set(0, 3.2, 0);
    beam.rotation.z = -0.11;
    const rail = new THREE.Mesh(new THREE.BoxGeometry(46, 0.16, 0.16), new THREE.MeshToonMaterial({color: '#4a2c24'}));
    rail.position.set(0, 4.35, -1.6);
    rail.rotation.z = -0.11;
    g.add(beam, rail);
    return g;
  }, []);

  const w1 = useMemo(() => buildCharacter({jacket: '#2e9e6b', hat: 'flat', scale: 1.15}), []);
  const w2 = useMemo(() => buildCharacter({jacket: '#7a5a3c', hat: 'flat', scale: 1.1}), []);
  const w3 = useMemo(() => buildCharacter({jacket: '#20b0a0', hat: 'cap', scale: 1.18}), []);
  [w1, w2, w3].forEach((w, i) => {
    w.walk(f * 0.26 + i * 1.7);
    w.group.position.set(camX * 0.1 + i * 2.6 - 2.6, 4.2 + Math.abs(Math.sin(f * 0.26 + i)) * 0.07, 1 - i * 2.2);
  });

  return (
    <Stage
      cam={[camX, 7.2, 15]}
      look={[camX + 1.5, 3.4, -2]}
      fov={57}
      sky={['#4b73c5', '#6ea3e8', '#a8c4e8']}
      world={world}
    >
      <primitive object={w1.group} />
      <primitive object={w2.group} />
      <primitive object={w3.group} />
    </Stage>
  );
};

// ---------- L13–L16 : الزعيم — الغضب البنفسجي (f408–627) ----------
export const BossMeet: React.FC = () => {
  const f = useCurrentFrame();
  const camZ =
    f < 24 ? 13 - f * 0.28 :
    f < 72 ? 5.6 - (f - 24) * 0.02 :
    f < 101 ? 5.6 + (f - 72) * 0.13 :
    f < 109 ? 9.4 - (f - 101) * 0.72 :
    3.6 + (f - 109) * 0.032;
  const purple = f >= 109 && f < 181;
  const face = f >= 109 ? 'angry' : f >= 24 && f < 72 ? 'worry' : 'normal';

  const world = useMemo(() => {
    const g = new THREE.Group();
    g.add(makeBallastGround(80, 120, 0));
    g.add(makeTrack(120, 3.2, 0.05));
    const wallL = makeCanyonWall(12, 30, 90, '#ce5f3e', '#b5301c', '#e0a08c', true);
    wallL.position.set(-11, 12, -12);
    const wallR = makeCanyonWall(10, 26, 90, '#d85b2c', '#8e2418', '#c98d68', true);
    wallR.position.set(12, 10, -16);
    g.add(wallL, wallR);
    const pole = makeTelegraphPole();
    pole.position.set(-6.8, 0, -10);
    g.add(pole);
    return g;
  }, []);

  const boss = useMemo(() => buildCharacter({jacket: '#e8a72c', hat: 'bowler', face: 'normal', scale: 1.9}), []);
  boss.setFace(face as 'normal');
  boss.setPurple(purple);
  boss.group.position.set(0.7, 4.9, -2);

  const engineer = useMemo(() => buildCharacter({jacket: '#20b0a0', hat: 'cap', face: 'normal', scale: 1.35}), []);
  engineer.group.position.set(-3.4, 4.4, -3.4);
  engineer.group.visible = f >= 130;

  const goggle = useMemo(() => buildCharacter({jacket: '#2e9e6b', hat: 'flat', face: 'normal', glasses: true, scale: 1.25}), []);
  goggle.group.position.set(-1.4, 2.2, 1.4);
  goggle.group.visible = f >= 20 && f < 72;

  const steam = useMemo(() => makeAngerSteam(boss.head, 0, 1.4, 0.4), []);
  steam.group.visible = purple;
  if (purple) steam.update(f);

  return (
    <Stage
      cam={[0.4, f < 72 ? 5.4 : 5.0, camZ]}
      look={[0.2, f < 72 ? 4.9 : 4.4, -2.2]}
      fov={f < 24 ? 50 : 54}
      sky={['#4b73c5', '#86aae0', '#e9b48a']}
      world={world}
    >
      <primitive object={boss.group} />
      <primitive object={engineer.group} />
      <primitive object={goggle.group} />
    </Stage>
  );
};

// ---------- L18–L20 : منصة البناء (f648–788) ----------
export const PlatformDeck: React.FC = () => {
  // تسلسل يبدأ عند f624: أول 24 إطارًا = الـويب الأيمن (f624–647)
  const raw = useCurrentFrame();
  const f = raw - 24;
  const whip = raw < 24;
  const tiltY = whip ? 8 : f < 72 ? 16 - (Math.min(f, 71) - 20) * 0.22 : 3.2;
  const slideX = whip ? -24 + raw * 1.6 : f >= 76 && f < 116 ? -(f - 76) * 0.55 : f >= 116 ? -22 : 0;
  const camZ = whip ? 10 : f >= 116 ? 22 + (f - 116) * 0.35 : 12;
  const blurred = whip || (f >= 72 && f < 80) || (f >= 84 && f < 100);

  const world = useMemo(() => {
    const g = new THREE.Group();
    g.add(makeDeck(46, 70));
    g.children[g.children.length - 1].position.set(0, 0, -8);
    g.add(makeCrane(13)); g.children[g.children.length - 1].position.set(-6, 0, -14);
    g.add(makeCrane(11)); g.children[g.children.length - 1].position.set(7, 0, -16);
    for (let i = 0; i < 6; i++) {
      const post = new THREE.Group();
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 5.2, 8), new THREE.MeshToonMaterial({color: '#171717'}));
      pole.position.y = 2.6;
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8), new THREE.MeshBasicMaterial({color: '#ffd977' }));
      lamp.position.y = 5.35;
      post.add(pole, lamp);
      post.position.set(-9 + i * 3.6, 0, -3);
      g.add(post);
    }
    [[3.4, -6.4], [-4.6, -5.2], [8.2, -8.8]].forEach(([x, z]) => {
      const box = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.7, 1.7), new THREE.MeshToonMaterial({color: '#d4762c'}));
      box.position.set(x, 1, z);
      g.add(box);
    });
    return g;
  }, []);

  const conductor = useMemo(() => buildCharacter({jacket: '#252447', hat: 'conductor', face: 'worry', scale: 1.6}), []);
  conductor.group.position.set(1 + slideX * 0.1, 3.3, -2);
  conductor.group.rotation.x = f < 45 ? 0.65 : 0;

  const walker = useMemo(() => buildCharacter({jacket: '#171717', hat: 'tophat', face: 'normal', scale: 1.5}), []);
  walker.group.visible = f >= 104;
  walker.walk(Math.max(0, f - 104) * 0.24);
  walker.group.position.set(-2 + slideX * 0.1, 3.2, 2);

  const s1 = useMemo(() => makeSmoke(-5, 8, -12, {rise: 16}), []);
  const s2 = useMemo(() => makeSmoke(6, 9, -14, {rise: 18}), []);

  return (
    <AbsoluteFill style={{filter: blurred ? 'blur(7px)' : 'none'}}>
      <Stage
        cam={[slideX, tiltY, camZ]}
        look={[slideX * 0.6, f < 40 ? 2 : 3.4, -6]}
        fov={56}
        sky={['#4b73c5', '#86aae0', '#d8a582']}
        world={world}
      >
        <primitive object={conductor.group} />
        <primitive object={walker.group} />
        <Fx systems={[s1, s2]} />
      </Stage>
    </AbsoluteFill>
  );
};

// ---------- L21–L22 : القطار الفاخر (f789–855) ----------
export const LuxuryTrain: React.FC = () => {
  const f = useCurrentFrame();
  const exterior = f < 19;

  const worldExt = useMemo(() => {
    const g = new THREE.Group();
    g.add(makeLuxuryCarExterior());
    g.add(makeBallastGround(60, 90, 0));
    g.add(makeTrack(90, 3.2, 0.05));
    return g;
  }, []);

  const worldInt = useMemo(() => {
    const g = new THREE.Group();
    g.add(makeLuxuryInterior());
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.3, 10), new THREE.MeshToonMaterial({color: '#ffffff'}));
    cup.position.set(0.9, 3.15, -2.6);
    g.add(cup);
    return g;
  }, []);

  const tea = useMemo(() => buildCharacter({jacket: '#6a4a6a', hat: 'tophat', face: 'happy', scale: 1.5}), []);
  tea.setFace(f >= 59 ? 'worry' : 'happy');
  tea.group.position.set(0, 2.5, -3);

  return exterior ? (
    <Stage
      cam={[9 - f * 0.12, 4.2, 8 - f * 0.75]}
      look={[0, 3, -2 - f * 0.2]}
      fov={54}
      sky={['#252447', '#3d3866', '#7a6a8a']}
      world={worldExt}
    />
  ) : (
    <Stage
      cam={[0, 3.8, 12 - (f - 19) * 0.16]}
      look={[0, 3.4, -4]}
      fov={56}
      sky={['#c4622c', '#c4622c', '#c4622c']}
      world={worldInt}
    >
      <primitive object={tea.group} />
    </Stage>
  );
};

// ---------- L23–L24 : RED CANYON LINE (f856–935) ----------
export const ShortLine: React.FC = () => {
  const f = useCurrentFrame();
  const side = f < 24;
  const bob = Math.sin(f * 0.5) * 0.07;

  const worldSide = useMemo(() => {
    const g = new THREE.Group();
    g.add(makeTrestle(120, 22, 0));
    g.children[g.children.length - 1].position.set(0, 13, -10);
    const canyon = makeCanyonWall(120, 44, 100, '#b06a72', '#8e2418', '#d8a0a8', true);
    canyon.position.set(0, -8, -40);
    g.add(canyon);
    for (let i = 0; i < 4; i++) {
      g.add(makeShortLineCar());
      g.children[g.children.length - 1].position.set(0, 13, -18 + i * 10);
    }
    return g;
  }, []);

  const worldWin = useMemo(() => {
    const g = new THREE.Group();
    const wall = new THREE.Mesh(new THREE.BoxGeometry(9, 6.4, 0.5), new THREE.MeshToonMaterial({color: '#7a2c2c'}));
    wall.position.set(0, 3.4, -3);
    const band = new THREE.Mesh(new THREE.PlaneGeometry(8, 1.4), new THREE.MeshBasicMaterial({map: signTex(['RED CANYON LINE'], '#2f7d4f', '#e8b23a', 60)}));
    band.position.set(0, 5.4, -2.68);
    const frame = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.8), new THREE.MeshToonMaterial({color: '#e8b23a'}));
    frame.position.set(0, 3.5, -2.68);
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 2.3), new THREE.MeshBasicMaterial({color: '#86aae0'}));
    glass.position.set(0, 3.5, -2.6);
    g.add(wall, band, frame, glass);
    for (let i = 0; i < 5; i++) {
      const shed = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.2, 1.6), new THREE.MeshToonMaterial({color: '#5b3437'}));
      shed.position.set(-7.2 + i * 3.6, 1, -6);
      shed.name = `shed${i}`;
      g.add(shed);
    }
    return g;
  }, []);

  const engineer = useMemo(() => buildCharacter({jacket: '#e8b23a', hat: 'flat', face: 'worry', glasses: true, scale: 1.25}), []);
  engineer.group.position.set(0, 2.3 + (side ? 0 : bob), 0);

  const smoke = useMemo(() => makeSmoke(0, 17.5, -24, {dark: true, rise: 9}), []);

  if (side) {
    return (
      <Stage
        cam={[10 - f * 0.5, 8, 16]}
        look={[0, 6, -8]}
        fov={55}
        sky={['#4b73c5', '#86aae0', '#c88a92']}
        world={worldSide}
      >
        <Fx systems={[smoke]} />
      </Stage>
    );
  }
  // خلفية تمر أثناء تتبّع النافذة
  worldWin.children.forEach((c) => {
    if (c.name.startsWith('shed')) {
      c.position.x = ((f * 0.5 + Number(c.name.slice(4)) * 3.6) % 18) - 9;
    }
  });
  return (
    <Stage
      cam={[5.6, 3.6, 1.2]}
      look={[0, 3.2, -1]}
      fov={54}
      sky={['#252447', '#252447', '#252447']}
      world={worldWin}
    >
      <primitive object={engineer.group} />
    </Stage>
  );
};

// ---------- L25–L27 : الجريدة والقاعة (f936–1087) ----------
export const Newspaper: React.FC = () => {
  const f = useCurrentFrame();
  const hazy = f >= 96;
  const push = f >= 144 ? (f - 144) * 0.22 : 0;

  const world = useMemo(() => {
    const g = new THREE.Group();
    g.add(makeStationHall());
    const paperGeo = new THREE.PlaneGeometry(1.4, 1.8);
    const paperMat = new THREE.MeshBasicMaterial({map: newspaperTex()});
    [[-4, -2], [3, -1], [5, -5], [-2, -6]].forEach(([x, z], i) => {
      const p = new THREE.Mesh(paperGeo, paperMat);
      p.rotation.set(-Math.PI / 2, 0, i * 0.7);
      p.position.set(x, 0.05, z);
      p.name = 'paper';
      g.add(p);
    });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(7.4, 2.3), new THREE.MeshBasicMaterial({map: signTex(['ALL ABOARD!'], '#f3e3d1', '#c4422e', 86)}));
    sign.position.set(0, 8.6, -4);
    sign.rotation.z = -0.1;
    sign.name = 'aboard';
    g.add(sign);
    const cart = makeCalendarCart();
    cart.position.set(5, 0, -2);
    cart.name = 'cart';
    g.add(cart);
    return g;
  }, []);

  world.children.forEach((c) => {
    if (c.name === 'paper') c.visible = hazy;
    if (c.name === 'aboard' || c.name === 'cart') c.visible = f >= 112;
  });

  const man = useMemo(() => buildCharacter({jacket: '#9a8a7a', hat: 'flat', face: 'normal', scale: 1.6}), []);
  man.walk(f * 0.22);
  man.group.position.set(0, 3.4, 2 - Math.min(3.2, f * 0.035));
  man.group.visible = f < 82;

  const paper = useMemo(() => {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 2.1), new THREE.MeshBasicMaterial({map: newspaperTex()}));
    p.rotation.z = -0.06;
    return p;
  }, []);
  paper.visible = f < 82;
  paper.position.set(man.group.position.x, 3.9, man.group.position.z + 1.15);

  const crowd = useMemo(() => [
    buildCharacter({jacket: '#e8a72c', hat: 'bowler', face: 'happy', scale: 1.5}),
    buildCharacter({jacket: '#6a4a8a', hat: 'tophat', face: 'normal', scale: 1.3}),
    buildCharacter({jacket: '#2e9e6b', hat: 'flat', face: 'normal', scale: 1.15}),
  ], []);
  crowd.forEach((c, i) => {
    c.group.visible = f >= 112;
    c.group.position.set(-3 + i * 3, 3.2, -3 - i);
    c.walk(f * 0.12 + i, 0.3);
  });

  return (
    <AbsoluteFill style={{filter: f >= 72 && f < 82 ? 'blur(9px)' : 'none'}}>
      <Stage
        cam={[f >= 72 && f < 82 ? (f - 76) * 1.2 : 0, 4.6, 13 - push]}
        look={[0, 4, -6]}
        fov={55}
        sky={hazy ? ['#d8a0b0', '#e0b0bc', '#e8c0c8'] : ['#4a2c2c', '#4a2c2c', '#4a2c2c']}
        fog={hazy ? ['#e0b4c0', 14, 60] : undefined}
        world={world}
      >
        <primitive object={man.group} />
        <primitive object={paper} />
        {crowd.map((c, i) => <primitive key={i} object={c.group} />)}
      </Stage>
    </AbsoluteFill>
  );
};

// ---------- L28 : غروب — شيء غريب (f1088–1151) ----------
export const SunsetWeird: React.FC = () => {
  const f = useCurrentFrame();
  const fast = f < 26;
  const camX = fast ? -28 + f * 1.9 : 21 - (f - 26) * 0.12;
  const shocked = f >= 46;

  const world = useMemo(() => {
    const g = new THREE.Group();
    g.add(makeBallastGround(140, 140, 0));
    g.add(makeTrack(140, 3.4, 0.05));
    const wall = makeCanyonWall(14, 30, 120, '#b5592c', '#8e2418', '#e0a08c', true);
    wall.position.set(-13, 12, -30);
    g.add(wall);
    [-16, -4, 8].forEach((x, i) => {
      const cart = makeCalendarCart();
      cart.position.set(x, 0, -6 - i * 2);
      g.add(cart);
    });
    const flag = makeBlueFlag();
    flag.position.set(10, 0, -10);
    g.add(flag);
    return g;
  }, []);

  const eng = useMemo(() => buildCharacter({jacket: '#20b0a0', hat: 'cap', face: 'normal', scale: 1.8}), []);
  eng.setFace(shocked ? 'shocked' : 'normal');
  eng.walk(f * 0.24);
  eng.group.position.set(1.4, 4.2, 2);

  return (
    <AbsoluteFill style={{filter: fast ? 'blur(10px)' : 'none'}}>
      <Stage
        cam={[camX, 5, 12]}
        look={[camX * 0.35, 3.6, -10]}
        fov={57}
        sky={['#d8642c', '#e8944c', '#f0b070']}
        world={world}
      >
        <primitive object={eng.group} />
      </Stage>
    </AbsoluteFill>
  );
};

// ---------- L29–L31 : الفجوات والعملة + الرافعة (f1152–1343) ----------
export const GapsCoin: React.FC = () => {
  const f = useCurrentFrame();
  const gap = Math.max(0.55, 3.4 - f * 0.045);
  const gold = f >= 52;
  const railColor = gold ? '#e9c25c' : '#b71fa0';
  const emissive = gold ? '#8a6a1c' : '#5c1050';
  const coinDrop = f >= 84 && f < 88;
  const tiltUp = f >= 144 ? -(f - 144) * 0.34 : 0;
  const bossReveal = f >= 185;

  const world = useMemo(() => {
    const g = new THREE.Group();
    g.add(makeBallastGround(90, 90, -0.1));
    const wall = makeCanyonWall(12, 26, 80, '#d8742c', '#b5592c', '#e8a04c', true);
    wall.position.set(-11, 11, -22);
    g.add(wall);
    const cart = makeCalendarCart();
    cart.position.set(-4.6, 0, -6);
    g.add(cart);
    const flag = makeBlueFlag();
    flag.position.set(5.4, 0, -7);
    g.add(flag);
    // الفرجار
    const caliper = new THREE.Group();
    const bar = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.34, 0.5), new THREE.MeshToonMaterial({color: '#c9a06a'}));
    caliper.add(bar);
    for (let i = 0; i < 11; i++) {
      const tick = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.16, 0.5), new THREE.MeshToonMaterial({color: '#171717'}));
      tick.position.set(-2.9 + i * 0.58, 0.22, 0);
      caliper.add(tick);
    }
    const jawL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2, 0.34), new THREE.MeshToonMaterial({color: '#b8907c'}));
    jawL.position.set(-0.62, 1.05, 0);
    jawL.rotation.z = 0.22;
    const jawR = jawL.clone();
    jawR.position.x = 0.62;
    jawR.rotation.z = -0.22;
    caliper.add(jawL, jawR);
    caliper.position.set(0, 1.9, 0.6);
    g.add(caliper);
    return g;
  }, []);

  const rails = useMemo(() => {
    const g = new THREE.Group();
    [-1, 1].forEach((s) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.72, 2.4), new THREE.MeshToonMaterial({color: railColor, emissive, emissiveIntensity: 0.55}));
      rail.position.x = s * 3.9;
      rail.name = s < 0 ? 'railL' : 'railR';
      g.add(rail);
    });
    return g;
  }, [railColor, emissive]);
  rails.children.forEach((c) => {
    c.position.x = (c.name === 'railL' ? -1 : 1) * (gap / 2 + 3.9);
  });

  const coin = useMemo(() => {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.1, 20), new THREE.MeshToonMaterial({color: '#c8c8d4'}));
    c.rotation.set(0, 0.4, Math.PI / 2);
    return c;
  }, []);
  coin.position.set(0, coinDrop ? 5.2 - (f - 84) * 1.35 : f < 84 ? -30 : 1.15, 0.2);

  const craneArm = useMemo(() => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.6, 19, 0.6), new THREE.MeshToonMaterial({color: '#2c2c34'}));
    arm.rotation.z = -0.28;
    return arm;
  }, []);
  craneArm.position.set(1.2, 9 + (f >= 123 ? Math.min(0, -(f - 123) * 0.06) : -22), -2);

  const boss = useMemo(() => buildCharacter({jacket: '#e8a72c', hat: 'bowler', face: 'normal', scale: 1.7}), []);
  boss.group.position.set(1.2, 12.4, -1);
  boss.group.visible = bossReveal;
  const eng = useMemo(() => buildCharacter({jacket: '#20b0a0', hat: 'cap', face: 'normal', scale: 1.3}), []);
  eng.group.position.set(-1.8, 12, -1);
  eng.group.visible = bossReveal;

  return (
    <AbsoluteFill style={{filter: f >= 144 && f < 168 ? 'blur(8px)' : 'none'}}>
      <Stage
        cam={[0, 2 + tiltUp, 7]}
        look={[0, 1.6 + tiltUp * 0.85, -2]}
        fov={56}
        sky={['#c8541c', '#e8944c', '#f0b070']}
        world={world}
      >
        <primitive object={rails} />
        <primitive object={coin} />
        <primitive object={craneArm} />
        <primitive object={boss.group} />
        <primitive object={eng.group} />
      </Stage>
    </AbsoluteFill>
  );
};

// ---------- L32 : حوار الرضا (f1344–1439) ----------
export const BossPleased: React.FC = () => {
  const f = useCurrentFrame();
  const talk = f >= 77 && f < 86;

  const world = useMemo(() => {
    const g = new THREE.Group();
    g.add(makeBallastGround(80, 80, 0));
    g.add(makeTrack(80, 3.4, 0.05));
    const gapRail = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.2, 2.6), new THREE.MeshToonMaterial({color: '#b71fa0', emissive: '#5c1050', emissiveIntensity: 0.5}));
    gapRail.position.set(0, 0.6, -1.6);
    g.add(gapRail);
    const wall = makeCanyonWall(12, 28, 70, '#b5301c', '#8e2418', '#d87464', true);
    wall.position.set(12, 11, -14);
    g.add(wall);
    return g;
  }, []);

  const eng = useMemo(() => buildCharacter({jacket: '#20b0a0', hat: 'cap', face: 'normal', scale: 1.75}), []);
  eng.group.position.set(-2.2, 4.5, 0);
  const boss = useMemo(() => buildCharacter({jacket: '#e8a72c', hat: 'bowler', face: 'happy', scale: 1.85}), []);
  boss.setFace(talk ? 'grin' : 'happy');
  boss.group.position.set(2, 4.5, -0.6);

  return (
    <Stage
      cam={[0, 5.2, 9]}
      look={[0, 4.7, -2]}
      fov={53}
      sky={['#d8642c', '#e8944c', '#f0b070']}
      world={world}
    >
      <primitive object={eng.group} />
      <primitive object={boss.group} />
    </Stage>
  );
};

// ---------- L33 : السكّة المثالية (f1440–1583) ----------
export const PerfectRR: React.FC = () => {
  const f = useCurrentFrame();
  const z = f < 88 ? 26 - f * 0.12 : 15.4 + (f - 88) * 0.16;
  const glow = f >= 88;
  const hot = f >= 116;
  const railColor = !glow ? '#b8bcc8' : hot ? '#e9c25c' : '#b71fa0';
  const emissive = !glow ? '#000000' : hot ? '#8a6a1c' : '#5c1050';

  const world = useMemo(() => {
    const g = new THREE.Group();
    const deck = new THREE.Mesh(new THREE.PlaneGeometry(44, 170), new THREE.MeshToonMaterial({color: '#8a4a5c', map: woodTex('#8a5a5c', '#5b3447')}));
    deck.rotation.x = -Math.PI / 2;
    deck.position.set(0, 0, -20);
    g.add(deck);
    g.add(makeBallastGround(130, 170, -0.14));
    const tieGeo = new THREE.PlaneGeometry(5.4, 0.8);
    const tieMat = new THREE.MeshToonMaterial({color: '#4a2c34'});
    for (let i = 0; i < 34; i++) {
      const tie = new THREE.Mesh(tieGeo, tieMat);
      tie.rotation.x = -Math.PI / 2;
      tie.position.set(0, 0.12, 12 - i * 2.6);
      g.add(tie);
    }
    [-1, 1].map((s) =>
      [0, 1, 2, 3, 4].forEach((i) => {
        const post = new THREE.Group();
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 4.8, 8), new THREE.MeshToonMaterial({color: '#171717'}));
        pole.position.y = 2.4;
        const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.4, 10, 8), new THREE.MeshBasicMaterial({color: '#ffd977' }));
        lamp.position.y = 5;
        post.add(pole, lamp);
        post.position.set(s * 6.4, 0, 4 - i * 13);
        g.add(post);
      })
    );
    const chair = makeDeckChair();
    chair.position.set(0, 0, -28);
    chair.scale.setScalar(0.9);
    g.add(chair);
    const mesas: [number, number, number][] = [[-24, 3, -55], [24, 4, -60], [-12, 2.4, -70], [14, 3.4, -72]];
    mesas.forEach((p, i) => {
      g.add(makeMesa(16 + i * 3, 4 + (i % 2) * 2, 10));
      g.children[g.children.length - 1].position.set(...p);
    });
    return g;
  }, []);

  const rails = useMemo(() => {
    const g = new THREE.Group();
    [-1.75, 1.75].forEach((x) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.3, 100), new THREE.MeshToonMaterial({color: '#b8bcc8'}));
      rail.position.set(x, 0.3, -22);
      rail.name = `rail${x}`;
      g.add(rail);
    });
    return g;
  }, []);
  rails.children.forEach((c) => {
    const m = (c as THREE.Mesh).material as THREE.MeshToonMaterial;
    m.color.set(railColor);
    m.emissive.set(emissive);
    m.emissiveIntensity = glow ? 0.6 : 0;
  });

  const glint = useMemo(() => makeRailGlint(60), []);

  return (
    <Stage
      cam={[0, 3.6, z]}
      look={[0, 2.2, -46]}
      fov={58}
      sky={['#4b73c5', '#6ea3e8', '#b2bbde']}
      world={world}
    >
      <primitive object={rails} />
      {glow && (
        <mesh position={[0, 0.34, -18]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[7.5, 90]} />
          <meshBasicMaterial color={hot ? '#e9c25c' : '#b71fa0'} transparent opacity={0.22} />
        </mesh>
      )}
      <Fx systems={[glint]} />
    </Stage>
  );
};

// ---------- L34 : كرسي الشاطئ (f1584–1631) ----------
export const DeckChairScene: React.FC = () => {
  const f = useCurrentFrame();
  const push = 9 - f * 0.075;
  const shocked = f >= 34;

  const world = useMemo(() => {
    const g = new THREE.Group();
    const deck = new THREE.Mesh(new THREE.PlaneGeometry(40, 120), new THREE.MeshToonMaterial({color: '#8a4a5c', map: woodTex('#8a5a5c', '#5b3447')}));
    deck.rotation.x = -Math.PI / 2;
    deck.position.set(0, 0, -8);
    g.add(deck);
    const chair = makeDeckChair();
    chair.position.set(0, 0, -1.6);
    chair.name = 'chair';
    g.add(chair);
    return g;
  }, []);

  const chairObj = world.getObjectByName('chair')!;
  chairObj.rotation.y = f > 42 ? (f - 42) * 0.02 : 0;
  chairObj.rotation.z = f > 42 ? -(f - 42) * 0.015 : 0;

  const rails = useMemo(() => {
    const g = new THREE.Group();
    [-1.75, 1.75].forEach((x) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.3, 90), new THREE.MeshToonMaterial({color: '#b71fa0', emissive: '#5c1050', emissiveIntensity: 0.5}));
      rail.position.set(x, 0.3, -20);
      g.add(rail);
    });
    return g;
  }, []);

  const lounger = useMemo(() => buildCharacter({jacket: '#171717', hat: 'tophat', face: 'grin', scale: 1.25}), []);
  lounger.setFace(shocked ? 'shocked' : 'grin');
  lounger.group.position.set(0, 1.6, -1.2);
  lounger.group.rotation.x = -0.55;

  return (
    <Stage
      cam={[0, 3.4, push]}
      look={[0, 2.4, -2.4]}
      fov={54}
      sky={['#4b73c5', '#86aae0', '#c8a0b8']}
      world={world}
    >
      <primitive object={rails} />
      <primitive object={lounger.group} />
    </Stage>
  );
};

// ---------- L35–L37 : أحرّ يوم + الاندفاع + التعرّض (f1632–1783) ----------
export const HottestDay: React.FC = () => {
  const f = useCurrentFrame();
  const closeUp = f < 64;
  const runPhase = f >= 64 && f < 104;
  const wide = f >= 104;
  const shocked = f >= 56;
  const camZ = runPhase ? 20 - (f - 64) * 1.4 : wide ? 24 - (f - 104) * 0.12 : 8.2;

  const world = useMemo(() => {
    const g = new THREE.Group();
    g.add(makeBallastGround(90, 160, 0));
    g.add(makeTrack(160, 3.6, 0.05));
    const wall = makeCanyonWall(12, 30, 120, '#ce5f3e', '#b5301c', '#e0a08c', true);
    wall.position.set(12, 12, -30);
    g.add(wall);
    [-1.8, 1.8].forEach((x, i) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.32, 120), new THREE.MeshToonMaterial({color: i ? '#e9c25c' : '#b71fa0', emissive: i ? '#8a6a1c' : '#5c1050', emissiveIntensity: 0.55}));
      rail.position.set(x, 0.32, -12);
      g.add(rail);
    });
    return g;
  }, []);

  const eng = useMemo(() => buildCharacter({jacket: '#20b0a0', hat: 'cap', face: 'happy', scale: 1.9}), []);
  eng.setFace(shocked ? 'shocked' : f < 56 ? 'happy' : 'worry');
  eng.walk(f * 0.22);
  eng.group.position.set(0.4, wide ? 4 : 4.4, 0);

  const glint = useMemo(() => makeRailGlint(70), []);

  return (
    <AbsoluteFill style={{filter: runPhase ? 'blur(7px)' : 'none'}}>
      <Stage
        cam={closeUp ? [0, 5.6, camZ] : [0, wide ? 5.4 : 2.2, camZ]}
        look={closeUp ? [0, 5.1, -1] : [0, wide ? 4.2 : 1.4, -30]}
        fov={closeUp ? 50 : 58}
        sky={['#d8642c', '#e8944c', '#f0a86a']}
        world={world}
      >
        <primitive object={eng.group} />
        {runPhase && <Fx systems={[glint]} />}
      </Stage>
    </AbsoluteFill>
  );
};

// ---------- L38 : جسر الغروب (f1784–1847) ----------
export const SunsetBridge: React.FC = () => {
  const f = useCurrentFrame();
  const aerial = f < 36;
  const camPos: [number, number, number] = aerial
    ? [20 - f * 0.3, 17 - f * 0.1, 30 - f * 0.25]
    : [3.2 - (f - 36) * 0.05, 8.2 - (f - 36) * 0.06, 17 - (f - 36) * 0.28];
  const look: [number, number, number] = aerial ? [-4, 6, -14] : [0, 6, -40];
  const trainZ = aerial ? -34 + f * 0.12 : -32 + (f - 36) * 0.62;

  const world = useMemo(() => {
    const g = new THREE.Group();
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(240, 200), new THREE.MeshToonMaterial({color: '#a25464', map: rockTex('#a25464', '#7a2c4c', '#c88494', true)}));
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -8, -20);
    g.add(floor);
    const deck = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.6, 130), new THREE.MeshToonMaterial({color: '#4a2c34'}));
    deck.position.set(0, 6, -20);
    g.add(deck);
    for (let i = 0; i < 22; i++) {
      const tie = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.16, 1), new THREE.MeshToonMaterial({color: '#6a3c44'}));
      tie.position.set(0, 6.42, 22 - i * 5.6);
      g.add(tie);
    }
    [-1, 1].forEach((s) => {
      for (let i = 0; i < 11; i++) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.4, 7.4, 0.4), new THREE.MeshToonMaterial({color: '#3a2430'}));
        post.position.set(s * 3, 2.2, 20 - i * 11);
        g.add(post);
      }
      for (let k = 0; k < 3; k++) {
        const arch = new THREE.Mesh(new THREE.TorusGeometry(6.2, 0.3, 8, 18, Math.PI), new THREE.MeshToonMaterial({color: '#3a2430'}));
        arch.position.set(s * 3.05, 6, 8 - k * 22);
        g.add(arch);
      }
    });
    return g;
  }, []);

  const train = useMemo(() => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.9, 8.6), new THREE.MeshToonMaterial({color: '#2c1c22'}));
    const boiler = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 1.7, 12), new THREE.MeshToonMaterial({color: '#2c1c22'}));
    boiler.position.set(0, 1.35, -2.6);
    const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.9, 8), new THREE.MeshToonMaterial({color: '#2c1c22'}));
    stack.position.set(0, 2.4, -2.6);
    g.add(body, boiler, stack);
    return g;
  }, []);
  train.position.set(0, 7.6, trainZ);

  const smoke = useMemo(() => makeSmoke(0, 11, -2, {dark: true, rise: 7, spread: 1.6}), []);

  return (
    <Stage cam={camPos} look={look} fov={58} sky={['#c86a8c', '#e8946c', '#8a4a8c']} world={world}>
      <primitive object={train} />
      <Fx systems={[smoke]} />
    </Stage>
  );
};

// ---------- L39 : السكّة تنثني كالثعبان (f1848–1927) ----------
export const Serpent: React.FC = () => {
  const f = useCurrentFrame();
  const amp = 0.25 + f * 0.032;
  const tip = f > 68 ? Math.min(30, (f - 68) * 1.1) : 0;

  const segs = useMemo(() => {
    const g = new THREE.Group();
    for (let i = 0; i < 26; i++) {
      const seg = new THREE.Group();
      const tie = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.24, 1.1), new THREE.MeshToonMaterial({color: '#5b3437'}));
      seg.add(tie);
      [-1.75, 1.75].forEach((x) => {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.26, 2.35), new THREE.MeshToonMaterial({color: '#e9c25c', emissive: '#8a6a1c', emissiveIntensity: 0.5}));
        rail.position.set(x, 0.26, 0);
        seg.add(rail);
      });
      seg.position.set(0, 0, 14 - i * 2.6);
      seg.name = `seg${i}`;
      g.add(seg);
    }
    return g;
  }, []);

  segs.children.forEach((seg) => {
    const i = Number(seg.name.slice(3));
    seg.position.x = Math.sin(i * 0.42 + f * 0.1) * amp;
    seg.position.y = 0.3 + Math.abs(Math.sin(i * 0.42 + f * 0.1)) * amp * 0.42;
  });

  const world = useMemo(() => {
    const g = new THREE.Group();
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(120, 160), new THREE.MeshToonMaterial({color: '#b08494', map: rockTex('#b08494', '#8e2418', '#d8a0a8', true)}));
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -3.4, -20);
    g.add(floor);
    return g;
  }, []);

  const train = useMemo(() => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.9, 9), new THREE.MeshToonMaterial({color: '#2c1c22'}));
    const boiler = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 1.6, 12), new THREE.MeshToonMaterial({color: '#2c1c22'}));
    boiler.position.set(0, 1.4, -2.8);
    g.add(body, boiler);
    return g;
  }, []);
  train.position.set(Math.sin(6 * 0.42 + f * 0.1) * amp, 2.4, -2);
  train.rotation.z = (-tip * Math.PI) / 180;

  const smoke = useMemo(() => makeSmoke(0, 5.6, -4.8, {dark: true, rise: 8}), []);
  const sparks = useMemo(() => makeSparks(0, 1.2, -2, 12), []);

  return (
    <Stage cam={[0.4, 7.4, 22]} look={[0, 5.4, -18]} fov={57} sky={['#e8c0a0', '#d8a08c', '#c89a92']} world={world}>
      <primitive object={segs} />
      <primitive object={train} />
      <Fx systems={[smoke, sparks]} />
    </Stage>
  );
};

// ---------- L40 : الانفجار والنهاية (f1928–1954) ----------
export const Explosion: React.FC = () => {
  const f = useCurrentFrame();
  const flash = f < 3;

  const world = useMemo(() => {
    const g = new THREE.Group();
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshToonMaterial({color: '#b08494', map: rockTex('#b08494', '#8e2418', '#d8a0a8', true)}));
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, -8);
    g.add(floor);
    g.add(makeDeck(22, 16));
    g.children[g.children.length - 1].position.set(0, 0, 8);
    return g;
  }, []);

  const eng = useMemo(() => buildCharacter({jacket: '#20b0a0', hat: 'cap', face: 'shocked', scale: 1.5}), []);
  eng.group.position.set(-2.2, 3.4, 6);
  eng.group.visible = f >= 12;
  const boss = useMemo(() => buildCharacter({jacket: '#e8a72c', hat: 'bowler', face: 'shocked', scale: 1.55}), []);
  boss.group.position.set(2, 3.4, 6);
  boss.group.visible = f >= 12;

  const fire = useMemo(() => makeFireball(0, 9, -14), []);
  fire.update(f);
  const mush = useMemo(() => makeMushroom(0, 6, -14), []);
  mush.update(Math.max(0, f - 12));

  return (
    <Stage
      cam={[0, 6, 22]}
      look={[0, 8, -12]}
      fov={58}
      sky={flash ? ['#ffffff', '#ffffff', '#ffffff'] : ['#e8b48a', '#e8944c', '#d8642c']}
      world={world}
    >
      {!flash && <primitive object={fire.group} />}
      {f >= 12 && <primitive object={mush.group} />}
      <primitive object={eng.group} />
      <primitive object={boss.group} />
    </Stage>
  );
};
