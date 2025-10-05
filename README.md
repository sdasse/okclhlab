# Firefox OKLCH Color Ramp Tool

A live color adjustment tool for fine-tuning Firefox's OKLCH-based color system.

## Features

- **Interactive Color Grid** - Visual display of all color ramps
- **Live OKLCH Editing** - Adjust Lightness, Chroma, and Hue with real-time preview
- **12-Step Color Ramps** - Complete color system with 8 hues (red, orange, yellow, green, cyan, blue, purple, gray)
- **CSS Export** - Generate production-ready CSS custom properties
- **HEX Conversion** - See hex equivalents for each OKLCH color

## Usage

1. **Open `index.html`** in a modern browser (Chrome, Firefox, Safari, Edge)
2. **Click any color** in the grid to edit it
3. **Adjust sliders** to fine-tune Lightness, Chroma, and Hue values
4. **Export CSS** when satisfied with your color system

## Color System Structure

Each hue has 12 steps:
- Steps 1-3: Light tints
- Steps 4-6: Mid-range colors
- Steps 7-9: Saturated colors
- Steps 10-12: Dark shades

## OKLCH Values

- **L (Lightness)**: 0-100% - How light or dark the color is
- **C (Chroma)**: 0-0.4 - How saturated/vivid the color is
- **H (Hue)**: 0-360° - The color angle on the color wheel

## Browser Compatibility

Requires a browser with OKLCH color support:
- Chrome 111+
- Safari 15.4+
- Firefox 113+
- Edge 111+

## Presets

### Preset 01 (SVG Match)
- Original color system matching the first approved SVG export
- 12 steps per hue
- Chroma curves with varying peak positions (0.18-0.82)

### Preset 02 (Max Saturation)
- Algorithmically calculated maximum saturation for each hue
- Finds gamut boundaries using binary search
- 5% safety margin to prevent edge cases

### Preset 03 (Firefox Brand)
- Based on 15-step SVG with balanced saturated colors
- Matches Firefox brand colors: `#7543E3` (violet), `#FF453F` (red)
- Chroma peaks mostly at 0.50 (middle of lightness range)
- Lightness range: 0.07-0.98 (very dark to very light)
- Key characteristics:
  - Blue has highest chroma (0.258)
  - Cyan/teal has lowest chroma (0.106)
  - Most hues peak chroma in middle lightness range

### Preset 04 (Firefox Balanced)
- Enhanced warm colors from Preset 03
- Boosted yellow (0.190), gold (0.165), orange (0.220) chroma
- Adjusted red hue to 27.1° for Firefox brand match
- Cool colors (blue/purple/violet) unchanged

### Preset 05 (Tuned Hues)
- **Cyan hue adjusted to 207.4°** (more blue-cyan)
- **Gold hue adjusted to 82.6°** (warmer gold tone)
- **Culori-calculated max chroma** for all warm colors:
  - Cyan: 0.123 (peak at L=0.80)
  - Green: 0.231 (peak at L=0.80) - elevated
  - Yellow: 0.148 (peak at L=0.80) - elevated
  - Gold: 0.148 (peak at L=0.80) - elevated
  - Orange: 0.125 (peak at L=0.50) - elevated
- All chroma values are 90% of gamut maximum for safety
- Chroma peaks earlier (0.30) for cyan/green/yellow/gold

### Preset 06 (Scientifically Balanced)
Based on analysis of Preset 01 with scientific corrections:

**Warm Color Chroma Boost:**
- Yellow: 0.167 → **0.200** (+20%)
- Gold: 0.152 → **0.180** (+18%)
- Orange: 0.165 → **0.200** (+21%)

**Normalized Peak Positions:**
- All colors peak at 0.35-0.40 (consistent curve shape)
- Cyan/Green: moved from 0.27 → 0.35
- Yellow/Gold: moved from 0.18 → 0.35
- Orange/Red: kept at 0.38
- Cool colors: kept at 0.40

**Hue Stability Fix:**
- Minimum lightness raised to 0.15 (from 0.078-0.084)
- Eliminates hue drift in darkest colors
- Trade-off: Slightly less dark range, but stable hue

**Result:**
- Balanced saturation across all hues
- Consistent chroma curve behavior
- No hue drift issues
- Maintains user's optical tuning preferences

### Preset 07 (User Preferred) ⭐ Best of Both Worlds
Keeps user's preferred colors from Preset 01, balances warm colors:

**Preserved from Preset 01 (unchanged):**
- Cyan: C=0.121
- Green: C=0.228
- Red: C=0.201
- Pink: C=0.219
- Purple: C=0.221
- Violet: C=0.226
- Blue: C=0.258

**Warm Colors Boosted to Match Red (C=0.201):**
- Yellow: 0.167 → **0.201** (+20%)
- Gold: 0.152 → **0.201** (+32%)
- Orange: 0.165 → **0.201** (+22%)

**Result:**
- Retains the exact look/feel of preferred colors
- Warm colors now match red's saturation
- More pleasing overall balance
- Keeps original peak positions and lightness ranges

## Culori Integration

Gamut checking now uses [Culori](https://culorijs.org/) when available for more accurate RGB gamut validation:
- `culori.inGamut('rgb')()` - checks if color is in sRGB gamut
- Falls back to manual OKLCH→sRGB conversion if Culori not loaded
- Imported from: `https://cdn.skypack.dev/culori@3`

## Next Steps

- Contrast ratio testing
- Color harmony suggestions
- Target color matching (e.g., "make yellow-10 match #FEF097")
- Support for 15-step ramps (currently limited to 12)
