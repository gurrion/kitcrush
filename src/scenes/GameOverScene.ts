// KitCrush — Game Over Scene

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, KITTEN_EMOJIS } from '../utils/constants';
import { LevelManager } from '../systems/LevelManager';
import { playGameOverSound } from '../utils/sounds';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data: { won: boolean; score: number; stars: number; levelManager: LevelManager }) {
    const { won, score, stars, levelManager } = data;
    playGameOverSound(won);

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x0f0f23, 0x0f0f23, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Icon
    const icon = this.add.text(GAME_WIDTH / 2, 90, won ? '🎉' : '😿', {
      fontSize: '64px',
    }).setOrigin(0.5).setScale(0);
    this.tweens.add({ targets: icon, scale: 1, duration: 400, ease: 'Back.easeOut' });

    // Title
    this.add.text(GAME_WIDTH / 2, 160, won ? '¡Nivel Completado!' : '¡Sin Movimientos!', {
      fontSize: '28px', color: won ? '#ffd43b' : '#ff6b6b',
      fontFamily: 'Arial, sans-serif', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);

    // Stars
    if (won && stars > 0) {
      for (let i = 0; i < 3; i++) {
        const s = this.add.text(GAME_WIDTH / 2 - 50 + i * 50, 220, i < stars ? '⭐' : '☆', {
          fontSize: '36px',
        }).setOrigin(0.5).setScale(0);
        this.tweens.add({
          targets: s, scale: 1,
          duration: 250, delay: 250 + i * 150, ease: 'Back.easeOut',
        });
      }
    }

    // Score
    this.add.text(GAME_WIDTH / 2, 280, `🏆 ${score} puntos`, {
      fontSize: '22px', color: '#fff', fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);

    const cfg = levelManager.getCurrentLevelConfig();
    this.add.text(GAME_WIDTH / 2, 310, `Meta: ${cfg.target}`, {
      fontSize: '14px', color: '#aaa', fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);

    // Buttons
    if (won) {
      this.createBtn(GAME_WIDTH / 2, 380, '▶ Siguiente', 0x69db7c, () => {
        levelManager.nextLevel();
        this.scene.start('GameScene', { level: levelManager.currentLevel, levelManager });
      });
      this.createBtn(GAME_WIDTH / 2, 435, '🔄 Repetir', 0x74c0fc, () => {
        this.scene.start('GameScene', { level: levelManager.currentLevel, levelManager });
      });
    } else {
      this.createBtn(GAME_WIDTH / 2, 380, '🔄 Reintentar', 0xff6b9d, () => {
        this.scene.start('GameScene', { level: levelManager.currentLevel, levelManager });
      });
      this.createBtn(GAME_WIDTH / 2, 435, '🏠 Menú', 0x74c0fc, () => {
        this.scene.start('MenuScene');
      });
    }

    // Floating kittens
    for (let i = 0; i < 6; i++) {
      const k = this.add.text(
        Phaser.Math.Between(30, GAME_WIDTH - 30),
        Phaser.Math.Between(GAME_HEIGHT - 120, GAME_HEIGHT - 40),
        KITTEN_EMOJIS[i % KITTEN_EMOJIS.length],
        { fontSize: '18px' },
      ).setOrigin(0.5).setAlpha(0.15);
      this.tweens.add({
        targets: k, y: k.y - Phaser.Math.Between(15, 40),
        duration: Phaser.Math.Between(2000, 3500),
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    }
  }

  private createBtn(x: number, y: number, text: string, color: number, cb: () => void) {
    const w = 200, h = 42;
    const g = this.add.graphics();
    g.fillStyle(color, 0.8);
    g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 10);
    this.add.text(x, y, text, {
      fontSize: '18px', color: '#fff',
      fontFamily: 'Arial, sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5);
    const hit = this.add.rectangle(x, y, w, h, 0x000000, 0)
      .setInteractive({ useHandCursor: true });
    hit.on('pointerdown', cb);
    hit.on('pointerover', () => { g.clear(); g.fillStyle(color, 1); g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 10); });
    hit.on('pointerout', () => { g.clear(); g.fillStyle(color, 0.8); g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 10); });
  }
}
