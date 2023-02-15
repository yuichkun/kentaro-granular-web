<script lang="ts">
  import { audioUrl, isAudioHidden, isRecording } from "./stores";
  let audioEl: HTMLAudioElement;
  let downloadButton: HTMLAnchorElement;

  const download = () => {
    downloadButton.click();
  };

  function onKeyDown(e: KeyboardEvent) {
    if (e.code === "Space" && !$isRecording) {
      if (audioEl.paused) {
        audioEl.play();
      } else {
        audioEl.pause();
      }
    }

    if (e.key === "s" && e.metaKey && !$isRecording) {
      e.preventDefault();
      download();
    }
  }
</script>

<audio bind:this={audioEl} controls hidden={$isAudioHidden} src={$audioUrl}>
  <a bind:this={downloadButton} href={$audioUrl} download>download</a>
</audio>
<svelte:window on:keydown={onKeyDown} />

<style>
  audio {
    padding-top: 6px;
  }
</style>
