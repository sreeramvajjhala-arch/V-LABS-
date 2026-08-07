import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_crimson_cybernetics_poster():
    # Canvas dimensions - 3K high-resolution poster (2400 x 3200)
    width, height = 2400, 3200
    img = Image.new("RGBA", (width, height), (26, 2, 2, 255)) # Deep Obsidian Crimson #1A0202
    draw = ImageDraw.Draw(img)

    # 1. Base Radial Atmospheric Gradient Background
    bg_gradient = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    bg_draw = ImageDraw.Draw(bg_gradient)
    
    center_x, center_y = width // 2, height // 2.5
    max_radius = int(math.hypot(width, height))
    
    # Draw radial crimson glow
    for r in range(1200, 0, -20):
        alpha = int(90 * (1 - r / 1200))
        bg_draw.ellipse(
            [center_x - r, center_y - r, center_x + r, center_y + r],
            fill=(120, 0, 15, alpha) # Deep Maroon Crimson #78000F
        )
    
    img = Image.alpha_composite(img, bg_gradient)
    draw = ImageDraw.Draw(img)

    # 2. Precision Architectural Grid Lines (Swiss Formalism + Brutalism)
    grid_color = (255, 255, 255, 18) # Ultra-subtle platinum vector lines
    grid_spacing = 100
    
    for x in range(100, width - 100, grid_spacing):
        draw.line([(x, 100), (x, height - 100)], fill=grid_color, width=2)
    for y in range(100, height - 100, grid_spacing):
        draw.line([(100, y), (width - 100, y)], fill=grid_color, width=2)

    # Outer Structural Margins & Frame Boundaries
    margin = 120
    draw.rectangle([margin, margin, width - margin, height - margin], outline=(255, 255, 255, 60), width=4)
    draw.rectangle([margin + 20, margin + 20, width - margin - 20, height - margin - 20], outline=(230, 57, 70, 80), width=2)

    # 3. Geometric Monoliths & Spatial Circles
    # Primary Focal Rings (Concentric Technical Orbits)
    cx, cy = width // 2, height // 2.4
    
    # Large Concentric Rings
    for ring_r, width_px, col in [
        (650, 3, (255, 255, 255, 40)),
        (520, 6, (230, 57, 70, 140)), # Vivid Crimson #E63946
        (480, 2, (255, 255, 255, 60)),
        (320, 8, (16, 185, 129, 200)), # Electric Emerald #10B981
        (180, 4, (255, 255, 255, 120)),
    ]:
        draw.ellipse([cx - ring_r, cy - ring_r, cx + ring_r, cy + ring_r], outline=col, width=width_px)

    # Dynamic Radial Crosshairs & Radial Ticks
    for angle in range(0, 360, 15):
        rad = math.radians(angle)
        r_inner = 530
        r_outer = 560 if angle % 45 == 0 else 545
        x1 = cx + r_inner * math.cos(rad)
        y1 = cy + r_inner * math.sin(rad)
        x2 = cx + r_outer * math.cos(rad)
        y2 = cy + r_outer * math.sin(rad)
        col = (255, 255, 255, 180) if angle % 45 == 0 else (255, 255, 255, 70)
        draw.line([(x1, y1), (x2, y2)], fill=col, width=4 if angle % 45 == 0 else 2)

    # Major Axis Crosshair Lines
    draw.line([(cx - 750, cy), (cx + 750, cy)], fill=(255, 255, 255, 50), width=2)
    draw.line([(cx, cy - 750), (cx, cy + 750)], fill=(255, 255, 255, 50), width=2)

    # 4. Asymmetrical Solid Geometric Accent Blocks
    # Block 1: Crimson Base Monolith
    draw.rectangle([180, height - 750, width // 2 - 40, height - 250], fill=(74, 0, 0, 220), outline=(255, 255, 255, 80), width=3)
    # Block 2: Emerald Focal Accent Block
    draw.rectangle([width // 2 + 40, height - 750, width - 180, height - 550], fill=(16, 185, 129, 30), outline=(16, 185, 129, 180), width=3)

    # 5. Master Typography & Systematic Reference Markers
    try:
        font_huge = ImageFont.truetype("arial.ttf", 160)
        font_large = ImageFont.truetype("arial.ttf", 90)
        font_med = ImageFont.truetype("arial.ttf", 45)
        font_mono = ImageFont.truetype("arial.ttf", 28)
    except:
        font_huge = font_large = font_med = font_mono = ImageFont.load_default()

    # Monolithic Header Typography
    draw.text((180, 180), "V LABS", fill=(255, 255, 255, 240), font=font_huge)
    draw.text((180, 360), "DIGITAL STUDIO // 24-HOUR PROTOTYPE ENGINE", fill=(230, 57, 70, 240), font=font_med)

    # Subtle Metadata & Systematic Technical Coordinate Markers
    draw.text((width - 650, 180), "LATITUDE: 17.6868° N\nLONGITUDE: 83.2185° E\nSECTOR: VIZAG // AP", fill=(255, 255, 255, 160), font=font_mono)
    draw.text((width - 650, 300), "SYS_VER: 2026.8.7\nFRAME: CRIMSON_CYBERNETICS\nCRAFT: MASTER_LEVEL", fill=(16, 185, 129, 200), font=font_mono)

    # Central Artwork Keynote Badges
    draw.text((cx - 200, cy - 20), "24H PROTOTYPE", fill=(255, 255, 255, 220), font=font_med)

    # Bottom Block Overlay Content
    draw.text((220, height - 710), "AUTOMATION MATRIX", fill=(255, 255, 255, 240), font=font_med)
    draw.text((220, height - 640), "• GEMINI 1.5 FLASH REST PROXY\n• SECURE GOOGLE APPS SCRIPT CRM\n• REALTIME WHATSAPP AI RECEPTIONIST\n• SUB-100MS FAQ FAST-PATH CACHE", fill=(235, 235, 235, 200), font=font_mono)

    draw.text((width // 2 + 80, height - 710), "PERFORMANCE CORE", fill=(255, 255, 255, 240), font=font_med)
    draw.text((width // 2 + 80, height - 640), "• ZERO CLIENT KEY EXPOSURE\n• GPU-ACCELERATED TRANSFORMS\n• REACTIVE VLABS_STATE ENGINE\n• LOCALSTORAGE PERSISTENCE", fill=(255, 255, 255, 200), font=font_mono)

    # Bottom Footer Signoff
    draw.text((180, height - 180), "DESIGNED & FORGED BY V LABS • VIZAG'S 24-HOUR DIGITAL STUDIO", fill=(255, 255, 255, 180), font=font_mono)
    draw.text((width - 600, height - 180), "HTTPS://WA.ME/996655273", fill=(16, 185, 129, 230), font=font_mono)

    # Micro Technical Target Dots across structural grid corners
    corners = [(180, 180), (width - 180, 180), (180, height - 180), (width - 180, height - 180), (cx, cy)]
    for pt_x, pt_y in corners:
        draw.ellipse([pt_x - 12, pt_y - 12, pt_x + 12, pt_y + 12], outline=(230, 57, 70, 255), width=3)
        draw.ellipse([pt_x - 4, pt_y - 4, pt_x + 4, pt_y + 4], fill=(255, 255, 255, 255))

    # Output file
    output_path = "assets/vlabs_poster_crimson_cybernetics.png"
    img.save(output_path, "PNG")
    print(f"Successfully generated canvas masterpiece artwork: {output_path}")

if __name__ == "__main__":
    create_crimson_cybernetics_poster()
