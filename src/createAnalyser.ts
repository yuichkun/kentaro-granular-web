import type { Device } from "@rnbo/js";

export function createAnalyser(context: AudioContext, device: Device) {
  const analyser = context.createAnalyser();
  analyser.fftSize = 2048;
  device.node.connect(analyser);
  return analyser;
}
