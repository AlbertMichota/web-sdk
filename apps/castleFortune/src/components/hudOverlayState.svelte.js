export const hudOverlayState = $state({
  autoSpinBoxVisible: false,
  infoBoxVisible: false,
  bonusOptionsVisible: false,
  bonusConfirmationVisible: false,
  bonusConfirmationSkin: '',
});

export function toggleAutoSpinBox() {
  hudOverlayState.autoSpinBoxVisible = !hudOverlayState.autoSpinBoxVisible;
  if (hudOverlayState.autoSpinBoxVisible) {
    hudOverlayState.infoBoxVisible = false;
    hudOverlayState.bonusOptionsVisible = false;
    hudOverlayState.bonusConfirmationVisible = false;
    hudOverlayState.bonusConfirmationSkin = '';
  }
}

export function toggleInfoBox() {
  hudOverlayState.infoBoxVisible = !hudOverlayState.infoBoxVisible;
  if (hudOverlayState.infoBoxVisible) {
    hudOverlayState.autoSpinBoxVisible = false;
    hudOverlayState.bonusOptionsVisible = false;
    hudOverlayState.bonusConfirmationVisible = false;
    hudOverlayState.bonusConfirmationSkin = '';
  }
}

export function toggleBonusOptions() {
  hudOverlayState.bonusOptionsVisible = !hudOverlayState.bonusOptionsVisible;
  hudOverlayState.bonusConfirmationVisible = false;
  hudOverlayState.bonusConfirmationSkin = '';
  if (hudOverlayState.bonusOptionsVisible) {
    hudOverlayState.autoSpinBoxVisible = false;
    hudOverlayState.infoBoxVisible = false;
  }
}

export function showBonusConfirmation(skinName) {
  hudOverlayState.bonusOptionsVisible = false;
  hudOverlayState.bonusConfirmationVisible = true;
  hudOverlayState.bonusConfirmationSkin = skinName;
  hudOverlayState.autoSpinBoxVisible = false;
  hudOverlayState.infoBoxVisible = false;
}

export function closeHudBoxes() {
  hudOverlayState.autoSpinBoxVisible = false;
  hudOverlayState.infoBoxVisible = false;
  hudOverlayState.bonusOptionsVisible = false;
  hudOverlayState.bonusConfirmationVisible = false;
  hudOverlayState.bonusConfirmationSkin = '';
}
