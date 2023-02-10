<script lang="ts">
  import type { IMediaRecorder } from "extendable-media-recorder";
  import { isRecording, isAudioHidden } from "./stores";

  export let mediaRecorder: IMediaRecorder;
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
  class={$isRecording ? "red" : ""}
  >{$isRecording ? "STOP RECORDING (R)" : "RECORD AUDIO (R)"}</button
>
<svelte:window on:keydown={onKeyDown} />

<style>
  .red {
    background: #cb0000;
  }
</style>
