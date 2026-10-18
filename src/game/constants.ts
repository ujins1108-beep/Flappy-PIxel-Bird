import { GameConfig, DifficultyMode } from './types.ts';

/**
 * Game Configuration & Physics Constants
 * All values are documented and can be easily tuned here.
 */
export const BASE_CONFIG: GameConfig = {
  CANVAS_WIDTH: 480,           // Virtual resolution width (3:4 wider arcade ratio)
  CANVAS_HEIGHT: 640,          // Virtual resolution height
  GRAVITY: 880,                // Downward acceleration (px/s^2)
  JUMP_FORCE: -270,            // Upward instant velocity impulse on flap (px/s, lowered for comfortable control)
  MAX_FALL_SPEED: 450,         // Terminal fall velocity (px/s)
  PIPE_SPEED: 140,             // Horizontal pipe scroll speed (px/s)
  PIPE_SPAWN_INTERVAL: 1.65,   // Seconds between pipe generation
  PIPE_GAP: 135,               // Vertical gap height between upper and lower pipes
  PIPE_WIDTH: 52,              // Width of the green pipe body
  GROUND_HEIGHT: 96,           // Height of ground grass/dirt from canvas bottom
  BIRD_WIDTH: 34,              // Sprite visual width
  BIRD_HEIGHT: 24,             // Sprite visual height
  HITBOX_INSET_X: 4,           // Forgiving collision padding X
  HITBOX_INSET_Y: 3,           // Forgiving collision padding Y
};

export const DIFFICULTY_PRESETS: Record<Exclude<DifficultyMode, 'CUSTOM'>, Partial<GameConfig>> = {
  EASY: {
    GRAVITY: 780,
    JUMP_FORCE: -250,
    PIPE_SPEED: 120,
    PIPE_GAP: 160,
    PIPE_SPAWN_INTERVAL: 1.9,
  },
  NORMAL: {
    GRAVITY: 880,
    JUMP_FORCE: -270,
    PIPE_SPEED: 140,
    PIPE_GAP: 135,
    PIPE_SPAWN_INTERVAL: 1.65,
  },
  HARD: {
    GRAVITY: 980,
    JUMP_FORCE: -295,
    PIPE_SPEED: 165,
    PIPE_GAP: 115,
    PIPE_SPAWN_INTERVAL: 1.45,
  },
};
