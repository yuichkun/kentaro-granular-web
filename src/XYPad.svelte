<script lang="ts">
  import { draggable, type DragEventData } from "@neodrag/svelte";
  import { createEventDispatcher } from "svelte";
  import { readFileAsArrayBuffer } from "./fileReader";
  import type { RnboModule } from "./rnbo";
  import type { ChangeBufferEventPayload } from "./types";
  import { normalizePos } from "./utils";

  const dispatch = createEventDispatcher<{
    changeBuffer: ChangeBufferEventPayload;
  }>();

  export let rnboModule: RnboModule;
  export let fileName: string;
  $: changePos = rnboModule.changePos;
  $: changePitch = rnboModule.changePitch;
  $: startPlaying = rnboModule.startPlaying;
  $: stopPlaying = rnboModule.stopPlaying;

  let pos: number = 50;
  let pitch: number = 50;
  let x: number = 0;
  let y: number = 0;
  let parentDiv: HTMLDivElement;

  const onMouseMove = (e: any) => {
    if (!isPointerMoving) return;
    updatePointerPosition(e);
    const normalizedPos = normalizePos({
      x,
      y,
    });
    pos = normalizedPos.x;
    pitch = normalizedPos.y;

    changePos(pos);
    changePitch(pitch);
  };

  const onDrop = async (file: File) => {
    console.log(file);
    const arrayBuffer = await readFileAsArrayBuffer(file);
    dispatch("changeBuffer", {
      arrayBuffer,
      fileName: file.name,
    });
  };

  let isDragging = false;
  let isPointerMoving = false;
  function updatePointerPosition(e: any) {
    const posX = e.pageX - parentDiv.offsetLeft - 23;
    if (posX + 46 > 500) {
      x = 500 - 46;
    } else if (posX <= 0) {
      x = 0;
    } else {
      x = posX;
    }

    const posY = e.pageY - parentDiv.offsetTop - 23;
    if (posY + 46 > 500) {
      y = 500 - 46;
    } else if (posY <= 0) {
      y = 0;
    } else {
      y = posY;
    }
  }
</script>

<div
  id="dragarea"
  class={isDragging ? "dragging" : ""}
  on:dragover={(e) => {
    e.preventDefault();
    isDragging = true;
  }}
  on:dragleave={(e) => {
    e.preventDefault();
    isDragging = false;
  }}
  on:drop={(e) => {
    e.preventDefault();
    isDragging = false;
    if (e.dataTransfer?.files) {
      const [file] = e.dataTransfer.files;
      if (file.type.startsWith("audio")) {
        onDrop(file);
      } else {
        alert("Select an audio file");
      }
    }
  }}
>
  <div>drag and drop your sample here</div>
  <div id="file-name">
    file: {fileName}
  </div>
</div>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<div
  id="parent"
  bind:this={parentDiv}
  on:mousedown={(e) => {
    e.preventDefault();
    isPointerMoving = true;
    startPlaying();
  }}
  on:click={updatePointerPosition}
>
  <div
    id="pointer"
    class={isPointerMoving ? "dragging" : ""}
    use:draggable={{
      disabled: true,
      bounds: "parent",
      position: {
        x,
        y,
      },
    }}
  />
</div>
<svelte:window
  on:mousemove={onMouseMove}
  on:mouseup={(e) => {
    isPointerMoving = false;
    stopPlaying();
  }}
/>

<style>
  #dragarea {
    background: transparent;
    border: 1.5px rgb(246, 249, 228) solid;
    width: 350px;
    height: 55px;
    padding: 8px 0;
    text-align: center;
    margin: 0 auto;
    margin-bottom: 18px;
  }

  #file-name {
    padding-top: 2px;
    color: rgb(160, 160, 160);
  }
  #parent {
    width: 500px;
    height: 500px;
    border-radius: 2%;
    background: rgb(33, 33, 33);
    margin: 0 auto;
    cursor: pointer;
  }
  #pointer {
    width: 46px;
    height: 46px;
    border: 3px solid rgb(246, 249, 228);
    border-radius: 50%;
  }
  .dragging {
    color: rgb(33, 33, 33) !important;
    background: rgb(246, 249, 228) !important;
    cursor: none !important;
  }
</style>
