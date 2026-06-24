// KitCrush — Board (8x8 Grid Manager)

import Phaser from 'phaser';
import {
  BOARD_COLS, BOARD_ROWS, KITTEN_TYPES, TILE_SIZE, TILE_GAP,
  BOARD_OFFSET_X, BOARD_OFFSET_Y, SWAP_DURATION, FALL_DURATION,
  MATCH_CLEAR_DURATION, KITTEN_COLORS, PowerUpType,
} from '../utils/constants';
import { Tile } from './Tile';
import { MatchFinder, Match } from '../systems/MatchFinder';

export class Board {
  public tiles: (Tile | null)[][];
  public container: Phaser.GameObjects.Container;
  public isBusy: boolean = false;

  private scene: Phaser.Scene;
  private matchFinder: MatchFinder;
  private onMatchFound?: (match: Match) => void;
  private onCascade?: (depth: number) => void;
  private onPowerUp?: (type: PowerUpType, col: number, row: number) => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.tiles = [];
    this.container = scene.add.container(0, 0);
    this.matchFinder = new MatchFinder(this.tiles);

    this.initBoard();
  }

  setCallbacks(
    onMatchFound: (match: Match) => void,
    onCascade: (depth: number) => void,
    onPowerUp: (type: PowerUpType, col: number, row: number) => void
  ) {
    this.onMatchFound = onMatchFound;
    this.onCascade = onCascade;
    this.onPowerUp = onPowerUp;
  }

  private initBoard() {
    // Initialize empty board
    this.tiles = Array.from({ length: BOARD_ROWS }, () =>
      Array.from({ length: BOARD_COLS }, () => null)
    );

    // Fill with random kittens, ensuring no initial matches
    for (let row = 0; row < BOARD_ROWS; row++) {
      for (let col = 0; col < BOARD_COLS; col++) {
        let type: number;
        do {
          type = Phaser.Math.Between(0, KITTEN_TYPES - 1);
        } while (this.wouldCreateMatch(col, row, type));

        this.createTile(col, row, type);
      }
    }

    this.matchFinder.updateBoard(this.tiles);
  }

  private wouldCreateMatch(col: number, row: number, type: number): boolean {
    // Check horizontal
    if (col >= 2) {
      const t1 = this.tiles[row][col - 1];
      const t2 = this.tiles[row][col - 2];
      if (t1 && t2 && t1.kittenType === type && t2.kittenType === type) return true;
    }

    // Check vertical
    if (row >= 2) {
      const t1 = this.tiles[row - 1][col];
      const t2 = this.tiles[row - 2][col];
      if (t1 && t2 && t1.kittenType === type && t2.kittenType === type) return true;
    }

    return false;
  }

  private createTile(col: number, row: number, type: number): Tile {
    const tile = new Tile(this.scene, col, row, type);
    this.tiles[row][col] = tile;
    this.container.add(tile);
    return tile;
  }

  getTileAt(col: number, row: number): Tile | null {
    if (col < 0 || col >= BOARD_COLS || row < 0 || row >= BOARD_ROWS) return null;
    return this.tiles[row][col];
  }

  async swapTiles(t1: Tile, t2: Tile): Promise<boolean> {
    this.isBusy = true;

    // Animate swap
    const pos1 = t1.getWorldPos();
    const pos2 = t2.getWorldPos();

    // Update grid positions
    const c1 = t1.col, r1 = t1.row;
    const c2 = t2.col, r2 = t2.row;

    this.tiles[r1][c1] = t2;
    this.tiles[r2][c2] = t1;
    t1.setGridPos(c2, r2);
    t2.setGridPos(c1, r1);

    // Animate
    await Promise.all([
      this.animateMove(t1, pos2.x, pos2.y),
      this.animateMove(t2, pos1.x, pos1.y),
    ]);

    // Check for matches
    this.matchFinder.updateBoard(this.tiles);
    const matches = this.matchFinder.findAllMatches();

    if (matches.length === 0) {
      // Swap back
      this.tiles[r1][c1] = t1;
      this.tiles[r2][c2] = t2;
      t1.setGridPos(c1, r1);
      t2.setGridPos(c2, r2);

      await Promise.all([
        this.animateMove(t1, pos1.x, pos1.y),
        this.animateMove(t2, pos2.x, pos2.y),
      ]);

      this.isBusy = false;
      return false;
    }

    // Process matches
    await this.processMatches(matches);
    this.isBusy = false;
    return true;
  }

  async processMatches(matches: Match[]) {
    let cascadeDepth = 0;

    while (matches.length > 0) {
      cascadeDepth++;
      if (cascadeDepth > 1) {
        this.onCascade?.(cascadeDepth);
      }

      // Mark and clear matches
      const allMatchedTiles = new Set<Tile>();
      const powerUpPositions: { col: number; row: number; type: PowerUpType }[] = [];

      for (const match of matches) {
        this.onMatchFound?.(match);

        // Check if this match creates a power-up
        if (match.length === 4) {
          // Power-up: row/column clearer
          const midIdx = Math.floor(match.tiles.length / 2);
          const midTile = match.tiles[midIdx];
          const puType: PowerUpType = match.type === 'horizontal' ? 'row' : 'column';
          powerUpPositions.push({ col: midTile.col, row: midTile.row, type: puType });
        } else if (match.length >= 5) {
          // Power-up: rainbow
          const midIdx = Math.floor(match.tiles.length / 2);
          const midTile = match.tiles[midIdx];
          powerUpPositions.push({ col: midTile.col, row: midTile.row, type: 'rainbow' });
        }

        for (const tile of match.tiles) {
          // Check if tile has a power-up to activate
          const activated = tile.activatePowerUp();
          if (activated) {
            this.activatePowerUpEffect(activated.type, activated.col, activated.row, allMatchedTiles);
          }
          allMatchedTiles.add(tile);
        }
      }

      // Animate matched tiles
      const clearPromises: Promise<void>[] = [];
      for (const tile of allMatchedTiles) {
        tile.playMatchEffect();
        clearPromises.push(new Promise(resolve => {
          this.scene.time.delayedCall(MATCH_CLEAR_DURATION, resolve);
        }));
      }

      await Promise.all(clearPromises);

      // Remove matched tiles from board
      for (const tile of allMatchedTiles) {
        if (tile.col >= 0 && tile.col < BOARD_COLS && tile.row >= 0 && tile.row < BOARD_ROWS) {
          if (this.tiles[tile.row]?.[tile.col] === tile) {
            this.tiles[tile.row][tile.col] = null;
          }
        }
      }

      // Create power-ups
      for (const pu of powerUpPositions) {
        if (this.tiles[pu.row]?.[pu.col] === null) {
          const randomType = Phaser.Math.Between(0, KITTEN_TYPES - 1);
          const newTile = this.createTile(pu.col, pu.row, randomType);
          newTile.setPowerUp(pu.type);
          this.onPowerUp?.(pu.type, pu.col, pu.row);
        }
      }

      // Apply gravity
      await this.applyGravity();

      // Refill empty spaces
      await this.refill();

      // Check for new matches (cascade)
      this.matchFinder.updateBoard(this.tiles);
      matches = this.matchFinder.findAllMatches();
    }
  }

  private activatePowerUpEffect(type: PowerUpType, col: number, row: number, affected: Set<Tile>) {
    switch (type) {
      case 'row':
        for (let c = 0; c < BOARD_COLS; c++) {
          const tile = this.tiles[row]?.[c];
          if (tile) affected.add(tile);
        }
        break;
      case 'column':
        for (let r = 0; r < BOARD_ROWS; r++) {
          const tile = this.tiles[r]?.[col];
          if (tile) affected.add(tile);
        }
        break;
      case 'bomb':
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const tile = this.tiles[row + dr]?.[col + dc];
            if (tile) affected.add(tile);
          }
        }
        break;
      case 'rainbow':
        // Destroy all of a random color
        const targetType = this.tiles[row]?.[col]?.kittenType ?? Phaser.Math.Between(0, KITTEN_TYPES - 1);
        for (let r = 0; r < BOARD_ROWS; r++) {
          for (let c = 0; c < BOARD_COLS; c++) {
            const tile = this.tiles[r][c];
            if (tile && tile.kittenType === targetType) affected.add(tile);
          }
        }
        break;
    }
  }

  private async applyGravity() {
    const fallPromises: Promise<void>[] = [];

    for (let col = 0; col < BOARD_COLS; col++) {
      let emptyRow = BOARD_ROWS - 1;

      for (let row = BOARD_ROWS - 1; row >= 0; row--) {
        if (this.tiles[row][col] !== null) {
          if (row !== emptyRow) {
            // Move tile down
            const tile = this.tiles[row][col]!;
            this.tiles[emptyRow][col] = tile;
            this.tiles[row][col] = null;
            tile.setGridPos(col, emptyRow);

            const pos = tile.getWorldPos();
            fallPromises.push(this.animateFall(tile, pos.y, emptyRow - row));
          }
          emptyRow--;
        }
      }
    }

    if (fallPromises.length > 0) {
      await Promise.all(fallPromises);
    }
  }

  private async refill() {
    const fallPromises: Promise<void>[] = [];

    for (let col = 0; col < BOARD_COLS; col++) {
      let emptyCount = 0;

      for (let row = BOARD_ROWS - 1; row >= 0; row--) {
        if (this.tiles[row][col] === null) {
          emptyCount++;
        }
      }

      if (emptyCount > 0) {
        let fillRow = 0;
        for (let row = 0; row < BOARD_ROWS; row++) {
          if (this.tiles[row][col] === null) {
            const type = Phaser.Math.Between(0, KITTEN_TYPES - 1);
            const tile = this.createTile(col, row, type);

            // Start above the board
            const startY = BOARD_OFFSET_Y - (emptyCount - fillRow) * (TILE_SIZE + TILE_GAP);
            tile.setPosition(tile.getWorldPos().x, startY);

            const pos = tile.getWorldPos();
            fallPromises.push(this.animateFall(tile, pos.y, fillRow));
            fillRow++;
          }
        }
      }
    }

    if (fallPromises.length > 0) {
      await Promise.all(fallPromises);
    }
  }

  private animateMove(tile: Tile, targetX: number, targetY: number): Promise<void> {
    return new Promise(resolve => {
      this.scene.tweens.add({
        targets: tile,
        x: targetX,
        y: targetY,
        duration: SWAP_DURATION,
        ease: 'Power2',
        onComplete: () => resolve(),
      });
    });
  }

  private animateFall(tile: Tile, targetY: number, delay: number): Promise<void> {
    return new Promise(resolve => {
      this.scene.tweens.add({
        targets: tile,
        y: targetY,
        duration: FALL_DURATION + delay * 20,
        delay: delay * 30,
        ease: 'Bounce.easeOut',
        onComplete: () => resolve(),
      });
    });
  }

  // Shuffle board if no moves available
  async shuffle() {
    this.isBusy = true;

    // Collect all tiles
    const allTiles: Tile[] = [];
    for (let row = 0; row < BOARD_ROWS; row++) {
      for (let col = 0; col < BOARD_COLS; col++) {
        if (this.tiles[row][col]) {
          allTiles.push(this.tiles[row][col]!);
        }
      }
    }

    // Shuffle positions
    Phaser.Utils.Array.Shuffle(allTiles);

    // Reassign positions
    let idx = 0;
    for (let row = 0; row < BOARD_ROWS; row++) {
      for (let col = 0; col < BOARD_COLS; col++) {
        const tile = allTiles[idx++];
        this.tiles[row][col] = tile;
        tile.setGridPos(col, row);
        tile.updatePosition(true);
      }
    }

    // Wait for animations
    await new Promise(resolve => this.scene.time.delayedCall(300, resolve));

    // Check for matches and resolve them
    this.matchFinder.updateBoard(this.tiles);
    const matches = this.matchFinder.findAllMatches();
    if (matches.length > 0) {
      await this.processMatches(matches);
    }

    this.isBusy = false;
  }

  destroy() {
    this.container.destroy();
  }
}
