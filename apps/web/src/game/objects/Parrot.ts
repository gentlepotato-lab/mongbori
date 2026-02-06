import Phaser from 'phaser';

export type ParrotMotion = 'climb' | 'rest' | 'burst' | 'slip';

export class Parrot {
  sprite: Phaser.Physics.Arcade.Sprite;
  private motion: ParrotMotion = 'climb';
  private baseY: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.sprite(x, y, 'parrot-0');
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setDepth(2);
    this.sprite.setScale(1.2);
    this.sprite.play('parrot-climb');
    this.baseY = y;
  }

  setMotion(motion: ParrotMotion) {
    if (this.motion === motion) return;
    this.motion = motion;

    if (motion === 'climb') {
      this.sprite.play('parrot-climb', true);
      this.sprite.scene.tweens.killTweensOf(this.sprite);
      this.sprite.setScale(1.2);
    }

    if (motion === 'rest') {
      this.sprite.play('parrot-rest', true);
      this.sprite.scene.tweens.killTweensOf(this.sprite);
      this.sprite.setScale(1.1);
    }

    if (motion === 'burst') {
      this.sprite.play('parrot-burst', true);
      this.sprite.scene.tweens.add({
        targets: this.sprite,
        scaleX: 1.35,
        scaleY: 1.35,
        yoyo: true,
        duration: 120
      });
    }

    if (motion === 'slip') {
      this.sprite.scene.tweens.add({
        targets: this.sprite,
        angle: 25,
        yoyo: true,
        repeat: 4,
        duration: 60
      });
    }
  }

  update(time: number, velocityX: number) {
    this.sprite.y = this.baseY + Math.sin(time * 0.006) * 2;
    const tilt = Phaser.Math.Clamp(velocityX / 300, -0.4, 0.4);
    this.sprite.rotation = tilt;
  }
}