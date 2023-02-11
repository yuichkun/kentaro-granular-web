<script lang="ts">
  import type { Device } from "@rnbo/js";
  import type { IMediaRecorder } from "extendable-media-recorder";
  import { onMount } from "svelte";
  import { setupMediaRecorder } from "./mediaRecorder";
  import { isRecording, isAudioHidden, audioUrl } from "./stores";

  export let device: Device;
  export let context: AudioContext;

  let mediaRecorder: IMediaRecorder;
  onMount(async () => {
    const onStop = (blob: Blob) => {
      const url = URL.createObjectURL(blob);
      audioUrl.set(url);
    };
    mediaRecorder = await setupMediaRecorder({ context, device, onStop });
  });
  const recordSound = () => {
    if (!$isRecording) {
      mediaRecorder.start();
      isAudioHidden.set(true);
      isRecording.set(true);
    } else {
      mediaRecorder.stop();
      isAudioHidden.set(false);
      isRecording.set(false);
    }
  };
  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "r") {
      recordSound();
    }
  }
</script>

<button
  id="record-button"
  on:click={recordSound}
  class={$isRecording ? "red" : ""}>RECORD OUTPUT</button
>
<svelte:window on:keydown={onKeyDown} />

<style>
  #record-button {
    width: 164px;
  }
  .red {
    background: #cb0000;
  }
</style>
