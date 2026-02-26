# 8-Bit Office Dashboard Sprites

This directory contains sprite assets for the 8-bit office dashboard project.

## Status Icons (8x8 pixels)

| File | Description |
|------|-------------|
| `status-online.svg` | Green dot with pulsing animation |
| `status-offline.svg` | Red X icon |
| `status-working.svg` | Yellow hammer/wrench icon |

## Agent Sprites (16x16 pixels each)

Each agent has two animation states:

| Agent | Idle (2 frames) | Working/Walking (4 frames) |
|-------|-----------------|---------------------------|
| Coder | `coder-idle.svg` | `coder-working.svg` (typing with cyan glow hands) |
| Researcher | `researcher-idle.svg` | `researcher-working.svg` (reading/flipping pages) |
| Tester | `tester-idle.svg` | `tester-working.svg` (clicking with cursor trails) |
| Manager | `manager-idle.svg` | `manager-walking.svg` (walking with briefcase swing) |

## Palette

- #000000 (black)
- #555555 (dark gray)
- #AAAAAA (light gray)
- #FFFFFF (white)
- #00AA00 (green)
- #0000FF (blue)
- #FFFF00 (yellow)
- #FF0000 (red)
- #00FFFF (cyan - for effects)

## Usage

These SVGs can be used directly in HTML/CSS, or converted to PNG sprite sheets for canvas rendering. CSS animations are embedded within each SVG for browser-based rendering.

For canvas usage, you can convert to PNG using tools like `svgexport` or similar.
