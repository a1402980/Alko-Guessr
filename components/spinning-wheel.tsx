"use client";

import { useEffect, useState } from "react";

export type Segments = {
  segmentText: string;
  segColor?: string;
};

export type SpinWheelProps = {
  segments: Segments[];
  onFinished: (result: string) => void;
  primaryColor?: string;
  contrastColor?: string;
  buttonText?: string;
  isOnlyOnce?: boolean;
  size?: number;
  upDuration?: number;
  downDuration?: number;
  fontFamily?: string;
  arrowLocation?: "center" | "top";
  showTextOnSpin?: boolean;
  isSpinSound?: boolean;
};

const SpinningWheel: React.FC<SpinWheelProps> = ({
  segments,
  onFinished,
  primaryColor = "black",
  contrastColor = "white",
  buttonText = "Spin",
  isOnlyOnce = false,
  size = 290,
  upDuration = 100,
  downDuration = 600,
  fontFamily = "Arial",
  arrowLocation = "center",
  showTextOnSpin = true,
  isSpinSound = true,
}: SpinWheelProps) => {
  // Separate arrays without nullish values
  const segmentTextArray = segments
    .map((segment) => segment.segmentText)
    .filter(Boolean);
  const segColorArray = segments
    .map((segment) => segment.segColor)
    .filter(Boolean);

  const [isFinished, setFinished] = useState<boolean>(false);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [needleText, setNeedleText] = useState<string>("");

  const [ticTicSound, seTicTicSound] = useState<HTMLAudioElement | null>(null);

  let currentSegment = "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let timerHandle: any = 0;
  const timerDelay = segmentTextArray.length;
  let angleCurrent = 0;
  let angleDelta = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let canvasContext: any = null;
  let maxSpeed = Math.PI / segmentTextArray.length;
  const upTime = segmentTextArray.length * upDuration;
  const downTime = segmentTextArray.length * downDuration;
  let spinStart = 0;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let frames = 0;
  const centerX = size;
  const centerY = size;

  const wheelInit = () => {
    initCanvas();
    wheelDraw();
  };

  useEffect(() => {
    wheelInit();
    setTimeout(() => {
      window.scrollTo(0, 1);
    }, 0);
  }, []);

  useEffect(() => {
    if (isSpinSound) {
      seTicTicSound(new Audio("/effects/tick.wav"));
    }
  }, [isSpinSound]);

  useEffect(() => {
    if (isSpinSound && ticTicSound) {
      ticTicSound.loop = true;
    }
  }, [ticTicSound]);

  useEffect(() => {
    if (isSpinSound && ticTicSound) {
      if (isStarted) {
        const newSound = new Audio("/effects/tick.wav"); // Create a new audio instance
        newSound.loop = true;
        newSound.currentTime = 0; // Reset to the beginning
        newSound.play();
        seTicTicSound(newSound); // Update the state with the new audio instance
      }

      if (isFinished && ticTicSound) {
        ticTicSound.pause();
        ticTicSound.currentTime = 0; // Reset after pausing
      }
    }
  }, [isStarted, isFinished]);

  const initCanvas = () => {
    let canvas: HTMLCanvasElement | null = document.getElementById(
      "canvas"
    ) as HTMLCanvasElement;

    if (!canvas) {
      // Create a new canvas if it doesn't exist
      canvas = document.createElement("canvas");
      canvas.setAttribute("width", `${size * 2}`);
      canvas.setAttribute("height", `${size * 2}`);
      canvas.setAttribute("id", "canvas");
      document?.getElementById("wheel")?.appendChild(canvas);
    }
    canvasContext = canvas.getContext("2d");

    canvas.style.borderRadius = "50%"; // Set border radius for a circular shape

    canvas?.addEventListener("click", spin, false);
  };

  const spin = () => {
    setIsStarted(true);
    if (timerHandle === 0) {
      spinStart = new Date().getTime();
      maxSpeed = Math.PI / segmentTextArray.length;
      frames = 0;
      timerHandle = setInterval(onTimerTick, timerDelay * 5);
    }
  };

  const onTimerTick = () => {
    frames++;
    wheelDraw();
    const duration = new Date().getTime() - spinStart;
    let progress = 0;
    let finished = false;

    if (duration < upTime) {
      progress = duration / upTime;
      angleDelta = maxSpeed * Math.sin((progress * Math.PI) / 2);
    } else {
      progress = duration / downTime;
      angleDelta = maxSpeed * Math.sin((progress * Math.PI) / 2 + Math.PI / 2);
      if (progress >= 1) finished = true;
    }

    angleCurrent += angleDelta;
    while (angleCurrent >= Math.PI * 2) angleCurrent -= Math.PI * 2;
    if (finished) {
      setFinished(true);
      onFinished(currentSegment);
      clearInterval(timerHandle);
      setIsStarted(false);
      timerHandle = 0;
      angleDelta = 0;
    }
  };

  const wheelDraw = () => {
    clear();
    drawWheelBase(); // Draw the wheel and segments
    drawNeedle(); // Draw the needle
    drawCenterCircle(); // Draw the center circle last to ensure it's on top
  };

  const drawSegment = (key: number, lastAngle: number, angle: number) => {
    const ctx = canvasContext;
    const value = segmentTextArray[key];
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, size, lastAngle, angle, false);
    ctx.lineTo(centerX, centerY);
    ctx.closePath();
    ctx.fillStyle = segColorArray[key];
    ctx.fill();
    ctx.stroke();
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((lastAngle + angle) / 2);
    ctx.fillStyle = contrastColor;
    ctx.font = "bold 1em " + fontFamily;
    ctx.fillText(value.substring(0, 21), size / 2 + 20, 0);
    ctx.restore();
  };

  const drawWheelBase = () => {
    const ctx = canvasContext;
    let lastAngle = angleCurrent;
    const len = segmentTextArray.length;
    const PI2 = Math.PI * 2;
    ctx.lineWidth = 1;
    ctx.strokeStyle = primaryColor;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.font = "1em " + fontFamily;

    for (let i = 1; i <= len; i++) {
      const angle = PI2 * (i / len) + angleCurrent;
      drawSegment(i - 1, lastAngle, angle);
      lastAngle = angle;
    }

    // Draw outer circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, size, 0, PI2, false);
    ctx.closePath();
    ctx.lineWidth = 4;
    ctx.strokeStyle = primaryColor;
    ctx.stroke();
  };

  const drawCenterCircle = () => {
    const ctx = canvasContext;
    const PI2 = Math.PI * 2;

    // Draw the center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, PI2, false);
    ctx.closePath();
    ctx.fillStyle = primaryColor;
    ctx.lineWidth = 2;
    ctx.strokeStyle = contrastColor;
    ctx.fill();
    ctx.font = "bold 1em " + fontFamily;
    ctx.fillStyle = contrastColor;
    ctx.textAlign = "center";
    ctx.fillText(buttonText, centerX, centerY + 3);
    ctx.stroke();
  };

  const drawNeedle = () => {
    const ctx = canvasContext;
    ctx.lineWidth = 2; // Thicker stroke
    ctx.strokeStyle = "black"; // Black stroke color
    ctx.fillStyle = contrastColor;
    ctx.beginPath();

    if (arrowLocation === "top") {
      ctx.moveTo(centerX + 20, centerY / 15 + 10);
      ctx.lineTo(centerX - 20, centerY / 15 + 10);
      ctx.lineTo(centerX, centerY - centerY / 1.35 + 10);
    } else {
      ctx.moveTo(centerX + 20, centerY - 30 + 10);
      ctx.lineTo(centerX - 20, centerY - 30 + 10);
      ctx.lineTo(centerX, centerY - centerY / 2.5 + 10);
    }

    ctx.closePath();
    ctx.stroke(); // Apply the stroke
    ctx.fill();
    const change = angleCurrent + Math.PI / 2;
    let i =
      segmentTextArray.length -
      Math.floor((change / (Math.PI * 2)) * segmentTextArray.length) -
      1;
    if (i < 0) i = i + segmentTextArray.length;
    else if (i >= segmentTextArray.length) i = i - segmentTextArray.length;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = primaryColor;
    ctx.font = "bold 1.5em " + fontFamily;
    currentSegment = segmentTextArray[i];
    setNeedleText(segmentTextArray[i]);
  };

  const clear = () => {
    const ctx = canvasContext;
    ctx.clearRect(0, 0, size, size);
  };

  return (
    <div className="flex flex-col items-center">
      <canvas
        id="canvas"
        width={size * 2}
        height={size * 2}
        style={{
          pointerEvents: isFinished && isOnlyOnce ? "none" : "auto",
        }}
      />
      {((showTextOnSpin && isStarted) || isFinished) && (
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            fontWeight: "bold",
            fontSize: "1em",
            fontFamily: fontFamily,
          }}
        >
          {needleText}
        </div>
      )}
    </div>
  );
};

export default SpinningWheel;
