<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { ChangeBufferEventPayload } from "./types";
  const dispatch = createEventDispatcher<{
    changeBuffer: ChangeBufferEventPayload;
  }>();

  let fileInput: HTMLInputElement;

  const onFileChange = () => {
    if (!(fileInput.files && fileInput.files.length === 1))
      throw new Error("please select one audio file");
    const reader = new FileReader();
    const fileName = fileInput.files[0].name;
    reader.onload = (e) => {
      if (!e.target) throw new Error("something unexpected happened");
      if (!(e.target.result instanceof ArrayBuffer))
        throw new Error("failed to decode the file");
      if (!fileInput.files) return;
      dispatch("changeBuffer", {
        arrayBuffer: e.target.result,
        fileName,
      });
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
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
