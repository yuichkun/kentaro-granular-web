<script lang="ts">
  import { draggable } from "@neodrag/svelte";
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
</script>

<main>
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
