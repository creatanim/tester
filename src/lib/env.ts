import * as THREE from 'three';
import {
  skyTex, rockTex, ballastTex, woodTex, velvetTex, brickTex,
  signTex, calendarTex, badgeTex, stripeTex,
} from './textures';

// ============================================================
// env.ts — بُناة البيئات ثلاثية الأبعاد (كلٌّ يعيد Group)
// ============================================================

const toon = (color: string, map?: THREE.Texture) =>
  new THREE.MeshToonMaterial({color, map});
const basic = (color: string, map?: THREE.Texture, opacity = 1) =>
  new THREE.MeshBasicMaterial({color, map, transparent: opacity < 1, opacity});

// قبة سماء متدرجة
export const makeSky = (top: string, mid: string, bottom: string, size = 220) => {
  const g = new THREE.Group();
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(size, 24, 16),
    basic('#ffffff', skyTex(top, mid, bottom))
  );
  sky.material.side = THREE.BackSide;
  g.add(sky);
  return g;
};

// سحابات مسطّحة (لوحات)
export const makeClouds = (y = 26, spread = 90) => {
  const g = new THREE.Group();
  const positions: [number, number][] = [[-spread, 0], [spread * 0.4, -spread * 0.3], [spread, spread * 0.2], [-spread * 0.5, spread * 0.4], [0, -spread * 0.6]];
  positions.forEach(([x, z], i) => {
    const c = new THREE.Mesh(new THREE.SphereGeometry(6 + (i % 3) * 2, 12, 8), basic('#ffffff', undefined, 0.88));
    c.scale.set(2.2, 0.55, 1.1);
    c.position.set(x, y + (i % 2) * 3, z - 60);
    g.add(c);
  });
  return g;
};

// جدار أخدود مخطط
export const makeCanyonWall = (
  w: number, h: number, d: number,
  base: string, dark: string, light: string, horizontal = false
) => {
  const geo = new THREE.BoxGeometry(w, h, d, 8, 8, 8);
  // تموّج طفيف للرؤوس (شكل صخري)
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const n = Math.sin(x * 0.23 + z * 0.31) * 0.55 + Math.sin(y * 0.17 + x * 0.1) * 0.45;
    pos.setXYZ(i, x + n * 0.5, y + n * 0.3, z + n * 0.5);
  }
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, toon(base, rockTex(base, dark, light, horizontal)));
};

// أرضية حصى
export const makeBallastGround = (w: number, d: number, y = 0) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d, 1, 1), toon('#6b4a3c', ballastTex()));
  m.rotation.x = -Math.PI / 2;
  m.position.y = y;
  return m;
};

// سكة قطار: قضبان + مستطيلات خشبية (تُوضع على محور Z)
export const makeTrack = (length = 120, gauge = 2.6, y = 0.06) => {
  const g = new THREE.Group();
  const railGeo = new THREE.BoxGeometry(0.22, 0.26, length);
  [-gauge / 2, gauge / 2].forEach((x) => {
    const rail = new THREE.Mesh(railGeo, toon('#c8c8d8'));
    rail.position.set(x, y + 0.13, 0);
    g.add(rail);
    const shine = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, length), basic('#ffffff', undefined, 0.5));
    shine.position.set(x, y + 0.27, 0);
    g.add(shine);
  });
  const tieGeo = new THREE.BoxGeometry(gauge + 1.1, 0.14, 0.5);
  const tieMat = toon('#5b3437', woodTex('#7a4a3c', '#4a2c24'));
  const n = Math.floor(length / 1.15);
  for (let i = 0; i < n; i++) {
    const tie = new THREE.Mesh(tieGeo, tieMat);
    tie.position.set(0, y + 0.07, -length / 2 + i * 1.15);
    g.add(tie);
  }
  return g;
};

// نفق مقوّس + قاطرة بخارية رقم 7
export const makeTunnelLocomotive = () => {
  const g = new THREE.Group();
  // فوهة النفق
  const arch = new THREE.Mesh(new THREE.TorusGeometry(7, 2.6, 10, 24, Math.PI), toon('#2c1420', rockTex('#3a1c28', '#241018', '#4c2432')));
  arch.position.y = 0;
  const archBack = new THREE.Mesh(new THREE.CircleGeometry(9.4, 24, 0, Math.PI), basic('#120810'));
  archBack.position.z = -1.6;
  const archTop = new THREE.Mesh(new THREE.BoxGeometry(22, 8, 5), toon('#2c1420', rockTex('#3a1c28', '#241018', '#4c2432')));
  archTop.position.y = 8;
  g.add(arch, archBack, archTop);

  // القاطرة
  const loco = new THREE.Group();
  const boiler = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 6.4, 18), toon('#241018'));
  boiler.rotation.x = Math.PI / 2;
  boiler.position.y = 2.6;
  const cab = new THREE.Mesh(new THREE.BoxGeometry(3.6, 3.4, 2.6), toon('#241018'));
  cab.position.set(0, 3.2, -3.4);
  const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.75, 1.9, 12), toon('#241018'));
  chimney.position.set(0, 5.1, 2.2);
  const nose = new THREE.Mesh(new THREE.CylinderGeometry(1.72, 1.72, 0.5, 18), toon('#3a2028'));
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, 2.6, 3.35);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.62, 12, 10), basic('#ffd977'));
  lamp.position.set(0, 3.35, 3.7);
  const lampGlow = new THREE.Mesh(new THREE.SphereGeometry(1.5, 12, 10), basic('#ffd977', undefined, 0.32));
  lampGlow.position.copy(lamp.position);
  const plate = new THREE.Mesh(new THREE.CircleGeometry(0.62, 16), basic('#e8b23a', badgeTex('7')));
  plate.position.set(0, 2.45, 3.72);
  const cowcatcher = new THREE.Mesh(new THREE.ConeGeometry(2.2, 1.4, 4), toon('#c4422e'));
  cowcatcher.rotation.x = -Math.PI / 2;
  cowcatcher.rotation.y = Math.PI / 4;
  cowcatcher.position.set(0, 1.15, 4.1);
  loco.add(boiler, cab, chimney, nose, lamp, lampGlow, plate, cowcatcher);
  [-1.85, 1.85].forEach((x) => {
    for (let i = 0; i < 3; i++) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.42, 16), toon('#171717'));
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 1.15, -2.2 + i * 2.1);
      loco.add(wheel);
    }
  });
  loco.position.set(0, 0, -9);
  g.add(loco);
  return g;
};

// عمود تلغراف
export const makeTelegraphPole = () => {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 9, 8), toon('#4a2c24'));
  pole.position.y = 4.5;
  const bar = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.18, 0.18), toon('#4a2c24'));
  bar.position.y = 8.4;
  g.add(pole, bar);
  for (let i = -1; i <= 1; i++) {
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), toon('#2c1c1c'));
    knob.position.set(i * 1.3, 8.7, 0);
    g.add(knob);
  }
  return g;
};

// صبار
export const makeCactus = () => {
  const g = new THREE.Group();
  const mat = toon('#2c4c6c');
  const trunk = new THREE.Mesh(new THREE.CapsuleGeometry(0.62, 3.2, 6, 10), mat);
  trunk.position.y = 2.2;
  g.add(trunk);
  [-1, 1].forEach((s) => {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 1.5, 6, 8), mat);
    arm.position.set(s * 1.1, 3.1, 0);
    arm.rotation.z = s * 0.8;
    g.add(arm);
    const up = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 1.2, 6, 8), mat);
    up.position.set(s * 1.9, 4.1, 0);
    g.add(up);
  });
  return g;
};

// ماء الخليج (مستوى متموّج بخطوط فاتحة)
export const makeWater = (size = 300) => {
  const g = new THREE.Group();
  const water = new THREE.Mesh(new THREE.PlaneGeometry(size, size), basic('#1d3198'));
  water.rotation.x = -Math.PI / 2;
  water.position.y = -10;
  g.add(water);
  for (let i = 0; i < 26; i++) {
    const strip = new THREE.Mesh(new THREE.PlaneGeometry(6 + (i % 5) * 5, 0.9), basic('#4b73c5', undefined, 0.55));
    strip.rotation.x = -Math.PI / 2;
    strip.position.set((i * 37) % 140 - 70, -9.88, (i * 53) % 140 - 70);
    g.add(strip);
  }
  return g;
};

// جسر عوارض خشبية (trestle) على طول Z
export const makeTrestle = (length = 60, height = 9, deckY = 0) => {
  const g = new THREE.Group();
  const deck = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.55, length), toon('#7a4a3c', woodTex('#8a5a3c', '#4a2c24')));
  deck.position.y = deckY;
  g.add(deck);
  const bents = Math.floor(length / 5);
  for (let i = 0; i <= bents; i++) {
    const z = -length / 2 + i * 5;
    [-2.6, 2.6].forEach((x) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.55, height, 0.55), toon('#4a2c24'));
      post.position.set(x, deckY - height / 2, z);
      g.add(post);
    });
    const cross = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.4, 0.4), toon('#4a2c24'));
    cross.position.set(0, deckY - height * 0.55, z);
    g.add(cross);
    const cross2 = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.4, 0.4), toon('#4a2c24'));
    cross2.position.set(0, deckY - height * 0.25, z);
    g.add(cross2);
  }
  return g;
};

// رافعة صفراء
export const makeCrane = (h = 12) => {
  const g = new THREE.Group();
  const mast = new THREE.Mesh(new THREE.BoxGeometry(0.5, h, 0.5), toon('#e8b23a'));
  mast.position.y = h / 2;
  const jib = new THREE.Mesh(new THREE.BoxGeometry(0.4, 6, 0.4), toon('#e8b23a'));
  jib.position.set(1.9, h - 1, 0);
  jib.rotation.z = -0.85;
  const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 4.4, 6), toon('#171717'));
  cable.position.set(4.1, h - 3.6, 0);
  g.add(mast, jib, cable);
  return g;
};

// محطة القطار (واجهة + قبة زجاجية + لافتات)
export const makeStationExterior = () => {
  const g = new THREE.Group();
  const facade = new THREE.Mesh(new THREE.BoxGeometry(46, 16, 8), toon('#a8442e', brickTex()));
  facade.position.y = 8;
  g.add(facade);
  // القبة الزجاجية
  const dome = new THREE.Mesh(
    new THREE.CylinderGeometry(16, 16, 8, 24, 1, true, 0, Math.PI),
    new THREE.MeshToonMaterial({color: '#86aae0', transparent: true, opacity: 0.75, side: THREE.DoubleSide})
  );
  dome.rotation.x = Math.PI / 2;
  dome.rotation.z = Math.PI / 2;
  dome.position.set(0, 16, 0);
  g.add(dome);
  for (let i = -3; i <= 3; i++) {
    const rib = new THREE.Mesh(new THREE.TorusGeometry(16, 0.18, 6, 20, Math.PI), toon('#171717'));
    rib.rotation.y = Math.PI / 2;
    rib.position.set(i * 4, 16, 0);
    g.add(rib);
  }
  // برج الساعة
  const tower = new THREE.Mesh(new THREE.BoxGeometry(8, 10, 6), toon('#a8442e', brickTex()));
  tower.position.y = 22;
  const clock = new THREE.Mesh(new THREE.CircleGeometry(2.4, 20), basic('#f3e3d1'));
  clock.position.set(0, 23, 3.1);
  const hand1 = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.8, 0.1), basic('#171717'));
  hand1.position.set(0, 23.6, 3.2);
  const hand2 = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.2, 0.1), basic('#171717'));
  hand2.position.set(0.5, 23, 3.2);
  g.add(tower, clock, hand1, hand2);
  // لافتة "FIRST LINE IN GETS IT ALL!"
  const banner = new THREE.Mesh(new THREE.PlaneGeometry(30, 7.2), basic('#ffffff', signTex(['FIRST LINE IN', 'GETS IT ALL!'], '#f7f2ea', '#c4422e', 74)));
  banner.position.set(0, 11.4, 4.2);
  g.add(banner);
  // أقواس المدخل
  for (let i = -2; i <= 2; i++) {
    const arch = new THREE.Mesh(new THREE.TorusGeometry(3.4, 0.65, 8, 18, Math.PI), toon('#7a2c2c'));
    arch.position.set(i * 8.4, 4.6, 4.15);
    const door = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 6.4), basic('#3a1420'));
    door.position.set(i * 8.4, 3.2, 4.1);
    g.add(arch, door);
  }
  return g;
};

// قاعة المحطة الداخلية (أرضية خشب + شبابيك تذاكر + ساعة)
export const makeStationHall = () => {
  const g = new THREE.Group();
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(70, 50), toon('#7a4a32', woodTex('#8a5a3c', '#5b3424', false)));
  floor.rotation.x = -Math.PI / 2;
  g.add(floor);
  const back = new THREE.Mesh(new THREE.BoxGeometry(70, 22, 2), toon('#a8442e', brickTex()));
  back.position.set(0, 11, -18);
  g.add(back);
  for (let i = -2; i <= 2; i++) {
    const window_ = new THREE.Mesh(new THREE.PlaneGeometry(7.5, 8.2), basic('#2f7d4f'));
    window_.position.set(i * 11, 10, -16.9);
    const inner = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 5.8), basic('#f3e3d1'));
    inner.position.set(i * 11, 10, -16.8);
    g.add(window_, inner);
  }
  const clock = new THREE.Mesh(new THREE.CircleGeometry(3.2, 24), basic('#f3e3d1'));
  clock.position.set(0, 19, -16.8);
  const rim = new THREE.Mesh(new THREE.RingGeometry(3.2, 3.65, 24), basic('#171717'));
  rim.position.set(0, 19, -16.75);
  g.add(clock, rim);
  return g;
};

// منصة خشبية ببلاط أحمر (منصات البناء)
export const makeDeck = (w = 40, d = 60) => {
  const g = new THREE.Group();
  const deck = new THREE.Mesh(new THREE.BoxGeometry(w, 0.8, d), toon('#9a5b4d', woodTex('#9a5b4d', '#5b3437', false)));
  deck.position.y = 0;
  g.add(deck);
  const tiles = new THREE.Mesh(new THREE.BoxGeometry(w * 0.45, 0.2, d * 0.3), toon('#b5544c'));
  tiles.position.set(-w * 0.2, 0.5, -d * 0.25);
  g.add(tiles);
  return g;
};

// عربة القطار الفاخرة (خارج + داخل)
export const makeLuxuryCarExterior = () => {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(3.9, 3.6, 22), toon('#3a1420'));
  body.position.y = 2.6;
  const band = new THREE.Mesh(new THREE.BoxGeometry(3.96, 0.95, 21), toon('#252447'));
  band.position.y = 3.9;
  g.add(body, band);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(17, 1.5), basic('#252447', signTex(['VANDERGOLD'], '#252447', '#e8b23a', 92)));
  sign.rotation.y = Math.PI / 2;
  sign.position.set(1.99, 4.35, 0);
  g.add(sign);
  for (let i = -3; i <= 3; i++) {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.9), basic('#7a2c2c'));
    win.rotation.y = Math.PI / 2;
    win.position.set(1.97, 2.55, i * 3.1);
    const frame = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.2), basic('#e8b23a'));
    frame.rotation.y = Math.PI / 2;
    frame.position.set(1.95, 2.55, i * 3.1);
    g.add(frame, win);
  }
  return g;
};

export const makeLuxuryInterior = () => {
  const g = new THREE.Group();
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 30), basic('#1c2c66'));
  floor.rotation.x = -Math.PI / 2;
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(12, 30), toon('#c4622c', woodTex('#c4622c', '#8a3c1c', false)));
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 7.2;
  const wallMat = toon('#8e1c2c', velvetTex());
  [-6, 6].forEach((x) => {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 7.2), wallMat);
    wall.rotation.y = x > 0 ? -Math.PI / 2 : Math.PI / 2;
    wall.position.set(x, 3.6, 0);
    g.add(wall);
  });
  const endWall = new THREE.Mesh(new THREE.PlaneGeometry(12, 7.2), wallMat);
  endWall.position.set(0, 3.6, -15);
  g.add(floor, ceiling, endWall);
  // نوافذ الصحراء
  [-3, 0, 3].forEach((z) => {
    [-5.94, 5.94].forEach((x) => {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(3, 2.4), basic('#e8944c'));
      win.rotation.y = x > 0 ? -Math.PI / 2 : Math.PI / 2;
      win.position.set(x, 3.9, z);
      g.add(win);
    });
  });
  // مصابيح نحاسية
  [-4, 4].forEach((z) => {
    [-3.4, 3.4].forEach((x) => {
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8), basic('#ffd977'));
      lamp.position.set(x, 5.6, z);
      const glow = new THREE.Mesh(new THREE.SphereGeometry(0.95, 10, 8), basic('#ffd977', undefined, 0.3));
      glow.position.copy(lamp.position);
      const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.2, 6), basic('#171717'));
      cord.position.set(x, 6.5, z);
      g.add(lamp, glow, cord);
    });
  });
  // طاولات جانبية
  [-8, 0, 8].forEach((z) => {
    [-4.2, 4.2].forEach((x) => {
      const top = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.16, 14), toon('#5b3437'));
      top.position.set(x, 1.7, z);
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.7, 8), toon('#5b3437'));
      leg.position.set(x, 0.85, z);
      g.add(top, leg);
    });
  });
  // كراسي مخملية
  [-8, 0, 8].forEach((z) => {
    [-2.9, 2.9].forEach((x) => {
      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.1, 1.7), toon('#8e1c2c'));
      seat.position.set(x, 1.05, z);
      const back = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.9, 0.35), toon('#8e1c2c'));
      back.position.set(x + (x > 0 ? 0.75 : -0.75), 2, z);
      back.rotation.y = Math.PI / 2;
      g.add(seat, back);
    });
  });
  return g;
};

// عربات "RED CANYON SHORT LINE"
export const makeShortLineCar = (withFace = true) => {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(3.6, 3, 9.5), toon('#7a2c2c'));
  body.position.y = 2.4;
  const band = new THREE.Mesh(new THREE.BoxGeometry(3.7, 1, 9), toon('#2f7d4f'));
  band.position.y = 3.75;
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(8.4, 1), basic('#2f7d4f', signTex(['RED CANYON LINE'], '#2f7d4f', '#e8b23a', 66)));
  sign.position.set(1.86, 3.85, 0);
  sign.rotation.y = Math.PI / 2;
  g.add(body, band, sign);
  for (let i = -1; i <= 1; i++) {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), basic('#f3e3d1'));
    win.rotation.y = Math.PI / 2;
    win.position.set(1.85, 2.5, i * 2.8);
    const frame = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.8), toon('#e8b23a'));
    frame.rotation.y = Math.PI / 2;
    frame.position.set(1.82, 2.5, i * 2.8);
    g.add(frame, win);
  }
  [-1.4, 1.4].forEach((x) => {
    for (let i = -1; i <= 1; i += 2) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.3, 14), toon('#171717'));
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.62, i * 3.1);
      g.add(wheel);
    }
  });
  return g;
};

// عربة التقويم الخضراء + اللافتة
export const makeCalendarCart = () => {
  const g = new THREE.Group();
  const box = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.8, 2.4), toon('#2f7d4f'));
  box.position.y = 1.6;
  const cal = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 2.3), basic('#f3ead8', calendarTex()));
  cal.position.set(0, 1.85, 1.23);
  const openLid = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.18, 1.6), toon('#2f7d4f'));
  openLid.position.set(0, 3.1, -1.7);
  openLid.rotation.x = -1.05;
  g.add(box, cal, openLid);
  [-1.3, 1.3].forEach((x) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.28, 12), toon('#171717'));
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, 0.5, 0.9);
    g.add(wheel);
  });
  return g;
};

// علم أزرق
export const makeBlueFlag = () => {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 7, 8), toon('#6b4a3c'));
  pole.position.y = 3.5;
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.5, 8, 2), basic('#3d6fd4'));
  flag.position.set(1.35, 6.3, 0);
  g.add(pole, flag);
  return g;
};

// كرسي شاطئ + مظلة
export const makeDeckChair = () => {
  const g = new THREE.Group();
  const stripe = stripeTex('#e8b23a', '#171717');
  const seat = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.16, 2.1), toon('#e8b23a', stripe));
  seat.position.y = 1.05;
  seat.rotation.x = -0.12;
  const back = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.2, 0.16), toon('#e8b23a', stripe));
  back.position.set(0, 2.1, -1);
  back.rotation.x = -0.5;
  g.add(seat, back);
  [-1.15, 1.15].forEach((x) => {
    [-0.9, 0.9].forEach((z) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.05, 0.14), toon('#171717'));
      leg.position.set(x, 0.52, z);
      g.add(leg);
    });
  });
  // المظلة
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 5.6, 8), toon('#171717'));
  pole.position.set(0, 2.8, -1.6);
  const canopy = new THREE.Mesh(new THREE.ConeGeometry(3.1, 1.35, 10), toon('#c4422e'));
  canopy.position.set(0, 5.8, -1.6);
  const canopy2 = new THREE.Mesh(new THREE.ConeGeometry(2.1, 1.1, 10), toon('#e8b23a'));
  canopy2.position.set(0, 5.65, -1.6);
  g.add(pole, canopy, canopy2);
  return g;
};

// منارة/مصباح على عمود
export const makeLampPost = () => {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 5, 8), toon('#171717'));
  pole.position.y = 2.5;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 10), basic('#ffd977'));
  head.position.y = 5.2;
  const glow = new THREE.Mesh(new THREE.SphereGeometry(1.1, 12, 10), basic('#ffd977', undefined, 0.3));
  glow.position.y = 5.2;
  g.add(pole, head, glow);
  return g;
};

// هضبة (mesa)
export const makeMesa = (w: number, h: number, d: number) => {
  const geo = new THREE.BoxGeometry(w, h, d, 4, 3, 4);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    pos.setXYZ(i, x + Math.sin(y * 0.3 + z) * 0.8, y + Math.sin(x * 0.2 + z * 0.3) * 0.5, z + Math.cos(x * 0.25) * 0.8);
  }
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, toon('#b06858', rockTex('#b06858', '#8a4438', '#c88474', true)));
};
