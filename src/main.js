import Phaser from 'phaser';
import FarmScene from './scenes/FarmScene.js';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#1a3520',
  pixelArt: true, // Crucial for pixel art to stay crisp
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [FarmScene]
};

const game = new Phaser.Game(config);

