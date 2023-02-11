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
  {#if isStarted}
    <Granular {rnboModule} {context} />
  {:else}
    <h1>single motion granular</h1>
    <button style="margin-top:32px;" on:click={onClick}>play</button>
  {/if}
</main>
