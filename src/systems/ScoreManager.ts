// KitCrush — Score Manager

export class ScoreManager {
  public score: number = 0;
  public combo: number = 0;
  public movesLeft: number = 0;
  public targetScore: number = 0;
  public tilesCleared: number = 0;

  private comboTimer: Phaser.Time.TimerEvent | null = null;
  private scene: Phaser.Scene;
  private onScoreChange?: (score: number, combo: number) => void;
  private onMovesChange?: (moves: number) => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  setCallbacks(
    onScoreChange: (score: number, combo: number) => void,
    onMovesChange: (moves: number) => void
  ) {
    this.onScoreChange = onScoreChange;
    this.onMovesChange = onMovesChange;
  }

  init(moves: number, target: number) {
    this.score = 0;
    this.combo = 0;
    this.movesLeft = moves;
    this.targetScore = target;
    this.tilesCleared = 0;
    this.onScoreChange?.(0, 0);
    this.onMovesChange?.(moves);
  }

  addMatchScore(tilesCleared: number, isCascade: boolean = false) {
    if (isCascade) {
      this.combo++;
    } else {
      this.combo = 1;
    }

    const baseScore = tilesCleared * 10;
    const comboMultiplier = 1 + (this.combo - 1) * 0.5;
    const bonus = tilesCleared > 3 ? (tilesCleared - 3) * 15 : 0;
    const totalScore = Math.round((baseScore + bonus) * comboMultiplier);

    this.score += totalScore;
    this.tilesCleared += tilesCleared;

    this.onScoreChange?.(this.score, this.combo);

    // Reset combo after delay
    if (this.comboTimer) this.comboTimer.destroy();
    this.comboTimer = this.scene.time.delayedCall(1500, () => {
      this.combo = 0;
    });

    return totalScore;
  }

  useMove() {
    this.movesLeft--;
    this.onMovesChange?.(this.movesLeft);
  }

  hasMovesLeft(): boolean {
    return this.movesLeft > 0;
  }

  hasReachedTarget(): boolean {
    return this.score >= this.targetScore;
  }

  getStars(): number {
    if (this.score >= this.targetScore * 2) return 3;
    if (this.score >= this.targetScore * 1.5) return 2;
    if (this.score >= this.targetScore) return 1;
    return 0;
  }
}
