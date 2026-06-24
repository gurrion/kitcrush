// KitCrush — Main Entry Point

import Phaser from 'phaser';
import { gameConfig } from './config';

// Start the game
const game = new Phaser.Game(gameConfig);

// Handle visibility change (pause when tab/app is hidden)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    game.scene.scenes.forEach(scene => {
      if (scene.scene.isActive()) {
        scene.scene.pause();
      }
    });
  } else {
    game.scene.scenes.forEach(scene => {
      if (scene.scene.isPaused()) {
        scene.scene.resume();
      }
    });
  }
});

// Prevent default touch behaviors (scrolling, zooming)
document.addEventListener('touchmove', (e) => {
  if (e.target instanceof HTMLCanvasElement) {
    e.preventDefault();
  }
}, { passive: false });

// Handle resize
window.addEventListener('resize', () => {
  game.scale.refresh();
});
