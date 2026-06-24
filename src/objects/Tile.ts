// KitCrush — Tile (arcade style with SVG sprites)

import Phaser from 'phaser';
import {
  TILE_SIZE, TILE_GAP, BOARD_OFFSET_X, BOARD_OFFSET_Y,
  KITTEN_COLORS, PowerUpType,
} from '../utils/constants';
import { KITTEN_COLORS_HEX } from '../utils/kitten-svg';

export class Tile extends Phaser.GameObjects.Container {
  public col: number;
  public row: number;
  public kittenType: number;
  public powerUp: PowerUpType | null = null;
  public isSelected = false;
  public isMatched = false;

  private bg: Phaser.GameObjects.Graphics;
  private sprite: Phaser.GameObjects.Image;
  private selGlow: Phaser.GameObjects.Graphics;
  private puGlow: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, col: number, row: number, kittenType: number) {
    const x = col * (TILE_SIZE + TILE_GAP) + BOARD_OFFSET_X + TILE_SIZE / 2;
    const y = row * (TILE_SIZE + TILE_GAP) + BOARD_OFFSET_Y + TILE_SIZE / 2;
    super(scene, x, y);

    this.col = col;
    this.row = row;
    this.kittenType = kittenType;

    // Background tile
    this.bg = scene.add.graphics();
    this.drawBg();
    this.add(this.bg);

    // SVG kitten sprite
    this.sprite = scene.add.image(0, 0, `kitten_${kittenType}`);
    this.sprite.setDisplaySize(TILE_SIZE - 6, TILE_SIZE - 6);
    this.add(this.sprite);

    // Selection glow
    this.selGlow = scene.add.graphics().setVisible(false);
    this.add(this.selGlow);

    // Power-up glow
    this.puGlow = scene.add.graphics().setVisible(false);
    this.add(this.puGlow);

    this.setSize(TILE_SIZE, TILE_SIZE);
    this.setInteractive();
    scene.add.existing(this);
  }

  private drawBg() {
    const s = TILE_SIZE;
    this.bg.clear();
    // Dark rounded square with colored border
    this.bg.fillStyle(0x1e1e3a, 0.8);
    this.bg.fillRoundedRect(-s / 2, -s / 2, s, s, 10);
    this.bg.lineStyle(2, KITTEN_COLORS[this.kittenType], 0.5);
    this.bg.strokeRoundedRect(-s / 2, -s / 2, s, s, 10);
  }

  select() {
    this.isSelected = true;
    const s = TILE_SIZE;
    this.selGlow.clear();
    // Neon glow effect
    this.selGlow.lineStyle(3, 0xffffff, 0.9);
    this.selGlow.strokeRoundedRect(-s / 2 - 3, -s / 2 - 3, s + 6, s + 6, 12);
    this.selGlow.lineStyle(6, KITTEN_COLORS[this.kittenType], 0.3);
    this.selGlow.strokeRoundedRect(-s / 2 - 5, -s / 2 - 5, s + 10, s + 10, 14);
    this.selGlow.setVisible(true);

    this.scene.tweens.add({
      targets: this, scaleX: 1.12, scaleY: 1.12,
      duration: 80, yoyo: true, ease: 'Back.easeOut',
    });
  }

  deselect() {
    this.isSelected = false;
    this.selGlow.setVisible(false);
  }

  setPowerUp(type: PowerUpType) {
    this.powerUp = type;
    const colors: Record<PowerUpType, number> = {
      row: 0xff6b6b, column: 0x74c0fc, bomb: 0xffa94d, rainbow: 0xffd43b,
    };
    this.puGlow.clear();
    this.puGlow.lineStyle(3, colors[type], 0.8);
    this.puGlow.strokeCircle(0, 0, TILE_SIZE / 2 - 2);
    this.puGlow.setVisible(true);

    this.scene.tweens.add({
      targets: this.puGlow, alpha: { from: 0.3, to: 1 },
      duration: 500, yoyo: true, repeat: -1,
    });
  }

  activatePowerUp(): { type: PowerUpType; col: number; row: number } | null {
    if (!this.powerUp) return null;
    const t = this.powerUp;
    this.powerUp = null;
    this.puGlow.setVisible(false);
    return { type: t, col: this.col, row: this.row };
  }

  playMatchEffect() {
    this.isMatched = true;

    // Flash white
    const flash = this.scene.add.graphics();
    flash.fillStyle(0xffffff, 0.6);
    flash.fillRoundedRect(-TILE_SIZE / 2, -TILE_SIZE / 2, TILE_SIZE, TILE_SIZE, 10);
    this.add(flash);
    this.scene.tweens.add({
      targets: flash, alpha: 0, duration: 150,
      onComplete: () => flash.destroy(),
    });

    // Scale + fade
    this.scene.tweens.add({
      targets: this, scaleX: 1.4, scaleY: 1.4, alpha: 0,
      duration: 220, ease: 'Power2',
      onComplete: () => this.destroy(),
    });

    // Particles
    this.spawnParticles();
  }

  private spawnParticles() {
    const color = KITTEN_COLORS[this.kittenType];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const dist = 25 + Math.random() * 20;
      const p = this.scene.add.graphics();
      p.fillStyle(color, 1);
      const pSize = 2 + Math.random() * 3;
      p.fillCircle(0, 0, pSize);
      p.setPosition(this.x, this.y);

      this.scene.tweens.add({
        targets: p,
        x: this.x + Math.cos(angle) * dist,
        y: this.y + Math.sin(angle) * dist,
        alpha: 0, scaleX: 0.3, scaleY: 0.3,
        duration: 300 + Math.random() * 150,
        ease: 'Power2',
        onComplete: () => p.destroy(),
      });
    }
  }

  setGridPos(col: number, row: number) {
    this.col = col;
    this.row = row;
  }

  getWorldPos() {
    return {
      x: this.col * (TILE_SIZE + TILE_GAP) + BOARD_OFFSET_X + TILE_SIZE / 2,
      y: this.row * (TILE_SIZE + TILE_GAP) + BOARD_OFFSET_Y + TILE_SIZE / 2,
    };
  }

  updatePosition(animated = true) {
    const p = this.getWorldPos();
    if (animated) {
      this.scene.tweens.add({ targets: this, x: p.x, y: p.y, duration: 120, ease: 'Power2' });
    } else {
      this.setPosition(p.x, p.y);
    }
  }
}
