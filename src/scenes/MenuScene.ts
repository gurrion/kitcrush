// KitCrush — Menu Scene (Arcade Style)

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, LEVELS, KITTEN_TYPES } from '../utils/constants';
import { LevelManager } from '../systems/LevelManager';
import { KITTEN_COLORS_HEX } from '../utils/kitten-svg';

export class MenuScene extends Phaser.Scene {
  private levelManager!: LevelManager;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    this.levelManager = new LevelManager();

    // Background with grid
    this.drawArcadeBg();

    // Title with neon glow
    const title = this.add.text(GAME_WIDTH / 2, 65, 'KITCRUSH', {
      fontSize: '48px', color: '#ff6b9d',
      fontFamily: '"Courier New", monospace', fontStyle: 'bold',
      stroke: '#ff6b9d', strokeThickness: 1,
    }).setOrigin(0.5);

    // Title glow animation
    this.tweens.add({
      targets: title, alpha: { from: 0.7, to: 1 },
      duration: 1200, yoyo: true, repeat: -1,
    });

    // Subtitle
    this.add.text(GAME_WIDTH / 2, 100, '★ MATCH-3 DE GATITOS ★', {
      fontSize: '12px', color: '#ffd43b',
      fontFamily: '"Courier New", monospace', letterSpacing: 3,
    }).setOrigin(0.5);

    // Stars
    const totalStars = this.levelManager.getTotalStars();
    if (totalStars > 0) {
      this.add.text(GAME_WIDTH / 2, 122, `⭐ ${totalStars} ESTRELLAS`, {
        fontSize: '11px', color: '#ffd43b',
        fontFamily: '"Courier New", monospace',
      }).setOrigin(0.5);
    }

    // Level grid
    this.createLevelSelect();

    // Play button (neon style)
    this.createNeonButton(GAME_WIDTH / 2, GAME_HEIGHT - 50, '▶  JUGAR', '#ff6b9d', () => {
      this.scene.start('GameScene', {
        level: this.levelManager.currentLevel,
        levelManager: this.levelManager,
      });
    });
  }

  private drawArcadeBg() {
    const bg = this.add.graphics();

    // Dark gradient
    bg.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x141428, 0x141428, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Grid lines
    bg.lineStyle(1, 0x1a1a3a, 0.3);
    for (let x = 0; x < GAME_WIDTH; x += 30) {
      bg.lineBetween(x, 0, x, GAME_HEIGHT);
    }
    for (let y = 0; y < GAME_HEIGHT; y += 30) {
      bg.lineBetween(0, y, GAME_WIDTH, y);
    }

    // Floating dots
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(10, GAME_WIDTH - 10);
      const y = Phaser.Math.Between(10, GAME_HEIGHT - 10);
      const dot = this.add.graphics();
      dot.fillStyle(0xff6b9d, 0.08);
      dot.fillCircle(x, y, 2);

      this.tweens.add({
        targets: dot, alpha: { from: 0.05, to: 0.15 },
        duration: Phaser.Math.Between(2000, 4000),
        yoyo: true, repeat: -1,
      });
    }
  }

  private createLevelSelect() {
    const cols = 5;
    const btnSize = 44;
    const gap = 8;
    const totalW = cols * btnSize + (cols - 1) * gap;
    const startX = (GAME_WIDTH - totalW) / 2;
    const startY = 155;

    for (let i = 0; i < Math.min(LEVELS.length, 15); i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (btnSize + gap) + btnSize / 2;
      const y = startY + row * (btnSize + gap + 12) + btnSize / 2;
      const unlocked = this.levelManager.isUnlocked(i);
      const stars = this.levelManager.levelStars[i] || 0;

      const g = this.add.graphics();

      if (unlocked) {
        // Filled with color
        g.fillStyle(parseInt(KITTEN_COLORS_HEX[i % 6].slice(1), 16), 0.2);
        g.fillRoundedRect(x - btnSize / 2, y - btnSize / 2, btnSize, btnSize, 6);
        g.lineStyle(1, parseInt(KITTEN_COLORS_HEX[i % 6].slice(1), 16), 0.6);
        g.strokeRoundedRect(x - btnSize / 2, y - btnSize / 2, btnSize, btnSize, 6);
      } else {
        g.fillStyle(0x1a1a2e, 0.5);
        g.fillRoundedRect(x - btnSize / 2, y - btnSize / 2, btnSize, btnSize, 6);
        g.lineStyle(1, 0x333355, 0.3);
        g.strokeRoundedRect(x - btnSize / 2, y - btnSize / 2, btnSize, btnSize, 6);
      }

      // Number
      this.add.text(x, y - 4, String(i + 1), {
        fontSize: '16px', color: unlocked ? '#ffffff' : '#444466',
        fontFamily: '"Courier New", monospace', fontStyle: 'bold',
      }).setOrigin(0.5);

      // Stars
      if (stars > 0) {
        this.add.text(x, y + 14, '★'.repeat(stars) + '☆'.repeat(3 - stars), {
          fontSize: '7px', color: '#ffd43b',
        }).setOrigin(0.5);
      }

      // Lock
      if (!unlocked) {
        this.add.text(x, y - 2, '🔒', { fontSize: '16px' }).setOrigin(0.5);
      }

      // Interactive
      if (unlocked) {
        const hit = this.add.rectangle(x, y, btnSize, btnSize, 0x000000, 0)
          .setInteractive({ useHandCursor: true });
        hit.on('pointerdown', () => {
          this.levelManager.goToLevel(i);
          this.scene.start('GameScene', { level: i, levelManager: this.levelManager });
        });
        hit.on('pointerover', () => {
          g.clear();
          g.fillStyle(parseInt(KITTEN_COLORS_HEX[i % 6].slice(1), 16), 0.4);
          g.fillRoundedRect(x - btnSize / 2, y - btnSize / 2, btnSize, btnSize, 6);
          g.lineStyle(2, parseInt(KITTEN_COLORS_HEX[i % 6].slice(1), 16), 0.9);
          g.strokeRoundedRect(x - btnSize / 2, y - btnSize / 2, btnSize, btnSize, 6);
        });
        hit.on('pointerout', () => {
          g.clear();
          g.fillStyle(parseInt(KITTEN_COLORS_HEX[i % 6].slice(1), 16), 0.2);
          g.fillRoundedRect(x - btnSize / 2, y - btnSize / 2, btnSize, btnSize, 6);
          g.lineStyle(1, parseInt(KITTEN_COLORS_HEX[i % 6].slice(1), 16), 0.6);
          g.strokeRoundedRect(x - btnSize / 2, y - btnSize / 2, btnSize, btnSize, 6);
        });
      }
    }
  }

  private createNeonButton(x: number, y: number, text: string, color: string, cb: () => void) {
    const w = 200, h = 44;
    const colorNum = parseInt(color.slice(1), 16);

    const g = this.add.graphics();
    g.fillStyle(colorNum, 0.15);
    g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
    g.lineStyle(2, colorNum, 0.8);
    g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8);

    // Outer glow
    g.lineStyle(6, colorNum, 0.1);
    g.strokeRoundedRect(x - w / 2 - 3, y - h / 2 - 3, w + 6, h + 6, 10);

    this.add.text(x, y, text, {
      fontSize: '18px', color, fontFamily: '"Courier New", monospace', fontStyle: 'bold',
    }).setOrigin(0.5);

    const hit = this.add.rectangle(x, y, w, h, 0x000000, 0)
      .setInteractive({ useHandCursor: true });
    hit.on('pointerdown', cb);
  }
}
