<script lang="ts">
  import { draggable } from "@neodrag/svelte";
  import { createDevice, type Device } from "@rnbo/js";
  let x: number = 250;
  let y: number = 250;
  function normalizePos({ x, y }: { x: number; y: number }) {
    return {
      x: (x + 1) / 468,
      y: 1 - (y + 1) / 468,
    };
  }
  let WAContext = window.AudioContext || (window as any).webkitAudioContext;
  let context = new WAContext();
  let device: Device | null = null;
  $: isStarted = device !== null;

  const onClick = async () => {
    await context.resume();
    let rawPatcher = await fetch("patch.export.json");
    let patcher = await rawPatcher.json();
    const _device = await createDevice({ context, patcher });
    _device.node.connect(context.destination);

    const dependencies = await (await fetch("dependencies.json")).json();

    const results = await _device.loadDataBufferDependencies(dependencies);
    const isSuccess = results.every((result) => result.type === "success");
    if (isSuccess) {
      device = _device;
    }
  };
</script>

<main>
  {#if isStarted}
    <pre>
    Position(x): {x}
    Pitch(y): {y}
    </pre>
    <div id="parent">
      <div
        id="pointer"
        use:draggable={{
          bounds: "parent",
          defaultPosition: {
            x,
            y,
          },
        }}
        on:neodrag:start={(e) => {
          if (!device) return;
          const play = device.parametersById.get("play");
          play.value = 1;
        }}
        on:neodrag={(e) => {
          if (!device) return;
          const normalizedPos = normalizePos({
            x: e.detail.offsetX,
            y: e.detail.offsetY,
          });
          x = normalizedPos.x;
          y = normalizedPos.y;

          const pos = device.parametersById.get("pos");
          const pitch = device.parametersById.get("pitch");
          pos.value = x;
          pitch.value = y;
        }}
        on:neodrag:end={(e) => {
          if (!device) return;
          const play = device.parametersById.get("play");
          play.value = 0.0;
        }}
      />
    </div>
  {:else}
    <button on:click={onClick}>PLAY</button>
  {/if}
</main>

<style>
  #parent {
    width: 500px;
    height: 500px;
    border: 1px white solid;
  }
  #pointer {
    width: 30px;
    height: 30px;
    background: white;
    border: 2px rgb(193, 193, 193) solid;
    border-radius: 50%;
    cursor: pointer;
    filter: blur(2px) brightness(200%);
  }
</style>
