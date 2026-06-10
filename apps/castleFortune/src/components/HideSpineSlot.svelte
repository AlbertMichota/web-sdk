<script>
  import { getContextSpine } from 'pixi-svelte';

  const { slotName } = $props();
  const spine = getContextSpine();

  $effect(() => {
    const slot = spine.skeleton.findSlot(slotName);
    if (slot) slot.attachment = null;
  });
</script>
