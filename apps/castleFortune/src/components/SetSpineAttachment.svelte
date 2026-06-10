<script>
  import { getContextSpine } from 'pixi-svelte';

  const { slotName, attachmentName } = $props();
  const spine = getContextSpine();

  $effect(() => {
    try {
      if (attachmentName === null) {
        const slot = spine.skeleton.findSlot(slotName);
        if (slot) slot.attachment = null;
      } else {
        spine.skeleton.setAttachment(slotName, attachmentName);
      }
    } catch (error) {
      console.error(error);
      console.log('Could not set spine attachment:', { slotName, attachmentName });
    }
  });
</script>
