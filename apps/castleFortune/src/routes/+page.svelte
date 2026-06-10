<script>
  import { setContext } from '../game/context.js';
  import Game from '../components/Game.svelte';

  setContext();
</script>

<Game showStartScreen={true} />
