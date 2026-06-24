// KitCrush — Boot Scene (generate SVG textures)

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, KITTEN_TYPES } from '../utils/constants';
import { generateKittenSVG, svgToTexture } from '../utils/kitten-svg';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  async create() {
    // Show loading
    const txt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '🐱 Cargando...', {
      fontSize: '22px', color: '#ff6b9d', fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);

    // Generate SVG kitten textures
    const texSize = 128;
    const promises: Promise<void>[] = [];
    for (let i = 0; i < KITTEN_TYPES; i++) {
      const svg = generateKittenSVG(texSize, i);
      promises.push(svgToTexture(this, i, svg, texSize));
    }
    await Promise.all(promises);

    txt.destroy();
    this.scene.start('MenuScene');
  }
}
