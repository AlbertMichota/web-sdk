import { hudSoundState } from './hudSoundState.svelte.js';

const HUD_ON_OFF_SOUND_SRC = '/assests/audio/HUD/onOffAnimationSounds.MP3';
const BET_SIZE_SOUND_SRC = '/assests/audio/HUD/betSizeSound.MP3';
const SPIN_BUTTON_SOUND_SRC = '/assests/audio/HUD/spinButtonSound.MP3';
const FLAME_TRANSITION_SOUND_SRC = '/assests/audio/cFSounds/flameTransitionSound.MP3';
const BASE_MUSIC_SRC = '/assests/audio/cFSounds/baseMusic.MP3';

let hudOnOffAudio;
let betSizeAudio;
let spinButtonAudio;
let flameTransitionAudio;
let baseMusicAudio;

function getHudOnOffAudio() {
  if (!hudOnOffAudio) {
    hudOnOffAudio = new Audio(HUD_ON_OFF_SOUND_SRC);
    hudOnOffAudio.preload = 'auto';
  }

  return hudOnOffAudio;
}

export function playHudOnOffSound() {
  const audio = getHudOnOffAudio();
  audio.currentTime = 0;
  audio.volume = hudSoundState.soundEffectVolume;
  audio.play().catch(() => {});
}

function getBetSizeAudio() {
  if (!betSizeAudio) {
    betSizeAudio = new Audio(BET_SIZE_SOUND_SRC);
    betSizeAudio.preload = 'auto';
  }

  return betSizeAudio;
}

export function playBetSizeSound() {
  const audio = getBetSizeAudio();
  audio.currentTime = 0;
  audio.volume = hudSoundState.soundEffectVolume;
  audio.play().catch(() => {});
}

function getSpinButtonAudio() {
  if (!spinButtonAudio) {
    spinButtonAudio = new Audio(SPIN_BUTTON_SOUND_SRC);
    spinButtonAudio.preload = 'auto';
  }

  return spinButtonAudio;
}

export function playSpinButtonSound() {
  const audio = getSpinButtonAudio();
  audio.currentTime = 0;
  audio.volume = hudSoundState.soundEffectVolume;
  audio.play().catch(() => {});
}

function getFlameTransitionAudio() {
  if (!flameTransitionAudio) {
    flameTransitionAudio = new Audio(FLAME_TRANSITION_SOUND_SRC);
    flameTransitionAudio.preload = 'auto';
  }

  return flameTransitionAudio;
}

export function playFlameTransitionSound() {
  const audio = getFlameTransitionAudio();
  audio.currentTime = 0;
  audio.volume = hudSoundState.soundEffectVolume;
  audio.play().catch(() => {});
}

function getBaseMusicAudio() {
  if (!baseMusicAudio) {
    baseMusicAudio = new Audio(BASE_MUSIC_SRC);
    baseMusicAudio.preload = 'auto';
    baseMusicAudio.loop = true;
  }

  return baseMusicAudio;
}

export function playBaseMusic() {
  const audio = getBaseMusicAudio();
  audio.loop = true;
  audio.volume = hudSoundState.musicVolume;

  if (!audio.paused) return;
  audio.play().catch(() => {});
}

export function setBaseMusicVolume(value = hudSoundState.musicVolume) {
  if (!baseMusicAudio) return;
  baseMusicAudio.volume = value;
}
