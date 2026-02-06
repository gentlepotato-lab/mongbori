import Phaser from 'phaser';

const drawParrotFrame = (ctx: CanvasRenderingContext2D, wingY: number, blink: boolean) => {
  ctx.clearRect(0, 0, 32, 32);
  ctx.imageSmoothingEnabled = false;

  ctx.fillStyle = '#f4d35e';
  ctx.fillRect(10, 12, 12, 10);

  ctx.fillStyle = '#f7e6a1';
  ctx.fillRect(12, 7, 8, 6);

  ctx.fillStyle = '#f0b429';
  ctx.fillRect(6, wingY, 9, 6);

  ctx.fillStyle = '#f28c28';
  ctx.fillRect(20, 13, 4, 3);

  ctx.fillStyle = '#1d1b16';
  if (blink) {
    ctx.fillRect(16, 10, 3, 1);
  } else {
    ctx.fillRect(16, 9, 2, 2);
  }

  ctx.fillStyle = '#d98b2b';
  ctx.fillRect(12, 21, 6, 3);
};

const drawBee = (ctx: CanvasRenderingContext2D) => {
  ctx.clearRect(0, 0, 16, 16);
  ctx.fillStyle = '#2b261f';
  ctx.fillRect(4, 6, 8, 5);
  ctx.fillStyle = '#f4d35e';
  ctx.fillRect(5, 6, 2, 5);
  ctx.fillRect(9, 6, 2, 5);
  ctx.fillStyle = '#f7e6a1';
  ctx.fillRect(2, 4, 4, 2);
  ctx.fillRect(10, 4, 4, 2);
};

const drawPin = (ctx: CanvasRenderingContext2D) => {
  ctx.clearRect(0, 0, 16, 16);
  ctx.fillStyle = '#ee964b';
  ctx.fillRect(4, 4, 8, 8);
  ctx.fillStyle = '#2b261f';
  ctx.fillRect(7, 2, 2, 4);
};

const drawDust = (ctx: CanvasRenderingContext2D) => {
  ctx.clearRect(0, 0, 16, 16);
  ctx.fillStyle = '#c0b5a9';
  ctx.fillRect(5, 5, 6, 6);
  ctx.fillRect(3, 7, 4, 4);
  ctx.fillRect(9, 8, 4, 4);
};

const drawCurtain = (ctx: CanvasRenderingContext2D) => {
  ctx.clearRect(0, 0, 32, 64);
  ctx.fillStyle = '#4a3b2b';
  ctx.fillRect(0, 0, 32, 64);
  ctx.fillStyle = '#3b2f22';
  ctx.fillRect(0, 0, 8, 64);
  ctx.fillRect(16, 0, 8, 64);
  ctx.fillStyle = '#5a4a38';
  ctx.fillRect(8, 0, 4, 64);
  ctx.fillRect(24, 0, 4, 64);
};

const drawRope = (ctx: CanvasRenderingContext2D) => {
  ctx.clearRect(0, 0, 12, 64);
  ctx.fillStyle = '#9b7b4f';
  ctx.fillRect(0, 0, 12, 64);
  ctx.fillStyle = '#7e6441';
  ctx.fillRect(2, 0, 2, 64);
  ctx.fillRect(8, 0, 2, 64);
};

const createCanvasTexture = (scene: Phaser.Scene, key: string, width: number, height: number) => {
  const texture = scene.textures.createCanvas(key, width, height);
  if (!texture) return null;
  return texture;
};

export const ensureTextures = (scene: Phaser.Scene) => {
  if (scene.textures.exists('parrot-0')) return;

  const wingPositions = [14, 12, 10, 12];
  wingPositions.forEach((wingY, index) => {
    const texture = createCanvasTexture(scene, `parrot-${index}`, 32, 32);
    if (!texture) return;
    const ctx = texture.getContext();
    drawParrotFrame(ctx, wingY, index === 3);
    texture.refresh();
  });

  scene.anims.create({
    key: 'parrot-climb',
    frames: [
      { key: 'parrot-0' },
      { key: 'parrot-1' },
      { key: 'parrot-2' },
      { key: 'parrot-1' }
    ],
    frameRate: 8,
    repeat: -1
  });

  scene.anims.create({
    key: 'parrot-rest',
    frames: [
      { key: 'parrot-0' },
      { key: 'parrot-3' },
      { key: 'parrot-0' }
    ],
    frameRate: 2,
    repeat: -1
  });

  scene.anims.create({
    key: 'parrot-burst',
    frames: [
      { key: 'parrot-2' },
      { key: 'parrot-1' },
      { key: 'parrot-0' }
    ],
    frameRate: 12,
    repeat: -1
  });

  const beeTexture = createCanvasTexture(scene, 'obstacle-bee', 16, 16);
  if (beeTexture) {
    drawBee(beeTexture.getContext());
    beeTexture.refresh();
  }

  const pinTexture = createCanvasTexture(scene, 'obstacle-pin', 16, 16);
  if (pinTexture) {
    drawPin(pinTexture.getContext());
    pinTexture.refresh();
  }

  const dustTexture = createCanvasTexture(scene, 'obstacle-dust', 16, 16);
  if (dustTexture) {
    drawDust(dustTexture.getContext());
    dustTexture.refresh();
  }

  const curtainTexture = createCanvasTexture(scene, 'curtain', 32, 64);
  if (curtainTexture) {
    drawCurtain(curtainTexture.getContext());
    curtainTexture.refresh();
  }

  const ropeTexture = createCanvasTexture(scene, 'rope', 12, 64);
  if (ropeTexture) {
    drawRope(ropeTexture.getContext());
    ropeTexture.refresh();
  }
};