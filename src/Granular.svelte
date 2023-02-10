<script lang="ts">
  import type { IMediaRecorder } from "extendable-media-recorder";
  import { onMount } from "svelte";
  import { setupMediaRecorder } from "./mediaRecorder";
  import Player from "./Player.svelte";
  import RecordButton from "./RecordButton.svelte";
  import type { RnboModule } from "./rnbo";
  import SampleLoadButton from "./SampleLoadButton.svelte";
  import XYPad from "./XYPad.svelte";
  import { audioUrl } from "./stores";
  import type { ChangeBufferEventPayload } from "./types";

  export let rnboModule: RnboModule;
  export let context: AudioContext;

  $: device = rnboModule.device;
  $: changeBuffer = rnboModule.changeBuffer;

  let mediaRecorder: IMediaRecorder;

  let fileName: string = "Plaits_20200805_10.wav";
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
</script>

<XYPad {rnboModule} {fileName} />
<div class="controls">
  <SampleLoadButton on:changeBuffer={onChangeBuffer} />
  <RecordButton {mediaRecorder} />
  <Player />
</div>

<style>
  .controls {
    margin-top: 18px;
    display: grid;
    place-content: center;
    gap: 12px;
  }
</style>
