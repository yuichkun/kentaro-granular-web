<script lang="ts">
  import { audioUrl, isAudioHidden, isRecording } from "./stores";
  let audioEl: HTMLAudioElement;

  function onKeyDown(e: KeyboardEvent) {
    if (e.code === "Space" && !$isRecording) {
      if (audioEl.paused) {
        audioEl.play();
      } else {
        audioEl.pause();
      }
    }
  }
</script>

<audio bind:this={audioEl} controls hidden={$isAudioHidden} src={$audioUrl} />
<svelte:window on:keydown={onKeyDown} />
