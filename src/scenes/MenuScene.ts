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

    // Background gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Floating kitten particles
    this.createFloatingKittens();

    // Title
    const title = this.add.text(GAME_WIDTH / 2, 80, '🐱 KitCrush', {
      fontSize: '48px',
      color: '#ff6b9d',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Bounce title
    this.tweens.add({
      targets: title,
      y: 90,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Subtitle
    this.add.text(GAME_WIDTH / 2, 135, 'Match-3 de Gatitos', {
      fontSize: '18px',
      color: '#aaaaaa',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);

    // Total stars
    const totalStars = this.levelManager.getTotalStars();
    if (totalStars > 0) {
      this.add.text(GAME_WIDTH / 2, 165, `⭐ ${totalStars} estrellas`, {
        fontSize: '16px',
        color: '#ffd43b',
        fontFamily: 'Arial, sans-serif',
      }).setOrigin(0.5);
    }

    // Level buttons (scrollable)
    this.createLevelGrid();

    // Play button (next level)
    this.createPlayButton();
  }

  private createFloatingKittens() {
    for (let i = 0; i < 12; i++) {
      const emoji = KITTEN_EMOJIS[i % KITTEN_EMOJIS.length];
      const x = Phaser.Math.Between(20, GAME_WIDTH - 20);
      const y = Phaser.Math.Between(20, GAME_HEIGHT - 20);

      const kitten = this.add.text(x, y, emoji, {
        fontSize: '24px',
      }).setOrigin(0.5).setAlpha(0.15);

      this.tweens.add({
        targets: kitten,
        y: y + Phaser.Math.Between(-30, 30),
        x: x + Phaser.Math.Between(-20, 20),
        duration: Phaser.Math.Between(3000, 6000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  private createLevelGrid() {
    const startY = 210;
    const cols = 5;
    const buttonSize = 52;
    const gap = 10;
    const totalWidth = cols * buttonSize + (cols - 1) * gap;
    const startX = (GAME_WIDTH - totalWidth) / 2;

    const visibleLevels = Math.min(LEVELS.length, 15); // Show first 15

    for (let i = 0; i < visibleLevels; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (buttonSize + gap) + buttonSize / 2;
      const y = startY + row * (buttonSize + gap + 8) + buttonSize / 2;

      const isUnlocked = this.levelManager.isUnlocked(i);
      const stars = this.levelManager.levelStars[i] || 0;

      // Button background
      const btn = this.add.graphics();
      if (isUnlocked) {
        btn.fillStyle(KITTEN_COLORS[i % KITTEN_COLORS.length], 0.6);
      } else {
        btn.fillStyle(0x333333, 0.5);
      }
      btn.fillRoundedRect(x - buttonSize / 2, y - buttonSize / 2, buttonSize, buttonSize, 10);

      // Level number
      this.add.text(x, y - 4, String(i + 1), {
        fontSize: '20px',
        color: isUnlocked ? '#ffffff' : '#666666',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
      }).setOrigin(0.5);

      // Stars
      if (stars > 0) {
        const starsText = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
        this.add.text(x, y + 16, starsText, {
          fontSize: '8px',
        }).setOrigin(0.5);
      }

      // Lock icon
      if (!isUnlocked) {
        this.add.text(x, y - 2, '🔒', {
          fontSize: '20px',
        }).setOrigin(0.5);
      }

      // Interactive
      if (isUnlocked) {
        const hitArea = this.add.rectangle(x, y, buttonSize, buttonSize, 0x000000, 0)
          .setInteractive({ useHandCursor: true });

        hitArea.on('pointerdown', () => {
          this.levelManager.goToLevel(i);
          this.scene.start('GameScene', { level: i, levelManager: this.levelManager });
        });

        hitArea.on('pointerover', () => {
          btn.clear();
          btn.fillStyle(KITTEN_COLORS[i % KITTEN_COLORS.length], 0.9);
          btn.fillRoundedRect(x - buttonSize / 2, y - buttonSize / 2, buttonSize, buttonSize, 10);
        });

        hitArea.on('pointerout', () => {
          btn.clear();
          btn.fillStyle(KITTEN_COLORS[i % KITTEN_COLORS.length], 0.6);
          btn.fillRoundedRect(x - buttonSize / 2, y - buttonSize / 2, buttonSize, buttonSize, 10);
        });
      }
    }
  }

  private createPlayButton() {
    const y = GAME_HEIGHT - 70;
    const btnWidth = 200;
    const btnHeight = 50;

    const btn = this.add.graphics();
    btn.fillStyle(0xff6b9d, 1);
    btn.fillRoundedRect(GAME_WIDTH / 2 - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 12);

    const text = this.add.text(GAME_WIDTH / 2, y, '🎮 Jugar', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const hitArea = this.add.rectangle(GAME_WIDTH / 2, y, btnWidth, btnHeight, 0x000000, 0)
      .setInteractive({ useHandCursor: true });

    hitArea.on('pointerdown', () => {
      const level = this.levelManager.currentLevel;
      this.scene.start('GameScene', { level, levelManager: this.levelManager });
    });

    hitArea.on('pointerover', () => {
      btn.clear();
      btn.fillStyle(0xff85b1, 1);
      btn.fillRoundedRect(GAME_WIDTH / 2 - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 12);
    });

    hitArea.on('pointerout', () => {
      btn.clear();
      btn.fillStyle(0xff6b9d, 1);
      btn.fillRoundedRect(GAME_WIDTH / 2 - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 12);
    });
  }
}
