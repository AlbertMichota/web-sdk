<script>
  import { onMount } from 'svelte';

  import { getContext } from '../game/context.js';

  const context = getContext();

  onMount(() => {
    const { unsubscribe } = context.gameActor.subscribe((snapshot) => {
      context.stateXstate.value = snapshot.value;
    });

    context.gameActor.start();
    context.gameActor.send({ type: 'RENDERED' });

    return () => {
      unsubscribe();
      context.gameActor.stop();
    };
  });

  context.eventEmitter.subscribeOnMount({
    bet: () => context.gameActor.send({ type: 'BET' }),
    autoBet: () => context.gameActor.send({ type: 'AUTO_BET' }),
    resumeBet: () => context.gameActor.send({ type: 'RESUME_BET' }),
  });
</script>
