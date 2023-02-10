<script lang="ts">
  import { draggable, type DragEventData } from "@neodrag/svelte";
  import type { IMediaRecorder } from "extendable-media-recorder";
  import { onMount } from "svelte";
  import { setupMediaRecorder } from "./mediaRecorder";
  import Player from "./Player.svelte";
  import RecordButton from "./RecordButton.svelte";
  import type { RnboModule } from "./rnbo";
  import SampleLoadButton from "./SampleLoadButton.svelte";
  import { audioUrl } from "./stores";
  import type { ChangeBufferEventPayload } from "./types";
  import { formatNumber, normalizePos } from "./utils";

  export let rnboModule: RnboModule;
  export let context: AudioContext;

  $: device = rnboModule.device;
  $: changeBuffer = rnboModule.changeBuffer;
  $: changePos = rnboModule.changePos;
  $: changePitch = rnboModule.changePitch;
  $: startPlaying = rnboModule.startPlaying;
  $: stopPlaying = rnboModule.stopPlaying;

  let mediaRecorder: IMediaRecorder;

  let fileName: string = "Plaits_20200805_10.wav";
  let x: number = 50;
  let y: number = 50;

  onMount(async () => {
    const onStop = (blob: Blob) => {
      const url = URL.createObjectURL(blob);
      audioUrl.set(url);
    };
    mediaRecorder = await setupMediaRecorder({ context, device, onStop });
  });

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
  <RecordButton {mediaRecorder} />
  <Player />
</div>

<style>
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
