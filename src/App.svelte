<script lang="ts">
  import { draggable } from "@neodrag/svelte";
  import { createDevice, type Device } from "@rnbo/js";
  let x: number = 50;
  let y: number = 50;
  let fileName: string = "Plaits_20200805_10.wav";
  function normalizePos({ x, y }: { x: number; y: number }) {
    return {
      x: (x + 1) / 468,
      y: 1 - (y + 1) / 468,
    };
  }
  let WAContext = window.AudioContext || (window as any).webkitAudioContext;
  let context = new WAContext();
  let device: Device | null = null;
  let mediaRecorder: MediaRecorder;
  let audioEl: HTMLAudioElement;
  $: isStarted = device !== null;

  const onClick = async () => {
    await context.resume();
    let rawPatcher = await fetch("patch.export.json");
    let patcher = await rawPatcher.json();
    const _device = await createDevice({ context, patcher });
    _device.node.connect(context.destination);

    const dependencies = await (await fetch("dependencies.json")).json();

    const results = await _device.loadDataBufferDependencies(dependencies);
    const isSuccess = results.every((result) => result.type === "success");
    if (isSuccess) {
      device = _device;

      const dest = context.createMediaStreamDestination();
      device.node.connect(dest);

      let chunks: BlobPart[] = [];
      mediaRecorder = new MediaRecorder(dest.stream);
      mediaRecorder.ondataavailable = (evt) => {
        chunks.push(evt.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
        audioEl.src = URL.createObjectURL(blob);
        chunks = [];
      };
    }
  };
  let fileInput: HTMLInputElement;
  const changeBuffer = async (arrayBuf: ArrayBuffer, _fileName: string) => {
    if (!device) return;
    // Decode the received Data as an AudioBuffer
    const audioBuf = await context.decodeAudioData(arrayBuf);
    // Set the DataBuffer on the device
    await device.setDataBuffer("buf_sample", audioBuf);
    fileName = _fileName;
  };

  function formatNumber(n: number) {
    return (n * 100).toFixed(1);
  }

  let isAudioHidden = true;
  let isRecording = false;
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

  function onKeyDown(e: KeyboardEvent) {
    if (!isStarted) return;
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

<main>
  {#if isStarted}
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
          if (!device) return;
          const play = device.parametersById.get("play");
          play.value = 1;
        }}
        on:neodrag={(e) => {
          if (!device) return;
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
          if (!device) return;
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
          changeBuffer(e.target.result, fileName);
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
  {:else}
    <button on:click={onClick}>PLAY</button>
  {/if}
</main>
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
