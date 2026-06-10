export const HUD_NATIVE_WIDTH = 2830;
export const HUD_NATIVE_HEIGHT = 1471;
export const HUD_CENTER_Y_RATIO = 0.89;
export const HUD_OFFSET_X = 0;
export const HUD_OFFSET_Y = 0;
export const HUD_SCALE_MULTIPLIER = 1;

export const HUD_BASE_OFFSET_X = 0;
export const HUD_BASE_OFFSET_Y = 0;

export const HUD_BONUS_BUTTON_OFFSET_X = 0;
export const HUD_BONUS_BUTTON_OFFSET_Y = 0;

export const HUD_INFO_OFFSET_X = 0;
export const HUD_INFO_OFFSET_Y = 0;

export function getHudScale(canvasWidth, canvasHeight) {
  return Math.min(canvasWidth / HUD_NATIVE_WIDTH, canvasHeight / HUD_NATIVE_HEIGHT) * HUD_SCALE_MULTIPLIER;
}

export function hudAssetX(hudCenterX, hudScale, offsetX = 0) {
  return hudCenterX + offsetX * hudScale;
}

export function hudAssetY(hudCenterY, hudScale, offsetY = 0) {
  return hudCenterY + offsetY * hudScale;
}

export function hudBottomAssetX(canvasWidth, hudScale, offsetX = 0) {
  return canvasWidth / 2 + HUD_OFFSET_X * hudScale + offsetX * hudScale;
}

export function hudBottomAssetY(canvasHeight, hudScale, offsetY = 0) {
  return (
    canvasHeight * HUD_CENTER_Y_RATIO
    + (HUD_NATIVE_HEIGHT * hudScale) / 2
    + HUD_OFFSET_Y * hudScale
    + offsetY * hudScale
  );
}
