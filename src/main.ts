// KitCrush — Main Entry Point

import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 480,
  height: 720,
  parent: 'game-container',
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, MenuScene, GameScene, GameOverScene],
  input: {
    activePointers: 2,
  },
  render: {
    antialias: true,
    pixelArt: false,
  },
};

const game = new Phaser.Game(config);

// Pause/resume on visibility change
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    game.scene.scenes.forEach(s => {
      if (s.scene.isActive()) s.scene.pause();
    });
  } else {
    game.scene.scenes.forEach(s => {
      if (s.scene.isPaused()) s.scene.resume();
    });
  }
});
