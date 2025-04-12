"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

export function AudioToggle() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio("/music/Drifting_In_Aether_130s.wav");
    audioRef.current.loop = true;

    // Clean up on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleAudio = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((error) => {
        console.error("Audio playback failed:", error);
      });
    }

    setIsPlaying(!isPlaying);
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleAudio}
      aria-label={isPlaying ? "Mute audio" : "Play audio"}
    >
      {isPlaying ? (
        <Volume2 className="h-5 w-5" />
      ) : (
        <VolumeX className="h-5 w-5" />
      )}
    </Button>
  );
}
