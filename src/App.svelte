<script lang="ts">
  import { context } from "./audioContext";
  import { setupDevice, type RnboModule } from "./rnbo";
  import Granular from "./Granular.svelte";
  let isStarted = false;
  let rnboModule: RnboModule;

  const onClick = async () => {
    await context.resume();
    rnboModule = await setupDevice(context);
    isStarted = true;
  };
</script>

<main>
  <h1>Kentaro Granular Web</h1>
  {#if isStarted}
    <Granular {rnboModule} {context} />
  {:else}
    <button style="margin-top:32px;" on:click={onClick}>PLAY</button>
  {/if}
</main>
