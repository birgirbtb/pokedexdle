"use client";

import { useEffect, useState } from "react";
import { getStoredGames } from "@/lib/cookieStats";
import type { GameRecord } from "@/lib/cookieStats";

const MAX_ATTEMPTS = 6;

type GuessTileStatus = "correct" | "wrong" | "empty";

type DailyPokemonRow = {
  id: string;
  available_on: string;
  pokemon_name: string;
};

type Props = {
  days: DailyPokemonRow[];
};

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getTileClasses(status: GuessTileStatus) {
  if (status === "correct") {
    return "bg-emerald-500/70 border-emerald-400/50";
  }
  if (status === "wrong") {
    return "bg-red-500/70 border-red-400/50";
  }
  return "bg-white/5 border-white/10";
}

function buildTilesForDay(gameRecord: GameRecord | undefined): GuessTileStatus[] {
  // If no game record, user didn't play this day
  if (!gameRecord) {
    return Array(MAX_ATTEMPTS).fill("empty");
  }

  const tiles: GuessTileStatus[] = [];
  
  // If user won, all guesses except the last are wrong, and the last is correct
  if (gameRecord.won) {
    // All previous attempts were wrong
    for (let i = 0; i < gameRecord.guesses - 1; i++) {
      tiles.push("wrong");
    }
    // The final attempt was correct
    tiles.push("correct");
  } else {
    // If user lost, all guesses were wrong
    for (let i = 0; i < gameRecord.guesses; i++) {
      tiles.push("wrong");
    }
  }

  // Pad with empty tiles to reach MAX_ATTEMPTS
  while (tiles.length < MAX_ATTEMPTS) {
    tiles.push("empty");
  }

  return tiles;
}

export function UnsignedUserHistory({ days }: Props) {
  const [gamesByDate, setGamesByDate] = useState<Map<string, GameRecord>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const stored = getStoredGames();
    
    // Create a map of date -> game record for quick lookup
    const gamesMap = new Map<string, GameRecord>();
    stored.forEach(game => {
      gamesMap.set(game.date, game);
    });
    
    setGamesByDate(gamesMap);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div className="text-[#9aa6c3]">Loading...</div>;
  }

  return (
    <>
      <div className="mt-4 w-full rounded-2xl border border-white/10 bg-black/20 shadow-[0_10px_26px_rgba(0,0,0,0.35)] p-5">
        {/* Empty history state */}
        {days.length === 0 ? (
          <div className="text-[#9aa6c3]">No history yet.</div>
        ) : (
          // Rows container
          <div className="flex flex-col gap-4">
            {/* Render one row per day */}
            {days.map((day) => {
              // Look up the user's game for this day (if it exists)
              const gameRecord = gamesByDate.get(day.available_on);
              const tiles = buildTilesForDay(gameRecord);

              return (
                <div key={day.id} className="flex items-center gap-6">
                  {/* Left: Day label */}
                  <div className="w-36 text-[#9aa6c3]">
                    {formatDate(day.available_on)}
                  </div>

                  {/* Right: Attempt tiles */}
                  <div className="flex flex-wrap gap-2">
                    {tiles.map((status, index) => (
                      <div
                        key={`${day.id}-${index}`}
                        className={`w-7 h-7 rounded-md border ${getTileClasses(
                          status,
                        )}`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Legend explaining tile colors */}
        <div className="mt-6 flex flex-wrap gap-6 text-[#9aa6c3]">
          {/* Correct */}
          <div className="flex items-center gap-3">
            <span className="w-4 h-4 rounded-md bg-emerald-500/70 border border-emerald-400/50" />
            <span>Correct</span>
          </div>

          {/* Wrong */}
          <div className="flex items-center gap-3">
            <span className="w-4 h-4 rounded-md bg-red-500/70 border border-red-400/50" />
            <span>Wrong</span>
          </div>

          {/* Didn't play */}
          <div className="flex items-center gap-3">
            <span className="w-4 h-4 rounded-md bg-white/5 border border-white/10" />
            <span>Didn{"'"}t play</span>
          </div>
        </div>
      </div>
    </>
  );
}
