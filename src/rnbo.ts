import { createDevice, type Device } from "@rnbo/js";

export type RnboModule = {
  device: Device;
  changeBuffer: (arrayBuf: ArrayBuffer) => Promise<void>;
  changePos: (newPos: number) => void;
  changePitch: (newPitch: number) => void;
  startPlaying: () => void;
  stopPlaying: () => void;
};

export async function setupDevice(context: AudioContext): Promise<RnboModule> {
  let rawPatcher = await fetch("patch.export.json");
  let patcher = await rawPatcher.json();
  const device = await createDevice({ context, patcher });
  device.node.connect(context.destination);

  const dependencies = await (await fetch("dependencies.json")).json();

  const results = await device.loadDataBufferDependencies(dependencies);
  const isSuccess = results.every((result) => result.type === "success");
  if (!isSuccess) throw new Error("RNBO patch failed to load sample data");
  const changeBuffer = async (arrayBuf: ArrayBuffer) => {
    // Decode the received Data as an AudioBuffer
    const audioBuf = await context.decodeAudioData(arrayBuf);
    // Set the DataBuffer on the device
    await device.setDataBuffer("buf_sample", audioBuf);
  };
  const changePos = (newPos: number) => {
    const pos = device.parametersById.get("pos");
    pos.value = newPos;
  };
  const changePitch = (newPitch: number) => {
    const pitch = device.parametersById.get("pitch");
    pitch.value = newPitch;
  };
  const startPlaying = () => {
    const play = device.parametersById.get("play");
    play.value = 1;
  };
  const stopPlaying = () => {
    const play = device.parametersById.get("play");
    play.value = 0;
  };
  return {
    device,
    changeBuffer,
    changePos,
    changePitch,
    startPlaying,
    stopPlaying,
  };
}
