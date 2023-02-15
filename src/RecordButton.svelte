<script lang="ts">
  import type { Device } from "@rnbo/js";
  import type { IMediaRecorder } from "extendable-media-recorder";
  import { onMount } from "svelte";
  import { createAnalyser } from "./createAnalyser";
  import { setupMediaRecorder } from "./mediaRecorder";
  import { isRecording, isAudioHidden, audioUrl } from "./stores";

  export let device: Device;
  export let context: AudioContext;
  let canvas: HTMLCanvasElement;

  let mediaRecorder: IMediaRecorder;
  const WIDTH = 164;
  const HEIGHT = 42.19;
  onMount(async () => {
    const onStop = (blob: Blob) => {
      const url = URL.createObjectURL(blob);
      audioUrl.set(url);
    };
    mediaRecorder = await setupMediaRecorder({ context, device, onStop });
    const analyser = createAnalyser(context, device);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    const canvasCtx = canvas.getContext("2d");
    if (!canvasCtx) return;

    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

    function draw() {
      requestAnimationFrame(draw);
      if (!canvasCtx) return;
      canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
      analyser.getByteTimeDomainData(dataArray);
      canvasCtx.fillStyle = "rgb(255, 255, 255, 0)";
      canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
      canvasCtx.lineWidth = 0.7;
      canvasCtx.beginPath();
      const sliceWidth = WIDTH / bufferLength;
      let x = 0;
      console.log(dataArray);
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        if (v === 1) {
          canvasCtx.strokeStyle = "rgb(0, 0, 0, 0)";
        } else {
          canvasCtx.strokeStyle = "rgb(255,255,255)";
        }
        const y = v * (HEIGHT / 2);
        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }
      canvasCtx.lineTo(WIDTH, HEIGHT / 2);
      canvasCtx.stroke();
    }
    draw();
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

<div id="record-button-container">
  <canvas
    width={WIDTH}
    height={HEIGHT}
    bind:this={canvas}
    style={`visibility: ${$isRecording ? "initial" : "hidden"}`}
  />
  <button
    id="record-button"
    on:click={recordSound}
    class={$isRecording ? "red" : ""}>RECORD OUTPUT</button
  >
</div>
<svelte:window on:keydown={onKeyDown} />

<style>
  #record-button-container {
    position: relative;
  }
  canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: WIDTH;
    height: HEIGHT;
    border-radius: 32px;
  }
  #record-button {
    width: 164px;
    background: transparent;
    border: 1px solid rgb(246, 249, 228);
    border-radius: 32px;
  }
  .red {
    background: #cb0000 !important;
  }
</style>
