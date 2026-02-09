import Phaser from 'phaser';
import type { GameOptions, GameResult } from './types';
import { ensureTextures } from './art';
import { Parrot } from './objects/Parrot';
import { Obstacle, OBSTACLE_KEYS } from './objects/Obstacle';
import { DIFFICULTY_CONFIG, getSpeed, getSpawnInterval } from './systems/Difficulty';
import { virtualInput, consumeBurst } from './virtualInput';

export class GameScene extends Phaser.Scene {
  private options: GameOptions;
  private parrot!: Parrot;
  private obstacles!: Phaser.Physics.Arcade.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: { left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key; burst: Phaser.Input.Keyboard.Key };
  private hud!: Phaser.GameObjects.Text;
  private window!: Phaser.GameObjects.TileSprite;
  private curtain!: Phaser.GameObjects.TileSprite;
  private rope!: Phaser.GameObjects.TileSprite;
  private startTime = 0;
  private nextSpawnAt = 0;
  private burstUntil = 0;
  private burstQueued = false;
  private gameDurationMs = Number.POSITIVE_INFINITY;
  private safeUntil = 0;
  private hasStarted = false;
  private height = 0;
  private score = 0;
  private obstaclesAvoided = 0;
  private ended = false;
  private lastMoveAt = 0;
  private touchActive = false;
  private touchStartX = 0;
  private touchStartTime = 0;
  private touchDir = 0;
  private touchMode: 'tap' | 'move' = 'tap';

  constructor(options: GameOptions) {
    super('game');
    this.options = options;
  }

  create() {
    ensureTextures(this);

    const { width, height } = this.scale;
    this.window = this.add.tileSprite(0, 0, width, height, 'window').setOrigin(0).setDepth(0);
    this.curtain = this.add.tileSprite(0, 0, width, height, 'curtain').setOrigin(0).setDepth(1).setAlpha(0.85);
    this.rope = this.add.tileSprite(width / 2, 0, 12, height, 'rope').setOrigin(0.5, 0).setDepth(2);

    this.parrot = new Parrot(this, width / 2 + 18, height * 0.78);
    this.parrot.sprite.setCollideWorldBounds(true);

    this.obstacles = this.physics.add.group({ runChildUpdate: true });

    this.physics.add.overlap(this.parrot.sprite, this.obstacles, () => this.handleHit());

    const keyboard = this.input.keyboard;
    if (!keyboard) {
      throw new Error('Keyboard input not available.');
    }

    this.cursors = keyboard.createCursorKeys();
    this.keys = keyboard.addKeys({
      left: 'A',
      right: 'D',
      burst: 'SPACE'
    }) as { left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key; burst: Phaser.Input.Keyboard.Key };

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.touchActive = true;
      this.touchStartX = pointer.x;
      this.touchStartTime = this.time.now;
      this.touchMode = 'tap';
      this.touchDir = 0;
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.touchActive) return;
      const dx = pointer.x - this.touchStartX;
      if (Math.abs(dx) > 18) {
        this.touchMode = 'move';
        this.touchDir = Math.sign(dx);
      }
    });

    this.input.on('pointerup', () => {
      if (this.touchMode === 'tap' && this.time.now - this.touchStartTime < 240) {
        this.burstQueued = true;
      }
      this.touchActive = false;
      this.touchDir = 0;
    });

    this.hud = this.add.text(12, 12, '', {
      fontFamily: 'Galmuri11',
      fontSize: '22px',
      color: '#f7efe4'
    }).setDepth(5);

    this.startTime = 0;
    this.nextSpawnAt = 0;
    this.safeUntil = 0;
    this.hasStarted = false;
  }

  private handleHit() {
    if (this.ended) return;
    if (this.time.now < this.safeUntil) return;
    this.parrot.setMotion('slip');
    this.finishRun();
  }

  private spawnObstacle(speed: number) {
    const { width } = this.scale;
    const margin = 40;
    const safeRadius = 60;
    const parrotX = this.parrot.sprite.x;
    let x = Phaser.Math.Between(margin, width - margin);
    let attempts = 0;
    while (Math.abs(x - parrotX) < safeRadius && attempts < 6) {
      x = Phaser.Math.Between(margin, width - margin);
      attempts += 1;
    }
    const y = -20;
    const key = Phaser.Utils.Array.GetRandom(OBSTACLE_KEYS);
    const obstacle = new Obstacle(this, x, y, key);
    const obstacleBody = obstacle.body as Phaser.Physics.Arcade.Body;
    obstacleBody.setVelocityY(speed + obstacle.extraSpeed);
    this.obstacles.add(obstacle);
  }

  private finishRun() {
    this.ended = true;
    this.physics.pause();

    const durationMs = Math.min(this.gameDurationMs, this.time.now - this.startTime);
    const result: GameResult = {
      difficulty: this.options.difficulty,
      score: this.score,
      height: this.height,
      durationMs,
      obstaclesAvoided: this.obstaclesAvoided
    };

    this.time.delayedCall(400, () => {
      this.options.onGameOver(result);
    });
  }

  update(time: number, delta: number) {
    if (this.ended) return;

    const now = this.time.now;
    if (!this.hasStarted) {
      this.hasStarted = true;
      this.startTime = now;
      this.nextSpawnAt = now + 1500;
      this.safeUntil = now + 1500;
    }

    const elapsedMs = now - this.startTime;
    const elapsedSec = elapsedMs / 1000;
    const config = DIFFICULTY_CONFIG[this.options.difficulty];

    if (elapsedMs >= this.gameDurationMs) {
      this.finishRun();
      return;
    }

    const virtualBurst = consumeBurst();
    if (Phaser.Input.Keyboard.JustDown(this.keys.burst) || this.burstQueued || virtualBurst) {
      this.burstUntil = now + 220;
      this.parrot.setMotion('burst');
      this.burstQueued = false;
    }

    const isBursting = now < this.burstUntil;
    const speed = getSpeed(config, elapsedSec, 0);

    if (now >= this.nextSpawnAt) {
      this.spawnObstacle(speed);
      this.nextSpawnAt = now + getSpawnInterval(config, elapsedSec);
    }

    this.window.tilePositionY += (speed * delta) / 2400;
    this.curtain.tilePositionY += (speed * delta) / 1000;
    this.rope.tilePositionY += (speed * delta) / 1000;

    const leftPressed = this.cursors.left?.isDown || this.keys.left.isDown || virtualInput.left;
    const rightPressed = this.cursors.right?.isDown || this.keys.right.isDown || virtualInput.right;

    let direction = 0;
    if (leftPressed) direction -= 1;
    if (rightPressed) direction += 1;
    if (this.touchDir !== 0) direction = this.touchDir;

    const body = this.parrot.sprite.body as Phaser.Physics.Arcade.Body;
    const lateralBoost = isBursting ? config.lateralSpeed * 0.7 : 0;
    const targetVelocity = direction * (config.lateralSpeed + lateralBoost);
    body.velocity.x = Phaser.Math.Linear(body.velocity.x, targetVelocity, 0.2);

    if (Math.abs(body.velocity.x) > 5) {
      this.lastMoveAt = now;
    }

    if (!isBursting) {
      if (Math.abs(body.velocity.x) > 5) {
        this.parrot.setMotion('climb');
      } else if (now - this.lastMoveAt > 900) {
        this.parrot.setMotion('rest');
      } else {
        this.parrot.setMotion('climb');
      }
    }

    this.parrot.update(time, body.velocity.x);

    this.obstacles.children.each((child) => {
      const obstacle = child as Obstacle;
      const obstacleBody = obstacle.body as Phaser.Physics.Arcade.Body;
      obstacleBody.velocity.y = speed + obstacle.extraSpeed;
      if (obstacle.y > this.scale.height + 30) {
        obstacle.destroy();
        this.obstaclesAvoided += 1;
      }
      return true;
    });

    this.height = Math.floor(elapsedSec * 3);
    this.score = Math.floor(this.height * 2 + this.obstaclesAvoided * 15);

    const heightCm = Math.round((this.height * 100) / 200);
    this.hud.setText(
      `난이도 ${this.options.difficulty.toUpperCase()}  생존 ${(elapsedSec).toFixed(1)}s\n` +
      `높이 ${heightCm}cm  점수 ${this.score}  회피 ${this.obstaclesAvoided}`
    );
  }
}
