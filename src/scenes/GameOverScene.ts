// KitCrush — Game Over Scene (Arcade Style)

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/constants';
import { LevelManager } from '../systems/LevelManager';
import { playGameOverSound } from '../utils/sounds';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data: { won: boolean; score: number; stars: number; levelManager: LevelManager }) {
    const { won, score, stars, levelManager } = data;
    playGameOverSound(won);

    // Dark overlay
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0a1a, 0.95);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Grid
    bg.lineStyle(1, 0x151530, 0.2);
    for (let x = 0; x < GAME_WIDTH; x += 24) bg.lineBetween(x, 0, x, GAME_HEIGHT);
    for (let y = 0; y < GAME_HEIGHT; y += 24) bg.lineBetween(0, y, GAME_WIDTH, y);

    // Result text
    const resultText = won ? 'LEVEL CLEAR!' : 'GAME OVER';
    const resultColor = won ? '#ffd43b' : '#ff6b6b';
    const big = this.add.text(GAME_WIDTH / 2, 100, resultText, {
      fontSize: '36px', color: resultColor,
      fontFamily: '"Courier New", monospace', fontStyle: 'bold',
      stroke: resultColor, strokeThickness: 1,
    }).setOrigin(0.5).setScale(0);

    this.tweens.add({
      targets: big, scale: 1, duration: 400, ease: 'Back.easeOut',
    });

    // Stars
    if (won && stars > 0) {
      for (let i = 0; i < 3; i++) {
        const starColor = i < stars ? '#ffd43b' : '#333355';
        const star = this.add.text(GAME_WIDTH / 2 - 50 + i * 50, 170, '★', {
          fontSize: '40px', color: starColor,
        }).setOrigin(0.5).setScale(0);

        this.tweens.add({
          targets: star, scale: 1,
          duration: 250, delay: 300 + i * 150, ease: 'Back.easeOut',
        });
      }
    }

    // Score
    this.add.text(GAME_WIDTH / 2, 240, 'SCORE', {
      fontSize: '10px', color: '#666688',
      fontFamily: '"Courier New", monospace', letterSpacing: 3,
    }).setOrigin(0.5);

    const scoreTxt = this.add.text(GAME_WIDTH / 2, 270, String(score), {
      fontSize: '40px', color: '#ffd43b',
      fontFamily: '"Courier New", monospace', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Animate score counting
    let displayScore = 0;
    const step = Math.ceil(score / 30);
    const counter = this.time.addEvent({
      delay: 30, repeat: 30,
      callback: () => {
        displayScore = Math.min(displayScore + step, score);
        scoreTxt.setText(String(displayScore));
      },
    });

    // Target
    const cfg = levelManager.getCurrentLevelConfig();
    this.add.text(GAME_WIDTH / 2, 310, `TARGET: ${cfg.target}`, {
      fontSize: '12px', color: '#666688',
      fontFamily: '"Courier New", monospace',
    }).setOrigin(0.5);

    // Buttons
    const btnY = 380;
    if (won) {
      this.neonBtn(GAME_WIDTH / 2, btnY, '▶ NEXT LEVEL', '#69db7c', () => {
        levelManager.nextLevel();
        this.scene.start('GameScene', { level: levelManager.currentLevel, levelManager });
      });
      this.neonBtn(GAME_WIDTH / 2, btnY + 55, '↺ RETRY', '#74c0fc', () => {
        this.scene.start('GameScene', { level: levelManager.currentLevel, levelManager });
      });
    } else {
      this.neonBtn(GAME_WIDTH / 2, btnY, '↺ TRY AGAIN', '#ff6b9d', () => {
        this.scene.start('GameScene', { level: levelManager.currentLevel, levelManager });
      });
      this.neonBtn(GAME_WIDTH / 2, btnY + 55, '◄ MENU', '#74c0fc', () => {
        this.scene.start('MenuScene');
      });
    }
  }

  private neonBtn(x: number, y: number, text: string, color: string, cb: () => void) {
    const w = 200, h = 42;
    const c = parseInt(color.slice(1), 16);
    const g = this.add.graphics();
    g.fillStyle(c, 0.12);
    g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
    g.lineStyle(2, c, 0.7);
    g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8);
    g.lineStyle(6, c, 0.08);
    g.strokeRoundedRect(x - w / 2 - 3, y - h / 2 - 3, w + 6, h + 6, 10);

    this.add.text(x, y, text, {
      fontSize: '16px', color, fontFamily: '"Courier New", monospace', fontStyle: 'bold',
    }).setOrigin(0.5);

    const hit = this.add.rectangle(x, y, w, h, 0x000000, 0)
      .setInteractive({ useHandCursor: true });
    hit.on('pointerdown', cb);
  }
}
