<script lang="ts">
  import { draggable, type DragEventData } from "@neodrag/svelte";
  import { createEventDispatcher } from "svelte";
  import { readFileAsArrayBuffer } from "./fileReader";
  import type { RnboModule } from "./rnbo";
  import type { ChangeBufferEventPayload } from "./types";
  import { formatNumber, normalizePos } from "./utils";

  const dispatch = createEventDispatcher<{
    changeBuffer: ChangeBufferEventPayload;
  }>();

  export let rnboModule: RnboModule;
  export let fileName: string;
  $: changePos = rnboModule.changePos;
  $: changePitch = rnboModule.changePitch;
  $: startPlaying = rnboModule.startPlaying;
  $: stopPlaying = rnboModule.stopPlaying;

  let x: number = 50;
  let y: number = 50;

  type OnDrag = (e: CustomEvent<DragEventData>) => void;
  const onDrag: OnDrag = (e) => {
    const normalizedPos = normalizePos({
      x: e.detail.offsetX,
      y: e.detail.offsetY,
    });
    x = normalizedPos.x;
    y = normalizedPos.y;

    changePos(x);
    changePitch(y);
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
</script>

<div id="dragarea">
  <div>drag and drop your sample here</div>
  <div id="file-name">
    file: {fileName}
  </div>
</div>

<div
  id="parent"
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
  <div
    id="pointer"
    use:draggable={{
      bounds: "parent",
      defaultPosition: {
        x,
        y,
      },
      defaultClassDragging: "dragging",
    }}
    on:neodrag:start={startPlaying}
    on:neodrag={onDrag}
    on:neodrag:end={stopPlaying}
  />
</div>

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
  .dragging {
    background: #818181;
  }
  #parent {
    width: 500px;
    height: 500px;
    border-radius: 2%;
    background: #333333;
    margin: 0 auto;
  }
  #description {
    position: absolute;
    left: 50%;
    top: 50%;
    /* transform: translate(-50%, 127%); */
  }
  #pointer {
    width: 45px;
    height: 45px;
    border: 3px solid rgb(246, 249, 228);
    border-radius: 50%;
    cursor: pointer;
  }
  .dragging {
    width: 45px;
    height: 45px;
    background: rgb(246, 249, 228);
    border-radius: 50%;
    cursor: pointer;
  }
</style>
