#!/usr/bin/env python3
"""
Generate underwater pixel art sprites for the Reef Office dashboard.
Creates PNG sprites using PIL (Pillow).
"""

from PIL import Image, ImageDraw
import os

# Output directory
SPRITE_DIR = "/home/ryanw/.openclaw/workspace/dashboard-v2/public/sprites/reef"
os.makedirs(SPRITE_DIR, exist_ok=True)

# Color palette
COLORS = {
    'coral_orange': '#ff6b35',
    'coral_white': '#ffffff',
    'coral_black': '#1a1a2e',
    'tang_blue': '#1e90ff',
    'tang_yellow': '#ffd700',
    'tang_black': '#0a0a15',
    'octopus_purple': '#8b5cf6',
    'octopus_red': '#dc2626',
    'turtle_green': '#16a34a',
    'turtle_shell': '#15803d',
    'turtle_flippers': '#22c55e',
    'bubble_green': '#22c55e',
    'bubble_red': '#ef4444',
    'bubble_yellow': '#eab308',
    'bubble_outline': '#ffffff',
    'seaweed_green': '#2d6a4f',
    'coral_peach': '#ff6b4a',
    'coral_pink': '#ff8c69',
}

def draw_pixel(x, y, color, draw):
    """Draw a single pixel (scaled up for pixel art effect)"""
    draw.rectangle([x*2, y*2, x*2+1, y*2+1], fill=color)

def create_clownfish_sprites():
    """Create clownfish (Nemo) sprite sheet - 4 frames, 32x32 each"""
    frames = []
    
    # Idle frames (2 frames floating)
    for frame_idx in range(2):
        img = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Body (orange)
        body_color = COLORS['coral_orange']
        # Main body oval
        for y in range(8, 24):
            for x in range(8, 24):
                if ((x-16)**2/64 + (y-16)**2/36) < 1:
                    draw_pixel(x, y, body_color, draw)
        
        # White stripes (vertical)
        for y in range(8, 24):
            for x in range(11, 14):
                if ((x-16)**2/9 + (y-16)**2/64) < 1:
                    draw_pixel(x, y, COLORS['coral_white'], draw)
            for x in range(18, 21):
                if ((x-16)**2/9 + (y-16)**2/64) < 1:
                    draw_pixel(x, y, COLORS['coral_white'], draw)
        
        # Eye (white with black pupil)
        draw_pixel(10, 14, COLORS['coral_white'], draw)
        draw_pixel(10, 15, COLORS['coral_black'], draw)
        
        # Tail fin
        for y in range(14, 18):
            draw_pixel(22 + (y-14), y, body_color, draw)
            draw_pixel(23 + (y-14), y, body_color, draw)
        
        # Fins (top and bottom)
        # Top fin - wiggle in animation
        offset = 1 if frame_idx == 0 else 0
        for i in range(3):
            draw_pixel(14+i, 7-offset-i//2, body_color, draw)
        
        # Bottom fin - wiggle
        for i in range(3):
            draw_pixel(15+i, 24+offset-i//2, body_color, draw)
        
        frames.append(img)
    
    # Working frames (2 frames swimming action)
    for frame_idx in range(2):
        img = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        body_color = COLORS['coral_orange']
        
        # Body with motion
        offset = 2 if frame_idx == 0 else 0
        
        for y in range(8, 24):
            for x in range(6, 22):
                if ((x-14-offset)**2/64 + (y-16)**2/36) < 1:
                    draw_pixel(x, y, body_color, draw)
        
        # White stripes
        for y in range(8, 24):
            for x in range(9, 12):
                if ((x-14-offset)**2/9 + (y-16)**2/64) < 1:
                    draw_pixel(x, y, COLORS['coral_white'], draw)
            for x in range(16, 19):
                if ((x-14-offset)**2/9 + (y-16)**2/64) < 1:
                    draw_pixel(x, y, COLORS['coral_white'], draw)
        
        # Eye
        draw_pixel(8-offset, 14, COLORS['coral_white'], draw)
        draw_pixel(8-offset, 15, COLORS['coral_black'], draw)
        
        # Tail (swishing)
        tail_offset = -2 if frame_idx == 0 else 2
        for y in range(14, 18):
            draw_pixel(22+tail_offset + (y-14)//2, y, body_color, draw)
            draw_pixel(23+tail_offset + (y-14)//2, y, body_color, draw)
        
        # Fins (more pronounced in working state)
        for i in range(4):
            draw_pixel(12+i, 7-i, body_color, draw)  # top
            draw_pixel(13+i, 24+i, body_color, draw)  # bottom
        
        frames.append(img)
    
    # Combine into sprite sheet
    sheet = Image.new('RGBA', (128, 32), (0, 0, 0, 0))
    for i, frame in enumerate(frames):
        sheet.paste(frame, (i*32, 0))
    
    sheet.save(f"{SPRITE_DIR}/coder.png")
    print("Created coder.png")

def create_blue_tang_sprites():
    """Create Blue Tang (Dory) sprite sheet - 4 frames, 32x32 each"""
    frames = []
    
    # Idle frames
    for frame_idx in range(2):
        img = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Body (blue)
        body_color = COLORS['tang_blue']
        
        for y in range(8, 24):
            for x in range(8, 24):
                if ((x-16)**2/56 + (y-16)**2/32) < 1:
                    draw_pixel(x, y, body_color, draw)
        
        # Yellow tail
        for y in range(14, 18):
            for x in range(22, 26):
                dist = ((x-24)**2/9 + (y-16)**2/4)
                if dist < 1:
                    draw_pixel(x, y, COLORS['tang_yellow'], draw)
        
        # Eye (white with black pupil)
        draw_pixel(10, 14, COLORS['coral_white'], draw)
        draw_pixel(10, 15, COLORS['tang_black'], draw)
        
        # Dorsal fin (top)
        offset = frame_idx
        for i in range(4):
            draw_pixel(13+i, 7-offset+i//2, body_color, draw)
        
        frames.append(img)
    
    # Working frames
    for frame_idx in range(2):
        img = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        body_color = COLORS['tang_blue']
        offset = 2 if frame_idx == 0 else 0
        
        # Body in motion
        for y in range(8, 24):
            for x in range(6, 22):
                if ((x-14-offset)**2/56 + (y-16)**2/32) < 1:
                    draw_pixel(x, y, body_color, draw)
        
        # Yellow tail (swishing)
        tail_offset = -2 if frame_idx == 0 else 2
        for y in range(14, 18):
            for x in range(20, 24):
                dist = ((x-22+tail_offset)**2/9 + (y-16)**2/4)
                if dist < 1:
                    draw_pixel(x, y, COLORS['tang_yellow'], draw)
        
        # Eye
        draw_pixel(8-offset, 14, COLORS['coral_white'], draw)
        draw_pixel(8-offset, 15, COLORS['tang_black'], draw)
        
        # Fins (active)
        for i in range(4):
            draw_pixel(12+i, 6-i//2, body_color, draw)
            draw_pixel(12+i, 25+i//2, body_color, draw)
        
        frames.append(img)
    
    sheet = Image.new('RGBA', (128, 32), (0, 0, 0, 0))
    for i, frame in enumerate(frames):
        sheet.paste(frame, (i*32, 0))
    
    sheet.save(f"{SPRITE_DIR}/researcher.png")
    print("Created researcher.png")

def create_octopus_sprites():
    """Create Octopus sprite sheet - 4 frames, 32x32 each"""
    frames = []
    
    # Idle frames (gentle float)
    for frame_idx in range(2):
        img = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        head_color = COLORS['octopus_purple']
        
        # Head (round)
        head_y = 12 if frame_idx == 0 else 10
        for y in range(head_y, head_y+14):
            for x in range(10, 22):
                if ((x-16)**2/36 + (y-19)**2/25) < 1:
                    draw_pixel(x, y, head_color, draw)
        
        # Eye (large, expressive)
        draw_pixel(13, 15, COLORS['coral_white'], draw)
        draw_pixel(14, 15, COLORS['coral_white'], draw)
        draw_pixel(13, 16, COLORS['coral_black'], draw)
        draw_pixel(14, 16, COLORS['coral_black'], draw)
        
        # Tentacles (idle - gentle curl)
        tentacle_offsets = [0, 1, 0, 1, 0, 1, 0, 1]
        for i, offset in enumerate(tentacle_offsets):
            base_x = 10 + i*2
            for j in range(6):
                y_pos = 24 + j
                if y_pos < 32:
                    x_offset = offset if j % 2 == 0 else -offset
                    draw_pixel(base_x + x_offset + j//3, y_pos, head_color, draw)
        
        frames.append(img)
    
    # Working frames (active)
    for frame_idx in range(2):
        img = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        head_color = COLORS['octopus_purple']
        
        # Head (more compact)
        head_y = 10
        for y in range(head_y, head_y+14):
            for x in range(10, 22):
                if ((x-16)**2/36 + (y-17)**2/25) < 1:
                    draw_pixel(x, y, head_color, draw)
        
        # Eyes (larger when working)
        draw_pixel(12, 14, COLORS['coral_white'], draw)
        draw_pixel(15, 14, COLORS['coral_white'], draw)
        draw_pixel(12, 15, COLORS['coral_black'], draw)
        draw_pixel(15, 15, COLORS['coral_black'], draw)
        
        # Tentacles (reaching out)
        for i in range(8):
            base_x = 9 + i*2
            for j in range(7):
                y_pos = 24 + j
                if y_pos < 32:
                    # More spread when working
                    x_off = (i - 3.5) * j // 4
                    draw_pixel(base_x + x_off, y_pos, head_color, draw)
        
        frames.append(img)
    
    sheet = Image.new('RGBA', (128, 32), (0, 0, 0, 0))
    for i, frame in enumerate(frames):
        sheet.paste(frame, (i*32, 0))
    
    sheet.save(f"{SPRITE_DIR}/tester.png")
    print("Created tester.png")

def create_sea_turtle_sprites():
    """Create Sea Turtle sprite sheet - 4 frames, 32x32 each"""
    frames = []
    
    # Idle frames (slow swim)
    for frame_idx in range(2):
        img = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        shell_color = COLORS['turtle_shell']
        flipper_color = COLORS['turtle_flippers']
        
        # Shell (oval)
        for y in range(10, 24):
            for x in range(8, 24):
                if ((x-16)**2/64 + (y-17)**2/36) < 1:
                    draw_pixel(x, y, shell_color, draw)
        
        # Shell pattern
        for y in range(12, 22):
            for x in range(12, 20):
                if ((x-16)**2/16 + (y-17)**2/9) < 1:
                    draw_pixel(x, y, COLORS['turtle_green'], draw)
        
        # Head
        head_x = 6 if frame_idx == 0 else 4
        for y in range(14, 18):
            draw_pixel(head_x + (y-14)//2, y, COLORS['turtle_green'], draw)
        
        # Flippers (idle - gentle stroke)
        flipper_offset = 2 if frame_idx == 0 else 0
        # Front flippers
        for i in range(3):
            draw_pixel(8+i, 11+flipper_offset+i//2, flipper_color, draw)
            draw_pixel(8+i, 22-flipper_offset-i//2, flipper_color, draw)
        
        # Back flippers
        for i in range(2):
            draw_pixel(20+i, 13+flipper_offset, flipper_color, draw)
            draw_pixel(20+i, 20-flipper_offset, flipper_color, draw)
        
        frames.append(img)
    
    # Working frames (active swimming)
    for frame_idx in range(2):
        img = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        shell_color = COLORS['turtle_shell']
        flipper_color = COLORS['turtle_flippers']
        
        # Shell
        for y in range(10, 24):
            for x in range(6, 22):
                if ((x-14)**2/56 + (y-17)**2/36) < 1:
                    draw_pixel(x, y, shell_color, draw)
        
        # Shell pattern
        for y in range(12, 22):
            for x in range(10, 18):
                if ((x-14)**2/16 + (y-17)**2/9) < 1:
                    draw_pixel(x, y, COLORS['turtle_green'], draw)
        
        # Head (forward)
        for y in range(14, 18):
            draw_pixel(4 + (y-14)//2, y, COLORS['turtle_green'], draw)
        
        # Flippers (full stroke)
        stroke = -2 if frame_idx == 0 else 2
        for i in range(4):
            draw_pixel(6+i, 9+stroke+i//2, flipper_color, draw)
            draw_pixel(6+i, 23-stroke-i//2, flipper_color, draw)
        
        for i in range(3):
            draw_pixel(18+i, 11+stroke, flipper_color, draw)
            draw_pixel(18+i, 21-stroke, flipper_color, draw)
        
        frames.append(img)
    
    sheet = Image.new('RGBA', (128, 32), (0, 0, 0, 0))
    for i, frame in enumerate(frames):
        sheet.paste(frame, (i*32, 0))
    
    sheet.save(f"{SPRITE_DIR}/manager.png")
    print("Created manager.png")

def create_status_icons():
    """Create status bubble icons - 16x16 each"""
    
    # Online (green bubble)
    img = Image.new('RGBA', (16, 16), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Bubble outline
    for angle in range(0, 360, 15):
        rad = angle * 3.14159 / 180
        x = int(8 + 6 * (1 if angle < 180 else -1) * abs(rad)**0.3)
        y = int(8 + 6 * (1 if angle < 90 or angle > 270 else -1) * abs(rad)**0.3)
        if 0 <= x < 16 and 0 <= y < 16:
            draw_pixel(x, y, COLORS['bubble_outline'], draw)
    
    # Fill
    for y in range(4, 12):
        for x in range(4, 12):
            if ((x-8)**2 + (y-8)**2) < 25:
                draw_pixel(x, y, COLORS['bubble_green'], draw)
    
    # Shine
    draw_pixel(6, 6, COLORS['coral_white'], draw)
    
    img.save(f"{SPRITE_DIR}/status-online.png")
    print("Created status-online.png")
    
    # Offline (red bubble)
    img = Image.new('RGBA', (16, 16), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    for y in range(4, 12):
        for x in range(4, 12):
            if ((x-8)**2 + (y-8)**2) < 25:
                draw_pixel(x, y, COLORS['bubble_red'], draw)
    
    draw_pixel(6, 6, COLORS['coral_white'], draw)
    
    img.save(f"{SPRITE_DIR}/status-offline.png")
    print("Created status-offline.png")
    
    # Working (yellow bubble)
    img = Image.new('RGBA', (16, 16), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    for y in range(4, 12):
        for x in range(4, 12):
            if ((x-8)**2 + (y-8)**2) < 25:
                draw_pixel(x, y, COLORS['bubble_yellow'], draw)
    
    draw_pixel(6, 6, COLORS['coral_white'], draw)
    
    img.save(f"{SPRITE_DIR}/status-working.png")
    print("Created status-working.png")

def create_reef_background():
    """Create underwater reef background - 960x540"""
    img = Image.new('RGBA', (960, 540), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Deep ocean gradient (manual dithering for pixel effect)
    for y in range(540):
        ratio = y / 540
        # Deep blue #1a3a5c to lighter #2c6fa5
        r = int(26 + (44 - 26) * ratio)
        g = int(58 + (111 - 58) * ratio)
        g = int(g + (180-g) * (1-ratio) * 0.3)  # green shift
        b = int(92 + (165 - 92) * ratio)
        color = (r, g, b, 255)
        
        # Draw scanlines for pixel effect
        for x in range(0, 960, 2):
            draw.point((x, y), color)
            draw.point((x+1, y), (r, g+5, b, 255))
    
    # God rays (diagonal light beams)
    ray_color = (255, 255, 255, 15)
    for i in range(3):
        offset = 200 + i * 300
        for y in range(0, 200):
            for x in range(offset - y//3, offset + 50 - y//3):
                if 0 <= x < 960:
                    draw.point((x, y), ray_color)
    
    # Sandy bottom
    for y in range(480, 540):
        ratio = (y - 480) / 60
        r = int(202 - ratio * 20)
        g = int(230 - ratio * 30)
        b = int(248 - ratio * 20)
        for x in range(960):
            draw.point((x, y), (r, g, b, 255))
    
    # Coral rocks on bottom
    coral_colors = [(72, 202, 228), (0, 180, 216), (0, 150, 199)]
    coral_positions = [(100, 510, 80), (300, 500, 60), (700, 505, 90), (880, 510, 70)]
    
    for cx, cy, cr in coral_positions:
        color = coral_colors[cx % 3]
        for y in range(cy - cr//3, cy + cr//3):
            for x in range(cx - cr, cx + cr):
                if ((x-cx)**2/cr**2 + (y-cy)**2/(cr//3)**2) < 1:
                    draw.point((x, y), color)
    
    # Seaweed strands
    seaweed_positions = [(150, 400), (170, 420), (750, 380), (780, 400)]
    for sx, sy in seaweed_positions:
        for i in range(8):
            for j in range(20):
                sway = j // 4
                if sx + sway + i < sx + 15:
                    draw.point((sx + sway + i, sy + j), COLORS['seaweed_green'])
    
    img.save(f"{SPRITE_DIR}/reef-bg.png")
    print("Created reef-bg.png")

def create_coral_desk():
    """Create coral desk sprite - 64x48"""
    img = Image.new('RGBA', (64, 48), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Main desk body
    desk_color = COLORS['coral_peach']
    for y in range(20, 44):
        for x in range(4, 60):
            draw.point((x, y), desk_color)
    
    # Top surface
    top_color = COLORS['coral_pink']
    for y in range(14, 24):
        for x in range(2, 62):
            draw.point((x, y), top_color)
    
    # Coral texture (dots)
    for i in range(20):
        cx = 8 + (i * 3) % 50
        cy = 24 + (i * 7) % 16
        for dy in range(3):
            for dx in range(3):
                if dx + dy < 4:
                    draw.point((cx + dx, cy + dy), (255, 150, 120, 200))
    
    # Workstation glow
    glow_color = (0, 180, 216, 80)
    for y in range(8, 16):
        for x in range(20, 44):
            if ((x-32)**2/100 + (y-12)**2/16) < 1:
                draw.point((x, y), glow_color)
    
    img.save(f"{SPRITE_DIR}/coral-desk.png")
    print("Created coral-desk.png")

def create_seaweed():
    """Create seaweed decoration - 32x64"""
    img = Image.new('RGBA', (32, 64), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Multiple seaweed strands with sway
    for strand in range(3):
        base_x = 8 + strand * 8
        for i in range(20):
            sway = (i // 3) * (strand - 1)
            for thickness in range(3):
                draw.point((base_x + sway + thickness, 40 + i), COLORS['seaweed_green'])
    
    # Add some lighter highlights
    for strand in range(3):
        base_x = 9 + strand * 8
        for i in range(15, 20):
            sway = (i // 3) * (strand - 1)
            draw.point((base_x + sway, 40 + i), (64, 145, 90, 255))
    
    img.save(f"{SPRITE_DIR}/seaweed.png")
    print("Created seaweed.png")

if __name__ == "__main__":
    print("Generating Reef Office sprites...")
    
    create_clownfish_sprites()
    create_blue_tang_sprites()
    create_octopus_sprites()
    create_sea_turtle_sprites()
    create_status_icons()
    create_reef_background()
    create_coral_desk()
    create_seaweed()
    
    print(f"\nAll sprites created in {SPRITE_DIR}")
    
    # List created files
    import os
    print("\nCreated files:")
    for f in sorted(os.listdir(SPRITE_DIR)):
        size = os.path.getsize(f"{SPRITE_DIR}/{f}")
        print(f"  {f}: {size} bytes")
