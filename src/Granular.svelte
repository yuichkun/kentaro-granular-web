<script lang="ts">
  import { formatNumber, normalizePos } from "./utils";
  import { draggable } from "@neodrag/svelte";
  import type { IMediaRecorder } from "extendable-media-recorder";
  import { onMount } from "svelte";
  import { setupMediaRecorder } from "./mediaRecorder";
  import type { RnboModule } from "./rnbo";

  export let rnboModule: RnboModule;
  export let context: AudioContext;

  $: device = rnboModule.device;
  $: changeBuffer = rnboModule.changeBuffer;

  let fileInput: HTMLInputElement;
  let audioEl: HTMLAudioElement;
  let mediaRecorder: IMediaRecorder;

  let fileName: string = "Plaits_20200805_10.wav";
  let x: number = 50;
  let y: number = 50;
  let isAudioHidden = true;
  let isRecording = false;

  onMount(async () => {
    const onStop = (blob: Blob) => {
      audioEl.src = URL.createObjectURL(blob);
    };
    mediaRecorder = await setupMediaRecorder({ context, device, onStop });
  });

  const recordSound = () => {
    if (!isRecording) {
      mediaRecorder.start();
      isAudioHidden = true;
      isRecording = true;
    } else {
      mediaRecorder.stop();
      isAudioHidden = false;
      isRecording = false;
    }
  };

  const changeFileName = async (_fileName: string) => {
    fileName = _fileName;
  };

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "l") {
      fileInput.click();
    }
    if (e.key === "r") {
      recordSound();
    }
    if (e.code === "Space" && !isRecording) {
      if (audioEl.paused) {
        audioEl.play();
      } else {
        audioEl.pause();
      }
    }
  }
</script>

<pre>
    File: {fileName}
    Position(x): {formatNumber(x)}%
    Pitch(y): {formatNumber(y)}%
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
    on:neodrag:start={(e) => {
      const play = device.parametersById.get("play");
      play.value = 1;
    }}
    on:neodrag={(e) => {
      const normalizedPos = normalizePos({
        x: e.detail.offsetX,
        y: e.detail.offsetY,
      });
      x = normalizedPos.x;
      y = normalizedPos.y;

      const pos = device.parametersById.get("pos");
      const pitch = device.parametersById.get("pitch");
      pos.value = x;
      pitch.value = y;
    }}
    on:neodrag:end={(e) => {
      const play = device.parametersById.get("play");
      play.value = 0.0;
    }}
  />
</div>
<input
  type="file"
  accept="audio/*"
  style="display:none"
  bind:this={fileInput}
  on:change={() => {
    if (!(fileInput.files && fileInput.files.length === 1))
      throw new Error("please select one audio file");
    const reader = new FileReader();
    const fileName = fileInput.files[0].name;
    reader.onload = (e) => {
      if (!e.target) throw new Error("something unexpected happened");
      if (!(e.target.result instanceof ArrayBuffer))
        throw new Error("failed to decode the file");
      if (!fileInput.files) return;
      changeBuffer(e.target.result).then(() => {
        changeFileName(fileName);
      });
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
  }}
/>
<div class="controls">
  <button id="load-button" on:click={() => fileInput.click()}
    >LOAD YOUR SAMPLE (L)</button
  >
  <button
    id="record-button"
    on:click={recordSound}
    class={isRecording ? "red" : ""}
    >{isRecording ? "STOP RECORDING (R)" : "RECORD AUDIO (R)"}</button
  >
  <audio bind:this={audioEl} controls hidden={isAudioHidden} />
</div>
<svelte:window on:keydown={onKeyDown} />

<style>
  .red {
    background: #cb0000;
  }
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

  .controls {
    margin-top: 18px;
    display: grid;
    place-content: center;
    gap: 12px;
  }
</style>
