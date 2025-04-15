"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AudioToggle } from "@/components/audio-toggle";
import { ExternalLink, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { Product } from "@/types/product";
import { getProductsByCategory, submitScore } from "@/actions/db";
import Image from "next/image";
import { playEffect } from "@/lib/effects";

type GameState = {
  currentRound: number;
  totalRounds: number;
  score: number;
  timeLeft: number;
  blurLevel: number;
  options: Product[];
  correctAnswer: Product | null;
  selectedAnswer: string | null;
  roundComplete: boolean;
  gameComplete: boolean;
};

const TOTAL_ROUNDS = 10;
const ROUND_TIME = 20; // seconds
const BLUR_LEVELS = 10;
const POINT_FACTOR = 10; // Points per second left
const MAX_POINTS = ROUND_TIME * POINT_FACTOR * TOTAL_ROUNDS; // Maximum points per round

export function GameContainer({ category }: { category?: string }) {
  const [loading, setLoading] = useState(true);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    currentRound: 0,
    totalRounds: TOTAL_ROUNDS,
    score: 0,
    timeLeft: ROUND_TIME,
    blurLevel: BLUR_LEVELS,
    options: [],
    correctAnswer: null,
    selectedAnswer: null,
    roundComplete: false,
    gameComplete: false,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const blurTimerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Load initial game data
  useEffect(() => {
    async function fetchGameData() {
      try {
        const products = await getProductsByCategory(category, 4);
        const correctIndex = Math.floor(Math.random() * 4);

        setGameState((prev) => ({
          ...prev,
          options: products,
          correctAnswer: products[correctIndex],
          roundComplete: false,
          selectedAnswer: null,
          blurLevel: BLUR_LEVELS,
        }));

        setLoading(false);
        startRound();
      } catch (error) {
        console.error("Error fetching game data:", error);
      }
    }

    fetchGameData();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (blurTimerRef.current) clearInterval(blurTimerRef.current);
    };
  }, [category, gameState.currentRound]);

  function startRound() {
    // Start the timer
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setGameState((prev) => {
        if (prev.timeLeft <= 0 || prev.roundComplete) {
          if (timerRef.current) clearInterval(timerRef.current);
          return {
            ...prev,
            roundComplete: true,
            timeLeft: 0,
          };
        }
        return {
          ...prev,
          timeLeft: prev.timeLeft - 1,
        };
      });
    }, 1000);

    // Start the blur reduction
    if (blurTimerRef.current) clearInterval(blurTimerRef.current);

    blurTimerRef.current = setInterval(() => {
      setGameState((prev) => {
        if (prev.blurLevel <= 0 || prev.roundComplete) {
          if (blurTimerRef.current) clearInterval(blurTimerRef.current);
          return prev;
        }
        return {
          ...prev,
          blurLevel: prev.blurLevel - 1,
        };
      });
    }, ROUND_TIME * 100); // Gradually reduce blur over the round time
  }

  function handleOptionSelect(optionId: string) {
    if (gameState.roundComplete) return;

    const isCorrect = optionId === gameState.correctAnswer?.product_id;

    if (isCorrect) playEffect("correct");
    else playEffect("wrong");

    setGameState((prev) => ({
      ...prev,
      selectedAnswer: optionId,
      roundComplete: true,
      blurLevel: 0,
      score: isCorrect ? prev.score + prev.timeLeft * 10 : prev.score,
    }));

    if (timerRef.current) clearInterval(timerRef.current);
    if (blurTimerRef.current) clearInterval(blurTimerRef.current);
  }

  function handleNextRound() {
    const nextRound = gameState.currentRound + 1;

    if (nextRound >= TOTAL_ROUNDS) {
      setGameState((prev) => ({
        ...prev,
        gameComplete: true,
      }));
      return;
    }

    setGameState((prev) => ({
      ...prev,
      currentRound: nextRound,
      timeLeft: ROUND_TIME,
      blurLevel: BLUR_LEVELS,
      options: [],
      correctAnswer: null,
      selectedAnswer: null,
      roundComplete: false,
    }));

    setLoading(true);
  }

  function handlePlayAgain() {
    setGameState({
      currentRound: 0,
      totalRounds: TOTAL_ROUNDS,
      score: 0,
      timeLeft: ROUND_TIME,
      blurLevel: BLUR_LEVELS,
      options: [],
      correctAnswer: null,
      selectedAnswer: null,
      roundComplete: false,
      gameComplete: false,
    });

    setLoading(true);
    setScoreSubmitted(false);
  }

  function handleSubmitScore(event: React.FormEvent) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const name = formData.get("name")?.toString() || "";
    const score = gameState.score;

    submitScore(name, score, category);
    setScoreSubmitted(true);
  }

  if (gameState.gameComplete) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <h2 className="text-2xl font-bold">Game Complete!</h2>
              <p className="text-4xl font-bold">
                Your Score: {gameState.score}/{MAX_POINTS}
              </p>
              {!scoreSubmitted && (
                <form onSubmit={handleSubmitScore}>
                  <label htmlFor="name" className="block text-sm font-medium">
                    Enter your name:
                  </label>
                  <div className="my-2 flex flex-row items-center justify-center gap-2">
                    <input
                      placeholder="name"
                      required
                      type="text"
                      name="name"
                      className="mt-1 px-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 h-10"
                    />
                    <Button type="submit" variant={"outline"}>
                      Submit Score <Save />
                    </Button>
                  </div>
                </form>
              )}
              {scoreSubmitted && (
                <p className="text-sm text-green-500">
                  Score submitted successfully!
                </p>
              )}
              <div className="flex flex-col space-y-2">
                <Button onClick={handlePlayAgain}>Play Again</Button>
                <Button variant="outline" onClick={() => router.push("/")}>
                  Back to Home
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full justify-center items-center">
      <div className="flex-1 container py-8 px-4 md:px-6 space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">
              Round {gameState.currentRound + 1}/{gameState.totalRounds}
            </h2>
            <p>Score: {gameState.score}</p>
          </div>
          <AudioToggle />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span>Time Left: {gameState.timeLeft}s</span>
            <span>Blur Level: {gameState.blurLevel}</span>
          </div>
          <Progress value={(gameState.timeLeft / ROUND_TIME) * 100} />
        </div>

        {loading && (
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading...</span>
          </div>
        )}

        {!loading && (
          <div className="space-y-8">
            <div className="flex justify-center">
              <div className="relative w-full max-w-md aspect-square rounded-lg overflow-hidden bg-white">
                <Image
                  src={
                    gameState.correctAnswer?.image_url ||
                    "/placeholder.svg?height=400&width=400"
                  }
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  alt="Guess the product"
                  className={`p-2 w-full h-full object-contain blur-image blur-${gameState.blurLevel}`}
                  loading="eager"
                  priority
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gameState.options.map((option) => (
                <Button
                  key={option.id}
                  variant={
                    gameState.roundComplete
                      ? option.product_id ===
                        gameState.correctAnswer?.product_id
                        ? "correct"
                        : option.product_id === gameState.selectedAnswer
                        ? "destructive"
                        : "outline"
                      : "outline"
                  }
                  className="h-auto py-4 px-6 text-left justify-start"
                  onClick={() => handleOptionSelect(option.product_id)}
                  disabled={gameState.roundComplete}
                >
                  <div className="flex flex-col">
                    <span className="font-bold">{option.name}</span>
                    <span className="text-sm">{option.price.toFixed(2)} €</span>
                  </div>
                </Button>
              ))}
            </div>

            {gameState.roundComplete && (
              <div className="flex justify-center gap-8">
                <a
                  href={`https://www.alko.fi/tuotteet/${gameState.correctAnswer?.product_id}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant={"outline"}>
                    View product <ExternalLink />
                  </Button>
                </a>

                <Button onClick={handleNextRound}>
                  {gameState.currentRound + 1 >= TOTAL_ROUNDS
                    ? "See Results"
                    : "Next Round"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
