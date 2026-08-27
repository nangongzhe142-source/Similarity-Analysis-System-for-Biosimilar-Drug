const MASCOT_IMAGE_SRC = "/assistant/mascot.png";

type MascotMood = "idle" | "think" | "open";

const FACE_CLASS = {
  sm: "h-7 w-7 rounded-full object-cover object-[50%_8%]",
  md: "assistant-mascot-face",
  lg: "assistant-mascot-face-lg",
} as const;

export function AssistantMascotFace({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <img
      src={MASCOT_IMAGE_SRC}
      alt=""
      width={size === "lg" ? 72 : size === "sm" ? 28 : 40}
      height={size === "lg" ? 72 : size === "sm" ? 28 : 40}
      className={FACE_CLASS[size]}
    />
  );
}

export function AssistantMascot({
  mood,
  greeting,
}: {
  mood: MascotMood;
  greeting: string;
}) {
  return (
    <>
      <span className="assistant-mascot-spark assistant-mascot-spark-a" />
      <span className="assistant-mascot-spark assistant-mascot-spark-b" />
      {mood === "idle" ? <span className="assistant-mascot-bubble">{greeting}</span> : null}
      <img
        src={MASCOT_IMAGE_SRC}
        alt=""
        width={132}
        height={168}
        className="assistant-mascot-full"
      />
    </>
  );
}
