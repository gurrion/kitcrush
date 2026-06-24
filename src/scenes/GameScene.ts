// KitCrush — Game Scene

import Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT, BOARD_COLS, BOARD_ROWS,
  TILE_SIZE, TILE_GAP, BOARD_OFFSET_X, BOARD_OFFSET_Y, LEVELS,
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

export class GameScene extends Phaser.Scene {
  private board!: Board;
  private scoreManager!: ScoreManager;
  private levelManager!: LevelManager;
  private selectedTile: Tile | null = null;
  private swipeStartX = 0;
  private swipeStartY = 0;
  private swipeTile: Tile | null = null;
  private comboText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private movesText!: Phaser.GameObjects.Text;
  private progressBar!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { level: number; levelManager: LevelManager }) {
    this.levelManager = data.levelManager;
    this.levelManager.currentLevel = data.level;
  }

  create() {
    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x0f0f23, 0x0f0f23, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Board background
    const boardBg = this.add.graphics();
    boardBg.fillStyle(0xffffff, 0.05);
    const bw = BOARD_COLS * (TILE_SIZE + TILE_GAP) - TILE_GAP;
    const bh = BOARD_ROWS * (TILE_SIZE + TILE_GAP) - TILE_GAP;
    boardBg.fillRoundedRect(BOARD_OFFSET_X - 6, BOARD_OFFSET_Y - 6, bw + 12, bh + 12, 12);

    // Level config
    const levelConfig = this.levelManager.getCurrentLevelConfig();

    // Score manager
    this.scoreManager = new ScoreManager(this);
    this.scoreManager.init(levelConfig.moves, levelConfig.target);
    this.scoreManager.setCallbacks(
      (score, combo) => this.updateScoreDisplay(score, combo),
      (moves) => this.updateMovesDisplay(moves),
    );

    // Board
    this.board = new Board(this);
    this.board.setCallbacks(
      (match) => this.onMatchFound(match),
      (depth) => this.onCascade(depth),
      (type, col, row) => this.onPowerUpActivated(type, col, row),
    );

    // HUD
    this.createHUD(levelConfig);

    // Input
    this.setupInput();

    // Entrance animation
    this.board.container.setAlpha(0);
    this.tweens.add({ targets: this.board.container, alpha: 1, duration: 400 });
  }

  private createHUD(cfg: typeof LEVELS[0]) {
    this.add.text(GAME_WIDTH / 2, 16, `📍 ${cfg.name}`, {
      fontSize: '18px', color: '#ffffff',
      fontFamily: 'Arial, sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.scoreText = this.add.text(16, 42, '🏆 0', {
      fontSize: '16px', color: '#ffd43b', fontFamily: 'Arial, sans-serif',
    });

    this.movesText = this.add.text(GAME_WIDTH - 16, 42, `🎯 ${cfg.moves}`, {
      fontSize: '16px', color: '#74c0fc', fontFamily: 'Arial, sans-serif',
    }).setOrigin(1, 0);

    this.add.text(GAME_WIDTH / 2, 42, `Meta: ${cfg.target}`, {
      fontSize: '14px', color: '#aaa', fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);

    // Progress bar
    const barW = GAME_WIDTH - 32;
    const barY = 66;
    const barH = 6;
    const pbg = this.add.graphics();
    pbg.fillStyle(0x333333, 0.5);
    pbg.fillRoundedRect(16, barY, barW, barH, 3);

    this.progressBar = this.add.graphics();

    // Combo text
    this.comboText = this.add.text(GAME_WIDTH / 2, BOARD_OFFSET_Y - 20, '', {
      fontSize: '24px', color: '#ff6b9d',
      fontFamily: 'Arial, sans-serif', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setAlpha(0);

    // Pause button
    const pauseBtn = this.add.text(GAME_WIDTH - 16, 14, '⏸️', { fontSize: '20px' })
      .setOrigin(1, 0).setInteractive({ useHandCursor: true });
    pauseBtn.on('pointerdown', () => this.scene.start('MenuScene'));
  }

  private updateScoreDisplay(score: number, combo: number) {
    this.scoreText.setText(`🏆 ${score}`);
    const cfg = this.levelManager.getCurrentLevelConfig();
    const progress = Math.min(score / cfg.target, 1);
    const barW = GAME_WIDTH - 32;
    this.progressBar.clear();
    this.progressBar.fillStyle(0xff6b9d, 1);
    this.progressBar.fillRoundedRect(16, 66, barW * progress, 6, 3);

    if (combo > 1) {
      this.comboText.setText(`🔥 Combo x${combo}!`).setAlpha(1);
      this.tweens.add({
        targets: this.comboText,
        y: BOARD_OFFSET_Y - 30, alpha: 0,
        duration: 800, ease: 'Power2',
        onComplete: () => { this.comboText.y = BOARD_OFFSET_Y - 20; },
      });
    }
  }

  private updateMovesDisplay(moves: number) {
    this.movesText.setText(`🎯 ${moves}`);
    if (moves <= 3) this.movesText.setColor('#ff6b6b');
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
    }
  }

  private onMatchFound(match: Match) {
    this.scoreManager.addMatchScore(match.tiles.length);
    playMatchSound(this.scoreManager.combo);
  }

  private onCascade(depth: number) { playCascadeSound(depth); }
  private onPowerUpActivated(_t: string, _c: number, _r: number) { playPowerUpSound(); }

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
