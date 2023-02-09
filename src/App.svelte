<script lang="ts">
  import { draggable } from "@neodrag/svelte";
  import { createDevice } from "@rnbo/js";
  let x: number = 250;
  let y: number = 250;
  function normalizePos({ x, y }: { x: number; y: number }) {
    return {
      x: (x + 1) / 468,
      y: (y + 1) / 468,
    };
  }
  let normalizedX: number;
  let normalizedY: number;
  $: {
    const normalizedPos = normalizePos({ x, y });
    normalizedX = normalizedPos.x;
    normalizedY = normalizedPos.y;
  }

  let WAContext = window.AudioContext || (window as any).webkitAudioContext;
  let context = new WAContext();
  const onClick = async () => {
    await context.resume();
    let rawPatcher = await fetch("patch.export.json");
    let patcher = await rawPatcher.json();
    const device = await createDevice({ context, patcher });
    device.node.connect(context.destination);

    const dependencies = await (await fetch("dependencies.json")).json();

    const results = await device.loadDataBufferDependencies(dependencies);
    results.forEach((result) => {
      if (result.type === "success") {
        console.log(`Successfully loaded buffer with id ${result.id}`, result);
      } else {
        console.log(
          `Failed to load buffer with id ${result.id}, ${result.error}`
        );
      }
    });
    const pos = device.parametersById.get("pos");
    pos.value = 0.4573;
    console.log(device.parametersById.get("pos"));

    const pitch = device.parametersById.get("pitch");
    pitch.value = 0.7065;
    console.log(device.parametersById.get("pitch"));

    const play = device.parametersById.get("play");
    play.value = 1;
    console.log(device.parametersById.get("play"));
  };
</script>

<main>
  <button on:click={onClick}>button</button>
  <pre>
    x: {normalizedX}
    y: {normalizedY}
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
      on:neodrag:start={(e) => console.log("Dragging started", e)}
      on:neodrag={(e) => {
        x = e.detail.offsetX;
        y = e.detail.offsetY;
      }}
      on:neodrag:end={(e) => console.log("Dragging stopped", e)}
    />
  </div>
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
  }
</style>
