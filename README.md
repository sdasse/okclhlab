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

## Core Concepts

### Perceptual Uniformity
OKLCH ensures equal numerical steps produce equal visual differences:
- L=0.3 to L=0.4 looks the same "jump" as L=0.7 to L=0.8
- Unlike RGB where (255,0,0) to (255,128,0) is huge but (128,0,0) to (128,64,0) is subtle

### Curve-Based Generation
Instead of manual color picking, this tool generates palettes using mathematical curves:
- **Lightness Curve**: How brightness changes across steps (linear, eased, or S-curve)
- **Chroma Curve**: How saturation peaks in middle steps to match gamut boundaries
- **Hue Curve**: Optional color shifting for optical corrections (e.g., yellow ramping)

### Gamut Awareness
Not all OKLCH colors fit in sRGB. The app can:
- **Detect**: Find maximum displayable chroma for any lightness/hue
- **Clamp**: Automatically reduce chroma to stay in gamut (per-row setting)
- **Override**: Allow out-of-gamut colors for wide-gamut displays (P3)

### Yellow Exception Principle
Yellow requires special handling due to optical perception:
- **Higher starting lightness** (L≈0.96 vs L≈0.95) - prevents muddy appearance
- **Hue ramping** (95.8° → 71.5°) - dark yellows shift toward orange to maintain identity
- **Gamut exception** - Can exceed sRGB for vibrant yellows on modern displays

Some presets use this (01, 02, 04, 07), others prioritize mathematical purity (03, 05, 06).

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

Each preset demonstrates a different design philosophy. Choose based on your use case:

| Preset | Dark Endpoint | Yellow Hue Ramping | Best For | Trade-off |
|--------|--------------|-------------------|----------|-----------|
| **01 - User Tuned** | Very Dark (L=0.078) | ✅ Yes (95.8° → 71.5°) | Dark mode UIs, high contrast | Slight hue drift in darkest colors |
| **02 - Balanced Hybrid** | Medium (L=0.11) | ✅ Yes | Versatile UI systems | Less dramatic than 01 |
| **03 - Scientifically Balanced** | Stable (L=0.15) | ❌ No | Design systems, predictability | Muddy dark yellows |
| **04 - Low Saturation** | Medium (L=0.15) | ✅ Yes | Code editors, syntax highlighting | Lower visual impact |
| **05 - Perceptual Uniformity** | Stable (L=0.15) | ✅ Reverse! (90° → 103°) | Data visualization, charts | Gamut boundary mismatch |
| **06 - Chroma-Matched** | Stable (L=0.15) | ❌ No | Brand systems, equal saturation | Ignores natural gamut limits |
| **07 - Vibrant Warm** | Very Dark (L=0.078) | ✅ Yes (84° → 98°) | Marketing, creative work | sRGB clipping on some displays |

### Detailed Preset Descriptions

**Preset 01 (User Tuned)** - Optically balanced with custom yellow hue ramping. Features very dark endpoints and balanced warm/cool saturation.

**Preset 02 (Balanced Hybrid)** - Compromise between 01's drama and 03's stability. Medium-dark endpoints with maintained hue ramping.

**Preset 03 (Scientifically Balanced)** - Mathematically normalized with consistent peak positions (0.35-0.40). Raised minimum lightness (0.15) prevents hue drift but skips yellow hue ramping for mathematical purity.

**Preset 04 (Low Saturation)** - All chroma reduced ~30% for reduced eye fatigue. Ideal for syntax highlighting and code editors.

**Preset 05 (Perceptual Uniformity)** - All peaks at 0.50 for equal perceptual steps. Uses reverse yellow hue ramping (90° → 103°).

**Preset 06 (Chroma-Matched)** - All hues use C=0.208 for perfect saturation harmony. No hue ramping to maintain uniformity.

**Preset 07 (Vibrant Warm)** - Warm colors (yellow/orange) use gamutAware=false for P3 gamut vibrancy. Boosted chroma (C=0.220) for maximum impact.

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

## Troubleshooting

### "My yellow looks brown/muddy in dark mode"
**Solution**: Enable yellow hue ramping or choose a preset that includes it (01, 02, 04, 07). Alternatively, increase the minimum lightness endpoint to L=0.18 or higher.

### "Colors look washed out on my monitor"
**Solution**: Toggle "Gamut Aware" off for the selected row. This allows colors to use P3 gamut for more vibrancy on modern displays. Note: May clip on older sRGB-only monitors.

### "Darkest step looks like a different hue"
**Solution**: This is hue drift from hitting gamut boundaries. Increase the lightness curve end value to 0.15+ or enable "Gamut Aware" for that row.

### "I want all colors equally saturated"
**Solution**: Use Preset 06 (Chroma-Matched) which normalizes all peak chroma values to C=0.208.

### "How do I create colors for syntax highlighting?"
**Solution**: Use Preset 04 (Low Saturation) which reduces chroma by ~30% for comfortable extended viewing. Alternatively, manually reduce chroma peak values to 0.12-0.18 range.

### "Yellow/orange won't get vibrant enough"
**Solution**:
1. Select the yellow or orange row
2. Toggle "Gamut Aware" OFF
3. Increase chroma peak to 0.22-0.25
4. This allows P3 gamut colors (requires modern display)

## Contributing

Contributions are welcome! This project is designed to be educational and demonstrate OKLCH color science principles. When contributing:

- Maintain comprehensive inline documentation
- Explain the "why" behind optical corrections (like yellow hue ramping)
- Add preset variations with clear use-case documentation
- Preserve the yellow exception principle explanations

## License

MIT License - see LICENSE file for details

## Credits

- **OKLab Color Space**: Björn Ottosson ([https://bottosson.github.io/posts/oklab/](https://bottosson.github.io/posts/oklab/))
- **Tweakpane**: cocopon ([https://tweakpane.github.io/](https://tweakpane.github.io/))
- **Culori**: Dan Burzo ([https://culorijs.org/](https://culorijs.org/))
