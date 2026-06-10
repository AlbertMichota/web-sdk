export const reelAnimationState = $state({
  spinActiveKey: 0,
});

export function triggerReelSpinActive() {
  reelAnimationState.spinActiveKey += 1;
}
