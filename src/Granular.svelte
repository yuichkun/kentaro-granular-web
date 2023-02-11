<script lang="ts">
  import Player from "./Player.svelte";
  import RecordButton from "./RecordButton.svelte";
  import type { RnboModule } from "./rnbo";
  import XYPad from "./XYPad.svelte";
  import type { ChangeBufferEventPayload } from "./types";
  import { onMount } from "svelte";
  import { createAnalyser } from "./createAnalyser";

  export let rnboModule: RnboModule;
  export let context: AudioContext;

  const WIDTH = window.innerWidth;
  const HEIGHT = window.innerHeight;
  let canvas: HTMLCanvasElement;
  $: device = rnboModule.device;
  $: changeBuffer = rnboModule.changeBuffer;

  onMount(() => {
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
          canvasCtx.strokeStyle = "rgb(20,20,20, 0.75)";
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

  let fileName: string = "Plaits_20200805_10.wav";

  const onChangeBuffer = ({
    detail: { arrayBuffer, fileName },
  }: CustomEvent<ChangeBufferEventPayload>) => {
    changeBuffer(arrayBuffer).then(() => {
      changeFileName(fileName);
    });
  };

  const changeFileName = async (_fileName: string) => {
    fileName = _fileName;
  };
</script>

<canvas width={WIDTH} height={HEIGHT} bind:this={canvas} />
<XYPad {rnboModule} {fileName} on:changeBuffer={onChangeBuffer} />
<div class="controls">
  <RecordButton {context} {device} />
  <Player />
</div>

<style>
  canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: WIDTH;
    height: HEIGHT;
  }
  .controls {
    margin-top: 18px;
    display: grid;
    place-content: center;
    gap: 12px;
  }
</style>
