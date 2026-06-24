// KitCrush — Tile

import Phaser from 'phaser';
import { TILE_SIZE, TILE_GAP, BOARD_OFFSET_X, BOARD_OFFSET_Y, KITTEN_COLORS, KITTEN_EMOJIS, PowerUpType } from '../utils/constants';

export class Tile extends Phaser.GameObjects.Container {
  public col: number;
  public row: number;
  public kittenType: number;
  public powerUp: PowerUpType | null = null;
  public isSelected = false;
  public isMatched = false;

  private bg: Phaser.GameObjects.Graphics;
  private selOutline: Phaser.GameObjects.Graphics;
  private puIndicator: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, col: number, row: number, kittenType: number) {
    const x = col * (TILE_SIZE + TILE_GAP) + BOARD_OFFSET_X + TILE_SIZE / 2;
    const y = row * (TILE_SIZE + TILE_GAP) + BOARD_OFFSET_Y + TILE_SIZE / 2;
    super(scene, x, y);

    this.col = col;
    this.row = row;
    this.kittenType = kittenType;

    // Background
    this.bg = scene.add.graphics();
    this.drawBg();
    this.add(this.bg);

    // Emoji
    const emoji = scene.add.text(0, 0, KITTEN_EMOJIS[kittenType], {
      fontSize: `${Math.floor(TILE_SIZE * 0.6)}px`, align: 'center',
    }).setOrigin(0.5);
    this.add(emoji);

    // Selection outline
    this.selOutline = scene.add.graphics().setVisible(false);
    this.add(this.selOutline);

    // Power-up indicator
    this.puIndicator = scene.add.graphics().setVisible(false);
    this.add(this.puIndicator);

    this.setSize(TILE_SIZE, TILE_SIZE);
    this.setInteractive();
    scene.add.existing(this);
  }

  private drawBg() {
    const s = TILE_SIZE;
    this.bg.clear();
    this.bg.fillStyle(KITTEN_COLORS[this.kittenType], 0.3);
    this.bg.fillRoundedRect(-s / 2, -s / 2, s, s, 10);
    this.bg.lineStyle(2, KITTEN_COLORS[this.kittenType], 0.6);
    this.bg.strokeRoundedRect(-s / 2, -s / 2, s, s, 10);
  }

  select() {
    this.isSelected = true;
    const s = TILE_SIZE;
    this.selOutline.clear();
    this.selOutline.lineStyle(3, 0xffffff, 1);
    this.selOutline.strokeRoundedRect(-s / 2 - 2, -s / 2 - 2, s + 4, s + 4, 12);
    this.selOutline.setVisible(true);
    this.scene.tweens.add({
      targets: this, scaleX: 1.12, scaleY: 1.12,
      duration: 80, yoyo: true, ease: 'Back.easeOut',
    });
  }

  deselect() {
    this.isSelected = false;
    this.selOutline.setVisible(false);
  }

  setPowerUp(type: PowerUpType) {
    this.powerUp = type;
    const colors: Record<PowerUpType, number> = {
      row: 0xff6b6b, column: 0x74c0fc, bomb: 0xffa94d, rainbow: 0xffd43b,
    };
    this.puIndicator.clear();
    this.puIndicator.lineStyle(3, colors[type], 0.9);
    this.puIndicator.strokeCircle(0, 0, TILE_SIZE / 2 - 3);
    this.puIndicator.setVisible(true);
    this.scene.tweens.add({
      targets: this.puIndicator, alpha: { from: 0.4, to: 1 },
      duration: 500, yoyo: true, repeat: -1,
    });
  }

  activatePowerUp(): { type: PowerUpType; col: number; row: number } | null {
    if (!this.powerUp) return null;
    const t = this.powerUp;
    this.powerUp = null;
    this.puIndicator.setVisible(false);
    return { type: t, col: this.col, row: this.row };
  }

  playMatchEffect() {
    this.isMatched = true;
    this.scene.tweens.add({
      targets: this, scaleX: 1.3, scaleY: 1.3, alpha: 0,
      duration: 200, ease: 'Power2',
      onComplete: () => this.destroy(),
    });
    // Particles
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const p = this.scene.add.graphics();
      p.fillStyle(KITTEN_COLORS[this.kittenType], 1);
      p.fillCircle(0, 0, 3);
      p.setPosition(this.x, this.y);
      this.scene.tweens.add({
        targets: p,
        x: this.x + Math.cos(angle) * 35,
        y: this.y + Math.sin(angle) * 35,
        alpha: 0, duration: 300, ease: 'Power2',
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
