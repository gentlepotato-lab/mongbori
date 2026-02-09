import Phaser from 'phaser';

export type ObstacleKind = 'seed' | 'dust';

const textureByKind: Record<ObstacleKind, string> = {
  seed: 'obstacle-seed',
  dust: 'obstacle-dust'
};

export class Obstacle extends Phaser.Physics.Arcade.Sprite {
  extraSpeed: number;
  kind: ObstacleKind;

  constructor(scene: Phaser.Scene, x: number, y: number, kind: ObstacleKind) {
    super(scene, x, y, textureByKind[kind]);
    this.kind = kind;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.extraSpeed = Phaser.Math.Between(20, 80);
    this.setDepth(3);
    this.setImmovable(true);
    this.setScale(1.35);
    this.body.setSize(12, 12);
    this.body.setOffset(2, 2);
  }
}
