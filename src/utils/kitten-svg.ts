// KitCrush — SVG Kitten Generator (procedural arcade sprites)

const KITTEN_DEFS = [
  { // 0: Rosa/Rojo
    body: '#ff6b9d', bodyDark: '#d44d7a', eyes: '#1a1a2e', eyeShine: '#fff',
    nose: '#ff4081', innerEar: '#ffb0c8', cheek: '#ff9dc2',
  },
  { // 1: Naranja
    body: '#ffa94d', bodyDark: '#d4872e', eyes: '#1a1a2e', eyeShine: '#fff',
    nose: '#ff8c1a', innerEar: '#ffd199', cheek: '#ffcc80',
  },
  { // 2: Amarillo
    body: '#ffd43b', bodyDark: '#d4a820', eyes: '#1a1a2e', eyeShine: '#fff',
    nose: '#ffc107', innerEar: '#ffe680', cheek: '#fff176',
  },
  { // 3: Verde
    body: '#69db7c', bodyDark: '#4caf50', eyes: '#1a1a2e', eyeShine: '#fff',
    nose: '#43a047', innerEar: '#a5d6a7', cheek: '#81c784',
  },
  { // 4: Azul
    body: '#74c0fc', bodyDark: '#42a5f5', eyes: '#1a1a2e', eyeShine: '#fff',
    nose: '#2196f3', innerEar: '#bbdefb', cheek: '#90caf9',
  },
  { // 5: Morado
    body: '#b197fc', bodyDark: '#9c6bdb', eyes: '#1a1a2e', eyeShine: '#fff',
    nose: '#9c27b0', innerEar: '#d1c4e9', cheek: '#ce93d8',
  },
];

export function generateKittenSVG(size: number, type: number): string {
  const k = KITTEN_DEFS[type] || KITTEN_DEFS[0];
  const s = size;
  const cx = s / 2;
  const cy = s / 2 + 2;
  const r = s * 0.35;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <defs>
    <radialGradient id="glow${type}" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="${k.body}" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="${k.body}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Glow -->
  <circle cx="${cx}" cy="${cy}" r="${r + 8}" fill="url(#glow${type})"/>

  <!-- Left ear -->
  <polygon points="${cx - r * 0.8},${cy - r * 0.6} ${cx - r * 1.1},${cy - r * 1.4} ${cx - r * 0.2},${cy - r * 0.9}" fill="${k.body}"/>
  <polygon points="${cx - r * 0.7},${cy - r * 0.65} ${cx - r * 0.95},${cy - r * 1.2} ${cx - r * 0.35},${cy - r * 0.85}" fill="${k.innerEar}"/>

  <!-- Right ear -->
  <polygon points="${cx + r * 0.8},${cy - r * 0.6} ${cx + r * 1.1},${cy - r * 1.4} ${cx + r * 0.2},${cy - r * 0.9}" fill="${k.body}"/>
  <polygon points="${cx + r * 0.7},${cy - r * 0.65} ${cx + r * 0.95},${cy - r * 1.2} ${cx + r * 0.35},${cy - r * 0.85}" fill="${k.innerEar}"/>

  <!-- Body circle -->
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${k.body}"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${k.bodyDark}" stroke-width="1.5"/>

  <!-- Eyes -->
  <ellipse cx="${cx - r * 0.32}" cy="${cy - r * 0.1}" rx="${r * 0.18}" ry="${r * 0.22}" fill="${k.eyes}"/>
  <ellipse cx="${cx + r * 0.32}" cy="${cy - r * 0.1}" rx="${r * 0.18}" ry="${r * 0.22}" fill="${k.eyes}"/>
  <!-- Eye shine -->
  <ellipse cx="${cx - r * 0.26}" cy="${cy - r * 0.18}" rx="${r * 0.06}" ry="${r * 0.08}" fill="${k.eyeShine}"/>
  <ellipse cx="${cx + r * 0.38}" cy="${cy - r * 0.18}" rx="${r * 0.06}" ry="${r * 0.08}" fill="${k.eyeShine}"/>

  <!-- Nose -->
  <ellipse cx="${cx}" cy="${cy + r * 0.2}" rx="${r * 0.12}" ry="${r * 0.08}" fill="${k.nose}"/>

  <!-- Mouth -->
  <path d="M${cx - r * 0.15},${cy + r * 0.32} Q${cx},${cy + r * 0.45} ${cx + r * 0.15},${cy + r * 0.32}" fill="none" stroke="${k.eyes}" stroke-width="1.2" stroke-linecap="round"/>

  <!-- Whiskers left -->
  <line x1="${cx - r * 0.9}" y1="${cy + r * 0.05}" x2="${cx - r * 0.35}" y2="${cy + r * 0.15}" stroke="${k.bodyDark}" stroke-width="1" stroke-linecap="round"/>
  <line x1="${cx - r * 0.9}" y1="${cy + r * 0.2}" x2="${cx - r * 0.35}" y2="${cy + r * 0.22}" stroke="${k.bodyDark}" stroke-width="1" stroke-linecap="round"/>

  <!-- Whiskers right -->
  <line x1="${cx + r * 0.9}" y1="${cy + r * 0.05}" x2="${cx + r * 0.35}" y2="${cy + r * 0.15}" stroke="${k.bodyDark}" stroke-width="1" stroke-linecap="round"/>
  <line x1="${cx + r * 0.9}" y1="${cy + r * 0.2}" x2="${cx + r * 0.35}" y2="${cy + r * 0.22}" stroke="${k.bodyDark}" stroke-width="1" stroke-linecap="round"/>

  <!-- Cheeks -->
  <circle cx="${cx - r * 0.55}" cy="${cy + r * 0.25}" r="${r * 0.12}" fill="${k.cheek}" opacity="0.5"/>
  <circle cx="${cx + r * 0.55}" cy="${cy + r * 0.25}" r="${r * 0.12}" fill="${k.cheek}" opacity="0.5"/>
</svg>`;
}

export function svgToTexture(scene: Phaser.Scene, key: number, svg: string, size: number): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, size, size);
      scene.textures.addCanvas(`kitten_${key}`, canvas);
      URL.revokeObjectURL(url);
      resolve();
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve();
    };

    img.src = url;
  });
}

export const KITTEN_COLORS_HEX = [
  '#ff6b9d', '#ffa94d', '#ffd43b', '#69db7c', '#74c0fc', '#b197fc',
];
