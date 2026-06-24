// KitCrush — Boot Scene (Asset Loading)

import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Create loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRoundedRect(width / 2 - 160, height / 2 - 15, 320, 30, 8);

    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Cargando gatitos...', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xff6b9d, 1);
      progressBar.fillRoundedRect(width / 2 - 155, height / 2 - 10, 310 * value, 20, 6);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // No external assets to load — everything is procedural
    // But we simulate a small delay for the loading screen
  }

  create() {
    // Generate textures programmatically
    this.generateKittenTextures();
    this.scene.start('MenuScene');
  }

  private generateKittenTextures() {
    const colors = [0xff6b6b, 0xffa94d, 0xffd43b, 0x69db7c, 0x74c0fc, 0xb197fc];

    colors.forEach((color, i) => {
      const g = this.add.graphics();
      const size = 64;

      // Rounded square background
      g.fillStyle(color, 0.3);
      g.fillRoundedRect(0, 0, size, size, 12);
      g.lineStyle(2, color, 0.6);
      g.strokeRoundedRect(0, 0, size, size, 12);

      g.generateTexture(`kitten_bg_${i}`, size, size);
      g.destroy();
    });
  }
}
