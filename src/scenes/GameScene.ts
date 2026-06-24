// KitCrush — Game Scene (Core Gameplay)

import Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT, BOARD_COLS, BOARD_ROWS,
  TILE_SIZE, TILE_GAP, BOARD_OFFSET_X, BOARD_OFFSET_Y,
  KITTEN_EMOJIS, LEVELS,
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

  // HUD elements
  private scoreText!: Phaser.GameObjects.Text;
  private movesText!: Phaser.GameObjects.Text;
  private targetText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBg!: Phaser.GameObjects.Graphics;

  // Touch handling
  private swipeStartX: number = 0;
  private swipeStartY: number = 0;
  private swipeTile: Tile | null = null;

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
    boardBg.fillRoundedRect(
      BOARD_OFFSET_X - 8,
      BOARD_OFFSET_Y - 8,
      BOARD_COLS * (TILE_SIZE + TILE_GAP) + 16,
      BOARD_ROWS * (TILE_SIZE + TILE_GAP) + 16,
      16
    );

    // Initialize systems
    const levelConfig = this.levelManager.getCurrentLevelConfig();

    this.scoreManager = new ScoreManager(this);
    this.scoreManager.init(levelConfig.moves, levelConfig.target);
    this.scoreManager.setCallbacks(
      (score, combo) => this.updateScoreDisplay(score, combo),
      (moves) => this.updateMovesDisplay(moves)
    );

    // Initialize board
    this.board = new Board(this);
    this.board.setCallbacks(
      (match) => this.onMatchFound(match),
      (depth) => this.onCascade(depth),
      (type, col, row) => this.onPowerUpActivated(type, col, row)
    );

    // Create HUD
    this.createHUD(levelConfig);

    // Input handling
    this.setupInput();

    // Animate board entrance
    this.animateBoardEntrance();
  }

  private createHUD(levelConfig: typeof LEVELS[0]) {
    const hudY = 20;

    // Level name
    this.levelText = this.add.text(GAME_WIDTH / 2, hudY, `📍 ${levelConfig.name}`, {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Score
    this.scoreText = this.add.text(20, hudY + 35, '🏆 0', {
      fontSize: '18px',
      color: '#ffd43b',
      fontFamily: 'Arial, sans-serif',
    });

    // Moves
    this.movesText = this.add.text(GAME_WIDTH - 20, hudY + 35, `🎯 ${levelConfig.moves}`, {
      fontSize: '18px',
      color: '#74c0fc',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(1, 0);

    // Target
    this.targetText = this.add.text(GAME_WIDTH / 2, hudY + 35, `Meta: ${levelConfig.target}`, {
      fontSize: '16px',
      color: '#aaaaaa',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);

    // Progress bar
    const barWidth = GAME_WIDTH - 40;
    const barHeight = 8;
    const barY = hudY + 60;

    this.progressBg = this.add.graphics();
    this.progressBg.fillStyle(0x333333, 0.5);
    this.progressBg.fillRoundedRect(20, barY, barWidth, barHeight, 4);

    this.progressBar = this.add.graphics();
    this.updateProgressBar(0, levelConfig.target);

    // Combo text (hidden initially)
    this.comboText = this.add.text(GAME_WIDTH / 2, BOARD_OFFSET_Y - 30, '', {
      fontSize: '28px',
      color: '#ff6b9d',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setAlpha(0);

    // Pause/Back button
    const pauseBtn = this.add.text(GAME_WIDTH - 20, hudY, '⏸️', {
      fontSize: '24px',
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

    pauseBtn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }

  private updateScoreDisplay(score: number, combo: number) {
    this.scoreText.setText(`🏆 ${score}`);

    const levelConfig = this.levelManager.getCurrentLevelConfig();
    this.updateProgressBar(score, levelConfig.target);

    if (combo > 1) {
      this.comboText.setText(`🔥 Combo x${combo}!`);
      this.comboText.setAlpha(1);
      this.tweens.add({
        targets: this.comboText,
        y: BOARD_OFFSET_Y - 40,
        alpha: 0,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => {
          this.comboText.y = BOARD_OFFSET_Y - 30;
        },
      });
    }
  }

  private updateMovesDisplay(moves: number) {
    this.movesText.setText(`🎯 ${moves}`);
    if (moves <= 3) {
      this.movesText.setColor('#ff6b6b');
    }
  }

  private updateProgressBar(score: number, target: number) {
    const barWidth = GAME_WIDTH - 40;
    const barHeight = 8;
    const barY = 80;
    const progress = Math.min(score / target, 1);

    this.progressBar.clear();
    this.progressBar.fillStyle(0xff6b9d, 1);
    this.progressBar.fillRoundedRect(20, barY, barWidth * progress, barHeight, 4);
  }

  private setupInput() {
    // Pointer events for both click and swipe
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.board.isBusy) return;

      const col = Math.floor((pointer.x - BOARD_OFFSET_X) / (TILE_SIZE + TILE_GAP));
      const row = Math.floor((pointer.y - BOARD_OFFSET_Y) / (TILE_SIZE + TILE_GAP));

      if (col < 0 || col >= BOARD_COLS || row < 0 || row >= BOARD_ROWS) return;

      this.swipeStartX = pointer.x;
      this.swipeStartY = pointer.y;
      this.swipeTile = this.board.getTileAt(col, row);

      const clickedTile = this.swipeTile;
      if (!clickedTile) return;

      if (this.selectedTile) {
        // Check if clicking adjacent tile → swap
        const dc = Math.abs(clickedTile.col - this.selectedTile.col);
        const dr = Math.abs(clickedTile.row - this.selectedTile.row);

        if ((dc === 1 && dr === 0) || (dc === 0 && dr === 1)) {
          this.trySwap(this.selectedTile, clickedTile);
          return;
        }

        // Otherwise, select new tile
        this.selectedTile.deselect();
        this.selectedTile = clickedTile;
        clickedTile.select();
        playSelectSound();
      } else {
        this.selectedTile = clickedTile;
        clickedTile.select();
        playSelectSound();
      }
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.board.isBusy || !this.swipeTile || !pointer.isDown) return;

      const dx = pointer.x - this.swipeStartX;
      const dy = pointer.y - this.swipeStartY;
      const threshold = 20;

      if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
        let targetCol = this.swipeTile.col;
        let targetRow = this.swipeTile.row;

        if (Math.abs(dx) > Math.abs(dy)) {
          targetCol += dx > 0 ? 1 : -1;
        } else {
          targetRow += dy > 0 ? 1 : -1;
        }

        const targetTile = this.board.getTileAt(targetCol, targetRow);
        if (targetTile) {
          this.trySwap(this.swipeTile, targetTile);
        }
        this.swipeTile = null;
      }
    });
  }

  private async trySwap(t1: Tile, t2: Tile) {
    if (this.selectedTile) {
      this.selectedTile.deselect();
      this.selectedTile = null;
    }

    playSwapSound();

    const success = await this.board.swapTiles(t1, t2);

    if (success) {
      this.scoreManager.useMove();
      this.checkGameState();
    } else {
      playInvalidSwapSound();
    }
  }

  private onMatchFound(match: Match) {
    const tileCount = match.tiles.length;
    this.scoreManager.addMatchScore(tileCount);
    playMatchSound(this.scoreManager.combo);
  }

  private onCascade(depth: number) {
    playCascadeSound(depth);
  }

  private onPowerUpActivated(type: string, col: number, row: number) {
    playPowerUpSound();
  }

  private checkGameState() {
    const levelConfig = this.levelManager.getCurrentLevelConfig();

    // Check win
    if (this.scoreManager.hasReachedTarget()) {
      this.time.delayedCall(500, () => {
        const stars = this.scoreManager.getStars();
        this.levelManager.completeLevel(stars);
        this.scene.start('GameOverScene', {
          won: true,
          score: this.scoreManager.score,
          stars,
          levelManager: this.levelManager,
        });
      });
      return;
    }

    // Check lose
    if (!this.scoreManager.hasMovesLeft()) {
      this.time.delayedCall(500, () => {
        this.scene.start('GameOverScene', {
          won: false,
          score: this.scoreManager.score,
          stars: 0,
          levelManager: this.levelManager,
        });
      });
      return;
    }

    // Check if shuffle needed
    if (!this.board.isBusy) {
      const matchFinder = new MatchFinder(this.board.tiles);
      if (!matchFinder.hasPossibleMoves()) {
        this.board.shuffle();
      }
    }
  }

  private animateBoardEntrance() {
    // Board fades in
    this.board.container.setAlpha(0);
    this.tweens.add({
      targets: this.board.container,
      alpha: 1,
      duration: 500,
      ease: 'Power2',
    });
  }
}
