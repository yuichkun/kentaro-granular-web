import { MediaRecorder } from "extendable-media-recorder";
import type { Device } from "@rnbo/js";
import { register } from "extendable-media-recorder";
import { connect } from "extendable-media-recorder-wav-encoder";

type SetupMediaRecorderOptions = {
  context: AudioContext;
  device: Device;
  onStop: (blob: Blob) => void;
};
export async function setupMediaRecorder({
  context,
  device,
  onStop,
}: SetupMediaRecorderOptions) {
  await register(await connect());

  const dest = context.createMediaStreamDestination();
  device.node.connect(dest);

  let chunks: BlobPart[] = [];
  const mediaRecorder = new MediaRecorder(dest.stream, {
    mimeType: "audio/wav",
  });
  mediaRecorder.ondataavailable = (evt: any) => {
    chunks.push(evt.data);
  };
  mediaRecorder.onstop = () => {
    const blob = new Blob(chunks, { type: "audio/wav" });
    onStop(blob);
    chunks = [];
  };
  return mediaRecorder;
}
