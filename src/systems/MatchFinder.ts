// KitCrush — Match Detection System

import { BOARD_COLS, BOARD_ROWS, KITTEN_TYPES } from '../utils/constants';
import { Tile } from '../objects/Tile';

export interface Match {
  tiles: Tile[];
  type: 'horizontal' | 'vertical' | 't-shape' | 'l-shape';
  length: number;
}

export class MatchFinder {
  private board: (Tile | null)[][];

  constructor(board: (Tile | null)[][]) {
    this.board = board;
  }

  updateBoard(board: (Tile | null)[][]) {
    this.board = board;
  }

  findAllMatches(): Match[] {
    const hMatches = this.findHorizontalMatches();
    const vMatches = this.findVerticalMatches();

    // Merge overlapping matches into T/L shapes
    const merged = this.mergeMatches(hMatches, vMatches);

    // Deduplicate tiles across matches
    return this.deduplicateMatches(merged);
  }

  private findHorizontalMatches(): Match[] {
    const matches: Match[] = [];

    for (let row = 0; row < BOARD_ROWS; row++) {
      let streak: Tile[] = [];
      let lastType = -1;

      for (let col = 0; col < BOARD_COLS; col++) {
        const tile = this.board[row][col];
        if (tile && tile.kittenType === lastType) {
          streak.push(tile);
        } else {
          if (streak.length >= 3) {
            matches.push({
              tiles: [...streak],
              type: 'horizontal',
              length: streak.length,
            });
          }
          streak = tile ? [tile] : [];
          lastType = tile ? tile.kittenType : -1;
        }
      }

      if (streak.length >= 3) {
        matches.push({
          tiles: [...streak],
          type: 'horizontal',
          length: streak.length,
        });
      }
    }

    return matches;
  }

  private findVerticalMatches(): Match[] {
    const matches: Match[] = [];

    for (let col = 0; col < BOARD_COLS; col++) {
      let streak: Tile[] = [];
      let lastType = -1;

      for (let row = 0; row < BOARD_ROWS; row++) {
        const tile = this.board[row][col];
        if (tile && tile.kittenType === lastType) {
          streak.push(tile);
        } else {
          if (streak.length >= 3) {
            matches.push({
              tiles: [...streak],
              type: 'vertical',
              length: streak.length,
            });
          }
          streak = tile ? [tile] : [];
          lastType = tile ? tile.kittenType : -1;
        }
      }

      if (streak.length >= 3) {
        matches.push({
          tiles: [...streak],
          type: 'vertical',
          length: streak.length,
        });
      }
    }

    return matches;
  }

  private mergeMatches(hMatches: Match[], vMatches: Match[]): Match[] {
    const allMatches: Match[] = [...hMatches, ...vMatches];
    const tileMap = new Map<Tile, Match[]>();

    for (const match of allMatches) {
      for (const tile of match.tiles) {
        if (!tileMap.has(tile)) tileMap.set(tile, []);
        tileMap.get(tile)!.push(match);
      }
    }

    // Find tiles that are in both H and V matches → T/L shapes
    const merged: Match[] = [];
    const processed = new Set<Match>();

    for (const [tile, matches] of tileMap) {
      const hMatch = matches.find(m => m.type === 'horizontal');
      const vMatch = matches.find(m => m.type === 'vertical');

      if (hMatch && vMatch && !processed.has(hMatch) && !processed.has(vMatch)) {
        // Merge into T/L shape
        const allTiles = new Set([...hMatch.tiles, ...vMatch.tiles]);
        merged.push({
          tiles: Array.from(allTiles),
          type: allTiles.size >= 5 ? 't-shape' : 'l-shape',
          length: allTiles.size,
        });
        processed.add(hMatch);
        processed.add(vMatch);
      }
    }

    // Add unprocessed matches
    for (const match of allMatches) {
      if (!processed.has(match)) {
        merged.push(match);
      }
    }

    return merged;
  }

  private deduplicateMatches(matches: Match[]): Match[] {
    const seen = new Set<string>();
    return matches.filter(match => {
      const key = match.tiles.map(t => `${t.col},${t.row}`).sort().join('|');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Check if there are any possible moves left
  hasPossibleMoves(): boolean {
    for (let row = 0; row < BOARD_ROWS; row++) {
      for (let col = 0; col < BOARD_COLS; col++) {
        // Try swap right
        if (col < BOARD_COLS - 1) {
          this.swapInBoard(col, row, col + 1, row);
          const matches = this.findAllMatches();
          this.swapInBoard(col, row, col + 1, row);
          if (matches.length > 0) return true;
        }

        // Try swap down
        if (row < BOARD_ROWS - 1) {
          this.swapInBoard(col, row, col, row + 1);
          const matches = this.findAllMatches();
          this.swapInBoard(col, row, col, row + 1);
          if (matches.length > 0) return true;
        }
      }
    }
    return false;
  }

  private swapInBoard(c1: number, r1: number, c2: number, r2: number) {
    const temp = this.board[r1][c1];
    this.board[r1][c1] = this.board[r2][c2];
    this.board[r2][c2] = temp;
  }
}
