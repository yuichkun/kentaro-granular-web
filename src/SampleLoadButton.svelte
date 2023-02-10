<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { readFileAsArrayBuffer } from "./fileReader";
  import type { ChangeBufferEventPayload } from "./types";

  const dispatch = createEventDispatcher<{
    changeBuffer: ChangeBufferEventPayload;
  }>();

  let fileInput: HTMLInputElement;

  const onFileChange = async () => {
    if (!(fileInput.files && fileInput.files.length === 1))
      throw new Error("please select one audio file");
    const [file] = fileInput.files;
    const arrayBuffer = await readFileAsArrayBuffer(file);
    dispatch("changeBuffer", {
      arrayBuffer,
      fileName: file.name,
    });
  };

  const loadSample = () => {
    fileInput.click();
  };
  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "l") {
      loadSample();
    }
  }
</script>

<input
  type="file"
  accept="audio/*"
  style="display:none"
  bind:this={fileInput}
  on:change={onFileChange}
/>
<button id="load-button" on:click={loadSample}>LOAD YOUR SAMPLE (L)</button>
<svelte:window on:keydown={onKeyDown} />
