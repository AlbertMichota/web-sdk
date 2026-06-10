# Spine Sequence Generator

Generate a pretty-printed Spine 3.8 JSON + .atlas from a PNG frame sequence, packing all frames into as few atlas PNGs as possible.

## Usage

From the repo root:

```powershell
npm run pngseq:spine -- --src "apps/Crypto_Reapers/src/Assets/anticipation" --out "apps/Crypto_Reapers/src/Assets/anticipation" --subdir spine --fps 24
```

Options:
- `--src`: Input folder with PNG frames.
- `--out`: Output root folder (tool writes into `<out>/<subdir>`).
- `--subdir`: Output subfolder name (default `spine`).
- `--name`: Skeleton name (informational; not required by runtime).
- `--anim`: Animation name (default `play`).
- `--slot`: Slot name (default `seq`).
- `--fps`: Frames per second (default `24`).
- `--pack`: `1` to pack images (default), `0` to skip packing.
- `--maxSize`: Max atlas page edge (default `2048`). If any frame is larger, the tool auto-increases to the nearest power-of-two (up to `8192`).
- `--padding`: Pixels between regions (default `2`).

Outputs in `<out>/<subdir>`:
- `skeleton.json` (pretty-printed)
- `skeleton.atlas` (pretty-printed)
- `skeleton.png` or `skeleton-*.png` (packed atlas pages)
