/**
 * Flappy Pixel Bird - Type Definitions
 */

export type GameState = 'READY' | 'PLAYING' | 'GAME_OVER';

export type DifficultyMode = 'EASY' | 'NORMAL' | 'HARD' | 'CUSTOM';

export interface GameConfig {
  CANVAS_WIDTH: number;
  CANVAS_HEIGHT: number;
  GRAVITY: number;
  JUMP_FORCE: number;
  MAX_FALL_SPEED: number;
  PIPE_SPEED: number;
  PIPE_SPAWN_INTERVAL: number;
  PIPE_GAP: number;
  PIPE_WIDTH: number;
  GROUND_HEIGHT: number;
  BIRD_WIDTH: number;
  BIRD_HEIGHT: number;
  HITBOX_INSET_X: number;
  HITBOX_INSET_Y: number;
}

export interface Bird {
  x: number;
  y: number;
  vy: number;
  rotation: number;
  frame: number; // 0, 1, 2 for flapping
  animTimer: number;
}

export interface PipePair {
  id: number;
  x: number;
  topHeight: number;
  bottomY: number;
  passed: boolean;
}

export interface ScoreData {
  current: number;
  best: number;
  isNewRecord: boolean;
}
