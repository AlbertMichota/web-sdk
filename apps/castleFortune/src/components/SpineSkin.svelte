<script>
  import { getContextSpine } from 'pixi-svelte';

  const { skinName } = $props();
  const spine = getContextSpine();

  $effect(() => {
    if (!skinName) return;

    try {
      spine.skeleton.setSkinByName(skinName);
      spine.skeleton.setSlotsToSetupPose();
    } catch (error) {
      console.error(error);
      console.log(
        'Available skin names:',
        spine.skeleton.data.skins.map((skin) => skin.name),
      );
    }
  });
</script>
