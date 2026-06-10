<script>
  // UI.svelte — Castle Fortune
  // Uses the single UI component from components-ui-pixi
  // which handles spin button, bet controls, balance and win display
  // Subscribes to: uiHide, uiShow, totalWinUpdate

  import { onMount, onDestroy } from 'svelte';
  import { Container }          from 'pixi-svelte';
  import HudBase                from './HudBase.svelte';
  import HudBonusButton         from './HudBonusButton.svelte';
  import HudAutoSpin            from './HudAutoSpin.svelte';
  import HudBetControls         from './HudBetControls.svelte';
  import HudInfo                from './HudInfo.svelte';
  import HudInfoBoxes           from './HudInfoBoxes.svelte';
  import HudSpinButton          from './HudSpinButton.svelte';
  import HudTurboButton         from './HudTurboButton.svelte';
  import { getContext }         from '../game/context.js';
  import { stateBet, stateI18nDerived, stateUrlDerived } from 'state-shared';

  const context = getContext();
  const { eventEmitter } = context;

  stateI18nDerived.init(stateUrlDerived.lang(), {});

  // ── State ──────────────────────────────────────────────────────────────────
  let visible = $state(true);
  let opacity = $state(1);

  // ── Fade helpers ───────────────────────────────────────────────────────────
  function animateOpacity(from, to, duration) {
    return new Promise((resolve) => {
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        opacity = from + (to - from) * progress;
        if (progress < 1) requestAnimationFrame(tick);
        else resolve();
      }
      requestAnimationFrame(tick);
    });
  }

  // ── Event subscriptions ────────────────────────────────────────────────────
  let unsubscribe;

  onMount(() => {
    unsubscribe = eventEmitter.subscribeMany({

      // broadcastAsync waits for these
      uiHide: async () => {
        await animateOpacity(1, 0, 250);
        visible = false;
      },
      uiShow: async () => {
        visible = true;
        await animateOpacity(0, 1, 250);
      },

      // Keep stateBet in sync with the running win total
      totalWinUpdate: ({ amount }) => {
        stateBet.winBookEventAmount = amount;
      },
    });
  });

  onDestroy(() => unsubscribe?.());
</script>

{#if visible}
  <Container zIndex={80} alpha={opacity} sortableChildren={true}>
    <HudBase />
    <HudInfoBoxes />
    <HudBonusButton />
    <HudInfo />
    <HudSpinButton />
    <HudAutoSpin />
    <HudTurboButton />
    <HudBetControls />
  </Container>
{/if}
