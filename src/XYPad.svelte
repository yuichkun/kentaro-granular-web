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
</script>

<pre>
    File: {fileName}
    Position(x): {formatNumber(x)}%
    Pitch(y): {formatNumber(y)}%
</pre>

<div
  id="parent"
  on:dragover={(e) => {
    e.preventDefault();
  }}
  on:drop={(e) => {
    e.preventDefault();
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
    }}
    on:neodrag:start={startPlaying}
    on:neodrag={onDrag}
    on:neodrag:end={stopPlaying}
  />
</div>

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
