<script>
  import { tick } from 'svelte';
  import { getContextSpine } from 'pixi-svelte';

  const { centerKey, scaleValue } = $props();
  const spine = getContextSpine();

  async function centerSpine() {
    await tick();

    const bounds = spine.getLocalBounds();
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;

    spine.x = -centerX * scaleValue;
    spine.y = -centerY * scaleValue;
  }

  $effect(() => {
    centerKey;
    scaleValue;

    centerSpine();
  });
</script>
