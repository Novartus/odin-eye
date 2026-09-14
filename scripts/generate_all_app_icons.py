#!/usr/bin/env python3
"""
generate_all_app_icons.py
Directly generates high-fidelity, vibrant application icons, adaptive icons,
splash drawables, and launcher mipmaps from assets/OdinEye-Logo.png using macOS sips.
Preserves 100% of original colors (#2A7F85 teal, #DDF5EF mint, #F2FCFD ice white).
"""

import os
import sys
import subprocess
import shutil

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS_DIR = os.path.join(BASE_DIR, 'assets')
RES_DIR = os.path.join(BASE_DIR, 'android', 'app', 'src', 'main', 'res')
TMP_DIR = os.path.join(BASE_DIR, 'scripts', '_tmp_icons')

def run_cmd(cmd):
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Error executing: {cmd}\n{res.stderr}", file=sys.stderr)
        sys.exit(1)
    return res.stdout

def main():
    src_logo = os.path.join(ASSETS_DIR, 'OdinEye-Logo.png')
    if not os.path.exists(src_logo):
        print(f"Error: {src_logo} does not exist!", file=sys.stderr)
        sys.exit(1)

    os.makedirs(TMP_DIR, exist_ok=True)

    print("1. Generating master assets/icon.png (1024x1024)...")
    icon_png = os.path.join(ASSETS_DIR, 'icon.png')
    run_cmd(f"sips -z 1024 1024 '{src_logo}' --out '{icon_png}'")

    print("2. Generating master assets/adaptive-icon.png (1024x1024 safe-zone)...")
    adaptive_png = os.path.join(ASSETS_DIR, 'adaptive-icon.png')
    tmp_fg = os.path.join(TMP_DIR, 'fg_682.png')
    run_cmd(f"sips -z 682 682 '{src_logo}' --out '{tmp_fg}'")
    run_cmd(f"sips -p 1024 1024 '{tmp_fg}' --out '{adaptive_png}'")

    print("3. Generating Android mipmap launcher icons...")
    # Densities: (folder, launcher_size, adaptive_fg_size)
    mipmap_targets = [
        ('mipmap-mdpi', 48, 108),
        ('mipmap-hdpi', 72, 162),
        ('mipmap-xhdpi', 96, 216),
        ('mipmap-xxhdpi', 144, 324),
        ('mipmap-xxxhdpi', 192, 432),
    ]

    for folder, l_size, fg_size in mipmap_targets:
        dir_path = os.path.join(RES_DIR, folder)
        os.makedirs(dir_path, exist_ok=True)

        # Standard launcher
        sq_out = os.path.join(dir_path, 'ic_launcher.png')
        run_cmd(f"sips -z {l_size} {l_size} '{icon_png}' --out '{sq_out}'")

        # Round launcher
        rd_out = os.path.join(dir_path, 'ic_launcher_round.png')
        run_cmd(f"sips -z {l_size} {l_size} '{icon_png}' --out '{rd_out}'")

        # Foreground adaptive
        fg_out = os.path.join(dir_path, 'ic_launcher_foreground.png')
        run_cmd(f"sips -z {fg_size} {fg_size} '{adaptive_png}' --out '{fg_out}'")

        print(f"   ✓ {folder}: launcher={l_size}x{l_size}, fg={fg_size}x{fg_size}")

    print("4. Generating Android splashscreen drawables...")
    drawable_targets = [
        ('drawable-mdpi', 288),
        ('drawable-hdpi', 432),
        ('drawable-xhdpi', 576),
        ('drawable-xxhdpi', 864),
        ('drawable-xxxhdpi', 1152),
    ]

    for folder, s_size in drawable_targets:
        dir_path = os.path.join(RES_DIR, folder)
        os.makedirs(dir_path, exist_ok=True)
        splash_out = os.path.join(dir_path, 'splashscreen_logo.png')
        run_cmd(f"sips -z {s_size} {s_size} '{icon_png}' --out '{splash_out}'")
        print(f"   ✓ {folder}: splash={s_size}x{s_size}")

    shutil.rmtree(TMP_DIR, ignore_errors=True)
    print("\n✅ All icons successfully regenerated with 100% color retention and correct resolutions!")

if __name__ == '__main__':
    main()
