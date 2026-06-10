<script>
  // Sound.svelte
  // Manages all audio for Castle Fortune
  // Subscribes to eventEmitter sound events and routes them to the sound system
  // Must be mounted inside Game.svelte before any sounds can play

  import { onMount, onDestroy } from 'svelte';
  import { getContext } from '../game/context.js';

  const context = getContext();
  const { eventEmitter, soundManager, stateApp } = context;

  let unsubscribe;
  let destroyLoadedHudSound;

  $effect(() => {
    if (destroyLoadedHudSound || !stateApp.loadedAssets.HudBonusLemonSound) return;
    const loadedAudio = $state.snapshot(stateApp.loadedAssets.HudBonusLemonSound);
    const loadedSound = soundManager.load(loadedAudio);
    destroyLoadedHudSound = loadedSound?.destroy;
  });

  onMount(() => {
    // Start background music once the game loads
    soundManager.playMusic('bgm_main');

    // Subscribe to all sound events fired by bookEventHandlerMap
    unsubscribe = eventEmitter.subscribeMany({

      soundOnce: ({ name }) => {
        soundManager.playSfx(name);
      },

      soundMusic: ({ name }) => {
        soundManager.playMusic(name);
      },

      soundLoop: ({ name }) => {
        soundManager.loopSfx(name);
      },

      soundStop: ({ name }) => {
        soundManager.stop(name);
      },

      soundPause: () => {
        soundManager.pauseAll();
      },

      soundResume: () => {
        soundManager.resumeAll();
      },

      soundMusicMute: ({ muted }) => {
        soundManager.setMusicMuted(muted);
      },

      soundSfxMute: ({ muted }) => {
        soundManager.setSfxMuted(muted);
      },
    });

    // Pause audio when page loses focus, resume when it comes back
    const onBlur   = () => soundManager.pauseAll();
    const onFocus  = () => soundManager.resumeAll();
    window.addEventListener('blur',  onBlur);
    window.addEventListener('focus', onFocus);

    return () => {
      window.removeEventListener('blur',  onBlur);
      window.removeEventListener('focus', onFocus);
    };
  });

  onDestroy(() => {
    unsubscribe?.();
    destroyLoadedHudSound?.();
  });
</script>

<!-- Sound is invisible — no markup needed -->
