# 8-Bit Office Dashboard SPEC

## 1. Office Layout Description
Top-down pixel art view (e.g., 256x192 pixels total canvas). 8-bit retro style: limited palette (grays, blues, greens, browns for wood/metal).

- **Structure**: Open-plan office with 5 cubicles in a U-shape.
  - Central aisle (gray floor tiles).
  - 4 corner cubicles (Coder, Researcher, Tester, empty).
  - Manager's office in top-right (glass walls).
  - Walls/floors: Beige carpet tiles (4x4 px), cubicle partitions (dark gray 2px thick), desks (brown 16x8 px with computer/monitor 8x8 px green glow).
- Inspiration: Reddit [Office Cubicle](https://www.reddit.com/r/PixelArt/comments/rdxl1e/office_cubicle/), itch.io [Pixel Office packs](https://itch.io/game-assets/tag-office/tag-pixel-art), Pinterest 8-bit offices.

Tile-based: Use 16x16 tiles for floor, 32x32 for cubicles.

## 2. Agent Sprite Descriptions (16x16 pixels)
Monochrome outlines with 4-8 color palette (skin, clothes, props). Facing down/right for top-down view.

- **Coder**: Blue shirt, glasses. Idle: sits at desk hands on keyboard. Working: hands moving over keys (hands glow cyan).
- **Researcher**: White coat/lab coat. Idle: sits reading book/clipboard. Working: flipping pages (book open).
- **Tester**: Green shirt, headset. Idle: sits checking screen. Working: mouse clicks (cursor trails).
- **Manager**: Suit/tie. Idle: stands. Walking: legs stride, briefcase swing.
- Props: Shared desk computer (monitor + keyboard).
Inspiration: itch.io free office assets, general 16x16 worker sprites from Piskel/Pixilart.

## 3. Animation States (2-4 frames, 8fps)
Sprite sheets: 16x16 per frame, horizontal strip.

- **Idle**: 2 frames (breathe/slight sway).
- **Working**: 4 frames (action loop: type/read/check).
- **Walking** (Manager only): 4 frames (walk cycle: leg/arm swing).
Status overlay: Small 8x8 icons above head.
  - Online: Green dot pulsing.
  - Offline: Red X.
  - Working: Yellow hammer/wrench icon.
Inspiration: [1bit Retro Status Icons](https://kokomauslovesyou.itch.io/rpg-icon-pack), itch.io status effects.

## 4. Interaction Model
- Canvas dashboard renders layout + agents.
- Hover: Highlight cubicle (glow/shadow).
- Click cubicle/agent: Popup modal with stats (name, role, status, uptime, tasks JSON).
  - E.g., \"Coder: Online, 95% uptime, Current: Fixing bugs\".
- Drag agents between cubicles (promote/demote).
Keyboard: Space=refresh statuses.

## 5. Technical Approach
**Canvas API (preferred for perf/animations)**:
- HTML5 Canvas (512x384 scaled).
- DrawImage for tiles/spritesheets.
- requestAnimationFrame loop: Update positions, animate frames (frame counter % totalFrames).
- OffscreenCanvas for sprite atlases.
- Event listeners: getImageData for hit detection (or bounding boxes).

**Alt: React + CSS**:
- SVG or img sprites.
- CSS @keyframes for walk/work loops.
- Grid layout for cubicles.
- Framer Motion or React Spring for interactions.

**Asset Creation**: Use Piskel/Aseprite for sprites (export PNG sheets). Free assets from itch.io (e.g., Pixel Office Pack).

**Implementation Steps**:
1. Create sprite PNGs (links/sources above).
2. Canvas: Draw background, then agents.
3. Simulate agents: Random walk/work states.
4. WebSocket for real-time status (future).

Palette: #000000, #555555, #AAAAAA, #FFFFFF, #00AA00 (green), #0000FF (blue), #FFFF00 (yellow)."
