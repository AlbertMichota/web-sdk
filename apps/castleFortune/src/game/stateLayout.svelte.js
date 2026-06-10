// stateLayout.svelte.js
// Layout state for Castle Fortune
// The actual layout logic lives in utils-layout and is set up in context.js
// This file exposes a simple reactive state for components that need
// layout values outside of the Svelte context system

// Layout breakpoints matching StakeEngine's system
export const LAYOUT_TYPES = {
  DESKTOP:   'desktop',
  LANDSCAPE: 'landscape',
  PORTRAIT:  'portrait',
};

// Aspect ratios used for background scaling
export const BACKGROUND_RATIO          = 2039 / 1000;
export const PORTRAIT_BACKGROUND_RATIO = 1242 / 2208;

// Main canvas sizes at each breakpoint
export const DESKTOP_MAIN_SIZES = {
  width:  1422,
  height: 800,
};

export const LANDSCAPE_MAIN_SIZES = {
  width:  1600,
  height: 900,
};

export const PORTRAIT_MAIN_SIZES = {
  width:  800,
  height: 1422,
};

/**
 * Get the main layout sizes for a given layout type
 * @param {'desktop'|'landscape'|'portrait'} layoutType
 */
export function getMainSizes(layoutType) {
  switch (layoutType) {
    case LAYOUT_TYPES.PORTRAIT:  return PORTRAIT_MAIN_SIZES;
    case LAYOUT_TYPES.LANDSCAPE: return LANDSCAPE_MAIN_SIZES;
    default:                     return DESKTOP_MAIN_SIZES;
  }
}
