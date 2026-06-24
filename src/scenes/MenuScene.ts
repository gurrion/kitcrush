// KitCrush — Menu Scene

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, LEVELS, KITTEN_EMOJIS, KITTEN_COLORS } from '../utils/constants';
import { LevelManager } from '../systems/LevelManager';

export class MenuScene extends Phaser.Scene {
  private levelManager!: LevelManager;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    this.levelManager = new LevelManager();

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Floating kittens
    for (let i = 0; i < 10; i++) {
      const emoji = KITTEN_EMOJIS[i % KITTEN_EMOJIS.length];
      const x = Phaser.Math.Between(30, GAME_WIDTH - 30);
      const y = Phaser.Math.Between(30, GAME_HEIGHT - 30);
      const k = this.add.text(x, y, emoji, { fontSize: '20px' })
        .setOrigin(0.5).setAlpha(0.12);
      this.tweens.add({
        targets: k,
        y: y + Phaser.Math.Between(-25, 25),
        x: x + Phaser.Math.Between(-15, 15),
        duration: Phaser.Math.Between(3000, 5000),
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    }

    // Title
    const title = this.add.text(GAME_WIDTH / 2, 70, '🐱 KitCrush', {
      fontSize: '42px', color: '#ff6b9d',
      fontFamily: 'Arial, sans-serif', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5);
    this.tweens.add({
      targets: title, y: 80,
      duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Subtitle
    this.add.text(GAME_WIDTH / 2, 120, 'Match-3 de Gatitos', {
      fontSize: '16px', color: '#aaaaaa',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);

    // Stars
    const totalStars = this.levelManager.getTotalStars();
    if (totalStars > 0) {
      this.add.text(GAME_WIDTH / 2, 148, `⭐ ${totalStars} estrellas`, {
        fontSize: '14px', color: '#ffd43b',
        fontFamily: 'Arial, sans-serif',
      }).setOrigin(0.5);
    }

    // Level grid
    const cols = 5;
    const btnSize = 48;
    const gap = 8;
    const totalW = cols * btnSize + (cols - 1) * gap;
    const startX = (GAME_WIDTH - totalW) / 2;
    const startY = 180;

    for (let i = 0; i < Math.min(LEVELS.length, 15); i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (btnSize + gap) + btnSize / 2;
      const y = startY + row * (btnSize + gap + 10) + btnSize / 2;
      const unlocked = this.levelManager.isUnlocked(i);
      const stars = this.levelManager.levelStars[i] || 0;

      const btn = this.add.graphics();
      btn.fillStyle(unlocked ? KITTEN_COLORS[i % KITTEN_COLORS.length] : 0x333333, unlocked ? 0.6 : 0.5);
      btn.fillRoundedRect(x - btnSize / 2, y - btnSize / 2, btnSize, btnSize, 8);

      this.add.text(x, y - 2, String(i + 1), {
        fontSize: '18px', color: unlocked ? '#fff' : '#666',
        fontFamily: 'Arial, sans-serif', fontStyle: 'bold',
      }).setOrigin(0.5);

      if (stars > 0) {
        this.add.text(x, y + 16, '⭐'.repeat(stars) + '☆'.repeat(3 - stars), {
          fontSize: '7px',
        }).setOrigin(0.5);
      }

      if (!unlocked) {
        this.add.text(x, y - 2, '🔒', { fontSize: '18px' }).setOrigin(0.5);
      }

      if (unlocked) {
        const hit = this.add.rectangle(x, y, btnSize, btnSize, 0x000000, 0)
          .setInteractive({ useHandCursor: true });
        hit.on('pointerdown', () => {
          this.levelManager.goToLevel(i);
          this.scene.start('GameScene', { level: i, levelManager: this.levelManager });
        });
      }
    }

    // Play button
    const btnY = GAME_HEIGHT - 60;
    const btnW = 180;
    const btnH = 44;
    const playBtn = this.add.graphics();
    playBtn.fillStyle(0xff6b9d, 1);
    playBtn.fillRoundedRect(GAME_WIDTH / 2 - btnW / 2, btnY - btnH / 2, btnW, btnH, 10);

    this.add.text(GAME_WIDTH / 2, btnY, '🎮 Jugar', {
      fontSize: '22px', color: '#ffffff',
      fontFamily: 'Arial, sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5);

    const playHit = this.add.rectangle(GAME_WIDTH / 2, btnY, btnW, btnH, 0x000000, 0)
      .setInteractive({ useHandCursor: true });
    playHit.on('pointerdown', () => {
      this.scene.start('GameScene', {
        level: this.levelManager.currentLevel,
        levelManager: this.levelManager,
      });
    });
  }
}
