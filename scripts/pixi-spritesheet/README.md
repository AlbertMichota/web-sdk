# PixiJS Spritesheet Builder

Generate a PixiJS-compatible spritesheet (PNG + JSON) from a folder of PNG/JPG frames.

## Usage

```bash
# Generic CLI
node scripts/pixi-spritesheet/index.mjs --src <frames_dir> --out <output_dir> --name <texture_name> --maxSize 2048 --padding 2

# Using project defaults (anticipation path)
npm run spritesheet:anticipation
```

- `--src`: Source directory containing image frames (default: apps/Crypto_Reapers/src/Assets/anticipation)
- `--out`: Output directory for PNG/JSON (default: same as src)
- `--name`: Texture name (base filename for outputs)
- `--maxSize`: Max atlas size (default 2048)
- `--padding`: Pixels between sprites (default 2)

Outputs:
- `<name>.png`: Spritesheet image
- `<name>.json`: PixiJS TextureAtlas JSON (compatible with `PIXI.Assets.load` / `PIXI.Sprite.from`)
