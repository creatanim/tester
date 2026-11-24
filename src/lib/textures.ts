import * as THREE from 'three';

// ============================================================
// textures.ts — خامات Canvas مولّدة برمجياً بجودة عالية:
// نقوش الصخور المخططة، الدُّبّار، الخشب، المخمل، اللوحات،
// الوجوه الكارتونية، الدخان، التوهج
// ============================================================

export const canvasTex = (
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
  repeat?: [number, number]
): THREE.CanvasTexture => {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d')!;
  draw(ctx);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) {
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
  }
  return t;
};

const rnd = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

// سماء متدرجة
export const skyTex = (top: string, mid: string, bottom: string) =>
  canvasTex(16, 256, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, top); g.addColorStop(0.55, mid); g.addColorStop(1, bottom);
    ctx.fillStyle = g; ctx.fillRect(0, 0, 16, 256);
  });

// صخر مخطط (striations) — نقوش الأخدود
export const rockTex = (base: string, dark: string, light: string, horizontal = false) =>
  canvasTex(512, 512, (ctx) => {
    ctx.fillStyle = base; ctx.fillRect(0, 0, 512, 512);
    const r = rnd(7);
    for (let i = 0; i < 46; i++) {
      const p = r() * 512;
      ctx.strokeStyle = r() > 0.5 ? dark : light;
      ctx.globalAlpha = 0.25 + r() * 0.35;
      ctx.lineWidth = 5 + r() * 22;
      ctx.beginPath();
      if (horizontal) {
        ctx.moveTo(0, p);
        for (let x = 0; x <= 512; x += 64) ctx.lineTo(x, p + Math.sin(x * 0.02 + i) * 10);
      } else {
        ctx.moveTo(p, 0);
        for (let y = 0; y <= 512; y += 64) ctx.lineTo(p + Math.sin(y * 0.02 + i) * 12, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }, [2, 2]);

// حصى/دُّبّار ملوّن
export const ballastTex = () =>
  canvasTex(512, 512, (ctx) => {
    ctx.fillStyle = '#6b4a3c'; ctx.fillRect(0, 0, 512, 512);
    const r = rnd(11);
    const cols = ['#a2765c', '#c98d68', '#8a5a44', '#d9b08c', '#7a5340', '#e0c0a0'];
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = cols[Math.floor(r() * cols.length)];
      ctx.beginPath();
      ctx.ellipse(r() * 512, r() * 512, 4 + r() * 12, 3 + r() * 8, r() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [6, 6]);

// لوحات خشبية
export const woodTex = (base: string, dark: string, vertical = true) =>
  canvasTex(512, 512, (ctx) => {
    ctx.fillStyle = base; ctx.fillRect(0, 0, 512, 512);
    const r = rnd(3);
    for (let i = 0; i < 26; i++) {
      ctx.strokeStyle = dark; ctx.globalAlpha = 0.18 + r() * 0.3;
      ctx.lineWidth = 2 + r() * 6;
      ctx.beginPath();
      const p = r() * 512;
      if (vertical) { ctx.moveTo(p, 0); ctx.lineTo(p + (r() - 0.5) * 30, 512); }
      else { ctx.moveTo(0, p); ctx.lineTo(512, p + (r() - 0.5) * 30); }
      ctx.stroke();
    }
    // خطوط الفواصل بين اللوحات
    ctx.globalAlpha = 0.8; ctx.strokeStyle = dark; ctx.lineWidth = 5;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      if (vertical) { ctx.moveTo(i * 85 + 20, 0); ctx.lineTo(i * 85 + 20, 512); }
      else { ctx.moveTo(0, i * 85 + 20); ctx.lineTo(512, i * 85 + 20); }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }, [2, 2]);

// مخمل أحمر (جدران العربة الفاخرة)
export const velvetTex = () =>
  canvasTex(256, 256, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 256, 0);
    g.addColorStop(0, '#8e1c2c'); g.addColorStop(0.5, '#b23040'); g.addColorStop(1, '#8e1c2c');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(i * 7, 0, 3, 256);
    }
  });

// طوب أحمر (المحطة)
export const brickTex = () =>
  canvasTex(512, 512, (ctx) => {
    ctx.fillStyle = '#a8442e'; ctx.fillRect(0, 0, 512, 512);
    const r = rnd(5);
    for (let row = 0; row < 16; row++) {
      for (let col = 0; col < 9; col++) {
        ctx.fillStyle = r() > 0.5 ? '#b8543c' : '#943822';
        ctx.fillRect(col * 58 + (row % 2) * 29, row * 32, 54, 28);
      }
    }
  }, [3, 2]);

// ملمس قماش مخطط (كرسي الشاطئ)
export const stripeTex = (a: string, b: string) =>
  canvasTex(128, 128, (ctx) => {
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 ? a : b;
      ctx.fillRect(i * 16, 0, 16, 128);
    }
  }, [4, 1]);

// لافتة نصية (يافطات المشهد)
export const signTex = (lines: string[], bg: string, fg: string, font = 64, serif = true) =>
  canvasTex(1024, 320, (ctx) => {
    ctx.fillStyle = bg; ctx.fillRect(0, 0, 1024, 320);
    ctx.strokeStyle = '#171717'; ctx.lineWidth = 14; ctx.strokeRect(7, 7, 1010, 306);
    ctx.fillStyle = fg;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const fam = serif ? 'Georgia, serif' : 'Arial Black, sans-serif';
    const lh = 300 / lines.length;
    lines.forEach((ln, i) => {
      ctx.font = `900 ${font}px ${fam}`;
      ctx.fillText(ln, 512, 80 + i * lh, 980);
    });
  });

// جريدة "THE CLICKETY CLACK LINE!"
export const newspaperTex = () =>
  canvasTex(512, 640, (ctx) => {
    ctx.fillStyle = '#f3e3d1'; ctx.fillRect(0, 0, 512, 640);
    ctx.fillStyle = '#c4422e'; ctx.fillRect(24, 28, 464, 120);
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '900 56px Georgia, serif';
    ctx.fillText('THE CLICKETY', 256, 72);
    ctx.fillText('CLACK LINE!', 256, 128);
    ctx.fillStyle = '#171717'; ctx.font = 'italic 28px Georgia, serif';
    ctx.fillText('The Real Mean He Said', 256, 196);
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = '#171717'; ctx.globalAlpha = 0.55;
      ctx.fillRect(40, 240 + i * 36, 432, 12);
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#171717'; ctx.lineWidth = 8; ctx.strokeRect(4, 4, 504, 632);
  });

// تقويم "CALENDAR 1880 MAY"
export const calendarTex = () =>
  canvasTex(256, 320, (ctx) => {
    ctx.fillStyle = '#f3ead8'; ctx.fillRect(0, 0, 256, 320);
    ctx.fillStyle = '#c4422e'; ctx.fillRect(0, 0, 256, 74);
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '900 30px Arial'; ctx.fillText('CALENDAR', 128, 30);
    ctx.font = '700 22px Arial'; ctx.fillText('1880', 128, 58);
    ctx.fillStyle = '#171717'; ctx.font = '900 84px Georgia, serif';
    ctx.fillText('MAY', 128, 170);
    ctx.strokeStyle = '#171717'; ctx.lineWidth = 6; ctx.strokeRect(3, 3, 250, 314);
  });

// وجه كرتوني (يُطبَّق على مستوٍ أمام الرأس)
export const faceTex = (expr: 'normal' | 'happy' | 'grin' | 'angry' | 'shocked' | 'worry', glasses = false) =>
  canvasTex(256, 256, (ctx) => {
    ctx.clearRect(0, 0, 256, 256);
    ctx.strokeStyle = '#171717'; ctx.fillStyle = '#171717';
    const eye = (x: number, y: number, rx = 11, ry = 15) => {
      ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    };
    if (expr === 'normal') {
      eye(96, 110); eye(160, 110);
      ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(128, 168, 28, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    } else if (expr === 'happy') {
      ctx.lineWidth = 12; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(96, 118, 22, 1.1 * Math.PI, 1.9 * Math.PI); ctx.stroke();
      ctx.beginPath(); ctx.arc(160, 118, 22, 1.1 * Math.PI, 1.9 * Math.PI); ctx.stroke();
      ctx.beginPath(); ctx.arc(128, 162, 32, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();
    } else if (expr === 'grin') {
      eye(96, 110); eye(160, 110);
      ctx.beginPath();
      ctx.moveTo(92, 158); ctx.lineTo(164, 158);
      ctx.arc(128, 158, 36, 0, Math.PI);
      ctx.closePath(); ctx.fill();
    } else if (expr === 'angry') {
      ctx.lineWidth = 16; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(66, 76); ctx.lineTo(114, 98); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(190, 76); ctx.lineTo(142, 98); ctx.stroke();
      eye(96, 118); eye(160, 118);
      // أسنان مطبّقة
      ctx.fillStyle = '#fff'; ctx.fillRect(88, 156, 80, 38);
      ctx.strokeStyle = '#171717'; ctx.lineWidth = 6; ctx.strokeRect(88, 156, 80, 38);
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(114, 156); ctx.lineTo(114, 194); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(142, 156); ctx.lineTo(142, 194); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(88, 175); ctx.lineTo(168, 175); ctx.stroke();
    } else if (expr === 'shocked') {
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.ellipse(92, 112, 26, 32, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(164, 112, 26, 32, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#171717'; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.ellipse(92, 112, 26, 32, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(164, 112, 26, 32, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#171717';
      ctx.beginPath(); ctx.arc(92, 114, 10, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(164, 114, 10, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(128, 182, 20, 26, 0, 0, Math.PI * 2); ctx.fill();
    } else if (expr === 'worry') {
      ctx.lineWidth = 13; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(66, 84); ctx.lineTo(116, 72); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(190, 84); ctx.lineTo(140, 72); ctx.stroke();
      eye(96, 118); eye(160, 118);
      ctx.beginPath(); ctx.arc(128, 192, 24, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke();
    }
    if (glasses) {
      ctx.strokeStyle = '#c8762c'; ctx.lineWidth = 11;
      ctx.beginPath(); ctx.arc(94, 112, 34, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(162, 112, 34, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(128, 112); ctx.lineTo(128, 112); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(60, 108); ctx.lineTo(28, 100); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(196, 108); ctx.lineTo(228, 100); ctx.stroke();
    }
  });

// دخان (سبرايت ناعم)
export const smokeSprite = (color = '#d9d2cf') =>
  canvasTex(128, 128, (ctx) => {
    const g = ctx.createRadialGradient(64, 64, 8, 64, 64, 62);
    g.addColorStop(0, color); g.addColorStop(0.55, color + 'cc'); g.addColorStop(1, color + '00');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
  });

// توهج دائري
export const glowSprite = (color = '#ffd977') =>
  canvasTex(128, 128, (ctx) => {
    const g = ctx.createRadialGradient(64, 64, 2, 64, 64, 62);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.25, color); g.addColorStop(1, color + '00');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
  });

// كرة نار (للانفجار)
export const fireballSprite = () =>
  canvasTex(256, 256, (ctx) => {
    const r = rnd(21);
    const g = ctx.createRadialGradient(128, 128, 10, 128, 128, 126);
    g.addColorStop(0, '#fff6c8'); g.addColorStop(0.35, '#f7b94d');
    g.addColorStop(0.7, '#e78543'); g.addColorStop(1, '#b5301c00');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 26; i++) {
      ctx.fillStyle = 'rgba(255,246,200,0.22)';
      ctx.beginPath();
      ctx.arc(60 + r() * 136, 60 + r() * 136, 8 + r() * 30, 0, Math.PI * 2);
      ctx.fill();
    }
  });

// رقم/شعار صغير
export const badgeTex = (txt: string, bg = '#e8b23a', fg = '#171717') =>
  canvasTex(128, 128, (ctx) => {
    ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(64, 64, 60, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '900 72px Georgia, serif'; ctx.fillText(txt, 64, 70);
    ctx.strokeStyle = '#171717'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(64, 64, 58, 0, Math.PI * 2); ctx.stroke();
  });
