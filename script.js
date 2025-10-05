// Color system data - 9 hues, 12 steps each (Gold removed, Yellow enhanced)
// Based on SVG export - exact OKLCH values reverse-engineered from hex colors
// Chroma curves peak in the middle to match gamut boundaries
const colorSystem = {
  cyan: {
    h: 195.6, l: 0.70, c: 0.106, hex: '#40BDC0',
    lightnessCurve: { start: 0.96, end: 0.21, type: 'linear' },
    chromaCurve: { start: 0.060, peak: 0.114, end: 0.036, peakPosition: 0.36 },
    steps: []
  },
  green: {
    h: 144.2, l: 0.75, c: 0.153, hex: '#74CE59',
    lightnessCurve: { start: 0.96, end: 0.20, type: 'linear' },
    chromaCurve: { start: 0.070, peak: 0.153, end: 0.064, peakPosition: 0.64 },
    steps: []
  },
  yellow: {
    h: 92.0, l: 0.80, c: 0.165, hex: '#E8C000',
    // Curves extracted from user's manually tuned yellow hex colors
    // L: 0.966 → 0.152, C: 0.093 → peak 0.201 → 0.068, H: 95.8° → 71.5°
    lightnessCurve: { start: 0.966, end: 0.152, type: 'linear' },
    chromaCurve: { start: 0.093, peak: 0.201, end: 0.068, peakPosition: 0.36 },
    hueCurve: { start: 95.8, end: 71.5, type: 'linear' },
    useHueRamping: true,
    steps: []
  },
  orange: {
    h: 46.5, l: 0.62, c: 0.176, hex: '#FF6D00',
    lightnessCurve: { start: 0.96, end: 0.22, type: 'linear' },
    chromaCurve: { start: 0.025, peak: 0.176, end: 0.070, peakPosition: 0.55 },
    steps: []
  },
  red: {
    h: 24.9, l: 0.57, c: 0.218, hex: '#FF3F3F',
    lightnessCurve: { start: 0.95, end: 0.16, type: 'linear' },
    chromaCurve: { start: 0.024, peak: 0.218, end: 0.064, peakPosition: 0.36 },
    steps: []
  },
  pink: {
    h: 343.2, l: 0.52, c: 0.132, hex: '#D8389D',
    lightnessCurve: { start: 0.96, end: 0.15, type: 'linear' },
    chromaCurve: { start: 0.024, peak: 0.132, end: 0.064, peakPosition: 0.73 },
    steps: []
  },
  purple: {
    h: 312.1, l: 0.45, c: 0.139, hex: '#9630C4',
    lightnessCurve: { start: 0.95, end: 0.15, type: 'linear' },
    chromaCurve: { start: 0.032, peak: 0.139, end: 0.075, peakPosition: 0.82 },
    steps: []
  },
  violet: {
    h: 283.5, l: 0.50, c: 0.158, hex: '#7543E3',
    lightnessCurve: { start: 0.95, end: 0.15, type: 'linear' },
    chromaCurve: { start: 0.024, peak: 0.158, end: 0.087, peakPosition: 0.82 },
    steps: []
  },
  blue: {
    h: 263.8, l: 0.55, c: 0.171, hex: '#4E45FC',
    lightnessCurve: { start: 0.95, end: 0.15, type: 'linear' },
    chromaCurve: { start: 0.023, peak: 0.171, end: 0.087, peakPosition: 0.82 },
    steps: []
  }
};

// Curve calculation functions
function calculateLightnessCurve(start, end, steps, curveType) {
  const values = [];
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1); // 0 to 1
    let curveT = t;

    switch (curveType) {
      case 'easeIn':
        curveT = t * t;
        break;
      case 'easeOut':
        curveT = 1 - Math.pow(1 - t, 2);
        break;
      case 'sCurve':
        curveT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        break;
      case 'linear':
      default:
        curveT = t;
    }

    values.push(start + (end - start) * curveT);
  }
  return values;
}

function calculateChromaCurve(start, peak, end, peakPosition, steps) {
  const values = [];
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1); // 0 to 1

    if (t <= peakPosition) {
      // Interpolate from start to peak
      const localT = t / peakPosition;
      values.push(start + (peak - start) * localT);
    } else {
      // Interpolate from peak to end
      const localT = (t - peakPosition) / (1 - peakPosition);
      values.push(peak + (end - peak) * localT);
    }
  }
  return values;
}

function calculateHueCurve(start, end, steps, curveType) {
  const values = [];
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1); // 0 to 1
    let curveT = t;

    switch (curveType) {
      case 'easeIn':
        curveT = t * t;
        break;
      case 'easeOut':
        curveT = 1 - Math.pow(1 - t, 2);
        break;
      case 'sCurve':
        curveT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        break;
      case 'linear':
      default:
        curveT = t;
    }

    values.push(start + (end - start) * curveT);
  }
  return values;
}

// Generate default 12-step ramps based on curve settings
function generateDefaultSteps() {
  Object.keys(colorSystem).forEach(hueName => {
    const hueData = colorSystem[hueName];
    hueData.steps = [];

    const stepCount = params.steps;

    // Calculate lightness and chroma curves
    const lightnessValues = calculateLightnessCurve(
      hueData.lightnessCurve.start,
      hueData.lightnessCurve.end,
      stepCount,
      hueData.lightnessCurve.type
    );

    const chromaValues = calculateChromaCurve(
      hueData.chromaCurve.start,
      hueData.chromaCurve.peak,
      hueData.chromaCurve.end,
      hueData.chromaCurve.peakPosition,
      stepCount
    );

    // Calculate hue values (for colors with hue ramping)
    let hueValues;
    if (hueData.useHueRamping && hueData.hueCurve) {
      hueValues = calculateHueCurve(
        hueData.hueCurve.start,
        hueData.hueCurve.end,
        stepCount,
        hueData.hueCurve.type
      );
    }

    // Create steps using curve values
    // If gamut-aware, clamp chroma during generation (not just rendering)
    for (let i = 0; i < stepCount; i++) {
      const l = Math.max(0.05, Math.min(0.98, lightnessValues[i]));
      let c = Math.max(0, Math.min(0.4, chromaValues[i]));
      const h = hueValues ? hueValues[i] : hueData.h;

      // Apply gamut clamping during generation if enabled
      if (params.gamutAware) {
        const maxC = findMaxChroma(l, h);
        c = Math.min(c, maxC);
      }

      hueData.steps.push({
        l: l,
        c: c,
        h: h
      });
    }
  });
}

// Presets storage - Preset 01 is user's optically-tuned system
const presets = {
  '01': {
    name: 'Preset 01 (User Tuned)',
    colors: {
      // User's preferred balanced colors with custom yellow hue ramping
      cyan: { h: 207.3, l: 0.50, c: 0.121, lightnessCurve: { start: 0.98, end: 0.078, type: 'linear' }, chromaCurve: { start: 0.017, peak: 0.121, end: 0.014, peakPosition: 0.27 } },
      green: { h: 140.0, l: 0.50, c: 0.228, lightnessCurve: { start: 0.98, end: 0.073, type: 'linear' }, chromaCurve: { start: 0.031, peak: 0.228, end: 0.025, peakPosition: 0.27 } },
      yellow: {
        h: 92.0, l: 0.62, c: 0.201,
        lightnessCurve: { start: 0.966, end: 0.152, type: 'linear' },
        chromaCurve: { start: 0.093, peak: 0.201, end: 0.068, peakPosition: 0.36 },
        hueCurve: { start: 95.8, end: 71.5, type: 'linear' },
        useHueRamping: true
      },
      orange: { h: 46.6, l: 0.59, c: 0.201, lightnessCurve: { start: 0.958, end: 0.221, type: 'linear' }, chromaCurve: { start: 0.022, peak: 0.201, end: 0.062, peakPosition: 0.36 } },
      red: { h: 27.0, l: 0.56, c: 0.201, lightnessCurve: { start: 0.95, end: 0.159, type: 'linear' }, chromaCurve: { start: 0.023, peak: 0.201, end: 0.064, peakPosition: 0.36 } },
      pink: { h: 337.1, l: 0.52, c: 0.219, lightnessCurve: { start: 0.97, end: 0.084, type: 'linear' }, chromaCurve: { start: 0.021, peak: 0.219, end: 0.019, peakPosition: 0.45 } },
      purple: { h: 312.8, l: 0.53, c: 0.221, lightnessCurve: { start: 0.98, end: 0.082, type: 'linear' }, chromaCurve: { start: 0.013, peak: 0.221, end: 0.020, peakPosition: 0.45 } },
      violet: { h: 291.0, l: 0.53, c: 0.226, lightnessCurve: { start: 0.979, end: 0.078, type: 'linear' }, chromaCurve: { start: 0.011, peak: 0.226, end: 0.018, peakPosition: 0.45 } },
      blue: { h: 275.2, l: 0.53, c: 0.258, lightnessCurve: { start: 0.971, end: 0.084, type: 'linear' }, chromaCurve: { start: 0.014, peak: 0.258, end: 0.012, peakPosition: 0.45 } }
    }
  },
  '06': {
    name: 'Preset 06 (Scientifically Balanced)',
    colors: {
      cyan: { h: 207.3, l: 0.50, c: 0.121, lightnessCurve: { start: 0.98, end: 0.15, type: 'linear' }, chromaCurve: { start: 0.017, peak: 0.121, end: 0.025, peakPosition: 0.35 } },
      green: { h: 140.0, l: 0.50, c: 0.228, lightnessCurve: { start: 0.98, end: 0.15, type: 'linear' }, chromaCurve: { start: 0.031, peak: 0.228, end: 0.040, peakPosition: 0.35 } },
      yellow: { h: 95.4, l: 0.62, c: 0.200, lightnessCurve: { start: 0.98, end: 0.25, type: 'linear' }, chromaCurve: { start: 0.032, peak: 0.200, end: 0.065, peakPosition: 0.35 } },
      orange: { h: 46.6, l: 0.59, c: 0.200, lightnessCurve: { start: 0.958, end: 0.22, type: 'linear' }, chromaCurve: { start: 0.022, peak: 0.200, end: 0.070, peakPosition: 0.38 } },
      red: { h: 27.0, l: 0.56, c: 0.201, lightnessCurve: { start: 0.95, end: 0.16, type: 'linear' }, chromaCurve: { start: 0.023, peak: 0.201, end: 0.070, peakPosition: 0.38 } },
      pink: { h: 337.1, l: 0.52, c: 0.219, lightnessCurve: { start: 0.97, end: 0.15, type: 'linear' }, chromaCurve: { start: 0.021, peak: 0.219, end: 0.030, peakPosition: 0.40 } },
      purple: { h: 312.8, l: 0.53, c: 0.221, lightnessCurve: { start: 0.98, end: 0.15, type: 'linear' }, chromaCurve: { start: 0.013, peak: 0.221, end: 0.030, peakPosition: 0.40 } },
      violet: { h: 291.0, l: 0.53, c: 0.226, lightnessCurve: { start: 0.979, end: 0.15, type: 'linear' }, chromaCurve: { start: 0.011, peak: 0.226, end: 0.028, peakPosition: 0.40 } },
      blue: { h: 275.2, l: 0.53, c: 0.258, lightnessCurve: { start: 0.971, end: 0.15, type: 'linear' }, chromaCurve: { start: 0.014, peak: 0.258, end: 0.025, peakPosition: 0.40 } }
    }
  }
};

// State
let selectedHue = 'cyan';
let pane = null;
let isUpdatingSliders = false; // Flag to prevent recursive updates
let lightnessCurveFolder = null;
let chromaCurveFolder = null;
let gamutCache = {}; // Cache max chroma values for performance
let params = {
  preset: '01',
  steps: 12,
  color: selectedHue,
  L: 70,
  C: 0.12,
  H: 195,
  // Curve parameters for selected hue
  lStart: 95,
  lEnd: 10,
  lCurve: 'linear',
  cStart: 6,
  cPeak: 11,
  cEnd: 4,
  cPeakPos: 36,
  gamutAware: true
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing OKLCH Lab');
  console.log('Culori available:', !!window.culori);

  // Load Preset 01 by default
  loadPreset('01');

  renderGrid();
  setupTweakpane();
  selectHue('cyan');
});

// Render color grid
function renderGrid() {
  const grid = document.getElementById('color-grid');
  grid.innerHTML = '';

  const hueNames = Object.keys(colorSystem);
  const stepCount = params.steps;

  // Set grid layout based on current step count
  grid.style.gridTemplateColumns = `auto repeat(${stepCount}, 1fr)`;
  grid.style.gridTemplateRows = `repeat(${hueNames.length}, 1fr)`;

  hueNames.forEach(hueName => {
    // Add row label with radio button
    const label = document.createElement('label');
    label.className = 'row-label';
    label.innerHTML = `
      <input type="radio" name="hue" value="${hueName}" ${hueName === selectedHue ? 'checked' : ''}>
      ${hueName.charAt(0).toUpperCase() + hueName.slice(1)}
    `;
    label.addEventListener('click', () => selectHue(hueName));
    grid.appendChild(label);

    // Add color cells
    const hue = colorSystem[hueName];
    hue.steps.forEach((color, index) => {
      const cell = document.createElement('div');
      cell.className = 'color-cell';
      cell.style.backgroundColor = oklchToCSS(color);
      cell.dataset.hue = hueName;
      cell.dataset.step = index;
      grid.appendChild(cell);
    });
  });
}

// Select a hue row
function selectHue(hueName) {
  isUpdatingSliders = true; // Disable change handlers

  selectedHue = hueName;
  params.color = hueName;

  // Update radio buttons
  document.querySelectorAll('input[name="hue"]').forEach(radio => {
    radio.checked = radio.value === hueName;
  });

  // Update Tweakpane with this hue's current values WITHOUT triggering changes
  const hue = colorSystem[hueName];

  // Use middle step as reference
  const midStepIndex = Math.floor(hue.steps.length / 2);
  const midStep = hue.steps[midStepIndex];

  // Update params silently (before refresh to prevent change events)
  params.H = parseFloat(hue.h.toFixed(1));
  params.L = Math.round(midStep.l * 100);
  params.C = parseFloat(midStep.c.toFixed(3));

  // Update curve parameters
  params.lStart = Math.round(hue.lightnessCurve.start * 100);
  params.lEnd = Math.round(hue.lightnessCurve.end * 100);
  params.lCurve = hue.lightnessCurve.type;
  params.cStart = Math.round(hue.chromaCurve.start * 100);
  params.cPeak = Math.round(hue.chromaCurve.peak * 100);
  params.cEnd = Math.round(hue.chromaCurve.end * 100);
  params.cPeakPos = Math.round(hue.chromaCurve.peakPosition * 100);

  if (pane) {
    pane.refresh();
  }

  isUpdatingSliders = false; // Re-enable change handlers
}

// Update curve settings for selected hue
function updateCurveSettings(curveType, property, value) {
  const hue = colorSystem[selectedHue];

  if (curveType === 'lightness') {
    hue.lightnessCurve[property] = value;
  } else if (curveType === 'chroma') {
    hue.chromaCurve[property] = value;
  }

  // Regenerate only the selected row
  regenerateSingleHue(selectedHue);
  updateGridRow();
}

// Load a preset
function loadPreset(presetId) {
  if (!presets[presetId]) return;

  const preset = presets[presetId];

  console.log(`Loading Preset ${presetId}:`);

  // Load all color settings from preset
  Object.keys(preset.colors).forEach(hueName => {
    if (colorSystem[hueName]) {
      const presetColor = preset.colors[hueName];
      colorSystem[hueName].h = presetColor.h;
      colorSystem[hueName].l = presetColor.l;
      colorSystem[hueName].c = presetColor.c;
      colorSystem[hueName].lightnessCurve = { ...presetColor.lightnessCurve };
      colorSystem[hueName].chromaCurve = { ...presetColor.chromaCurve };

      // Copy special hue ramping properties if they exist
      if (presetColor.hueCurve) {
        colorSystem[hueName].hueCurve = { ...presetColor.hueCurve };
      }
      if (presetColor.useHueRamping !== undefined) {
        colorSystem[hueName].useHueRamping = presetColor.useHueRamping;
      }

      console.log(`  ${hueName}: h=${presetColor.h}, lCurve=${presetColor.lightnessCurve.start}-${presetColor.lightnessCurve.end}, cCurve=${presetColor.chromaCurve.start}-${presetColor.chromaCurve.peak}-${presetColor.chromaCurve.end}`);
    }
  });

  // Clear cache and regenerate
  gamutCache = {};
  regenerateSteps();
  renderGrid();
  selectHue(selectedHue);

  console.log('Preset loaded. Sample colors:');
  ['cyan', 'green', 'yellow', 'orange', 'red', 'pink', 'purple', 'violet', 'blue'].forEach(hueName => {
    if (colorSystem[hueName] && colorSystem[hueName].steps[0]) {
      const step = colorSystem[hueName].steps[0];
      const hex = oklchToHex(step);
      console.log(`  ${hueName}-1: L=${step.l.toFixed(3)} C=${step.c.toFixed(3)} H=${step.h.toFixed(1)}° → ${hex}`);
    }
  });
}

// Save current state as a preset
function saveAsPreset() {
  const presetIds = Object.keys(presets).map(id => parseInt(id)).filter(n => !isNaN(n));
  const nextId = presetIds.length > 0 ? Math.max(...presetIds) + 1 : 2;
  const newId = String(nextId).padStart(2, '0');

  const newPreset = {
    name: `Preset ${newId}`,
    colors: {}
  };

  Object.keys(colorSystem).forEach(hueName => {
    const hue = colorSystem[hueName];
    newPreset.colors[hueName] = {
      h: hue.h,
      l: hue.l,
      c: hue.c,
      lightnessCurve: { ...hue.lightnessCurve },
      chromaCurve: { ...hue.chromaCurve }
    };
  });

  presets[newId] = newPreset;
  params.preset = newId;

  // Rebuild preset dropdown
  if (pane) {
    pane.dispose();
    setupTweakpane();
  }

  alert(`Saved as Preset ${newId}`);
}

// Setup Tweakpane
function setupTweakpane() {
  const container = document.getElementById('tweakpane-container');
  pane = new Tweakpane.Pane({ container });

  // Preset selector
  const presetOptions = {};
  Object.keys(presets).forEach(id => {
    presetOptions[presets[id].name] = id;
  });

  pane.addInput(params, 'preset', {
    label: 'Preset',
    options: presetOptions
  }).on('change', (ev) => {
    if (!isUpdatingSliders) {
      loadPreset(ev.value);
    }
  });

  // Save preset button
  pane.addButton({
    title: 'Save as New Preset'
  }).on('click', () => {
    saveAsPreset();
  });

  pane.addSeparator();

  // Steps control
  pane.addInput(params, 'steps', {
    label: 'Steps',
    min: 6,
    max: 20,
    step: 1
  }).on('change', (ev) => {
    if (!isUpdatingSliders) {
      regenerateSteps();
      renderGrid();
      // Re-select current hue to update sliders for new step count
      selectHue(selectedHue);
    }
  });

  // Gamut aware toggle
  pane.addInput(params, 'gamutAware', {
    label: 'Gamut Aware'
  }).on('change', (ev) => {
    if (!isUpdatingSliders) {
      // Clear cache and regenerate all colors
      gamutCache = {};
      regenerateSteps();
      renderGrid();
    }
  });

  // Color selector
  pane.addInput(params, 'color', {
    label: 'Color',
    options: {
      Cyan: 'cyan',
      Green: 'green',
      Yellow: 'yellow',
      Orange: 'orange',
      Red: 'red',
      Pink: 'pink',
      Purple: 'purple',
      Violet: 'violet',
      Blue: 'blue'
    }
  }).on('change', (ev) => {
    selectHue(ev.value);
  });

  // Lightness
  pane.addInput(params, 'L', {
    label: 'L',
    min: 0,
    max: 100,
    step: 1
  }).on('change', (ev) => {
    if (!isUpdatingSliders) {
      adjustHueLightness(ev.value / 100);
    }
  });

  // Chroma
  pane.addInput(params, 'C', {
    label: 'C',
    min: 0,
    max: 0.4,
    step: 0.001
  }).on('change', (ev) => {
    if (!isUpdatingSliders) {
      adjustHueChroma(ev.value);
    }
  });

  // Hue
  pane.addInput(params, 'H', {
    label: 'H',
    min: 0,
    max: 360,
    step: 0.1
  }).on('change', (ev) => {
    if (!isUpdatingSliders) {
      adjustHueAngle(ev.value);
    }
  });

  // Add separator
  pane.addSeparator();

  // Lightness Curve folder
  lightnessCurveFolder = pane.addFolder({ title: 'Lightness Curve' });

  lightnessCurveFolder.addInput(params, 'lStart', {
    label: 'Start L',
    min: 0,
    max: 100,
    step: 1
  }).on('change', (ev) => {
    if (!isUpdatingSliders) {
      updateCurveSettings('lightness', 'start', ev.value / 100);
    }
  });

  lightnessCurveFolder.addInput(params, 'lEnd', {
    label: 'End L',
    min: 0,
    max: 100,
    step: 1
  }).on('change', (ev) => {
    if (!isUpdatingSliders) {
      updateCurveSettings('lightness', 'end', ev.value / 100);
    }
  });

  lightnessCurveFolder.addInput(params, 'lCurve', {
    label: 'Curve',
    options: {
      Linear: 'linear',
      'Ease In': 'easeIn',
      'Ease Out': 'easeOut',
      'S-Curve': 'sCurve'
    }
  }).on('change', (ev) => {
    if (!isUpdatingSliders) {
      updateCurveSettings('lightness', 'type', ev.value);
    }
  });

  // Chroma Curve folder
  chromaCurveFolder = pane.addFolder({ title: 'Chroma Curve' });

  chromaCurveFolder.addInput(params, 'cStart', {
    label: 'Start C',
    min: 0,
    max: 30,
    step: 1
  }).on('change', (ev) => {
    if (!isUpdatingSliders) {
      updateCurveSettings('chroma', 'start', ev.value / 100);
    }
  });

  chromaCurveFolder.addInput(params, 'cPeak', {
    label: 'Peak C',
    min: 0,
    max: 30,
    step: 1
  }).on('change', (ev) => {
    if (!isUpdatingSliders) {
      updateCurveSettings('chroma', 'peak', ev.value / 100);
    }
  });

  chromaCurveFolder.addInput(params, 'cEnd', {
    label: 'End C',
    min: 0,
    max: 30,
    step: 1
  }).on('change', (ev) => {
    if (!isUpdatingSliders) {
      updateCurveSettings('chroma', 'end', ev.value / 100);
    }
  });

  chromaCurveFolder.addInput(params, 'cPeakPos', {
    label: 'Peak Position',
    min: 0,
    max: 100,
    step: 1
  }).on('change', (ev) => {
    if (!isUpdatingSliders) {
      updateCurveSettings('chroma', 'peakPosition', ev.value / 100);
    }
  });

  // Add separator
  pane.addSeparator();

  // Download SVG button
  pane.addButton({
    title: 'Download SVG'
  }).on('click', () => {
    downloadSVG();
  });

  // Copy CSS button
  pane.addButton({
    title: 'Copy CSS'
  }).on('click', () => {
    copyCSS();
  });
}

// Regenerate steps when count changes
function regenerateSteps() {
  generateDefaultSteps();
}

// Regenerate steps for a single hue
function regenerateSingleHue(hueName) {
  const hueData = colorSystem[hueName];
  hueData.steps = [];

  const stepCount = params.steps;

  // Calculate lightness and chroma curves
  const lightnessValues = calculateLightnessCurve(
    hueData.lightnessCurve.start,
    hueData.lightnessCurve.end,
    stepCount,
    hueData.lightnessCurve.type
  );

  const chromaValues = calculateChromaCurve(
    hueData.chromaCurve.start,
    hueData.chromaCurve.peak,
    hueData.chromaCurve.end,
    hueData.chromaCurve.peakPosition,
    stepCount
  );

  // Calculate hue values (for colors with hue ramping)
  let hueValues;
  if (hueData.useHueRamping && hueData.hueCurve) {
    hueValues = calculateHueCurve(
      hueData.hueCurve.start,
      hueData.hueCurve.end,
      stepCount,
      hueData.hueCurve.type
    );
  }

  // Create steps using curve values
  for (let i = 0; i < stepCount; i++) {
    const l = Math.max(0.05, Math.min(0.98, lightnessValues[i]));
    let c = Math.max(0, Math.min(0.4, chromaValues[i]));
    const h = hueValues ? hueValues[i] : hueData.h;

    // Apply gamut clamping during generation if enabled
    if (params.gamutAware) {
      const maxC = findMaxChroma(l, h);
      c = Math.min(c, maxC);
    }

    hueData.steps.push({
      l: l,
      c: c,
      h: h
    });
  }
}

// Adjust entire hue's lightness
function adjustHueLightness(multiplier) {
  const hue = colorSystem[selectedHue];
  const midStep = hue.steps[Math.floor(hue.steps.length / 2)];
  const currentMidL = midStep.l;
  const offset = multiplier - currentMidL;

  hue.steps.forEach(color => {
    color.l = Math.max(0, Math.min(1, color.l + offset));
  });

  updateGridRow();
}

// Adjust entire hue's chroma
function adjustHueChroma(multiplier) {
  const hue = colorSystem[selectedHue];
  const midStep = hue.steps[Math.floor(hue.steps.length / 2)];
  const currentMidC = midStep.c;
  const ratio = currentMidC > 0 ? multiplier / currentMidC : 1;

  hue.steps.forEach(color => {
    color.c = Math.max(0, Math.min(0.4, color.c * ratio));
  });

  updateGridRow();
}

// Adjust entire hue's angle
function adjustHueAngle(newHue) {
  const hue = colorSystem[selectedHue];
  hue.h = newHue;

  hue.steps.forEach(color => {
    color.h = newHue;
  });

  updateGridRow();
}

// Update only the selected row in the grid
function updateGridRow() {
  const hue = colorSystem[selectedHue];
  const cells = document.querySelectorAll(`[data-hue="${selectedHue}"]`);

  cells.forEach((cell, index) => {
    cell.style.backgroundColor = oklchToCSS(hue.steps[index]);
  });
}

// OKLCH to sRGB conversion (following CSS Color 4 spec)
function oklchToSrgb(l, c, h) {
  // Convert OKLCH to OKLab
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  // OKLab to linear RGB (D65)
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  const r_linear = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const g_linear = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const b_linear = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

  // Linear RGB to sRGB (gamma correction)
  function toSrgb(val) {
    return val <= 0.0031308
      ? 12.92 * val
      : 1.055 * Math.pow(val, 1 / 2.4) - 0.055;
  }

  return {
    r: toSrgb(r_linear),
    g: toSrgb(g_linear),
    b: toSrgb(b_linear)
  };
}

// Check if OKLCH color is within sRGB gamut using Culori if available
function isInGamut(l, c, h) {
  if (window.culori) {
    // Use Culori for accurate gamut checking
    const color = window.culori.oklch({ mode: 'oklch', l, c, h });
    return window.culori.inGamut('rgb')(color);
  } else {
    // Fallback to manual conversion
    const rgb = oklchToSrgb(l, c, h);
    return rgb.r >= 0 && rgb.r <= 1 &&
           rgb.g >= 0 && rgb.g <= 1 &&
           rgb.b >= 0 && rgb.b <= 1;
  }
}

// Find maximum displayable chroma for given L and H using binary search
function findMaxChroma(l, h) {
  // Check cache first
  const cacheKey = `${l.toFixed(3)}_${h.toFixed(1)}`;
  if (gamutCache[cacheKey] !== undefined) {
    return gamutCache[cacheKey];
  }

  let low = 0;
  let high = 0.4;
  const precision = 0.001;

  while (high - low > precision) {
    const mid = (low + high) / 2;
    if (isInGamut(l, mid, h)) {
      low = mid;
    } else {
      high = mid;
    }
  }

  // Cache the result
  gamutCache[cacheKey] = low;
  return low;
}

// Calculate max saturation preset - finds gamut boundaries for each hue
function calculateMaxSaturationPreset() {
  const hues = Object.keys(colorSystem);
  const steps = 12;
  const maxSatPreset = {};

  console.log('Calculating Max Saturation Preset...');

  hues.forEach(hueName => {
    const hue = colorSystem[hueName];
    const h = hue.h;

    // Use standard lightness range
    const lStart = 0.95;
    const lEnd = 0.20;

    // Sample gamut boundaries across lightness range
    const chromaValues = [];
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const l = lStart + (lEnd - lStart) * t;
      const maxC = findMaxChroma(l, h);
      chromaValues.push({ l, c: maxC });
    }

    // Find where chroma peaks
    const maxChroma = Math.max(...chromaValues.map(v => v.c));
    const peakIndex = chromaValues.findIndex(v => v.c === maxChroma);
    const peakPosition = peakIndex / (steps - 1);

    // Get start and end chroma (reduce by 5% for safety margin)
    const cStart = chromaValues[0].c * 0.95;
    const cPeak = maxChroma * 0.95;
    const cEnd = chromaValues[steps - 1].c * 0.95;

    maxSatPreset[hueName] = {
      h: h,
      l: hue.l,
      c: cPeak,
      lightnessCurve: { start: lStart, end: lEnd, type: 'linear' },
      chromaCurve: { start: cStart, peak: cPeak, end: cEnd, peakPosition: peakPosition }
    };

    console.log(`  ${hueName}: peak C=${cPeak.toFixed(3)} at pos=${peakPosition.toFixed(2)}`);
  });

  return maxSatPreset;
}

// Convert OKLCH to CSS using actual RGB values (prevents browser clipping)
function oklchToCSS(color) {
  if (window.culori) {
    // Use Culori for accurate conversion and clamping
    const oklchColor = window.culori.oklch({ mode: 'oklch', l: color.l, c: color.c, h: color.h });

    // If gamut aware, clamp the color to RGB gamut
    if (params.gamutAware) {
      const clamped = window.culori.clampChroma(oklchColor, 'rgb');
      const rgb = window.culori.rgb(clamped);
      const r255 = Math.round(rgb.r * 255);
      const g255 = Math.round(rgb.g * 255);
      const b255 = Math.round(rgb.b * 255);
      return `rgb(${r255}, ${g255}, ${b255})`;
    } else {
      // Direct conversion without clamping
      const rgb = window.culori.rgb(oklchColor);
      const r255 = Math.round(Math.max(0, Math.min(1, rgb.r)) * 255);
      const g255 = Math.round(Math.max(0, Math.min(1, rgb.g)) * 255);
      const b255 = Math.round(Math.max(0, Math.min(1, rgb.b)) * 255);
      return `rgb(${r255}, ${g255}, ${b255})`;
    }
  } else {
    // Fallback to manual conversion
    const rgb = oklchToSrgb(color.l, color.c, color.h);

    // Clamp RGB values to [0, 1] range
    const r = Math.max(0, Math.min(1, rgb.r));
    const g = Math.max(0, Math.min(1, rgb.g));
    const b = Math.max(0, Math.min(1, rgb.b));

    // Convert to 0-255 range
    const r255 = Math.round(r * 255);
    const g255 = Math.round(g * 255);
    const b255 = Math.round(b * 255);

    return `rgb(${r255}, ${g255}, ${b255})`;
  }
}

// Download SVG of color grid
function downloadSVG() {
  const hueNames = Object.keys(colorSystem);
  const cols = params.steps;
  const rows = hueNames.length;
  const cellSize = 40;
  const labelWidth = 80;
  const width = labelWidth + cols * cellSize;
  const height = rows * cellSize;

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <style>
    @supports (color: oklch(0% 0 0)) {
      .oklch-color { color: var(--oklch-value); }
    }
  </style>
  <rect width="${width}" height="${height}" fill="#808080"/>
`;

  hueNames.forEach((hueName, rowIndex) => {
    const y = rowIndex * cellSize;

    // Add label
    svg += `  <text x="${labelWidth - 10}" y="${y + cellSize / 2}"
            font-family="Arial" font-size="14" fill="white"
            text-anchor="end" dominant-baseline="middle">${hueName}</text>\n`;

    // Add color cells - convert OKLCH to approximate RGB for compatibility
    colorSystem[hueName].steps.forEach((color, colIndex) => {
      const x = labelWidth + colIndex * cellSize;
      const hexColor = oklchToHex(color);
      svg += `  <rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${hexColor}"/>\n`;
    });
  });

  svg += '</svg>';

  // Download
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'oklch-colors.svg';
  a.click();
  URL.revokeObjectURL(url);
}

// Convert OKLCH to HEX
function oklchToHex(color) {
  if (window.culori) {
    // Use Culori for accurate conversion
    const oklchColor = window.culori.oklch({ mode: 'oklch', l: color.l, c: color.c, h: color.h });

    if (params.gamutAware) {
      const clamped = window.culori.clampChroma(oklchColor, 'rgb');
      return window.culori.formatHex(clamped);
    } else {
      return window.culori.formatHex(oklchColor);
    }
  } else {
    // Fallback to canvas method
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const cssColor = oklchToCSS(color);
    ctx.fillStyle = cssColor;
    ctx.fillRect(0, 0, 1, 1);

    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
}

// Copy CSS variables to clipboard
function copyCSS() {
  const hueNames = Object.keys(colorSystem);
  let css = ':root {\n';

  hueNames.forEach(hueName => {
    css += `  /* ${hueName} */\n`;
    colorSystem[hueName].steps.forEach((color, index) => {
      const varName = `--${hueName}-${index + 1}`;
      const value = oklchToCSS(color); // Already returns rgb() format
      css += `  ${varName}: ${value};\n`;
    });
    css += '\n';
  });

  css += '}';

  // Copy to clipboard
  navigator.clipboard.writeText(css).then(() => {
    alert('CSS copied to clipboard!');
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
}
