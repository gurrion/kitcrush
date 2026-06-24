// KitCrush — Game Over Scene

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, KITTEN_EMOJIS, KITTEN_COLORS } from '../utils/constants';
import { LevelManager } from '../systems/LevelManager';
import { playGameOverSound } from '../utils/sounds';

interface GameOverData {
  won: boolean;
  score: number;
  stars: number;
  levelManager: LevelManager;
}

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data: GameOverData) {
    const { won, score, stars, levelManager } = data;

    playGameOverSound(won);

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x0f0f23, 0x0f0f23, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Result icon
    const icon = won ? '🎉' : '😿';
    const iconText = this.add.text(GAME_WIDTH / 2, 100, icon, {
      fontSize: '80px',
    }).setOrigin(0.5).setScale(0);

    this.tweens.add({
      targets: iconText,
      scale: 1,
      duration: 500,
      ease: 'Back.easeOut',
    });

    // Title
    const title = won ? '¡Nivel Completado!' : '¡Sin Movimientos!';
    const titleText = this.add.text(GAME_WIDTH / 2, 180, title, {
      fontSize: '32px',
      color: won ? '#ffd43b' : '#ff6b6b',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Stars (if won)
    if (won && stars > 0) {
      const starSize = 40;
      const starGap = 10;
      const totalStarWidth = 3 * starSize + 2 * starGap;
      const startX = GAME_WIDTH / 2 - totalStarWidth / 2 + starSize / 2;

      for (let i = 0; i < 3; i++) {
        const x = startX + i * (starSize + starGap);
        const star = this.add.text(x, 240, i < stars ? '⭐' : '☆', {
          fontSize: `${starSize}px`,
        }).setOrigin(0.5).setScale(0);

        this.tweens.add({
          targets: star,
          scale: 1,
          duration: 300,
          delay: 300 + i * 200,
          ease: 'Back.easeOut',
        });
      }
    }

    // Score
    this.add.text(GAME_WIDTH / 2, 310, `🏆 ${score} puntos`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);

    // Level config
    const levelConfig = levelManager.getCurrentLevelConfig();
    this.add.text(GAME_WIDTH / 2, 345, `Meta: ${levelConfig.target}`, {
      fontSize: '16px',
      color: '#aaaaaa',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);

    // Buttons
    const buttonY = 420;

    if (won) {
      // Next Level button
      this.createButton(GAME_WIDTH / 2, buttonY, '▶ Siguiente Nivel', 0x69db7c, () => {
        levelManager.nextLevel();
        this.scene.start('GameScene', {
          level: levelManager.currentLevel,
          levelManager,
        });
      });

      // Replay button
      this.createButton(GAME_WIDTH / 2, buttonY + 65, '🔄 Repetir Nivel', 0x74c0fc, () => {
        this.scene.start('GameScene', {
          level: levelManager.currentLevel,
          levelManager,
        });
      });
    } else {
      // Retry button
      this.createButton(GAME_WIDTH / 2, buttonY, '🔄 Reintentar', 0xff6b9d, () => {
        this.scene.start('GameScene', {
          level: levelManager.currentLevel,
          levelManager,
        });
      });

      // Menu button
      this.createButton(GAME_WIDTH / 2, buttonY + 65, '🏠 Menú Principal', 0x74c0fc, () => {
        this.scene.start('MenuScene');
      });
    }

    // Floating kittens background
    for (let i = 0; i < 8; i++) {
      const emoji = KITTEN_EMOJIS[i % KITTEN_EMOJIS.length];
      const kitten = this.add.text(
        Phaser.Math.Between(30, GAME_WIDTH - 30),
        Phaser.Math.Between(GAME_HEIGHT - 150, GAME_HEIGHT - 50),
        emoji,
        { fontSize: '20px' }
      ).setOrigin(0.5).setAlpha(0.2);

      this.tweens.add({
        targets: kitten,
        y: kitten.y - Phaser.Math.Between(20, 60),
        duration: Phaser.Math.Between(2000, 4000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  private createButton(
    x: number, y: number, text: string, color: number,
    callback: () => void
  ) {
    const btnWidth = 240;
    const btnHeight = 48;

    const btn = this.add.graphics();
    btn.fillStyle(color, 0.8);
    btn.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 12);

    const label = this.add.text(x, y, text, {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const hitArea = this.add.rectangle(x, y, btnWidth, btnHeight, 0x000000, 0)
      .setInteractive({ useHandCursor: true });

    hitArea.on('pointerdown', callback);

    hitArea.on('pointerover', () => {
      btn.clear();
      btn.fillStyle(color, 1);
      btn.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 12);
    });

    hitArea.on('pointerout', () => {
      btn.clear();
      btn.fillStyle(color, 0.8);
      btn.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 12);
    });
  }
}
