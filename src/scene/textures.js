import * as THREE from 'three';

const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

export function makeCanvasTexture(w, h, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

// Small deterministic random generator so textures look the same on every load.
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function pill(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, h / 2);
  ctx.fill();
}

export function floorTexture() {
  const r = rng(7);
  const tex = makeCanvasTexture(512, 512, (ctx, w, h) => {
    const rows = 8;
    const rh = h / rows;
    for (let row = 0; row < rows; row++) {
      let x = row % 2 ? -90 : 0;
      while (x < w) {
        const len = 150 + Math.floor(r() * 3) * 45;
        const shade = 190 + Math.floor(r() * 5) * 6;
        ctx.fillStyle = `rgb(${shade},${shade - 36},${shade - 78})`;
        ctx.fillRect(x, row * rh, len, rh);
        ctx.fillStyle = 'rgba(70,45,20,.35)';
        ctx.fillRect(x, row * rh, 2, rh);
        x += len;
      }
      ctx.fillStyle = 'rgba(70,45,20,.4)';
      ctx.fillRect(0, row * rh, w, 2);
    }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 3);
  return tex;
}

const PALETTES = [
  ['#f97316', '#facc15'],
  ['#6366f1', '#22d3ee'],
  ['#ec4899', '#f43f5e'],
  ['#10b981', '#84cc16'],
  ['#0ea5e9', '#6366f1'],
  ['#a855f7', '#ec4899'],
  ['#f59e0b', '#ef4444'],
  ['#14b8a6', '#0ea5e9'],
];
const WORDS = ['SALE', 'NEW', '-20%', 'PROMO', 'LIMITED', 'TODAY', '2 FOR 1', 'WEEKEND'];

export function bannerTexture(i, tag) {
  return makeCanvasTexture(512, 320, (ctx, w, h) => {
    const [a, b] = PALETTES[i % PALETTES.length];
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, a);
    g.addColorStop(1, b);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,.18)';
    ctx.beginPath();
    ctx.arc(w * 0.82, h * 0.3, h * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w * 0.12, h * 1.0, h * 0.38, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.textBaseline = 'middle';
    ctx.font = `800 ${h * 0.24}px ${FONT}`;
    ctx.fillText(WORDS[i % WORDS.length], w * 0.08, h * 0.38);
    ctx.font = `600 ${h * 0.085}px ${FONT}`;
    ctx.globalAlpha = 0.85;
    ctx.fillText('Sample banner (mock)', w * 0.08, h * 0.6);
    ctx.globalAlpha = 1;
    pill(ctx, w * 0.08, h * 0.72, 170, 48, 'rgba(255,255,255,.95)');
    ctx.fillStyle = a;
    ctx.font = `700 22px ${FONT}`;
    ctx.fillText('Learn more', w * 0.08 + 26, h * 0.72 + 25);
    if (tag) {
      pill(ctx, w - 200, 18, 182, 44, 'rgba(0,0,0,.55)');
      ctx.fillStyle = '#fff';
      ctx.font = `700 20px ${FONT}`;
      ctx.fillText(tag, w - 182, 41);
    }
  });
}

export function codeTexture(seed = 1) {
  const r = rng(seed);
  const colors = ['#f472b6', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#94a3b8'];
  return makeCanvasTexture(512, 320, (ctx, w, h) => {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, w, 28);
    ['#f87171', '#fbbf24', '#4ade80'].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(18 + i * 18, 14, 5, 0, Math.PI * 2);
      ctx.fill();
    });
    for (let line = 0; line < 13; line++) {
      let x = 20 + (line % 4 === 0 ? 0 : 24 * (1 + Math.floor(r() * 2)));
      const y = 44 + line * 21;
      const parts = 1 + Math.floor(r() * 4);
      for (let p = 0; p < parts; p++) {
        const len = 24 + r() * 90;
        ctx.fillStyle = colors[Math.floor(r() * colors.length)];
        ctx.globalAlpha = 0.85;
        ctx.fillRect(x, y, len, 9);
        x += len + 10;
      }
    }
    ctx.globalAlpha = 1;
  });
}

export function thumbsTexture() {
  return makeCanvasTexture(512, 320, (ctx, w, h) => {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = `700 20px ${FONT}`;
    ctx.textBaseline = 'middle';
    ctx.fillText('Asset library', 20, 24);
    pill(ctx, w - 120, 10, 100, 28, '#f97316');
    ctx.fillStyle = '#fff';
    ctx.font = `700 15px ${FONT}`;
    ctx.fillText('+ Upload', w - 102, 25);
    let i = 0;
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        const [a, b] = PALETTES[i++ % PALETTES.length];
        const x = 20 + col * 120;
        const y = 52 + row * 88;
        const g = ctx.createLinearGradient(x, y, x + 108, y + 70);
        g.addColorStop(0, a);
        g.addColorStop(1, b);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.roundRect(x, y, 108, 70, 8);
        ctx.fill();
      }
    }
  });
}

export function barsTexture(seed = 3) {
  const r = rng(seed);
  return makeCanvasTexture(512, 320, (ctx, w, h) => {
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#94a3b8';
    ctx.font = `600 18px ${FONT}`;
    ctx.fillText('DAILY SUMMARY (MOCK)', 20, 32);
    for (let i = 0; i < 10; i++) {
      const bh = 60 + r() * 170;
      ctx.fillStyle = i === 9 ? '#f97316' : '#38bdf8';
      ctx.fillRect(28 + i * 46, h - 24 - bh, 30, bh);
    }
  });
}

export function radarTexture() {
  return makeCanvasTexture(512, 512, (ctx, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, w / 2);
    g.addColorStop(0, '#0f3b2e');
    g.addColorStop(1, '#06150f');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(74,222,128,.55)';
    ctx.lineWidth = 3;
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, (w / 2 - 8) * (i / 4), 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(cx, 8);
    ctx.lineTo(cx, h - 8);
    ctx.moveTo(8, cy);
    ctx.lineTo(w - 8, cy);
    ctx.stroke();
  });
}

export function signTexture(text, { bg = '#111827', fg = '#ffffff', w = 512, h = 128, size = 56, weight = 800 } = {}) {
  return makeCanvasTexture(w, h, (ctx) => {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = fg;
    ctx.font = `${weight} ${size}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, h / 2 + 2);
  });
}

export function whiteboardTexture(groups) {
  const notes = ['#fde68a', '#bfdbfe', '#bbf7d0', '#fbcfe8'];
  return makeCanvasTexture(1024, 600, (ctx, w, h) => {
    ctx.fillStyle = '#fbfbfa';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#1f2937';
    ctx.font = `800 54px ${FONT}`;
    ctx.textBaseline = 'middle';
    ctx.fillText('SKILLS', 40, 56);
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(40, 92);
    ctx.lineTo(240, 88);
    ctx.stroke();
    groups.forEach((g, i) => {
      const x = 40 + i * 242;
      const y = 130;
      ctx.save();
      ctx.translate(x + 105, y + 210);
      ctx.rotate((i % 2 ? 1 : -1) * 0.025);
      ctx.translate(-(x + 105), -(y + 210));
      ctx.fillStyle = 'rgba(0,0,0,.08)';
      ctx.fillRect(x + 6, y + 8, 214, 420);
      ctx.fillStyle = notes[i % notes.length];
      ctx.fillRect(x, y, 214, 420);
      ctx.fillStyle = '#111827';
      ctx.font = `800 28px ${FONT}`;
      ctx.fillText(g.name, x + 16, y + 40);
      ctx.font = `500 25px ${FONT}`;
      g.items.forEach((item, j) => ctx.fillText(`• ${item}`, x + 16, y + 100 + j * 62));
      ctx.restore();
    });
  });
}

export function ledgerTexture() {
  const rows = [
    ['Feeds', '12,400'],
    ['Vaccines', '3,250'],
    ['Vitamins', '1,980'],
    ['Rent', '5,000'],
    ['Wages', '8,000'],
  ];
  return makeCanvasTexture(512, 320, (ctx, w, h) => {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = `700 22px ${FONT}`;
    ctx.textBaseline = 'middle';
    ctx.fillText('Batch 1 · expenses (mock)', 22, 30);
    rows.forEach(([k, v], i) => {
      const y = 76 + i * 44;
      ctx.fillStyle = i % 2 ? '#111c33' : '#16213b';
      ctx.fillRect(16, y - 20, w - 32, 40);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = `500 20px ${FONT}`;
      ctx.fillText(k, 30, y);
      ctx.fillStyle = '#fdba74';
      ctx.textAlign = 'right';
      ctx.fillText(`₱ ${v}`, w - 30, y);
      ctx.textAlign = 'left';
    });
  });
}

export function notifTexture() {
  return makeCanvasTexture(512, 200, (ctx, w, h) => {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, 28);
    ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.roundRect(0, 0, 18, h, [28, 0, 0, 28]);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.textBaseline = 'middle';
    ctx.font = `800 40px ${FONT}`;
    ctx.fillText('KPI alert', 48, 62);
    ctx.fillStyle = '#475569';
    ctx.font = `500 30px ${FONT}`;
    ctx.fillText('Transactions ▼ 38% (mock)', 48, 132);
  });
}

export function supportTexture() {
  return makeCanvasTexture(512, 320, (ctx, w) => {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, 320);
    ctx.fillStyle = '#e2e8f0';
    ctx.textBaseline = 'middle';
    ctx.font = `700 22px ${FONT}`;
    ctx.fillText('Support · promo terms', 22, 30);
    ['Promo A', 'Promo B', 'Promo C', 'Promo D'].forEach((p, i) => {
      const y = 82 + i * 56;
      ctx.fillStyle = '#16213b';
      ctx.fillRect(16, y - 22, w - 32, 44);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = `500 20px ${FONT}`;
      ctx.fillText(p, 32, y);
      if (i === 1) {
        pill(ctx, w - 150, y - 15, 120, 30, '#f97316');
        ctx.fillStyle = '#fff';
        ctx.font = `700 15px ${FONT}`;
        ctx.fillText('UPDATED', w - 128, y + 1);
      }
    });
  });
}

export function drawChart(ctx, w, h, data, threshold, alarm) {
  ctx.fillStyle = '#0b1220';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(148,163,184,.15)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 5; i++) {
    const y = 40 + ((h - 60) * i) / 5;
    ctx.beginPath();
    ctx.moveTo(16, y);
    ctx.lineTo(w - 16, y);
    ctx.stroke();
  }
  const top = 40;
  const bottom = h - 20;
  const yOf = (v) => bottom - (v / 100) * (bottom - top);
  const xOf = (i) => 16 + (i / (data.length - 1)) * (w - 32);
  const color = alarm ? '#f87171' : '#4ade80';

  const g = ctx.createLinearGradient(0, top, 0, bottom);
  g.addColorStop(0, alarm ? 'rgba(248,113,113,.35)' : 'rgba(74,222,128,.3)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.beginPath();
  data.forEach((v, i) => (i ? ctx.lineTo(xOf(i), yOf(v)) : ctx.moveTo(xOf(i), yOf(v))));
  ctx.lineTo(xOf(data.length - 1), bottom);
  ctx.lineTo(xOf(0), bottom);
  ctx.closePath();
  ctx.fillStyle = g;
  ctx.fill();

  ctx.beginPath();
  data.forEach((v, i) => (i ? ctx.lineTo(xOf(i), yOf(v)) : ctx.moveTo(xOf(i), yOf(v))));
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.setLineDash([10, 8]);
  ctx.strokeStyle = 'rgba(248,113,113,.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(16, yOf(threshold));
  ctx.lineTo(w - 16, yOf(threshold));
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#cbd5e1';
  ctx.font = `700 18px ${FONT}`;
  ctx.fillText('TRANSACTIONS / HOUR (MOCK)', 18, 20);
  const label = alarm ? 'ALERT SENT' : 'NORMAL';
  ctx.font = `800 16px ${FONT}`;
  const tw = ctx.measureText(label).width + 28;
  pill(ctx, w - tw - 16, 6, tw, 28, alarm ? '#ef4444' : '#16a34a');
  ctx.fillStyle = '#fff';
  ctx.fillText(label, w - tw - 2, 21);
}
