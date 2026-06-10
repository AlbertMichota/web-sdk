// games/ui/createSoundManager.js
// Wraps utils-sound's createSound and routes eventEmitter sound events to it
// Any game plugs this in via createGame() and gets sound for free

import { createSound } from 'utils-sound';
import { stateSoundDerived } from 'state-shared';

/**
 * Create a sound manager that responds to eventEmitter sound events
 * @param {{ eventEmitter: object }} options
 * @returns {{ sound: object, destroy: () => void }}
 */
export function createSoundManager({ eventEmitter }) {
  const sound = createSound();

  const playMusic = (name) => {
    sound.players?.music.play({ name });
  };

  const playSfx = (name) => {
    sound.players?.once.play({ name });
  };

  const loopSfx = (name) => {
    sound.players?.loop.play({ name });
  };

  const stop = (name) => {
    sound.stop({ name });
  };

  const pauseAll = () => {
    sound.players?.music.howl.pause();
    sound.players?.loop.howl.pause();
    sound.players?.once.howl.pause();
  };

  const resumeAll = async () => {
    await sound.players?.music.howl.ctx?.resume?.();
    await sound.players?.loop.howl.ctx?.resume?.();
    await sound.players?.once.howl.ctx?.resume?.();
  };

  const setMusicMuted = (muted) => {
    if (!sound.players) return;
    sound.players.music.volume(muted ? 0 : stateSoundDerived.volumeMusic());
  };

  const setSfxMuted = (muted) => {
    if (!sound.players) return;
    const volume = muted ? 0 : stateSoundDerived.volumeSoundEffect();
    sound.players.loop.volume(volume);
    sound.players.once.volume(volume);
  };

  const soundManager = {
    ...sound,
    playMusic,
    playSfx,
    loopSfx,
    stop,
    pauseAll,
    resumeAll,
    setMusicMuted,
    setSfxMuted,
  };

  // Subscribe to all sound events fired by bookEventHandlerMap
  const unsubscribe = eventEmitter.subscribeMany({

    // Play a sound effect once
    soundOnce: ({ name }) => {
      soundManager.playSfx(name);
    },

    // Start or switch background music
    soundMusic: ({ name }) => {
      soundManager.playMusic(name);
    },

    // Loop a sound effect
    soundLoop: ({ name }) => {
      soundManager.loopSfx(name);
    },

    // Stop a specific sound
    soundStop: ({ name }) => {
      soundManager.stop(name);
    },

    // Mute/unmute all
    soundPause: () => {
      soundManager.pauseAll();
    },

    soundResume: () => {
      soundManager.resumeAll();
    },
  });

  function destroy() {
    unsubscribe();
  }

  return { sound: soundManager, destroy };
}