import Phaser from 'phaser';

export const OBSTACLE_KEYS = ['obstacle-bee', 'obstacle-pin', 'obstacle-dust'];

export class Obstacle extends Phaser.Physics.Arcade.Sprite {
  extraSpeed: number;

  constructor(scene: Phaser.Scene, x: number, y: number, textureKey: string) {
    super(scene, x, y, textureKey);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.extraSpeed = Phaser.Math.Between(20, 80);
    this.setDepth(3);
    this.setImmovable(true);
    this.setScale(1.35);
    this.setSize(14, 14, true);
  }
}
