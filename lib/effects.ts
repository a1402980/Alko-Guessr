export const playEffect = (effect: "correct" | "wrong") => {
  const audio = new Audio(`/effects/${effect}.wav`);
  audio.volume = 0.5; // Set volume to 50%
  audio.play().catch((error) => {
    console.error("Audio playback failed:", error);
  });
};
