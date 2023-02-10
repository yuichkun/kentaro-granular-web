import { createDevice } from "@rnbo/js";

export async function setupDevice(context: AudioContext) {
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
  return {
    device,
    changeBuffer,
  };
}
