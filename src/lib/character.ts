import * as THREE from 'three';
import {faceTex} from './textures';

// ============================================================
// character.ts — شخصيات 3D مسطّحة الحواف (toon + outline):
// رأس كروي أبيض بوجه كرتوني، جسم بيضاوي ملوّن، أطراف عصوية،
// قبعات مميّزة (نفس الكود البصري من التحليل)
// ============================================================

export type Hat = 'cap' | 'bowler' | 'tophat' | 'flat' | 'conductor' | 'none';
export type Face = 'normal' | 'happy' | 'grin' | 'angry' | 'shocked' | 'worry';

export interface CharacterOpts {
  jacket?: string;
  hat?: Hat;
  face?: Face;
  glasses?: boolean;
  purple?: boolean;
  scale?: number;
}

const INK = '#171717';

// غلاف الحد الأسود (outline shell)
const outline = (mesh: THREE.Mesh, thickness = 0.06) => {
  const o = mesh.clone();
  const m = new THREE.MeshBasicMaterial({color: INK, side: THREE.BackSide});
  o.material = m;
  o.scale.multiplyScalar(1 + thickness);
  return o;
};

const toon = (color: string) => new THREE.MeshToonMaterial({color});

export interface Character {
  group: THREE.Group;
  head: THREE.Group;
  facePlane: THREE.Mesh;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  setFace: (f: Face, glasses?: boolean) => void;
  setPurple: (p: boolean) => void;
  walk: (phase: number, speed?: number) => void;
  setOpacity: (o: number) => void;
}

export const buildCharacter = (opts: CharacterOpts = {}): Character => {
  const {
    jacket = '#20b0a0', hat = 'cap', face = 'normal',
    glasses = false, purple = false, scale = 1,
  } = opts;

  const group = new THREE.Group();
  group.scale.setScalar(scale);

  // ---- الجسم ----
  const bodyGeo = new THREE.SphereGeometry(1, 22, 18);
  const body = new THREE.Mesh(bodyGeo, toon(jacket));
  body.scale.set(1.12, 1.38, 0.88);
  body.position.y = -2.15;
  group.add(outline(body, 0.05));
  group.add(body);

  // ربطة حمراء + خط أزرق
  const tie = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.85, 4), toon('#c4422e'));
  tie.position.set(0, -1.55, 0.92);
  tie.rotation.x = Math.PI;
  group.add(tie);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.3, 0.1), toon(INK));
  stripe.position.set(0, -2.3, 0.88);
  group.add(stripe);

  // ---- الأطراف ----
  const limbGeo = new THREE.CylinderGeometry(0.115, 0.115, 1.75, 10);
  const mkArm = (side: number) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 1.28, -1.55, 0);
    const arm = new THREE.Mesh(limbGeo, toon(INK));
    arm.position.y = -0.85;
    pivot.add(arm);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.19, 10, 8), toon(INK));
    hand.position.y = -1.75;
    pivot.add(hand);
    return pivot;
  };
  const leftArm = mkArm(-1);
  const rightArm = mkArm(1);
  group.add(leftArm, rightArm);

  const mkLeg = (side: number) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.42, -3.35, 0);
    const leg = new THREE.Mesh(limbGeo, toon(INK));
    leg.position.y = -0.85;
    pivot.add(leg);
    const shoe = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 8), toon(INK));
    shoe.scale.set(1, 0.62, 1.5);
    shoe.position.set(0, -1.8, 0.18);
    pivot.add(shoe);
    return pivot;
  };
  const leftLeg = mkLeg(-1);
  const rightLeg = mkLeg(1);
  group.add(leftLeg, rightLeg);

  // ---- الرأس ----
  const head = new THREE.Group();
  head.position.y = 0.15;
  const headMat = toon(purple ? '#8b2fd6' : '#ffffff');
  const skull = new THREE.Mesh(new THREE.SphereGeometry(1.12, 26, 20), headMat);
  skull.scale.set(1, 1.06, 0.9);
  head.add(outline(skull, 0.055));
  head.add(skull);
  group.add(head);

  // الوجه (مستوٍ بخامة قابلة للتبديل)
  const faceMaterial = new THREE.MeshBasicMaterial({
    map: faceTex(face, glasses),
    transparent: true,
  });
  const facePlane = new THREE.Mesh(new THREE.PlaneGeometry(1.95, 1.95), faceMaterial);
  facePlane.position.set(0, -0.02, 1.02);
  head.add(facePlane);

  // ---- القبعات ----
  const addHat = (h: Hat) => {
    if (h === 'none') return;
    const hg = new THREE.Group();
    if (h === 'cap') {
      const dome = new THREE.Mesh(new THREE.SphereGeometry(1.16, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.52), toon('#5c85d2'));
      dome.position.y = 0.62;
      hg.add(outline(dome, 0.05)); hg.add(dome);
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(1.22, 1.22, 0.1, 22), toon('#5c85d2'));
      brim.position.y = 0.62;
      hg.add(outline(brim, 0.06)); hg.add(brim);
      for (let i = -2; i <= 2; i++) {
        const s = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 1.5), toon('#ffffff'));
        s.position.set(i * 0.34, 1.12, 0.2);
        s.rotation.x = -0.25;
        hg.add(s);
      }
      const btn = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), toon('#5c85d2'));
      btn.position.y = 1.32;
      hg.add(btn);
    } else if (h === 'bowler') {
      const dome = new THREE.Mesh(new THREE.SphereGeometry(1.05, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.56), toon(INK));
      dome.position.y = 0.72;
      hg.add(dome);
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(1.42, 1.42, 0.1, 24), toon(INK));
      brim.position.y = 0.72;
      hg.add(outline(brim, 0.05)); hg.add(brim);
    } else if (h === 'tophat') {
      const top = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 1.5, 22), toon(INK));
      top.position.y = 1.62;
      hg.add(outline(top, 0.05)); hg.add(top);
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.88, 0.88, 0.28, 22), toon('#e8b23a'));
      band.position.y = 1.05;
      hg.add(band);
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.1, 24), toon(INK));
      brim.position.y = 0.86;
      hg.add(outline(brim, 0.05)); hg.add(brim);
    } else if (h === 'flat') {
      const dome = new THREE.Mesh(new THREE.SphereGeometry(1.14, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.4), toon('#7a6a8a'));
      dome.scale.y = 0.62;
      dome.position.y = 0.72;
      hg.add(outline(dome, 0.05)); hg.add(dome);
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(1.32, 1.32, 0.09, 22), toon('#7a6a8a'));
      brim.position.y = 0.66;
      brim.position.z = 0.34;
      hg.add(outline(brim, 0.06)); hg.add(brim);
    } else if (h === 'conductor') {
      const dome = new THREE.Mesh(new THREE.CylinderGeometry(1.02, 1.02, 0.72, 22), toon('#252447'));
      dome.position.y = 1.12;
      hg.add(outline(dome, 0.05)); hg.add(dome);
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(1.36, 1.36, 0.1, 22), toon('#252447'));
      brim.position.y = 0.76;
      hg.add(outline(brim, 0.05)); hg.add(brim);
      const badge = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.24, 0.08), toon('#e8b23a'));
      badge.position.set(0, 1.18, 1.02);
      hg.add(badge);
    }
    head.add(hg);
  };
  addHat(hat);

  const setFace = (f: Face, gl = glasses) => {
    const mat = facePlane.material as THREE.MeshBasicMaterial;
    mat.map?.dispose();
    mat.map = faceTex(f, gl);
    mat.needsUpdate = true;
  };

  const setPurple = (p: boolean) => {
    (skull.material as THREE.MeshToonMaterial).color.set(p ? '#8b2fd6' : '#ffffff');
  };

  const walk = (phase: number, amount = 1) => {
    const s = Math.sin(phase) * amount;
    leftLeg.rotation.x = s * 0.55;
    rightLeg.rotation.x = -s * 0.55;
    leftArm.rotation.x = -s * 0.5;
    rightArm.rotation.x = s * 0.5;
    group.position.y += 0; // bob يُضاف من الخارج
  };

  const setOpacity = (o: number) => {
    group.traverse((c) => {
      const m = (c as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
      if (!m) return;
      const arr = Array.isArray(m) ? m : [m];
      arr.forEach((mm) => {
        mm.transparent = true;
        mm.opacity = o;
      });
    });
  };

  return {group, head, facePlane, leftLeg, rightLeg, leftArm, rightArm, setFace, setPurple, walk, setOpacity};
};
