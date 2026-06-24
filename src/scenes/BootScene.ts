// KitCrush — Boot Scene

import Phaser from 'phaser';
import { KITTEN_COLORS } from '../utils/constants';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    // Generate kitten background textures
    KITTEN_COLORS.forEach((color, i) => {
      const g = this.add.graphics();
      g.fillStyle(color, 0.3);
      g.fillRoundedRect(0, 0, 52, 52, 10);
      g.lineStyle(2, color, 0.6);
      g.strokeRoundedRect(0, 0, 52, 52, 10);
      g.generateTexture(`kitten_bg_${i}`, 52, 52);
      g.destroy();
    });

    this.scene.start('MenuScene');
  }
}
