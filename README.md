# OKLCH Lab

An interactive tool for creating and fine-tuning perceptually uniform color palettes using the OKLCH color space.

## Features

- **Interactive Color Grid** - Visual display of all color ramps with real-time preview
- **Perceptual Color Editing** - Adjust Lightness, Chroma, and Hue with precision controls
- **Flexible Step Count** - Generate color ramps from 6 to 20 steps
- **Advanced Curve Controls** - Fine-tune lightness and chroma progression with customizable peak positions
- **Hue Ramping** - Create optically balanced color ramps with dynamic hue shifting
- **Gamut-Aware Color Generation** - Culori integration ensures all colors stay within sRGB gamut
- **Export Options** - Download as SVG or copy as CSS custom properties
- **Preset System** - Save and load color system configurations

## What is OKLCH?

OKLCH is a perceptually uniform color space that makes it easier to create harmonious color palettes:

- **L (Lightness)**: 0-1 - Perceived brightness (0 = black, 1 = white)
- **C (Chroma)**: 0-0.4 - Colorfulness/saturation
- **H (Hue)**: 0-360° - Color angle (0° = red, 120° = green, 240° = blue)

Unlike RGB or HSL, equal steps in OKLCH values produce equal perceptual differences in color.

## Usage

1. Open `index.html` in a modern browser
2. Select a preset or customize individual color ramps
3. Click any row to edit its lightness curve, chroma curve, and hue
4. Adjust the step count to generate more or fewer color variations
5. Export your palette as SVG or CSS when satisfied

## Color System Structure

The default system includes 9 hues:
- **Cyan** - Cool blue-green tones
- **Green** - Natural greens
- **Yellow** - Warm yellows with optional hue ramping for optical balance
- **Orange** - Warm orange tones
- **Red** - Vibrant reds
- **Pink** - Magentas and pinks
- **Purple** - Deep purples
- **Violet** - Blue-violet tones
- **Blue** - True blues

Each hue can generate 6-20 color steps with customizable:
- **Lightness curves** - Linear, ease-in, ease-out, or S-curve progressions
- **Chroma curves** - Control saturation peak position and falloff
- **Hue ramping** - Shift hue across lightness for optical correction

## Presets

### Preset 01 (User Tuned)
Optically balanced color system with custom yellow hue ramping (95.8° → 71.5°). Features very dark endpoints and balanced warm/cool saturation.

### Preset 06 (Scientifically Balanced)
Mathematically normalized version with consistent peak positions (0.35-0.40) and raised minimum lightness (0.15) to prevent hue drift in darkest colors.

## Technical Details

**Culori Integration:**
- Accurate gamut checking with `culori.inGamut('rgb')()`
- Chroma clamping with `culori.clampChroma()` prevents hue shifting
- Binary search algorithm finds maximum displayable chroma for any L/H pair

**Browser Compatibility:**
- Chrome 111+
- Safari 15.4+
- Firefox 113+
- Edge 111+

## Development

Built with:
- Vanilla JavaScript (ES6+)
- [Tweakpane](https://tweakpane.github.io/docs/) - Parameter controls
- [Culori](https://culorijs.org/) - Color space conversions and gamut operations

## License

MIT License - see LICENSE file for details
