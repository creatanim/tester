import * as THREE from 'three';
import {smokeSprite, glowSprite, fireballSprite} from './textures';

// ============================================================
// fx.ts — مؤثرات: دخان متصاعد، شرر، توهّج شمسي، وهج حراري،
// كرة نار — كلٌّ يحدّث موضعه حسب الإطار
// ============================================================

export interface FxSystem {
  group: THREE.Group;
  update: (frame: number) => void;
}

// عمود دخان
export const makeSmoke = (
  x: number, y: number, z: number,
  opts: {count?: number; dark?: boolean; spread?: number; rise?: number; scale?: number} = {}
): FxSystem => {
  const {count = 9, dark = false, spread = 1.2, rise = 14, scale = 1} = opts;
  const group = new THREE.Group();
  group.position.set(x, y, z);
  const mat = new THREE.SpriteMaterial({
    map: smokeSprite(dark ? '#4a3230' : '#d9d2cf'),
    transparent: true,
    depthWrite: false,
  });
  const sprites: THREE.Sprite[] = [];
  for (let i = 0; i < count; i++) {
    const s = new THREE.Sprite(mat.clone());
    sprites.push(s);
    group.add(s);
  }
  return {
    group,
    update(frame) {
      sprites.forEach((s, i) => {
        const t = ((frame * 0.016 + i / count) % 1);
        s.position.set(
          Math.sin((frame + i * 40) * 0.02) * spread * (0.5 + i * 0.12),
          t * rise,
          Math.cos((frame + i * 33) * 0.017) * spread * 0.5
        );
        const sc = (0.9 + t * 2.6) * scale;
        s.scale.set(sc * 1.6, sc * 1.6, 1);
        (s.material as THREE.SpriteMaterial).opacity = (1 - t) * 0.75;
      });
    },
  };
};

// بخار الغضب (سخاري على جانبَي الرأس)
export const makeAngerSteam = (parent: THREE.Object3D, x: number, y: number, z: number): FxSystem => {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  const mat = new THREE.SpriteMaterial({map: smokeSprite('#ffffff'), transparent: true, depthWrite: false});
  const sprites: THREE.Sprite[] = [];
  for (let i = 0; i < 6; i++) {
    const s = new THREE.Sprite(mat.clone());
    sprites.push(s);
    group.add(s);
  }
  parent.add(group);
  return {
    group,
    update(frame) {
      sprites.forEach((s, i) => {
        const side = i < 3 ? -1 : 1;
        const t = ((frame * 0.03 + (i % 3) / 3) % 1);
        s.position.set(side * (1.2 + t * 1.1), t * 1.7 - 0.2, 0.3);
        const sc = 0.65 + t * 0.75;
        s.scale.set(sc, sc, 1);
        (s.material as THREE.SpriteMaterial).opacity = 0.9 - t * 0.75;
      });
    },
  };
};

// شرر
export const makeSparks = (x: number, y: number, z: number, count = 16): FxSystem => {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  const mat = new THREE.SpriteMaterial({map: glowSprite('#ffb347'), transparent: true, depthWrite: false});
  const sprites: THREE.Sprite[] = [];
  for (let i = 0; i < count; i++) {
    const s = new THREE.Sprite(mat.clone());
    sprites.push(s);
    group.add(s);
  }
  return {
    group,
    update(frame) {
      sprites.forEach((s, i) => {
        const t = ((frame * 0.045 + i * 0.11) % 1);
        s.position.set(
          (i % 5 - 2) * 1.1 + t * (i % 3 - 1) * 2.2,
          t * 5 - (i % 4) * 0.4,
          ((i * 7) % 5 - 2) * 0.9
        );
        const sc = (1 - t) * 0.55;
        s.scale.set(sc, sc, 1);
        (s.material as THREE.SpriteMaterial).opacity = 1 - t;
      });
    },
  };
};

// وهج شمسي/وميض ضوئي
export const makeGlow = (x: number, y: number, z: number, size = 6, color = '#ffd977') => {
  const group = new THREE.Group();
  const s = new THREE.Sprite(new THREE.SpriteMaterial({map: glowSprite(color), transparent: true, depthWrite: false, opacity: 0.85}));
  s.position.set(x, y, z);
  s.scale.set(size, size, 1);
  group.add(s);
  return {group, sprite: s};
};

// وميض ضوئي يركض على السكة (يحدَّث محركه)
export const makeRailGlint = (length = 60): FxSystem => {
  const group = new THREE.Group();
  const mat = new THREE.SpriteMaterial({map: glowSprite('#ffffff'), transparent: true, depthWrite: false});
  const sprites: THREE.Sprite[] = [];
  for (let i = 0; i < 4; i++) {
    const s = new THREE.Sprite(mat.clone());
    sprites.push(s);
    group.add(s);
  }
  return {
    group,
    update(frame) {
      sprites.forEach((s, i) => {
        const z = ((frame * 1.6 + i * 14) % length) - length / 2;
        s.position.set(0, 0.5, z);
        s.scale.set(2.2, 0.8, 1);
        (s.material as THREE.SpriteMaterial).opacity = 0.55 + Math.sin(frame * 0.2 + i) * 0.25;
      });
    },
  };
};

// كرة نار (انفجار)
export const makeFireball = (x: number, y: number, z: number): FxSystem => {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  const tex = fireballSprite();
  const sprites: THREE.Sprite[] = [];
  for (let i = 0; i < 14; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({map: tex, transparent: true, depthWrite: false}));
    sprites.push(s);
    group.add(s);
  }
  return {
    group,
    update(frame) {
      const grow = Math.min(1, frame / 10);
      sprites.forEach((s, i) => {
        const a = (i / 14) * Math.PI * 2;
        const r = grow * (2 + (i % 4) * 1.6);
        s.position.set(Math.cos(a) * r, Math.sin(a) * r * 0.8 + grow * 2, (i % 3) * 1.4);
        const sc = (3.5 + (i % 5)) * grow;
        s.scale.set(sc, sc, 1);
        (s.material as THREE.SpriteMaterial).opacity = Math.max(0, 1 - Math.max(0, frame - 14) * 0.035);
      });
    },
  };
};

// سحابة الفطر (بعد الانفجار)
export const makeMushroom = (x: number, y: number, z: number): FxSystem => {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  const mat = new THREE.SpriteMaterial({map: smokeSprite('#5a3428'), transparent: true, depthWrite: false});
  const cap = new THREE.Sprite(mat.clone());
  cap.scale.set(16, 9, 1);
  cap.position.y = 8;
  const stem = new THREE.Sprite(mat.clone());
  stem.scale.set(5, 12, 1);
  stem.position.y = 1;
  group.add(cap, stem);
  return {
    group,
    update(frame) {
      const s = 1 + Math.min(0.4, frame * 0.01);
      cap.scale.set(16 * s, 9 * s, 1);
      stem.scale.set(5 * s, 12 * s, 1);
    },
  };
};
