// KitCrush — Game Scene (Arcade Style)

import Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT, BOARD_COLS, BOARD_ROWS,
  TILE_SIZE, TILE_GAP, BOARD_OFFSET_X, BOARD_OFFSET_Y, LEVELS,
  KITTEN_COLORS,
} from '../utils/constants';
import { Board } from '../objects/Board';
import { Tile } from '../objects/Tile';
import { MatchFinder, Match } from '../systems/MatchFinder';
import { ScoreManager } from '../systems/ScoreManager';
import { LevelManager } from '../systems/LevelManager';
import {
  playMatchSound, playSwapSound, playInvalidSwapSound,
  playCascadeSound, playPowerUpSound, playSelectSound,
} from '../utils/sounds';
import { HAPTIC } from '../utils/haptics';
import { ParticleManager } from '../utils/particles';

export class GameScene extends Phaser.Scene {
  private board!: Board;
  private scoreManager!: ScoreManager;
  private levelManager!: LevelManager;
  private particles!: ParticleManager;
  private selectedTile: Tile | null = null;
  private swipeStartX = 0;
  private swipeStartY = 0;
  private swipeTile: Tile | null = null;
  private comboText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private movesText!: Phaser.GameObjects.Text;
  private progressBar!: Phaser.GameObjects.Graphics;
  private comboCount = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { level: number; levelManager: LevelManager }) {
    this.levelManager = data.levelManager;
    this.levelManager.currentLevel = data.level;
  }

  create() {
    // Arcade background
    this.drawArcadeBg();

    // Board area with subtle border
    const bw = BOARD_COLS * (TILE_SIZE + TILE_GAP) - TILE_GAP;
    const bh = BOARD_ROWS * (TILE_SIZE + TILE_GAP) - TILE_GAP;
    const boardBg = this.add.graphics();
    boardBg.fillStyle(0x0f0f23, 0.6);
    boardBg.fillRoundedRect(BOARD_OFFSET_X - 8, BOARD_OFFSET_Y - 8, bw + 16, bh + 16, 12);
    boardBg.lineStyle(1, 0x2a2a4a, 0.4);
    boardBg.strokeRoundedRect(BOARD_OFFSET_X - 8, BOARD_OFFSET_Y - 8, bw + 16, bh + 16, 12);

    const levelConfig = this.levelManager.getCurrentLevelConfig();

    this.scoreManager = new ScoreManager(this);
    this.scoreManager.init(levelConfig.moves, levelConfig.target);
    this.scoreManager.setCallbacks(
      (score, combo) => this.onScoreChanged(score, combo),
      (moves) => this.onMovesChanged(moves),
    );

    this.board = new Board(this);
    this.particles = new ParticleManager(this);
    this.board.setCallbacks(
      (match) => this.onMatchFound(match),
      (depth) => this.onCascade(depth),
      (type, col, row) => this.onPowerUpActivated(type, col, row),
    );

    this.createHUD(levelConfig);
    this.setupInput();

    // Board entrance
    this.board.container.setAlpha(0);
    this.tweens.add({ targets: this.board.container, alpha: 1, duration: 400 });
  }

  private drawArcadeBg() {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x101020, 0x101020, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Subtle grid
    bg.lineStyle(1, 0x151530, 0.3);
    for (let x = 0; x < GAME_WIDTH; x += 24) bg.lineBetween(x, 0, x, GAME_HEIGHT);
    for (let y = 0; y < GAME_HEIGHT; y += 24) bg.lineBetween(0, y, GAME_WIDTH, y);
  }

  private createHUD(cfg: typeof LEVELS[0]) {
    // Top bar background
    const topBar = this.add.graphics();
    topBar.fillStyle(0x0a0a1a, 0.8);
    topBar.fillRect(0, 0, GAME_WIDTH, 100);
    topBar.lineStyle(1, 0x2a2a4a, 0.3);
    topBar.lineBetween(0, 100, GAME_WIDTH, 100);

    // Level name
    this.add.text(GAME_WIDTH / 2, 14, `📍 ${cfg.name}`, {
      fontSize: '14px', color: '#aaaacc',
      fontFamily: '"Courier New", monospace', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Score (big, centered)
    this.scoreText = this.add.text(GAME_WIDTH / 2, 40, '0', {
      fontSize: '32px', color: '#ffd43b',
      fontFamily: '"Courier New", monospace', fontStyle: 'bold',
    }).setOrigin(0.5);

    // "SCORE" label
    this.add.text(GAME_WIDTH / 2, 60, 'SCORE', {
      fontSize: '8px', color: '#666688',
      fontFamily: '"Courier New", monospace', letterSpacing: 2,
    }).setOrigin(0.5);

    // Moves (left)
    this.add.text(16, 22, 'MOVES', {
      fontSize: '8px', color: '#666688',
      fontFamily: '"Courier New", monospace', letterSpacing: 1,
    });
    this.movesText = this.add.text(16, 34, String(cfg.moves), {
      fontSize: '24px', color: '#74c0fc',
      fontFamily: '"Courier New", monospace', fontStyle: 'bold',
    });

    // Target (right)
    this.add.text(GAME_WIDTH - 16, 22, 'TARGET', {
      fontSize: '8px', color: '#666688',
      fontFamily: '"Courier New", monospace', letterSpacing: 1,
    }).setOrigin(1, 0);
    this.add.text(GAME_WIDTH - 16, 34, String(cfg.target), {
      fontSize: '20px', color: '#69db7c',
      fontFamily: '"Courier New", monospace', fontStyle: 'bold',
    }).setOrigin(1, 0);

    // Progress bar
    const barW = GAME_WIDTH - 32;
    const barY = 76;
    const barH = 6;
    const pbg = this.add.graphics();
    pbg.fillStyle(0x1a1a2e, 1);
    pbg.fillRoundedRect(16, barY, barW, barH, 3);
    pbg.lineStyle(1, 0x2a2a4a, 0.3);
    pbg.strokeRoundedRect(16, barY, barW, barH, 3);

    this.progressBar = this.add.graphics();

    // Combo text
    this.comboText = this.add.text(GAME_WIDTH / 2, BOARD_OFFSET_Y - 15, '', {
      fontSize: '20px', color: '#ff6b9d',
      fontFamily: '"Courier New", monospace', fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0);

    // Pause
    const pauseBtn = this.add.text(GAME_WIDTH - 16, 14, '⏸', {
      fontSize: '16px', color: '#666688',
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    pauseBtn.on('pointerdown', () => this.scene.start('MenuScene'));
    pauseBtn.on('pointerover', () => pauseBtn.setColor('#ffffff'));
    pauseBtn.on('pointerout', () => pauseBtn.setColor('#666688'));
  }

  private onScoreChanged(score: number, combo: number) {
    // Animate score number
    this.tweens.add({
      targets: this.scoreText, scaleX: 1.2, scaleY: 1.2,
      duration: 80, yoyo: true, ease: 'Power2',
    });
    this.scoreText.setText(String(score));

    // Progress bar
    const cfg = this.levelManager.getCurrentLevelConfig();
    const progress = Math.min(score / cfg.target, 1);
    const barW = GAME_WIDTH - 32;
    this.progressBar.clear();
    this.progressBar.fillStyle(0xff6b9d, 1);
    this.progressBar.fillRoundedRect(16, 76, barW * progress, 6, 3);

    if (combo > 1) {
      this.showCombo(combo);
    }
  }

  private showCombo(combo: number) {
    const labels = ['', '', 'DOUBLE!', 'TRIPLE!', 'MEGA!', 'INSANE!', 'GODLIKE!'];
    const label = labels[Math.min(combo, labels.length - 1)] || `x${combo}!`;
    const colors = ['', '', '#ffd43b', '#ffa94d', '#ff6b6b', '#b197fc', '#ff6b9d'];
    const color = colors[Math.min(combo, colors.length - 1)] || '#ff6b9d';

    this.comboText.setText(`${label}`);
    this.comboText.setColor(color);
    this.comboText.setAlpha(1).setY(BOARD_OFFSET_Y - 15);

    this.tweens.add({
      targets: this.comboText,
      y: BOARD_OFFSET_Y - 30, alpha: 0,
      duration: 900, ease: 'Power2',
      onComplete: () => { this.comboText.y = BOARD_OFFSET_Y - 15; },
    });

    // Screen shake for big combos
    if (combo >= 3) {
      this.cameras.main.shake(150, 0.005 * combo);
    }
  }

  private onMovesChanged(moves: number) {
    this.movesText.setText(String(moves));
    if (moves <= 3) {
      this.movesText.setColor('#ff6b6b');
      // Pulse warning
      this.tweens.add({
        targets: this.movesText, scaleX: 1.3, scaleY: 1.3,
        duration: 100, yoyo: true, ease: 'Power2',
      });
    }
  }

  // Floating score number at match position
  private showFloatingScore(x: number, y: number, points: number, combo: number) {
    const color = combo > 1 ? '#ffd43b' : '#ffffff';
    const txt = this.add.text(x, y, `+${points}`, {
      fontSize: combo > 1 ? '18px' : '14px', color,
      fontFamily: '"Courier New", monospace', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: txt,
      y: y - 40, alpha: 0,
      duration: 700, ease: 'Power2',
      onComplete: () => txt.destroy(),
    });
  }

  private setupInput() {
    this.input.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      if (this.board.isBusy) return;
      const col = Math.floor((ptr.x - BOARD_OFFSET_X) / (TILE_SIZE + TILE_GAP));
      const row = Math.floor((ptr.y - BOARD_OFFSET_Y) / (TILE_SIZE + TILE_GAP));
      if (col < 0 || col >= BOARD_COLS || row < 0 || row >= BOARD_ROWS) return;

      this.swipeStartX = ptr.x;
      this.swipeStartY = ptr.y;
      this.swipeTile = this.board.getTileAt(col, row);
      const clicked = this.swipeTile;
      if (!clicked) return;

      if (this.selectedTile) {
        const dc = Math.abs(clicked.col - this.selectedTile.col);
        const dr = Math.abs(clicked.row - this.selectedTile.row);
        if ((dc === 1 && dr === 0) || (dc === 0 && dr === 1)) {
          this.trySwap(this.selectedTile, clicked);
          return;
        }
        this.selectedTile.deselect();
      }
      this.selectedTile = clicked;
      clicked.select();
      playSelectSound();
      HAPTIC.light();
    });

    this.input.on('pointermove', (ptr: Phaser.Input.Pointer) => {
      if (this.board.isBusy || !this.swipeTile || !ptr.isDown) return;
      const dx = ptr.x - this.swipeStartX;
      const dy = ptr.y - this.swipeStartY;
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;

      let tc = this.swipeTile.col;
      let tr = this.swipeTile.row;
      if (Math.abs(dx) > Math.abs(dy)) tc += dx > 0 ? 1 : -1;
      else tr += dy > 0 ? 1 : -1;

      const target = this.board.getTileAt(tc, tr);
      if (target) this.trySwap(this.swipeTile, target);
      this.swipeTile = null;
    });
  }

  private async trySwap(t1: Tile, t2: Tile) {
    if (this.selectedTile) {
      this.selectedTile.deselect();
      this.selectedTile = null;
    }
    playSwapSound();
    const ok = await this.board.swapTiles(t1, t2);
    if (ok) {
      this.scoreManager.useMove();
      this.checkGameState();
    } else {
      playInvalidSwapSound();
      HAPTIC.invalid();
      // Shake both tiles
      this.cameras.main.shake(100, 0.003);
    }
  }

  private onMatchFound(match: Match) {
    const points = this.scoreManager.addMatchScore(match.tiles.length);
    playMatchSound(this.scoreManager.combo);
    HAPTIC.match();

    // Match center
    let cx = 0, cy = 0;
    for (const t of match.tiles) { cx += t.x; cy += t.y; }
    cx /= match.tiles.length;
    cy /= match.tiles.length;

    // Particles
    const color = KITTEN_COLORS[match.tiles[0].kittenType];
    this.particles.matchExplosion(cx, cy, color, 10 + match.tiles.length * 2);
    this.particles.sparkleRing(cx, cy, color);

    // Floating score
    this.showFloatingScore(cx, cy, points, this.scoreManager.combo);

    // Screen flash for big matches
    if (match.tiles.length >= 4) {
      this.particles.screenFlash(color, 0.1);
    }
  }

  private onCascade(depth: number) {
    playCascadeSound(depth);
    HAPTIC.combo(depth);
    this.particles.comboFire(GAME_WIDTH / 2, GAME_HEIGHT / 2, depth);
    if (depth >= 2) this.cameras.main.shake(120, 0.004 * depth);
  }

  private onPowerUpActivated(type: string, col: number, row: number) {
    playPowerUpSound();
    HAPTIC.powerUp();
    const x = col * (TILE_SIZE + TILE_GAP) + BOARD_OFFSET_X + TILE_SIZE / 2;
    const y = row * (TILE_SIZE + TILE_GAP) + BOARD_OFFSET_Y + TILE_SIZE / 2;
    const color = KITTEN_COLORS[Math.floor(Math.random() * 6)];
    this.particles.shockwave(x, y, color);
    this.particles.screenFlash(color, 0.12);
    this.cameras.main.shake(200, 0.01);
  }

  private checkGameState() {
    if (this.scoreManager.hasReachedTarget()) {
      this.time.delayedCall(400, () => {
        const stars = this.scoreManager.getStars();
        this.levelManager.completeLevel(stars);
        this.scene.start('GameOverScene', {
          won: true, score: this.scoreManager.score,
          stars, levelManager: this.levelManager,
        });
      });
      return;
    }
    if (!this.scoreManager.hasMovesLeft()) {
      this.time.delayedCall(400, () => {
        this.scene.start('GameOverScene', {
          won: false, score: this.scoreManager.score,
          stars: 0, levelManager: this.levelManager,
        });
      });
      return;
    }
    if (!this.board.isBusy) {
      const mf = new MatchFinder(this.board.tiles);
      if (!mf.hasPossibleMoves()) this.board.shuffle();
    }
  }
}
