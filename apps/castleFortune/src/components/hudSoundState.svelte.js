export const hudSoundState = $state({
  soundEffectVolume: 1,
  musicVolume: 1,
});

export function setHudSoundEffectVolume(value) {
  hudSoundState.soundEffectVolume = Math.max(0, Math.min(1, value));
}

export function setHudMusicVolume(value) {
  hudSoundState.musicVolume = Math.max(0, Math.min(1, value));
}
