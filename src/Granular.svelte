<script lang="ts">
  import { formatNumber, normalizePos } from "./utils";
  import { draggable, type DragEventData } from "@neodrag/svelte";
  import type { IMediaRecorder } from "extendable-media-recorder";
  import { onMount } from "svelte";
  import { setupMediaRecorder } from "./mediaRecorder";
  import type { RnboModule } from "./rnbo";
  import SampleLoadButton from "./SampleLoadButton.svelte";
  import type { ChangeBufferEventPayload } from "./types";

  export let rnboModule: RnboModule;
  export let context: AudioContext;

  $: device = rnboModule.device;
  $: changeBuffer = rnboModule.changeBuffer;
  $: changePos = rnboModule.changePos;
  $: changePitch = rnboModule.changePitch;
  $: startPlaying = rnboModule.startPlaying;
  $: stopPlaying = rnboModule.stopPlaying;

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

  function onKeyDown(e: KeyboardEvent) {
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
    on:neodrag:start={startPlaying}
    on:neodrag={onDrag}
    on:neodrag:end={stopPlaying}
  />
</div>
<div class="controls">
  <SampleLoadButton on:changeBuffer={onChangeBuffer} />
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
