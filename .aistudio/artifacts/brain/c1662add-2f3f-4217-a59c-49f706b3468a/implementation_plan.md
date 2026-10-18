# Flappy Pixel Bird (Classic Retro Arcade 2D Web Game)

A complete, production-grade 2D side-scrolling pixel-art arcade game built with HTML5 Canvas, React 19, TypeScript, and procedural 8-bit Web Audio. Players flap through green pipes in a vibrant retro world with fluid physics, responsive controls (keyboard, mouse, touch), crisp pixel rendering, and high-score persistence.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following parameters and architectural decisions were confirmed via Phase 1 clarification:
> - **Game Title & Theme**: *Flappy Pixel Bird* — Classic retro arcade aesthetic with high-contrast pixel clouds, cityscape skyline silhouettes, bright grass floor, and an original winged pixel bird.
> - **Difficulty Tuning**: *Standard Arcade* — Faithful to the authentic Flappy physics curve, with accessible configuration constants for quick adjustment.
> - **Audio Feedback**: Built-in 8-bit retro sound synthesizer (Web Audio API) for wing flaps, passing pipes, hit collisions, and game over falls, equipped with a clean mute toggle. Zero external asset download dependencies to guarantee 100% offline reliability.

---

## 1. Overview & Core Concept

- **What It Does**: A complete retro arcade game running directly in any modern desktop or mobile browser. Players control a fluttering pixel bird traversing pairs of upper and lower green pipes. Score ticks up upon clearing pipe pairs, with instant collision detection, authentic gravity and rotation dynamics, and seamless restart cycles.
- **Target Audience / Persona**: Retro gaming enthusiasts, casual web players, and developers seeking a clean, responsive, bug-free arcade experience.
- **Key Value**: Delivers an arcade-pure game loop with zero lag, sharp unblurred pixel graphics (`imageSmoothingEnabled = false`), authentic 60+ FPS delta-time physics, high scores stored in `localStorage`, and responsive touch/click/keyboard controls.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Title / READY State**:
   - Pixel art sky, floating cloud layers, animated ground scrolling continuously.
   - The pixel bird hovers gently with a rhythmic sine-wave flap animation at center-left.
   - Displays game title "FLAPPY PIXEL BIRD", a retro "TAP OR PRESS SPACE TO START" prompt, current Best Score, and audio toggle button.
2. **PLAYING State**:
   - Player inputs jump (Space, Mouse Click, or Mobile Touch). Bird immediately acquires upward velocity and tilts nose up.
   - Smooth downward acceleration by gravity; pitch angles down towards ground as velocity increases.
   - Pipes spawn periodically at varied gap heights.
   - Pixel scoreboard at top center increments upon safely passing each pipe gate.
   - Parallax pixel skyline and animated patterned grass ground roll underfoot.
3. **GAME OVER State**:
   - Screen flash and hit sound upon pipe/ground/ceiling contact.
   - Bird tumbles to ground; pipes freeze.
   - Retro modal appears with "GAME OVER", Final Score, Best Score, New High Score medal/badge, and large "PLAY AGAIN" / "RESTART" button (or Space key to restart immediately).

### Visual Identity & Theme
- **Aesthetic Direction**: Neo-retro 16-bit arcade pixel art. Sharp outlines, vibrant sky blues, emerald green pipes with highlights and lip collars, warm golden bird with orange beak and white-feathered wing.
- **Color Palette**:
  - Sky Blue: `#4ec0ca` (Daytime crisp arcade sky)
  - Cloud / Light Tint: `#ffffff` & `#e0f4f7`
  - Skyline Silhouettes: `#5ee0b8` & `#3ba88e`
  - Pipes: `#73bf2e` (Body), `#55a022` (Shadow), `#9ce659` (Highlight), `#2c5a14` (Border)
  - Ground: Grass top strip (`#5cb82f`, `#83d644`), dirt underground block (`#ded895`, `#d0c878`)
  - Pixel Bird: Golden yellow (`#f8b800`), flame wing (`#f87800`), eye (`#ffffff` & `#000000`), beak (`#e05000`)
- **Typography**: Authentic 8-bit arcade font (Google Font `Press Start 2P` with fallback to `monospace`), crisp text shadows for maximum contrast.
- **Canvas & Scaling**: Fixed internal virtual resolution (360x640), CSS scaled with `image-rendering: pixelated` / `crisp-edges` maintaining exact 9:16 portrait arcade ratio, centered gracefully on desktop with retro arcade cabinet styling.

---

## 3. Key Product Decisions & Trade-Offs

- **Asset Pipeline Strategy (Hybrid Procedural Pixel Art & PNG Export)**:
  - *Decision*: Provide clean pixel-art rendering pipelines with procedurally generated crisp PNG sprites exported to standard asset paths (`assets/images/bird.png`, `pipe.png`, `ground.png`, `background.png`) AND high-performance Canvas sprite caching.
  - *Why*: Guarantees zero broken external asset links, hermetic offline loading, perfect pixel density, and fulfills all user requirements for PNG assets and standalone execution.
- **Audio Architecture (Web Audio API Synthesizer)**:
  - *Decision*: Programmatic 8-bit chiptune synthesis (square/triangle/noise waves for jump swoop, score coin chime, crash thud, and falling whistle) with mute toggle state saved in `localStorage`.
  - *Why*: No latency, no audio file 404s, works reliably across Safari, Chrome, and Firefox upon user first interaction.
- **Physics Integration (Delta-Time with Clamped Sub-stepping)**:
  - *Decision*: Calculate positions using `dt = Math.min(deltaTime, 0.033)` to eliminate lag jumps or tunnel penetration if a frame drops.
  - *Why*: Consistent jump arcs and hit detection regardless of 60Hz, 120Hz, or 144Hz displays.
- **Tight Hitbox Bounding**:
  - *Decision*: Visual bird is 34x24 px, but collision AABB is inset by 4px (`26x18` px) around the core body.
  - *Why*: Eliminates frustrating "hit empty air" collisions, creating the tight, fair challenge players expect.

---

## 4. Technical Architecture & Data Strategy

### System & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                          React Container                               │
│  ┌───────────────────────┐  ┌────────────────────────────────────────┐ │
│  │   Arcade Cabinet UI   │  │    Game Controls & Settings Bar        │ │
│  │  - Title / High Score │  │    - Mute Toggle (AudioCtx)            │ │
│  │  - Responsive Canvas  │  │    - Difficulty / Gap Inspector        │ │
│  └───────────┬───────────┘  └────────────────────────────────────────┘ │
└──────────────┼─────────────────────────────────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        HTML5 Canvas Engine                             │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ State Machine: [READY]  ──(Jump)──> [PLAYING] ──(Hit)──> [OVER]    │ │
│ └──────────────────────────────────┬─────────────────────────────────┘ │
│                                    ▼                                   │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ Game Loop (requestAnimationFrame with Delta-Time)                  │ │
│ │  ├─ Physics: gravity, bird velocity, rotation, floor clamp         │ │
│ │  ├─ Pipe Manager: spawn timer, horizontal scroll, despawn queue     │ │
│ │  ├─ Collision Detector: AABB intersect pipes / ground / ceiling     │ │
│ │  ├─ Score Engine: boundary check, pass flag, high-score persist    │ │
│ │  └─ Renderer: parallax sky, pipes, moving grass, animated bird, HUD│ │
│ └──────────────────────────────────┬─────────────────────────────────┘ │
│                                    ▼                                   │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ Web Audio 8-bit Synthesizer (Jump, Score, Hit, Die, Swoosh)        │ │
│ └────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### Game Physics & Tuning Constants
```typescript
export const GAME_CONFIG = {
  CANVAS_WIDTH: 360,
  CANVAS_HEIGHT: 640,
  GRAVITY: 980,          // px/s^2
  JUMP_FORCE: -330,      // upward impulse px/s
  MAX_FALL_SPEED: 480,   // terminal velocity px/s
  PIPE_SPEED: 150,       // horizontal speed px/s
  PIPE_SPAWN_INTERVAL: 1.6, // seconds between pipes
  PIPE_GAP: 125,         // gap height between top & bottom pipe px
  PIPE_WIDTH: 52,        // pipe width px
  GROUND_HEIGHT: 96,     // ground height from bottom px
  BIRD_WIDTH: 34,
  BIRD_HEIGHT: 24,
  HITBOX_INSET: 4,       // forgiving hitbox margin px
};
```

### Verification & Testing Plan
- [x] Initial READY screen displays title, instructions, and high score.
- [x] Spacebar, Click, and Touch trigger jump cleanly without multi-triggering bugs.
- [x] Bird flutters wings, responds instantly to jump, rotates smoothly downward when falling.
- [x] Pipes scroll smoothly; gaps are fair and navigable.
- [x] Crossing pipes increments score by exactly 1 point, accompanied by chime sound.
- [x] Collision with pipes, floor, or ceiling triggers GAME OVER immediately with hit sound.
- [x] GAME OVER screen displays current and all-time best score with immediate restart.
- [x] Responsive layout scales cleanly to full browser window while preserving pixel sharpness.
