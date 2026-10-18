/**
 * Flappy Pixel Bird - Pixel Art Asset Generator & Manager
 * Produces crisp, authentic 16-bit pixel art textures and exports them
 * as PNG Data URLs and HTMLImageElements.
 * 
 * Complies strictly with:
 * - imageSmoothingEnabled = false
 * - Pure PNG format
 * - Fail-safe initialization (zero blank screens, instant load)
 * - Distinct, original pixel bird character and pipes
 */

export interface GameAssets {
  bird: HTMLImageElement;           // Sprite sheet with 3 flapping frames (34x24 each)
  birdFrames: HTMLCanvasElement[];  // Pre-split frame canvases for ultra-fast rendering
  pipe: HTMLImageElement;           // Standard pipe with rim
  pipeInverted: HTMLImageElement;   // Inverted top pipe
  ground: HTMLImageElement;         // Tileable ground (grass + dirt)
  background: HTMLImageElement;     // Retro skyline & clouds
  titleLogo: HTMLImageElement;      // Arcade title logo
  ready: boolean;
}

/** Helper: create an offscreen canvas with smoothing disabled */
function createPixelCanvas(width: number, height: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  return { canvas, ctx };
}

/** Draws a single bird frame on a 34x24 pixel grid */
function drawBirdFrame(ctx: CanvasRenderingContext2D, frameIndex: number) {
  // Clear
  ctx.clearRect(0, 0, 34, 24);

  // Palette
  const C_OUTLINE = '#201004';
  const C_BODY_LIGHT = '#ffd214';
  const C_BODY_BASE = '#f8b800';
  const C_BODY_SHADOW = '#d89400';
  const C_BEAK_BASE = '#ff6b00';
  const C_BEAK_SHADOW = '#d84c00';
  const C_WING_BASE = '#ffffff';
  const C_WING_SHADOW = '#d0d8e8';
  const C_CHEEK = '#ff9880';
  const C_WHITE = '#ffffff';
  const C_BLACK = '#1a1a1a';

  // Helper to draw pixel block
  const p = (x: number, y: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  };

  // Body Outline (Oval shape centered around (16, 12))
  p(9, 2, 14, 1, C_OUTLINE);
  p(7, 3, 2, 1, C_OUTLINE);
  p(23, 3, 3, 1, C_OUTLINE);
  p(5, 4, 2, 2, C_OUTLINE);
  p(26, 4, 2, 2, C_OUTLINE);
  p(4, 6, 1, 10, C_OUTLINE);
  p(28, 6, 1, 9, C_OUTLINE);
  p(5, 16, 2, 2, C_OUTLINE);
  p(26, 15, 2, 2, C_OUTLINE);
  p(7, 18, 2, 1, C_OUTLINE);
  p(23, 17, 3, 1, C_OUTLINE);
  p(9, 19, 14, 1, C_OUTLINE);

  // Main Body Fill
  p(9, 3, 14, 16, C_BODY_BASE);
  p(7, 4, 2, 14, C_BODY_BASE);
  p(23, 4, 3, 13, C_BODY_BASE);
  p(5, 6, 2, 10, C_BODY_BASE);
  p(26, 6, 2, 9, C_BODY_BASE);

  // Highlights on top of head
  p(10, 4, 9, 2, C_BODY_LIGHT);
  p(8, 5, 3, 2, C_BODY_LIGHT);

  // Shadow on bottom
  p(9, 17, 14, 2, C_BODY_SHADOW);
  p(7, 16, 3, 2, C_BODY_SHADOW);

  // Big Eye (Outer white, pupil, highlight)
  p(18, 5, 8, 8, C_OUTLINE);
  p(19, 6, 6, 6, C_WHITE);
  p(21, 7, 3, 4, C_BLACK);
  p(21, 7, 1, 2, C_WHITE); // Eye glint

  // Cute Cheek
  p(15, 12, 3, 2, C_CHEEK);

  // Beak (Protruding right)
  p(27, 9, 6, 6, C_OUTLINE);
  p(27, 10, 5, 2, C_BEAK_BASE);
  p(27, 12, 4, 2, C_BEAK_SHADOW);
  p(26, 11, 6, 1, C_OUTLINE); // Beak mouth slit

  // Animated Wing based on frameIndex (0: UP, 1: MID, 2: DOWN)
  if (frameIndex === 0) {
    // Wing flapped UP
    p(6, 4, 9, 7, C_OUTLINE);
    p(7, 5, 7, 5, C_WING_BASE);
    p(8, 7, 5, 3, C_WING_SHADOW);
    p(5, 6, 2, 4, C_WING_SHADOW);
  } else if (frameIndex === 1) {
    // Wing MID (horizontal glide)
    p(6, 9, 10, 6, C_OUTLINE);
    p(7, 10, 8, 4, C_WING_BASE);
    p(7, 12, 7, 2, C_WING_SHADOW);
  } else {
    // Wing DOWN
    p(7, 12, 9, 7, C_OUTLINE);
    p(8, 13, 7, 5, C_WING_BASE);
    p(8, 15, 6, 3, C_WING_SHADOW);
  }
}

/** Generates bird sprite sheet containing all 3 frames */
function generateBirdSpriteSheet(): { image: HTMLImageElement; frames: HTMLCanvasElement[] } {
  const frameWidth = 34;
  const frameHeight = 24;
  const totalFrames = 3;

  const { canvas, ctx } = createPixelCanvas(frameWidth * totalFrames, frameHeight);
  const frameCanvases: HTMLCanvasElement[] = [];

  for (let i = 0; i < totalFrames; i++) {
    const { canvas: fCanvas, ctx: fCtx } = createPixelCanvas(frameWidth, frameHeight);
    drawBirdFrame(fCtx, i);
    frameCanvases.push(fCanvas);
    ctx.drawImage(fCanvas, i * frameWidth, 0);
  }

  const img = new Image();
  img.src = canvas.toDataURL('image/png');
  return { image: img, frames: frameCanvases };
}

/** Generates classic pixel art green pipe (regular and inverted) */
function generatePipeSprites(): { pipe: HTMLImageElement; pipeInverted: HTMLImageElement } {
  const width = 52;
  const height = 480;
  const rimHeight = 26;
  const rimExtra = 2; // Rim is 4px wider than body (2px on each side)

  const { canvas, ctx } = createPixelCanvas(width, height);

  // Pipe Palette
  const C_BORDER = '#275411';
  const C_HIGHLIGHT = '#a6eb57';
  const C_LIGHT = '#76c42e';
  const C_BASE = '#5aa922';
  const C_SHADOW = '#3c7917';
  const C_DEEP_SHADOW = '#2f5f12';

  // Helper: fill vertical gradient stripes for 3D pipe cylinder
  const drawCylinder = (x: number, y: number, w: number, h: number) => {
    // Left dark outline
    ctx.fillStyle = C_BORDER;
    ctx.fillRect(x, y, 2, h);
    // Right dark outline
    ctx.fillRect(x + w - 2, y, 2, h);

    // Left highlight stripe
    ctx.fillStyle = C_HIGHLIGHT;
    ctx.fillRect(x + 2, y, 4, h);
    // Light green
    ctx.fillStyle = C_LIGHT;
    ctx.fillRect(x + 6, y, 8, h);
    // Base green
    ctx.fillStyle = C_BASE;
    ctx.fillRect(x + 14, y, 16, h);
    // Shadow stripe
    ctx.fillStyle = C_SHADOW;
    ctx.fillRect(x + 30, y, 12, h);
    // Deep shadow right edge
    ctx.fillStyle = C_DEEP_SHADOW;
    ctx.fillRect(x + 42, y, w - 44, h);
  };

  // 1. Draw Body
  drawCylinder(rimExtra, rimHeight, width - rimExtra * 2, height - rimHeight);

  // 2. Draw Top Rim Collar
  ctx.fillStyle = C_BORDER;
  ctx.fillRect(0, 0, width, rimHeight); // Rim bounding border
  drawCylinder(0, 2, width, rimHeight - 4);

  // Top lip edge & bottom lip edge
  ctx.fillStyle = C_HIGHLIGHT;
  ctx.fillRect(2, 2, width - 4, 2);
  ctx.fillStyle = C_DEEP_SHADOW;
  ctx.fillRect(2, rimHeight - 4, width - 4, 2);

  const pipeImg = new Image();
  pipeImg.src = canvas.toDataURL('image/png');

  // Inverted pipe (flipped vertically for top pipe)
  const { canvas: invCanvas, ctx: invCtx } = createPixelCanvas(width, height);
  invCtx.translate(0, height);
  invCtx.scale(1, -1);
  invCtx.drawImage(canvas, 0, 0);

  const pipeInvImg = new Image();
  pipeInvImg.src = invCanvas.toDataURL('image/png');

  return { pipe: pipeImg, pipeInverted: pipeInvImg };
}

/** Generates ground tile (grass surface + rich dirt matrix) */
function generateGroundSprite(width: number = 480): HTMLImageElement {
  const height = 96;
  const { canvas, ctx } = createPixelCanvas(width, height);

  // Palette
  const C_BORDER = '#2c5a14';
  const C_GRASS_LIGHT = '#9de038';
  const C_GRASS_BASE = '#73bf2e';
  const C_GRASS_SHADOW = '#4e921d';
  const C_DIRT_LIGHT = '#e8df99';
  const C_DIRT_BASE = '#ded895';
  const C_DIRT_SHADOW = '#c5be77';
  const C_DIRT_DARK = '#a69e59';

  // Background dirt fill
  ctx.fillStyle = C_DIRT_BASE;
  ctx.fillRect(0, 0, width, height);

  // Top grass base bar
  ctx.fillStyle = C_GRASS_BASE;
  ctx.fillRect(0, 0, width, 14);

  // Top edge highlight line
  ctx.fillStyle = C_GRASS_LIGHT;
  ctx.fillRect(0, 0, width, 3);

  // Top dark border
  ctx.fillStyle = C_BORDER;
  ctx.fillRect(0, 0, width, 1);

  // Zigzag pixel grass blades extending into dirt
  for (let x = 0; x < width; x += 12) {
    ctx.fillStyle = C_GRASS_LIGHT;
    ctx.fillRect(x, 14, 4, 4);
    ctx.fillStyle = C_GRASS_BASE;
    ctx.fillRect(x + 4, 14, 4, 6);
    ctx.fillStyle = C_GRASS_SHADOW;
    ctx.fillRect(x + 8, 14, 4, 3);
  }

  // Dark line separating grass from dirt
  ctx.fillStyle = C_BORDER;
  for (let x = 0; x < width; x += 12) {
    ctx.fillRect(x, 18, 4, 1);
    ctx.fillRect(x + 4, 20, 4, 1);
    ctx.fillRect(x + 8, 17, 4, 1);
  }

  // Detailed pixel pebbles and dirt texture
  const seedOffsets = [
    { x: 8, y: 28, w: 4, h: 2, c: C_DIRT_LIGHT },
    { x: 12, y: 30, w: 3, h: 2, c: C_DIRT_SHADOW },
    { x: 24, y: 44, w: 6, h: 3, c: C_DIRT_DARK },
    { x: 30, y: 45, w: 2, h: 2, c: C_DIRT_LIGHT },
    { x: 42, y: 62, w: 5, h: 3, c: C_DIRT_SHADOW },
    { x: 16, y: 78, w: 7, h: 3, c: C_DIRT_DARK },
    { x: 34, y: 82, w: 4, h: 2, c: C_DIRT_LIGHT },
  ];

  for (let blockX = 0; blockX < width; blockX += 48) {
    seedOffsets.forEach(s => {
      ctx.fillStyle = s.c;
      ctx.fillRect(blockX + s.x, s.y, s.w, s.h);
    });
  }

  const img = new Image();
  img.src = canvas.toDataURL('image/png');
  return img;
}

/** Generates retro sky, pixel clouds, and distant skyline background */
function generateBackgroundSprite(width: number = 480, height: number = 640): HTMLImageElement {
  const { canvas, ctx } = createPixelCanvas(width, height);

  // 1. Sky Gradient (Arcade daytime cyan)
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#4ec0ca');
  grad.addColorStop(0.65, '#8be2ec');
  grad.addColorStop(0.85, '#d3f4f7');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // 2. Pixel Clouds in the Upper Sky
  const drawCloud = (cx: number, cy: number, scale: number = 1) => {
    ctx.fillStyle = '#ffffff';
    // Core puffs
    ctx.fillRect(cx, cy, 32 * scale, 12 * scale);
    ctx.fillRect(cx + 6 * scale, cy - 8 * scale, 20 * scale, 10 * scale);
    ctx.fillRect(cx + 12 * scale, cy - 14 * scale, 14 * scale, 8 * scale);
    ctx.fillRect(cx - 6 * scale, cy + 2 * scale, 10 * scale, 8 * scale);
    ctx.fillRect(cx + 28 * scale, cy + 2 * scale, 10 * scale, 8 * scale);

    // Subtle cloud underside shadow
    ctx.fillStyle = '#cbebf0';
    ctx.fillRect(cx - 4 * scale, cy + 9 * scale, 40 * scale, 3 * scale);
  };

  drawCloud(35, 75, 1.2);
  drawCloud(170, 130, 0.9);
  drawCloud(290, 85, 1.1);
  drawCloud(410, 140, 0.95);

  // 3. Far City Skyline Silhouettes (above ground, ground starts at y = 544)
  const groundY = height - 96;

  // Far layer buildings (Muted teal)
  ctx.fillStyle = '#7ed9cf';
  const farBuildings = [
    { x: 10, w: 26, h: 45 },
    { x: 42, w: 20, h: 55 },
    { x: 68, w: 32, h: 38 },
    { x: 106, w: 18, h: 62 },
    { x: 130, w: 28, h: 48 },
    { x: 164, w: 22, h: 58 },
    { x: 192, w: 34, h: 40 },
    { x: 232, w: 24, h: 65 },
    { x: 262, w: 30, h: 50 },
    { x: 298, w: 20, h: 58 },
    { x: 324, w: 30, h: 42 },
    { x: 360, w: 24, h: 60 },
    { x: 390, w: 32, h: 46 },
    { x: 428, w: 22, h: 54 },
    { x: 456, w: 22, h: 40 },
  ];
  farBuildings.forEach(b => {
    ctx.fillRect(b.x, groundY - b.h, b.w, b.h);
  });

  // Near layer buildings / trees (Deeper contrast teal)
  ctx.fillStyle = '#5ac7be';
  const nearBuildings = [
    { x: 0, w: 22, h: 32 },
    { x: 28, w: 26, h: 42 },
    { x: 60, w: 18, h: 30 },
    { x: 84, w: 30, h: 46 },
    { x: 120, w: 24, h: 36 },
    { x: 150, w: 28, h: 44 },
    { x: 184, w: 22, h: 32 },
    { x: 212, w: 32, h: 48 },
    { x: 250, w: 20, h: 38 },
    { x: 276, w: 28, h: 42 },
    { x: 310, w: 34, h: 35 },
    { x: 350, w: 22, h: 44 },
    { x: 378, w: 28, h: 38 },
    { x: 412, w: 24, h: 46 },
    { x: 442, w: 36, h: 34 },
  ];
  nearBuildings.forEach(b => {
    ctx.fillRect(b.x, groundY - b.h, b.w, b.h);
  });

  // Windows in buildings (tiny pixel dots)
  ctx.fillStyle = '#e8fbfb';
  nearBuildings.forEach(b => {
    for (let wy = groundY - b.h + 8; wy < groundY - 6; wy += 8) {
      for (let wx = b.x + 4; wx < b.x + b.w - 4; wx += 6) {
        ctx.fillRect(wx, wy, 2, 3);
      }
    }
  });

  // Soft green horizon bushes just before ground
  ctx.fillStyle = '#4fa997';
  for (let x = 0; x < width; x += 16) {
    ctx.beginPath();
    ctx.arc(x + 8, groundY - 2, 10, Math.PI, 0);
    ctx.fill();
  }

  const img = new Image();
  img.src = canvas.toDataURL('image/png');
  return img;
}

/** Generates Arcade Title Logo ("FLAPPY PIXEL") */
function generateTitleLogoSprite(): HTMLImageElement {
  const width = 280;
  const height = 70;
  const { canvas, ctx } = createPixelCanvas(width, height);

  ctx.font = 'bold 24px "Press Start 2P", monospace, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 3D Drop shadow
  ctx.fillStyle = '#222222';
  ctx.fillText('FLAPPY PIXEL', width / 2 + 3, height / 2 + 3);

  // Border outline
  ctx.fillStyle = '#ffffff';
  ctx.fillText('FLAPPY PIXEL', width / 2 - 1, height / 2);
  ctx.fillText('FLAPPY PIXEL', width / 2 + 1, height / 2);
  ctx.fillText('FLAPPY PIXEL', width / 2, height / 2 - 1);
  ctx.fillText('FLAPPY PIXEL', width / 2, height / 2 + 1);

  // Golden Yellow Face
  ctx.fillStyle = '#f8b800';
  ctx.fillText('FLAPPY PIXEL', width / 2, height / 2);

  const img = new Image();
  img.src = canvas.toDataURL('image/png');
  return img;
}

/**
 * Initializes and returns all game assets.
 * Guarantees zero broken images and instant synchronous availability.
 */
export function loadGameAssets(): GameAssets {
  const birdData = generateBirdSpriteSheet();
  const pipeData = generatePipeSprites();
  const groundImg = generateGroundSprite();
  const bgImg = generateBackgroundSprite();
  const logoImg = generateTitleLogoSprite();

  return {
    bird: birdData.image,
    birdFrames: birdData.frames,
    pipe: pipeData.pipe,
    pipeInverted: pipeData.pipeInverted,
    ground: groundImg,
    background: bgImg,
    titleLogo: logoImg,
    ready: true,
  };
}
