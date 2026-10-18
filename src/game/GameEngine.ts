/**
 * Flappy Pixel Bird - Core Canvas Game Engine
 * Manages the 60+ FPS game loop, delta-time physics, pipe management,
 * collision bounding boxes, audio triggers, score tracking, and rendering.
 */

import { GameState, GameConfig, Bird, PipePair, ScoreData } from './types.ts';
import { BASE_CONFIG } from './constants.ts';
import { GameAssets, loadGameAssets } from './assets.ts';
import { sound } from './audio.ts';

export interface GameEngineCallbacks {
  onStateChange: (state: GameState) => void;
  onScoreUpdate: (scoreData: ScoreData) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private assets: GameAssets;
  private callbacks: GameEngineCallbacks;

  // Configuration
  public config: GameConfig;

  // Game Loop
  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private isRunning: boolean = false;

  // Game State
  private state: GameState = 'READY';
  private score: number = 0;
  private bestScore: number = 0;
  private isNewRecord: boolean = false;

  // Entities
  private bird: Bird = {
    x: 100,
    y: 280,
    vy: 0,
    rotation: 0,
    frame: 0,
    animTimer: 0,
  };
  private pipes: PipePair[] = [];
  private pipeSpawnTimer: number = 0;
  private pipeIdCounter: number = 0;
  private groundOffsetX: number = 0;

  // Ready State Floating Animation
  private readyTimer: number = 0;

  // Impact Visual Effects
  private screenFlashAlpha: number = 0;
  private screenShakeTimer: number = 0;

  constructor(canvas: HTMLCanvasElement, callbacks: GameEngineCallbacks, initialConfig: GameConfig = BASE_CONFIG) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas 2D context not available');
    }
    this.ctx = context;
    this.callbacks = callbacks;
    this.config = { ...initialConfig };

    // Set internal resolution
    this.canvas.width = this.config.CANVAS_WIDTH;
    this.canvas.height = this.config.CANVAS_HEIGHT;

    // Strict pixel art smoothing setting
    this.ctx.imageSmoothingEnabled = false;

    // Load assets (procedural + PNG data)
    this.assets = loadGameAssets();

    // Load High Score
    const savedBest = localStorage.getItem('flappy_best_score');
    this.bestScore = savedBest ? parseInt(savedBest, 10) || 0 : 0;

    this.resetGame();
  }

  /**
   * Resets all game entities for a fresh run
   */
  public resetGame() {
    this.state = 'READY';
    this.score = 0;
    this.isNewRecord = false;

    this.bird = {
      x: 100,
      y: (this.config.CANVAS_HEIGHT - this.config.GROUND_HEIGHT) / 2 - 20,
      vy: 0,
      rotation: 0,
      frame: 0,
      animTimer: 0,
    };

    this.pipes = [];
    this.pipeSpawnTimer = 0;
    this.pipeIdCounter = 0;
    this.readyTimer = 0;
    this.screenFlashAlpha = 0;
    this.screenShakeTimer = 0;

    this.callbacks.onStateChange(this.state);
    this.callbacks.onScoreUpdate({
      current: this.score,
      best: this.bestScore,
      isNewRecord: false,
    });
  }

  /**
   * User Jump / Flap Input Action
   */
  public handleAction() {
    if (this.state === 'READY') {
      // Transition from READY to PLAYING
      this.state = 'PLAYING';
      this.callbacks.onStateChange(this.state);
      this.flap();
      sound.playWing();
    } else if (this.state === 'PLAYING') {
      this.flap();
      sound.playWing();
    } else if (this.state === 'GAME_OVER') {
      // If already in GAME_OVER, reset to READY
      this.resetGame();
      sound.playSwoosh();
    }
  }

  private flap() {
    this.bird.vy = this.config.JUMP_FORCE;
    // Immediate nose-up tilt (-22 degrees in radians)
    this.bird.rotation = -0.38;
    this.bird.frame = 2; // Wings down flap frame
  }

  public getState(): GameState {
    return this.state;
  }

  public getScoreData(): ScoreData {
    return {
      current: this.score,
      best: this.bestScore,
      isNewRecord: this.isNewRecord,
    };
  }

  public updateConfig(newConfig: Partial<GameConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Starts the animation loop
   */
  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  /**
   * Stops the animation loop
   */
  public stop() {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private loop = (currentTime: number) => {
    if (!this.isRunning) return;

    // Delta time in seconds with cap (prevent physics tunneling if tab is inactive)
    const rawDelta = (currentTime - this.lastTime) / 1000;
    const dt = Math.min(rawDelta, 0.033);
    this.lastTime = currentTime;

    this.update(dt);
    this.render();

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  /**
   * Physics & Logic Update
   */
  private update(dt: number) {
    // 1. Ready state: floating gentle bobbing & flapping
    if (this.state === 'READY') {
      this.readyTimer += dt;
      // Gentle sine bobbing
      const centerY = (this.config.CANVAS_HEIGHT - this.config.GROUND_HEIGHT) / 2 - 20;
      this.bird.y = centerY + Math.sin(this.readyTimer * 5) * 6;
      this.bird.rotation = 0;

      // Wing flap animation
      this.bird.animTimer += dt;
      if (this.bird.animTimer > 0.14) {
        this.bird.frame = (this.bird.frame + 1) % 3;
        this.bird.animTimer = 0;
      }

      // Ground keeps scrolling so the world feels dynamic
      this.groundOffsetX = (this.groundOffsetX + this.config.PIPE_SPEED * dt) % this.config.CANVAS_WIDTH;
      return;
    }

    // 2. Playing state
    if (this.state === 'PLAYING') {
      // A. Bird Physics
      this.bird.vy += this.config.GRAVITY * dt;
      if (this.bird.vy > this.config.MAX_FALL_SPEED) {
        this.bird.vy = this.config.MAX_FALL_SPEED;
      }
      this.bird.y += this.bird.vy * dt;

      // Dynamic Rotation
      if (this.bird.vy < 0) {
        // Ascending: tilt upwards
        this.bird.rotation = Math.max(-0.45, this.bird.rotation - 3.5 * dt);
      } else {
        // Descending: smoothly pitch nose down up to ~75 degrees (+1.3 rad)
        this.bird.rotation = Math.min(1.3, this.bird.rotation + 2.8 * dt);
      }

      // Wing flapping (faster when climbing, glide when falling steep)
      this.bird.animTimer += dt;
      const flapInterval = this.bird.vy < 100 ? 0.09 : 0.22;
      if (this.bird.animTimer > flapInterval) {
        this.bird.frame = (this.bird.frame + 1) % 3;
        this.bird.animTimer = 0;
      }

      // B. Ground Scroll
      this.groundOffsetX = (this.groundOffsetX + this.config.PIPE_SPEED * dt) % this.config.CANVAS_WIDTH;

      // C. Pipe Spawner & Movement
      this.pipeSpawnTimer += dt;
      if (this.pipeSpawnTimer >= this.config.PIPE_SPAWN_INTERVAL) {
        this.spawnPipe();
        this.pipeSpawnTimer = 0;
      }

      const birdCenter = this.bird.x + this.config.BIRD_WIDTH / 2;

      for (let i = this.pipes.length - 1; i >= 0; i--) {
        const pipe = this.pipes[i];
        pipe.x -= this.config.PIPE_SPEED * dt;

        // Score update when crossing bird
        if (!pipe.passed && pipe.x + this.config.PIPE_WIDTH / 2 < birdCenter) {
          pipe.passed = true;
          this.score += 1;
          sound.playPoint();

          if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.isNewRecord = true;
            localStorage.setItem('flappy_best_score', String(this.bestScore));
          }

          this.callbacks.onScoreUpdate({
            current: this.score,
            best: this.bestScore,
            isNewRecord: this.isNewRecord,
          });
        }

        // Despawn off-screen pipes
        if (pipe.x + this.config.PIPE_WIDTH < -10) {
          this.pipes.splice(i, 1);
        }
      }

      // D. Collisions
      this.checkCollisions();
    }

    // 3. Game Over state: bird tumbles to the ground if not already there
    if (this.state === 'GAME_OVER') {
      const groundY = this.config.CANVAS_HEIGHT - this.config.GROUND_HEIGHT;
      if (this.bird.y + this.config.BIRD_HEIGHT < groundY) {
        this.bird.vy += this.config.GRAVITY * 1.2 * dt;
        this.bird.y += this.bird.vy * dt;
        this.bird.rotation = Math.min(Math.PI / 2, this.bird.rotation + 4 * dt);
        if (this.bird.y + this.config.BIRD_HEIGHT >= groundY) {
          this.bird.y = groundY - this.config.BIRD_HEIGHT;
        }
      }

      // Screen flash fadeout
      if (this.screenFlashAlpha > 0) {
        this.screenFlashAlpha = Math.max(0, this.screenFlashAlpha - dt * 3.5);
      }
      // Screen shake decay
      if (this.screenShakeTimer > 0) {
        this.screenShakeTimer = Math.max(0, this.screenShakeTimer - dt * 4);
      }
    }
  }

  /**
   * Spawns a pair of upper and lower green pipes with safe navigable gap
   */
  private spawnPipe() {
    const groundY = this.config.CANVAS_HEIGHT - this.config.GROUND_HEIGHT;
    const minPipeHeight = 55;
    const gap = this.config.PIPE_GAP;

    // Available span for gap
    const minTop = minPipeHeight;
    const maxTop = groundY - gap - minPipeHeight;
    const topHeight = Math.floor(minTop + Math.random() * (maxTop - minTop));

    this.pipes.push({
      id: ++this.pipeIdCounter,
      x: this.config.CANVAS_WIDTH,
      topHeight: topHeight,
      bottomY: topHeight + gap,
      passed: false,
    });
  }

  /**
   * Collision Detection: checks ceiling, ground, and pipe AABBs
   */
  private checkCollisions() {
    const groundY = this.config.CANVAS_HEIGHT - this.config.GROUND_HEIGHT;

    // Bird Inset Hitbox (forgiving & pixel-accurate)
    const birdBox = {
      left: this.bird.x + this.config.HITBOX_INSET_X,
      right: this.bird.x + this.config.BIRD_WIDTH - this.config.HITBOX_INSET_X,
      top: this.bird.y + this.config.HITBOX_INSET_Y,
      bottom: this.bird.y + this.config.BIRD_HEIGHT - this.config.HITBOX_INSET_Y,
    };

    // 1. Ceiling collision (flying off screen top)
    if (birdBox.top <= 0) {
      this.triggerGameOver();
      return;
    }

    // 2. Ground collision
    if (birdBox.bottom >= groundY) {
      this.bird.y = groundY - this.config.BIRD_HEIGHT;
      this.triggerGameOver();
      return;
    }

    // 3. Pipe collisions
    for (const pipe of this.pipes) {
      const pipeLeft = pipe.x;
      const pipeRight = pipe.x + this.config.PIPE_WIDTH;

      // Check horizontal overlap
      if (birdBox.right > pipeLeft && birdBox.left < pipeRight) {
        // Hit top pipe?
        if (birdBox.top < pipe.topHeight) {
          this.triggerGameOver();
          return;
        }
        // Hit bottom pipe?
        if (birdBox.bottom > pipe.bottomY) {
          this.triggerGameOver();
          return;
        }
      }
    }
  }

  /**
   * Triggers GAME OVER state, plays sounds, and initiates visual impact
   */
  private triggerGameOver() {
    if (this.state === 'GAME_OVER') return;
    this.state = 'GAME_OVER';
    sound.playHit();
    setTimeout(() => sound.playDie(), 120);

    this.screenFlashAlpha = 0.75;
    this.screenShakeTimer = 0.25;

    this.callbacks.onStateChange(this.state);
    this.callbacks.onScoreUpdate({
      current: this.score,
      best: this.bestScore,
      isNewRecord: this.isNewRecord,
    });
  }

  /**
   * Master Canvas Renderer
   */
  private render() {
    const ctx = this.ctx;
    ctx.save();

    // Screen Shake Offset
    if (this.screenShakeTimer > 0) {
      const shakeMag = this.screenShakeTimer * 12;
      const offsetX = (Math.random() - 0.5) * shakeMag;
      const offsetY = (Math.random() - 0.5) * shakeMag;
      ctx.translate(offsetX, offsetY);
    }

    // Ensure smoothing stays false
    ctx.imageSmoothingEnabled = false;

    // 1. Draw Background (Sky + Clouds + Skyline)
    ctx.drawImage(this.assets.background, 0, 0, this.config.CANVAS_WIDTH, this.config.CANVAS_HEIGHT);

    // 2. Draw Pipes
    for (const pipe of this.pipes) {
      this.renderPipePair(pipe);
    }

    // 3. Draw Ground (Scrolling Seamlessly)
    this.renderGround();

    // 4. Draw Animated Pixel Bird
    this.renderBird();

    // 5. Draw In-Game HUD Score (Only when PLAYING)
    if (this.state === 'PLAYING') {
      this.renderInGameScore();
    }

    // 6. Draw Screen Flash on hit
    if (this.screenFlashAlpha > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.screenFlashAlpha})`;
      ctx.fillRect(0, 0, this.config.CANVAS_WIDTH, this.config.CANVAS_HEIGHT);
    }

    ctx.restore();
  }

  /**
   * Renders upper and lower pipe pair
   */
  private renderPipePair(pipe: PipePair) {
    const ctx = this.ctx;
    const w = this.config.PIPE_WIDTH;

    // A. Upper Pipe (Inverted)
    // Draw inverted pipe such that its lip sits exactly at y = pipe.topHeight - rimHeight
    // The asset inverted pipe has its rim at the bottom!
    // Since pipe image height is 480, we draw from (topHeight - 480) down to topHeight
    ctx.drawImage(
      this.assets.pipeInverted,
      0, 480 - pipe.topHeight, w, pipe.topHeight,
      pipe.x, 0, w, pipe.topHeight
    );

    // B. Lower Pipe
    const groundY = this.config.CANVAS_HEIGHT - this.config.GROUND_HEIGHT;
    const lowerHeight = groundY - pipe.bottomY;
    ctx.drawImage(
      this.assets.pipe,
      0, 0, w, lowerHeight,
      pipe.x, pipe.bottomY, w, lowerHeight
    );
  }

  /**
   * Renders the repeating moving ground
   */
  private renderGround() {
    const ctx = this.ctx;
    const groundY = this.config.CANVAS_HEIGHT - this.config.GROUND_HEIGHT;
    const w = this.config.CANVAS_WIDTH;
    const h = this.config.GROUND_HEIGHT;

    // Two tiles side by side for seamless wrap
    const x1 = -this.groundOffsetX;
    const x2 = x1 + w;

    ctx.drawImage(this.assets.ground, x1, groundY, w, h);
    ctx.drawImage(this.assets.ground, x2, groundY, w, h);
  }

  /**
   * Renders the rotating pixel bird with current frame
   */
  private renderBird() {
    const ctx = this.ctx;
    const frameCanvas = this.assets.birdFrames[this.bird.frame] || this.assets.birdFrames[0];

    ctx.save();
    // Translate to bird center for rotation
    const cx = this.bird.x + this.config.BIRD_WIDTH / 2;
    const cy = this.bird.y + this.config.BIRD_HEIGHT / 2;
    ctx.translate(cx, cy);
    ctx.rotate(this.bird.rotation);

    // Draw centered
    ctx.drawImage(
      frameCanvas,
      -this.config.BIRD_WIDTH / 2,
      -this.config.BIRD_HEIGHT / 2,
      this.config.BIRD_WIDTH,
      this.config.BIRD_HEIGHT
    );

    ctx.restore();
  }

  /**
   * Renders the bold 8-bit score counter at top center
   */
  private renderInGameScore() {
    const ctx = this.ctx;
    const text = String(this.score);
    ctx.save();

    ctx.font = 'bold 32px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const x = this.config.CANVAS_WIDTH / 2;
    const y = 48;

    // Thick drop shadow outline
    ctx.fillStyle = '#000000';
    ctx.fillText(text, x - 2, y);
    ctx.fillText(text, x + 2, y);
    ctx.fillText(text, x, y - 2);
    ctx.fillText(text, x, y + 2);
    ctx.fillText(text, x + 3, y + 3);

    // Bright White Front
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, x, y);

    ctx.restore();
  }
}
