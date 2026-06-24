// KitCrush — Advanced Particle System

import Phaser from 'phaser';
import { KITTEN_COLORS } from './constants';

export class ParticleManager {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  // Match explosion — radial burst
  matchExplosion(x: number, y: number, color: number, count: number = 12) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3;
      const dist = 30 + Math.random() * 30;
      const size = 2 + Math.random() * 4;
      const duration = 250 + Math.random() * 200;

      const p = this.scene.add.graphics();
      p.fillStyle(color, 1);
      p.fillCircle(0, 0, size);
      p.setPosition(x, y);

      this.scene.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0, scaleX: 0.2, scaleY: 0.2,
        duration, ease: 'Power3',
        onComplete: () => p.destroy(),
      });
    }
  }

  // Sparkle ring
  sparkleRing(x: number, y: number, color: number) {
    const count = 16;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const dist = 20;
      const star = this.scene.add.graphics();
      star.fillStyle(0xffffff, 1);
      // Tiny cross shape
      star.fillRect(-1, -4, 2, 8);
      star.fillRect(-4, -1, 8, 2);
      star.setPosition(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist);
      star.setRotation(angle);
      star.setAlpha(0);

      this.scene.tweens.add({
        targets: star,
        alpha: { from: 0, to: 1 },
        scaleX: { from: 0, to: 1.5 },
        scaleY: { from: 0, to: 1.5 },
        duration: 200,
        delay: i * 20,
        yoyo: true,
        onComplete: () => star.destroy(),
      });
    }
  }

  // Combo fire trail
  comboFire(x: number, y: number, level: number) {
    const colors = [0xffd43b, 0xffa94d, 0xff6b6b, 0xb197fc, 0xff6b9d];
    const color = colors[Math.min(level, colors.length - 1)];
    const count = 6 + level * 2;

    for (let i = 0; i < count; i++) {
      const px = x + Phaser.Math.Between(-30, 30);
      const py = y + Phaser.Math.Between(-10, 10);
      const size = 2 + Math.random() * 3;

      const p = this.scene.add.graphics();
      p.fillStyle(color, 0.9);
      p.fillCircle(0, 0, size);
      p.setPosition(px, py);

      this.scene.tweens.add({
        targets: p,
        y: py - 40 - Math.random() * 30,
        x: px + Phaser.Math.Between(-15, 15),
        alpha: 0, scaleX: 0.1, scaleY: 0.1,
        duration: 400 + Math.random() * 300,
        ease: 'Power2',
        onComplete: () => p.destroy(),
      });
    }
  }

  // Power-up shockwave
  shockwave(x: number, y: number, color: number) {
    const ring = this.scene.add.graphics();
    ring.lineStyle(3, color, 0.8);
    ring.strokeCircle(0, 0, 10);
    ring.setPosition(x, y);

    this.scene.tweens.add({
      targets: ring,
      scaleX: 8, scaleY: 8, alpha: 0,
      duration: 400, ease: 'Power2',
      onComplete: () => ring.destroy(),
    });

    // Inner flash
    const flash = this.scene.add.graphics();
    flash.fillStyle(0xffffff, 0.5);
    flash.fillCircle(0, 0, 30);
    flash.setPosition(x, y);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0, scaleX: 2, scaleY: 2,
      duration: 200,
      onComplete: () => flash.destroy(),
    });
  }

  // Row/column destruction beam
  destructionBeam(startX: number, startY: number, endX: number, endY: number, color: number) {
    const beam = this.scene.add.graphics();
    beam.lineStyle(4, color, 0.8);
    beam.lineBetween(startX, startY, endX, endY);
    beam.lineStyle(8, color, 0.2);
    beam.lineBetween(startX, startY, endX, endY);

    this.scene.tweens.add({
      targets: beam, alpha: 0,
      duration: 300, ease: 'Power2',
      onComplete: () => beam.destroy(),
    });
  }

  // Screen flash overlay
  screenFlash(color: number = 0xffffff, alpha: number = 0.15) {
    const flash = this.scene.add.graphics();
    flash.fillStyle(color, alpha);
    flash.fillRect(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height);
    flash.setDepth(999);

    this.scene.tweens.add({
      targets: flash, alpha: 0,
      duration: 200,
      onComplete: () => flash.destroy(),
    });
  }

  // Confetti for win
  confetti(count: number = 30) {
    const colors = [0xff6b9d, 0xffd43b, 0x69db7c, 0x74c0fc, 0xb197fc, 0xffa94d];
    const w = this.scene.cameras.main.width;

    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(0, w);
      const color = colors[i % colors.length];
      const size = 3 + Math.random() * 4;
      const isRect = Math.random() > 0.5;

      const p = this.scene.add.graphics();
      if (isRect) {
        p.fillStyle(color, 0.9);
        p.fillRect(-size / 2, -size, size, size * 2);
      } else {
        p.fillStyle(color, 0.9);
        p.fillCircle(0, 0, size);
      }
      p.setPosition(x, -20);

      this.scene.tweens.add({
        targets: p,
        y: this.scene.cameras.main.height + 30,
        x: x + Phaser.Math.Between(-80, 80),
        rotation: Phaser.Math.Between(-6, 6),
        duration: 1500 + Math.random() * 1500,
        delay: i * 30,
        ease: 'Power1',
        onComplete: () => p.destroy(),
      });
    }
  }

  // Idle floating sparkle on tile
  idleSparkle(x: number, y: number, color: number) {
    const sparkle = this.scene.add.graphics();
    sparkle.fillStyle(0xffffff, 0.6);
    sparkle.fillRect(-1, -1, 2, 2);
    sparkle.setPosition(x + Phaser.Math.Between(-15, 15), y + Phaser.Math.Between(-15, 15));

    this.scene.tweens.add({
      targets: sparkle,
      alpha: 0, y: sparkle.y - 15,
      duration: 600,
      onComplete: () => sparkle.destroy(),
    });
  }
}
