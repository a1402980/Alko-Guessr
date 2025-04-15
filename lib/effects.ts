export const playEffect = (effect: "correct" | "wrong" | "fanfare") => {
  const audioMap = {
    correct: "correct.mp3",
    wrong: "wrong.mp3",
    fanfare: "fanfare.mp3",
  };
  const audio = new Audio(`/effects/${audioMap[effect]}`);
  audio.volume = 0.5; // Set volume to 50%
  audio.play().catch((error) => {
    console.error("Audio playback failed:", error);
  });
};
