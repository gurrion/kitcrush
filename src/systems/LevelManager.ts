// KitCrush — Level Manager

import { LEVELS } from '../utils/constants';

export class LevelManager {
  public currentLevel: number = 0;
  public levelsCompleted: boolean[] = [];
  public levelStars: number[] = [];

  constructor() {
    this.load();
  }

  getCurrentLevelConfig() {
    return LEVELS[this.currentLevel] || LEVELS[LEVELS.length - 1];
  }

  completeLevel(stars: number) {
    this.levelsCompleted[this.currentLevel] = true;
    if (stars > (this.levelStars[this.currentLevel] || 0)) {
      this.levelStars[this.currentLevel] = stars;
    }
    this.save();
  }

  nextLevel() {
    if (this.currentLevel < LEVELS.length - 1) {
      this.currentLevel++;
    }
    this.save();
  }

  goToLevel(level: number) {
    if (level >= 0 && level < LEVELS.length) {
      this.currentLevel = level;
    }
  }

  isUnlocked(level: number): boolean {
    if (level === 0) return true;
    return this.levelsCompleted[level - 1] === true;
  }

  getTotalStars(): number {
    return this.levelStars.reduce((sum, s) => sum + (s || 0), 0);
  }

  save() {
    try {
      localStorage.setItem('kitcrush_level', String(this.currentLevel));
      localStorage.setItem('kitcrush_completed', JSON.stringify(this.levelsCompleted));
      localStorage.setItem('kitcrush_stars', JSON.stringify(this.levelStars));
    } catch (e) {
      // Storage not available
    }
  }

  load() {
    try {
      const level = localStorage.getItem('kitcrush_level');
      if (level) this.currentLevel = parseInt(level, 10);

      const completed = localStorage.getItem('kitcrush_completed');
      if (completed) this.levelsCompleted = JSON.parse(completed);

      const stars = localStorage.getItem('kitcrush_stars');
      if (stars) this.levelStars = JSON.parse(stars);
    } catch (e) {
      // Storage not available
    }
  }

  reset() {
    this.currentLevel = 0;
    this.levelsCompleted = [];
    this.levelStars = [];
    this.save();
  }
}
