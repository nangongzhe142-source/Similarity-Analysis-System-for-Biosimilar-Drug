/** Browser capture helpers for reviewer screen intake. No auto-timer, no getDisplayMedia here. */

export const INTAKE_CAPTURE_MIN_EDGE_PX = 2;
export const INTAKE_VIDEO_READY_STATE_HAVE_CURRENT_DATA = 2;

export interface IntakeVideoFrameSource {
  videoWidth: number;
  videoHeight: number;
  readyState: number;
}

export interface IntakeMediaTrackLike {
  stop: () => void;
  readyState?: string;
}

export interface IntakeMediaStreamLike {
  getTracks: () => IntakeMediaTrackLike[];
}

export function isVideoFrameReady(video: IntakeVideoFrameSource): boolean {
  return (
    video.readyState >= INTAKE_VIDEO_READY_STATE_HAVE_CURRENT_DATA &&
    video.videoWidth >= INTAKE_CAPTURE_MIN_EDGE_PX &&
    video.videoHeight >= INTAKE_CAPTURE_MIN_EDGE_PX
  );
}

export function stopMediaTracks(stream: IntakeMediaStreamLike | null): void {
  if (!stream) {
    return;
  }
  for (const track of stream.getTracks()) {
    track.stop();
  }
}

export function allTracksStopped(stream: IntakeMediaStreamLike | null): boolean {
  if (!stream) {
    return true;
  }
  const tracks = stream.getTracks();
  if (tracks.length === 0) {
    return true;
  }
  return tracks.every((track) => track.readyState === "ended");
}

export function screenFrameFileName(frameIndex: number): string {
  return `screen-frame-${frameIndex}.png`;
}

const VIDEO_READY_EVENTS = [
  "loadedmetadata",
  "loadeddata",
  "canplay",
  "playing",
  "resize",
] as const;

export async function waitForVideoFrame(
  video: HTMLVideoElement,
  timeoutMs = 15_000,
): Promise<void> {
  if (isVideoFrameReady(video)) {
    return;
  }
  await new Promise<void>((resolve, reject) => {
    let settled = false;
    let pollId = 0;
    const timer = window.setTimeout(() => {
      finish(() => reject(new Error("VIDEO_FRAME_TIMEOUT")));
    }, timeoutMs);
    const finish = (action: () => void) => {
      if (settled) {
        return;
      }
      settled = true;
      window.clearTimeout(timer);
      window.clearInterval(pollId);
      for (const eventName of VIDEO_READY_EVENTS) {
        video.removeEventListener(eventName, onReady);
      }
      action();
    };
    const onReady = () => {
      if (isVideoFrameReady(video)) {
        finish(() => resolve());
      }
    };
    for (const eventName of VIDEO_READY_EVENTS) {
      video.addEventListener(eventName, onReady);
    }
    if (typeof video.requestVideoFrameCallback === "function") {
      video.requestVideoFrameCallback(() => {
        onReady();
      });
    }
    pollId = window.setInterval(onReady, 50);
    onReady();
  });
}

export async function captureVideoElementToPngFile(
  video: HTMLVideoElement,
  frameIndex: number,
): Promise<File> {
  if (!isVideoFrameReady(video)) {
    throw new Error("VIDEO_NOT_READY");
  }
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    throw new Error("CANVAS_CONTEXT");
  }
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result && result.size > 0) {
        resolve(result);
      } else {
        reject(new Error("PNG_BLOB_FAILED"));
      }
    }, "image/png");
  });
  return new File([blob], screenFrameFileName(frameIndex), { type: "image/png" });
}

export function enqueueAsyncWork(
  previous: Promise<void>,
  work: () => Promise<void>,
): Promise<void> {
  return previous.then(work, work);
}
