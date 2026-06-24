// KitCrush — Tile (Kitten piece)

import Phaser from 'phaser';
import { TILE_SIZE, KITTEN_COLORS, KITTEN_EMOJIS, PowerUpType } from '../utils/constants';

export class Tile extends Phaser.GameObjects.Container {
  public col: number;
  public row: number;
  public kittenType: number;
  public powerUp: PowerUpType | null = null;
  public isSelected: boolean = false;
  public isMatched: boolean = false;

  private bg: Phaser.GameObjects.Graphics;
  private emojiText: Phaser.GameObjects.Text;
  private selectedOutline: Phaser.GameObjects.Graphics;
  private powerUpIndicator: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, col: number, row: number, kittenType: number) {
    const x = col * (TILE_SIZE + 4) + 16 + TILE_SIZE / 2;
    const y = row * (TILE_SIZE + 4) + 160 + TILE_SIZE / 2;

    super(scene, x, y);

    this.col = col;
    this.row = row;
    this.kittenType = kittenType;

    // Background rounded rect
    this.bg = scene.add.graphics();
    this.drawBg();
    this.add(this.bg);

    // Emoji kitten
    this.emojiText = scene.add.text(0, 0, KITTEN_EMOJIS[kittenType], {
      fontSize: '36px',
      align: 'center',
    }).setOrigin(0.5);
    this.add(this.emojiText);

    // Selection outline (hidden by default)
    this.selectedOutline = scene.add.graphics();
    this.selectedOutline.setVisible(false);
    this.add(this.selectedOutline);

    // Power-up indicator (hidden by default)
    this.powerUpIndicator = scene.add.graphics();
    this.powerUpIndicator.setVisible(false);
    this.add(this.powerUpIndicator);

    this.setSize(TILE_SIZE, TILE_SIZE);
    this.setInteractive();

    scene.add.existing(this);
  }

  private drawBg() {
    this.bg.clear();
    this.bg.fillStyle(KITTEN_COLORS[this.kittenType], 0.3);
    this.bg.fillRoundedRect(-TILE_SIZE / 2, -TILE_SIZE / 2, TILE_SIZE, TILE_SIZE, 12);
    this.bg.lineStyle(2, KITTEN_COLORS[this.kittenType], 0.6);
    this.bg.strokeRoundedRect(-TILE_SIZE / 2, -TILE_SIZE / 2, TILE_SIZE, TILE_SIZE, 12);
  }

  select() {
    this.isSelected = true;
    this.selectedOutline.clear();
    this.selectedOutline.lineStyle(3, 0xffffff, 1);
    this.selectedOutline.strokeRoundedRect(-TILE_SIZE / 2 - 2, -TILE_SIZE / 2 - 2, TILE_SIZE + 4, TILE_SIZE + 4, 14);
    this.selectedOutline.setVisible(true);

    // Bounce effect
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 100,
      yoyo: true,
      ease: 'Back.easeOut',
    });
  }

  deselect() {
    this.isSelected = false;
    this.selectedOutline.setVisible(false);
  }

  setPowerUp(type: PowerUpType) {
    this.powerUp = type;
    this.powerUpIndicator.clear();

    let color: number;
    let symbol: string;

    switch (type) {
      case 'row':
        color = 0xff6b6b;
        symbol = '↔';
        break;
      case 'column':
        color = 0x74c0fc;
        symbol = '↕';
        break;
      case 'bomb':
        color = 0xffa94d;
        symbol = '💥';
        break;
      case 'rainbow':
        color = 0xffd43b;
        symbol = '🌈';
        break;
    }

    // Glowing border for power-up
    this.powerUpIndicator.lineStyle(3, color, 0.9);
    this.powerUpIndicator.strokeCircle(0, 0, TILE_SIZE / 2 - 4);
    this.powerUpIndicator.setVisible(true);

    // Pulsing animation
    this.scene.tweens.add({
      targets: this.powerUpIndicator,
      alpha: { from: 0.5, to: 1 },
      duration: 600,
      yoyo: true,
      repeat: -1,
    });
  }

  activatePowerUp(): { type: PowerUpType; col: number; row: number } | null {
    if (!this.powerUp) return null;
    const type = this.powerUp;
    this.powerUp = null;
    this.powerUpIndicator.setVisible(false);
    return { type, col: this.col, row: this.row };
  }

  playMatchEffect() {
    this.isMatched = true;

    // Scale up + fade out
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: 0,
      duration: 250,
      ease: 'Power2',
      onComplete: () => {
        this.destroy();
      },
    });

    // Spawn particles
    this.spawnParticles();
  }

  private spawnParticles() {
    const count = 6;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const particle = this.scene.add.graphics();
      particle.fillStyle(KITTEN_COLORS[this.kittenType], 1);
      particle.fillCircle(0, 0, 4);
      particle.setPosition(this.x, this.y);

      this.scene.tweens.add({
        targets: particle,
        x: this.x + Math.cos(angle) * 40,
        y: this.y + Math.sin(angle) * 40,
        alpha: 0,
        duration: 400,
        ease: 'Power2',
        onComplete: () => particle.destroy(),
      });
    }
  }

  playFallEffect(targetY: number, delay: number = 0) {
    this.scene.tweens.add({
      targets: this,
      y: targetY,
      duration: 200 + delay * 30,
      delay: delay,
      ease: 'Bounce.easeOut',
    });
  }

  setGridPos(col: number, row: number) {
    this.col = col;
    this.row = row;
  }

  getWorldPos(): { x: number; y: number } {
    const targetX = this.col * (TILE_SIZE + 4) + 16 + TILE_SIZE / 2;
    const targetY = this.row * (TILE_SIZE + 4) + 160 + TILE_SIZE / 2;
    return { x: targetX, y: targetY };
  }

  updatePosition(animated: boolean = true) {
    const pos = this.getWorldPos();
    if (animated) {
      this.scene.tweens.add({
        targets: this,
        x: pos.x,
        y: pos.y,
        duration: 150,
        ease: 'Power2',
      });
    } else {
      this.setPosition(pos.x, pos.y);
    }
  }
}
